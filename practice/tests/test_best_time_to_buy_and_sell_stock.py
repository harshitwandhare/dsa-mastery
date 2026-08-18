"""Tests for Best Time to Buy and Sell Stock."""

import pytest
from solutions.sliding_window.best_time_to_buy_and_sell_stock import solve


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
