# 01 — Foundations

**Days 1–5. Do not skip.** Everything after this file assumes it.

**New to Python?** Read [00 — Python From Zero](00-python-from-zero.md) first. This file assumes you can already write a loop, a function, and a dict.

> ### How to read this curriculum
>
> **If you hit a word you have not been taught yet, it is never a prerequisite.** Prerequisites always come earlier in the file order. An unfamiliar term is one of two things:
>
> - a **preview** — named so it is not foreign when it arrives, with a link to the file that teaches it
> - a **lookup-table entry** — the constraint and complexity tables name every technique on purpose, because you will return to them for months
>
> Either way: read past it. Do not stop, do not go and study it, do not feel behind. The build order is strict and each file only assumes the ones before it.
>
> `00 Python -> 01 Foundations -> 02 Arrays -> 03 Stacks/Search/Lists -> 04 Trees/Heaps -> 05 Backtracking/Graphs -> 06 DP -> 07 Greedy/Bits`


---

## 1.1 How a computer actually stores data

You need a physical model or complexity analysis stays mystical.

Memory is one enormous numbered array of bytes. Address 0, 1, 2, 3, … up to billions. That's it. Every data structure is a scheme for laying values into that array and a scheme for finding them again.

Two facts drive everything:

1. **Reading memory at a known address is O(1).** The CPU computes the address arithmetically and fetches it. One step, regardless of how big the array is.
2. **Finding an address you don't know requires searching.** How expensive that is depends entirely on how you organized the data.

### Arrays (Python `list`)

An array is a contiguous block. If the block starts at address `B` and each element takes `k` bytes:

```
address of element i  =  B + i*k
```

That's one multiply and one add — **O(1) access by index**, no matter the size. This is why arrays are the fastest structure that exists for indexed lookup.

The cost of that layout:

| Operation | Cost | Why |
|---|---|---|
| `arr[i]` read/write | O(1) | address arithmetic |
| `arr.append(x)` | O(1) amortized | write past the end; occasionally reallocate |
| `arr.pop()` (end) | O(1) | just move the length marker |
| `arr.insert(0, x)` | **O(n)** | every later element shifts right |
| `arr.pop(0)` | **O(n)** | every later element shifts left |
| `x in arr` | **O(n)** | must scan |
| `arr.sort()` | O(n log n) | Timsort |
| slicing `arr[a:b]` | **O(b-a)** | copies |

**"Amortized O(1)" explained**, because interviewers ask: Python over-allocates. When a list of capacity 8 fills up, it allocates a bigger block (roughly 1.125× plus a constant, conceptually ~2×) and copies everything — that single append is O(n). But it then buys you many free appends. Summed over n appends, total work is O(n), so *average* cost per append is O(1). That's amortized analysis: expensive operations are rare enough that the average stays low.

**The two lines that quietly turn O(n) algorithms into O(n²):**

```python
arr.pop(0)          # O(n) — use collections.deque().popleft() → O(1)
arr.insert(0, x)    # O(n) — use collections.deque().appendleft() → O(1)
```

Also: `if x in my_list` inside a loop. That's O(n) per check, O(n²) total. Convert to a `set` first.

### Hash maps (Python `dict`) and hash sets (`set`)

A hash map stores key→value by running the key through a **hash function** producing an integer, then `index = hash(key) % capacity`, and storing the pair at that array slot.

- Compute the slot: O(1)
- Jump to it: O(1)
- → **O(1) average** insert, lookup, delete

**Collisions:** two keys can hash to the same slot. Python uses open addressing (probe to the next free slot). If the table gets too full, collisions chain and lookups degrade — worst case O(n). Python resizes when ~2/3 full to keep collisions rare, so *average* stays O(1). Say "O(1) average, O(n) worst case" in interviews; it's the correct answer and it signals you actually know the mechanism.

Trade-off: hash maps use more memory than arrays and give no ordering by value. (Python dicts do preserve *insertion* order since 3.7 — that's a Python implementation guarantee, not a hash-map property. Don't confuse the two in an interview.)

