# 00 — Python From Zero

**Days 1–4, before [01-foundations](01-foundations.md).** This file assumes you have never written a line of Python. Everything after it assumes you have read this one.

It is not a full Python course. It is exactly the Python you need to write algorithms and backend code, and nothing else.

---

## 0.1 Running Python

Two ways. You need both.

**The REPL** — an interactive prompt. Type an expression, press Enter, see the answer immediately. This is where you experiment.

```bash
python
```

```
>>> 2 + 2
4
>>> "hello".upper()
'HELLO'
>>> exit()
```

The REPL prints the value of whatever you type. That's why `2 + 2` shows `4` without you asking.

**A script** — a `.py` file you run start to finish. This is where real work lives.

```bash
python myfile.py
```

In a script, nothing prints unless you say `print(...)`. That difference catches everyone once.

```python
2 + 2              # in a script: computes 4, throws it away, shows nothing
print(2 + 2)       # shows 4
```

**Comments** start with `#`. Python ignores the rest of the line. Use them to explain *why*, not *what*.

```python
x = 86400        # seconds in a day
```

---

## 0.2 Variables and types

A variable is a name pointing at a value. No declaration keyword, no type annotation required.

```python
name = "Harshit"
age = 22
height = 5.9
is_student = True
```

`=` means **assign**, not "equals". `x = 5` says "make `x` point at 5." To *test* equality you use `==`, which is a different thing entirely and a classic beginner bug.

Python is **dynamically typed** — a variable can point at anything, and can change:

```python
x = 5          # x is an int
x = "five"     # now x is a str. Legal, though usually a bad idea.
```

Check a type with `type()`:

```python
type(5)          # <class 'int'>
type(5.0)        # <class 'float'>
type("5")        # <class 'str'>
type(True)       # <class 'bool'>
type([1, 2])     # <class 'list'>
type(None)       # <class 'NoneType'>
```

**The core types you'll use constantly:**

| Type | Example | What it's for |
|---|---|---|
| `int` | `42`, `-7`, `0` | whole numbers — array indices, counts |
| `float` | `3.14`, `-0.5` | decimals — averages, distances |
| `str` | `"hello"` | text |
| `bool` | `True`, `False` | conditions (capital T and F — `true` is an error) |
| `list` | `[1, 2, 3]` | ordered, changeable sequence |
| `tuple` | `(1, 2)` | ordered, **un**changeable sequence |
| `dict` | `{"a": 1}` | key → value lookup |
| `set` | `{1, 2, 3}` | unordered unique values |
| `None` | `None` | "no value" — a real value meaning absence |

**Naming rules:** letters, digits, underscores; can't start with a digit; case-sensitive. Python convention is `snake_case` for variables and functions, `PascalCase` for classes, `SCREAMING_CASE` for constants.

```python
total_count = 0        # good
totalCount = 0         # works, but not Python style
2fast = 0              # SyntaxError
```

**Converting between types:**

```python
int("42")        # 42     — string to int
int(3.9)         # 3      — TRUNCATES, does not round
str(42)          # "42"
float("3.14")    # 3.14
bool(0)          # False
list("abc")      # ['a', 'b', 'c']
```

`int("hello")` raises a `ValueError`. Conversion only works when the content makes sense.

---

## 0.3 Numbers and operators

```python
7 + 3        # 10   addition
7 - 3        # 4    subtraction
7 * 3        # 21   multiplication
7 / 3        # 2.333...  TRUE division — always gives a float
7 // 3       # 2    FLOOR division — drops the remainder, gives an int
7 % 3        # 1    modulo — the REMAINDER
7 ** 3       # 343  exponent (7 cubed)
```

**`//` and `%` matter enormously in algorithms.** Learn them properly.

`//` is how you find a midpoint: `mid = (lo + hi) // 2`. You want an integer index, not 3.5.

`%` is how you detect divisibility and how you wrap around:

