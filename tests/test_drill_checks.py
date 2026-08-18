"""The extracted drill assertions must agree with the command-line runner.

HANDOFF.md is explicit that phase 4 is only done when the web runner produces
identical pass/fail to `python -m drills.day0_python`. The site grades a learner
using `check.call` and `check.expected` pulled out of the `CASES` list by the
pipeline; if that extraction drifts from what the CLI actually evaluates, the
browser would mark work correct that the terminal rejects.

These tests execute the extracted source against the real solutions module and
compare with running the same case through the drill file itself.
"""

from __future__ import annotations

import ast
import importlib
import sys
from pathlib import Path
from typing import Any

import pytest

from tools import build_content as bc

PRACTICE = bc.ROOT / "practice"


@pytest.fixture(scope="module")
def drills() -> list[dict]:
    return bc.build_drills()


@pytest.fixture(scope="module", autouse=True)
def _practice_on_path() -> None:
    if str(PRACTICE) not in sys.path:
        sys.path.insert(0, str(PRACTICE))


def _module(drill_id: str) -> Any:
    return importlib.import_module(f"drills.{drill_id}")


class TestExtractionShape:
    def test_every_exercise_has_a_check(self, drills: list[dict]) -> None:
        """A drill exercise with no assertion cannot be graded, so none may lack one."""
        ungraded = [
            exercise["id"]
            for drill in drills
            for exercise in drill["exercises"]
            if not exercise["check"]
        ]
        assert ungraded == []

    def test_the_counts_line_up(self, drills: list[dict]) -> None:
        for drill in drills:
            assert drill["gradableCount"] == drill["exerciseCount"]

    def test_both_arities_of_the_cases_tuple_are_read(self, drills: list[dict]) -> None:
        """Day 0 rows carry a day column and Day 1 rows do not."""
        by_id = {drill["id"]: drill for drill in drills}
        assert by_id["day0_python"]["gradableCount"] == 50
        assert by_id["day1_toolkit"]["gradableCount"] == 25

    def test_call_and_expected_are_parseable_expressions(self, drills: list[dict]) -> None:
        for drill in drills:
            for exercise in drill["exercises"]:
                check = exercise["check"]
                ast.parse(check["call"], mode="eval")
                ast.parse(check["expected"], mode="eval")

    def test_support_source_parses(self, drills: list[dict]) -> None:
        """The helper block is executed verbatim in the browser, so it must run."""
        for drill in drills:
            ast.parse(drill["support"])

    def test_a_check_names_the_exercise_it_grades(self, drills: list[dict]) -> None:
        """A mismatched pairing would grade the wrong answer as correct."""
        for drill in drills:
            for exercise in drill["exercises"]:
                call = exercise["check"]["call"]
                # Either the call mentions the exercise, or it delegates to a
                # private helper that does.
                assert exercise["name"] in call or call[0] == "_", exercise["id"]


class TestAgreesWithTheCommandLine:
    """Evaluate each extracted case and compare with the drill module's own CASES."""

    @staticmethod
    def _cli_cases(drill_id: str) -> dict[str, tuple[Any, Any]]:
        """Run every case the way the CLI does: call the lambda, keep the result."""
        module = _module(drill_id)
        results: dict[str, tuple[Any, Any]] = {}
        for case in module.CASES:
            label, fn, expected = (case[1], case[2], case[3]) if len(case) == 4 else case
            try:
                got = fn()
            except NotImplementedError:
                got = NotImplementedError
            except Exception as error:
                got = type(error)
            results[label] = (got, expected)
        return results

    @staticmethod
    def _web_result(drill: dict, exercise: dict) -> tuple[Any, Any]:
        """Evaluate the extracted source the way the browser runner will."""
        module = _module(drill["id"])
        namespace = dict(vars(module))
        exec(drill["support"], namespace)

        check = exercise["check"]
        try:
            got = eval(check["call"], namespace)
        except NotImplementedError:
            got = NotImplementedError
        except Exception as error:
            got = type(error)
        expected = eval(check["expected"], namespace)
        return got, expected

    @pytest.mark.parametrize("drill_id", ["day0_python", "day1_toolkit"])
    def test_every_case_evaluates_identically(self, drills: list[dict], drill_id: str) -> None:
        drill = next(item for item in drills if item["id"] == drill_id)
        cli = self._cli_cases(drill_id)

        compared = 0
        for exercise in drill["exercises"]:
            label = exercise["check"]["label"]
            if label not in cli:
                continue
            cli_got, cli_expected = cli[label]
            web_got, web_expected = self._web_result(drill, exercise)

            assert web_expected == cli_expected, f"{exercise['id']}: expected value differs"
            assert web_got == cli_got, f"{exercise['id']}: result differs"
            # The verdict is what actually matters to a learner.
            assert (web_got == web_expected) == (cli_got == cli_expected), exercise["id"]
            compared += 1

        assert compared == len(drill["exercises"])

    def test_the_solved_example_passes_and_the_rest_do_not(self, drills: list[dict]) -> None:
        """Only the deliberate worked example is solved, so only it should pass.

        This is the sanity check that the grading is real: if everything passed,
        the assertions would not be running against unsolved stubs at all.
        """
        drill = next(item for item in drills if item["id"] == "day0_python")
        passing = []
        for exercise in drill["exercises"]:
            got, expected = self._web_result(drill, exercise)
            if got is not NotImplementedError and got == expected:
                passing.append(exercise["id"])

        assert passing == ["day0_python.ex01_add"]


