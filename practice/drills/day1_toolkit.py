"""DAY 1 DRILL - the Python DSA toolkit, by hand.

    python -m drills.day1_toolkit

25 exercises covering everything in 01-foundations.md section 1.5.
Each one is a single expression or a few lines. Replace the
`raise NotImplementedError` with your answer, save, and re-run.

RULES
  - No autocomplete. Turn Copilot off.
  - Do not look at 01-foundations.md until you are stuck on one for 60 seconds.
  - Type it out. Do not copy-paste. The point is muscle memory, not correctness.
  - Re-run after every 2-3 exercises so you get fast feedback.

Target: all 25 green in under 60 minutes.
"""

import bisect
import heapq
from collections import Counter, defaultdict, deque

TODO = NotImplementedError("fill this in")


# ---------------------------------------------------------------------------
# DICTS
# ---------------------------------------------------------------------------
def ex01_count_chars(s: str) -> dict:
    """Return a dict of character -> count, using collections.Counter.
    'aabbb' -> {'a': 2, 'b': 3}"""
    raise TODO


def ex02_safe_get(d: dict, key) -> int:
    """Return d[key], or 0 if the key is missing. One line, no if statement."""
    raise TODO


def ex03_group_by_length(words: list[str]) -> dict:
    """Group words by their length using a defaultdict(list).
    ['a','bb','cc'] -> {1: ['a'], 2: ['bb','cc']}"""
    raise TODO


def ex04_build_graph(edges: list[tuple]) -> dict:
    """Build an UNDIRECTED adjacency list with defaultdict(list).
    [(1,2),(1,3)] -> {1: [2,3], 2: [1], 3: [1]}"""
    raise TODO


def ex05_top_two(nums: list[int]) -> list:
    """The two most common values, most frequent first, using Counter.
    [1,1,1,2,2,3] -> [1, 2]"""
    raise TODO


def ex06_is_anagram(s: str, t: str) -> bool:
    """True if s and t are anagrams. ONE line using Counter."""
    raise TODO


# ---------------------------------------------------------------------------
# SORTING
# ---------------------------------------------------------------------------
def ex07_sort_by_second(pairs: list[tuple]) -> list:
    """Sort by the second element, ascending. [(1,3),(2,1)] -> [(2,1),(1,3)]"""
    raise TODO


def ex08_sort_two_keys(pairs: list[tuple]) -> list:
    """Sort by second element DESCENDING, then first element ASCENDING.
    [(2,5),(1,5),(3,9)] -> [(3,9),(1,5),(2,5)]"""
    raise TODO


def ex09_sort_by_abs(nums: list[int]) -> list:
    """Sort by absolute value. [-5,2,-1] -> [-1,2,-5]"""
    raise TODO


def ex10_anagram_key(word: str) -> str:
    """Canonical anagram key: the sorted letters as a string.
    'cab' -> 'abc'"""
    raise TODO


# ---------------------------------------------------------------------------
# STRINGS
# ---------------------------------------------------------------------------
def ex11_letter_index(c: str) -> int:
    """0-based alphabet index of a lowercase letter. 'a'->0, 'z'->25"""
    raise TODO


def ex12_reverse_words(s: str) -> str:
    """Reverse the word order, collapsing extra whitespace.
    '  the sky  is blue ' -> 'blue is sky the'"""
    raise TODO


def ex13_keep_alnum_lower(s: str) -> str:
    """Keep only alphanumeric characters, lowercased.
    'A man, a plan!' -> 'amanaplan'"""
    raise TODO


def ex14_build_string(chars: list[str]) -> str:
    """Join a list of characters into one string. Use the O(n) way."""
    raise TODO


def ex15_char_counts_array(s: str) -> list:
    """A 26-length list of lowercase letter counts.
    'abca' -> [2,1,1,0,0,...] (length 26)"""
    raise TODO


# ---------------------------------------------------------------------------
# LISTS, GRIDS, ITERATION
# ---------------------------------------------------------------------------
def ex16_make_grid(rows: int, cols: int) -> list:
    """A rows x cols grid of zeros. Must NOT alias rows -
    setting grid[0][0] = 1 must not change any other row."""
    raise TODO


def ex17_neighbours(r: int, c: int, rows: int, cols: int) -> list:
    """The in-bounds 4-directional neighbours of (r, c),
    in the order right, down, left, up. Return a list of (r, c) tuples."""
    raise TODO


def ex18_indices_of(nums: list[int], target: int) -> list:
    """All indices where nums[i] == target, using enumerate.
    ([1,2,1], 1) -> [0, 2]"""
    raise TODO


def ex19_pairwise_sums(a: list[int], b: list[int]) -> list:
    """Element-wise sums of two equal-length lists, using zip.
    ([1,2],[10,20]) -> [11, 22]"""
    raise TODO


def ex20_transpose(matrix: list[list]) -> list:
    """Transpose a matrix. [[1,2],[3,4]] -> [[1,3],[2,4]]
    Return a list of LISTS, not tuples."""
    raise TODO


def ex21_any_negative(nums: list[int]) -> bool:
    """True if any element is negative. One line, use any()."""
    raise TODO


# ---------------------------------------------------------------------------
# DEQUE, HEAP, BISECT
# ---------------------------------------------------------------------------
def ex22_rotate_left(nums: list[int], k: int) -> list:
    """Rotate left by k using a deque. ([1,2,3,4], 1) -> [2,3,4,1]
    Return a plain list."""
    raise TODO


