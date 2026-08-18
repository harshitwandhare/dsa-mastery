# 11 — Advanced Algorithms & The Gaps

**Weeks 16–22, after NeetCode 150.** Everything the pattern files deliberately deferred. Ordered by how often it's actually asked, so you can stop partway and still be covered.

| Section | Asked how often | Priority |
|---|---|---|
| 11.1 Sorting implementations + quickselect | Common — directly asked | **Do this** |
| 11.2 String algorithms (Rabin-Karp, KMP) | Occasional (Google, Meta) | **Do this** |
| 11.3 Bitmask DP | Occasional | **Do this** |
| 11.4 Advanced graph algorithms | Occasional (rising in 2026) | **Do this** |
| 11.5 Segment tree / Fenwick tree | Rare (~2%) | Skim |
| 11.6 Math, number theory, matrix exponentiation | Rare | Skim |
| 11.7 Game theory / minimax | Rare | Skim |
| 11.8 Randomized & sampling algorithms | Rare, but distinctive | Skim |
| 11.9 Geometry | Rare | Skim |
| 11.10 Design-heavy data structures | Common at Amazon/Meta | **Do this** |

---

## 11.1 Sorting — implement them, don't just cite them

"Implement quicksort" and "why is merge sort stable but quicksort isn't" are asked directly. You cannot answer with `nums.sort()`.

### Merge sort

```python
def merge_sort(nums):
    if len(nums) <= 1:
        return nums
    mid = len(nums) // 2
    left = merge_sort(nums[:mid])
    right = merge_sort(nums[mid:])
    return merge(left, right)

def merge(a, b):
    out = []
    i = j = 0
    while i < len(a) and j < len(b):
        if a[i] <= b[j]:        # <= (not <) is what makes it STABLE
            out.append(a[i]); i += 1
        else:
            out.append(b[j]); j += 1
    out.extend(a[i:])
    out.extend(b[j:])
    return out
```

**O(n log n) always** — best, average, and worst. **O(n) extra space.** **Stable** (equal elements keep their original relative order, because ties take from the left half first).

Why it's O(n log n): the recursion halves the array, giving log n levels; each level does O(n) total merging work.

**Merge sort is the answer when:** you need guaranteed O(n log n) (no worst case), you need stability, you're sorting a linked list (O(1) extra space there, since you re-link instead of copying), or you're sorting data too big for memory (external sort).

**Count Inversions** — a classic follow-up that merge sort solves for free:

```python
def count_inversions(nums):
    def sort_count(a):
        if len(a) <= 1: return a, 0
        mid = len(a) // 2
        left, x = sort_count(a[:mid])
        right, y = sort_count(a[mid:])
        merged, z = merge_count(left, right)
        return merged, x + y + z

    def merge_count(a, b):
        out, inv, i, j = [], 0, 0, 0
        while i < len(a) and j < len(b):
            if a[i] <= b[j]:
                out.append(a[i]); i += 1
            else:
                out.append(b[j]); j += 1
                inv += len(a) - i      # a[i:] are ALL greater than b[j]
        out.extend(a[i:]); out.extend(b[j:])
        return out, inv

    return sort_count(nums)[1]
# O(n log n) — the brute force is O(n²)
```

The same idea solves Count of Smaller Numbers After Self and Reverse Pairs.

### Quicksort

```python
import random

def quicksort(nums, lo=0, hi=None):
    if hi is None: hi = len(nums) - 1
    if lo >= hi: return
    p = partition(nums, lo, hi)
    quicksort(nums, lo, p - 1)
    quicksort(nums, p + 1, hi)

def partition(nums, lo, hi):
    # random pivot avoids the O(n²) worst case on sorted input
    r = random.randint(lo, hi)
    nums[r], nums[hi] = nums[hi], nums[r]
    pivot = nums[hi]
    i = lo                                  # boundary: everything < i is <= pivot
    for j in range(lo, hi):
        if nums[j] <= pivot:
            nums[i], nums[j] = nums[j], nums[i]
            i += 1
    nums[i], nums[hi] = nums[hi], nums[i]   # put the pivot in its final place
    return i
```