```python
n % 2 == 0           # is n even?
n % 3 == 0           # is n divisible by 3?
(i + 1) % len(arr)   # next index, wrapping to 0 at the end — circular arrays
hour % 12            # clock arithmetic
```

**A trap worth knowing now:** `//` rounds toward negative infinity, not toward zero.

```python
7 // 2       #  3
-7 // 2      # -4    ← not -3
int(-7 / 2)  # -3    ← truncates toward zero
```

Both behaviours are correct; they're just different. Know which one your problem wants.

**Shorthand assignment:**

```python
x = 5
x += 3       # same as x = x + 3   → 8
x -= 2       # 6
x *= 2       # 12
x //= 5      # 2
```

Python has **no `++`**. Use `x += 1`.

**Useful built-ins:**

```python
abs(-5)              # 5
min(3, 7, 2)         # 2
max([3, 7, 2])       # 7   — works on a list too
sum([1, 2, 3])       # 6
round(3.7)           # 4
round(3.14159, 2)    # 3.14
divmod(17, 5)        # (3, 2)  — quotient and remainder together
```

**Integers in Python have no size limit.** `2 ** 1000` just works. In Java or C++ that overflows. Mention this in interviews when a problem says "assume 32-bit."

---

## 0.4 Strings

Text. Single or double quotes, your choice — be consistent.

```python
s = "hello world"
```

**Indexing** — position, starting at 0. Negative counts from the end.

```python
s[0]      # 'h'    first
s[4]      # 'o'    fifth
s[-1]     # 'd'    LAST — you'll use this constantly
s[-2]     # 'l'    second to last
```

**Slicing** — `s[start:stop]`, where `stop` is **excluded**.

```python
s[0:5]      # 'hello'   indices 0,1,2,3,4 — NOT 5
s[:5]       # 'hello'   omit start = from the beginning
s[6:]       # 'world'   omit stop = to the end
s[:]        # whole thing (a copy)
s[::2]      # 'hlowrd'  every 2nd character
s[::-1]     # 'dlrow olleh'  REVERSED — memorise this one
```

The "stop is excluded" rule is universal in Python (slices, `range`, everything). It feels wrong for a week, then feels obvious forever. The payoff: `len(s[a:b]) == b - a`.

**Common methods:**

```python
s.upper()               # 'HELLO WORLD'
s.lower()
s.strip()               # remove whitespace from both ends
s.split()               # ['hello', 'world']  — splits on whitespace
"a,b,c".split(",")      # ['a', 'b', 'c']
"-".join(["a","b"])     # 'a-b'   — the REVERSE of split
s.replace("l", "L")     # 'heLLo worLd'
s.startswith("hello")   # True
s.find("world")         # 6   — index, or -1 if absent
s.count("l")            # 3
len(s)                  # 11
"lo" in s               # True  — substring check
```

**Character tests** — used constantly in parsing problems:

```python
"a".isalpha()      # True   letter?
"1".isdigit()      # True   digit?
"a1".isalnum()     # True   letter or digit?
" ".isspace()      # True
"a".islower()      # True
```

**Characters and numbers:**

```python
ord('a')            # 97    character → its number
chr(97)             # 'a'   number → character
ord('c') - ord('a') # 2     letter → 0-based alphabet index
```

That last line is the standard trick for "count the letters" problems: it maps `a-z` onto `0-25` so you can use a 26-slot list.

**Strings are immutable.** You cannot change one in place.

```python
s = "hello"
s[0] = "H"          # TypeError!
s = "H" + s[1:]     # this works — it makes a NEW string
```

To modify heavily, convert to a list, edit, join back:

```python
chars = list("hello")
chars[0] = "H"
s = "".join(chars)      # 'Hello'
```

**f-strings** — the modern way to build strings with values in them:

```python
name = "Harshit"
count = 3
print(f"{name} solved {count} problems")     # Harshit solved 3 problems
print(f"{count * 2}")                        # expressions work inside
print(f"{3.14159:.2f}")                      # 3.14 — 2 decimal places
```

