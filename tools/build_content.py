"""Content pipeline: markdown -> JSON for the web app.

    python tools/build_content.py

Emits:
    web/content/lessons.json    every .md file, with sections and links rewritten
    web/content/problems.json   every problem row from 12-problem-index.md
    web/content/drills.json     every exercise from practice/drills/*.py
    web/content/glossary.json   every term table row from 19-*.md

The markdown files are the SINGLE SOURCE OF TRUTH. This script is the only
thing that reads them. Never hand-edit the generated JSON.
"""

from __future__ import annotations

import ast
import builtins
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "web" / "content"


# ---------------------------------------------------------------- helpers --
def slugify(name: str) -> str:
    return re.sub(r"\.md$", "", name)


def table_rows(block: str) -> list[list[str]]:
    """Parse a markdown table into rows of cells, skipping header + separator."""
    rows = []
    for line in block.split("\n"):
        line = line.strip()
        if not line.startswith("|"):
            continue
        if re.match(r"^\|[\s:|-]+\|$", line):  # separator row
            continue
        cells = [c.strip() for c in line.strip("|").split("|")]
        rows.append(cells)
    return rows


def strip_md(s: str) -> str:
    """Remove markdown emphasis/links, keep the text."""
    s = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", s)  # links
    s = re.sub(r"[*`]", "", s)
    return s.strip()


# ---------------------------------------------------------------- lessons --
def build_lessons() -> list[dict]:
    lessons = []
    for path in sorted(ROOT.glob("*.md")):
        if not re.match(r"\d\d-", path.name):
            continue
        text = path.read_text(encoding="utf-8")
        title_match = re.search(r"^# (.+)$", text, re.M)
        title = title_match.group(1).strip() if title_match else path.stem

        sections = []
        for m in re.finditer(r"^## (.+)$", text, re.M):
            sections.append(
                {
                    "heading": m.group(1).strip(),
                    "anchor": re.sub(r"[^a-z0-9]+", "-", m.group(1).lower()).strip("-"),
                }
            )

        # estimate reading time: 200 wpm on prose, code counted at half rate
        code_chars = sum(len(b) for b in re.findall(r"```.*?```", text, re.S))
        words = len(text.split())
        minutes = max(3, round(words / 200 + code_chars / 2000))

        # rewrite inter-doc links for the web app
        body = re.sub(r"\]\((\d\d-[a-z0-9-]+)\.md", r"](/learn/\1", text)
        body = re.sub(r"\]\((tracker|README)\.md", r"](/\1", body)

        # Which fences can actually execute, and how many that leaves.
        fence_flags = runnable_fences(text)
        runnable = sum(fence_flags)

        lessons.append(
            {
                "slug": slugify(path.name),
                "fileNumber": int(path.name[:2]),
                "title": title,
                "sections": sections,
                "estimatedMinutes": minutes,
                "runnableBlocks": runnable,
                "fenceRunnable": fence_flags,
                "body": body,
            }
        )
    return lessons


# --------------------------------------------------------------- runnable --
PY_FENCE = re.compile(r"```python\n(.*?)```", re.S)


def _bound_names(tree: ast.AST) -> set[str]:
    """Names a snippet leaves behind in the namespace it ran in.

    Only module-level bindings count. A variable assigned inside a function body
    is local to that call and is gone the moment it returns, so treating it as
    available would mark a later block runnable on the strength of a name that
    does not exist once the block finishes.
    """
    names: set[str] = set()

    def collect(node: ast.AST, *, top_level: bool) -> None:
        for child in ast.iter_child_nodes(node):
            if isinstance(child, ast.FunctionDef | ast.AsyncFunctionDef | ast.ClassDef):
                if top_level:
                    names.add(child.name)
                continue  # its body binds locals, not globals
            if top_level:
                if isinstance(child, ast.Name) and isinstance(child.ctx, ast.Store):
                    names.add(child.id)
                elif isinstance(child, ast.alias):
                    names.add((child.asname or child.name).split(".")[0])
                elif isinstance(child, ast.ExceptHandler) and child.name:
                    names.add(child.name)
                elif isinstance(child, ast.Global):
                    names.update(child.names)
            collect(child, top_level=top_level)

    collect(tree, top_level=True)
    return names