**Average O(n log n), worst O(n²)** (when every pivot is the min or max — e.g. already-sorted input with a first/last pivot). **O(log n) stack space**, sorts **in place**. **Not stable** — the partition swap moves equal elements past each other arbitrarily.

**Randomizing the pivot is the fix** for the worst case, and mentioning it unprompted is the point of the question. Introsort (what C++ `std::sort` uses) switches to heapsort after too much recursion depth to guarantee O(n log n).

**Quicksort vs merge sort, the answer they want:** quicksort is usually faster in practice despite the same asymptotic average — better cache locality (it works in place on contiguous memory) and a smaller constant factor. Merge sort wins when you need a worst-case guarantee, stability, or you're on a linked list.

### Heapsort

```python
def heapsort(nums):
    def sift_down(a, start, end):
        root = start
        while 2 * root + 1 <= end:
            child = 2 * root + 1
            if child + 1 <= end and a[child] < a[child + 1]:
                child += 1
            if a[root] < a[child]:
                a[root], a[child] = a[child], a[root]
                root = child
            else:
                return
    n = len(nums)
    for start in range(n // 2 - 1, -1, -1):    # build a max-heap, O(n)
        sift_down(nums, start, n - 1)
    for end in range(n - 1, 0, -1):
        nums[0], nums[end] = nums[end], nums[0]  # move max to the end
        sift_down(nums, 0, end - 1)
    return nums
```

**O(n log n) guaranteed, O(1) space, not stable.** Slower than quicksort in practice (bad cache locality — it jumps around the array), but it's the only common sort that's both worst-case O(n log n) *and* in-place.

### Quickselect — O(n) average k-th element

The single most valuable algorithm in this section. It's quicksort that only recurses into the half containing the answer.

```python
import random

def quickselect(nums, k):
    """k-th SMALLEST (1-indexed). For k-th largest: quickselect(nums, len(nums)-k+1)"""
    lo, hi = 0, len(nums) - 1
    target = k - 1                       # convert to 0-indexed
    while True:
        if lo == hi:
            return nums[lo]
        p = partition(nums, lo, hi)      # same partition as quicksort
        if p == target:
            return nums[p]
        elif p < target:
            lo = p + 1                   # answer is in the right half only
        else:
            hi = p - 1
```

**O(n) average**, O(n²) worst (mitigated by a random pivot). Beats both sorting (O(n log n)) and the heap approach (O(n log k)).

The recursion-tree argument for O(n): each step processes half as much as the last, so total work is n + n/2 + n/4 + … = **2n**. Being able to state that is the point.

Use it for: Kth Largest Element in an Array, Top K Frequent Elements, K Closest Points to Origin, Median of an unsorted array, Wiggle Sort II.

**Interview strategy:** offer the heap solution first (O(n log k), fast to write, hard to get wrong), then say "if we want O(n) average I'd use quickselect" and implement it if asked. That sequencing shows range without risking a botched partition under time pressure.

### Non-comparison sorts

Comparison-based sorting has a proven **Ω(n log n)** lower bound: there are n! possible orderings, a binary decision tree needs log₂(n!) ≈ n log n comparisons to distinguish them. Knowing *why* that bound exists is a good signal.

You beat it by not comparing:

```python
# Counting sort — O(n + k) for integers in a small known range [0, k]
def counting_sort(nums, k):
    count = [0] * (k + 1)
    for x in nums:
        count[x] += 1
    out = []
    for v, c in enumerate(count):
        out.extend([v] * c)
    return out

# Bucket sort — distribute into buckets by value, sort each
# Used in Top K Frequent Elements: bucket index = frequency → O(n) overall
def top_k_frequent(nums, k):
    from collections import Counter
    freq = Counter(nums)
    buckets = [[] for _ in range(len(nums) + 1)]
    for num, count in freq.items():
        buckets[count].append(num)          # index BY frequency
    out = []
    for count in range(len(buckets) - 1, 0, -1):
        for num in buckets[count]:
            out.append(num)
            if len(out) == k: return out
```

