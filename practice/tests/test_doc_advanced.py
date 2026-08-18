"""Verification suite for file 11 (advanced algorithms) and design structures.

    pytest tests/test_doc_advanced.py -v
"""

from __future__ import annotations

import math
import random
import time
from collections import defaultdict

import pytest


# =========================================================================
# 11.1 SORTING
# =========================================================================
class TestSorting:
    def test_merge_sort(self):
        def merge(a, b):
            out = []
            i = j = 0
            while i < len(a) and j < len(b):
                if a[i] <= b[j]:
                    out.append(a[i])
                    i += 1
                else:
                    out.append(b[j])
                    j += 1
            out.extend(a[i:])
            out.extend(b[j:])
            return out

        def merge_sort(nums):
            if len(nums) <= 1:
                return nums
            mid = len(nums) // 2
            return merge(merge_sort(nums[:mid]), merge_sort(nums[mid:]))

        for _ in range(50):
            arr = [random.randint(-100, 100) for _ in range(random.randint(0, 60))]
            assert merge_sort(arr) == sorted(arr)

    def test_merge_sort_is_stable(self):
        """Equal keys keep their original relative order."""
        def merge(a, b):
            out, i, j = [], 0, 0
            while i < len(a) and j < len(b):
                if a[i][0] <= b[j][0]:      # <= is what makes it stable
                    out.append(a[i]); i += 1
                else:
                    out.append(b[j]); j += 1
            out.extend(a[i:]); out.extend(b[j:])
            return out

        def merge_sort(nums):
            if len(nums) <= 1:
                return nums
            mid = len(nums) // 2
            return merge(merge_sort(nums[:mid]), merge_sort(nums[mid:]))

        data = [(1, 'a'), (0, 'b'), (1, 'c'), (0, 'd'), (1, 'e')]
        assert merge_sort(data) == [(0, 'b'), (0, 'd'), (1, 'a'), (1, 'c'), (1, 'e')]

    def test_quicksort(self):
        def partition(nums, lo, hi):
            r = random.randint(lo, hi)
            nums[r], nums[hi] = nums[hi], nums[r]
            pivot = nums[hi]
            i = lo
            for j in range(lo, hi):
                if nums[j] <= pivot:
                    nums[i], nums[j] = nums[j], nums[i]
                    i += 1
            nums[i], nums[hi] = nums[hi], nums[i]
            return i

        def quicksort(nums, lo=0, hi=None):
            if hi is None:
                hi = len(nums) - 1
            if lo >= hi:
                return
            p = partition(nums, lo, hi)
            quicksort(nums, lo, p - 1)
            quicksort(nums, p + 1, hi)

        for _ in range(50):
            arr = [random.randint(-100, 100) for _ in range(random.randint(0, 60))]
            want = sorted(arr)
            quicksort(arr)
            assert arr == want
        # already-sorted input must not blow up thanks to the random pivot
        big = list(range(3000))
        quicksort(big)
        assert big == list(range(3000))

    def test_heapsort(self):
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
            for start in range(n // 2 - 1, -1, -1):
                sift_down(nums, start, n - 1)
            for end in range(n - 1, 0, -1):
                nums[0], nums[end] = nums[end], nums[0]
                sift_down(nums, 0, end - 1)
            return nums

        for _ in range(50):
            arr = [random.randint(-100, 100) for _ in range(random.randint(0, 60))]
            assert heapsort(arr[:]) == sorted(arr)

    def test_quickselect(self):
        def partition(nums, lo, hi):
            r = random.randint(lo, hi)
            nums[r], nums[hi] = nums[hi], nums[r]
            pivot = nums[hi]
            i = lo
            for j in range(lo, hi):
                if nums[j] <= pivot:
                    nums[i], nums[j] = nums[j], nums[i]
                    i += 1
            nums[i], nums[hi] = nums[hi], nums[i]
            return i

        def quickselect(nums, k):
            lo, hi = 0, len(nums) - 1
            target = k - 1
            while True:
                if lo == hi:
                    return nums[lo]
                p = partition(nums, lo, hi)
                if p == target:
                    return nums[p]
                elif p < target:
                    lo = p + 1
                else:
                    hi = p - 1

        for _ in range(60):
            arr = [random.randint(-50, 50) for _ in range(random.randint(1, 40))]
            k = random.randint(1, len(arr))
            assert quickselect(arr[:], k) == sorted(arr)[k - 1]
        # kth LARGEST via the documented conversion
        arr = [3, 2, 1, 5, 6, 4]
        k = 2
        assert quickselect(arr[:], len(arr) - k + 1) == 5

    def test_count_inversions(self):
        def count_inversions(nums):
            def merge_count(a, b):
                out, inv, i, j = [], 0, 0, 0
                while i < len(a) and j < len(b):
                    if a[i] <= b[j]:
                        out.append(a[i]); i += 1
                    else:
                        out.append(b[j]); j += 1
                        inv += len(a) - i
                out.extend(a[i:]); out.extend(b[j:])
                return out, inv

            def sort_count(a):
                if len(a) <= 1:
                    return a, 0
                mid = len(a) // 2
                left, x = sort_count(a[:mid])
                right, y = sort_count(a[mid:])
                merged, z = merge_count(left, right)
                return merged, x + y + z

            return sort_count(nums)[1]

        def brute(nums):
            return sum(1 for i in range(len(nums)) for j in range(i + 1, len(nums))
                       if nums[i] > nums[j])

        for _ in range(30):
            arr = [random.randint(0, 20) for _ in range(random.randint(0, 30))]
            assert count_inversions(arr) == brute(arr)

    def test_counting_and_bucket_sort(self):
        def counting_sort(nums, k):
            count = [0] * (k + 1)
            for x in nums:
                count[x] += 1
            out = []
            for v, c in enumerate(count):
                out.extend([v] * c)
            return out

        from collections import Counter

        def top_k_frequent(nums, k):
            freq = Counter(nums)
            buckets = [[] for _ in range(len(nums) + 1)]
            for num, count in freq.items():
                buckets[count].append(num)
            out = []
            for count in range(len(buckets) - 1, 0, -1):
                for num in buckets[count]:
                    out.append(num)
                    if len(out) == k:
                        return out
            return out

        arr = [random.randint(0, 20) for _ in range(50)]
        assert counting_sort(arr, 20) == sorted(arr)
        assert sorted(top_k_frequent([1, 1, 1, 2, 2, 3], 2)) == [1, 2]
        assert top_k_frequent([1], 1) == [1]


# =========================================================================
# 11.2 STRING ALGORITHMS
# =========================================================================
class TestStringAlgorithms:
    def test_rabin_karp(self):
        def rabin_karp(text, pattern):
            n, m = len(text), len(pattern)
            if m > n:
                return -1
            BASE, MOD = 256, 10 ** 9 + 7
            pattern_hash = window_hash = 0
            high = pow(BASE, m - 1, MOD)
            for i in range(m):
                pattern_hash = (pattern_hash * BASE + ord(pattern[i])) % MOD
                window_hash = (window_hash * BASE + ord(text[i])) % MOD
            for i in range(n - m + 1):
                if window_hash == pattern_hash:
                    if text[i:i + m] == pattern:
                        return i
                if i < n - m:
                    window_hash = ((window_hash - ord(text[i]) * high) * BASE
                                   + ord(text[i + m])) % MOD
            return -1

        assert rabin_karp("hello world", "world") == 6
        assert rabin_karp("aaaaa", "bba") == -1
        assert rabin_karp("mississippi", "issip") == 4
        assert rabin_karp("abc", "abcd") == -1
        for _ in range(200):
            text = "".join(random.choice("abc") for _ in range(random.randint(1, 30)))
            pat = "".join(random.choice("abc") for _ in range(random.randint(1, 5)))
            assert rabin_karp(text, pat) == text.find(pat)

    def test_kmp(self):
        def build_lps(pattern):
            lps = [0] * len(pattern)
            length = 0
            i = 1
            while i < len(pattern):
                if pattern[i] == pattern[length]:
                    length += 1
                    lps[i] = length
                    i += 1
                elif length:
                    length = lps[length - 1]
                else:
                    lps[i] = 0
                    i += 1
            return lps

        def kmp_search(text, pattern):
            if not pattern:
                return 0
            lps = build_lps(pattern)
            i = j = 0
            while i < len(text):
                if text[i] == pattern[j]:
                    i += 1
                    j += 1
                    if j == len(pattern):
                        return i - j
                elif j:
                    j = lps[j - 1]
                else:
                    i += 1
            return -1

        assert build_lps("aabaaab") == [0, 1, 0, 1, 2, 2, 3]
        assert kmp_search("ababcabcabababd", "ababd") == 10
        assert kmp_search("aaaaa", "bba") == -1
        for _ in range(200):
            text = "".join(random.choice("ab") for _ in range(random.randint(1, 30)))
            pat = "".join(random.choice("ab") for _ in range(random.randint(1, 5)))
            assert kmp_search(text, pat) == text.find(pat)


# =========================================================================
# 11.3 BITMASK DP
# =========================================================================
class TestBitmaskDP:
    def test_partition_k_subsets(self):
        def can_partition_k_subsets(nums, k):
            total = sum(nums)
            if total % k:
                return False
            target = total // k
            nums.sort(reverse=True)
            if nums[0] > target:
                return False
            n = len(nums)
            from functools import cache

            @cache
            def dfs(mask, current_sum):
                if mask == (1 << n) - 1:
                    return True
                for i in range(n):
                    if mask & (1 << i):
                        continue
                    if current_sum + nums[i] > target:
                        continue
                    new_sum = (current_sum + nums[i]) % target
                    if dfs(mask | (1 << i), new_sum):
                        return True
                return False
            return dfs(0, 0)

        assert can_partition_k_subsets([4, 3, 2, 3, 5, 2, 1], 4)
        assert not can_partition_k_subsets([1, 2, 3, 4], 3)
        assert can_partition_k_subsets([4, 4], 2)

    def test_tsp_held_karp(self):
        def tsp(dist):
            n = len(dist)
            from functools import cache

            @cache
            def dp(mask, city):
                if mask == (1 << n) - 1:
                    return dist[city][0]
                best = float('inf')
                for nxt in range(n):
                    if mask & (1 << nxt):
                        continue
                    best = min(best, dist[city][nxt] + dp(mask | (1 << nxt), nxt))
                return best
            return dp(1, 0)

        d = [[0, 10, 15, 20], [10, 0, 35, 25], [15, 35, 0, 30], [20, 25, 30, 0]]
        assert tsp(tuple(tuple(r) for r in d)) == 80

    def test_submask_iteration(self):
        mask = 0b1011
        subs = []
        sub = mask
        while sub:
            subs.append(sub)
            sub = (sub - 1) & mask
        assert len(subs) == 2 ** bin(mask).count('1') - 1
        assert all((s & mask) == s for s in subs)


# =========================================================================
# 11.4 ADVANCED GRAPHS
# =========================================================================
class TestAdvancedGraphs:
    def test_bellman_ford(self):
        def bellman_ford(n, edges, src):
            dist = [float('inf')] * n
            dist[src] = 0
            for _ in range(n - 1):
                changed = False
                for u, v, w in edges:
                    if dist[u] != float('inf') and dist[u] + w < dist[v]:
                        dist[v] = dist[u] + w
                        changed = True
                if not changed:
                    break
            for u, v, w in edges:
                if dist[u] != float('inf') and dist[u] + w < dist[v]:
                    return None
            return dist

        assert bellman_ford(4, [(0, 1, 1), (1, 2, -2), (2, 3, 3)], 0) == [0, 1, -1, 2]
        assert bellman_ford(3, [(0, 1, 1), (1, 2, -3), (2, 1, 1)], 0) is None

    def test_floyd_warshall(self):
        def floyd_warshall(n, edges):
            dist = [[float('inf')] * n for _ in range(n)]
            for i in range(n):
                dist[i][i] = 0
            for u, v, w in edges:
                dist[u][v] = w
            for k in range(n):
                for i in range(n):
                    for j in range(n):
                        dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])
            return dist

        d = floyd_warshall(4, [(0, 1, 5), (1, 2, 3), (2, 3, 1), (0, 3, 10)])
        assert d[0][3] == 9
        assert d[0][2] == 8
        assert d[3][0] == float('inf')

    def test_prim_and_kruskal_agree(self):
        class UnionFind:
            def __init__(self, n):
                self.parent = list(range(n))
                self.rank = [1] * n

            def find(self, x):
                while self.parent[x] != x:
                    self.parent[x] = self.parent[self.parent[x]]
                    x = self.parent[x]
                return x

            def union(self, a, b):
                ra, rb = self.find(a), self.find(b)
                if ra == rb:
                    return False
                if self.rank[ra] < self.rank[rb]:
                    ra, rb = rb, ra
                self.parent[rb] = ra
                self.rank[ra] += self.rank[rb]
                return True

        def kruskal(n, edges):
            edges = sorted(edges, key=lambda e: e[2])
            uf = UnionFind(n)
            total = 0
            for u, v, w in edges:
                if uf.union(u, v):
                    total += w
            return total

        import heapq

        def prim(points):
            n = len(points)
            visited = set()
            heap = [(0, 0)]
            total = 0
            while len(visited) < n:
                cost, node = heapq.heappop(heap)
                if node in visited:
                    continue
                visited.add(node)
                total += cost
                for nxt in range(n):
                    if nxt not in visited:
                        d = (abs(points[node][0] - points[nxt][0]) +
                             abs(points[node][1] - points[nxt][1]))
                        heapq.heappush(heap, (d, nxt))
            return total

        points = [[0, 0], [2, 2], [3, 10], [5, 2], [7, 0]]
        assert prim(points) == 20
        edges = []
        for i in range(len(points)):
            for j in range(i + 1, len(points)):
                w = abs(points[i][0] - points[j][0]) + abs(points[i][1] - points[j][1])
                edges.append((i, j, w))
        assert kruskal(len(points), edges) == prim(points)

    def test_hierholzer_itinerary(self):
        def find_itinerary(tickets):
            graph = defaultdict(list)
            for src, dst in sorted(tickets, reverse=True):
                graph[src].append(dst)
            route = []
            stack = ["JFK"]
            while stack:
                while graph[stack[-1]]:
                    stack.append(graph[stack[-1]].pop())
                route.append(stack.pop())
            return route[::-1]

        assert find_itinerary([["MUC", "LHR"], ["JFK", "MUC"],
                               ["SFO", "SJC"], ["LHR", "SFO"]]) == \
            ["JFK", "MUC", "LHR", "SFO", "SJC"]
        assert find_itinerary([["JFK", "SFO"], ["JFK", "ATL"], ["SFO", "ATL"],
                               ["ATL", "JFK"], ["ATL", "SFO"]]) == \
            ["JFK", "ATL", "JFK", "SFO", "ATL", "SFO"]

    def test_tarjan_bridges(self):
        def critical_connections(n, connections):
            graph = defaultdict(list)
            for u, v in connections:
                graph[u].append(v)
                graph[v].append(u)
            disc = [-1] * n
            low = [0] * n
            bridges = []
            timer = [0]

            def dfs(node, parent):
                disc[node] = low[node] = timer[0]
                timer[0] += 1
                for nei in graph[node]:
                    if nei == parent:
                        continue
                    if disc[nei] == -1:
                        dfs(nei, node)
                        low[node] = min(low[node], low[nei])
                        if low[nei] > disc[node]:
                            bridges.append([node, nei])
                    else:
                        low[node] = min(low[node], disc[nei])
            dfs(0, -1)
            return bridges

        got = critical_connections(4, [[0, 1], [1, 2], [2, 0], [1, 3]])
        assert sorted(sorted(b) for b in got) == [[1, 3]]