def _local_names(tree: ast.AST) -> set[str]:
    """Every name bound anywhere, including inside functions.

    Used to decide whether a block's *own* free names resolve. A function body
    may legitimately use its own parameters and locals.
    """
    names: set[str] = set()
    for node in ast.walk(tree):
        if isinstance(node, ast.Name) and isinstance(node.ctx, ast.Store):
            names.add(node.id)
        elif isinstance(node, ast.FunctionDef | ast.AsyncFunctionDef | ast.ClassDef):
            names.add(node.name)
        elif isinstance(node, ast.alias):
            names.add((node.asname or node.name).split(".")[0])
        elif isinstance(node, ast.ExceptHandler) and node.name:
            names.add(node.name)
        elif isinstance(node, ast.arg):
            names.add(node.arg)
        elif isinstance(node, ast.Global | ast.Nonlocal):
            names.update(node.names)
    return names


def _free_names(tree: ast.AST) -> set[str]:
    return {
        node.id
        for node in ast.walk(tree)
        if isinstance(node, ast.Name) and isinstance(node.ctx, ast.Load)
    }


def _resolves(tree: ast.Module, available: set[str]) -> bool:
    """Whether every name a snippet reads is defined by the time it is read.

    Order matters at module level: a statement that reads `rows` before a later
    statement assigns it raises NameError, even though the name appears bound
    somewhere in the block. Function bodies are exempt, because they run when
    called rather than where they are written.
    """
    known = set(available)
    deferred: list[ast.AST] = []

    for statement in tree.body:
        if isinstance(statement, ast.FunctionDef | ast.AsyncFunctionDef | ast.ClassDef):
            known.add(statement.name)
            deferred.append(statement)
            continue

        for node in ast.walk(statement):
            if isinstance(node, ast.FunctionDef | ast.AsyncFunctionDef | ast.ClassDef):
                deferred.append(node)

        if _free_names(statement) - _local_names(statement) - known:
            return False
        known |= _local_names(statement)

    # A function body may use anything the block defines, wherever it appears.
    return all(not (_free_names(node) - _local_names(node) - known) for node in deferred)


def runnable_fences(text: str) -> list[bool]:
    """Decide, per Python fence, whether pressing Run could actually work.

    The lessons mix two kinds of code. Most blocks are complete programs. Some
    are one-line illustrations of an API — `sorted(nums)`, `arr.pop(0)` — whose
    names were never defined anywhere. Offering a Run button on the second kind
    guarantees a NameError, which teaches nothing and looks broken.

    Blocks on a page share a namespace, so a name defined in an earlier block
    counts as available here, mirroring how the web app executes them.
    """
    available = set(dir(builtins)) | {"dsa", "helpers", "__name__"}
    flags: list[bool] = []

    for match in PY_FENCE.finditer(text):
        code = match.group(1)
        try:
            tree = ast.parse(code)
        except SyntaxError:
            # Deliberate syntax-error examples are shown, not run.
            flags.append(False)
            continue

        ok = _resolves(tree, available)
        flags.append(ok)
        bound = _bound_names(tree)

        # Only a block that runs leaves anything behind. Crediting the names of
        # a block that cannot execute would mark the next block runnable on the
        # strength of a definition that never actually happens.
        if ok:
            available |= bound

    return flags


# --------------------------------------------------------------- problems --
DIFF = {"E": "easy", "M": "medium", "H": "hard"}


DUPES: list[str] = []