Radix sort: O(d·(n+b)) — sort by each digit using a stable counting sort. Used for Maximum Gap.

**The constraint tell:** when values are bounded (`0 ≤ nums[i] ≤ 100`) but n is huge, counting/bucket sort turns O(n log n) into O(n).

### Sorting cheat sheet

| Algorithm | Best | Average | Worst | Space | Stable | In place |
|---|---|---|---|---|---|---|
| Merge sort | n log n | n log n | n log n | O(n) | yes | no |
| Quicksort | n log n | n log n | n² | O(log n) | no | yes |
| Heapsort | n log n | n log n | n log n | O(1) | no | yes |
| Insertion sort | n | n² | n² | O(1) | yes | yes |
| Timsort (Python) | n | n log n | n log n | O(n) | yes | no |
| Counting sort | n+k | n+k | n+k | O(k) | yes | no |
| Radix sort | d(n+b) | d(n+b) | d(n+b) | O(n+b) | yes | no |

Python's `sorted()` is **Timsort** — a hybrid of merge sort and insertion sort that detects already-sorted runs. It's O(n) on sorted input and stable. Naming it when asked "what does Python use" is a small free point.

---

## 11.2 String algorithms

### Rabin-Karp (rolling hash) — the one to actually learn

Substring search using a hash that updates in O(1) as the window slides.

```python
def rabin_karp(text, pattern):
    n, m = len(text), len(pattern)
    if m > n: return -1
    BASE, MOD = 256, 10**9 + 7

    pattern_hash = 0
    window_hash = 0
    high = pow(BASE, m - 1, MOD)          # BASE^(m-1), for removing the front char

    for i in range(m):
        pattern_hash = (pattern_hash * BASE + ord(pattern[i])) % MOD
        window_hash  = (window_hash  * BASE + ord(text[i]))    % MOD

    for i in range(n - m + 1):
        if window_hash == pattern_hash:
            if text[i:i+m] == pattern:     # verify — hashes can collide
                return i
        if i < n - m:
            # roll: drop text[i], add text[i+m]
            window_hash = ((window_hash - ord(text[i]) * high) * BASE
                           + ord(text[i+m])) % MOD
    return -1
# O(n + m) average, O(n*m) worst (all collisions)
```

The rolling update — subtract the outgoing character's contribution, shift, add the incoming one — is the reusable idea. It powers Repeated DNA Sequences, Longest Duplicate Substring (rolling hash + binary search on length), and Distinct Echo Substrings.

**Always verify on a hash match.** Trusting the hash alone is a correctness bug, and interviewers check for it.

### KMP — O(n+m) worst-case substring search

```python
def build_lps(pattern):
    """lps[i] = length of the longest proper prefix of pattern[:i+1]
       that is also a suffix of it."""
    lps = [0] * len(pattern)
    length = 0
    i = 1
    while i < len(pattern):
        if pattern[i] == pattern[length]:
            length += 1
            lps[i] = length
            i += 1
        elif length:
            length = lps[length - 1]    # fall back — don't restart at 0
        else:
            lps[i] = 0
            i += 1
    return lps

def kmp_search(text, pattern):
    if not pattern: return 0
    lps = build_lps(pattern)
    i = j = 0
    while i < len(text):
        if text[i] == pattern[j]:
            i += 1; j += 1
            if j == len(pattern):
                return i - j
        elif j:
            j = lps[j - 1]              # skip ahead using the prefix table
        else:
            i += 1
    return -1
```

**The idea:** on a mismatch, naive search restarts the pattern from position 0. KMP knows how much of the pattern it already matched and jumps to the longest prefix that's also a suffix — no re-reading of the text. That's why it's O(n+m).

KMP also solves: Shortest Palindrome, Repeated Substring Pattern (`n % (n - lps[-1]) == 0`), and Implement strStr().

