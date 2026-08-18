"""Tests for Two Sum -- the model test file. Copy this shape."""

import pytest
from solutions.arrays_hashing.two_sum import two_sum, two_sum_bruteforce


@pytest.mark.parametrize("impl", [two_sum, two_sum_bruteforce])
class TestTwoSum:
    """Run every test against BOTH implementations -- brute force is the oracle."""

    def test_example_1(self, impl):
        assert impl([2, 7, 11, 15], 9) == [0, 1]

    def test_example_2(self, impl):
        assert impl([3, 2, 4], 6) == [1, 2]

    def test_duplicates(self, impl):
        """The element must not pair with itself."""
        assert impl([3, 3], 6) == [0, 1]

    def test_negatives(self, impl):
        assert impl([-3, 4, 3, 90], 0) == [0, 2]

    def test_no_answer(self, impl):
        assert impl([1, 2], 99) == []

    def test_minimum_size(self, impl):
        assert impl([1, 2], 3) == [0, 1]


def test_implementations_agree_on_random_input():
    """Property test: the fast version must match the obvious version."""
    import random

    for _ in range(200):
        nums = [random.randint(-50, 50) for _ in range(random.randint(2, 30))]
        target = random.randint(-100, 100)
        fast = two_sum(nums, target)
        slow = two_sum_bruteforce(nums, target)
        # Both may pick different valid pairs; compare validity, not identity.
        assert bool(fast) == bool(slow)
        if fast:
            i, j = fast
            assert i != j and nums[i] + nums[j] == target