def build_problems() -> list[dict]:
    text = (ROOT / "12-problem-index.md").read_text(encoding="utf-8")
    problems = []
    seen = set()
    current_topic = "general"
    tier: int | str  # 150 / 250 for the ranked lists, "extra" for the design tables

    for line in text.split("\n"):
        h = re.match(r"^### (.+)$", line)
        if h:
            current_topic = re.sub(r"\s*\(\d+\)\s*$", "", h.group(1)).strip()
            continue
        if not line.strip().startswith("|"):
            continue
        if re.match(r"^\|[\s:|-]+\|$", line.strip()):
            continue
        cells = [c.strip() for c in line.strip().strip("|").split("|")]

        # Two shapes: [#, Problem, Diff, Pattern, Insight] and [Problem, Diff, Pattern, Insight]
        if len(cells) == 5 and cells[0].isdigit():
            num, raw_title, diff, pattern, insight = cells
            tier = 150
        elif len(cells) == 4 and cells[1] in DIFF:
            raw_title, diff, pattern, insight = cells
            num, tier = None, 250
        elif len(cells) == 3 and cells[1] in DIFF:
            # design / concurrency tables: | Problem | Diff | Why-or-Concept |
            raw_title, diff, insight = cells
            pattern, num, tier = current_topic, None, "extra"
        else:
            continue
        if diff not in DIFF:
            continue

        blind = "⭐" in raw_title
        hot = "🔥" in raw_title
        title = strip_md(re.sub(r"[⭐🔥]", "", raw_title)).strip()
        if not title or title.lower() in ("problem", "#"):
            continue
        slug = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")
        if slug in seen:
            DUPES.append(title)
            continue
        seen.add(slug)

        problems.append(
            {
                "slug": slug,
                "title": title,
                "difficulty": DIFF[diff],
                "topic": current_topic,
                "patterns": [p.strip() for p in strip_md(pattern).split(",")],
                "insight": strip_md(insight),
                "leetcodeUrl": f"https://leetcode.com/problems/{slug}/",
                "inBlind75": blind,
                "frequentlyAsked": hot,
                "neetcodeTier": tier,
                "orderInList": int(num) if num else None,
            }
        )
    return problems


# ----------------------------------------------------------------- drills --
# Exercises whose body is published exactly as written. File 00 opens with one
# worked example so a complete beginner can see the shape of an answer before
# being asked for one; everything else must ship as an unsolved stub.
WORKED_EXAMPLES = frozenset({"day0_python.ex01_add"})


def canonical_starter(node: ast.FunctionDef | ast.ClassDef, lines: list[str]) -> str:
    """Rebuild an exercise as its signature, its docstring, and `raise TODO`.

    The drill files are a working directory: solving an exercise replaces its
    body in place. Copying that body into the published starter would leak the
    answer to every reader as soon as the solved file was committed, so the
    starter is regenerated from the parts that are actually the question.
    """
    first = node.body[0]
    has_doc = isinstance(first, ast.Expr) and isinstance(first.value, ast.Constant)

    # Slice the signature and the docstring straight out of the source rather
    # than re-rendering them, so their original wrapping and indentation survive.
    head_end = (first.end_lineno or first.lineno) if has_doc else first.lineno - 1
    head = "\n".join(lines[node.lineno - 1 : head_end]).rstrip()

    # A class exercise asks for methods, so it needs a body that still parses.
    stub = "    pass" if isinstance(node, ast.ClassDef) else "    raise TODO"
    return f"{head}\n{stub}"