The `f` before the quote is required. Without it you get the literal text `{name}`.

---

## 0.5 Booleans and comparison

```python
5 == 5       # True    EQUAL — two equals signs
5 != 3       # True    not equal
5 > 3        # True
5 >= 5       # True
```

**Combining conditions:**

```python
x = 7
x > 5 and x < 10       # True   — both must hold
x > 5 or x > 100       # True   — at least one
not (x > 5)            # False  — flips it
5 < x < 10             # True   — chaining! Python allows this, most languages don't
```

**Truthiness** — every value is usable as a condition. These are "falsy":

```python
False, None, 0, 0.0, "", [], {}, set(), ()
```

Everything else is "truthy". So:

```python
if my_list:          # "if the list is not empty"
if not my_string:    # "if the string is empty"
if count:            # "if count is not zero"
```

This is idiomatic Python. Write `if my_list:`, not `if len(my_list) > 0:`.

**`==` vs `is`:** `==` compares *values*; `is` compares *identity* (same object in memory).

```python
a = [1, 2]
b = [1, 2]
a == b       # True   — same contents
a is b       # False  — two different list objects
```

**Only use `is` for `None`:** `if x is None:`. Using `is` for numbers or strings sometimes appears to work due to caching, then breaks. That's a real bug source.

---

## 0.6 Lists

The workhorse. An ordered, changeable sequence.

```python
nums = [3, 1, 4, 1, 5]
mixed = [1, "two", 3.0, True]      # legal, rarely wise
empty = []
```

**Access and slice — same rules as strings:**

```python
nums[0]       # 3
nums[-1]      # 5
nums[1:3]     # [1, 4]
nums[::-1]    # [5, 1, 4, 1, 3]  reversed copy
len(nums)     # 5
```

**Unlike strings, lists are mutable:**

```python
nums[0] = 99         # [99, 1, 4, 1, 5]
```

**Methods — and their costs, which matter for algorithms:**

```python
nums.append(6)       # add to END           — O(1), fast
nums.pop()           # remove from END      — O(1), returns it
nums.pop(0)          # remove from FRONT    — O(n), SLOW
nums.insert(0, 9)    # insert at FRONT      — O(n), SLOW
nums.remove(4)       # remove first value 4 — O(n)
nums.extend([7, 8])  # append several
nums.sort()          # sort IN PLACE, returns None
sorted(nums)         # returns a NEW sorted list
nums.reverse()       # reverse in place
nums.index(4)        # first index of 4     — O(n)
nums.count(1)        # how many 1s          — O(n)
4 in nums            # True                 — O(n) scan
```

Two things to internalise now, because they cause slow code later:

1. **`append`/`pop` at the end are fast; anything at the front is slow.** Adding at index 0 shifts every other element.
2. **`x in some_list` scans the whole list.** Inside a loop, that's the classic accidental O(n²).

**`sort()` vs `sorted()`** trips up everyone:

```python
nums.sort()               # modifies nums, RETURNS None
result = nums.sort()      # result is None! A very common bug.
result = sorted(nums)     # this is what you wanted
```

**Sorting with a rule:**

```python
words = ["ccc", "a", "bb"]
sorted(words, key=len)              # ['a', 'bb', 'ccc']
sorted(words, reverse=True)         # descending
pairs = [(1, 'z'), (2, 'a')]
sorted(pairs, key=lambda p: p[1])   # sort by second element
```

`lambda p: p[1]` is a small anonymous function: "given p, give me p[1]." You'll see it constantly.

**Copying — the trap:**

```python
a = [1, 2, 3]
b = a            # NOT a copy — b points at the SAME list
b.append(4)
print(a)         # [1, 2, 3, 4]  ← a changed too!

b = a[:]         # a real (shallow) copy
b = list(a)      # also a copy
```

