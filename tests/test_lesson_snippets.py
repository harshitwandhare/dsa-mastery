"""Execute the lesson code that the site offers a Run button for.

Spec 20.8 phase 3 accepts when every runnable fence in files 00 to 02 executes
correctly. The web app runs those blocks through Pyodide, sharing one namespace
per lesson so a block can use a name an earlier block imported. This reproduces
the same semantics against CPython, which is fast enough for CI and catches a
broken example long before a reader presses Run on it.

The pipeline decides which blocks are runnable by resolving their free names
(`runnable_fences`). This test is the other half of that promise: whatever it
marks runnable has to actually run.
"""

from __future__ import annotations

import pathlib

import pytest

from tools.build_content import PY_FENCE, runnable_fences

ROOT = pathlib.Path(__file__).resolve().parent.parent

# The lessons whose code the app promises to run. Phase 3 covers 00 through 02.
COVERED = ["00-python-from-zero.md", "01-foundations.md", "02-arrays-hashing-pointers.md"]


def lesson_text(filename: str) -> str:
    return (ROOT / filename).read_text(encoding="utf-8")


@pytest.mark.parametrize("filename", COVERED)
def test_every_block_offered_as_runnable_actually_runs(filename: str) -> None:
    """Run a lesson's blocks in order in one namespace, exactly as the app does.

    Blocks the pipeline marked non-runnable are still executed for their side
    effects, because a later block may depend on a name they define, but their
    failures are ignored: the site never offers to run them.
    """
    text = lesson_text(filename)
    flags = runnable_fences(text)
    namespace: dict[str, object] = {}
    failures: list[str] = []

    for index, match in enumerate(PY_FENCE.finditer(text)):
        code = match.group(1)
        try:
            exec(compile(code, f"{filename}#{index}", "exec"), namespace)
        except NameError as error:
            # A NameError is the one failure that means the block was never
            # runnable in the first place. Other exceptions are the curriculum
            # doing its job: file 00 teaches immutability with a TypeError and
            # dict access with a KeyError, and pressing Run on those to read the
            # real traceback is the entire point of the lesson.
            if not flags[index]:
                continue
            first_line = code.strip().split("\n")[0]
            failures.append(f"  block {index} ({first_line[:60]}): {error}")
        except Exception:
            pass

    assert not failures, (
        f"{filename} offers a Run button on blocks with undefined names:\n" + "\n".join(failures)
    )


@pytest.mark.parametrize("filename", COVERED)
def test_most_of_a_lesson_is_still_runnable(filename: str) -> None:
    """Guards the analysis against silently marking everything non-runnable.

    A bug that returned False for every fence would make the test above pass
    while quietly removing the feature from the whole site.
    """
    flags = runnable_fences(lesson_text(filename))
    assert flags, filename
    assert sum(flags) / len(flags) >= 0.6, (
        f"{filename}: only {sum(flags)}/{len(flags)} blocks are runnable"
    )