**This is the single most valuable trade in interview DSA: spend O(n) memory to convert an O(n²) scan into an O(n) pass.** More than a third of Easy/Medium problems are exactly this move.

### Linked lists

Each element (node) holds a value plus a pointer to the next node. Nodes live anywhere in memory.

```python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next
```

| Operation | Array | Linked list |
|---|---|---|
| Access by index | O(1) | **O(n)** — must walk |
| Insert/delete at front | O(n) | **O(1)** |
| Insert/delete given the node | O(n) | **O(1)** |
| Memory overhead | low | high (a pointer per node) |
| Cache locality | excellent | poor |

Linked lists appear in interviews far more than in real code, because they test pointer discipline. Real systems mostly use arrays because contiguous memory is dramatically faster in practice (the CPU cache loads 64-byte lines; walking an array gets the next elements for free, walking a linked list causes a cache miss per node).

### Everything else, in one line each

**This is a map, not a lesson.** You are not expected to learn these now — each gets a full file later. Read it once so the names aren't foreign when they arrive, then move on. Nothing in Day 1–5 depends on understanding them.


- **Stack** — last in, first out. A Python `list` with `append`/`pop`. Used for: undo, matching brackets, DFS, monotonic problems.
- **Queue** — first in, first out. `collections.deque` with `append`/`popleft`. Used for: BFS, scheduling, buffers.
- **Heap (priority queue)** — a binary tree in an array where every parent ≤ its children. Gives O(1) peek at min, O(log n) push/pop. Used for: top-K, merging sorted streams, Dijkstra.
- **Tree** — nodes with children, no cycles. Binary search trees give O(log n) search *if balanced*, O(n) if degenerate.
- **Graph** — nodes plus edges, cycles allowed. Everything relational: maps, dependencies, social networks, state machines.
- **Trie** — a tree keyed by characters. Prefix search in O(length of word), independent of dictionary size.

---

## 1.2 Big-O, properly

### The definition

O(f(n)) means: as n grows large, the running time grows *no faster than* a constant multiple of f(n).

Three deliberate simplifications:

1. **Drop constants.** 3n and n/2 and 100n are all O(n). Constants depend on hardware and language; the *shape* of the growth doesn't.
2. **Drop lower-order terms.** n² + 5n + 900 is O(n²). At n = 1,000,000, the n² term is a million times bigger than the n term — the rest is noise.
3. **We care about large n.** For small inputs, everything is fast. Algorithms matter at scale.

### The ladder

*This table names techniques from later files (binary search, heaps, trees). You are reading it for the **growth rates**, not the techniques — ignore any name you do not recognise.*

| Complexity | Name | n=10 | n=1,000 | n=1,000,000 | Where it comes from |
|---|---|---|---|---|---|
| O(1) | constant | 1 | 1 | 1 | dict/set lookup, array index, arithmetic |
| O(log n) | logarithmic | 3 | 10 | 20 | binary search, balanced tree, heap push |
| O(n) | linear | 10 | 1,000 | 1,000,000 | one pass, hashmap scan |
| O(n log n) | linearithmic | 33 | 10,000 | 20,000,000 | sorting, divide & conquer, heap of n |
| O(n²) | quadratic | 100 | 1,000,000 | 10¹² ☠ | nested loops over same input |
| O(n³) | cubic | 1,000 | 10⁹ | 10¹⁸ ☠ | triple loop, naive matrix multiply |
| O(2ⁿ) | exponential | 1,024 | astronomical | — | subsets, naive recursion |
| O(n!) | factorial | 3.6M | — | — | permutations |

**Why log n keeps appearing:** log₂(n) is "how many times can you halve n before reaching 1." Halving a million takes 20 steps. Any algorithm that discards half the remaining possibilities each step is O(log n). This is why binary search on a billion items takes 30 comparisons.

### Reading complexity off code