**2-D lists (grids):**

```python
grid = [[0, 1], [2, 3]]
grid[0][1]        # 1   — row 0, column 1
len(grid)         # 2   — number of rows
len(grid[0])      # 2   — number of columns

# Building one — the CORRECT way:
grid = [[0] * 3 for _ in range(2)]     # 2 rows, 3 cols, all zeros

# The WRONG way — a real bug you will hit:
grid = [[0] * 3] * 2                   # all rows are the SAME list
grid[0][0] = 1                         # sets it in EVERY row
```

The second version creates one row and points at it twice. `for _ in range(2)` builds a genuinely new list each time.

---

## 0.7 Tuples and sets

**Tuples** — like lists, but immutable.

```python
point = (3, 4)
point[0]           # 3
point[0] = 9       # TypeError — cannot change

x, y = point       # UNPACKING — x=3, y=4. Used everywhere.
a, b = b, a        # swap two variables in one line, no temp needed
```

Use a tuple when the values belong together and shouldn't change: coordinates, a (value, index) pair, a database row. Tuples can be dictionary keys; lists cannot.

**Sets** — unordered, no duplicates, and **membership testing is O(1)**.

```python
s = {1, 2, 3}
s = set([1, 2, 2, 3])     # {1, 2, 3} — duplicates dropped
empty = set()             # NOT {} — that makes an empty dict

s.add(4)
s.remove(1)               # KeyError if absent
s.discard(1)              # silent if absent
2 in s                    # True — O(1), NOT a scan
len(s)
```

**Set operations:**

```python
a = {1, 2, 3}
b = {2, 3, 4}
a & b        # {2, 3}       intersection — in both
a | b        # {1,2,3,4}    union — in either
a - b        # {1}          difference — in a, not b
a ^ b        # {1, 4}       symmetric difference — in exactly one
```

**Why sets matter so much:** `x in list` is O(n); `x in set` is O(1). Converting a list to a set before repeated lookups is one of the most common speedups in all of interview code.

```python
seen = set(my_list)      # O(n) once
if x in seen:            # O(1) every time after
```

---

## 0.8 Dictionaries

Key → value. The single most important structure in interview Python.

```python
ages = {"harshit": 22, "alice": 30}
ages["harshit"]           # 22
ages["bob"]               # KeyError! — the key doesn't exist
ages.get("bob")           # None — safe
ages.get("bob", 0)        # 0    — safe, with a default
```

**Modifying:**

```python
ages["bob"] = 25          # add or overwrite
del ages["bob"]           # remove
ages.pop("bob", None)     # remove, with a default if missing
"alice" in ages           # True — checks KEYS, O(1)
len(ages)
```

**Iterating:**

```python
for key in ages:                     # keys
    print(key)

for key, value in ages.items():      # BOTH — use this most
    print(key, value)

for value in ages.values():
    print(value)
```

**The counting pattern** — you'll write this a hundred times:

```python
counts = {}
for c in "hello":
    counts[c] = counts.get(c, 0) + 1
# {'h':1, 'e':1, 'l':2, 'o':1}
```

Read it as: "take the current count, or 0 if there isn't one, add 1, store it back."

**Grouping:**

```python
groups = {}
for word in ["apple", "avocado", "banana"]:
    first = word[0]
    if first not in groups:
        groups[first] = []
    groups[first].append(word)
# {'a': ['apple', 'avocado'], 'b': ['banana']}
```

Both of these have shorter forms using `Counter` and `defaultdict` — those are in [01 §1.5](01-foundations.md). Learn the manual version first so you understand what the shortcut does.

**Keys must be immutable.** Strings, numbers, and tuples work. Lists do not.

```python
d[(1, 2)] = "ok"        # fine — tuple key
d[[1, 2]] = "no"        # TypeError: unhashable type: 'list'
```

---

## 0.9 Control flow: if / elif / else

