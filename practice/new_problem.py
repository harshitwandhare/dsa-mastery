"""Scaffold a new practice problem: solution file + test file.

Usage:
    python new_problem.py arrays_hashing two-sum
    python new_problem.py trees "Validate Binary Search Tree"

Creates:
    solutions/<topic>/<slug>.py
    tests/test_<slug>.py

Then:
    pytest tests/test_<slug>.py -v
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).parent

TOPICS = [
    "arrays_hashing", "two_pointers", "sliding_window", "stack",
    "binary_search", "linked_list", "trees", "tries", "heap",
    "backtracking", "graphs", "advanced_graphs", "dp_1d", "dp_2d",
    "greedy", "intervals", "math_geometry", "bit_manipulation",
    "sorting", "strings", "design", "concurrency",
]

SOLUTION_TEMPLATE = '''"""{title}

Link:        https://leetcode.com/problems/{slug}/
Topic:       {topic}
Pattern:     <fill in AFTER solving -- e.g. "sliding window, variable size">
Difficulty:  <easy | medium | hard>

CONSTRAINTS (copy from the problem, then reason about them BEFORE coding):
    n <= ?
    values in range ?
    -> implies target complexity: ?

APPROACH
    Brute force:  ?          time O(?)   space O(?)
    Optimised:    ?          time O(?)   space O(?)
    The waste being removed: ?

KEY INSIGHT (one sentence, filled in after solving):
    ?

WHAT I WOULD GET WRONG IN A MONTH:
    ?
"""

from dsa.helpers import ListNode, TreeNode, build_list, build_tree, show  # noqa: F401


def solve():
    """Replace the signature with the real one from the problem."""
    raise NotImplementedError


if __name__ == "__main__":
    # Quick manual run:  python -m solutions.{topic}.{module}
    show("example 1", solve())
'''

TEST_TEMPLATE = '''"""Tests for {title}."""

import pytest

from solutions.{topic}.{module} import solve


def test_example_1():
    assert solve() == ...


def test_example_2():
    assert solve() == ...


def test_edge_empty():
    """Empty / minimal input -- name your edge cases explicitly."""
    assert solve() == ...


@pytest.mark.parametrize("given,expected", [
    (..., ...),
    (..., ...),
])
def test_cases(given, expected):
    assert solve(given) == expected
'''


def slugify(name: str) -> str:
    s = re.sub(r"[^a-zA-Z0-9]+", "-", name).strip("-").lower()
    return s


def main() -> None:
    if len(sys.argv) < 3:
        print(__doc__)
        print("Topics:")
        for t in TOPICS:
            print(f"  {t}")
        sys.exit(1)

    topic = sys.argv[1]
    raw_name = " ".join(sys.argv[2:])

    if topic not in TOPICS:
        print(f"Unknown topic '{topic}'. Choose one of:")
        for t in TOPICS:
            print(f"  {t}")
        sys.exit(1)

    slug = slugify(raw_name)
    module = slug.replace("-", "_")
    title = raw_name if raw_name[0].isupper() else raw_name.replace("-", " ").title()

    topic_dir = ROOT / "solutions" / topic
    topic_dir.mkdir(parents=True, exist_ok=True)
    init = topic_dir / "__init__.py"
    if not init.exists():
        init.write_text("", encoding="utf-8")

    sol_path = topic_dir / f"{module}.py"
    test_path = ROOT / "tests" / f"test_{module}.py"

    if sol_path.exists():
        print(f"Already exists: {sol_path}")
    else:
        sol_path.write_text(
            SOLUTION_TEMPLATE.format(title=title, slug=slug, topic=topic, module=module),
            encoding="utf-8",
        )
        print(f"Created {sol_path.relative_to(ROOT)}")

    if test_path.exists():
        print(f"Already exists: {test_path}")
    else:
        test_path.write_text(
            TEST_TEMPLATE.format(title=title, topic=topic, module=module),
            encoding="utf-8",
        )
        print(f"Created {test_path.relative_to(ROOT)}")

    print(f"\nNext:")
    print(f"  1. python -m dsa.timer 22")
    print(f"  2. edit solutions/{topic}/{module}.py")
    print(f"  3. pytest tests/test_{module}.py -v")


if __name__ == "__main__":
    main()