### Manacher's — longest palindromic substring in O(n)

Rarely required (expand-around-center at O(n²) is normally accepted), but know it exists and what it does: it reuses palindrome information from already-computed centers to avoid re-expanding, achieving O(n). If asked for better than O(n²), name it.

### Trie-adjacent string techniques

- **Suffix array / suffix automaton** — competitive programming, essentially never in interviews. Skip.
- **Z-algorithm** — computes, for each position, the length of the longest substring starting there that's also a prefix. Same use cases as KMP, simpler to write. Learn one of the two, not both.

---

## 11.3 Bitmask DP

When n ≤ 20 and the state is "which subset have I used," encode the subset as an integer.

```python
# Partition to K Equal Sum Subsets
def can_partition_k_subsets(nums, k):
    total = sum(nums)
    if total % k: return False
    target = total // k
    nums.sort(reverse=True)              # big items first prunes hard
    if nums[0] > target: return False
    n = len(nums)

    from functools import cache
    @cache
    def dfs(mask, current_sum):
        if mask == (1 << n) - 1:         # every item used
            return True
        for i in range(n):
            if mask & (1 << i):          # already used
                continue
            if current_sum + nums[i] > target:
                continue                  # prune
            new_sum = (current_sum + nums[i]) % target   # roll over to next bucket
            if dfs(mask | (1 << i), new_sum):
                return True
        return False
    return dfs(0, 0)
# O(2^n * n) states
```

The `% target` trick means you never track *which* bucket you're filling — you fill one, and when it's exactly full the modulo resets you to a fresh bucket. That's the elegant part.

```python
# Traveling Salesman (held-karp) — the canonical bitmask DP
def tsp(dist):
    n = len(dist)
    from functools import cache
    @cache
    def dp(mask, city):
        """min cost to have visited `mask`, currently standing at `city`"""
        if mask == (1 << n) - 1:
            return dist[city][0]                  # return home
        best = float('inf')
        for nxt in range(n):
            if mask & (1 << nxt): continue
            best = min(best, dist[city][nxt] + dp(mask | (1 << nxt), nxt))
        return best
    return dp(1, 0)
# O(2^n * n²) — feasible to about n = 20
```

**The state design is the lesson:** `(which subset is done, where am I now)`. Same shape for Shortest Path Visiting All Nodes, Minimum Cost to Connect Two Groups, Campus Bikes II, Maximum Students Taking Exam.

**Iterating submasks** — occasionally needed:

```python
sub = mask
while sub:
    ...              # sub is a submask of mask
    sub = (sub - 1) & mask
```

---

## 11.4 Advanced graph algorithms

Graphs appear in roughly three quarters of senior onsite loops, and weighted-path problems have been rising. These are worth more than they used to be.

### Bellman-Ford — negative weights

```python
def bellman_ford(n, edges, src):
    dist = [float('inf')] * n
    dist[src] = 0
    for _ in range(n - 1):              # n-1 relaxation rounds suffice
        changed = False
        for u, v, w in edges:
            if dist[u] != float('inf') and dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                changed = True
        if not changed: break            # early exit
    # one more pass: if anything still improves, a negative cycle exists
    for u, v, w in edges:
        if dist[u] != float('inf') and dist[u] + w < dist[v]:
            return None                  # negative cycle
    return dist
# O(V * E)
```

Why n−1 rounds: any shortest path has at most n−1 edges, and each round guarantees correctness one edge deeper.

**Cheapest Flights Within K Stops** is Bellman-Ford with exactly k+1 rounds — and you must relax from a *snapshot* of the previous round's distances, or a single round can chain multiple hops:

```python
def find_cheapest_price(n, flights, src, dst, k):
    dist = [float('inf')] * n
    dist[src] = 0
    for _ in range(k + 1):
        tmp = dist[:]                    # snapshot — this line is the whole trick
        for u, v, w in flights:
            if dist[u] + w < tmp[v]:
                tmp[v] = dist[u] + w
        dist = tmp
    return dist[dst] if dist[dst] != float('inf') else -1
```

