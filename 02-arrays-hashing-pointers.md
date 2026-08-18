# 02 — Arrays, Hashing, Two Pointers, Sliding Window

**Weeks 1–3. ~20 problems.** This is the single highest-yield file in the curriculum — roughly 40% of interview problems are one of these four patterns, and the rest build on them.

> **Forward references:** this file may name techniques taught later. Those are previews, not prerequisites — read past them. See [How to read this curriculum](01-foundations.md#how-to-read-this-curriculum).

---

## Pattern 1: Hashing (space-for-time)

### The idea

You have a nested loop because you keep re-scanning data you've already seen. Store what you've seen in a `dict` or `set`, and the inner scan becomes an O(1) lookup. O(n²) → O(n), paying O(n) memory.

### Recognition triggers

- "find a pair / triple that sums to X"
- "has this appeared before?"
- "count occurrences of"
- "group these by some property"
- "find the first non-repeating / the majority element"
- Anywhere your first instinct is a nested loop over the same array

### The three shapes

```python
# SHAPE A: seen-set — "have I encountered this?"
def contains_duplicate(nums):
    seen = set()
    for x in nums:
        if x in seen:
            return True
        seen.add(x)
    return False
# O(n) time, O(n) space
# One-liner: return len(set(nums)) != len(nums)

# SHAPE B: value → index map — "where did I see this?"
def two_sum(nums, target):
    seen = {}
    for i, x in enumerate(nums):
        if target - x in seen:
            return [seen[target - x], i]
        seen[x] = i

# SHAPE C: frequency map — "how many times?"
from collections import Counter, defaultdict
def top_k_frequent(nums, k):
    return [x for x, _ in Counter(nums).most_common(k)]
```

### The grouping trick

When a problem says "group things that share a property," compute a **canonical key** for that property and use it as the dict key.

```python
# Group Anagrams. Two words are anagrams iff their sorted letters match.
def group_anagrams(strs):
    groups = defaultdict(list)
    for s in strs:
        key = "".join(sorted(s))        # canonical form — O(k log k)
        groups[key].append(s)
    return list(groups.values())
# O(n * k log k), n = words, k = max word length

# Faster key: a 26-length count tuple → O(n*k), no sort
def group_anagrams_fast(strs):
    groups = defaultdict(list)
    for s in strs:
        count = [0] * 26
        for c in s:
            count[ord(c) - ord('a')] += 1
        groups[tuple(count)].append(s)   # lists aren't hashable — tuple() them
    return list(groups.values())
```

Mentioning the O(n·k) alternative after giving the O(n·k log k) one is exactly the kind of thing that turns a "hire" into a "strong hire."

### Worked: Longest Consecutive Sequence

> Given an unsorted array, find the length of the longest run of consecutive integers. **Must be O(n).**

The O(n) requirement forbids sorting. So: put everything in a set for O(1) membership, then only start counting from numbers that *begin* a run.

```python
def longest_consecutive(nums):
    s = set(nums)
    best = 0
    for x in s:
        if x - 1 in s:        # x is not the start of a run — skip it
            continue
        length = 1
        while x + length in s:
            length += 1
        best = max(best, length)
    return best
```

**Why this is O(n) and not O(n²):** the inner `while` only runs for numbers that start a sequence, and across all sequences it visits each element exactly once. Total inner work is O(n). Being able to *argue* this is the whole point of the problem — an interviewer will ask.

### Prefix sums

A prefix sum array lets you answer "sum of the subarray from i to j" in O(1) after O(n) preprocessing.

```python
# prefix[i] = sum of nums[0..i-1]
def build_prefix(nums):
    prefix = [0] * (len(nums) + 1)
    for i, x in enumerate(nums):
        prefix[i + 1] = prefix[i] + x
    return prefix

# sum(nums[i..j]) inclusive = prefix[j+1] - prefix[i]
```

**Combined with hashing** this solves an entire family of "count subarrays with property X" problems:

```python
# Subarray Sum Equals K — count subarrays summing to k
def subarray_sum(nums, k):
    count = 0
    running = 0
    seen = {0: 1}          # a prefix sum of 0 has occurred once (empty prefix)
    for x in nums:
        running += x
        # if some earlier prefix equals running - k, the subarray between
        # that point and here sums to exactly k
        count += seen.get(running - k, 0)
        seen[running] = seen.get(running, 0) + 1
    return count
# O(n) time, O(n) space
```

The `seen = {0: 1}` initialization handles subarrays starting at index 0. It is the #1 bug in this problem — understand *why* it's there.

Same skeleton, different modulus/parity, solves: subarrays divisible by k, subarrays with equal 0s and 1s, continuous subarray sum. Learn the skeleton, not the instances.

### Product-except-self (the two-pass prefix trick)

> Return an array where `out[i]` = product of all elements except `nums[i]`. No division. O(n).

```python
def product_except_self(nums):
    n = len(nums)
    out = [1] * n
    prefix = 1
    for i in range(n):            # out[i] = product of everything LEFT of i
        out[i] = prefix
        prefix *= nums[i]
    suffix = 1
    for i in range(n - 1, -1, -1):  # multiply in everything RIGHT of i
        out[i] *= suffix
        suffix *= nums[i]
    return out
# O(n) time, O(1) extra space (output doesn't count)
```

"Compute a left-pass and a right-pass, combine" is a reusable technique — it also solves Trapping Rain Water and Candy.

### Problem set

| Problem | Key insight |
|---|---|
| Contains Duplicate | set membership |
| Valid Anagram | `Counter(s) == Counter(t)` |
| Two Sum | value→index map, check before insert |
| Group Anagrams | canonical key (sorted string or count tuple) |
| Top K Frequent Elements | Counter + heap of size k, or bucket sort by frequency for O(n) |
| Product of Array Except Self | prefix pass + suffix pass |
| Valid Sudoku | three dicts of sets; box key is `(r//3, c//3)` |
| Encode and Decode Strings | length-prefix each string: `"4#word"` — delimiters alone fail |
| Longest Consecutive Sequence | set + only start from run-beginnings |
| Subarray Sum Equals K | prefix sum + hashmap, seed `{0:1}` |

---

## Pattern 2: Two Pointers

### The idea

Two indices moving through the array under a rule. Because each pointer only moves forward (or they only move toward each other), total movement is O(n) — you replace a nested loop with a single coordinated pass.

### Recognition triggers

- **The array is sorted** (or you can sort it)
- "find a pair/triplet with property X"
- palindrome checks
- "remove duplicates in place" / "move zeroes" / any O(1)-space rearrangement
- "container / area / span between two positions"

### Shape A: opposite ends (converging)

```python
def two_sum_sorted(nums, target):
    lo, hi = 0, len(nums) - 1
    while lo < hi:
        s = nums[lo] + nums[hi]
        if s == target:
            return [lo, hi]
        elif s < target:
            lo += 1        # need a bigger sum → move the small side up
        else:
            hi -= 1        # need a smaller sum → move the big side down
    return []
# O(n) time, O(1) space
```

**Why this is correct** — this is the argument you must be able to make: if `s < target`, then `nums[lo]` paired with *anything* at or below `hi` is too small (the array is sorted, so `hi` is the largest available partner). So `lo` can never be part of a solution and is safely discarded. Each step eliminates one index → O(n). That style of "eliminate a possibility with proof" reasoning is what separates strong candidates.

### Shape B: same direction (slow/fast, read/write)

```python
# Remove duplicates from a sorted array, in place, return new length
def remove_duplicates(nums):
    if not nums: return 0
    write = 1                        # next slot to write into
    for read in range(1, len(nums)):
        if nums[read] != nums[write - 1]:
            nums[write] = nums[read]
            write += 1
    return write

# Move all zeroes to the end, preserve order, in place
def move_zeroes(nums):
    write = 0
    for read in range(len(nums)):
        if nums[read] != 0:
            nums[write], nums[read] = nums[read], nums[write]
            write += 1
```

The read/write pointer pair is the standard tool for "modify the array in place with O(1) extra space."

### Worked: 3Sum (the canonical two-pointer problem)

> Find all unique triplets summing to zero.

**The reduction:** fix one element, and the rest is Two Sum on a sorted array. Sorting also makes deduplication trivial.

```python
def three_sum(nums):
    nums.sort()                       # O(n log n)
    res = []
    n = len(nums)
    for i in range(n - 2):
        if nums[i] > 0:               # sorted: no way to reach 0 from here
            break
        if i > 0 and nums[i] == nums[i - 1]:
            continue                  # skip duplicate anchors
        lo, hi = i + 1, n - 1
        while lo < hi:
            s = nums[i] + nums[lo] + nums[hi]
            if s < 0:
                lo += 1
            elif s > 0:
                hi -= 1
            else:
                res.append([nums[i], nums[lo], nums[hi]])
                lo += 1
                hi -= 1
                # skip duplicates on the left side
                while lo < hi and nums[lo] == nums[lo - 1]:
                    lo += 1
    return res
# O(n²) time (n anchors × O(n) scan), O(1) extra space beyond output
```

The dedup logic is where everyone loses this problem. Two separate skips are needed: duplicate `i` anchors, and duplicate `lo` values after recording a hit. Walk through `[-2,0,0,2,2]` by hand until it's clear.

### Worked: Container With Most Water

> Heights array; pick two lines forming the largest water container. Area = `min(h[i], h[j]) * (j - i)`.

```python
def max_area(height):
    lo, hi = 0, len(height) - 1
    best = 0
    while lo < hi:
        best = max(best, min(height[lo], height[hi]) * (hi - lo))
        if height[lo] < height[hi]:
            lo += 1              # move the SHORTER line inward
        else:
            hi -= 1
    return best
```

**The greedy proof:** moving the taller line inward can only shrink the width while the height stays capped by the shorter line — the area cannot improve. Moving the shorter line is the only move that can possibly help. Therefore discarding it is safe. Say this out loud; the code is trivial, the argument is the interview.

### Problem set

| Problem | Key insight |
|---|---|
| Valid Palindrome | converge from both ends, skip non-alphanumeric |
| Two Sum II (sorted) | converging pointers, no extra space |
| 3Sum | sort + fix one + two pointers + dedup twice |
| Container With Most Water | always move the shorter line |
| Trapping Rain Water | two pointers with running `left_max`/`right_max`; water at i = `min(maxes) - h[i]` |
| Remove Duplicates from Sorted Array | read/write pointers |
| Move Zeroes | read/write with swap |
| Sort Colors (Dutch flag) | three pointers: low, mid, high |
| 4Sum | sort + two nested anchors + two pointers → O(n³) |

---

## Pattern 3: Sliding Window

### The idea

A contiguous window `[left, right]` over an array or string. Expand `right` to include more; when the window violates a constraint, shrink from `left` until it's valid again. Each index is added once and removed once → **O(n)** even though it looks nested.

### Recognition triggers

- **"contiguous" subarray or **substring** — this is the hard requirement. Not subsequence.
- "longest / shortest / maximum / minimum ... satisfying a condition"
- "at most k distinct" / "at most k replacements" / "no repeating characters"
- "fixed window of size k"

If the problem allows non-contiguous elements, sliding window is wrong — that's DP or greedy.

### Template A: variable window (the workhorse)

```python
def variable_window(s):
    window = {}          # or a Counter / a running sum / a set
    left = 0
    best = 0
    for right in range(len(s)):
        # 1. EXPAND — add s[right] to the window
        window[s[right]] = window.get(s[right], 0) + 1

        # 2. SHRINK — while the window is invalid, remove from the left
        while WINDOW_IS_INVALID:
            window[s[left]] -= 1
            if window[s[left]] == 0:
                del window[s[left]]
            left += 1

        # 3. RECORD — the window is now valid
        best = max(best, right - left + 1)
    return best
```

Memorize this shape. Ninety percent of sliding-window problems are this template with `WINDOW_IS_INVALID` swapped out.

### Template B: fixed window of size k

```python
def fixed_window(nums, k):
    window_sum = sum(nums[:k])
    best = window_sum
    for right in range(k, len(nums)):
        window_sum += nums[right] - nums[right - k]   # add new, drop old
        best = max(best, window_sum)
    return best
```

### Worked: Longest Substring Without Repeating Characters

```python
def length_of_longest_substring(s):
    last = {}          # char -> most recent index
    left = 0
    best = 0
    for right, c in enumerate(s):
        if c in last and last[c] >= left:
            left = last[c] + 1      # jump left past the previous occurrence
        last[c] = right
        best = max(best, right - left + 1)
    return best
# O(n) time, O(min(n, alphabet)) space
```

The `last[c] >= left` guard matters: a repeat that already fell out of the window must be ignored. Without it, `"abba"` returns the wrong answer. Trace `"abba"` by hand.

### Worked: Longest Repeating Character Replacement

> You may replace at most `k` characters. Find the longest substring of a single repeated character achievable.

**Key insight:** a window is valid when `window_length - count_of_most_frequent_char <= k`, because the other characters are exactly the ones you'd have to replace.

```python
def character_replacement(s, k):
    count = {}
    left = 0
    max_freq = 0
    best = 0
    for right, c in enumerate(s):
        count[c] = count.get(c, 0) + 1
        max_freq = max(max_freq, count[c])
        while (right - left + 1) - max_freq > k:     # too many replacements
            count[s[left]] -= 1
            left += 1
        best = max(best, right - left + 1)
    return best
```

A subtlety worth understanding: `max_freq` is never decreased when shrinking. That's deliberate and still correct — a stale-high `max_freq` only prevents the window from *growing*, never lets an invalid answer be recorded. It's an optimization; you can recompute `max(count.values())` for correctness at O(26) cost and mention the trade.

### Worked: Minimum Window Substring (Hard, and worth the time)

> Find the shortest substring of `s` containing all characters of `t`, including multiplicities.

```python
from collections import Counter

def min_window(s, t):
    if not s or not t:
        return ""
    need = Counter(t)
    have = {}
    required = len(need)      # distinct chars we must satisfy
    formed = 0                # how many are currently satisfied
    left = 0
    best_len = float('inf')
    best_range = (0, 0)

    for right, c in enumerate(s):
        have[c] = have.get(c, 0) + 1
        if c in need and have[c] == need[c]:
            formed += 1

        while formed == required:            # valid — try to shrink
            if right - left + 1 < best_len:
                best_len = right - left + 1
                best_range = (left, right)
            lc = s[left]
            have[lc] -= 1
            if lc in need and have[lc] < need[lc]:
                formed -= 1                  # no longer valid
            left += 1

    return "" if best_len == float('inf') else s[best_range[0]:best_range[1] + 1]
# O(|s| + |t|) time, O(|s| + |t|) space
```

The `formed`/`required` counters are the trick: they let you check validity in O(1) instead of comparing two dicts (O(alphabet)) on every step. This is the hardest problem in the section — do it, then re-do it a week later, then again a month later. It appears at Meta and Amazon constantly.

### Sliding Window Maximum (monotonic deque)

> Maximum of every window of size k. Requires O(n).

A heap gives O(n log k). The O(n) solution uses a deque holding **indices** with decreasing values:

```python
from collections import deque

def max_sliding_window(nums, k):
    dq = deque()      # indices, values decreasing front→back
    out = []
    for i, x in enumerate(nums):
        while dq and dq[0] <= i - k:      # drop indices outside the window
            dq.popleft()
        while dq and nums[dq[-1]] <= x:   # anything smaller than x is useless
            dq.pop()                       # — x is newer AND bigger
        dq.append(i)
        if i >= k - 1:
            out.append(nums[dq[0]])        # front is always the max
    return out
# O(n) — each index enters and leaves the deque exactly once
```

This is the bridge into monotonic-stack thinking (file 03).

### Problem set

| Problem | Key insight |
|---|---|
| Best Time to Buy and Sell Stock | track min so far; profit = price − min |
| Longest Substring Without Repeating Characters | last-seen index map, jump `left` |
| Longest Repeating Character Replacement | valid iff `len - max_freq <= k` |
| Permutation in String | fixed window of `len(s1)`, compare counts |
| Minimum Window Substring | `formed`/`required` counters |
| Sliding Window Maximum | monotonic decreasing deque of indices |
| Fruit Into Baskets | longest window with ≤ 2 distinct |
| Max Consecutive Ones III | longest window with ≤ k zeroes |

---

## Choosing between the four

```
Contiguous subarray/substring + optimize a length/sum?
    → SLIDING WINDOW

Sorted array (or sortable) + find pairs/triplets, or in-place rearrange?
    → TWO POINTERS

Need to look up "have I seen X" / count frequencies / group by property?
    → HASHING

Many range-sum queries, or "count subarrays with sum property"?
    → PREFIX SUM (+ hashing)
```

When stuck, the sequence is always: **brute force → find the repeated work → pick the structure that eliminates it.** Hash map removes repeated searching. Two pointers removes repeated pairing. Sliding window removes repeated re-summing.

---

## Week 1–3 schedule

| Week | Problems | Focus |
|---|---|---|
| 1 | Contains Duplicate, Valid Anagram, Two Sum, Group Anagrams, Top K Frequent, Product Except Self, Valid Sudoku, Encode/Decode, Longest Consecutive | hashing reflex — reach for a dict before a nested loop |
| 2 | Valid Palindrome, Two Sum II, 3Sum, Container With Most Water, Trapping Rain Water, Remove Duplicates, Move Zeroes | pointer discipline — be able to *prove* why a pointer moves |
| 3 | Best Time to Buy/Sell, Longest Substring w/o Repeating, Char Replacement, Permutation in String, Min Window Substring, Sliding Window Maximum | window template from memory, no reference |

**End-of-section check:** given a new problem, can you name the pattern within 60 seconds and write the template skeleton before working out the details? That's the actual skill. Problem count is a proxy; pattern recognition speed is the thing.

→ Next: **[03 — Stacks, Queues, Binary Search, Linked Lists](03-stack-search-linkedlist.md)**