# =========================================================================
# 11.5 SEGMENT TREE / FENWICK
# =========================================================================
class TestRangeStructures:
    def test_bit(self):
        class BIT:
            def __init__(self, n):
                self.n = n
                self.tree = [0] * (n + 1)

            def update(self, i, delta):
                i += 1
                while i <= self.n:
                    self.tree[i] += delta
                    i += i & (-i)

            def query(self, i):
                i += 1
                s = 0
                while i > 0:
                    s += self.tree[i]
                    i -= i & (-i)
                return s

            def range_query(self, l, r):
                return self.query(r) - (self.query(l - 1) if l else 0)

        arr = [random.randint(-10, 10) for _ in range(50)]
        bit = BIT(len(arr))
        for i, v in enumerate(arr):
            bit.update(i, v)
        for _ in range(100):
            l = random.randint(0, len(arr) - 1)
            r = random.randint(l, len(arr) - 1)
            assert bit.range_query(l, r) == sum(arr[l:r + 1])
        bit.update(5, 7)
        arr[5] += 7
        assert bit.range_query(0, 49) == sum(arr)

    def test_segment_tree(self):
        class SegmentTree:
            def __init__(self, nums):
                self.n = len(nums)
                self.tree = [0] * (2 * self.n)
                for i, x in enumerate(nums):
                    self.tree[self.n + i] = x
                for i in range(self.n - 1, 0, -1):
                    self.tree[i] = self.tree[2 * i] + self.tree[2 * i + 1]

            def update(self, i, val):
                i += self.n
                self.tree[i] = val
                while i > 1:
                    i //= 2
                    self.tree[i] = self.tree[2 * i] + self.tree[2 * i + 1]

            def query(self, l, r):
                l += self.n
                r += self.n
                s = 0
                while l < r:
                    if l & 1:
                        s += self.tree[l]
                        l += 1
                    if r & 1:
                        r -= 1
                        s += self.tree[r]
                    l //= 2
                    r //= 2
                return s

        arr = [random.randint(-10, 10) for _ in range(32)]
        st = SegmentTree(arr)
        for _ in range(100):
            l = random.randint(0, len(arr) - 1)
            r = random.randint(l + 1, len(arr))
            assert st.query(l, r) == sum(arr[l:r])
        st.update(3, 99)
        arr[3] = 99
        assert st.query(0, len(arr)) == sum(arr)