def _case_checks(tree: ast.Module, source: str) -> dict[str, dict]:
    """Pull the hidden assertions out of the module-level `CASES` list.

    Entries are `(day, label, callable, expected)` in the Day 0 drill and
    `(label, callable, expected)` in the Day 1 one, so both arities are read.
    The callable is usually a lambda wrapping one exercise call and occasionally
    a named helper that needs a few lines of setup. Both forms are turned into
    runnable source: an expression that produces the answer, and an expression
    for what it should be. The web runner evaluates them exactly as the CLI
    does, so a learner cannot pass in the browser and fail in the terminal.
    """
    checks: dict[str, dict] = {}

    # A case may point at a `_check` helper rather than call an exercise
    # directly, so the exercise names each helper reaches are needed to tie the
    # case back to what it is testing.
    helper_names: dict[str, set[str]] = {
        node.name: {inner.id for inner in ast.walk(node) if isinstance(inner, ast.Name)}
        for node in tree.body
        if isinstance(node, ast.FunctionDef) and node.name.startswith("_")
    }

    for node in ast.walk(tree):
        if not isinstance(node, ast.Assign):
            continue
        if not any(
            isinstance(target, ast.Name) and target.id == "CASES" for target in node.targets
        ):
            continue
        if not isinstance(node.value, ast.List):
            continue

        for element in node.value.elts:
            if not isinstance(element, ast.Tuple):
                continue
            if len(element.elts) == 4:
                day_node, label_node, call_node, expected_node = element.elts
            elif len(element.elts) == 3:
                # The Day 1 drill has no day column; every case is that one day.
                day_node = None
                label_node, call_node, expected_node = element.elts
            else:
                continue
            if not isinstance(label_node, ast.Constant):
                continue

            # A lambda's body is the call; a bare name is a helper to invoke.
            if isinstance(call_node, ast.Lambda):
                call_source = ast.get_source_segment(source, call_node.body)
            elif isinstance(call_node, ast.Name):
                call_source = f"{call_node.id}()"
            else:
                continue
            if not call_source:
                continue

            expected_source = ast.get_source_segment(source, expected_node)
            if expected_source is None:
                continue

            # Tie the case to an exercise by the names it reaches: the ones it
            # mentions directly, plus everything any helper it calls mentions.
            names = {inner.id for inner in ast.walk(call_node) if isinstance(inner, ast.Name)}
            for referenced in list(names):
                names |= helper_names.get(referenced, set())

            checks[str(label_node.value)] = {
                "call": call_source,
                "expected": expected_source,
                "day": day_node.value if isinstance(day_node, ast.Constant) else None,
                "names": sorted(names),
            }

    return checks


def _support_source(tree: ast.Module, source: str) -> str:
    """The private helpers and constants a check may need, as runnable source.

    Some cases delegate to a `_check` function that sets up state across several
    statements. Those definitions are shipped alongside the exercise so the
    browser can run the same assertion the CLI runs.
    """
    parts = []
    for node in tree.body:
        named = isinstance(node, (ast.FunctionDef, ast.ClassDef)) and node.name.startswith("_")
        constant = isinstance(node, ast.Assign) and any(
            isinstance(target, ast.Name) and target.id.isupper() and target.id != "CASES"
            for target in node.targets
        )
        if named or constant:
            segment = ast.get_source_segment(source, node)
            if segment:
                parts.append(segment)
    return "\n\n".join(parts)


def _check_for(name: str, checks: dict[str, dict]) -> dict | None:
    """Find the case that exercises this function or class.

    Labels in `CASES` read like "ex04 is_even" rather than the exact function
    name, so matching is done on the names a case actually calls. That keeps
    working when a label is reworded, which is the thing most likely to change.
    """
    for label, check in checks.items():
        if name in check["names"]:
            return {"label": label, "call": check["call"], "expected": check["expected"]}
    return None


def build_drills() -> list[dict]:
    drills = []
    drill_dir = ROOT / "practice" / "drills"
    for path in sorted(drill_dir.glob("day*.py")):
        source = path.read_text(encoding="utf-8")
        tree = ast.parse(source)
        lines = source.split("\n")

        checks = _case_checks(tree, source)
        support = _support_source(tree, source)

        # day boundaries from the section banners
        day_of_line = {}
        current_day = 1
        for i, line in enumerate(lines, 1):
            m = re.match(r"# DAY (\d) -", line)
            if m:
                current_day = int(m.group(1))
            day_of_line[i] = current_day

        exercises = []
        for node in tree.body:
            # Narrowed to the two node kinds an exercise can be, so that `.name`
            # and `.args` below are statically known to exist.
            if isinstance(node, ast.FunctionDef):
                if not re.match(r"ex\d\d_", node.name):
                    continue
            elif isinstance(node, ast.ClassDef):
                if node.name not in ("Dog", "Counter2"):
                    continue
            else:
                continue
            doc = ast.get_docstring(node) or ""
            start, end = node.lineno, (node.end_lineno or node.lineno)
            exercise_id = f"{path.stem}.{node.name}"
            if exercise_id in WORKED_EXAMPLES:
                starter = "\n".join(lines[start - 1 : end])
            else:
                starter = canonical_starter(node, lines)
            exercises.append(
                {
                    "id": exercise_id,
                    "drillId": path.stem,
                    "day": day_of_line.get(start, 1),
                    "name": node.name,
                    "title": node.name.replace("_", " "),
                    "prompt": doc,
                    "starterCode": starter,
                    "kind": "class" if isinstance(node, ast.ClassDef) else "function",
                    "params": (
                        [a.arg for a in node.args.args] if isinstance(node, ast.FunctionDef) else []
                    ),
                    "check": _check_for(node.name, checks),
                }
            )

        drills.append(
            {
                "id": path.stem,
                "title": (ast.get_docstring(tree) or "").split("\n")[0],
                "sourceFile": str(path.relative_to(ROOT)).replace("\\", "/"),
                "exerciseCount": len(exercises),
                "gradableCount": sum(1 for exercise in exercises if exercise["check"]),
                "support": support,
                "exercises": exercises,
            }
        )
    return drills


