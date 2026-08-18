# 03 — Stacks, Queues, Binary Search, Linked Lists

**Weeks 3–5. ~25 problems.** Binary search is the highest-leverage single technique in this file — "binary search on the answer" solves problems that look nothing like search.

> **Forward references:** this file may name techniques taught later. Those are previews, not prerequisites — read past them. See [How to read this curriculum](01-foundations.md#how-to-read-this-curriculum).

---

## Pattern 4: Stacks

### The idea

Last in, first out. In Python, just a `list`: `append` to push, `pop` to pop, `stack[-1]` to peek. All O(1).

Reach for a stack whenever the problem has **nesting**, **matching**, or **"the most recent unresolved thing."**

### Recognition triggers

- brackets, parentheses, tags, nested structures
- "evaluate an expression"
- undo / backtrack / history
- **"next greater element" / "previous smaller element"** → monotonic stack
- iterative tree traversal
- "remove k digits to make the smallest number" → monotonic stack

### Basic stack problems

```python
# Valid Parentheses
def is_valid(s):
    pairs = {')': '(', ']': '[', '}': '{'}
    stack = []
    for c in s:
        if c in pairs:
            if not stack or stack.pop() != pairs[c]:
                return False
        else:
            stack.append(c)
    return not stack

# Evaluate Reverse Polish Notation
def eval_rpn(tokens):
    stack = []
    for t in tokens:
        if t in "+-*/" and len(t) == 1:
            b, a = stack.pop(), stack.pop()      # order matters for - and /
            if t == '+': stack.append(a + b)
            elif t == '-': stack.append(a - b)
            elif t == '*': stack.append(a * b)
            else: stack.append(int(a / b))       # truncate toward zero,
        else:                                     # NOT a // b (floors)
            stack.append(int(t))
    return stack[0]

# Min Stack — O(1) getMin
class MinStack:
    def __init__(self):
        self.stack = []
        self.mins = []                    # mins[i] = min of stack[0..i]
    def push(self, x):
        self.stack.append(x)
        self.mins.append(x if not self.mins else min(x, self.mins[-1]))
    def pop(self):
        self.stack.pop(); self.mins.pop()
    def top(self):
        return self.stack[-1]
    def getMin(self):
        return self.mins[-1]
```

MinStack's insight — carry the auxiliary answer alongside each element rather than recomputing — generalizes widely.

### Monotonic stack (the important one)

A stack whose values are kept **strictly increasing or strictly decreasing** from bottom to top. Before pushing, pop everything that violates the order. Each element is pushed once and popped once → **O(n) total**, even with the inner `while`.

**Use it for:** "for each element, find the next/previous greater/smaller element."

```python
# Next Greater Element — for each i, the first j > i with nums[j] > nums[i]
def next_greater(nums):
    res = [-1] * len(nums)
    stack = []                            # indices, values DECREASING
    for i, x in enumerate(nums):
        while stack and nums[stack[-1]] < x:
            res[stack.pop()] = x          # x is the answer for that index
        stack.append(i)
    return res
```

**How to pick the direction** — this is the part people memorize wrongly, so derive it instead:

| You want | Stack holds | Pop while |
|---|---|---|
| next **greater** | decreasing values | `stack top < current` |
| next **smaller** | increasing values | `stack top > current` |
| previous **greater** | decreasing (answer is `stack[-1]` after popping) | `stack top <= current` |
| previous **smaller** | increasing | `stack top >= current` |

The reasoning: you pop an element when the current element *resolves* it. If you're looking for the next greater, a bigger current element resolves everything smaller sitting on the stack.

### Worked: Daily Temperatures

> For each day, how many days until a warmer temperature? 0 if never.

```python
def daily_temperatures(temps):
    res = [0] * len(temps)
    stack = []                          # indices of days awaiting a warmer day
    for i, t in enumerate(temps):
        while stack and temps[stack[-1]] < t:
            j = stack.pop()
            res[j] = i - j              # distance, not the value
        stack.append(i)
    return res
# O(n) time, O(n) space
```

### Worked: Largest Rectangle in Histogram (Hard, high value)

> Bars of given heights, width 1 each. Largest rectangle formed by consecutive bars.

**Insight:** for each bar, the widest rectangle *with that bar's height* extends left until a shorter bar and right until a shorter bar. A monotonic increasing stack finds both boundaries in one pass.

```python
def largest_rectangle_area(heights):
    stack = []          # (start_index, height), heights increasing
    best = 0
    for i, h in enumerate(heights):
        start = i
        while stack and stack[-1][1] > h:
            idx, height = stack.pop()
            best = max(best, height * (i - idx))
            start = idx          # this bar can extend back to idx
        stack.append((start, h))
    # drain: remaining bars extend to the end
    n = len(heights)
    for idx, height in stack:
        best = max(best, height * (n - idx))
    return best
# O(n) time, O(n) space
```

This unlocks Maximal Rectangle (2-D) — run this per row over a histogram of consecutive 1s. Understand it once, get two Hards.

### Problem set

| Problem | Key insight |
|---|---|
| Valid Parentheses | stack of openers |
| Min Stack | parallel mins stack |
| Evaluate RPN | pop two, apply, push; watch operand order |
| Generate Parentheses | backtracking with open/close counts (see file 05) |
| Daily Temperatures | monotonic decreasing stack of indices |
| Car Fleet | sort by position desc, monotonic stack of arrival times |
| Largest Rectangle in Histogram | monotonic increasing stack + drain |
| Asteroid Collision | stack, resolve collisions on push |
| Remove K Digits | monotonic increasing stack, pop while bigger and k remains |
| Decode String | two stacks (counts, strings) or recursion |

---

## Pattern 5: Binary Search

### The idea

Repeatedly halve the search space. O(log n). Requires a **monotonic** property: everything on one side of the answer behaves one way, everything on the other side behaves the other way. Sorted order is the common case, but not the only one.

### The template that avoids off-by-one bugs

Use this exact form. Do not improvise boundaries under time pressure.

```python
def binary_search(nums, target):
    lo, hi = 0, len(nums) - 1          # INCLUSIVE bounds
    while lo <= hi:                    # <= because lo==hi is a valid candidate
        mid = lo + (hi - lo) // 2      # avoids overflow in other languages
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            lo = mid + 1               # mid is ruled out
        else:
            hi = mid - 1
    return -1
```

Three rules that make it always terminate correctly:
1. Bounds are inclusive → loop condition is `lo <= hi`.
2. Always exclude `mid` when moving (`mid + 1` / `mid - 1`) — otherwise infinite loop.
3. When the loop exits, `lo` is the insertion point (the count of elements < target).

### The "find the boundary" template (more useful in practice)

Most real problems aren't "find this exact value" but "find the first position where a condition becomes true."

```python
def first_true(lo, hi, condition):
    """Smallest x in [lo, hi] where condition(x) is True.
       Requires condition to be monotonic: F F F T T T."""
    while lo < hi:
        mid = lo + (hi - lo) // 2
        if condition(mid):
            hi = mid           # mid might be the answer — KEEP it
        else:
            lo = mid + 1       # mid is definitely not — discard
    return lo
```

`lo < hi` with `hi = mid` (not `mid - 1`) is the boundary-search form. Learn both templates and know which you're using.

### Binary search on the answer — the technique that wins interviews

When the problem asks for a **minimum/maximum value satisfying a condition**, and you can *check* a candidate answer efficiently, binary search over the answer space itself.

The tell: constraints have a huge value range (like 10⁹) but a small array. You can't iterate the answers; you can binary search them.

```python
# Koko Eating Bananas: minimum speed k to eat all piles within h hours
import math
def min_eating_speed(piles, h):
    def hours_needed(k):
        return sum(math.ceil(p / k) for p in piles)   # or (p + k - 1)//k

    lo, hi = 1, max(piles)          # answer is somewhere in this range
    while lo < hi:
        mid = (lo + hi) // 2
        if hours_needed(mid) <= h:  # mid works — try smaller
            hi = mid
        else:
            lo = mid + 1
    return lo
# O(n log(max(piles)))
```

The monotonic property being exploited: if speed `k` works, every speed above `k` also works. That F-F-F-T-T-T shape is what makes binary search legal. **Always state that property out loud** — it's the proof your approach is correct.

Same technique: Capacity to Ship Packages in D Days, Split Array Largest Sum, Minimum Time to Complete Trips, Aggressive Cows, Median of Two Sorted Arrays.

### Worked: Search in Rotated Sorted Array

> A sorted array rotated at an unknown pivot. Find target in O(log n).

**Insight:** after splitting at `mid`, **at least one half is still properly sorted.** Determine which, check if the target lies inside it, and discard the other half.

```python
def search_rotated(nums, target):
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        if nums[lo] <= nums[mid]:              # LEFT half is sorted
            if nums[lo] <= target < nums[mid]:
                hi = mid - 1                   # target is in the sorted left
            else:
                lo = mid + 1
        else:                                   # RIGHT half is sorted
            if nums[mid] < target <= nums[hi]:
                lo = mid + 1
            else:
                hi = mid - 1
    return -1
```

`nums[lo] <= nums[mid]` must use `<=`, not `<` — otherwise a two-element array breaks. Test `[3,1]` looking for `1`.

### Worked: Find Minimum in Rotated Sorted Array

```python
def find_min(nums):
    lo, hi = 0, len(nums) - 1
    while lo < hi:
        mid = (lo + hi) // 2
        if nums[mid] > nums[hi]:      # min is strictly right of mid
            lo = mid + 1
        else:                          # min is at mid or left of it
            hi = mid
    return nums[lo]
```

Compare against `nums[hi]`, not `nums[lo]`. Comparing against `lo` fails on non-rotated input. This is a classic trap.

### Problem set

| Problem | Key insight |
|---|---|
| Binary Search | the template |
| Search a 2D Matrix | treat as a flat array: `row = i // cols, col = i % cols` |
| Koko Eating Bananas | binary search on the answer |
| Find Minimum in Rotated Sorted Array | compare to `nums[hi]` |
| Search in Rotated Sorted Array | one half is always sorted |
| Time Based Key-Value Store | list per key + `bisect` on timestamps |
| Median of Two Sorted Arrays (Hard) | binary search the partition point of the smaller array |
| Capacity To Ship Packages | binary search on the answer |
| First Bad Version | boundary template |
| Find Peak Element | move toward the higher neighbor — no sortedness needed |

Find Peak Element is worth internalizing: it proves binary search doesn't require a sorted array, only a monotonic decision rule.

---

## Pattern 6: Linked Lists

### The idea

Nodes chained by pointers. Interviews use them to test whether you can manipulate references without losing track — a proxy for careful pointer reasoning.

```python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next
```

### The two techniques that cover almost everything

**1. Dummy head.** Removes every "what if the list is empty / what if we modify the head" special case.

```python
def build(head):
    dummy = ListNode(0)
    tail = dummy
    while head:
        tail.next = ListNode(head.val)
        tail = tail.next
        head = head.next
    return dummy.next          # skip the dummy
```

Use a dummy head whenever you build a new list or might delete the first node. It converts three edge cases into zero.

**2. Fast/slow pointers (Floyd's).** Fast moves 2 steps, slow moves 1.

```python
# Middle of the list
def middle(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    return slow                # for even length, this is the SECOND middle

# Cycle detection — O(1) space
def has_cycle(head):
    slow = fast = head
    while fast and fast.next:
        slow, fast = slow.next, fast.next.next
        if slow is fast:
            return True
    return False

# Find where the cycle STARTS (Floyd's phase 2)
def detect_cycle(head):
    slow = fast = head
    while fast and fast.next:
        slow, fast = slow.next, fast.next.next
        if slow is fast:
            slow2 = head
            while slow2 is not slow:      # both move 1 step; they meet at start
                slow2, slow = slow2.next, slow.next
            return slow
    return None
```

**Why phase 2 works** (they ask): let `F` = distance head→cycle start, `a` = distance cycle start→meeting point, `C` = cycle length. When they meet, slow has traveled `F + a` and fast has traveled `2(F + a)`, and the difference is a whole number of loops: `F + a = kC`. So `F = kC − a`, meaning walking `F` steps from the head and `F` steps from the meeting point lands on the same node — the cycle start. Being able to derive that is a genuine differentiator.

**Remove Nth node from the end** uses a gap of n between two pointers:

```python
def remove_nth_from_end(head, n):
    dummy = ListNode(0, head)
    slow = fast = dummy
    for _ in range(n):
        fast = fast.next
    while fast.next:
        slow, fast = slow.next, fast.next
    slow.next = slow.next.next     # slow is now just before the target
    return dummy.next
```

### Reversal — write this from memory

```python
# Iterative — O(n) time, O(1) space. This is the expected answer.
def reverse_list(head):
    prev = None
    curr = head
    while curr:
        nxt = curr.next     # 1. save the next node BEFORE breaking the link
        curr.next = prev    # 2. reverse the pointer
        prev = curr         # 3. advance prev
        curr = nxt          # 4. advance curr
    return prev             # prev is the new head

# Recursive — O(n) space (stack)
def reverse_recursive(head):
    if not head or not head.next:
        return head
    new_head = reverse_recursive(head.next)   # leap of faith: rest is reversed
    head.next.next = head                     # point the next node back at us
    head.next = None                          # and cut our forward link
    return new_head
```

The 4-line iterative reversal appears inside a dozen other problems (reverse in k-groups, palindrome check, reorder list). Drill it until it's muscle memory.

### Worked: Reorder List

> `L0 → L1 → … → Ln` becomes `L0 → Ln → L1 → Ln-1 → …`

Three composed sub-problems:

```python
def reorder_list(head):
    if not head or not head.next: return
    # 1. find the middle
    slow, fast = head, head.next
    while fast and fast.next:
        slow, fast = slow.next, fast.next.next
    # 2. reverse the second half
    second = slow.next
    slow.next = None                  # split
    prev = None
    while second:
        nxt = second.next
        second.next = prev
        prev = second
        second = nxt
    # 3. merge alternately
    first, second = head, prev
    while second:
        n1, n2 = first.next, second.next
        first.next = second
        second.next = n1
        first, second = n1, n2
```

Interviews love this one because it tests whether you can *decompose*. Say "this is find-middle, then reverse, then interleave" before writing anything — that framing is most of the score.

### LRU Cache (asked constantly — at Amazon, Meta, Google)

> `get` and `put` both in O(1), evicting least-recently-used at capacity.

Hash map for O(1) lookup + doubly linked list for O(1) reordering. The map stores key→node; the list keeps recency order.

```python
class Node:
    def __init__(self, key=0, val=0):
        self.key, self.val = key, val
        self.prev = self.next = None

class LRUCache:
    def __init__(self, capacity):
        self.cap = capacity
        self.map = {}
        self.head = Node()            # sentinel: most recent side
        self.tail = Node()            # sentinel: least recent side
        self.head.next, self.tail.prev = self.tail, self.head

    def _remove(self, node):
        node.prev.next = node.next
        node.next.prev = node.prev

    def _add_front(self, node):
        node.next = self.head.next
        node.prev = self.head
        self.head.next.prev = node
        self.head.next = node

    def get(self, key):
        if key not in self.map:
            return -1
        node = self.map[key]
        self._remove(node); self._add_front(node)     # mark as most recent
        return node.val

    def put(self, key, value):
        if key in self.map:
            self._remove(self.map[key])
        node = Node(key, value)
        self.map[key] = node
        self._add_front(node)
        if len(self.map) > self.cap:
            lru = self.tail.prev
            self._remove(lru)
            del self.map[lru.key]      # need lru.key — that's why nodes store it
```

Two sentinel nodes eliminate every null check. Storing `key` inside the node is required for eviction — forgetting it is the standard bug.

This is also a Low-Level Design question (file 09). One problem, two interview categories.

### Problem set

| Problem | Key insight |
|---|---|
| Reverse Linked List | prev/curr/next, 4 lines |
| Merge Two Sorted Lists | dummy head + compare |
| Linked List Cycle | fast/slow |
| Find the Duplicate Number | array as implicit linked list → Floyd's |
| Reorder List | middle + reverse + merge |
| Remove Nth Node From End | gap of n, dummy head |
| Copy List With Random Pointer | old→new hashmap, two passes |
| Add Two Numbers | dummy head + carry |
| LRU Cache | hashmap + doubly linked list + sentinels |
| Merge K Sorted Lists | min-heap of k heads → O(N log k) |
| Reverse Nodes in K-Group (Hard) | count k ahead, reverse the block, reconnect |

---

## Weeks 3–5 schedule

| Week | Focus |
|---|---|
| 3 | Stacks: basic 5, then monotonic (Daily Temperatures, Car Fleet, Largest Rectangle) |
| 4 | Binary search: both templates, then rotated arrays, then binary-search-on-answer (Koko, Ship Packages) |
| 5 | Linked lists: reversal from memory daily, then fast/slow, then LRU Cache |

**Section check:**
- Write the binary search template and the boundary template, from memory, no off-by-one errors.
- Explain when a monotonic stack should be increasing vs decreasing, from the reasoning, not memory.
- Write iterative linked-list reversal in under 60 seconds.
- Explain why Floyd's phase 2 finds the cycle start.

→ Next: **[04 — Trees, Tries, Heaps](04-trees-heaps.md)**
