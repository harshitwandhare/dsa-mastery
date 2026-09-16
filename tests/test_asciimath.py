"""The ASCII-maths converter, which rewrites curriculum files in bulk.

Every bug in this module edits the lessons, so the cases below are the ones it
actually got wrong while it was being written, kept as regressions:

- the closing brace of a ``^{...}`` group being escaped into ``\\}``
- ``sum`` never converting, because ``_`` is a word character and ``\\bsum\\b``
  therefore has no trailing boundary
- ``2.1`` being read as attribute access and rejected
- the star of ``lg*`` being turned into ``\\cdot``
- ``n^lg 7`` emitting ``\\lg`` with no argument, which KaTeX refuses

The second half of the file is the other half of the contract: code stays code.
"""

from __future__ import annotations

import pathlib
import sys

import pytest

from tools import asciimath
from tools.asciimath import convert_file, to_tex


class TestConverts:
    @pytest.mark.parametrize(
        ("source", "expected"),
        [
            ("Theta(n^2)", r"\Theta(n^2)"),
            ("O(n log n)", r"O(n \log n)"),
            ("f = Omega(g)", r"f = \Omega(g)"),
            ("n >= n0", r"n \ge n_0"),
            ("0 <= c1 * g(n)", r"0 \le c_1 \cdot g(n)"),
            ("n != m", r"n \ne m"),
            ("eps > 0", r"\varepsilon > 0"),
            # A letter exponent is braced by the same rule that fixes "n^lg 7".
            # Harmless, and equivalent LaTeX.
            ("Theta(phi^n)", r"\Theta(\varphi^{n})"),
            ("lim (n log n)/n = infinity", r"\lim (n \log n)/n = \infty"),
        ],
    )
    def test_basic_notation(self, source: str, expected: str) -> None:
        assert to_tex(source) == expected

    @pytest.mark.parametrize(
        ("source", "expected"),
        [
            # The brace bug: the closing brace of a group must not be escaped.
            ("n^(log_b a)", r"n^{\log_b a}"),
            ("2^(2n)", r"2^{2n}"),
            ("(n/2 - 1)^2.1", r"(n/2 - 1)^{2.1}"),
            # The boundary bug: "sum" is followed by "_", a word character.
            ("sum_{i=1}^{n} 1/i", r"\sum_{i=1}^{n} 1/i"),
            # The star bug: lg* is the iterated log, not a multiplication.
            ("lg* n", r"\lg^{*} n"),
            # The arity bug: a macro under ^ needs braces or KaTeX refuses.
            ("n^lg 7", r"n^{\lg 7}"),
            ("2^min(m,n)", r"2^{\min(m,n)}"),
        ],
    )
    def test_regressions(self, source: str, expected: str) -> None:
        assert to_tex(source) == expected

    def test_floor_and_ceiling(self) -> None:
        assert to_tex("T(ceil(n/2)) + T(floor(n/2))") == (
            r"T(\lceil n/2 \rceil) + T(\lfloor n/2 \rfloor)"
        )

    def test_square_root(self) -> None:
        assert to_tex("sqrt(n)") == r"\sqrt{n}"
        assert to_tex("1/sqrt 7") == r"1/\sqrt{7}"

    def test_set_braces_survive(self) -> None:
        assert to_tex("{1, 2, 3}") == r"\{1, 2, 3\}"
        assert to_tex("S = {v1, v2}") == r"S = \{v_1, v_2\}"


class TestLeavesCodeAlone:
    @pytest.mark.parametrize(
        "source",
        [
            "arr.sort()",
            "counts[c] = counts.get(c, 0) + 1",
            "x in set",
            "2 ** 3",
            "def solve(n):",
            "return None",
            'print("hi")',
            "a[1:2]",
            "# a comment",
            "n",  # a bare identifier is ambiguous, so it stays code
        ],
    )
    def test_rejected(self, source: str) -> None:
        assert to_tex(source) is None

    def test_unknown_token_rejects_the_whole_span(self) -> None:
        """One word it does not know and the span is left exactly as it was."""
        assert to_tex("Theta(n) for each widget") is None

    def test_already_converted_is_left_alone(self) -> None:
        """Re-running the tool over its own output must be a no-op."""
        assert to_tex(r"$\Theta(n^2)$") is None


