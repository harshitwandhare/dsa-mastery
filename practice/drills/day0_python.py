"""DAY 0 DRILL - Python from zero. 50 exercises.

    python -m drills.day0_python          # all 50
    python -m drills.day0_python 1        # just day 1's exercises
    python -m drills.day0_python 2        # just day 2, etc.

Pairs with 00-python-from-zero.md. Read a section, then do its exercises.

  Day 1 -> ex01-12   variables, types, numbers, strings, booleans
  Day 2 -> ex13-26   lists, tuples, sets, dicts
  Day 3 -> ex27-40   if/else, loops, functions, comprehensions
  Day 4 -> ex41-50   classes, errors

HOW TO USE
  1. Open this file in VS Code.
  2. Find the first exercise that says "not attempted yet".
  3. Replace `raise TODO` with your answer.
  4. Save, re-run, see it turn green.
  5. Repeat.

Every answer is 1-4 lines. If you are writing more than that, re-read the
section. Turn Copilot OFF. Type, do not paste.
"""

import sys

TODO = NotImplementedError("fill this in")


# ===========================================================================
# DAY 1 - variables, types, numbers, strings, booleans
# ===========================================================================
def ex01_add(a, b):
    """Return a plus b."""
    return a + b        # <-- SOLVED FOR YOU. This is what an answer looks like.
    #                       Every other exercise still says `raise TODO`.
    #                       Replace that line the same way.


def ex02_int_divide(a, b):
    """Return a divided by b, DROPPING any remainder, as a whole number.
    (7, 2) -> 3    not 3.5"""
    raise TODO


def ex03_remainder(a, b):
    """Return the remainder of a divided by b. (7, 2) -> 1"""
    raise TODO


def ex04_is_even(n):
    """Return True if n is even, else False. Use the remainder operator."""
    raise TODO


def ex05_to_int(s):
    """Convert the string s into a whole number. '42' -> 42"""
    raise TODO


def ex06_last_char(s):
    """Return the LAST character of s. 'hello' -> 'o'
    Use a negative index."""
    raise TODO


def ex07_first_three(s):
    """Return the first three characters. 'hello' -> 'hel'"""
    raise TODO


def ex08_reverse(s):
    """Return s reversed. 'hello' -> 'olleh'  (one slice, no loop)"""
    raise TODO


def ex09_shout(s):
    """Return s in UPPERCASE with surrounding whitespace removed.
    '  hi  ' -> 'HI'"""
    raise TODO


def ex10_greeting(name, count):
    """Return exactly: '<name> solved <count> problems'
    Use an f-string."""
    raise TODO


def ex11_between(x, lo, hi):
    """True if x is greater than lo AND less than hi.
    Write it as a single chained comparison."""
    raise TODO


def ex12_is_empty(s):
    """True if the string s is empty. Use truthiness, not len()."""
    raise TODO


# ===========================================================================
# DAY 2 - lists, tuples, sets, dicts
# ===========================================================================
def ex13_third_item(items):
    """Return the third item of the list."""
    raise TODO


def ex14_last_two(items):
    """Return the last two items as a list. [1,2,3,4] -> [3,4]"""
    raise TODO


def ex15_add_to_end(items, x):
    """Add x to the END of the list and return the list."""
    raise TODO


def ex16_sorted_copy(items):
    """Return a NEW sorted list. The original must stay unchanged."""
    raise TODO


def ex17_sort_by_length(words):
    """Return the words sorted shortest-first. ['ccc','a','bb'] -> ['a','bb','ccc']"""
    raise TODO


def ex18_real_copy(items):
    """Return a copy of the list such that changing the copy does NOT
    change the original."""
    raise TODO


def ex19_make_grid(rows, cols):
    """Return a rows x cols grid of zeros, where changing grid[0][0]
    does NOT change any other row."""
    raise TODO


def ex20_swap(a, b):
    """Return (b, a). One line, no temporary variable."""
    raise TODO


def ex21_unique(items):
    """Return a set of the unique values in the list."""
    raise TODO


def ex22_in_both(a, b):
    """Return a set of the values present in BOTH lists a and b."""
    raise TODO


def ex23_get_or_default(d, key):
    """Return d[key], or the string 'missing' if the key is not there.
    One line, no if statement."""
    raise TODO


def ex24_add_entry(d, key, value):
    """Put value into d under key, then return d."""
    raise TODO


