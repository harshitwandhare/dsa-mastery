"""Pytest configuration for the repository root.

The test suite here holds two populations that must not be confused:

* **Infrastructure tests** — the content pipeline (`tests/`), the shared
  helpers, and `practice/tests/test_doc_*.py`, which execute every code sample
  published in the curriculum. These must always pass. CI gates on them.

* **Practice tests** — `practice/tests/test_<problem>.py`, scaffolded by
  `practice/new_problem.py` for each problem being worked. Their `solve()`
  raises `NotImplementedError` until the problem is solved, so they fail *by
  design* and go green one at a time as the curriculum is worked through.

Gating CI on the second group would leave `main` permanently red and drain the
signal out of every build. So they are auto-marked `practice` by path and
deselected in CI with `-m "not practice"`; a separate non-blocking job reports
how many are solved. Run them locally with `uv run pytest -m practice`.
"""

from __future__ import annotations

import pathlib

import pytest

PRACTICE_TESTS = pathlib.Path(__file__).parent / "practice" / "tests"


def pytest_collection_modifyitems(items: list[pytest.Item]) -> None:
    """Mark every per-problem test `practice`, leaving doc tests ungated."""
    for item in items:
        path = pathlib.Path(str(item.path))
        if path.parent == PRACTICE_TESTS and not path.name.startswith("test_doc_"):
            item.add_marker(pytest.mark.practice)