class TestDocumentRewriting:
    def test_converts_prose_spans(self) -> None:
        text = "The loop runs in `Theta(n^2)` time.\n"
        updated, changes = convert_file(text)
        assert updated == "The loop runs in $\\Theta(n^2)$ time.\n"
        assert changes == [("Theta(n^2)", r"\Theta(n^2)")]

    def test_leaves_fenced_blocks_untouched(self) -> None:
        text = "Before `Theta(n)`.\n\n```\nT(n) = Theta(n)\n```\n\nAfter.\n"
        updated, _ = convert_file(text)
        assert "```\nT(n) = Theta(n)\n```" in updated
        assert "$\\Theta(n)$" in updated

    def test_leaves_headings_untouched(self) -> None:
        """A heading is also its sidebar entry, which cannot hold rendered maths."""
        text = "### Example: prove `Theta(n^2)`\n\nBody with `Theta(n^2)`.\n"
        updated, _ = convert_file(text)
        assert "### Example: prove `Theta(n^2)`" in updated
        assert "Body with $\\Theta(n^2)$." in updated

    def test_is_idempotent(self) -> None:
        text = "Runs in `Theta(n log n)` on `A[i]`.\n"
        once, first = convert_file(text)
        twice, second = convert_file(once)
        assert once == twice
        assert first and not second


def test_no_macro_is_left_without_an_argument() -> None:
    """The guard that stops a KaTeX parse error reaching a lesson."""
    for source in ["n^lg 7", "2^min(m,n)", "x^max(a,b)"]:
        tex = to_tex(source)
        assert tex is None or "^\\" not in tex, tex


class TestMalformedInput:
    """Unbalanced delimiters must bail out, not loop forever or half-convert."""

    @pytest.mark.parametrize("source", ["ceil(n/2", "floor(n/2", "n^(log_b a", "2^(n"])
    def test_unbalanced_parenthesis_is_rejected(self, source: str) -> None:
        assert to_tex(source) is None


class TestCommandLine:
    def test_dry_run_reports_without_writing(
        self,
        tmp_path: pathlib.Path,
        monkeypatch: pytest.MonkeyPatch,
        capsys: pytest.CaptureFixture[str],
    ) -> None:
        lesson = tmp_path / "21-sample.md"
        lesson.write_text("Runs in `Theta(n^2)` time.\n", encoding="utf-8")
        monkeypatch.setattr(asciimath, "ROOT", tmp_path)
        monkeypatch.setattr(sys, "argv", ["asciimath", "--glob", "21-*.md"])

        assert asciimath.main() == 0

        out = capsys.readouterr().out
        assert "1 spans converted" in out
        assert "dry run" in out
        assert lesson.read_text(encoding="utf-8") == "Runs in `Theta(n^2)` time.\n"

    def test_apply_writes_the_file(
        self,
        tmp_path: pathlib.Path,
        monkeypatch: pytest.MonkeyPatch,
        capsys: pytest.CaptureFixture[str],
    ) -> None:
        lesson = tmp_path / "21-sample.md"
        lesson.write_text("Runs in `Theta(n^2)` time.\n", encoding="utf-8")
        monkeypatch.setattr(asciimath, "ROOT", tmp_path)
        monkeypatch.setattr(sys, "argv", ["asciimath", "--glob", "21-*.md", "--apply"])

        assert asciimath.main() == 0

        assert lesson.read_text(encoding="utf-8") == "Runs in $\\Theta(n^2)$ time.\n"
        assert "dry run" not in capsys.readouterr().out

    def test_apply_leaves_a_file_with_nothing_to_do(
        self,
        tmp_path: pathlib.Path,
        monkeypatch: pytest.MonkeyPatch,
    ) -> None:
        lesson = tmp_path / "21-sample.md"
        lesson.write_text("Call `arr.sort()` first.\n", encoding="utf-8")
        monkeypatch.setattr(asciimath, "ROOT", tmp_path)
        monkeypatch.setattr(sys, "argv", ["asciimath", "--glob", "21-*.md", "--apply"])

        assert asciimath.main() == 0
        assert lesson.read_text(encoding="utf-8") == "Call `arr.sort()` first.\n"