def ex25_count_chars(s):
    """Return a dict of character -> how many times it appears.
    'hello' -> {'h':1,'e':1,'l':2,'o':1}
    Write the loop by hand using .get()."""
    raise TODO


def ex26_group_by_first_letter(words):
    """Return a dict of first letter -> list of words starting with it.
    ['apple','avocado','banana'] -> {'a':['apple','avocado'], 'b':['banana']}
    Write it by hand with an if-not-in check."""
    raise TODO


# ===========================================================================
# DAY 3 - control flow, loops, functions, comprehensions
# ===========================================================================
def ex27_grade(score):
    """90+ -> 'A', 80-89 -> 'B', 70-79 -> 'C', below 70 -> 'F'."""
    raise TODO


def ex28_bigger(a, b):
    """Return the larger of a and b. Use a one-line conditional expression."""
    raise TODO


def ex29_sum_to_n(n):
    """Return 1 + 2 + ... + n using a for loop and range."""
    raise TODO


def ex30_count_down(n):
    """Return a list counting down from n to 1. 3 -> [3,2,1]"""
    raise TODO


def ex31_index_of(items, target):
    """Return the index of the FIRST occurrence of target, or -1 if absent.
    Use enumerate and return from inside the loop."""
    raise TODO


def ex32_first_negative(nums):
    """Return the first negative number, or None if there isn't one."""
    raise TODO


def ex33_skip_negatives(nums):
    """Return a list of the non-negative numbers, using `continue`."""
    raise TODO


def ex34_stop_at_zero(nums):
    """Return the numbers before the first 0, using `break`.
    [1,2,0,3] -> [1,2]"""
    raise TODO


def ex35_pair_up(names, ages):
    """Return a list of (name, age) tuples, using zip."""
    raise TODO


def ex36_min_and_max(nums):
    """Return BOTH the smallest and largest as (smallest, largest)."""
    raise TODO


def ex37_greet(name, greeting="Hello"):
    """Return '<greeting>, <name>'. Note the default parameter."""
    raise TODO


def ex38_append_safe(item, items=None):
    """Append item to items and return it. If items is None, start a NEW
    empty list. (This is the mutable-default fix from section 0.11.)"""
    raise TODO


def ex39_squares(n):
    """Return [0, 1, 4, 9, ...] for range(n), using a list comprehension."""
    raise TODO


def ex40_evens_only(nums):
    """Return only the even numbers, using a comprehension with a filter."""
    raise TODO


# ===========================================================================
# DAY 4 - classes, errors
# ===========================================================================
class Dog:
    """Give Dog an __init__ that stores `name` and `age` on the object,
    and a method `speak()` returning '<name> says woof'."""
    pass        # replace this whole class body


class Counter2:
    """A counter starting at 0.
      .increment()  adds 1
      .value        the current count
    """
    pass        # replace this whole class body


def ex43_make_node():
    """Return a ListNode whose val is 1 and whose next is a ListNode with
    val 2. Use the ListNode class imported at the bottom of this file."""
    raise TODO


def ex44_walk_list(head):
    """Given the head of a linked list, return a list of all its values.
    Follow .next until it is None."""
    raise TODO


def ex45_safe_int(s):
    """Return int(s), or 0 if s cannot be converted. Use try/except."""
    raise TODO


def ex46_safe_divide(a, b):
    """Return a / b, or None if b is 0. Use try/except."""
    raise TODO


def ex47_validate_age(age):
    """If age is negative, raise a ValueError with the message
    'age cannot be negative'. Otherwise return age."""
    raise TODO


def ex48_error_name(fn):
    """Call fn() and return the NAME of the exception it raises, as a string,
    e.g. 'KeyError'. Return 'no error' if it does not raise.
    Hint: type(e).__name__"""
    raise TODO


def ex49_sum_of_squares(n):
    """Return the sum of squares from 0 to n-1. Combine sum() with a
    generator or comprehension."""
    raise TODO


def ex50_word_lengths(words):
    """Return a dict of word -> its length, using a dict comprehension."""
    raise TODO


# ===========================================================================
# RUNNER - do not edit below this line
# ===========================================================================
from dsa.helpers import ListNode  # noqa: E402


def _dog_check():
    if Dog.__init__ is object.__init__:
        raise NotImplementedError
    d = Dog("Rex", 3)
    return (d.name, d.age, d.speak())


