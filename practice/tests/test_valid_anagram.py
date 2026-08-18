"""Tests for Valid Anagram."""

import pytest
from solutions.arrays_hashing.valid_anagram import solve


def test_example_1():
    assert solve() == ...


def test_example_2():
    assert solve() == ...


def test_edge_empty():
    """Empty / minimal input -- name your edge cases explicitly."""
    assert solve() == ...


@pytest.mark.parametrize(
    "given,expected",
    [
        (..., ...),
        (..., ...),
    ],
)
def test_cases(given, expected):
    assert solve(given) == expected
