"""The sixteen-pattern inventory, lifted out of file 08.

Spec 20.7 F6 turns these into flashcards. The table is hand-maintained prose in
the curriculum, so the extraction has to survive the ways prose drifts: a
renumbered row, a reworded trigger, or another table appearing further down the
same file.
"""

from __future__ import annotations

import json
import pathlib

import pytest

from tools import build_content as bc


@pytest.fixture(scope="module")
def patterns() -> list[dict]:
    return bc.build_patterns()


class TestTheInventory:
    def test_all_sixteen_are_found(self, patterns: list[dict]) -> None:
        assert len(patterns) == 16

    def test_they_are_numbered_one_to_sixteen(self, patterns: list[dict]) -> None:
        assert [p["number"] for p in patterns] == list(range(1, 17))

    def test_every_pattern_has_a_name_and_a_trigger(self, patterns: list[dict]) -> None:
        for pattern in patterns:
            assert pattern["name"].strip(), pattern["number"]
            assert pattern["trigger"].strip(), pattern["number"]

    def test_names_are_unique(self, patterns: list[dict]) -> None:
        names = [p["name"] for p in patterns]
        assert len(names) == len(set(names))

    def test_the_header_row_is_not_treated_as_a_pattern(self, patterns: list[dict]) -> None:
        assert "Pattern" not in [p["name"] for p in patterns]

    def test_the_first_one_is_what_the_curriculum_says(self, patterns: list[dict]) -> None:
        """A canary: if this moves, the table has been reordered."""
        assert patterns[0]["name"] == "Hashing / frequency"

    def test_markdown_is_stripped_from_the_cells(self, patterns: list[dict]) -> None:
        for pattern in patterns:
            assert "**" not in pattern["name"]
            assert "`" not in pattern["name"]


class TestExtractionBoundaries:
    def test_a_later_table_in_the_file_does_not_leak_in(
        self, monkeypatch: pytest.MonkeyPatch, tmp_path: pathlib.Path
    ) -> None:
        """The block must stop at the next heading, not run to end of file."""
        (tmp_path / "08-interview-craft.md").write_text(
            "### The complete pattern inventory\n\n"
            "| # | Pattern | Trigger |\n|---|---|---|\n"
            "| 1 | Hashing | seen before |\n"
            "\n## Something else\n\n"
            "| # | Pattern | Trigger |\n|---|---|---|\n"
            "| 2 | Should not appear | no |\n",
            encoding="utf-8",
        )
        monkeypatch.setattr(bc, "ROOT", tmp_path)
        assert [p["name"] for p in bc.build_patterns()] == ["Hashing"]

    def test_a_missing_heading_yields_nothing_rather_than_guessing(
        self, monkeypatch: pytest.MonkeyPatch, tmp_path: pathlib.Path
    ) -> None:
        (tmp_path / "08-interview-craft.md").write_text("# No inventory\n", encoding="utf-8")
        monkeypatch.setattr(bc, "ROOT", tmp_path)
        assert bc.build_patterns() == []

    def test_rows_that_are_not_numbered_are_skipped(
        self, monkeypatch: pytest.MonkeyPatch, tmp_path: pathlib.Path
    ) -> None:
        (tmp_path / "08-interview-craft.md").write_text(
            "### The complete pattern inventory\n\n"
            "| # | Pattern | Trigger |\n|---|---|---|\n"
            "| - | A note row | ignore me |\n"
            "| 1 | Real | yes |\n",
            encoding="utf-8",
        )
        monkeypatch.setattr(bc, "ROOT", tmp_path)
        assert [p["name"] for p in bc.build_patterns()] == ["Real"]

    def test_the_inventory_runs_to_the_end_of_the_file(
        self, monkeypatch: pytest.MonkeyPatch, tmp_path: pathlib.Path
    ) -> None:
        """No trailing heading is not an error; the table simply ends the file."""
        (tmp_path / "08-interview-craft.md").write_text(
            "### The complete pattern inventory\n\n"
            "| # | Pattern | Trigger |\n|---|---|---|\n"
            "| 1 | Only | one |\n",
            encoding="utf-8",
        )
        monkeypatch.setattr(bc, "ROOT", tmp_path)
        assert len(bc.build_patterns()) == 1


def test_the_generated_file_matches_a_fresh_build() -> None:
    """patterns.json is committed, so it must not drift from the markdown."""
    committed = json.loads((bc.OUT / "patterns.json").read_text(encoding="utf-8"))
    assert committed == bc.build_patterns()
