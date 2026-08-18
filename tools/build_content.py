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

        # runnable code fences: ```python but not ```python:static
        runnable = len(re.findall(r"```python\n", text))

        lessons.append(
            {
                "slug": slugify(path.name),
                "fileNumber": int(path.name[:2]),
                "title": title,
                "sections": sections,
                "estimatedMinutes": minutes,
                "runnableBlocks": runnable,
                "body": body,
            }
        )
    return lessons


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
def build_drills() -> list[dict]:
    drills = []
    drill_dir = ROOT / "practice" / "drills"
    for path in sorted(drill_dir.glob("day*.py")):
        source = path.read_text(encoding="utf-8")
        tree = ast.parse(source)
        lines = source.split("\n")

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
            starter = "\n".join(lines[start - 1 : end])
            exercises.append(
                {
                    "id": f"{path.stem}.{node.name}",
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
                }
            )

        drills.append(
            {
                "id": path.stem,
                "title": (ast.get_docstring(tree) or "").split("\n")[0],
                "sourceFile": str(path.relative_to(ROOT)).replace("\\", "/"),
                "exerciseCount": len(exercises),
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
