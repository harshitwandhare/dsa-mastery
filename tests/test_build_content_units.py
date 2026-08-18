"""Unit tests for the parsing primitives in `tools/build_content.py`.

These pin the behaviour that the two problem-table shapes, the star/flame flags,
and the inter-document link rewriting depend on. They run against synthetic
markdown rather than the real curriculum files, so a lesson edit can never mask
a parser regression.
"""

from __future__ import annotations

import ast
import pathlib

import pytest

from tools import build_content as bc


class TestSlugify:
    def test_strips_the_md_extension(self) -> None:
        assert bc.slugify("02-arrays-hashing-pointers.md") == "02-arrays-hashing-pointers"

    def test_leaves_a_bare_name_alone(self) -> None:
        assert bc.slugify("tracker") == "tracker"

    def test_only_strips_a_trailing_extension(self) -> None:
        assert bc.slugify("notes.md.md") == "notes.md"


class TestStripMd:
    def test_unwraps_a_link_to_its_text(self) -> None:
        assert bc.strip_md("see [the lesson](01-foundations.md)") == "see the lesson"

    def test_removes_emphasis_and_code_ticks(self) -> None:
        assert bc.strip_md("**two** `pointers`") == "two pointers"

    def test_trims_surrounding_whitespace(self) -> None:
        assert bc.strip_md("  hash map  ") == "hash map"


class TestTableRows:
    def test_skips_the_separator_row(self) -> None:
        block = "| Term | Meaning |\n|------|---------|\n| heap | a tree |"
        assert bc.table_rows(block) == [["Term", "Meaning"], ["heap", "a tree"]]

    def test_ignores_lines_that_are_not_table_rows(self) -> None:
        block = "prose above\n| a | b |\n\nprose below"
        assert bc.table_rows(block) == [["a", "b"]]

    def test_returns_nothing_for_prose(self) -> None:
        assert bc.table_rows("just a paragraph") == []


class TestBuildLessons:
    """`build_lessons` globs `ROOT/*.md`, so each test gets its own fake root."""

    @pytest.fixture(autouse=True)
    def _fake_root(self, tmp_path: pathlib.Path, monkeypatch: pytest.MonkeyPatch) -> None:
        monkeypatch.setattr(bc, "ROOT", tmp_path)
        self.root = tmp_path

    def _write(self, name: str, text: str) -> None:
        (self.root / name).write_text(text, encoding="utf-8")

    def test_ignores_files_without_a_numeric_prefix(self) -> None:
        self._write("README.md", "# Readme\n")
        self._write("00-intro.md", "# Intro\n")
        assert [lesson["slug"] for lesson in bc.build_lessons()] == ["00-intro"]

    def test_reads_the_title_from_the_first_h1(self) -> None:
        self._write("00-intro.md", "# Python From Zero\n\nsome prose\n")
        assert bc.build_lessons()[0]["title"] == "Python From Zero"

    def test_falls_back_to_the_filename_when_there_is_no_h1(self) -> None:
        self._write("00-intro.md", "no heading here\n")
        assert bc.build_lessons()[0]["title"] == "00-intro"

    def test_collects_h2_sections_with_url_safe_anchors(self) -> None:
        self._write("00-intro.md", "# T\n\n## Reading a Traceback\n\n## Lists & Tuples\n")
        assert bc.build_lessons()[0]["sections"] == [
            {"heading": "Reading a Traceback", "anchor": "reading-a-traceback"},
            {"heading": "Lists & Tuples", "anchor": "lists-tuples"},
        ]

    def test_rewrites_inter_lesson_links_to_app_routes(self) -> None:
        self._write("00-intro.md", "# T\n\nsee [next](01-foundations.md#loops)\n")
        assert "](/learn/01-foundations#loops)" in bc.build_lessons()[0]["body"]

    def test_rewrites_tracker_and_readme_links(self) -> None:
        self._write("00-intro.md", "# T\n\n[log](tracker.md) and [home](README.md)\n")
        body = bc.build_lessons()[0]["body"]
        assert "](/tracker)" in body
        assert "](/README)" in body

    def test_counts_runnable_python_fences(self) -> None:
        self._write("00-intro.md", "# T\n\n```python\nx = 1\n```\n\n```text\nnot code\n```\n")
        assert bc.build_lessons()[0]["runnableBlocks"] == 1

    def test_reading_time_is_never_below_the_floor(self) -> None:
        self._write("00-intro.md", "# T\n\nshort\n")
        assert bc.build_lessons()[0]["estimatedMinutes"] == 3

    def test_reading_time_grows_with_length(self) -> None:
        self._write("00-intro.md", "# T\n\n" + "word " * 4000)
        assert bc.build_lessons()[0]["estimatedMinutes"] > 3

    def test_file_number_comes_from_the_filename_prefix(self) -> None:
        self._write("12-problem-index.md", "# Problems\n")
        assert bc.build_lessons()[0]["fileNumber"] == 12

    def test_lessons_come_back_in_file_order(self) -> None:
        for name in ("02-arrays.md", "00-intro.md", "01-foundations.md"):
            self._write(name, "# T\n")
        assert [lesson["fileNumber"] for lesson in bc.build_lessons()] == [0, 1, 2]