### Floyd-Warshall — all-pairs shortest paths

```python
def floyd_warshall(n, edges):
    dist = [[float('inf')] * n for _ in range(n)]
    for i in range(n): dist[i][i] = 0
    for u, v, w in edges: dist[u][v] = w
    for k in range(n):                   # k = intermediate node, OUTERMOST loop
        for i in range(n):
            for j in range(n):
                dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])
    return dist
# O(V³) — fine for V ≤ 400 or so
```

`k` must be the outer loop. It's DP over "shortest path using only nodes 0..k as intermediates," and that dimension must be filled first. Getting the loop order wrong is silently incorrect.

### Minimum spanning tree

```python
# Prim's with a heap — grow one tree
import heapq
def prim(points):
    n = len(points)
    visited = set()
    heap = [(0, 0)]                       # (cost, node)
    total = 0
    while len(visited) < n:
        cost, node = heapq.heappop(heap)
        if node in visited: continue
        visited.add(node)
        total += cost
        for nxt in range(n):
            if nxt not in visited:
                d = (abs(points[node][0] - points[nxt][0]) +
                     abs(points[node][1] - points[nxt][1]))
                heapq.heappush(heap, (d, nxt))
    return total
# O(E log V)

# Kruskal's with union-find — sort edges, add if they don't create a cycle
def kruskal(n, edges):
    edges.sort(key=lambda e: e[2])
    uf = UnionFind(n)                     # from file 05
    total = 0
    for u, v, w in edges:
        if uf.union(u, v):                # False means it'd form a cycle
            total += w
    return total
# O(E log E)
```

Prim's for dense graphs, Kruskal's for sparse ones. Both solve Min Cost to Connect All Points and Optimize Water Distribution.

### Topological sort variants

**Lexicographically smallest topological order** — use a heap instead of a deque in Kahn's algorithm.

**Longest path in a DAG** — process in topological order and relax forward. (Longest path in a general graph is NP-hard; the DAG restriction is what makes it easy, and saying so is a signal.)

### Eulerian path (Hierholzer's)

Visit every *edge* exactly once. Used by Reconstruct Itinerary.

```python
def find_itinerary(tickets):
    from collections import defaultdict
    graph = defaultdict(list)
    for src, dst in sorted(tickets, reverse=True):
        graph[src].append(dst)            # reverse sort so pop() gives smallest

    route = []
    stack = ["JFK"]
    while stack:
        while graph[stack[-1]]:
            stack.append(graph[stack[-1]].pop())
        route.append(stack.pop())         # dead end → add to route
    return route[::-1]
```

An Eulerian path exists iff at most one vertex has (outdegree − indegree) = 1, at most one has (indegree − outdegree) = 1, and the rest are balanced.

### Tarjan's — bridges and strongly connected components

A **bridge** is an edge whose removal disconnects the graph — Critical Connections in a Network.

```python
def critical_connections(n, connections):
    from collections import defaultdict
    graph = defaultdict(list)
    for u, v in connections:
        graph[u].append(v); graph[v].append(u)

    disc = [-1] * n          # discovery time
    low  = [0] * n           # lowest discovery time reachable
    bridges = []
    timer = [0]

    def dfs(node, parent):
        disc[node] = low[node] = timer[0]
        timer[0] += 1
        for nei in graph[node]:
            if nei == parent: continue
            if disc[nei] == -1:
                dfs(nei, node)
                low[node] = min(low[node], low[nei])
                if low[nei] > disc[node]:
                    bridges.append([node, nei])   # no back edge around it
            else:
                low[node] = min(low[node], disc[nei])
    dfs(0, -1)
    return bridges
# O(V + E)
```

`low[nei] > disc[node]` means the subtree below `nei` has no alternative route back — so that edge is the only connection. Understand that condition; the rest is bookkeeping.

### Bipartite check

