"""Measure empirical complexity: see O(n) vs O(n^2) with your own eyes.

Run:
    python -m dsa.bench
"""

from __future__ import annotations

import time
from collections.abc import Callable


def measure(
    fn: Callable, make_input: Callable[[int], tuple], sizes: list[int], repeats: int = 3
) -> list[tuple[int, float]]:
    """Time `fn` across input sizes. Returns [(n, seconds), ...]."""
    results = []
    for n in sizes:
        best = float("inf")
        for _ in range(repeats):
            args = make_input(n)
            start = time.perf_counter()
            fn(*args)
            best = min(best, time.perf_counter() - start)
        results.append((n, best))
    return results


def report(name: str, results: list[tuple[int, float]]) -> None:
    print(f"\n{name}")
    print(f"  {'n':>10}  {'seconds':>12}  {'ratio':>8}  {'implies':>12}")
    print("  " + "-" * 48)
    prev_n = prev_t = None
    for n, t in results:
        if prev_t and prev_t > 0 and prev_n:
            size_ratio = n / prev_n
            time_ratio = t / prev_t
            # time_ratio ~= size_ratio^k  ->  k = log(time)/log(size)
            k = (
                (time_ratio ** (1 / 1))
                if size_ratio == 1
                else (
                    __import__("math").log(time_ratio) / __import__("math").log(size_ratio)
                    if time_ratio > 0
                    else 0
                )
            )
            if t < 1e-3 and time_ratio > 1.3:
                # Sub-millisecond timings are dominated by OS jitter, not by
                # the algorithm. Refuse to guess rather than print a wrong label.
                implies = "(too fast)"
            else:
                implies = (
                    "O(1)"
                    if k < 0.3
                    else "O(log n)"
                    if k < 0.6
                    else "O(n)"
                    if k < 1.3
                    else "O(n log n)"
                    if k < 1.6
                    else "O(n^2)"
                    if k < 2.4
                    else "worse"
                )
            print(f"  {n:>10}  {t:>12.6f}  {time_ratio:>8.2f}  {implies:>12}")
        else:
            print(f"  {n:>10}  {t:>12.6f}  {'-':>8}  {'-':>12}")
        prev_n, prev_t = n, t


# ---------------------------------------------------------------- demos ----
def two_sum_bruteforce(nums: list[int], target: int) -> list[int]:
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]
    return []


def two_sum_hashmap(nums: list[int], target: int) -> list[int]:
    seen: dict[int, int] = {}
    for i, x in enumerate(nums):
        if target - x in seen:
            return [seen[target - x], i]
        seen[x] = i
    return []


def contains_slow(nums: list[int], needle: int) -> bool:
    return needle in nums  # O(n) scan


def contains_fast(nums_set: set[int], needle: int) -> bool:
    return needle in nums_set  # O(1) hash lookup


def build_string_slow(n: int) -> str:
    s = ""
    for _ in range(n):
        s += "x"  # O(n) copy each time -> O(n^2)
    return s


def build_string_fast(n: int) -> str:
    parts = []
    for _ in range(n):
        parts.append("x")
    return "".join(parts)  # O(n)


def main() -> None:
    print("=" * 60)
    print("EMPIRICAL COMPLEXITY -- watch the ratio column")
    print("=" * 60)
    print("\nWhen n doubles:  O(n) time doubles (~2.0)")
    print("                 O(n log n) slightly more than doubles (~2.2)")
    print("                 O(n^2) quadruples (~4.0)")

    sizes = [1000, 2000, 4000, 8000]

    # Worst case for two-sum: answer is the last pair.
    def make_two_sum(n: int) -> tuple[list[int], int]:
        nums = list(range(n))
        return (nums, nums[-1] + nums[-2])

    report("Two Sum -- brute force O(n^2)", measure(two_sum_bruteforce, make_two_sum, sizes))
    report(
        "Two Sum -- hash map O(n)",
        measure(two_sum_hashmap, make_two_sum, [10_000, 20_000, 40_000, 80_000]),
    )

    def make_list_lookup(n: int) -> tuple[list[int], int]:
        nums = list(range(n))
        return (nums, -1)  # worst case: not present

    def make_set_lookup(n: int) -> tuple[set[int], int]:
        return (set(range(n)), -1)

    report(
        "`x in list` -- O(n)", measure(contains_slow, make_list_lookup, [100_000, 200_000, 400_000])
    )
    report(
        "`x in set` -- O(1)", measure(contains_fast, make_set_lookup, [100_000, 200_000, 400_000])
    )

    report(
        "string += in a loop -- O(n^2)",
        measure(build_string_slow, lambda n: (n,), [20_000, 40_000, 80_000]),
    )
    report(
        "''.join(list) -- O(n)",
        measure(build_string_fast, lambda n: (n,), [200_000, 400_000, 800_000]),
    )

    print("\nNote: CPython optimises some in-place string concatenation, so the")
    print("string demo may look better than O(n^2). The list/join version is")
    print("still the one to write -- it is O(n) by construction, not by luck.\n")


if __name__ == "__main__":
    main()