class TestBuildProblems:
    @pytest.fixture(autouse=True)
    def _fake_root(self, tmp_path: pathlib.Path, monkeypatch: pytest.MonkeyPatch) -> None:
        monkeypatch.setattr(bc, "ROOT", tmp_path)
        monkeypatch.setattr(bc, "DUPES", [])
        self.root = tmp_path

    def _index(self, body: str) -> list[dict]:
        (self.root / "12-problem-index.md").write_text(body, encoding="utf-8")
        return bc.build_problems()

    def test_parses_the_five_column_neetcode_shape(self) -> None:
        (problem,) = self._index(
            "### Arrays & Hashing (1)\n\n"
            "| # | Problem | Diff | Pattern | Insight |\n"
            "|---|---------|------|---------|---------|\n"
            "| 1 | Two Sum | E | hash map | trade space for time |\n"
        )
        assert problem["orderInList"] == 1
        assert problem["neetcodeTier"] == 150
        assert problem["difficulty"] == "easy"
        assert problem["topic"] == "Arrays & Hashing"
        assert problem["patterns"] == ["hash map"]
        assert problem["insight"] == "trade space for time"

    def test_parses_the_four_column_extended_shape(self) -> None:
        (problem,) = self._index(
            "### Extras\n\n"
            "| Problem | Diff | Pattern | Insight |\n"
            "|---------|------|---------|---------|\n"
            "| Rotate Image | M | matrix | transpose then reverse |\n"
        )
        assert problem["orderInList"] is None
        assert problem["neetcodeTier"] == 250

    def test_parses_the_three_column_design_shape(self) -> None:
        (problem,) = self._index(
            "### System Design\n\n"
            "| Problem | Diff | Concept |\n"
            "|---------|------|---------|\n"
            "| Design Twitter | H | fan-out on write |\n"
        )
        assert problem["neetcodeTier"] == "extra"
        assert problem["patterns"] == ["System Design"]

    def test_reads_the_blind75_star_and_the_frequency_flame(self) -> None:
        problems = self._index(
            "### T\n\n"
            "| # | Problem | Diff | Pattern | Insight |\n"
            "|---|---|---|---|---|\n"
            "| 1 | Two Sum ⭐ | E | hash | x |\n"
            "| 2 | Valid Anagram \U0001f525 | E | count | y |\n"
            "| 3 | Plain Problem | E | none | z |\n"
        )
        flags = {p["title"]: (p["inBlind75"], p["frequentlyAsked"]) for p in problems}
        assert flags["Two Sum"] == (True, False)
        assert flags["Valid Anagram"] == (False, True)
        assert flags["Plain Problem"] == (False, False)

    def test_builds_a_leetcode_url_from_the_slug(self) -> None:
        (problem,) = self._index(
            "### T\n\n| # | P | D | Pat | I |\n|---|---|---|---|---|\n"
            "| 1 | Best Time to Buy | E | greedy | x |\n"
        )
        assert problem["slug"] == "best-time-to-buy"
        assert problem["leetcodeUrl"] == "https://leetcode.com/problems/best-time-to-buy/"

    def test_a_problem_listed_twice_is_kept_once_and_recorded(self) -> None:
        problems = self._index(
            "### A\n\n| # | P | D | Pat | I |\n|---|---|---|---|---|\n"
            "| 1 | Two Sum | E | hash | x |\n"
            "\n### B\n\n| P | D | Pat | I |\n|---|---|---|---|\n"
            "| Two Sum | E | hash | x |\n"
        )
        assert len(problems) == 1
        assert bc.DUPES == ["Two Sum"]

    def test_splits_a_comma_separated_pattern_cell(self) -> None:
        (problem,) = self._index(
            "### T\n\n| # | P | D | Pat | I |\n|---|---|---|---|---|\n"
            "| 1 | Two Sum | E | hash map, one pass | x |\n"
        )
        assert problem["patterns"] == ["hash map", "one pass"]

    def test_skips_rows_with_an_unknown_difficulty_code(self) -> None:
        assert (
            self._index(
                "### T\n\n| # | P | D | Pat | I |\n|---|---|---|---|---|\n"
                "| 1 | Mystery | Z | none | x |\n"
            )
            == []
        )

    def test_drops_the_header_row_that_survives_cell_counting(self) -> None:
        problems = self._index(
            "### T\n\n| Problem | Diff | Pattern | Insight |\n|---|---|---|---|\n"
            "| Rotate Image | M | matrix | x |\n"
        )
        assert [p["title"] for p in problems] == ["Rotate Image"]

    def test_strips_the_count_suffix_from_a_topic_heading(self) -> None:
        (problem,) = self._index(
            "### Two Pointers (14)\n\n| # | P | D | Pat | I |\n|---|---|---|---|---|\n"
            "| 1 | Two Sum | E | hash | x |\n"
        )
        assert problem["topic"] == "Two Pointers"