```python
from collections import deque
def is_bipartite(graph):
    color = {}
    for start in range(len(graph)):
        if start in color: continue
        color[start] = 0
        q = deque([start])
        while q:
            node = q.popleft()
            for nei in graph[node]:
                if nei not in color:
                    color[nei] = 1 - color[node]
                    q.append(nei)
                elif color[nei] == color[node]:
                    return False           # odd cycle → not bipartite
    return True
```

A graph is bipartite iff it has no odd-length cycle. Solves Possible Bipartition and Is Graph Bipartite.

---

## 11.5 Segment tree & Fenwick tree

Both solve: **range queries with point updates**, in O(log n) each. Without them you choose between O(1) query / O(n) update (prefix sums) or O(n) query / O(1) update (raw array).

Asked in maybe 2% of interviews, and almost never for interns. Read once, don't drill.

### Fenwick tree (Binary Indexed Tree) — prefix sums with updates

```python
class BIT:
    def __init__(self, n):
        self.n = n
        self.tree = [0] * (n + 1)         # 1-indexed

    def update(self, i, delta):           # add delta at index i (0-indexed input)
        i += 1
        while i <= self.n:
            self.tree[i] += delta
            i += i & (-i)                 # move to the next responsible node

    def query(self, i):                   # prefix sum of [0..i]
        i += 1
        s = 0
        while i > 0:
            s += self.tree[i]
            i -= i & (-i)                 # strip the lowest set bit
        return s

    def range_query(self, l, r):
        return self.query(r) - (self.query(l - 1) if l else 0)
# update and query both O(log n)
```

`i & (-i)` isolates the lowest set bit — the same trick from [file 07](07-greedy-intervals-bits.md). Each tree node covers a range whose length is that value, which is how the whole structure works in 15 lines.

### Segment tree — any associative range operation

```python
class SegmentTree:
    def __init__(self, nums):
        self.n = len(nums)
        self.tree = [0] * (2 * self.n)
        for i, x in enumerate(nums):
            self.tree[self.n + i] = x           # leaves
        for i in range(self.n - 1, 0, -1):
            self.tree[i] = self.tree[2*i] + self.tree[2*i + 1]   # internal nodes

    def update(self, i, val):
        i += self.n
        self.tree[i] = val
        while i > 1:
            i //= 2
            self.tree[i] = self.tree[2*i] + self.tree[2*i + 1]

    def query(self, l, r):                       # sum of [l, r)
        l += self.n; r += self.n
        s = 0
        while l < r:
            if l & 1: s += self.tree[l]; l += 1
            if r & 1: r -= 1; s += self.tree[r]
            l //= 2; r //= 2
        return s
```

Swap `+` for `min`, `max`, or `gcd` and it handles those too — that flexibility is segment trees' advantage over BIT, which is simpler but sum-only (and simpler to write, so prefer it when sums are all you need).

Problems: Range Sum Query — Mutable, Count of Smaller Numbers After Self, The Skyline Problem, Falling Squares.

---

## 11.6 Math & number theory

```python
import math

# GCD / LCM
math.gcd(a, b)                       # Euclid's: gcd(a,b) = gcd(b, a % b)
def lcm(a, b): return a * b // math.gcd(a, b)

# Modular arithmetic — needed when problems say "mod 10^9 + 7"
MOD = 10**9 + 7
(a + b) % MOD
(a * b) % MOD
pow(a, b, MOD)                       # fast modular exponentiation, O(log b)
pow(a, MOD - 2, MOD)                 # modular INVERSE (Fermat, MOD prime)
                                     # → division under a modulus

# Combinatorics
math.comb(n, k)                      # n choose k
math.perm(n, k)
math.factorial(n)

# Primality — O(sqrt(n))
def is_prime(n):
    if n < 2: return False
    if n % 2 == 0: return n == 2
    for i in range(3, math.isqrt(n) + 1, 2):
        if n % i == 0: return False
    return True

# Prime factorization — O(sqrt(n))
def prime_factors(n):
    factors = []
    d = 2
    while d * d <= n:
        while n % d == 0:
            factors.append(d); n //= d
        d += 1
    if n > 1: factors.append(n)
    return factors
```