class TestSourceFilesAreUntouched:
    def test_the_drill_files_are_only_read(self) -> None:
        """The pipeline must never rewrite the practice environment."""
        before = {path: path.read_bytes() for path in sorted((PRACTICE / "drills").glob("day*.py"))}
        bc.build_drills()
        after = {path: path.read_bytes() for path in before}
        assert after == before

    def test_support_source_excludes_the_cases_table(self, drills: list[dict]) -> None:
        """Shipping CASES to the browser would hand over every expected answer."""
        for drill in drills:
            assert "CASES" not in drill["support"]


def test_practice_directory_is_where_we_think() -> None:
    assert (PRACTICE / "drills" / "day0_python.py").exists()
    assert Path(bc.ROOT / "tools" / "build_content.py").exists()


class TestExtractorGuards:
    """The extractor's defensive branches.

    `CASES` is hand-maintained Python, so it can drift into a shape the
    extractor does not understand. Every guard skips the row rather than
    emitting a half-formed check that would grade a learner against nonsense.
    """

    @staticmethod
    def _checks(source: str) -> dict[str, dict]:
        return bc._case_checks(ast.parse(source), source)

    def test_a_row_that_is_not_a_tuple_is_skipped(self) -> None:
        assert self._checks("CASES = [42]") == {}

    def test_a_tuple_of_the_wrong_width_is_skipped(self) -> None:
        assert self._checks('CASES = [("a", 1)]') == {}
        assert self._checks('CASES = [(1, "a", 2, 3, 4)]') == {}

    def test_a_non_literal_label_is_skipped(self) -> None:
        assert self._checks("CASES = [(name, lambda: f(), 1)]") == {}

    def test_a_callable_that_is_neither_lambda_nor_name_is_skipped(self) -> None:
        assert self._checks('CASES = [("a", f(), 1)]') == {}

    def test_an_assignment_that_is_not_cases_is_ignored(self) -> None:
        assert self._checks('OTHER = [("a", lambda: f(), 1)]') == {}

    def test_cases_bound_to_something_other_than_a_list_is_ignored(self) -> None:
        assert self._checks("CASES = build()") == {}

    def test_a_lambda_row_is_read(self) -> None:
        checks = self._checks('CASES = [("ex01 add", lambda: ex01_add(1, 2), 3)]')
        assert checks["ex01 add"]["call"] == "ex01_add(1, 2)"
        assert checks["ex01 add"]["expected"] == "3"

    def test_a_helper_row_resolves_to_the_exercise_it_reaches(self) -> None:
        source = 'def _check():\n    return ex09_thing()\n\nCASES = [("ex09 thing", _check, 1)]\n'
        checks = self._checks(source)
        assert checks["ex09 thing"]["call"] == "_check()"
        assert "ex09_thing" in checks["ex09 thing"]["names"]

    def test_support_keeps_helpers_and_constants_but_not_cases(self) -> None:
        source = (
            "LIMIT = 5\n"
            "\n"
            "def _helper():\n"
            "    return LIMIT\n"
            "\n"
            "def ex01_visible():\n"
            "    return 1\n"
            "\n"
            "CASES = [1]\n"
        )
        support = bc._support_source(ast.parse(source), source)
        assert "LIMIT = 5" in support
        assert "_helper" in support
        assert "CASES" not in support
        # Exercise definitions come from the learner, not the support block.
        assert "ex01_visible" not in support