class TestBuildDrills:
    @pytest.fixture(autouse=True)
    def _fake_root(self, tmp_path: pathlib.Path, monkeypatch: pytest.MonkeyPatch) -> None:
        monkeypatch.setattr(bc, "ROOT", tmp_path)
        self.drill_dir = tmp_path / "practice" / "drills"
        self.drill_dir.mkdir(parents=True)

    def _drill(self, name: str, body: str) -> list[dict]:
        (self.drill_dir / name).write_text(body, encoding="utf-8")
        return bc.build_drills()

    def test_extracts_an_exercise_function_with_its_prompt(self) -> None:
        (drill,) = self._drill(
            "day0_python.py",
            '"""Day 0 drills\n\nmore text\n"""\n\n\n'
            'def ex01_greet(name):\n    """Return a greeting."""\n    pass\n',
        )
        assert drill["id"] == "day0_python"
        assert drill["title"] == "Day 0 drills"
        assert drill["exerciseCount"] == 1
        exercise = drill["exercises"][0]
        assert exercise["id"] == "day0_python.ex01_greet"
        assert exercise["kind"] == "function"
        assert exercise["params"] == ["name"]
        assert exercise["prompt"] == "Return a greeting."
        assert exercise["title"] == "ex01 greet"

    def test_ignores_helpers_that_are_not_numbered_exercises(self) -> None:
        (drill,) = self._drill(
            "day0_python.py",
            '"""D"""\n\n\ndef helper():\n    pass\n\n\ndef ex01_real(x):\n    pass\n',
        )
        assert [e["name"] for e in drill["exercises"]] == ["ex01_real"]

    def test_picks_up_the_two_class_exercises(self) -> None:
        (drill,) = self._drill(
            "day0_python.py",
            '"""D"""\n\n\nclass Dog:\n    """A dog."""\n\n    pass\n',
        )
        exercise = drill["exercises"][0]
        assert exercise["kind"] == "class"
        assert exercise["params"] == []

    def test_assigns_each_exercise_to_the_day_banner_above_it(self) -> None:
        (drill,) = self._drill(
            "day0_python.py",
            '"""D"""\n\n\n# DAY 1 - basics\ndef ex01_a(x):\n    pass\n\n\n'
            "# DAY 3 - functions\ndef ex02_b(x):\n    pass\n",
        )
        assert {e["name"]: e["day"] for e in drill["exercises"]} == {"ex01_a": 1, "ex02_b": 3}

    def test_starter_code_round_trips_as_valid_python(self) -> None:
        (drill,) = self._drill(
            "day0_python.py",
            '"""D"""\n\n\ndef ex02_add(a, b):\n    """Add."""\n    return a + b\n',
        )
        starter = drill["exercises"][0]["starterCode"]
        assert starter.startswith("def ex02_add(a, b):")
        ast.parse(starter)

    def test_a_solved_exercise_is_published_as_an_unsolved_stub(self) -> None:
        """The drill files are a working directory; solving one must not leak.

        Without this, every answer written locally ships as the starter code the
        moment the solved file is committed, spoiling the exercise for readers.
        """
        (drill,) = self._drill(
            "day0_python.py",
            '"""D"""\n\n\ndef ex07_total(nums):\n    """Return the sum."""\n'
            "    running = 0\n    for n in nums:\n        running += n\n    return running\n",
        )
        starter = drill["exercises"][0]["starterCode"]
        assert starter == 'def ex07_total(nums):\n    """Return the sum."""\n    raise TODO'
        assert "running" not in starter

    def test_the_prompt_survives_even_when_the_body_is_dropped(self) -> None:
        (drill,) = self._drill(
            "day0_python.py",
            '"""D"""\n\n\ndef ex07_total(nums):\n    """Return the sum."""\n    return sum(nums)\n',
        )
        assert drill["exercises"][0]["prompt"] == "Return the sum."

    def test_a_multi_line_docstring_keeps_its_indentation(self) -> None:
        (drill,) = self._drill(
            "day0_python.py",
            '"""D"""\n\n\ndef ex07_div(a, b):\n    """Divide a by b.\n'
            '    (7, 2) -> 3"""\n    return a // b\n',
        )
        starter = drill["exercises"][0]["starterCode"]
        assert "\n    (7, 2) -> 3" in starter
        ast.parse(starter)

    def test_a_class_exercise_gets_a_body_that_still_parses(self) -> None:
        (drill,) = self._drill(
            "day0_python.py",
            '"""D"""\n\n\nclass Dog:\n    """A dog."""\n\n'
            "    def speak(self):\n        return 'woof'\n",
        )
        starter = drill["exercises"][0]["starterCode"]
        assert starter.endswith("    pass")
        assert "woof" not in starter
        ast.parse(starter)

    def test_an_exercise_with_no_docstring_still_produces_a_stub(self) -> None:
        (drill,) = self._drill(
            "day0_python.py",
            '"""D"""\n\n\ndef ex07_noop(x):\n    return x * 2\n',
        )
        starter = drill["exercises"][0]["starterCode"]
        assert starter == "def ex07_noop(x):\n    raise TODO"
        ast.parse(starter)

    def test_the_worked_example_is_published_verbatim(self) -> None:
        """File 00 opens with one solved exercise on purpose, as a shape to copy."""
        (drill,) = self._drill(
            "day0_python.py",
            '"""D"""\n\n\ndef ex01_add(a, b):\n    """Add."""\n    return a + b\n',
        )
        assert "return a + b" in drill["exercises"][0]["starterCode"]

    def test_source_path_is_posix_so_it_survives_windows(self) -> None:
        (drill,) = self._drill("day0_python.py", '"""D"""\n\n\ndef ex01_a(x):\n    pass\n')
        assert drill["sourceFile"] == "practice/drills/day0_python.py"

    def test_drill_files_are_read_in_sorted_order(self) -> None:
        (self.drill_dir / "day1_toolkit.py").write_text('"""One"""\n', encoding="utf-8")
        (self.drill_dir / "day0_python.py").write_text('"""Zero"""\n', encoding="utf-8")
        assert [d["id"] for d in bc.build_drills()] == ["day0_python", "day1_toolkit"]


