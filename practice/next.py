"""What do I do right now?

    python next.py

Looks at your actual progress and prints the single next action.
When you are lost, run this.
"""

from __future__ import annotations

import contextlib
import io
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).parent


def drill_progress(module_name: str, day: int | None = None) -> tuple[int, int]:
    """Return (passing, total) for a drill without printing its output."""
    argv = sys.argv[:]
    sys.argv = ["x"] + ([str(day)] if day else [])
    buf = io.StringIO()
    try:
        mod = __import__(f"drills.{module_name}", fromlist=["main"])
        import importlib

        importlib.reload(mod)
        with contextlib.redirect_stdout(buf):
            mod.main()
    except Exception:
        return (0, 0)
    finally:
        sys.argv = argv
    out = buf.getvalue()
    m = re.search(r"(\d+)/(\d+) passing", out)
    return (int(m.group(1)), int(m.group(2))) if m else (0, 0)


def first_unsolved(module_name: str) -> str | None:
    """Name of the first exercise still saying `raise TODO`."""
    src = (ROOT / "drills" / f"{module_name}.py").read_text(encoding="utf-8")
    for block in re.split(r"\ndef ", src)[1:]:
        name = block.split("(")[0].strip()
        if not re.match(r"ex\d\d_", name):
            continue
        # a real placeholder is a line that IS `raise TODO`, not a mention of it
        if any(line.strip() == "raise TODO" for line in block.split("\n")):
            return name
    if "pass        # replace this whole class body" in src:
        return "class Dog / class Counter2"
    return None


def box(title: str, lines: list[str]) -> None:
    width = 68
    print("=" * width)
    print(f"  {title}")
    print("=" * width)
    for line in lines:
        print(f"  {line}")
    print()


def main() -> None:
    d0_pass, d0_total = drill_progress("day0_python")
    d1_pass, d1_total = drill_progress("day1_toolkit")

    if d0_total and d0_pass < d0_total:
        day = 1
        for d in (1, 2, 3, 4):
            p, t = drill_progress("day0_python", d)
            if t and p < t:
                day = d
                break
        nxt = first_unsolved("day0_python")
        sections = {
            1: "0.1-0.5  running Python, variables, types, strings, booleans",
            2: "0.6-0.8  lists, tuples, sets, dicts",
            3: "0.9-0.12 control flow, loops, functions, comprehensions",
            4: "0.13-0.17 classes, errors, tracebacks",
        }
        box(
            "YOU ARE ON: Day 0 - Python from zero",
            [
                f"Drill progress:  {d0_pass}/{d0_total} exercises",
                f"Currently on:    Day {day} of 4",
                "",
                "1. READ    00-python-from-zero.md, sections " + sections[day],
                "           (type every example into the REPL as you read)",
                "",
                "2. OPEN    practice/drills/day0_python.py",
                f"           find:  def {nxt}" if nxt else "",
                "           replace  `raise TODO`  with your answer",
                "",
                "3. RUN     python -m drills.day0_python " + str(day),
                "           fix one, re-run, repeat until all green",
                "",
                "You are NOT creating any files today. One file, fill the blanks.",
            ],
        )
        return

    if d1_total and d1_pass < d1_total:
        nxt = first_unsolved("day1_toolkit")
        box(
            "YOU ARE ON: Day 1 - the Python DSA toolkit",
            [
                f"Drill progress:  {d1_pass}/{d1_total} exercises",
                "",
                "1. READ    01-foundations.md section 1.5 (the toolkit)",
                "",
                "2. OPEN    practice/drills/day1_toolkit.py",
                f"           find:  def {nxt}" if nxt else "",
                "",
                "3. RUN     python -m drills.day1_toolkit",
            ],
        )
        return

    solutions = list((ROOT / "solutions").rglob("*.py"))
    solved = [p for p in solutions if "__init__" not in p.name]
    box(
        "YOU ARE ON: problem practice",
        [
            f"Drills complete.  Solution files so far: {len(solved)}",
            "",
            "NOW you create files. Pick the next unsolved problem from",
            "12-problem-index.md (work top to bottom, Phase 1 order).",
            "",
            '1. python new_problem.py <topic> "<Exact Problem Title>"',
            "   topics: arrays_hashing two_pointers sliding_window stack",
            "           binary_search linked_list trees tries heap",
            "           backtracking graphs dp_1d dp_2d greedy intervals",
            "",
            "   example:",
            '     python new_problem.py arrays_hashing "Contains Duplicate"',
            "",
            "2. python -m dsa.timer 22",
            "3. fill CONSTRAINTS in the docstring BEFORE coding",
            "4. pytest tests/test_contains_duplicate.py -v",
            "5. paste into LeetCode and submit",
            "6. log it in tracker.md",
        ],
    )


if __name__ == "__main__":
    main()