### Matrix exponentiation — linear recurrences in O(log n)

Fibonacci in O(log n): `[[1,1],[1,0]]^n` has fib(n) in a corner. Generalizes to any linear recurrence.

```python
def mat_mult(A, B, mod):
    n = len(A)
    return [[sum(A[i][k] * B[k][j] for k in range(n)) % mod
             for j in range(n)] for i in range(n)]

def mat_pow(M, p, mod):
    n = len(M)
    result = [[int(i == j) for j in range(n)] for i in range(n)]   # identity
    while p:
        if p & 1: result = mat_mult(result, M, mod)
        M = mat_mult(M, M, mod)
        p >>= 1
    return result
```

The tell: a linear recurrence with `n ≤ 10^18`. Rare, but unmistakable when it appears.

---

## 11.7 Game theory / minimax

Two players alternate, both play optimally. The state includes **whose turn it is**, and you maximize on your turn, minimize on theirs.

```python
# Predict the Winner / Stone Game
def predict_the_winner(nums):
    from functools import cache
    @cache
    def dp(i, j):
        """max score difference (current player minus opponent) for nums[i..j]"""
        if i == j: return nums[i]
        take_left  = nums[i] - dp(i + 1, j)      # opponent then plays optimally
        take_right = nums[j] - dp(i, j - 1)
        return max(take_left, take_right)
    return dp(0, len(nums) - 1) >= 0
```

**The score-difference trick** — returning `my score − opponent's score` — removes the need for a turn flag, because subtracting the recursive result automatically flips perspective. It's the standard formulation and worth knowing.

```python
# Nim Game — sometimes the answer is pure math
def can_win_nim(n):
    return n % 4 != 0        # you lose iff n is a multiple of 4
```

Problems: Stone Game I–IX, Predict the Winner, Nim Game, Flip Game II, Cat and Mouse (Hard).

---

## 11.8 Randomized algorithms

Distinctive because most candidates have never seen them.

```python
# Reservoir sampling — pick k uniformly at random from a stream of unknown length
import random
def reservoir_sample(stream, k):
    reservoir = []
    for i, x in enumerate(stream):
        if i < k:
            reservoir.append(x)
        else:
            j = random.randint(0, i)      # replace with probability k/(i+1)
            if j < k:
                reservoir[j] = x
    return reservoir
```

Proof sketch: element i survives with probability k/i at every subsequent step; the product telescopes to k/n. Solves Linked List Random Node and Random Pick Index — both of which specify "the list length is unknown," which is the tell.

```python
# Fisher-Yates shuffle — uniform random permutation in O(n)
def shuffle(nums):
    for i in range(len(nums) - 1, 0, -1):
        j = random.randint(0, i)          # must include i
        nums[i], nums[j] = nums[j], nums[i]
    return nums
```

Picking `j` from `0..n-1` instead of `0..i` produces a *biased* shuffle — a genuine bug that shipped in real products. Knowing that is a good answer to "is this shuffle correct?"

```python
# Weighted random pick — prefix sums + binary search
import bisect
class WeightedRandom:
    def __init__(self, w):
        self.prefix = []
        total = 0
        for x in w:
            total += x
            self.prefix.append(total)
        self.total = total
    def pick(self):
        target = random.uniform(0, self.total)
        return bisect.bisect_left(self.prefix, target)
```

Also worth knowing by name: **Bloom filters** (probabilistic set membership — no false negatives, tunable false positives; used in databases and caches) and **HyperLogLog** (cardinality estimation in constant memory). Both come up in system design more than in coding rounds.

---

## 11.9 Geometry