```python
score = 85

if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
elif score >= 70:
    grade = "C"
else:
    grade = "F"
```

**Indentation is the syntax.** Python has no braces. The indented block belongs to the `if`. Use **4 spaces**, consistently — mixing tabs and spaces is an error.

```python
if x > 5:
    print("big")        # inside the if
print("always")         # outside — runs regardless
```

`elif` is checked only if everything above it was False. Once one branch matches, the rest are skipped.

**Ternary** — a one-line conditional value:

```python
status = "pass" if score >= 60 else "fail"
```

---

## 0.10 Loops

**`for` over a sequence:**

```python
for x in [1, 2, 3]:
    print(x)

for c in "abc":
    print(c)

for key, value in my_dict.items():
    print(key, value)
```

**`range`** — generates numbers. Same "stop excluded" rule.

```python
range(5)          # 0, 1, 2, 3, 4
range(2, 5)       # 2, 3, 4
range(0, 10, 2)   # 0, 2, 4, 6, 8      — step
range(5, 0, -1)   # 5, 4, 3, 2, 1      — backwards

for i in range(len(nums)):      # loop by INDEX
    print(i, nums[i])
```

**`enumerate`** — index and value together. Prefer it over `range(len(...))`:

```python
for i, x in enumerate(nums):
    print(f"index {i} holds {x}")
```

**`zip`** — walk two sequences in parallel:

```python
for name, age in zip(names, ages):
    print(name, age)
```

**`while`** — repeat while a condition holds:

```python
lo, hi = 0, 10
while lo < hi:
    mid = (lo + hi) // 2
    lo = mid + 1
```

A `while` loop that never changes its condition runs forever. If your program hangs, that's usually why. `Ctrl+C` stops it.

**`break` and `continue`:**

```python
for x in nums:
    if x < 0:
        continue        # skip to the next iteration
    if x > 100:
        break           # exit the loop entirely
    print(x)
```

**The underscore** means "I don't need this value":

```python
for _ in range(3):
    print("hi")         # just repeat 3 times
```

---

## 0.11 Functions

A named, reusable block.

```python
def greet(name):
    return f"Hello, {name}"

message = greet("Harshit")      # 'Hello, Harshit'
```

- `def` starts the definition
- `name` is a **parameter**; `"Harshit"` is the **argument**
- `return` sends a value back **and exits immediately**
- No `return` means the function returns `None`

**`return` exits right away.** Everything after it in that call is dead:

```python
def find(nums, target):
    for i, x in enumerate(nums):
        if x == target:
            return i          # exits the whole function, not just the loop
    return -1                 # only reached if the loop finished
```

That shape — return inside the loop, a fallback after it — is the single most common function structure in interview code. Note the indentation: `return -1` is at the function's level, not the loop's. Putting it inside the loop is a real bug (it would return on the first iteration).

**Default parameters:**

```python
def greet(name, greeting="Hello"):
    return f"{greeting}, {name}"

greet("Harshit")                    # 'Hello, Harshit'
greet("Harshit", "Hi")              # 'Hi, Harshit'
greet(greeting="Hey", name="A")     # keyword arguments, any order
```

**The mutable-default trap** — memorise this one:

```python
def bad(item, items=[]):        # the SAME list is reused across ALL calls
    items.append(item)
    return items

bad(1)      # [1]
bad(2)      # [1, 2]   ← not what anyone wants

def good(item, items=None):     # the fix
    if items is None:
        items = []
    items.append(item)
    return items
```

Default values are evaluated **once**, when the function is defined — not on each call.

**Returning multiple values** (really a tuple):

```python
def min_max(nums):
    return min(nums), max(nums)

lo, hi = min_max([3, 1, 4])     # lo=1, hi=4
```

**Scope:** variables made inside a function are local and vanish when it ends.

```python
def f():
    x = 10          # local
f()
print(x)            # NameError — x doesn't exist out here
```