def _counter_check():
    if not hasattr(Counter2, "increment"):
        raise NotImplementedError
    c = Counter2()
    c.increment()
    c.increment()
    return c.value


def _copy_check():
    original = [1, 2, 3]
    copy = ex18_real_copy(original)
    copy.append(4)
    return len(original)


def _grid_check():
    g = ex19_make_grid(2, 3)
    if g != [[0, 0, 0], [0, 0, 0]]:
        return False
    g[0][0] = 1
    return g[1][0] == 0


def _sorted_copy_check():
    original = [3, 1, 2]
    result = ex16_sorted_copy(original)
    return (result, original)


def _node_check():
    n = ex43_make_node()
    return (n.val, n.next.val, n.next.next)


CASES = [
    # (day, label, callable, expected)
    (1, "ex01 add",             lambda: ex01_add(2, 3), 5),
    (1, "ex02 floor divide",    lambda: ex02_int_divide(7, 2), 3),
    (1, "ex03 remainder",       lambda: ex03_remainder(7, 2), 1),
    (1, "ex04 is_even",         lambda: (ex04_is_even(4), ex04_is_even(7)), (True, False)),
    (1, "ex05 str to int",      lambda: ex05_to_int("42"), 42),
    (1, "ex06 last char",       lambda: ex06_last_char("hello"), "o"),
    (1, "ex07 first three",     lambda: ex07_first_three("hello"), "hel"),
    (1, "ex08 reverse",         lambda: ex08_reverse("hello"), "olleh"),
    (1, "ex09 strip + upper",   lambda: ex09_shout("  hi  "), "HI"),
    (1, "ex10 f-string",        lambda: ex10_greeting("Harshit", 3), "Harshit solved 3 problems"),
    (1, "ex11 chained compare", lambda: (ex11_between(5, 1, 10), ex11_between(50, 1, 10)), (True, False)),
    (1, "ex12 truthiness",      lambda: (ex12_is_empty(""), ex12_is_empty("a")), (True, False)),

    (2, "ex13 index",           lambda: ex13_third_item([10, 20, 30, 40]), 30),
    (2, "ex14 slice from end",  lambda: ex14_last_two([1, 2, 3, 4]), [3, 4]),
    (2, "ex15 append",          lambda: ex15_add_to_end([1, 2], 3), [1, 2, 3]),
    (2, "ex16 sorted() copy",   _sorted_copy_check, ([1, 2, 3], [3, 1, 2])),
    (2, "ex17 sort by len",     lambda: ex17_sort_by_length(["ccc", "a", "bb"]), ["a", "bb", "ccc"]),
    (2, "ex18 real copy",       _copy_check, 3),
    (2, "ex19 grid no alias",   _grid_check, True),
    (2, "ex20 swap",            lambda: ex20_swap(1, 2), (2, 1)),
    (2, "ex21 unique set",      lambda: ex21_unique([1, 1, 2, 3]), {1, 2, 3}),
    (2, "ex22 intersection",    lambda: ex22_in_both([1, 2, 3], [2, 3, 4]), {2, 3}),
    (2, "ex23 dict.get",        lambda: ex23_get_or_default({"a": 1}, "z"), "missing"),
    (2, "ex24 dict set",        lambda: ex24_add_entry({}, "a", 1), {"a": 1}),
    (2, "ex25 count chars",     lambda: ex25_count_chars("hello"), {"h": 1, "e": 1, "l": 2, "o": 1}),
    (2, "ex26 group by letter", lambda: ex26_group_by_first_letter(["apple", "avocado", "banana"]),
                                {"a": ["apple", "avocado"], "b": ["banana"]}),

    (3, "ex27 if/elif/else",    lambda: (ex27_grade(95), ex27_grade(85), ex27_grade(75), ex27_grade(20)),
                                ("A", "B", "C", "F")),
    (3, "ex28 ternary",         lambda: ex28_bigger(3, 9), 9),
    (3, "ex29 range sum",       lambda: ex29_sum_to_n(5), 15),
    (3, "ex30 reverse range",   lambda: ex30_count_down(3), [3, 2, 1]),
    (3, "ex31 enumerate",       lambda: (ex31_index_of([5, 6, 7], 6), ex31_index_of([5], 9)), (1, -1)),
    (3, "ex32 return None",     lambda: (ex32_first_negative([1, -2, -3]), ex32_first_negative([1, 2])), (-2, None)),
    (3, "ex33 continue",        lambda: ex33_skip_negatives([1, -2, 3]), [1, 3]),
    (3, "ex34 break",           lambda: ex34_stop_at_zero([1, 2, 0, 3]), [1, 2]),
    (3, "ex35 zip",             lambda: ex35_pair_up(["a", "b"], [1, 2]), [("a", 1), ("b", 2)]),
    (3, "ex36 return two",      lambda: ex36_min_and_max([3, 1, 4]), (1, 4)),
    (3, "ex37 default param",   lambda: (ex37_greet("A"), ex37_greet("A", "Hi")), ("Hello, A", "Hi, A")),
    (3, "ex38 mutable default", lambda: (ex38_append_safe(1), ex38_append_safe(2)), ([1], [2])),
    (3, "ex39 comprehension",   lambda: ex39_squares(4), [0, 1, 4, 9]),
    (3, "ex40 filter",          lambda: ex40_evens_only([1, 2, 3, 4]), [2, 4]),

    (4, "ex41 class Dog",       _dog_check, ("Rex", 3, "Rex says woof")),
    (4, "ex42 class Counter",   _counter_check, 2),
    (4, "ex43 build a node",    _node_check, (1, 2, None)),
    (4, "ex44 walk a list",     lambda: ex44_walk_list(ListNode(1, ListNode(2, ListNode(3)))), [1, 2, 3]),
    (4, "ex45 try/except",      lambda: (ex45_safe_int("42"), ex45_safe_int("abc")), (42, 0)),
    (4, "ex46 catch div zero",  lambda: (ex46_safe_divide(6, 2), ex46_safe_divide(1, 0)), (3.0, None)),
    (4, "ex47 raise",           lambda: _raise_check(), ("ValueError", "age cannot be negative", 5)),
    (4, "ex48 exception name",  lambda: (ex48_error_name(lambda: {}["x"]), ex48_error_name(lambda: 1)),
                                ("KeyError", "no error")),
    (4, "ex49 sum + genexp",    lambda: ex49_sum_of_squares(4), 14),
    (4, "ex50 dict comp",       lambda: ex50_word_lengths(["a", "bb"]), {"a": 1, "bb": 2}),
]