```python
# O(1) — fixed work regardless of n
def first(nums):
    return nums[0] if nums else None

# O(n) — one pass
def total(nums):
    s = 0
    for x in nums:
        s += x
    return s

# O(n) — two sequential passes: n + n = 2n → O(n).
# Sequential loops ADD. They do not multiply.
def two_passes(nums):
    a = sum(nums)
    b = max(nums)
    return a, b

# O(n²) — nested loops over the same input MULTIPLY
def all_pairs(nums):
    out = []
    for i in range(len(nums)):
        for j in range(len(nums)):
            out.append((nums[i], nums[j]))
    return out

# STILL O(n²) — the inner loop averages n/2 iterations.
# n²/2 → drop the constant → O(n²)
def unique_pairs(nums):
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            ...

# O(n * m) — DIFFERENT inputs get DIFFERENT variables.
# Saying "O(n²)" here is a common and visible mistake.
def cross(a, b):
    for x in a:
        for y in b:
            ...

# O(log n) — the search space halves each iteration
def binary_search(nums, target):
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target: return mid
        if nums[mid] < target: lo = mid + 1
        else: hi = mid - 1
    return -1

# O(n log n) — outer loop n times, inner work log n each
def n_log_n(nums):
    for x in nums:              # n
        binary_search(nums, x)  # log n
```

### The hidden-cost checklist

These are where people misstate complexity and lose points:

```python
sorted(nums)          # O(n log n) — not free
x in some_list        # O(n)   ← the classic mistake
x in some_set         # O(1)
s1 + s2               # O(len(s1) + len(s2)) — strings are immutable, this COPIES
"".join(parts)        # O(total length) — correct way to build strings
arr[1:]               # O(n) — slicing copies. Slicing in a loop = O(n²)
min(nums) / max(nums) # O(n)
list.count(x)         # O(n)
list.index(x)         # O(n)
set(nums)             # O(n)
heapq.heapify(nums)   # O(n) — surprisingly, not O(n log n)
heapq.heappush/pop    # O(log n)
copy.deepcopy(x)      # O(size of x)
```

**The string-concatenation trap**, which appears constantly in backtracking:

```python
# O(n²) — each += builds an entirely new string
result = ""
for word in words:
    result += word

# O(n) — build a list, join once
parts = []
for word in words:
    parts.append(word)
result = "".join(parts)
```

### Recursion complexity: the recursion tree

For a recursive function, ask two questions:
1. How many total calls happen?
2. How much work does each call do, excluding its recursive calls?

Multiply.