You can *read* outer variables but not *reassign* them without `nonlocal` (enclosing function) or `global` (module level).

```python
def outer():
    count = 0
    def inner():
        nonlocal count      # without this, count += 1 is an error
        count += 1
    inner()
    return count            # 1
```

`nonlocal` shows up in tree problems where a helper updates a running best.

---

## 0.12 Comprehensions

A compact way to build a list, set, or dict from a loop. Very common in Python code, so you must be able to *read* them even before you enjoy writing them.

```python
# long form
squares = []
for x in range(5):
    squares.append(x * x)

# comprehension — identical result
squares = [x * x for x in range(5)]        # [0, 1, 4, 9, 16]
```

Read it as: *"`x * x`, for each `x` in `range(5)`."* Expression first, loop second.

**With a filter:**

```python
evens = [x for x in range(10) if x % 2 == 0]      # [0,2,4,6,8]
```

**Set and dict versions:**

```python
{x * x for x in range(5)}                    # a set
{x: x * x for x in range(5)}                 # {0:0, 1:1, 2:4, ...}
```

**Rule of thumb:** if it doesn't fit comfortably on one line, use a real loop. Nested comprehensions with multiple conditions are how Python code becomes unreadable.

---

## 0.13 Classes and objects

A class is a template. An object is one thing built from that template.

```python
class Dog:
    def __init__(self, name, age):     # the CONSTRUCTOR
        self.name = name               # an attribute
        self.age = age

    def bark(self):                    # a method
        return f"{self.name} says woof"

d = Dog("Rex", 3)
d.name          # 'Rex'
d.bark()        # 'Rex says woof'
```

- `__init__` runs automatically when you create the object
- **`self`** is the object itself, and it is the first parameter of every method. You never pass it — `d.bark()` supplies it automatically
- `self.name = name` stores a value **on this object**

Names with double underscores like `__init__` are called "dunder" methods — Python calls them for you at the right moment.

**Why you need this for DSA:** interview problems hand you classes.

```python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right
```

Those two show up in every linked list and tree problem in the curriculum. You mostly *use* them rather than write them, but you need to read `node.next` and `node.left` fluently.

**Useful dunders:**

```python
class Point:
    def __init__(self, x, y):
        self.x, self.y = x, y
    def __repr__(self):                 # how it prints
        return f"Point({self.x}, {self.y})"
    def __eq__(self, other):            # how == works
        return self.x == other.x and self.y == other.y
```

---

## 0.14 Errors and exceptions

When Python can't do something, it raises an **exception** and stops.

```python
int("hello")        # ValueError
[1,2][5]            # IndexError
{"a":1}["b"]        # KeyError
1 / 0               # ZeroDivisionError
"a" + 1             # TypeError
undefined_name      # NameError
```

**Handling one:**

```python
try:
    value = int(user_input)
except ValueError:
    value = 0                  # runs only if a ValueError happened
```

**Raising one yourself:**

```python
def withdraw(balance, amount):
    if amount > balance:
        raise ValueError("insufficient funds")
    return balance - amount
```

**Don't wrap everything in try/except.** In algorithm code you usually want the crash — it tells you where your bug is.

---

## 0.15 Reading a traceback

This is a genuine skill and nobody teaches it. When your code fails, Python tells you exactly what happened. Read it **bottom-up**.

```
Traceback (most recent call last):
  File "solution.py", line 12, in <module>
    print(two_sum([1,2,3], 9))
  File "solution.py", line 7, in two_sum
    return [seen[need], i]
KeyError: 7
```

Read it like this:

1. **Last line first** — `KeyError: 7` is *what* went wrong: you asked a dict for key `7`, which isn't there.
2. **The line above it** — `return [seen[need], i]` at line 7 is *where*.
3. **Above that** — the chain of calls that got you there. Line 12 called `two_sum`, which failed at line 7.

Ninety percent of debugging is reading the last line and the last file location. Do that before changing anything.

