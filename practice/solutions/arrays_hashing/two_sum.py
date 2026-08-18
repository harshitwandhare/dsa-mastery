"""Two Sum -- the worked example. Read this, then use it as your model.

Link:        https://leetcode.com/problems/two-sum/
Topic:       arrays_hashing
Pattern:     hashing -- value -> index map, one pass
Difficulty:  easy

CONSTRAINTS
    2 <= n <= 10^4
    -10^9 <= nums[i] <= 10^9
    exactly one valid answer exists
    -> n = 10^4 means O(n^2) = 10^8 is borderline; O(n) is clearly intended.
    -> negatives allowed, so no counting-sort / index tricks.

APPROACH
    Brute force:  check every pair                 time O(n^2)  space O(1)
    Optimised:    remember what we have seen       time O(n)    space O(n)
    The waste being removed: re-scanning the whole array for each element's
    complement. A dict turns that O(n) search into an O(1) lookup.

KEY INSIGHT
    Walk once; for each x, ask whether target - x has already been seen.

WHAT I WOULD GET WRONG IN A MONTH
    Inserting into `seen` BEFORE the check, which lets an element pair with
    itself: nums=[3,2], target=6 would wrongly return [0,0].
"""

from dsa.helpers import show


def two_sum_bruteforce(nums: list[int], target: int) -> list[int]:
    """O(n^2) time, O(1) space. Always state this first in an interview."""
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]
    return []


def two_sum(nums: list[int], target: int) -> list[int]:
    """O(n) time, O(n) space."""
    seen: dict[int, int] = {}          # value -> index
    for i, x in enumerate(nums):
        need = target - x
        if need in seen:               # O(1) average
            return [seen[need], i]
        seen[x] = i                    # store AFTER checking
    return []                          # no pair found


if __name__ == "__main__":
    show("[2,7,11,15] target 9", two_sum([2, 7, 11, 15], 9))
    show("[3,2,4] target 6", two_sum([3, 2, 4], 6))
    show("[3,3] target 6", two_sum([3, 3], 6))
    show("no answer", two_sum([1, 2], 99))
    show("brute force agrees", two_sum_bruteforce([2, 7, 11, 15], 9))