# =========================================================================
# 11.6 MATH
# =========================================================================
class TestMath:
    def test_modular_and_matrix_pow(self):
        MOD = 10 ** 9 + 7
        assert pow(2, 10, MOD) == 1024
        assert (pow(3, MOD - 2, MOD) * 3) % MOD == 1        # modular inverse

        def mat_mult(A, B, mod):
            n = len(A)
            return [[sum(A[i][k] * B[k][j] for k in range(n)) % mod
                     for j in range(n)] for i in range(n)]

        def mat_pow(M, p, mod):
            n = len(M)
            result = [[int(i == j) for j in range(n)] for i in range(n)]
            while p:
                if p & 1:
                    result = mat_mult(result, M, mod)
                M = mat_mult(M, M, mod)
                p >>= 1
            return result

        # fib via matrix exponentiation
        def fib_matrix(n):
            if n == 0:
                return 0
            return mat_pow([[1, 1], [1, 0]], n, 10 ** 18)[0][1]

        expected = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
        for n, want in enumerate(expected):
            assert fib_matrix(n) == want

    def test_prime_factors(self):
        def prime_factors(n):
            factors = []
            d = 2
            while d * d <= n:
                while n % d == 0:
                    factors.append(d)
                    n //= d
                d += 1
            if n > 1:
                factors.append(n)
            return factors

        assert prime_factors(60) == [2, 2, 3, 5]
        assert prime_factors(97) == [97]
        assert prime_factors(1) == []
        for n in range(2, 200):
            p = prime_factors(n)
            assert math.prod(p) == n