**The most common messages and what they actually mean:**

| Message | Means |
|---|---|
| `IndentationError` | your spacing is inconsistent — mixed tabs and spaces, or a wrong-level line |
| `SyntaxError: invalid syntax` | usually a missing `:` or an unclosed bracket **on the line above** the one reported |
| `NameError: name 'x' is not defined` | typo, or used before assignment, or defined inside a function |
| `TypeError: 'NoneType' object is not subscriptable` | you indexed something that's `None` — often a function that forgot to return |
| `IndexError: list index out of range` | off-by-one; you used `len(a)` instead of `len(a)-1` |
| `KeyError: 'x'` | that key isn't in the dict — use `.get()` |
| `TypeError: unhashable type: 'list'` | you used a list as a dict key or set element — use a tuple |
| `RecursionError` | infinite recursion, or a missing base case |
| `UnboundLocalError` | you assigned to a variable inside a function that also exists outside |

---

## 0.16 Imports

Bring in code from elsewhere.

```python
import math
math.sqrt(16)              # 4.0

from math import sqrt      # import just one name
sqrt(16)                   # 4.0

from collections import Counter, defaultdict, deque
import heapq
```

Put all imports at the top of the file. The ones you'll use for DSA are in [01 §1.5](01-foundations.md).

**`if __name__ == "__main__":`** — you'll see this everywhere, including in your practice files:

```python
def solve():
    return 42

if __name__ == "__main__":
    print(solve())
```

It means "only run this part when the file is executed directly, not when another file imports it." It lets a file be both a runnable script and an importable module.

---

## 0.17 The twelve mistakes you will make

Every beginner hits these. Knowing them in advance saves hours.

1. **`=` instead of `==`** in a condition.
2. **Forgetting the colon** at the end of `if`, `for`, `while`, `def`, `class`.
3. **Inconsistent indentation** — always 4 spaces, never tabs.
4. **`nums.sort()` returns `None`** — use `sorted(nums)` if you want a value back.
5. **`b = a` doesn't copy a list** — use `a[:]`.
6. **`[[0]*3]*3` aliases the rows** — use `[[0]*3 for _ in range(3)]`.
7. **Mutable default argument** — `def f(x, items=[])`.
8. **`return` inside a loop** when you meant it after the loop — check your indentation.
9. **Off-by-one from forgetting `stop` is excluded** — `range(5)` never yields 5.
10. **Modifying a list while looping over it** — build a new list instead.
11. **`x in some_list` inside a loop** — O(n²). Use a set.
12. **`+=` on a string in a loop** — build a list and `"".join(...)` instead.

---

## 0.18 The four-day plan

| Day | Read | Drill |
|---|---|---|
| **1** | §0.1–0.5: running Python, variables, types, numbers, strings, booleans | `python -m drills.day0_python` exercises 1–12 |
| **2** | §0.6–0.8: lists, tuples, sets, dicts | exercises 13–26 |
| **3** | §0.9–0.12: control flow, loops, functions, comprehensions | exercises 27–40 |
| **4** | §0.13–0.17: classes, errors, tracebacks, imports | exercises 41–50, then re-run everything |

**Type every example in this file into the REPL as you read it.** Do not read passively. Change a value and see what happens. Break it on purpose and read the traceback. That is the entire method.

**Self-check before moving to [01-foundations](01-foundations.md).** You should be able to, without looking:

- Explain the difference between `=` and `==`, and between `/` and `//`
- Reverse a string, and get its last character
- Write a loop that counts how many times each character appears in a string
- Explain why `[[0]*3]*3` is broken
- Write a function with a default parameter that returns two values
- Read a traceback and say which line failed and why
- Explain why `x in a_set` is faster than `x in a_list`

If any of those is shaky, redo that section's drills. There is no rush and no benefit to moving on early — [01](01-foundations.md) assumes all of it.

→ Next: **[01 — Foundations](01-foundations.md)**
