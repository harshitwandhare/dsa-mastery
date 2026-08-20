"""Integration tests that run the pipeline over the real curriculum.

The unit tests prove the parser is correct against synthetic markdown. These
prove the actual repository still parses into the shape the web app is built
against, so a lesson edit that silently drops a table or renumbers the NeetCode
list fails here rather than in the browser.
"""

from __future__ import annotations

import json
import pathlib
import shutil
from collections.abc import Iterator

import pytest

from tools import build_content as bc

CONTENT_DIR = bc.ROOT / "web" / "content"


@pytest.fixture(scope="module")
def lessons() -> list[dict]:
    return bc.build_lessons()


@pytest.fixture(scope="module")
def problems() -> list[dict]:
    return bc.build_problems()


@pytest.fixture(scope="module")
def drills() -> list[dict]:
    return bc.build_drills()


@pytest.fixture(scope="module")
def glossary() -> list[dict]:
    return bc.build_glossary()


class TestLessons:
    def test_every_numbered_file_becomes_a_lesson(self, lessons: list[dict]) -> None:
        on_disk = sorted(p.stem for p in bc.ROOT.glob("[0-9][0-9]-*.md"))
        assert sorted(lesson["slug"] for lesson in lessons) == on_disk

    def test_the_full_curriculum_is_present(self, lessons: list[dict]) -> None:
        assert len(lessons) >= 20

    def test_file_numbers_are_a_contiguous_run_from_zero(self, lessons: list[dict]) -> None:
        numbers = sorted(lesson["fileNumber"] for lesson in lessons)
        assert numbers == list(range(len(numbers)))

    def test_every_lesson_has_a_title_and_a_body(self, lessons: list[dict]) -> None:
        for lesson in lessons:
            assert lesson["title"].strip(), lesson["slug"]
            assert lesson["body"].strip(), lesson["slug"]

    def test_no_raw_markdown_links_survive_the_rewrite(self, lessons: list[dict]) -> None:
        """Any `](NN-name.md)` left over would 404 in the app."""
        for lesson in lessons:
            assert "](0" not in lesson["body"].replace("](/learn/0", ""), lesson["slug"]

    def test_every_internal_link_resolves_to_a_real_lesson(self, lessons: list[dict]) -> None:
        known = {lesson["slug"] for lesson in lessons}
        for lesson in lessons:
            for target in _internal_link_targets(lesson["body"]):
                assert target in known, f"{lesson['slug']} links to missing /learn/{target}"

    def test_anchors_are_url_safe(self, lessons: list[dict]) -> None:
        for lesson in lessons:
            for section in lesson["sections"]:
                anchor = section["anchor"]
                assert anchor == anchor.lower()
                assert " " not in anchor


def _internal_link_targets(body: str) -> list[str]:
    import re

    return [m.group(1) for m in re.finditer(r"\]\(/learn/([0-9]{2}-[a-z0-9-]+)", body)]


class TestProblems:
    def test_the_expected_problem_count_survives_deduplication(self, problems: list[dict]) -> None:
        assert len(problems) >= 290

    def test_the_neetcode_150_is_exactly_one_through_one_fifty(self, problems: list[dict]) -> None:
        ordered = sorted(p["orderInList"] for p in problems if p["orderInList"])
        assert ordered == list(range(1, 151))

    def test_slugs_are_unique(self, problems: list[dict]) -> None:
        slugs = [p["slug"] for p in problems]
        assert len(slugs) == len(set(slugs))

    def test_every_problem_has_a_known_difficulty(self, problems: list[dict]) -> None:
        assert {p["difficulty"] for p in problems} <= {"easy", "medium", "hard"}

    def test_every_problem_carries_a_leetcode_url(self, problems: list[dict]) -> None:
        for problem in problems:
            assert problem["leetcodeUrl"].startswith("https://leetcode.com/problems/")
            assert problem["leetcodeUrl"].endswith(f"/{problem['slug']}/")

    def test_the_list_still_opens_on_contains_duplicate(self, problems: list[dict]) -> None:
        """A canary: if this moves, the NeetCode default sort has been reordered."""
        first = min((p for p in problems if p["orderInList"]), key=lambda p: p["orderInList"])
        assert first["slug"] == "contains-duplicate"

    def test_the_blind75_subset_is_a_plausible_size(self, problems: list[dict]) -> None:
        assert 60 <= sum(1 for p in problems if p["inBlind75"]) <= 90