# =========================================================================
# 11.7 GAME THEORY
# =========================================================================
class TestGameTheory:
    def test_predict_the_winner(self):
        def predict_the_winner(nums):
            from functools import cache

            @cache
            def dp(i, j):
                if i == j:
                    return nums[i]
                return max(nums[i] - dp(i + 1, j), nums[j] - dp(i, j - 1))
            return dp(0, len(nums) - 1) >= 0

        assert not predict_the_winner((1, 5, 2))
        assert predict_the_winner((1, 5, 233, 7))
        assert predict_the_winner((1, 1))

    def test_nim(self):
        def can_win_nim(n):
            return n % 4 != 0
        assert can_win_nim(1) and can_win_nim(2) and can_win_nim(3)
        assert not can_win_nim(4)
        assert not can_win_nim(8)


# =========================================================================
# 11.8 RANDOMIZED
# =========================================================================
class TestRandomized:
    def test_reservoir_sampling_is_uniform(self):
        def reservoir_sample(stream, k):
            reservoir = []
            for i, x in enumerate(stream):
                if i < k:
                    reservoir.append(x)
                else:
                    j = random.randint(0, i)
                    if j < k:
                        reservoir[j] = x
            return reservoir

        counts = defaultdict(int)
        trials = 20000
        for _ in range(trials):
            for x in reservoir_sample(range(10), 1):
                counts[x] += 1
        # each of 10 items should appear ~10% of the time
        for x in range(10):
            assert 0.07 < counts[x] / trials < 0.13, f"item {x} biased: {counts[x]/trials}"

    def test_fisher_yates_is_uniform(self):
        def shuffle(nums):
            for i in range(len(nums) - 1, 0, -1):
                j = random.randint(0, i)
                nums[i], nums[j] = nums[j], nums[i]
            return nums

        counts = defaultdict(int)
        trials = 24000
        for _ in range(trials):
            counts[tuple(shuffle([1, 2, 3]))] += 1
        assert len(counts) == 6
        for perm, c in counts.items():
            assert 0.13 < c / trials < 0.20, f"{perm} biased: {c/trials}"

    def test_weighted_random(self):
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

        wr = WeightedRandom([1, 3])       # index 1 should appear ~75%
        picks = [wr.pick() for _ in range(20000)]
        ratio = picks.count(1) / len(picks)
        assert 0.72 < ratio < 0.78


