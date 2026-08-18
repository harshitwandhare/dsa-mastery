"""Tests for Move Zeroes."""

import pytest
from solutions.two_pointers.move_zeroes import solve


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