```python
def fib(n):
    if n <= 1: return n
    return fib(n-1) + fib(n-2)
```
Branching factor 2, depth n → roughly 2ⁿ nodes, O(1) work each → **O(2ⁿ)**. (Precisely it's φⁿ ≈ 1.618ⁿ, but 2ⁿ is the accepted answer.)

```python
def merge_sort(a):
    if len(a) <= 1: return a
    mid = len(a) // 2
    left, right = merge_sort(a[:mid]), merge_sort(a[mid:])
    return merge(left, right)      # merge is O(n)
```
Depth log n (halving each time). At every depth level, the merges across all calls total O(n) work. → **O(n log n)**.

**Space for recursion:** every pending call occupies a stack frame. Max depth = max simultaneous frames. `merge_sort` is O(log n) stack + O(n) for the merged arrays. A recursive DFS on a linked list of 10⁵ nodes is O(n) stack depth — and Python's default recursion limit is 1000, so it crashes. Know this; it is a real interview gotcha.

### Amortized vs average vs worst

Three different things people conflate:

- **Worst case** — the slowest possible input. `list.append` worst case is O(n) (the reallocation).
- **Average case** — expected over random inputs. Hash lookup average is O(1).
- **Amortized** — the average *per operation over a sequence*, even in the worst case. `list.append` is amortized O(1) because the expensive reallocations are provably rare.

Quicksort: average O(n log n), worst case O(n²) (already-sorted input with a bad pivot). Merge sort: O(n log n) always, but needs O(n) extra space. That trade-off is a standard interview question.

---

## 1.3 Reading constraints — free answers

Every LeetCode problem lists constraints. Almost nobody reads them properly. They tell you the intended solution before you think about the problem.

*The tables in this section name almost every technique in the curriculum. That is deliberate — this is the page you will come back to before every problem for the next six months. Right now, read only the left column (the constraint) and the middle column (the complexity). The technique names will fill in as you go.*

A modern CPU performs roughly **10⁸ simple operations per second** in a judged environment (Python is slower — assume closer to 10⁷ and add a safety margin).

| Constraint on n | Max viable complexity | What it's telling you |
|---|---|---|
| n ≤ 10 | O(n!) | permutations, brute-force all orderings |
| n ≤ 20 | O(2ⁿ) | subsets, bitmask DP, "choose or don't choose" |
| n ≤ 100 | O(n⁴) | 4 nested loops fine |
| n ≤ 500 | O(n³) | interval DP, Floyd–Warshall, triple loop |
| n ≤ 5,000 | O(n²) | 2-D DP, all-pairs, nested loops |
| n ≤ 10⁵ | O(n log n) or O(n) | sorting, hashmap, two pointers, heap, sliding window |
| n ≤ 10⁶ | O(n) | single pass only; sorting is borderline |
| n ≤ 10⁹ | O(log n) or O(1) | **binary search on the answer**, or closed-form math |
| n ≤ 10¹⁸ | O(log n) or O(1) | math, bit tricks, matrix exponentiation |

**How to use this in an interview, verbatim:**

> "Constraints say n is up to 10⁵, so an O(n²) approach is around 10¹⁰ operations — too slow. That rules out the nested-loop version and points me toward O(n log n) or better. Let me look for a sorting-based or hashmap approach."

That sentence alone puts you above most candidates. It shows you reason about feasibility rather than pattern-matching.

**Other signals hiding in the constraints:**

| You see | It suggests |
|---|---|
| "array is sorted" | binary search, or two pointers |
| "return **any** valid answer" | greedy is likely acceptable |
| "count the number of ways" | dynamic programming |
| "minimum/maximum ... to achieve X" | DP, greedy, or binary search on the answer |
| "the array is rotated sorted" | modified binary search |
| "values are 1..n and length is n" | index-as-hash trick, cycle detection, O(1) space possible |
| "O(1) extra space required" | in-place swaps, two pointers, bit manipulation, Floyd's cycle |
| "O(log n) required" | binary search or heap, guaranteed |
| "k ≤ ..." with k much smaller than n | heap of size k, not full sort |
| "1 ≤ nums[i] ≤ 100" (small value range) | counting sort / bucket by value |
| "the answer fits in a 32-bit int" | watch for overflow (irrelevant in Python, mention it anyway) |
| "there may be duplicates" | your dedup strategy is being tested |
| "stream / infinite input" | heap, reservoir sampling, or running aggregate |

---

## 1.4 Recursion, taught properly

Recursion is a function that solves a problem by calling itself on a smaller version of the same problem.

Three mandatory parts:
1. **Base case** — the smallest input, answered directly, no recursion. Without it: infinite recursion, stack overflow.
2. **Recursive case** — reduce the problem and call yourself.
3. **Progress** — every call must move strictly toward the base case.

### The mental model that makes recursion click

Stop trying to trace the whole call tree in your head. Nobody can do that past depth 3. Instead use the **recursive leap of faith**:

> Assume the function already works correctly for smaller inputs. Now: given correct answers for the smaller problems, how do I build the answer for this one?

For Fibonacci: assume `fib(n-1)` and `fib(n-2)` are correct. Then `fib(n)` is obviously their sum. Done. Never trace further down.

For "reverse a linked list": assume you can reverse the rest of the list. Then you only need to attach the current node to the end. That's the whole insight.

### Fibonacci — four versions, and why this matters

Fibonacci: `0, 1, 1, 2, 3, 5, 8, 13, 21, …` — each number is the sum of the previous two.

**Version 1 — naive recursion.**

```python
def fib(n):
    if n <= 1:            # base case
        return n
    return fib(n - 1) + fib(n - 2)   # recursive case
```

Correct. Also catastrophic: **O(2ⁿ) time, O(n) space** (stack depth).

Why so bad? Draw the call tree for `fib(5)`:

```
                  fib(5)
              /            \
         fib(4)             fib(3)
        /      \           /      \
    fib(3)    fib(2)   fib(2)   fib(1)
    /    \    /    \    /    \
 fib(2) fib(1) ...
```

`fib(3)` is computed twice, `fib(2)` three times. The redundancy grows exponentially. `fib(40)` takes seconds. `fib(50)` won't finish in your lifetime of patience.

**Version 2 — memoization (top-down DP).** Remember answers you've already computed:

```python
def fib(n, memo=None):
    if memo is None:
        memo = {}
    if n <= 1:
        return n
    if n in memo:              # already solved this subproblem
        return memo[n]
    memo[n] = fib(n - 1, memo) + fib(n - 2, memo)
    return memo[n]
```

Each value 0..n is computed exactly once → **O(n) time, O(n) space.**

*Note: never write `def fib(n, memo={})`. Python evaluates default arguments once at definition time, so the dict is shared across all calls — a classic bug and a thing interviewers notice.*

Python gives you this for free:

```python
from functools import cache

@cache
def fib(n):
    return n if n <= 1 else fib(n-1) + fib(n-2)
```

Know how to write it manually — some interviewers ask you to.

**Version 3 — bottom-up (tabulation).** Build up from the base cases instead of recursing down:

```python
def fib(n):
    if n <= 1:
        return n
    dp = [0] * (n + 1)
    dp[1] = 1
    for i in range(2, n + 1):
        dp[i] = dp[i-1] + dp[i-2]
    return dp[n]
```
**O(n) time, O(n) space**, no recursion, no stack limit.

**Version 4 — space-optimized.** You only ever read the last two values:

```python
def fib(n):
    prev, curr = 0, 1
    for _ in range(n):
        prev, curr = curr, prev + curr
    return prev
```
**O(n) time, O(1) space.**

*(There is also an O(log n) matrix-exponentiation solution. Mention it exists; you will essentially never need it.)*

**Why this progression is the most important thing in this file:** 2ⁿ → n time → n space → 1 space is *exactly* the structure of a strong interview answer. State the brute force, name its complexity, identify the waste, remove the waste, then optimize space. Every DP problem you will ever see is this same sequence wearing a different costume.

### The recursion patterns you will actually use

**Note on the examples below:** patterns 2–4 use trees and a function named `dfs` purely to illustrate the *shape* of the recursion. You do not need to know what a tree or a depth-first search is yet — trees are [file 04](04-trees-heaps.md) and DFS is [file 05](05-backtracking-graphs.md). What you are looking at here is only: how many branches does the function have, and what state does it carry. `dfs` is just a conventional name for "walk the structure."


```python
# 1. Linear recursion — process one element, recurse on the rest
def sum_list(nums, i=0):
    if i == len(nums): return 0
    return nums[i] + sum_list(nums, i + 1)

# 2. Binary recursion — two branches (trees, fib, divide & conquer)
def tree_sum(node):
    if not node: return 0
    return node.val + tree_sum(node.left) + tree_sum(node.right)

# 3. Multi-branch recursion — backtracking, N choices per step
def permutations(nums):
    if len(nums) <= 1: return [nums]
    out = []
    for i in range(len(nums)):
        rest = nums[:i] + nums[i+1:]
        for p in permutations(rest):
            out.append([nums[i]] + p)
    return out

# 4. Recursion with an accumulator — carry state down instead of building it up
def dfs(node, path, results):
    if not node: return
    path.append(node.val)
    if not node.left and not node.right:
        results.append(list(path))   # COPY — see below
    dfs(node.left, path, results)
    dfs(node.right, path, results)
    path.pop()                        # backtrack: undo before returning
```

**Two bugs that will bite you, guaranteed:**

1. **Forgetting to copy.** `results.append(path)` appends a *reference*. When `path` is later mutated, every stored result changes with it. Always `results.append(path[:])` or `list(path)`.
2. **Forgetting to undo.** In backtracking, if you `append` before recursing you must `pop` after. Otherwise state leaks into sibling branches.

### Recursion vs iteration

Any recursion can be rewritten iteratively with an explicit stack. Use recursion when the problem is naturally tree-shaped (trees, backtracking, divide & conquer) — the code is far clearer. Use iteration when depth could exceed ~1000 (Python's default limit) or when you need O(1) space.

```python
import sys
sys.setrecursionlimit(10**6)   # sometimes needed on LeetCode; mention the risk
```

---

## 1.5 The Python DSA toolkit

Memorize this section. Fluency here is worth minutes per interview.

### Core imports

```python
from collections import defaultdict, Counter, deque, OrderedDict
import heapq
from functools import cache, lru_cache
import math
from itertools import permutations, combinations, product, accumulate
import bisect
```

### `dict` and `defaultdict`

```python
d = {}
d['a'] = 1
d.get('b', 0)              # 0 if missing — never KeyErrors
d.setdefault('c', []).append(5)

from collections import defaultdict
freq = defaultdict(int)                  # missing key → 0
for c in "hello": freq[c] += 1

graph = defaultdict(list)                # missing key → []
graph[1].append(2)

groups = defaultdict(set)                # missing key → set()

# iteration
for k, v in d.items(): ...
for k in d: ...                          # keys
```

### `Counter` — frequency counting in one line

```python
from collections import Counter
c = Counter("aabbbcc")            # {'b':3, 'a':2, 'c':2}
c = Counter([1,1,2,3])
c.most_common(2)                  # [(1,2),(2,1)] — top-2 by count
c['z']                            # 0, not a KeyError
c1 - c2                           # subtract counts (drops non-positive)
c1 == c2                          # anagram check in ONE comparison
sum(c.values())                   # total count
```

Anagram check, complete:
```python
def is_anagram(s, t):
    return Counter(s) == Counter(t)     # O(n) time, O(1) space (26 letters)
```

### `deque` — O(1) at both ends

```python
from collections import deque
q = deque([1,2,3])
q.append(4)          # O(1) right
q.appendleft(0)      # O(1) left  ← list.insert(0,x) is O(n)
q.pop()              # O(1) right
q.popleft()          # O(1) left  ← list.pop(0) is O(n)
q[0], q[-1]          # O(1) peek both ends
deque(maxlen=5)      # auto-evicting fixed window
```

Use for: BFS queues, sliding-window maximum, any FIFO.

### `heapq` — min-heap

Python only has a **min**-heap. For a max-heap, negate the values.

```python
import heapq
h = []
heapq.heappush(h, 3)         # O(log n)
heapq.heappush(h, 1)
h[0]                         # 1 — peek min, O(1)
heapq.heappop(h)             # 1 — remove min, O(log n)
heapq.heapify(arr)           # O(n) — in-place, faster than n pushes

# max-heap: negate
for x in nums: heapq.heappush(h, -x)
largest = -heapq.heappop(h)

# tuples sort by first element, then second — use for (priority, item)
heapq.heappush(h, (dist, node))

# convenience
heapq.nlargest(k, nums)      # O(n log k)
heapq.nsmallest(k, nums)
```

**Top-K pattern** — keep a min-heap of size k; anything smaller than the root can't be in the top k:

```python
def top_k(nums, k):
    h = []
    for x in nums:
        heapq.heappush(h, x)
        if len(h) > k:
            heapq.heappop(h)     # evict the smallest
    return h                     # O(n log k) — beats sorting's O(n log n)
```

### `sorted` and custom keys

```python
sorted(nums)                          # ascending, O(n log n), returns new list
nums.sort()                           # in place
sorted(nums, reverse=True)
sorted(words, key=len)
sorted(pairs, key=lambda p: p[1])                 # by 2nd element
sorted(pairs, key=lambda p: (-p[1], p[0]))        # by 2nd desc, then 1st asc
sorted(words, key=lambda w: "".join(sorted(w)))   # group anagrams

import functools
def cmp(a, b): return -1 if a+b > b+a else 1
sorted(nums, key=functools.cmp_to_key(cmp))       # arbitrary comparator
```

Python's sort is **stable**: equal elements retain their original relative order. Occasionally load-bearing.

### `bisect` — binary search on a sorted list

```python
import bisect
a = [1,3,3,5,7]
bisect.bisect_left(a, 3)     # 1 — first index where 3 could go (leftmost)
bisect.bisect_right(a, 3)    # 3 — after the last 3
bisect.insort(a, 4)          # insert keeping sorted, O(n) for the shift
```

Used in: LIS in O(n log n), "find the smallest element ≥ x", search in sorted structures.

### Strings

```python
s.lower(), s.upper(), s.strip(), s.split(), s.split(",")
"".join(list_of_chars)          # O(n) — the correct way to build strings
s[::-1]                         # reverse
s.isalnum(), s.isdigit(), s.isalpha()
ord('a')                        # 97 — char to int
chr(97)                         # 'a'
ord(c) - ord('a')               # 0..25 index for lowercase letters
s.replace('a','b')
s.startswith('ab'), s.find('ab')   # find returns -1 if absent
```

Strings are **immutable**. Any "modification" creates a new string. To mutate, convert to a list, edit, join.

### Sets

```python
s = set()
s.add(1); s.discard(1)     # discard doesn't error if absent; remove does
1 in s                     # O(1)
a & b   # intersection
a | b   # union
a - b   # difference
a ^ b   # symmetric difference
a <= b  # subset
```

### 2-D arrays

```python
grid = [[0]*cols for _ in range(rows)]     # CORRECT

grid = [[0]*cols]*rows                      # BUG — all rows are the SAME list
                                            # grid[0][0]=1 sets it in every row

rows, cols = len(grid), len(grid[0])
for r in range(rows):
    for c in range(cols):
        ...

DIRS = [(0,1),(1,0),(0,-1),(-1,0)]          # 4-directional neighbors
for dr, dc in DIRS:
    nr, nc = r + dr, c + dc
    if 0 <= nr < rows and 0 <= nc < cols:   # bounds check FIRST, always
        ...
```

### Numbers

```python
float('inf'), float('-inf')      # sentinels for min/max tracking
divmod(17, 5)                    # (3, 2)
7 // 2                           # 3 — floor division
-7 // 2                          # -4 — floors toward negative infinity! gotcha
int(-7 / 2)                      # -3 — truncates toward zero
abs(-3)
math.gcd(12, 18)
math.isqrt(17)                   # 4 — exact integer sqrt, no float error
pow(2, 10, 1000)                 # modular exponentiation, fast
```

Python integers are arbitrary precision — no overflow. Mention overflow anyway when the problem says "fits in 32-bit int"; it shows awareness of other languages.

### Idioms that save real time

```python
for i, x in enumerate(nums): ...
for a, b in zip(list1, list2): ...
a, b = b, a                              # swap, no temp
squares = [x*x for x in nums if x > 0]   # comprehension
any(x > 5 for x in nums)                 # short-circuits
all(x > 0 for x in nums)
seen = set(nums)
res = [0] * n
matrix_T = list(zip(*matrix))            # transpose
nums[::-1]                               # reverse a copy
nums.reverse()                           # reverse in place
```

---

## 1.6 Two full worked examples

### Two Sum — the space-for-time trade

> Given an array of integers and a target, return the indices of two numbers that add to the target. Exactly one solution exists.
> Constraints: `2 ≤ n ≤ 10⁴`, `-10⁹ ≤ nums[i] ≤ 10⁹`

**Step 1 — read constraints.** n ≤ 10⁴, so O(n²) = 10⁸ — borderline but probably passes. O(n) is clearly intended. Values can be negative, so no counting-sort tricks.

**Step 2 — brute force.** Check every pair.

```python
def two_sum_brute(nums, target):
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]
```
O(n²) time, O(1) space.

**Step 3 — find the waste.** For each `i`, we re-scan the whole array looking for `target - nums[i]`. That lookup is the expensive part. What structure makes lookup O(1)? A hash map.

**Step 4 — optimize.**

```python
def two_sum(nums, target):
    seen = {}                          # value -> index
    for i, x in enumerate(nums):
        need = target - x              # the partner we require
        if need in seen:               # O(1)
            return [seen[need], i]
        seen[x] = i                    # store AFTER checking, so an element
    return []                          # never pairs with itself
```
**O(n) time, O(n) space.**

Note the ordering: check before inserting. If you insert first, `nums = [3,2]`, `target = 6` would match index 0 with itself.

**Step 5 — say the trade-off aloud.** "I've traded O(n) extra memory for an O(n) speedup, from n² to n. Given n ≤ 10⁴ that's trivially fine, and it's the right call for any larger n."

### Valid Parentheses — why a stack

> Given a string of `()[]{}`, determine if brackets are correctly matched and nested.

**The insight:** the most recently opened bracket must be the first one closed. "Most recent first" is exactly last-in-first-out — a stack.

```python
def is_valid(s):
    pairs = {')': '(', ']': '[', '}': '{'}
    stack = []
    for c in s:
        if c in pairs:                 # a closing bracket
            if not stack or stack.pop() != pairs[c]:
                return False           # mismatch, or nothing open
        else:                          # an opening bracket
            stack.append(c)
    return not stack                   # leftover opens → invalid
```
**O(n) time, O(n) space.**

Edge cases to state out loud: empty string (valid), only closers `")"` (the `not stack` guard), only openers `"("` (the final `not stack` check). Naming edge cases unprompted is a strong signal.

---

## 1.7 Five-day plan for this file

| Day | Work |
|---|---|
| **1** | §1.1 memory model, §1.2 Big-O. Then: for 10 random LeetCode Easy problems, *without solving them*, read only the constraints and predict the intended complexity. Check against the editorial. |
| **2** | §1.4 recursion. Implement all four Fibonacci versions from scratch, no reference. Then: factorial, sum of a list, reverse a string, power(x, n) — each recursively. |
| **3** | §1.5 toolkit. Type out every snippet by hand into a REPL. Don't copy-paste — typing builds recall. |
| **4** | §1.6 worked examples. Then solve, from scratch: Contains Duplicate, Valid Anagram, Two Sum, Valid Parentheses. Write complexity for each before coding. |
| **5** | Re-solve all four from Day 4 with no reference. Then read [02-arrays-hashing-pointers.md](02-arrays-hashing-pointers.md) and begin the real grind. |

**Self-check before moving on.** You should be able to answer all of these without looking:
- Why is dict lookup O(1) and what's its worst case?
- What complexity does `n ≤ 10⁵` imply, and why?
- Why is naive Fibonacci O(2ⁿ), and what one change makes it O(n)?
- What is the difference between `list.pop(0)` and `deque.popleft()`?
- Why does `[[0]*3]*3` break?
- If a recursive function calls itself once per element down a chain of n elements, what is its stack space? (Why does Python's default limit of 1000 matter here?)

If any answer is shaky, re-read that section. This foundation is load-bearing for everything that follows.

→ Next: **[02 — Arrays, Hashing, Two Pointers, Sliding Window](02-arrays-hashing-pointers.md)**