# =========================================================================
# 11.9 GEOMETRY
# =========================================================================
class TestGeometry:
    def test_convex_hull(self):
        def cross(o, a, b):
            return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])

        def convex_hull(points):
            points = sorted(set(points))
            if len(points) <= 2:
                return points

            def build(pts):
                hull = []
                for p in pts:
                    while len(hull) >= 2 and cross(hull[-2], hull[-1], p) <= 0:
                        hull.pop()
                    hull.append(p)
                return hull
            lower = build(points)
            upper = build(list(reversed(points)))
            return lower[:-1] + upper[:-1]

        square = [(0, 0), (0, 4), (4, 0), (4, 4), (2, 2)]
        hull = convex_hull(square)
        assert set(hull) == {(0, 0), (0, 4), (4, 0), (4, 4)}
        assert cross((0, 0), (1, 0), (0, 1)) > 0      # counter-clockwise
        assert cross((0, 0), (0, 1), (1, 0)) < 0      # clockwise
        assert cross((0, 0), (1, 1), (2, 2)) == 0     # collinear

    def test_rectangle_overlap(self):
        def overlaps(r1, r2):
            return not (r1[2] <= r2[0] or r2[2] <= r1[0] or
                        r1[3] <= r2[1] or r2[3] <= r1[1])

        assert overlaps([0, 0, 2, 2], [1, 1, 3, 3])
        assert not overlaps([0, 0, 1, 1], [1, 1, 2, 2])    # touching, not overlapping
        assert not overlaps([0, 0, 1, 1], [5, 5, 6, 6])


