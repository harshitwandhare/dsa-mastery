# 05 — Backtracking & Graphs

**Weeks 7–10. ~30 problems.** Graphs are where most candidates fail, mainly because they don't recognize that a problem *is* a graph problem. Grids, dependencies, word ladders, and state machines are all graphs.

> **Forward references:** this file may name techniques taught later. Those are previews, not prerequisites — read past them. See [How to read this curriculum](01-foundations.md#how-to-read-this-curriculum).

---

## Pattern 10: Backtracking

### The idea

Systematically try every possibility. At each step: **choose** an option, **explore** the consequences recursively, then **un-choose** (backtrack) so the next option starts from a clean state. Prune branches that can't lead to a solution.

Backtracking is DFS over a tree of decisions. The complexity is exponential by nature — that's expected and acceptable, because constraints will be tiny (n ≤ 20 or so). Check the constraints; if they're small and the problem asks for "all possible X," it's backtracking.

### Recognition triggers

- "find **all** combinations / permutations / subsets / paths"
- "generate all valid …"
- constraint satisfaction: N-Queens, Sudoku, word search
- small n (≤ 20) with an exponential-looking answer count

### The universal template

```python
def backtrack_solve(input_data):
    results = []
    path = []

    def backtrack(state):
        # 1. BASE CASE — a complete solution
        if is_complete(state):
            results.append(path[:])      # COPY. Not `path`. Always.
            return

        # 2. Try each choice available at this state
        for choice in get_choices(state):
            if not is_valid(choice, state):
                continue                 # PRUNE — skip impossible branches

            path.append(choice)          # CHOOSE
            backtrack(advance(state, choice))   # EXPLORE
            path.pop()                   # UN-CHOOSE

    backtrack(initial_state)
    return results
```

Three things to get right every time:
1. **Copy on append.** `results.append(path)` stores a reference that mutates under you. Use `path[:]` or `list(path)`.
2. **Undo exactly what you did.** Every `append` needs a matching `pop`; every grid mark needs an unmark.
3. **Prune early.** The difference between passing and timing out is almost always a pruning condition.

### Subsets — the foundational shape

```python
# Subsets: every possible subset of distinct numbers. 2^n of them.
def subsets(nums):
    res, path = [], []
    def backtrack(start):
        res.append(path[:])              # EVERY node is a valid subset
        for i in range(start, len(nums)):
            path.append(nums[i])
            backtrack(i + 1)             # i+1 — no reuse, no reordering
            path.pop()
    backtrack(0)
    return res
# O(n * 2^n) — 2^n subsets, O(n) to copy each
```

The `start` parameter is what prevents duplicates like `[1,2]` and `[2,1]` both appearing. It enforces that choices are made in index order.

**Subsets with duplicates** — sort first, then skip repeats at the same depth:

```python
def subsets_with_dup(nums):
    nums.sort()                          # duplicates become adjacent
    res, path = [], []
    def backtrack(start):
        res.append(path[:])
        for i in range(start, len(nums)):
            if i > start and nums[i] == nums[i-1]:
                continue                 # skip a duplicate at this LEVEL
            path.append(nums[i])
            backtrack(i + 1)
            path.pop()
    backtrack(0)
    return res
```

`i > start` (not `i > 0`) is the crux: it skips duplicates among *sibling* choices while still allowing the same value to be used at a deeper level. Understand this and the whole "with duplicates" family becomes trivial.

### Permutations — order matters, so use a used-set

```python
def permute(nums):
    res, path = [], []
    used = [False] * len(nums)
    def backtrack():
        if len(path) == len(nums):
            res.append(path[:])
            return
        for i in range(len(nums)):       # scan ALL indices — order matters
            if used[i]: continue
            used[i] = True
            path.append(nums[i])
            backtrack()
            path.pop()
            used[i] = False
    backtrack()
    return res
# O(n * n!)
```

**Subsets vs permutations, the distinction:** subsets use a `start` index (order doesn't matter, never look back). Permutations use a `used` array (order matters, look everywhere). Getting this right immediately is a strong signal.

### Combination Sum family

```python
# Combination Sum: unlimited reuse of each candidate
def combination_sum(candidates, target):
    res, path = [], []
    def backtrack(start, remaining):
        if remaining == 0:
            res.append(path[:]); return
        if remaining < 0:
            return                       # PRUNE — overshot
        for i in range(start, len(candidates)):
            path.append(candidates[i])
            backtrack(i, remaining - candidates[i])   # i, not i+1 → reuse
            path.pop()
    backtrack(0, target)
    return res

# Combination Sum II: each element used at most once, input has duplicates
def combination_sum2(candidates, target):
    candidates.sort()
    res, path = [], []
    def backtrack(start, remaining):
        if remaining == 0:
            res.append(path[:]); return
        for i in range(start, len(candidates)):
            if i > start and candidates[i] == candidates[i-1]:
                continue                                # dedup siblings
            if candidates[i] > remaining:
                break                                    # sorted → PRUNE rest
            path.append(candidates[i])
            backtrack(i + 1, remaining - candidates[i])  # i+1 → no reuse
            path.pop()
    backtrack(0, target)
    return res
```

`backtrack(i, ...)` vs `backtrack(i+1, ...)` is the single character that decides "reuse allowed" vs "each used once." Know it cold.

### Grid backtracking: Word Search

```python
def exist(board, word):
    rows, cols = len(board), len(board[0])

    def dfs(r, c, k):
        if k == len(word): return True
        if not (0 <= r < rows and 0 <= c < cols) or board[r][c] != word[k]:
            return False
        board[r][c] = '#'                        # mark visited
        found = (dfs(r+1, c, k+1) or dfs(r-1, c, k+1) or
                 dfs(r, c+1, k+1) or dfs(r, c-1, k+1))
        board[r][c] = word[k]                    # UNMARK — backtrack
        return found

    return any(dfs(r, c, 0) for r in range(rows) for c in range(cols))
# O(rows * cols * 4^len(word))
```

Marking in the grid itself avoids a separate visited set — O(1) extra space. The unmark is mandatory: the same cell must be reusable in a different path.

### N-Queens — pruning with sets

```python
def solve_n_queens(n):
    res = []
    cols, diag, anti = set(), set(), set()
    board = [['.'] * n for _ in range(n)]

    def backtrack(r):
        if r == n:
            res.append(["".join(row) for row in board]); return
        for c in range(n):
            # cells on the same ↘ diagonal share (r-c); same ↙ share (r+c)
            if c in cols or (r - c) in diag or (r + c) in anti:
                continue
            cols.add(c); diag.add(r - c); anti.add(r + c)
            board[r][c] = 'Q'
            backtrack(r + 1)
            board[r][c] = '.'
            cols.remove(c); diag.remove(r - c); anti.remove(r + c)

    backtrack(0)
    return res
```

The `r-c` / `r+c` diagonal encoding turns an O(n) conflict scan into an O(1) set check. Deriving that on the spot is impressive; know it in advance.

### Problem set

| Problem | Key insight |
|---|---|
| Subsets | every node is an answer; `start` index |
| Subsets II | sort + `if i > start` skip |
| Combination Sum | `backtrack(i)` allows reuse |
| Combination Sum II | sort + dedup + `backtrack(i+1)` |
| Permutations | `used` array, scan all indices |
| Permutations II | sort + skip `used[i-1]` unused duplicates |
| Word Search | mark/unmark in the grid |
| Palindrome Partitioning | try every prefix, recurse if palindromic |
| Letter Combinations of a Phone Number | digit→letters map, index recursion |
| N-Queens | three sets: col, r−c, r+c |
| Generate Parentheses | track open/close counts; `close < open` is the rule |
| Sudoku Solver (Hard) | constraint sets per row/col/box |

---

## Pattern 11: Graphs

### Representation

```python
from collections import defaultdict, deque

# ADJACENCY LIST — the default. O(V + E) space.
graph = defaultdict(list)
for u, v in edges:
    graph[u].append(v)
    graph[v].append(u)          # omit this line for a DIRECTED graph

# ADJACENCY MATRIX — O(V²) space. Only for dense graphs or V ≤ ~500.
matrix = [[0] * n for _ in range(n)]
matrix[u][v] = 1

# GRID as an implicit graph — neighbors are computed, not stored.
DIRS = [(0,1),(1,0),(0,-1),(-1,0)]        # add diagonals if the problem says so
```

**Recognizing a graph problem.** Any of these means graph:
- explicit nodes and edges
- a **grid** (each cell is a node, adjacent cells are edges)
- **dependencies / prerequisites / ordering** → topological sort
- "connected", "reachable", "islands", "regions", "provinces"
- **shortest path / minimum steps** → BFS (unweighted) or Dijkstra (weighted)
- state transitions (word ladder, lock combinations, puzzle states) — the *states* are nodes

That last one is the one people miss. If a problem has "states" and "moves between states," it's a graph even with no graph in sight.

### BFS vs DFS — pick correctly

| | BFS | DFS |
|---|---|---|
| Structure | queue (`deque`) | stack or recursion |
| Explores | level by level | one path to the end, then backs up |
| **Shortest path (unweighted)** | **yes — guaranteed** | no |
| Detect cycles | works | more natural |
| Topological sort | Kahn's algorithm | postorder |
| Space | O(width) — can be huge | O(depth) |
| Use when | minimum steps, level, nearest | connectivity, all paths, cycles, components |

**If a problem says "minimum number of steps/moves/transformations" on an unweighted graph, the answer is BFS.** Not DP, not DFS. BFS reaches every node by the shortest possible path because it explores in order of distance.

### DFS template

```python
def dfs_recursive(node, visited, graph):
    if node in visited: return
    visited.add(node)
    for nei in graph[node]:
        dfs_recursive(nei, visited, graph)

def dfs_iterative(start, graph):
    visited, stack = set(), [start]
    while stack:
        node = stack.pop()
        if node in visited: continue
        visited.add(node)
        for nei in graph[node]:
            if nei not in visited:
                stack.append(nei)
    return visited
```

Add to `visited` when you *enqueue/push*, not when you pop — otherwise the same node can be queued many times.

### BFS template (with distance)

```python
def bfs(start, target, graph):
    q = deque([(start, 0)])                 # (node, distance)
    visited = {start}
    while q:
        node, dist = q.popleft()
        if node == target:
            return dist                     # first arrival = shortest path
        for nei in graph[node]:
            if nei not in visited:
                visited.add(nei)            # mark on ENQUEUE
                q.append((nei, dist + 1))
    return -1
```

### Grid problems — the most common graph subtype

```python
# Number of Islands
def num_islands(grid):
    if not grid: return 0
    rows, cols = len(grid), len(grid[0])
    count = 0

    def sink(r, c):
        if not (0 <= r < rows and 0 <= c < cols) or grid[r][c] != '1':
            return
        grid[r][c] = '0'                    # mark visited by sinking it
        for dr, dc in ((0,1),(1,0),(0,-1),(-1,0)):
            sink(r + dr, c + dc)

    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == '1':
                count += 1
                sink(r, c)                  # one DFS erases the whole island
    return count
# O(rows * cols)
```

**Multi-source BFS** — start with *all* sources in the queue at once. Solves "how long until everything is reached":

```python
# Rotting Oranges — minutes until all fresh oranges rot
def oranges_rotting(grid):
    rows, cols = len(grid), len(grid[0])
    q = deque()
    fresh = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 2: q.append((r, c))     # ALL rotten start together
            elif grid[r][c] == 1: fresh += 1

    minutes = 0
    while q and fresh:
        for _ in range(len(q)):                       # process one minute
            r, c = q.popleft()
            for dr, dc in ((0,1),(1,0),(0,-1),(-1,0)):
                nr, nc = r + dr, c + dc
                if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1:
                    grid[nr][nc] = 2
                    fresh -= 1
                    q.append((nr, nc))
        minutes += 1
    return -1 if fresh else minutes
```

Multi-source BFS also solves Walls and Gates, 01 Matrix, and Shortest Distance from All Buildings. It's a top-5 technique.

**Reverse thinking** — sometimes it's far easier to search from the boundary inward:

```python
# Surrounded Regions: capture 'O' regions NOT touching the border.
# Instead of finding enclosed regions, mark everything reachable FROM the
# border as safe, then flip the rest.
def solve(board):
    rows, cols = len(board), len(board[0])
    def mark(r, c):
        if not (0 <= r < rows and 0 <= c < cols) or board[r][c] != 'O': return
        board[r][c] = 'S'
        for dr, dc in ((0,1),(1,0),(0,-1),(-1,0)):
            mark(r + dr, c + dc)
    for r in range(rows):
        mark(r, 0); mark(r, cols - 1)
    for c in range(cols):
        mark(0, c); mark(rows - 1, c)
    for r in range(rows):
        for c in range(cols):
            board[r][c] = 'O' if board[r][c] == 'S' else 'X'
```

Pacific Atlantic Water Flow uses the identical inversion — flow *outward from the oceans* instead of testing each cell.

### Topological sort — dependency ordering

Only defined for a **DAG** (directed acyclic graph). If a cycle exists, no valid ordering exists — which is exactly how you detect cycles.

**Kahn's algorithm (BFS):**

```python
def topo_sort(n, prerequisites):
    graph = defaultdict(list)
    indegree = [0] * n
    for course, prereq in prerequisites:
        graph[prereq].append(course)       # prereq must come BEFORE course
        indegree[course] += 1

    q = deque([i for i in range(n) if indegree[i] == 0])   # no dependencies
    order = []
    while q:
        node = q.popleft()
        order.append(node)
        for nei in graph[node]:
            indegree[nei] -= 1             # one dependency satisfied
            if indegree[nei] == 0:
                q.append(nei)              # now unblocked

    return order if len(order) == n else []    # short → a cycle exists
# O(V + E)
```

`len(order) != n` means some nodes never reached indegree 0, i.e. they're stuck in a cycle. That single check solves Course Schedule.

**DFS version with three-state cycle detection:**

```python
def topo_dfs(n, prerequisites):
    graph = defaultdict(list)
    for course, prereq in prerequisites:
        graph[prereq].append(course)

    WHITE, GRAY, BLACK = 0, 1, 2           # unvisited, in-progress, done
    state = [WHITE] * n
    order = []

    def dfs(node):
        if state[node] == GRAY: return False    # back edge → CYCLE
        if state[node] == BLACK: return True    # already fully processed
        state[node] = GRAY
        for nei in graph[node]:
            if not dfs(nei): return False
        state[node] = BLACK
        order.append(node)                      # postorder
        return True

    for i in range(n):
        if not dfs(i): return []
    return order[::-1]                          # reverse the postorder
```

The GRAY state is the cycle detector: encountering a node currently on the recursion stack means you've looped back. A BLACK node is fine — that's just a revisit of a finished branch.

### Union-Find (Disjoint Set Union)

For connectivity questions where edges arrive incrementally, or when you need to count components fast.

```python
class UnionFind:
    def __init__(self, n):
        self.parent = list(range(n))
        self.rank = [1] * n
        self.count = n                        # number of components

    def find(self, x):
        while self.parent[x] != x:
            self.parent[x] = self.parent[self.parent[x]]   # path compression
            x = self.parent[x]
        return x

    def union(self, a, b):
        ra, rb = self.find(a), self.find(b)
        if ra == rb:
            return False                      # already connected → this edge
        if self.rank[ra] < self.rank[rb]:     #   would create a CYCLE
            ra, rb = rb, ra
        self.parent[rb] = ra                  # union by rank
        self.rank[ra] += self.rank[rb]
        self.count -= 1
        return True
```

With path compression and union by rank, both operations are effectively O(1) — formally O(α(n)), the inverse Ackermann function, which is under 5 for any conceivable input.

**Where Union-Find wins over DFS:**
- edges arrive one at a time (dynamic connectivity)
- "does adding this edge create a cycle?" → `union` returning `False`
- counting connected components as you go
- Kruskal's minimum spanning tree
- Redundant Connection, Accounts Merge, Number of Provinces

DFS requires the full graph up front and rebuilds from scratch each query. Union-Find is incremental.

### Dijkstra — shortest path with weights

BFS assumes every edge costs 1. When edges have different weights, use a heap to always expand the closest unfinished node.

```python
import heapq
def dijkstra(graph, start, n):
    """graph: {node: [(neighbor, weight), ...]}"""
    dist = {start: 0}
    heap = [(0, start)]                       # (distance, node)
    while heap:
        d, node = heapq.heappop(heap)
        if d > dist.get(node, float('inf')):
            continue                          # stale entry — skip
        for nei, w in graph[node]:
            nd = d + w
            if nd < dist.get(nei, float('inf')):
                dist[nei] = nd
                heapq.heappush(heap, (nd, nei))
    return dist
# O(E log V)
```

The staleness check matters: we never decrease keys in the heap, we just push duplicates and ignore outdated pops. That's the standard practical implementation.

**Dijkstra requires non-negative weights.** With negative edges use Bellman-Ford (O(V·E)), which also detects negative cycles. Cheapest Flights Within K Stops is Bellman-Ford with a step limit.

### Advanced graph algorithms — know when, not necessarily how

| Algorithm | Solves | Complexity |
|---|---|---|
| BFS | shortest path, unweighted | O(V+E) |
| Dijkstra | shortest path, non-negative weights | O(E log V) |
| Bellman-Ford | shortest path with negative weights; detects negative cycles | O(V·E) |
| Floyd-Warshall | all-pairs shortest path | O(V³) |
| Kruskal (Union-Find) | minimum spanning tree | O(E log E) |
| Prim (heap) | minimum spanning tree | O(E log V) |
| Kahn / DFS | topological sort | O(V+E) |
| Tarjan | strongly connected components, bridges | O(V+E) |

For interviews, master BFS, DFS, topological sort, Union-Find, and Dijkstra. Recognize the others by name and know which problem shape each fits — that recognition alone scores points even when you don't implement them.

### Problem set

| Problem | Key insight |
|---|---|
| Number of Islands | DFS/BFS flood fill, sink visited |
| Max Area of Island | flood fill returning a size |
| Clone Graph | old→new hashmap + DFS |
| Islands and Treasure / Walls and Gates | multi-source BFS |
| Rotting Oranges | multi-source BFS with level counting |
| Pacific Atlantic Water Flow | reverse — flow outward from each ocean |
| Surrounded Regions | mark from the border, then flip |
| Course Schedule | topological sort, cycle = impossible |
| Course Schedule II | Kahn's, return the order |
| Graph Valid Tree | connected AND `edges == n-1` AND no cycle |
| Number of Connected Components | Union-Find `count`, or DFS |
| Redundant Connection | Union-Find, the edge where `union` returns False |
| Word Ladder (Hard) | BFS over word states, wildcard buckets `h*t` |
| Alien Dictionary (Hard) | build edges from adjacent word pairs, topo sort |
| Network Delay Time | Dijkstra |
| Cheapest Flights Within K Stops | Bellman-Ford with k+1 relaxations |
| Reconstruct Itinerary (Hard) | Hierholzer's — Eulerian path |
| Min Cost to Connect All Points | Prim's MST |
| Swim in Rising Water (Hard) | Dijkstra on max-edge, or binary search + DFS |

---

## Weeks 7–10 schedule

| Week | Focus |
|---|---|
| 7 | Backtracking: subsets → permutations → combination sum. Template from memory. |
| 8 | Backtracking hard (N-Queens, Word Search, Palindrome Partitioning) + grid DFS/BFS |
| 9 | Graph fundamentals: islands, clone, multi-source BFS, Pacific Atlantic |
| 10 | Topological sort, Union-Find, Dijkstra, Word Ladder |

**Section check:**
- Write the backtracking template from memory including the copy and the undo.
- Explain the difference between `backtrack(i)` and `backtrack(i+1)`.
- Given a problem, decide BFS vs DFS in one sentence with a reason.
- Implement Union-Find with path compression from memory.
- Explain why BFS gives the shortest path but DFS doesn't.

→ Next: **[06 — Dynamic Programming](06-dynamic-programming.md)**