class TestDrills:
    def test_both_drill_files_are_found(self, drills: list[dict]) -> None:
        assert {d["id"] for d in drills} == {"day0_python", "day1_toolkit"}

    def test_the_documented_exercise_counts_hold(self, drills: list[dict]) -> None:
        counts = {d["id"]: d["exerciseCount"] for d in drills}
        assert counts == {"day0_python": 50, "day1_toolkit": 25}

    def test_day0_covers_days_one_through_four(self, drills: list[dict]) -> None:
        day0 = next(d for d in drills if d["id"] == "day0_python")
        assert {e["day"] for e in day0["exercises"]} == {1, 2, 3, 4}

    def test_exercise_ids_are_unique_across_all_drills(self, drills: list[dict]) -> None:
        ids = [e["id"] for drill in drills for e in drill["exercises"]]
        assert len(ids) == len(set(ids))

    def test_every_exercise_has_a_prompt(self, drills: list[dict]) -> None:
        for drill in drills:
            for exercise in drill["exercises"]:
                assert exercise["prompt"].strip(), exercise["id"]

    def test_every_starter_snippet_is_parseable_python(self, drills: list[dict]) -> None:
        import ast

        for drill in drills:
            for exercise in drill["exercises"]:
                ast.parse(exercise["starterCode"])

    def test_exactly_two_exercises_ask_for_a_class(self, drills: list[dict]) -> None:
        classes = [e["id"] for drill in drills for e in drill["exercises"] if e["kind"] == "class"]
        assert len(classes) == 2


class TestGlossary:
    def test_the_documented_term_count_holds(self, glossary: list[dict]) -> None:
        assert len(glossary) >= 100

    def test_terms_are_unique_case_insensitively(self, glossary: list[dict]) -> None:
        terms = [entry["term"].lower() for entry in glossary]
        assert len(terms) == len(set(terms))

    def test_every_term_has_a_meaning(self, glossary: list[dict]) -> None:
        for entry in glossary:
            assert entry["meaning"].strip(), entry["term"]


class TestGeneratedContentIsInSync:
    """`web/content/*.json` is committed, so it must match what the pipeline emits.

    A failure here means someone edited the markdown without rerunning
    `python tools/build_content.py`, or hand-edited the JSON. Either way the web
    app is being built against content that no longer matches its source.
    """

    @pytest.mark.parametrize(
        ("filename", "builder"),
        [
            ("lessons.json", bc.build_lessons),
            ("problems.json", bc.build_problems),
            ("drills.json", bc.build_drills),
            ("glossary.json", bc.build_glossary),
        ],
    )
    def test_committed_json_matches_a_fresh_build(self, filename: str, builder) -> None:  # type: ignore[no-untyped-def]
        path = CONTENT_DIR / filename
        committed = json.loads(path.read_text(encoding="utf-8"))
        assert committed == builder(), (
            f"{filename} is stale. Run `python tools/build_content.py` and commit the result."
        )

    def test_no_generated_file_is_missing(self) -> None:
        expected = {"lessons.json", "problems.json", "drills.json", "glossary.json"}
        present = {p.name for p in CONTENT_DIR.glob("*.json")}
        assert expected <= present


class TestMainEntryPoint:
    @pytest.fixture
    def scratch_out(self, monkeypatch: pytest.MonkeyPatch) -> Iterator[pathlib.Path]:
        """Redirect the pipeline output away from the committed `web/content/`.

        `main` prints the destination as a path relative to `ROOT`, so the
        scratch directory has to live under the repository rather than in
        `tmp_path`. It is removed again however the test ends.
        """
        out = bc.ROOT / "web" / ".content-build-test"
        monkeypatch.setattr(bc, "OUT", out)
        try:
            yield out
        finally:
            shutil.rmtree(out, ignore_errors=True)

    def test_a_full_run_reports_success(
        self, scratch_out: pathlib.Path, capsys: pytest.CaptureFixture
    ) -> None:
        """`main` writes every payload and returns 0 when the sanity checks pass."""
        assert bc.main() == 0
        assert "ALL CHECKS PASSED" in capsys.readouterr().out
        written = {p.name for p in scratch_out.glob("*.json")}
        assert written == {
            "lessons.json",
            "problems.json",
            "drills.json",
            "glossary.json",
            "patterns.json",
        }

    def test_a_truncated_curriculum_fails_the_run(
        self, tmp_path: pathlib.Path, monkeypatch: pytest.MonkeyPatch, capsys: pytest.CaptureFixture
    ) -> None:
        """The point of the sanity checks: silent content loss has to be loud."""
        fake_root = tmp_path / "root"
        (fake_root / "practice" / "drills").mkdir(parents=True)
        (fake_root / "00-intro.md").write_text("# Intro\n", encoding="utf-8")
        (fake_root / "12-problem-index.md").write_text("# Problems\n", encoding="utf-8")
        (fake_root / "19-prerequisites-and-glossary.md").write_text("# G\n", encoding="utf-8")

        monkeypatch.setattr(bc, "ROOT", fake_root)
        monkeypatch.setattr(bc, "OUT", fake_root / "web" / "content")
        assert bc.main() == 1
        assert "CHECKS FAILED" in capsys.readouterr().out
