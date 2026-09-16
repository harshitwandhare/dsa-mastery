"""ASCII maths in inline code spans -> LaTeX, for the markdown sources.

The curriculum was written with maths in code spans: `Theta(n^2)`, `sum_{i=1}^{n}
1/i`, `T(n) = 2T(n/2) + Theta(n)`. That is readable as plain text and renders as
source code on the site, which is wrong for a course whose subject is
asymptotics. This converts the ones it fully understands into `$...$` so KaTeX
can set them.

The rule that keeps it safe: a span is converted only if **every** token in it is
recognized. One unknown token and the span is left exactly as it was, so the
worst case is that something stays monospace rather than becoming nonsense.

    python tools/asciimath.py                # dry run: what would change
    python tools/asciimath.py --apply        # rewrite the markdown files

Re-running is safe: a span that already holds `$` is treated as maths and left
alone, so the second run reports nothing to do.

`web/src/lib/__tests__/lesson-math-renders.test.ts` renders every lesson and
fails on a KaTeX error, which is what actually verifies the output.
"""

from __future__ import annotations

import argparse
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent

# Spans that are code, not maths, even though they look mathematical. Checked
# before anything else.
CODE_SPANS = {
    "O(1)?",
    "n",
    "m",
    "k",
    "i",
    "j",
    "x",
    "y",
    "=",
    "==",
    "!=",
    "<=",
    ">=",
    "//",
    "**",
    "%",
    "&",
    "|",
    "^",
    "~",
    "<<",
    ">>",
}

# Anything containing one of these is code or prose, never maths.
CODE_MARKERS = re.compile(
    r"""(
      \.[A-Za-z_]           # attribute access: A.length, arr.sort (not 2.1)
    | \w\(\)                # a call with no arguments
    | ["']                  # string literals
    | \#                    # comments
    | \bdef\b | \breturn\b | \bimport\b | \bclass\b | \blambda\b
    | \bself\b | \bNone\b | \bTrue\b | \bFalse\b | \bnull\b
    | -> \s*\w+\s*:         # type annotations
    | ::                    # slices
    | \{\}                  # empty dict
    | \*\*                  # Python exponentiation
    | \$                    # already maths, or shell
    )""",
    re.X,
)

GREEK = {
    "Theta": r"\Theta",
    "Omega": r"\Omega",
    "omega": r"\omega",
    "Delta": r"\Delta",
    "delta": r"\delta",
    "alpha": r"\alpha",
    "beta": r"\beta",
    "gamma": r"\gamma",
    "epsilon": r"\varepsilon",
    "eps": r"\varepsilon",
    "phi": r"\varphi",
    "mu": r"\mu",
    "pi": r"\pi",
    "sigma": r"\sigma",
}

# Multi-letter operators that must be upright, not italic.
OPERATORS = ["log", "lg", "ln", "lim", "max", "min", "exp", "gcd", "det", "Pr"]

RELATIONS = [
    ("<->", r" \leftrightarrow "),
    ("<=", r" \le "),
    (">=", r" \ge "),
    ("!=", r" \ne "),
    ("->", r" \to "),
    ("...", r" \dots "),
]

# Every token the converter understands. A span containing anything else is
# left alone.
KNOWN_TOKEN = re.compile(
    r"""^(
      \\[A-Za-z]+           # a macro we already emitted
    | [A-Za-z]              # a single-letter variable
    | \d+(\.\d+)?           # a number
    | [+\-*/=<>(){}\[\],.!|^_ ]
    | \\\{ | \\\}
    )$""",
    re.X,
)


def _balanced(text: str, start: int) -> int:
    """Index just past the parenthesis group opening at `start`, or -1."""
    depth = 0
    for i in range(start, len(text)):
        if text[i] == "(":
            depth += 1
        elif text[i] == ")":
            depth -= 1
            if depth == 0:
                return i + 1
    return -1


def _wrap_calls(text: str, name: str, open_tex: str, close_tex: str) -> str:
    """ceil(x) -> \\lceil x \\rceil, and the same shape for floor."""
    out = text
    while True:
        m = re.search(rf"\b{name}\s*\(", out)
        if not m:
            return out
        end = _balanced(out, m.end() - 1)
        if end < 0:
            return out
        inner = out[m.end() : end - 1]
        out = out[: m.start()] + f"{open_tex} {inner} {close_tex}" + out[end:]


def _superscripts(text: str) -> str:
    """x^(a b) -> x^{a b}; x^2.1 -> x^{2.1}; x^n is already fine."""
    out = text
    while True:
        m = re.search(r"\^\(", out)
        if not m:
            break
        end = _balanced(out, m.end() - 1)
        if end < 0:
            break
        out = out[: m.start()] + "^{" + out[m.end() : end - 1] + "}" + out[end:]
    # multi-character exponents that were not parenthesised
    out = re.sub(r"\^(\d+\.\d+)", r"^{\1}", out)
    out = re.sub(r"\^(\d{2,})", r"^{\1}", out)
    # A word exponent, with the operand it takes: n^lg 7, 2^min(m,n). Without
    # the braces these become \lg and \min with nothing to act on, and KaTeX
    # rejects the whole expression.
    out = re.sub(r"\^([A-Za-z]+(?:\([^()]*\)|\s+\w+)?)", r"^{\1}", out)
    return out