# --------------------------------------------------------------- glossary --
def build_glossary() -> list[dict]:
    text = (ROOT / "19-prerequisites-and-glossary.md").read_text(encoding="utf-8")
    entries = []
    current_section = ""
    seen = set()
    for line in text.split("\n"):
        h = re.match(r"^## (.+)$", line)
        if h:
            current_section = strip_md(h.group(1))
            continue
        if not line.strip().startswith("|"):
            continue
        if re.match(r"^\|[\s:|-]+\|$", line.strip()):
            continue
        cells = [c.strip() for c in line.strip().strip("|").split("|")]
        if len(cells) != 2:
            continue
        term, meaning = strip_md(cells[0]), strip_md(cells[1])
        key = term.lower()
        if not term or key in ("term", "you see", "notation") or key in seen:
            continue
        seen.add(key)
        entries.append({"term": term, "meaning": meaning, "section": current_section})
    return entries


# ------------------------------------------------------------------- main --
def main() -> int:
    OUT.mkdir(parents=True, exist_ok=True)

    lessons = build_lessons()
    problems = build_problems()
    drills = build_drills()
    glossary = build_glossary()

    payloads = {
        "lessons.json": lessons,
        "problems.json": problems,
        "drills.json": drills,
        "glossary.json": glossary,
    }
    for name, data in payloads.items():
        # newline="" suppresses the platform line-ending translation that
        # `write_text` would otherwise apply, so a build on Windows and a build
        # in CI produce byte-identical files rather than CRLF and LF versions of
        # the same content.
        with (OUT / name).open("w", encoding="utf-8", newline="") as fh:
            fh.write(json.dumps(data, indent=2, ensure_ascii=False))

    # ---- report + sanity checks ----
    print(f"lessons   {len(lessons):>4}")
    print(
        f"problems  {len(problems):>4}   "
        f"(neetcode150: {sum(1 for p in problems if p['neetcodeTier'] == 150)}, "
        f"blind75: {sum(1 for p in problems if p['inBlind75'])}, "
        f"hot: {sum(1 for p in problems if p['frequentlyAsked'])})"
    )
    print(f"drills    {len(drills):>4}   exercises: {sum(d['exerciseCount'] for d in drills)}")
    print(f"glossary  {len(glossary):>4}")

    problems.sort(key=lambda p: p["orderInList"] or 9999)
    ordered = [p["orderInList"] for p in problems if p["orderInList"]]
    ok = True
    if ordered != list(range(1, 151)):
        print(f"  FAIL: NeetCode 150 ordering is {len(ordered)} items, expected 1..150")
        ok = False
    print(f"  deduplicated: {len(DUPES)} rows appeared in more than one section")
    if len(problems) < 290:
        print(f"  FAIL: expected 290+ unique problems, got {len(problems)}")
        ok = False
    if len(lessons) < 20:
        print(f"  FAIL: expected 20+ lessons, got {len(lessons)}")
        ok = False
    by_diff: dict[str, int] = {}
    for p in problems:
        by_diff[p["difficulty"]] = by_diff.get(p["difficulty"], 0) + 1
    print(f"  difficulty split: {by_diff}")
    print("\n  " + ("ALL CHECKS PASSED" if ok else "CHECKS FAILED"))
    print(f"  written to {OUT.relative_to(ROOT)}/")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