# =========================================================================
# 11.10 DESIGN STRUCTURES
# =========================================================================
class TestDesignStructures:
    def test_randomized_set(self):
        class RandomizedSet:
            def __init__(self):
                self.vals = []
                self.idx = {}

            def insert(self, val):
                if val in self.idx:
                    return False
                self.idx[val] = len(self.vals)
                self.vals.append(val)
                return True

            def remove(self, val):
                if val not in self.idx:
                    return False
                i = self.idx[val]
                last = self.vals[-1]
                self.vals[i] = last
                self.idx[last] = i
                self.vals.pop()
                del self.idx[val]
                return True

            def getRandom(self):
                return random.choice(self.vals)

        rs = RandomizedSet()
        assert rs.insert(1)
        assert not rs.remove(2)
        assert rs.insert(2)
        assert rs.remove(1)
        assert rs.getRandom() == 2
        # stress: internal invariants must hold
        rs2 = RandomizedSet()
        model = set()
        for _ in range(2000):
            v = random.randint(0, 30)
            if random.random() < 0.5:
                assert rs2.insert(v) == (v not in model)
                model.add(v)
            else:
                assert rs2.remove(v) == (v in model)
                model.discard(v)
            assert set(rs2.vals) == model
            assert all(rs2.vals[i] == k for k, i in rs2.idx.items())

    def test_token_bucket_rate_limiter(self):
        import threading

        class TokenBucket:
            def __init__(self, capacity, refill_rate):
                self.capacity = capacity
                self.rate = refill_rate
                self.tokens = float(capacity)
                self.last = time.monotonic()
                self._lock = threading.Lock()

            def allow(self, cost=1):
                with self._lock:
                    now = time.monotonic()
                    self.tokens = min(self.capacity,
                                      self.tokens + (now - self.last) * self.rate)
                    self.last = now
                    if self.tokens >= cost:
                        self.tokens -= cost
                        return True
                    return False

        tb = TokenBucket(capacity=5, refill_rate=1000)   # fast refill for testing
        assert sum(tb.allow() for _ in range(5)) == 5    # burst up to capacity
        tb2 = TokenBucket(capacity=3, refill_rate=0)     # no refill
        assert [tb2.allow() for _ in range(5)] == [True, True, True, False, False]
        time.sleep(0.02)
        tb3 = TokenBucket(capacity=2, refill_rate=100)
        tb3.allow(); tb3.allow()
        assert not tb3.allow()
        time.sleep(0.05)                                  # ~5 tokens refilled
        assert tb3.allow()


# =========================================================================
# FILE 12 PHASE 3 -- CYCLIC SORT (index-as-hash)
# =========================================================================
class TestCyclicSort:
    def test_first_missing_positive(self):
        def first_missing_positive(nums):
            n = len(nums)
            for i in range(n):
                while 1 <= nums[i] <= n and nums[nums[i] - 1] != nums[i]:
                    v = nums[i]
                    nums[i], nums[v - 1] = nums[v - 1], nums[i]
            for i in range(n):
                if nums[i] != i + 1:
                    return i + 1
            return n + 1

        assert first_missing_positive([1, 2, 0]) == 3
        assert first_missing_positive([3, 4, -1, 1]) == 2
        assert first_missing_positive([7, 8, 9, 11, 12]) == 1
        assert first_missing_positive([]) == 1
        assert first_missing_positive([1]) == 2
        assert first_missing_positive([2, 2, 2]) == 1

        def brute(nums):
            s = set(nums)
            i = 1
            while i in s:
                i += 1
            return i

        for _ in range(300):
            arr = [random.randint(-5, 12) for _ in range(random.randint(0, 15))]
            assert first_missing_positive(arr[:]) == brute(arr)