def to_tex(src: str) -> str | None:
    """Convert one ASCII maths span to LaTeX, or None if not fully understood."""
    if src.strip() in CODE_SPANS or CODE_MARKERS.search(src):
        return None

    out = src

    # Set braces have to reach maths mode as \{ \}, but the braces this function
    # *adds* for sub- and superscript groups must stay bare. Park the literal
    # ones now, restore them last, and everything in between can add braces
    # freely. Doing this with a lookbehind instead silently ate the closing
    # brace of every ^{...} group.
    out = re.sub(r"(?<![\^_])\{", "\x01", out)
    out = out.replace("}", "\x02") if "\x01" in out else out

    # The iterated logarithm, before the multiplication rule claims its star.
    out = re.sub(r"\b(lg|log)\s*\*", "\\\\\\1^{\x03}", out)

    # sqrt first: it takes an argument that later rules would mangle.
    out = re.sub(r"\bsqrt\s*\(([^()]*)\)", r"\\sqrt{\1}", out)
    out = re.sub(r"\bsqrt\s+(\w+)", r"\\sqrt{\1}", out)

    out = _wrap_calls(out, "ceil", r"\lceil", r"\rceil")
    out = _wrap_calls(out, "floor", r"\lfloor", r"\rfloor")

    out = _superscripts(out)

    # Big operators.
    # Not \bsum\b: the next character is usually "_", which is a word character,
    # so the trailing boundary never fires and the word is left bare.
    out = re.sub(r"(?<![A-Za-z\\])sum(?![A-Za-z])", r"\\sum", out)
    out = re.sub(r"(?<![A-Za-z\\])prod(?![A-Za-z])", r"\\prod", out)

    # Upright function names, longest first so "log" does not eat "lg".
    for name in sorted(OPERATORS, key=len, reverse=True):
        out = re.sub(rf"(?<![\\A-Za-z]){name}(?![A-Za-z])", rf"\\{name}", out)

    for name, tex in sorted(GREEK.items(), key=lambda kv: -len(kv[0])):
        out = re.sub(rf"(?<![\\A-Za-z]){name}(?![A-Za-z])", tex.replace("\\", "\\\\"), out)

    out = re.sub(r"\b(infinity|infty|inf)\b", r"\\infty", out)

    # n0, c1, c2 are subscripted constants throughout the definitions, and "c1"
    # set as c-then-1 rather than c-sub-1 is the tell of a fake maths font.
    out = re.sub(r"(?<![A-Za-z0-9\\])([A-Za-z])(\d)(?![A-Za-z0-9])", r"\1_\2", out)

    for plain, tex in RELATIONS:
        out = out.replace(plain, tex)

    # A lone "x" between groups is multiplication, not a variable.
    out = re.sub(r"(?<=\))\s+x\s+(?=\()", r" \\times ", out)
    out = out.replace("*", r" \cdot ")

    out = out.replace("\x03", "*")
    out = out.replace("\x01", r"\{").replace("\x02", r"\}")

    # A macro directly under ^ or _ has no argument and KaTeX rejects the whole
    # expression. The token gate cannot see this, because it only checks that
    # each token is one we know, not that the arity works out.
    if re.search(r"[\^_]\\[A-Za-z]", out):
        return None

    if not _all_tokens_known(out):
        return None
    return re.sub(r"\s{2,}", " ", out).strip()


def _all_tokens_known(tex: str) -> bool:
    """True when every token is one the converter emitted deliberately."""
    # Subscript and superscript groups are structural; check their contents.
    body = re.sub(r"[_^]\{([^{}]*)\}", r" \1 ", tex)
    # An escaped brace is one token; without this the backslash is read alone.
    pattern = r"\\[{}]|\\[A-Za-z]+|[A-Za-z]+|\d+(?:\.\d+)?|\S"
    for token in re.findall(pattern, body):
        if len(token) > 1 and not token.startswith("\\") and not token[0].isdigit():
            return False  # a bare multi-letter word: an identifier, not maths
        if not KNOWN_TOKEN.match(token):
            return False
    return True


FENCE = re.compile(r"^```.*?^```\s*$", re.S | re.M)


def convert_file(text: str) -> tuple[str, list[tuple[str, str]]]:
    """Rewrite the inline maths spans of one document."""
    changes: list[tuple[str, str]] = []
    pieces: list[str] = []
    last = 0
    for fence in FENCE.finditer(text):
        pieces.append(_convert_prose(text[last : fence.start()], changes))
        pieces.append(fence.group(0))
        last = fence.end()
    pieces.append(_convert_prose(text[last:], changes))
    return "".join(pieces), changes


def _convert_prose(chunk: str, changes: list[tuple[str, str]]) -> str:
    def replace(match: re.Match[str]) -> str:
        src = match.group(1)
        tex = to_tex(src)
        if tex is None:
            return match.group(0)
        changes.append((src, tex))
        return f"${tex}$"

    # Headings are navigation, not exposition. A heading is also the source of
    # its sidebar entry, and KaTeX emits the same expression three times over
    # (MathML, the raw TeX annotation, and the visual spans), which a plain
    # text extraction concatenates into nonsense. Leave them as code spans.
    lines = chunk.split("\n")
    out = [
        line if line.startswith("#") else re.sub(r"`([^`\n]+)`", replace, line) for line in lines
    ]
    return "\n".join(out)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--glob", default="2[1-9]-*.md")
    args = parser.parse_args()

    total_changed = 0
    total_left = 0
    for path in sorted(ROOT.glob(args.glob)):
        original = path.read_text(encoding="utf-8")
        updated, changes = convert_file(original)
        spans = len(re.findall(r"`[^`\n]+`", FENCE.sub("", original)))
        total_changed += len(changes)
        total_left += spans - len(changes)
        print(
            f"{path.name:34s} {len(changes):4d} converted, {spans - len(changes):4d} left as code"
        )
        if args.apply and changes:
            path.write_text(updated, encoding="utf-8")

    print(f"\n{total_changed} spans converted, {total_left} left as code")
    if not args.apply:
        print("(dry run; pass --apply to write)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