def _raise_check():
    try:
        ex47_validate_age(-1)
        return ("no error", "", None)
    except ValueError as e:
        return (type(e).__name__, str(e), ex47_validate_age(5))


def main() -> None:
    only_day = None
    if len(sys.argv) > 1:
        try:
            only_day = int(sys.argv[1])
        except ValueError:
            pass

    cases = [c for c in CASES if only_day is None or c[0] == only_day]
    passed = todo = failed = 0
    current_day = None

    print("=" * 68)
    title = "DAY 0 DRILL - Python from zero"
    if only_day:
        title += f"  (day {only_day} only)"
    print(title)
    print("=" * 68)

    for day, name, fn, expected in cases:
        if day != current_day:
            headers = {1: "variables, types, numbers, strings, booleans",
                       2: "lists, tuples, sets, dicts",
                       3: "control flow, loops, functions, comprehensions",
                       4: "classes, errors"}
            print(f"\n  -- Day {day}: {headers[day]} --")
            current_day = day
        try:
            got = fn()
        except NotImplementedError:
            print(f"  [ .. ] {name:<24} not attempted yet")
            todo += 1
            continue
        except Exception as e:
            print(f"  [FAIL] {name:<24} {type(e).__name__}: {e}")
            failed += 1
            continue
        if got == expected:
            print(f"  [ OK ] {name}")
            passed += 1
        else:
            print(f"  [FAIL] {name:<24} got {got!r}")
            print(f"         {'':<24} expected {expected!r}")
            failed += 1

    total = len(cases)
    print("\n" + "-" * 68)
    print(f"  {passed}/{total} passing   {failed} wrong   {todo} not attempted")
    if passed == total:
        print("\n  All green. Move on to the next day, or to 01-foundations.md.\n")
    else:
        nxt = "python -m drills.day0_python" + (f" {only_day}" if only_day else "")
        print(f"\n  Fix one, then re-run:  {nxt}\n")


if __name__ == "__main__":
    main()