class TestBuildGlossary:
    @pytest.fixture(autouse=True)
    def _fake_root(self, tmp_path: pathlib.Path, monkeypatch: pytest.MonkeyPatch) -> None:
        monkeypatch.setattr(bc, "ROOT", tmp_path)
        self.root = tmp_path

    def _glossary(self, body: str) -> list[dict]:
        (self.root / "19-prerequisites-and-glossary.md").write_text(body, encoding="utf-8")
        return bc.build_glossary()

    def test_reads_terms_under_their_section(self) -> None:
        (entry,) = self._glossary("## Big-O\n\n| Term | Meaning |\n|---|---|\n| O(n) | linear |\n")
        assert entry == {"term": "O(n)", "meaning": "linear", "section": "Big-O"}

    def test_drops_header_rows_and_repeated_terms(self) -> None:
        entries = self._glossary(
            "## A\n\n| Term | Meaning |\n|---|---|\n| heap | a tree |\n"
            "\n## B\n\n| Term | Meaning |\n|---|---|\n| heap | again |\n| trie | prefix tree |\n"
        )
        assert [e["term"] for e in entries] == ["heap", "trie"]

    def test_ignores_tables_that_are_not_two_columns(self) -> None:
        assert self._glossary("## A\n\n| a | b | c |\n|---|---|---|\n| x | y | z |\n") == []

    def test_strips_markdown_from_both_cells(self) -> None:
        (entry,) = self._glossary("## A\n\n| Term | Meaning |\n|---|---|\n| `dict` | **a map** |\n")
        assert entry["term"] == "dict"
        assert entry["meaning"] == "a map"
