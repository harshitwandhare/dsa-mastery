# 06 — Dynamic Programming

**Weeks 10–13. ~25 problems.** DP is where most people give up. It's actually the most *mechanical* topic once you have a method, because there are only about eight recurring shapes. This file gives you the method, then the shapes.

> **Forward references:** this file may name techniques taught later. Those are previews, not prerequisites — read past them. See [How to read this curriculum](01-foundations.md#how-to-read-this-curriculum).

---

## 6.1 What DP actually is

Dynamic programming is **recursion + not repeating work.** That's it. There is no other content.

Three conditions must hold:

1. **Optimal substructure** — the answer to the big problem is built from answers to smaller versions of the same problem.
2. **Overlapping subproblems** — the same smaller problems come up repeatedly. (Without this, it's just divide-and-conquer — merge sort has optimal substructure but no overlap, so it isn't DP.)
3. The subproblems form a **DAG** — no circular dependencies.

Recall Fibonacci from [01-foundations](01-foundations.md): naive recursion is O(2ⁿ) because `fib(3)` is recomputed exponentially many times. Caching each result makes it O(n). **Every DP problem is that exact move.** The only thing that varies is what the subproblem is.

### Two directions, same thing

| | Top-down (memoization) | Bottom-up (tabulation) |
|---|---|---|
| Style | recursion + a cache | loops filling a table |
| Order | natural, driven by recursion | you must determine it |
| Pro | easier to write from the recurrence; only computes what's needed | no recursion limit; easier to space-optimize |
| Con | stack depth; function-call overhead | must reason out fill order |

**Write top-down first.** It follows directly from the recurrence, which is the hard part. Convert to bottom-up only if you need the space optimization or hit recursion limits. Say this in interviews — "I'll write the memoized version since it maps directly to the recurrence, then convert to bottom-up if we want O(1) space" reads as fluent.

---

## 6.2 The method — five steps, every time

This is the process. Follow it mechanically instead of trying to have an insight.

### Step 1 — Write the brute-force recursion

Forget efficiency. Ask: **at this point, what are my choices, and what does each one leave me with?**

```python
# Climbing Stairs: n steps, take 1 or 2 at a time. How many distinct ways?
def climb(n):
    if n == 0: return 1        # one way to be done: take nothing
    if n < 0:  return 0        # overshot — invalid
    return climb(n - 1) + climb(n - 2)      # take 1 step, or take 2
```

The choices *are* the recurrence. Almost every DP recurrence is one of:
- `take it` vs `skip it` (knapsack, house robber, subsets)
- `match` vs `don't match` (edit distance, LCS, regex)
- `try every split point` (interval DP, matrix chain, burst balloons)
- `extend the previous run` vs `start fresh` (max subarray, LIS)

### Step 2 — Identify the state

**The state is the minimal set of variables that fully determines the remaining subproblem.** This is the only genuinely hard part of DP, and it's where you should spend your thinking time.

Ask: *if someone froze the program here and handed me only these variables, could I finish the problem?* If yes, that's your state. If you need more, add it.

| Problem | State | Meaning |
|---|---|---|
| Climbing Stairs | `i` | ways to reach step i |
| House Robber | `i` | max loot from houses 0..i |
| Coin Change | `amount` | fewest coins to make `amount` |
| LIS | `i` | longest increasing subseq **ending at** i |
| Edit Distance | `(i, j)` | cost to convert `a[:i]` into `b[:j]` |
| 0/1 Knapsack | `(i, capacity)` | best value using items 0..i within capacity |
| Buy/Sell Stock w/ Cooldown | `(i, holding)` | best profit at day i, holding or not |
| Burst Balloons | `(i, j)` | best coins from bursting the open interval (i, j) |

**State size determines complexity.** One variable ranging over n → O(n) states. Two variables → O(n·m) states. Multiply by the work per state (usually O(1) or O(n)) to get total time. Do this calculation before coding — if it exceeds the constraint budget, your state is wrong.

### Step 3 — Write the recurrence and base cases

State the transition as an equation before writing code:

```
dp[i] = dp[i-1] + dp[i-2]                       # climbing stairs
dp[i] = max(dp[i-1], dp[i-2] + nums[i])         # house robber
dp[a] = 1 + min(dp[a - c] for c in coins)       # coin change
```

Base cases are the smallest inputs answered directly. Getting them wrong is the most common DP bug — decide deliberately whether the empty case is 0, 1, or infinity, and *why*.

### Step 4 — Memoize

```python
from functools import cache

@cache
def climb(n):
    if n == 0: return 1
    if n < 0:  return 0
    return climb(n - 1) + climb(n - 2)
```

Or by hand — know how, because interviewers ask:

```python
def climb(n, memo=None):
    if memo is None: memo = {}
    if n == 0: return 1
    if n < 0:  return 0
    if n in memo: return memo[n]
    memo[n] = climb(n - 1) + climb(n - 2)
    return memo[n]
```

### Step 5 — Convert to bottom-up, then optimize space

```python
def climb(n):
    dp = [0] * (n + 1)
    dp[0] = 1
    for i in range(1, n + 1):
        dp[i] = dp[i-1] + (dp[i-2] if i >= 2 else 0)
    return dp[n]

# Space-optimized: only the last two values are ever read
def climb(n):
    a, b = 1, 1
    for _ in range(n - 1):
        a, b = b, a + b
    return b
# O(n) time, O(1) space
```

**The space-optimization rule:** if `dp[i]` only depends on `dp[i-1]` and `dp[i-2]`, you need two variables, not an array. If a 2-D `dp[i][j]` only depends on row `i-1`, you need two rows, not the full matrix. This turns O(n·m) space into O(m) and is a routine follow-up question — expect it.

---

## 6.3 The eight shapes

### Shape 1 — Linear DP over an index

`dp[i]` depends on a constant number of earlier entries.

```python
# House Robber: can't rob adjacent houses
def rob(nums):
    prev2, prev1 = 0, 0
    for x in nums:
        prev2, prev1 = prev1, max(prev1, prev2 + x)
        #                        skip     rob this one
    return prev1
# O(n) time, O(1) space

# House Robber II: houses in a circle — first and last are adjacent
def rob2(nums):
    if len(nums) == 1: return nums[0]
    def rob_line(a):
        p2 = p1 = 0
        for x in a:
            p2, p1 = p1, max(p1, p2 + x)
        return p1
    return max(rob_line(nums[:-1]), rob_line(nums[1:]))
    # either skip the last house or skip the first — run linear twice
```

Reducing a circular problem to two linear ones is a reusable trick.

```python
# Maximum Subarray (Kadane's) — the cleanest DP in existence
def max_subarray(nums):
    best = curr = nums[0]
    for x in nums[1:]:
        curr = max(x, curr + x)        # start fresh here, or extend the run
        best = max(best, curr)
    return best
```

Kadane's is DP in disguise: `curr` is `dp[i]` = best subarray *ending at* i. Say that out loud; it shows you see the structure rather than having memorized four lines.

```python
# Decode Ways: "12" → "AB" or "L"
def num_decodings(s):
    if not s or s[0] == '0': return 0
    prev2, prev1 = 1, 1
    for i in range(1, len(s)):
        curr = 0
        if s[i] != '0':
            curr += prev1                              # single-digit decode
        if 10 <= int(s[i-1:i+1]) <= 26:
            curr += prev2                              # two-digit decode
        if curr == 0: return 0                         # dead end
        prev2, prev1 = prev1, curr
    return prev1
```

### Shape 2 — Decision DP with a state machine

When each position has a *mode* (holding a stock, in cooldown, used a transaction), add the mode to the state.

```python
# Best Time to Buy and Sell Stock with Cooldown
def max_profit(prices):
    hold = float('-inf')     # max profit while holding a stock
    sold = float('-inf')     # max profit having just sold (→ cooldown)
    rest = 0                 # max profit free to buy
    for p in prices:
        prev_sold = sold
        sold = hold + p                  # sell what we hold
        hold = max(hold, rest - p)       # keep holding, or buy from rest
        rest = max(rest, prev_sold)      # stay resting, or exit cooldown
    return max(sold, rest)
# O(n) time, O(1) space
```

Draw the state machine — three states, labeled transitions — before writing code. Stock problems with a transaction limit `k` add a third dimension: `dp[day][k][holding]`.

### Shape 3 — Unbounded knapsack (items reusable)

```python
# Coin Change: fewest coins to make `amount`, unlimited supply
def coin_change(coins, amount):
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0                                  # zero coins to make zero
    for a in range(1, amount + 1):
        for c in coins:
            if c <= a:
                dp[a] = min(dp[a], dp[a - c] + 1)
    return dp[amount] if dp[amount] != float('inf') else -1
# O(amount * len(coins))

# Coin Change II: COUNT the number of combinations
def change(amount, coins):
    dp = [0] * (amount + 1)
    dp[0] = 1
    for c in coins:                # coin loop OUTSIDE
        for a in range(c, amount + 1):
            dp[a] += dp[a - c]
    return dp[amount]
```

**Loop order is load-bearing and it is a favorite interview trap.** Coin loop outside → counts *combinations* ({1,2} once). Amount loop outside → counts *permutations* ({1,2} and {2,1} separately). Understand why: with coins outside, you finish considering coin 1 entirely before coin 2 ever appears, so no ordering can be double-counted.

```python
# Word Break: can s be segmented into dictionary words?
def word_break(s, wordDict):
    words = set(wordDict)
    dp = [False] * (len(s) + 1)
    dp[0] = True                        # empty string is segmentable
    for i in range(1, len(s) + 1):
        for j in range(i):
            if dp[j] and s[j:i] in words:
                dp[i] = True
                break
    return dp[len(s)]
# O(n² * L)
```

### Shape 4 — 0/1 knapsack (each item once)

```python
# Partition Equal Subset Sum: can nums be split into two equal-sum halves?
def can_partition(nums):
    total = sum(nums)
    if total % 2: return False           # odd total → impossible, early exit
    target = total // 2
    possible = {0}                       # reachable subset sums
    for x in nums:
        possible |= {p + x for p in possible if p + x <= target}
        if target in possible: return True
    return target in possible
# O(n * target)

# Classic 0/1 knapsack, for reference
def knapsack(weights, values, capacity):
    dp = [0] * (capacity + 1)
    for i in range(len(weights)):
        for c in range(capacity, weights[i] - 1, -1):   # BACKWARD
            dp[c] = max(dp[c], dp[c - weights[i]] + values[i])
    return dp[capacity]
```

**The backward inner loop is what enforces "each item once."** Going forward would let `dp[c - w]` already include item i, reusing it. Forward = unbounded, backward = 0/1. This one line is a frequent interview question in itself.

### Shape 5 — Two-sequence DP (2-D grid)

State is `(i, j)` = position in each of two sequences. The recurrence almost always has the same shape: if the characters match, take the diagonal; otherwise take the best of the two neighbors.

```python
# Longest Common Subsequence
def lcs(a, b):
    m, n = len(a), len(b)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if a[i-1] == b[j-1]:
                dp[i][j] = dp[i-1][j-1] + 1            # match: extend diagonal
            else:
                dp[i][j] = max(dp[i-1][j], dp[i][j-1]) # skip one or the other
    return dp[m][n]
# O(m*n) time and space; O(min(m,n)) space with two rows
```

```python
# Edit Distance (Levenshtein)
def min_distance(a, b):
    m, n = len(a), len(b)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m + 1): dp[i][0] = i        # delete all of a
    for j in range(n + 1): dp[0][j] = j        # insert all of b
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if a[i-1] == b[j-1]:
                dp[i][j] = dp[i-1][j-1]                    # free
            else:
                dp[i][j] = 1 + min(dp[i-1][j-1],   # replace
                                   dp[i-1][j],     # delete from a
                                   dp[i][j-1])     # insert into a
    return dp[m][n]
```

Memorize the three-way `min` and what each term means physically. Edit Distance is asked directly and is the parent of a dozen variants (One Edit Distance, Delete Operation for Two Strings, Minimum ASCII Delete Sum).

Same 2-D shape: Distinct Subsequences, Interleaving String, Regular Expression Matching, Wildcard Matching, Longest Palindromic Subsequence (= LCS of `s` and `s[::-1]` — a nice reduction to mention).

### Shape 6 — Grid path DP

```python
# Unique Paths: robot moving only right/down on an m×n grid
def unique_paths(m, n):
    dp = [1] * n                        # first row: exactly one path each
    for _ in range(1, m):
        for j in range(1, n):
            dp[j] += dp[j-1]            # from above (dp[j]) + from left
    return dp[-1]
# O(m*n) time, O(n) space

# Minimum Path Sum
def min_path_sum(grid):
    m, n = len(grid), len(grid[0])
    for i in range(m):
        for j in range(n):
            if i == 0 and j == 0: continue
            up   = grid[i-1][j] if i else float('inf')
            left = grid[i][j-1] if j else float('inf')
            grid[i][j] += min(up, left)
    return grid[-1][-1]                 # modified in place — O(1) extra space
```

### Shape 7 — Longest Increasing Subsequence

```python
# O(n²) DP — the version to write first
def lis(nums):
    dp = [1] * len(nums)                # dp[i] = LIS ENDING at i
    for i in range(len(nums)):
        for j in range(i):
            if nums[j] < nums[i]:
                dp[i] = max(dp[i], dp[j] + 1)
    return max(dp) if dp else 0

# O(n log n) with binary search — the follow-up they want
import bisect
def lis_fast(nums):
    tails = []          # tails[k] = smallest possible tail of an LIS of length k+1
    for x in nums:
        i = bisect.bisect_left(tails, x)
        if i == len(tails):
            tails.append(x)             # x extends the longest run
        else:
            tails[i] = x                # x gives a better (smaller) tail
    return len(tails)
```

`tails` is **not** an actual subsequence — only its *length* is meaningful. State that; interviewers probe it to see if you understand or memorized.

The `dp[i] = best ending at i` framing (rather than "best in 0..i") also solves Longest Increasing Path in a Matrix, Russian Doll Envelopes (sort then LIS), and Maximum Length of Pair Chain.

### Shape 8 — Interval DP

State is `(i, j)` = a subrange. Try every split point inside. Usually O(n³).

```python
# Longest Palindromic Substring — expand around centers, simpler than DP
def longest_palindrome(s):
    res = ""
    for i in range(len(s)):
        for l, r in ((i, i), (i, i + 1)):      # odd-length and even-length
            while l >= 0 and r < len(s) and s[l] == s[r]:
                l -= 1; r += 1
            if r - l - 1 > len(res):
                res = s[l+1:r]
    return res
# O(n²) time, O(1) space — better than the O(n²) space DP

# Burst Balloons (Hard) — the archetypal interval DP
def max_coins(nums):
    nums = [1] + nums + [1]                    # virtual boundary balloons
    n = len(nums)
    dp = [[0] * n for _ in range(n)]
    for length in range(2, n):                 # by increasing interval length
        for i in range(n - length):
            j = i + length
            for k in range(i + 1, j):          # k is the LAST balloon burst
                dp[i][j] = max(dp[i][j],
                               dp[i][k] + nums[i]*nums[k]*nums[j] + dp[k][j])
    return dp[0][n-1]
# O(n³)
```

The insight in Burst Balloons is thinking about which balloon is burst **last** rather than first — that makes the two sides independent. Forward thinking makes the subproblems interfere. "Think about the last decision, not the first" is a general interval-DP unlock.

---

## 6.4 The DP debugging checklist

When your DP is wrong, it is almost always one of these:

1. **Base case wrong.** Is `dp[0]` really 0? Or 1? Or infinity? Coin Change needs `dp[0] = 0`; Coin Change II needs `dp[0] = 1`. Different problems, different meanings.
2. **Off-by-one in indexing.** With a `dp` array of size `n+1`, `dp[i]` corresponds to `s[i-1]`. Pick a convention and stay in it.
3. **Wrong loop direction.** Backward for 0/1 knapsack, forward for unbounded. Backward for LIS-from-the-right variants.
4. **Wrong loop order.** Coin loop outside counts combinations; amount outside counts permutations.
5. **State is incomplete.** If you can't write the recurrence, your state is missing a variable. Add the thing you keep wishing you knew.
6. **Not handling unreachable states.** `float('inf')` for minimization, `float('-inf')` or 0 for maximization — and check for it at the end.
7. **Mutable default argument.** `def f(n, memo={})` shares state across calls. Never do this.

**A concrete debugging technique:** print the DP table for a tiny input and check it by hand.

```python
for row in dp:
    print(row)
```

For a 4×4 example you can verify every cell manually. This finds base-case and off-by-one errors in seconds, and doing it in an interview is a positive signal — it shows methodical debugging rather than random edits.

---

## 6.5 Problem set

### 1-D DP (do these first — weeks 10–11)

| Problem | Shape |
|---|---|
| Climbing Stairs | linear, fib |
| Min Cost Climbing Stairs | linear with a choice |
| House Robber | skip-or-take |
| House Robber II | circular → two linear runs |
| Longest Palindromic Substring | expand around center |
| Palindromic Substrings | expand around center, count |
| Decode Ways | linear with a two-digit lookback |
| Coin Change | unbounded knapsack, minimize |
| Coin Change II | unbounded knapsack, count combinations |
| Maximum Product Subarray | track min AND max (negatives flip) |
| Word Break | segmentation |
| Longest Increasing Subsequence | dp ending at i; then O(n log n) |
| Partition Equal Subset Sum | 0/1 knapsack, reachable sums |
| Maximum Subarray | Kadane's |

### 2-D DP (weeks 12–13)

| Problem | Shape |
|---|---|
| Unique Paths | grid paths |
| Unique Paths II | grid paths with obstacles |
| Minimum Path Sum | grid, min accumulate |
| Longest Common Subsequence | two-sequence |
| Best Time to Buy/Sell with Cooldown | state machine |
| Best Time to Buy/Sell with Transaction Fee | state machine |
| Target Sum | 0/1 knapsack over ± signs |
| Interleaving String | two-sequence, boolean |
| Longest Increasing Path in a Matrix | DFS + memo on the grid |
| Distinct Subsequences | two-sequence, counting |
| Edit Distance | two-sequence, three-way min |
| Burst Balloons (Hard) | interval, think "last" |
| Regular Expression Matching (Hard) | two-sequence with `*` branching |

---

## 6.6 How to practice DP specifically

DP is the one topic where you should **deliberately re-solve**. Pattern recognition here is slower to build than anywhere else.

- **Week 10–11:** 1-D only. For each problem, write the recursion first, then memoize, then tabulate, then space-optimize. All four versions. Yes, it's slow. It's how the method becomes automatic.
- **Week 12–13:** 2-D. Draw the table by hand for a small input before coding, every single time.
- **Ongoing:** every Sunday, re-solve two DP problems from three weeks earlier.

**The interview script for a DP problem:**

> "This looks like DP — I need the optimal answer and the subproblems overlap. Let me define the state: `dp[i]` is [X]. The recurrence is [Y] because at each step my choices are [Z]. Base case is [W]. That gives O(states × work per state) = O(…). Constraints allow that. I'll write it memoized first since it follows the recurrence directly, then convert to bottom-up if you'd like O(1) space."

Delivering that paragraph before writing code is worth more than the code. It's the difference between "solved it" and "clearly knows DP."

→ Next: **[07 — Greedy, Intervals, Bit Manipulation, Math](07-greedy-intervals-bits.md)**