```python
# Distance — avoid sqrt when only comparing
def dist_sq(a, b): return (a[0]-b[0])**2 + (a[1]-b[1])**2

# Cross product — sign gives orientation.
# > 0 counter-clockwise, < 0 clockwise, == 0 collinear
def cross(o, a, b):
    return (a[0]-o[0])*(b[1]-o[1]) - (a[1]-o[1])*(b[0]-o[0])

# Convex hull (Andrew's monotone chain) — O(n log n)
def convex_hull(points):
    points = sorted(set(points))
    if len(points) <= 2: return points
    def build(pts):
        hull = []
        for p in pts:
            while len(hull) >= 2 and cross(hull[-2], hull[-1], p) <= 0:
                hull.pop()
            hull.append(p)
        return hull
    lower = build(points)
    upper = build(reversed(points))
    return lower[:-1] + upper[:-1]

# Rectangle overlap
def overlaps(r1, r2):
    return not (r1[2] <= r2[0] or r2[2] <= r1[0] or
                r1[3] <= r2[1] or r2[3] <= r1[1])
```

The cross product's sign is the workhorse — collinearity, turn direction, and point-in-polygon all reduce to it. Problems: Max Points on a Line, Erect the Fence, Rectangle Area, Valid Boomerang.

---

## 11.10 Design-heavy data structures

Asked constantly at Amazon and Meta. Half data-structure, half LLD.

```python
# Insert Delete GetRandom O(1) — array + index map
import random
class RandomizedSet:
    def __init__(self):
        self.vals = []
        self.idx = {}                     # value -> position in vals

    def insert(self, val):
        if val in self.idx: return False
        self.idx[val] = len(self.vals)
        self.vals.append(val)
        return True

    def remove(self, val):
        if val not in self.idx: return False
        i = self.idx[val]
        last = self.vals[-1]
        self.vals[i] = last               # move the last element into the hole
        self.idx[last] = i
        self.vals.pop()
        del self.idx[val]
        return True

    def getRandom(self):
        return random.choice(self.vals)
```

The swap-with-last trick is what makes removal O(1) — you never shift the array. It's the key idea in the whole problem.

Others in this family, each worth implementing once:

| Problem | Structure |
|---|---|
| LRU Cache | hashmap + doubly linked list |
| LFU Cache (Hard) | two hashmaps + frequency buckets of DLLs |
| Insert Delete GetRandom O(1) | array + index map, swap-with-last |
| Design Twitter | hashmaps + heap merge of followed feeds |
| Design Underground System | two hashmaps (in-progress, route totals) |
| Design Hit Counter | deque or circular buffer of timestamps |
| Design Browser History | two stacks, or a doubly linked list |
| Time Based Key-Value Store | dict of lists + `bisect` |
| Snapshot Array | per-index list of (snap_id, value) + binary search |
| Design Search Autocomplete (Hard) | trie + top-k cached at each node |
| Min Stack | parallel mins stack |
| Design Circular Queue | fixed array + head/tail pointers |
| Design Skiplist (Hard) | probabilistic multi-level linked list |
| All O(1) Data Structure (Hard) | DLL of frequency buckets + hashmap |

---

## Weeks 16–22 schedule

| Week | Focus |
|---|---|
| 16 | Sorting implementations + quickselect. Write merge, quick, heap sort from memory. |
| 17 | Design-heavy structures (§11.10) — 6 of them, fully implemented |
| 18 | Rabin-Karp + KMP + the string problems that use them |
| 19 | Bitmask DP (4 problems) |
| 20 | Advanced graphs: Bellman-Ford, Floyd-Warshall, MST, Tarjan |
| 21 | Segment tree / BIT (read + 2 problems), math & modular arithmetic |
| 22 | Game theory, randomized, geometry — one problem each, then move on |

**Section check:**
- Write quicksort's partition from memory, with a random pivot, and explain the O(n²) case.
- Explain why merge sort is stable and quicksort isn't.
- Explain the Ω(n log n) comparison-sort lower bound.
- Explain quickselect's O(n) average via the halving series.
- Explain why Rabin-Karp must verify on a hash match.
- Explain what `i & (-i)` does and where it's used.

→ Next: **[12 — Complete Problem Index](12-problem-index.md)**