def ex23_k_smallest(nums: list[int], k: int) -> list:
    """The k smallest values, sorted ascending, using heapq."""
    raise TODO


def ex24_k_largest(nums: list[int], k: int) -> list:
    """The k largest values, sorted DESCENDING, using heapq."""
    raise TODO


def ex25_insert_position(sorted_nums: list[int], x: int) -> int:
    """Leftmost index where x could be inserted keeping the list sorted.
    Use the bisect module. ([1,3,3,5], 3) -> 1"""
    raise TODO


# ===========================================================================
# RUNNER - do not edit below this line
# ===========================================================================
CASES = [
    ("ex01 Counter",            lambda: ex01_count_chars("aabbb"),                 {"a": 2, "b": 3}),
    ("ex02 dict.get default",   lambda: ex02_safe_get({"a": 5}, "z"),              0),
    ("ex03 defaultdict(list)",  lambda: dict(ex03_group_by_length(["a", "bb", "cc"])), {1: ["a"], 2: ["bb", "cc"]}),
    ("ex04 adjacency list",     lambda: {k: sorted(v) for k, v in ex04_build_graph([(1, 2), (1, 3)]).items()}, {1: [2, 3], 2: [1], 3: [1]}),
    ("ex05 most_common",        lambda: ex05_top_two([1, 1, 1, 2, 2, 3]),          [1, 2]),
    ("ex06 anagram one-liner",  lambda: (ex06_is_anagram("anagram", "nagaram"), ex06_is_anagram("rat", "car")), (True, False)),
    ("ex07 sort key",           lambda: ex07_sort_by_second([(1, 3), (2, 1)]),     [(2, 1), (1, 3)]),
    ("ex08 sort two keys",      lambda: ex08_sort_two_keys([(2, 5), (1, 5), (3, 9)]), [(3, 9), (1, 5), (2, 5)]),
    ("ex09 sort by abs",        lambda: ex09_sort_by_abs([-5, 2, -1]),             [-1, 2, -5]),
    ("ex10 anagram key",        lambda: ex10_anagram_key("cab"),                   "abc"),
    ("ex11 ord/chr index",      lambda: (ex11_letter_index("a"), ex11_letter_index("z")), (0, 25)),
    ("ex12 reverse words",      lambda: ex12_reverse_words("  the sky  is blue "), "blue is sky the"),
    ("ex13 keep alnum",         lambda: ex13_keep_alnum_lower("A man, a plan!"),   "amanaplan"),
    ("ex14 join",               lambda: ex14_build_string(["a", "b", "c"]),        "abc"),
    ("ex15 26-count array",     lambda: ex15_char_counts_array("abca")[:4] + [len(ex15_char_counts_array("abca"))], [2, 1, 1, 0, 26]),
    ("ex16 grid no aliasing",   lambda: _grid_check(),                             True),
    ("ex17 neighbours",         lambda: ex17_neighbours(0, 0, 2, 2),               [(0, 1), (1, 0)]),
    ("ex18 enumerate",          lambda: ex18_indices_of([1, 2, 1], 1),             [0, 2]),
    ("ex19 zip",                lambda: ex19_pairwise_sums([1, 2], [10, 20]),      [11, 22]),
    ("ex20 transpose",          lambda: ex20_transpose([[1, 2], [3, 4]]),          [[1, 3], [2, 4]]),
    ("ex21 any()",              lambda: (ex21_any_negative([1, -1]), ex21_any_negative([1, 2])), (True, False)),
    ("ex22 deque rotate",       lambda: ex22_rotate_left([1, 2, 3, 4], 1),         [2, 3, 4, 1]),
    ("ex23 heapq k smallest",   lambda: ex23_k_smallest([5, 1, 9, 3], 2),          [1, 3]),
    ("ex24 heapq k largest",    lambda: ex24_k_largest([5, 1, 9, 3], 2),           [9, 5]),
    ("ex25 bisect",             lambda: ex25_insert_position([1, 3, 3, 5], 3),     1),
]


def _grid_check():
    g = ex16_make_grid(2, 3)
    if g != [[0, 0, 0], [0, 0, 0]]:
        return False
    g[0][0] = 1
    return g[1][0] == 0        # rows must be independent


def main() -> None:
    passed = todo = failed = 0
    print("=" * 66)
    print("DAY 1 DRILL - Python DSA toolkit")
    print("=" * 66)
    for name, fn, expected in CASES:
        try:
            got = fn()
        except NotImplementedError:
            print(f"  [ .. ] {name:<26} not attempted yet")
            todo += 1
            continue
        except Exception as e:
            print(f"  [FAIL] {name:<26} {type(e).__name__}: {e}")
            failed += 1
            continue
        if got == expected:
            print(f"  [ OK ] {name}")
            passed += 1
        else:
            print(f"  [FAIL] {name:<26} got {got!r}  expected {expected!r}")
            failed += 1

    total = len(CASES)
    print("-" * 66)
    print(f"  {passed}/{total} passing   {failed} wrong   {todo} not attempted")
    if passed == total:
        print("\n  All green. Toolkit drill complete - move on to the problems.\n")
    else:
        print("\n  Re-run after each fix:  python -m drills.day1_toolkit\n")


if __name__ == "__main__":
    main()
