# 07 — Greedy, Intervals, Bit Manipulation, Math

**Weeks 13–15. ~30 problems.** Shorter topics, but each has a small number of tricks that appear over and over. Intervals in particular show up constantly at Amazon and Meta.

> **Forward references:** this file may name techniques taught later. Those are previews, not prerequisites — read past them. See [How to read this curriculum](01-foundations.md#how-to-read-this-curriculum).

---

## Pattern 12: Greedy

### The idea

Make the locally best choice at each step and never reconsider. When it works, it's simpler and faster than DP — usually O(n log n) instead of O(n²).

The catch: greedy is **often wrong**, and the interview is about knowing when it's right.

### Greedy vs DP — how to decide

Greedy works when the problem has the **greedy choice property**: a locally optimal choice is always part of some globally optimal solution.

The practical test in an interview: **try to construct a counterexample.** Spend 60 seconds actively trying to break your greedy rule with a small adversarial input. If you can't, state your reasoning and proceed. If you can, switch to DP.

Classic illustration — Coin Change. Greedy (always take the largest coin) works for US coins `[1,5,10,25]`. It fails for `[1,3,4]` making 6: greedy gives `4+1+1` = 3 coins, optimal is `3+3` = 2 coins. Same problem, different coin set, different correct algorithm. **Bring up this counterexample when a greedy approach is proposed for coin change** — it's a well-known signal of understanding.

| Use greedy | Use DP |
|---|---|
| a proof or strong intuition for the local choice | choices interact across steps |
| sorting reveals an obvious order | "count the number of ways" |
| "any valid answer" is acceptable | a locally bad choice can enable a better global outcome |
| interval scheduling, Huffman, MST | knapsack, edit distance, LIS |

### The exchange argument (how to prove greedy is correct)

Suppose an optimal solution differs from your greedy choice. Show you can **swap** in the greedy choice without making the solution worse. Therefore some optimal solution contains the greedy choice, and by induction greedy is optimal.

Applied to Activity Selection (pick the maximum number of non-overlapping intervals): greedy takes the interval that **ends earliest**. Why? Suppose an optimal solution starts with some other interval `X`. The earliest-ending interval `G` finishes no later than `X`, so replacing `X` with `G` leaves at least as much room for everything after. The swap never hurts. → greedy is optimal.

You don't need a formal proof in an interview, but articulating the swap argument in two sentences is a strong senior signal.

### Core greedy problems

```python
# Jump Game: can you reach the last index?
def can_jump(nums):
    reach = 0
    for i, x in enumerate(nums):
        if i > reach: return False       # a gap we can't cross
        reach = max(reach, i + x)
    return True
# O(n) — track the furthest reachable index

# Jump Game II: minimum jumps to reach the end
def jump(nums):
    jumps = curr_end = furthest = 0
    for i in range(len(nums) - 1):
        furthest = max(furthest, i + nums[i])
        if i == curr_end:                # exhausted the current jump's range
            jumps += 1
            curr_end = furthest
    return jumps
# This is BFS by levels, expressed without a queue.

# Gas Station: find the start index enabling a full circuit
def can_complete_circuit(gas, cost):
    if sum(gas) < sum(cost): return -1   # a solution must exist if total >= 0
    start = tank = 0
    for i in range(len(gas)):
        tank += gas[i] - cost[i]
        if tank < 0:                     # can't reach i+1 from `start`
            start = i + 1                # ...nor from anything between them
            tank = 0
    return start
```

Gas Station's key argument: if you run dry between `start` and `i`, then **no** station in that range can be a valid start either — each of them has an even smaller running tank at the failure point. That lets you skip forward, giving O(n) instead of O(n²).

```python
# Hand of Straights / Divide Array in Sets of K Consecutive
from collections import Counter
import heapq
def is_n_straight_hand(hand, group_size):
    if len(hand) % group_size: return False
    count = Counter(hand)
    for x in sorted(count):               # always start from the smallest
        c = count[x]
        if c > 0:
            for k in range(x, x + group_size):
                if count[k] < c: return False
                count[k] -= c
    return True
```

The greedy rule: the smallest remaining card *must* start a group, since nothing smaller can precede it. That forced move is the whole solution.

### Problem set

| Problem | Greedy rule |
|---|---|
| Maximum Subarray | Kadane's — reset when the running sum goes negative |
| Jump Game | track furthest reach |
| Jump Game II | BFS-by-levels without a queue |
| Gas Station | reset start on deficit |
| Hand of Straights | smallest card must start a group |
| Merge Triplets to Form Target | only consider triplets that don't exceed the target |
| Partition Labels | extend the partition to the last occurrence of each char |
| Valid Parenthesis String | track a *range* of possible open counts |
| Task Scheduler | schedule the most frequent task first |
| Minimum Number of Arrows to Burst Balloons | interval scheduling by end time |

---

## Pattern 13: Intervals

### The idea

Almost every interval problem begins with **sorting** — by start time or by end time — and the choice between those two determines the whole solution.

**Sort by START** when you need to merge or detect overlaps in order.
**Sort by END** when you're maximizing the count of non-overlapping intervals (interval scheduling).

Two intervals `[a1,b1]` and `[a2,b2]` **overlap** iff `a1 < b2 and a2 < b1`. Use `<=` if touching endpoints count as overlapping — always clarify this with the interviewer; it's a legitimate ambiguity and asking scores points.

### Core operations

```python
# Merge Intervals
def merge(intervals):
    intervals.sort(key=lambda x: x[0])            # by start
    out = []
    for start, end in intervals:
        if out and start <= out[-1][1]:           # overlaps the last merged
            out[-1][1] = max(out[-1][1], end)     # extend it
        else:
            out.append([start, end])
    return out
# O(n log n)

# Insert Interval — input is already sorted and non-overlapping
def insert(intervals, new):
    out = []
    i, n = 0, len(intervals)
    while i < n and intervals[i][1] < new[0]:     # entirely before new
        out.append(intervals[i]); i += 1
    while i < n and intervals[i][0] <= new[1]:    # overlapping — absorb
        new = [min(new[0], intervals[i][0]), max(new[1], intervals[i][1])]
        i += 1
    out.append(new)
    out.extend(intervals[i:])                     # entirely after
    return out
# O(n), no sort needed

# Non-overlapping Intervals: minimum removals to eliminate all overlaps
def erase_overlap_intervals(intervals):
    intervals.sort(key=lambda x: x[1])            # by END — interval scheduling
    count = 0
    prev_end = float('-inf')
    for start, end in intervals:
        if start >= prev_end:
            prev_end = end                        # keep it
        else:
            count += 1                            # drop it (it ends later)
    return count
```

Sorting by end here is the entire solution — with an earliest-ending survivor you always leave maximum room for what follows. Sorting by start gives a wrong answer. This is *the* interval trap.

### The sweep-line / event-counting technique

For "how many things overlap at once," convert intervals into `+1` at start and `-1` at end, sort the events, and sweep.

```python
# Meeting Rooms II — minimum rooms required
def min_meeting_rooms(intervals):
    starts = sorted(i[0] for i in intervals)
    ends   = sorted(i[1] for i in intervals)
    rooms = best = 0
    s = e = 0
    while s < len(starts):
        if starts[s] < ends[e]:
            rooms += 1                  # a meeting begins before one ends
            best = max(best, rooms)
            s += 1
        else:
            rooms -= 1                  # a meeting ended, free a room
            e += 1
    return best
# O(n log n)
```

Decoupling starts from ends — sorting them into two independent lists — is the sweep-line idea. It also solves Car Pooling, My Calendar, and Employee Free Time. The heap version from [04-trees-heaps](04-trees-heaps.md) is equivalent; know both and mention the trade (heap is more intuitive, sweep uses less memory).

### Problem set

| Problem | Key insight |
|---|---|
| Insert Interval | three phases: before / merge / after |
| Merge Intervals | sort by start, extend the last |
| Non-overlapping Intervals | **sort by end** |
| Meeting Rooms | sort by start, check adjacent pairs |
| Meeting Rooms II | sweep line or min-heap of end times |
| Minimum Interval to Include Each Query (Hard) | sort queries + heap of intervals |
| Car Pooling | sweep line on the timeline |
| Interval List Intersections | two pointers over two sorted lists |

---

## Pattern 14: Bit Manipulation

### The operators

```python
a & b      # AND  — 1 only where BOTH are 1
a | b      # OR   — 1 where EITHER is 1
a ^ b      # XOR  — 1 where they DIFFER
~a         # NOT  — flips all bits (in Python: ~a == -a - 1)
a << k     # left shift  — multiply by 2^k
a >> k     # right shift — floor-divide by 2^k
```

### XOR — the one that matters

Three properties do all the work:

```
x ^ x = 0          # a value cancels itself
x ^ 0 = x          # identity
XOR is commutative and associative — order is irrelevant
```

Therefore: XOR everything together, and anything appearing an even number of times vanishes.

```python
# Single Number: every element appears twice except one
def single_number(nums):
    result = 0
    for x in nums:
        result ^= x                 # pairs cancel to 0
    return result
# O(n) time, O(1) space — the point is O(1) space vs a hash set

# Missing Number in 0..n
def missing_number(nums):
    result = len(nums)
    for i, x in enumerate(nums):
        result ^= i ^ x             # index and value cancel except the missing
    return result
# Alternative: n*(n+1)//2 - sum(nums)

# Swap two variables without a temp (a party trick, but they ask)
a ^= b; b ^= a; a ^= b
```

### The standard bit tricks

```python
n & 1                  # is n odd?
n >> 1                 # n // 2
n & (n - 1)            # clears the LOWEST set bit
n & (n - 1) == 0       # is n a power of 2? (for n > 0)
n & (-n)               # ISOLATES the lowest set bit
n | (1 << i)           # set bit i
n & ~(1 << i)          # clear bit i
n ^ (1 << i)           # flip bit i
(n >> i) & 1           # read bit i
bin(n).count('1')      # popcount — Python's easy way
n.bit_length()         # number of bits needed
```

**Why `n & (n-1)` clears the lowest set bit:** subtracting 1 flips the lowest 1 to 0 and turns every 0 below it into 1. ANDing with the original keeps only the bits above. Example: `12 = 1100`, `11 = 1011`, `12 & 11 = 1000`. Being able to explain this rather than recite it is what's being tested.

```python
# Number of 1 Bits — Brian Kernighan's algorithm
def hamming_weight(n):
    count = 0
    while n:
        n &= n - 1          # remove one set bit per iteration
        count += 1
    return count
# O(number of set bits), not O(32)

# Counting Bits: popcount for every number 0..n, in O(n)
def count_bits(n):
    dp = [0] * (n + 1)
    for i in range(1, n + 1):
        dp[i] = dp[i >> 1] + (i & 1)     # same as i//2, plus the last bit
    return dp
# DP + bits — a nice combination they like
```

### Bitmask as a set

For n ≤ 20, represent a subset of n items as an n-bit integer. Enables bitmask DP (Traveling Salesman, Partition to K Equal Sum Subsets).

```python
for mask in range(1 << n):          # all 2^n subsets
    subset = [items[i] for i in range(n) if mask & (1 << i)]

mask | (1 << i)         # add element i
mask & ~(1 << i)        # remove element i
mask & (1 << i)         # test membership
bin(mask).count('1')    # subset size
mask == (1 << n) - 1    # is the set complete?
```

The `n ≤ 20` constraint is the giveaway: 2²⁰ ≈ 10⁶ states, which fits. Seeing that constraint and saying "this suggests bitmask DP" is exactly the constraint-reading skill from file 01 paying off.

### Problem set

| Problem | Key insight |
|---|---|
| Single Number | XOR everything |
| Single Number II | count bits mod 3, or two-mask state machine |
| Number of 1 Bits | `n &= n-1` loop |
| Counting Bits | `dp[i] = dp[i>>1] + (i&1)` |
| Reverse Bits | shift out of one, shift into the other |
| Missing Number | XOR indices with values |
| Sum of Two Integers | XOR = sum without carry, AND<<1 = carry; loop |
| Reverse Integer | overflow bounds (matters outside Python) |
| Subsets | bitmask enumeration as an alternative to backtracking |

---

## Pattern 15: Math & Geometry

Less common, but these specific problems recur.

### Matrix manipulation

```python
# Rotate Image 90° clockwise, in place
def rotate(matrix):
    matrix.reverse()                             # 1. flip vertically
    for i in range(len(matrix)):                 # 2. transpose
        for j in range(i + 1, len(matrix)):
            matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]
# Reverse-then-transpose = rotate clockwise.
# Transpose-then-reverse-each-row = also clockwise. Know one, derive the other.

# Spiral Matrix — shrink four boundaries
def spiral_order(matrix):
    out = []
    top, bottom = 0, len(matrix) - 1
    left, right = 0, len(matrix[0]) - 1
    while top <= bottom and left <= right:
        for c in range(left, right + 1): out.append(matrix[top][c])
        top += 1
        for r in range(top, bottom + 1): out.append(matrix[r][right])
        right -= 1
        if top <= bottom:                        # guard: single row remaining
            for c in range(right, left - 1, -1): out.append(matrix[bottom][c])
            bottom -= 1
        if left <= right:                        # guard: single column
            for r in range(bottom, top - 1, -1): out.append(matrix[r][left])
            left += 1
    return out
```

The two `if` guards prevent double-counting when a single row or column remains. Omitting them is the standard bug.

```python
# Set Matrix Zeroes in O(1) space — use row 0 and column 0 as marker storage
def set_zeroes(matrix):
    rows, cols = len(matrix), len(matrix[0])
    first_col_zero = any(matrix[r][0] == 0 for r in range(rows))
    for r in range(rows):
        for c in range(1, cols):
            if matrix[r][c] == 0:
                matrix[r][0] = matrix[0][c] = 0       # mark in the margins
    for r in range(rows - 1, -1, -1):                 # fill BACKWARD so the
        for c in range(cols - 1, 0, -1):              # markers survive
            if matrix[r][0] == 0 or matrix[0][c] == 0:
                matrix[r][c] = 0
        if first_col_zero:
            matrix[r][0] = 0
```

### Number theory

```python
import math

# Sieve of Eratosthenes — all primes below n in O(n log log n)
def sieve(n):
    is_prime = [True] * n
    is_prime[0] = is_prime[1] = False
    for i in range(2, int(n ** 0.5) + 1):
        if is_prime[i]:
            for j in range(i * i, n, i):     # start at i*i — smaller multiples
                is_prime[j] = False           # were already marked
    return [i for i, p in enumerate(is_prime) if p]

# Fast exponentiation — O(log n)
def my_pow(x, n):
    if n < 0:
        x, n = 1 / x, -n
    result = 1
    while n:
        if n & 1:
            result *= x                       # this bit is set — multiply in
        x *= x                                # square the base
        n >>= 1
    return result

math.gcd(a, b)
def lcm(a, b): return a * b // math.gcd(a, b)
```

### Problem set

| Problem | Key insight |
|---|---|
| Rotate Image | reverse + transpose |
| Spiral Matrix | four shrinking boundaries + guards |
| Set Matrix Zeroes | first row/col as markers, fill backward |
| Happy Number | cycle detection with fast/slow, or a seen-set |
| Plus One | carry propagation from the right |
| Pow(x, n) | binary exponentiation |
| Multiply Strings | grade-school multiplication into an index array |
| Detect Squares | count point frequencies, look for diagonals |
| Count Primes | sieve |

---

## Weeks 13–15 schedule

| Week | Focus |
|---|---|
| 13 | Greedy (10 problems). For every one, try to break your rule with a counterexample before coding. |
| 14 | Intervals (8). Always ask yourself: sort by start or by end, and why? |
| 15 | Bits (8) + Math (6). Type out every trick by hand. |

**Section check:**
- Give the coin-change counterexample showing greedy fails on `[1,3,4]` for 6.
- Explain when to sort intervals by start vs by end.
- Explain what `n & (n-1)` does and why.
- Explain why `n ≤ 20` in constraints suggests a bitmask.

→ Next: **[08 — Interview Craft](08-interview-craft.md)** — how to actually convert this knowledge into offers.
