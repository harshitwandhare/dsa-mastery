# 27 — Graphs and Network Flow

Assumes [26 — Greedy](26-greedy.md). This is the largest unit in the second half of the material and the one with the most quotable theorems. **Know the theorems by name.** Half of what you will be asked is solved by modelling the input as a graph and then citing something on this page.

---

## 27.1 Vocabulary and representation

A graph `G = (V, E)`. Write `n = |V|` and `m = |E|`, or `V` and `E` used as numbers, which CLRS does and which is a small abuse everyone accepts.

- **Directed** edges are ordered pairs; **undirected** edges are unordered.
- **Degree** of a vertex is its number of incident edges; directed graphs have **in-degree** and **out-degree**.
- **Path**: a sequence of vertices joined by edges. **Simple** if no vertex repeats.
- **Cycle**: a path from a vertex back to itself. A **DAG** is a directed graph with no cycles.
- **Connected**: every pair of vertices has a path between them (undirected). **Strongly connected**: every ordered pair has a directed path (directed).
- **Tree**: connected and acyclic. Has exactly `n - 1` edges. Any two of {connected, acyclic, `n-1` edges} imply the third.

**Density facts you should be able to state instantly:** an undirected simple graph has `m <= n(n-1)/2 = O(n^2)`; a connected graph has `m >= n - 1`; a tree has `m = n - 1`; a DAG can have `O(n^2)` edges. "Sparse" means `m = O(n)`, "dense" means `m = Theta(n^2)`.

| Representation | Space | `is (u,v) an edge?` | iterate neighbours of u | Best for |
|---|---|---|---|---|
| Adjacency list | `Theta(n + m)` | `O(deg u)` | `Theta(deg u)` | sparse graphs, which is most of them |
| Adjacency matrix | `Theta(n^2)` | `O(1)` | `Theta(n)` | dense graphs, or when you need fast edge tests |

**Default to adjacency lists** and say so. Almost every bound in this file is `O(n + m)` or `O(m log n)`, which assumes lists.

**Never write `O(n)` when you mean `O(n + m)`.** With two independent parameters, neither dominates, and dropping one is a real error that a careful reader catches.

---

## 27.2 Breadth-first search

Explore in waves. Uses a queue.

```
BFS(G, s)
1  for each vertex u: u.color = WHITE;  u.d = INF;  u.parent = NIL
2  s.color = GRAY;  s.d = 0
3  Q = {s}
4  while Q is not empty
5      u = DEQUEUE(Q)
6      for each v adjacent to u
7          if v.color == WHITE
8              v.color = GRAY;  v.d = u.d + 1;  v.parent = u
9              ENQUEUE(Q, v)
10     u.color = BLACK
```

**Time `O(V + E)`.** Each vertex is enqueued at most once (it turns gray exactly once), and each adjacency list is scanned once, and the lists total `Theta(E)` for directed graphs or `Theta(2E)` for undirected.

> **Theorem.** BFS computes `v.d = delta(s, v)`, the **shortest path distance in edges**, for every reachable v, and the parent pointers form a shortest-path tree.

*Proof idea:* two halves. `v.d >= delta(s,v)` by induction on enqueue order, since we only ever set `v.d = u.d + 1` along a real edge. `v.d <= delta(s,v)` by induction on distance, using the queue invariant that the `d` values in the queue are monotonically non-decreasing and differ by at most 1. That queue invariant is the lemma to state explicitly.

**Uses:** shortest paths in unweighted graphs; connected components; testing bipartiteness (2-colour by level; an edge within a level means an odd cycle, hence not bipartite); finding the shortest cycle; and as the augmenting-path finder in Edmonds-Karp later in this file.

---

## 27.3 Depth-first search and its structure

Explore as deep as possible, backtrack. Uses recursion (an implicit stack).

```
DFS(G)
1  for each vertex u: u.color = WHITE;  u.parent = NIL
2  time = 0
3  for each vertex u
4      if u.color == WHITE
5          DFS-VISIT(G, u)

DFS-VISIT(G, u)
1  time = time + 1;  u.discovery = time;  u.color = GRAY
2  for each v adjacent to u
3      if v.color == WHITE
4          v.parent = u;  DFS-VISIT(G, v)
5  u.color = BLACK
6  time = time + 1;  u.finish = time
```

**Time `O(V + E)`.**

### The three structural results

**Parenthesis theorem.** For any two vertices u, v, the intervals `[u.discovery, u.finish]` and `[v.discovery, v.finish]` are either entirely disjoint, or one contains the other. Nesting corresponds exactly to descendant relationships in the DFS forest. This is why the discovery and finish times are worth computing at all.

**White path theorem.** `v` is a descendant of `u` in the DFS forest **iff** at the time `u` is discovered, there is a path from u to v consisting entirely of white vertices. This is the standard tool for proving things about DFS trees.

**Edge classification.** Every edge `(u,v)` is exactly one of:

| Type | Condition when explored from u | Meaning |
|---|---|---|
| **Tree** | v is WHITE | v becomes a child of u |
| **Back** | v is GRAY | v is an ancestor of u |
| **Forward** | v is BLACK and `v.discovery > u.discovery` | v is a non-child descendant |
| **Cross** | v is BLACK and `v.discovery < u.discovery` | everything else |

> **Theorem.** A directed graph has a cycle **iff** DFS finds a back edge.

*Proof.* If there is a back edge `(u,v)`, then v is an ancestor of u, so the tree path from v to u plus that edge is a cycle. Conversely, if there is a cycle, let v be its first-discovered vertex. The rest of the cycle is a white path from v at v's discovery time, so by the white path theorem all of them are descendants of v, including the vertex u that has the edge back to v. That edge goes to an ancestor and is therefore a back edge. QED

This is the standard cycle test and it is `O(V + E)`. In **undirected** graphs, DFS produces only tree and back edges, and any back edge means a cycle.

---

## 27.4 Topological sort

> **Definition.** A topological order of a DAG is a linear order of the vertices such that every edge goes forwards.

```
TOPOLOGICAL-SORT(G)
1  run DFS to compute finish times
2  output the vertices in DECREASING order of finish time
```

**Time `O(V + E)`.**

*Correctness proof.* It suffices to show that for every edge `(u,v)`, `v.finish < u.finish`. When `(u,v)` is explored, `v` is not gray (a gray v would make this a back edge and the graph would have a cycle, contradicting DAG-ness). If v is white it becomes a descendant and finishes before u by the parenthesis theorem. If v is black it has already finished, so `v.finish < u.finish`. Either way the claim holds, so decreasing finish order puts u before v. QED

**Kahn's algorithm** is the alternative: repeatedly output a vertex of in-degree 0 and remove it. Also `O(V + E)`, and it has the useful side effect of **detecting cycles** (if it stalls with vertices remaining, there is a cycle) and of enumerating orders.

**Why it matters:** topological order is the evaluation order for any DP whose state graph is a DAG, and it makes longest path, shortest path, and counting paths all linear-time on DAGs. That contrast (linear on a DAG, NP-hard in general for longest path) is worth carrying with you.

---

## 27.5 Strongly connected components

> **Definition.** A strongly connected component (SCC) is a maximal set of vertices where every pair is mutually reachable.

**Kosaraju's algorithm:**

```
STRONGLY-CONNECTED-COMPONENTS(G)
1  run DFS(G) to compute finish times
2  compute G^T, the transpose (all edges reversed)
3  run DFS(G^T), considering vertices in DECREASING order of the finish times from step 1
4  each tree in the second DFS forest is one SCC
```

**Time `O(V + E)`.** Two DFS passes plus a transpose, each linear.

**Why it works, in one idea.** The **component graph** (contract each SCC to a single vertex) is always a DAG. Processing in decreasing finish order visits the component DAG in topological order, so the second DFS starts in a "source" component of the original and cannot escape it in the transpose. Proving this cleanly needs a lemma: if `C` and `C'` are distinct SCCs with an edge from C to C', then `max finish in C > max finish in C'`.

**Tarjan's algorithm** does it in a single DFS pass using low-link values. Faster in practice, more intricate. Know that it exists; Kosaraju is the one usually taught.

**The component graph is a DAG** is itself a fact worth memorizing, and it is the standard first step for problems like "given implications, find contradictions" (2-SAT is solved exactly this way: build the implication graph, and the formula is satisfiable iff no variable shares an SCC with its negation).

---

## 27.6 Shortest paths

Four algorithms. Choosing correctly is most of the work.

| Algorithm | Handles | Time | Notes |
|---|---|---|---|
| BFS | unweighted | `O(V + E)` | shortest in number of edges |
| DAG relaxation | any weights, DAG only | `O(V + E)` | topological order, one pass |
| Dijkstra | non-negative weights | `O((V+E) log V)` binary heap, `O(E + V log V)` Fibonacci | greedy |
| Bellman-Ford | negative weights, detects negative cycles | `O(VE)` | DP |
| Floyd-Warshall | all pairs, negative allowed | `O(V^3)` | DP over intermediate vertices |
| Johnson | all pairs, sparse, negative allowed | `O(V^2 log V + VE)` | reweight, then n Dijkstras |

### Relaxation, the shared primitive

```
RELAX(u, v, w)
1  if v.d > u.d + w(u,v)
2      v.d = u.d + w(u,v)
3      v.parent = u
```

Every shortest-path algorithm is "relax edges in some order until nothing changes"; they differ only in the order and in how many times.

Two invariants worth naming in proofs:

- **Upper bound property:** `v.d >= delta(s,v)` always, and once equal it never changes again.
- **Convergence property:** if `s ->...-> u -> v` is a shortest path and `u.d = delta(s,u)` at the moment `(u,v)` is relaxed, then afterwards `v.d = delta(s,v)`.
- **Path relaxation property:** if the edges of a shortest path to v are relaxed in order (with anything in between), then `v.d = delta(s,v)`. This one immediately proves Bellman-Ford.

### Dijkstra

```
DIJKSTRA(G, w, s)
1  initialize all d to INF, s.d = 0
2  S = {}
3  Q = all vertices, keyed by d
4  while Q is not empty
5      u = EXTRACT-MIN(Q)
6      S = S + {u}
7      for each v adjacent to u
8          RELAX(u, v, w)         # DECREASE-KEY in Q if d changed
```

**Greedy, and the greedy choice is "the closest unfinalized vertex is done".**

*Correctness.* Invariant: when u is extracted, `u.d = delta(s,u)`. Suppose not, and let u be the first extracted vertex where it fails. Consider a true shortest path from s to u; let `(x,y)` be the first edge on it leaving S, so x is in S and y is not. By the induction hypothesis `x.d = delta(s,x)`, and `(x,y)` was relaxed when x was extracted, so `y.d = delta(s,y)`. Since y is on a shortest path to u and **all weights are non-negative**, `delta(s,y) <= delta(s,u) < u.d`. But then `y.d < u.d` and y is still in Q, so the extraction would have returned y, not u. Contradiction. QED

**Read where non-negativity was used:** the step `delta(s,y) <= delta(s,u)`. With a negative edge later on the path, a prefix can be longer than the whole, and the argument dies. That is the answer to "why does Dijkstra fail with negative weights", and the expected answer is that specific sentence, not "it just does".

### Bellman-Ford

```
BELLMAN-FORD(G, w, s)
1  initialize all d to INF, s.d = 0
2  for i = 1 to |V| - 1
3      for each edge (u,v)
4          RELAX(u, v, w)
5  for each edge (u,v)                 # negative cycle detection
6      if v.d > u.d + w(u,v)
7          return FALSE
8  return TRUE
```

**Time `O(VE)`.**

*Correctness.* Any shortest path is simple and so has at most `|V| - 1` edges. After pass i, every vertex whose shortest path uses at most i edges has its correct distance, by the path relaxation property and induction on i. So `|V|-1` passes suffice. If a further relaxation is still possible in line 6, some shortest path would need `|V|` or more edges, which is only possible if a negative-weight cycle is reachable. QED

It is a DP in disguise: `d[i][v]` = shortest distance to v using at most i edges. The second index is exactly the trick from file 25 that breaks the cyclic dependency.

### Floyd-Warshall

All-pairs, and one of the cleanest DPs in the course.

```
FLOYD-WARSHALL(W)
1  D = W                        # D[i][j] = w(i,j), or INF, or 0 if i==j
2  for k = 1 to n
3      for i = 1 to n
4          for j = 1 to n
5              D[i][j] = min( D[i][j], D[i][k] + D[k][j] )
6  return D
```

**The state is `d[k][i][j]` = shortest path from i to j using only vertices from `{1..k}` as intermediates.** The recurrence enumerates the last decision: does the path use vertex k or not?

```
d[k][i][j] = min( d[k-1][i][j],  d[k-1][i][k] + d[k-1][k][j] )
```

The 2D version above is correct because `d[k][i][k] = d[k-1][i][k]` (a shortest path to k does not benefit from passing through k), so in-place update is safe. **The loop order with k outermost is mandatory**, and swapping it is a classic wrong answer.

`Theta(V^3)` time, `Theta(V^2)` space. Detects negative cycles by checking for a negative diagonal entry.

### Choosing between them

```
unweighted?                       -> BFS,            O(V+E)
DAG?                              -> topological DP, O(V+E)
non-negative weights?             -> Dijkstra,       O(E log V)
negative weights, single source?  -> Bellman-Ford,   O(VE)
all pairs, dense?                 -> Floyd-Warshall, O(V^3)
all pairs, sparse with negatives? -> Johnson,        O(V^2 log V + VE)
```

Say the running time in terms of both V and E, and say which structure you assume.

---

## 27.7 Network flow: the model

> **Definition.** A **flow network** is a directed graph `G = (V,E)` with a non-negative **capacity** `c(u,v)` on each edge, a **source** s, and a **sink** t. A **flow** is a function `f(u,v)` satisfying:
>
> 1. **Capacity constraint:** `0 <= f(u,v) <= c(u,v)` for every edge.
> 2. **Flow conservation:** for every vertex except s and t, total flow in equals total flow out.
>
> The **value** of a flow is `|f| = (flow out of s) - (flow into s)`.

> **Definition.** An **s-t cut** is a partition `(S, T)` of V with s in S and t in T. Its **capacity** is the sum of capacities of edges going from S to T. (Edges from T to S do **not** count. This is the single most common error.)

### The residual graph

Given a flow f, the **residual capacity** is

```
c_f(u,v) = c(u,v) - f(u,v)        for a forward edge
c_f(v,u) = f(u,v)                 for the backward edge
```

The residual graph `G_f` contains every edge with positive residual capacity. The **backward edges are the whole idea**: they let the algorithm *undo* a previous routing decision, which is what makes a purely local greedy converge to a global optimum. Without them you get stuck; with them you cannot.

An **augmenting path** is any s-to-t path in `G_f`. Pushing flow equal to the minimum residual capacity along it (the **bottleneck**) increases `|f|` by exactly that amount and keeps the result a valid flow.

---

## 27.8 Ford-Fulkerson and max-flow min-cut

```
FORD-FULKERSON(G, s, t)
1  f = 0 on every edge
2  while there is an augmenting path p in G_f
3      c_f(p) = min residual capacity along p
4      augment f along p by c_f(p)
5  return f
```

> **Max-flow min-cut theorem.** For any flow network, the following three statements are equivalent:
>
> 1. `f` is a maximum flow.
> 2. `G_f` contains no augmenting path.
> 3. `|f| = c(S,T)` for some cut `(S,T)`.
>
> Consequently the **maximum flow value equals the minimum cut capacity**.

*Proof.* **(1 implies 2):** if an augmenting path existed we could increase `|f|`, contradicting maximality.

**(2 implies 3):** suppose `G_f` has no s-t path. Let `S` be the set of vertices reachable from s in `G_f`, and `T = V - S`. Then s is in S and t is in T, so this is a cut. For any edge `(u,v)` with u in S and v in T, we must have `f(u,v) = c(u,v)`, since otherwise there would be residual capacity and v would be reachable. For any edge `(v,u)` with v in T and u in S, we must have `f(v,u) = 0`, since otherwise the backward residual edge would make v reachable. Therefore the net flow across the cut equals `c(S,T)`, and by the flow-value lemma (the net flow across any cut equals `|f|`), `|f| = c(S,T)`.

**(3 implies 1):** `|f| <= c(S,T)` for every cut, by the flow-value lemma and the capacity constraint. So a flow achieving some cut's capacity is maximum. QED

**The theorem is the most useful single fact in the second half of the material.** It gives you a *certificate*: to prove a flow is maximum, exhibit a cut of the same capacity. That is exactly what gets asked.

**How to read the min cut off a max flow** (also a standard question): run the max flow, then take `S` = the vertices reachable from s in the final residual graph. The edges from S to T are saturated and form the min cut.

### Running time, and why the choice of path matters

Ford-Fulkerson as stated does not specify how to find the augmenting path, and that omission is not innocent.

- With **integer** capacities, each augmentation increases the flow by at least 1, so there are at most `|f*|` iterations, giving `O(E |f*|)`. That depends on the *values* of the capacities, so it is **pseudo-polynomial**. The classic bad instance is a 4-vertex diamond with capacities 1000, 1000, 1, 1000, 1000, where a pathological path choice alternates through the capacity-1 edge and takes 2000 iterations.
- With **irrational** capacities, it can fail to terminate at all, and can even converge to the wrong value. Worth one sentence whenever you cite the algorithm.

**Edmonds-Karp** fixes it: always choose the **shortest** augmenting path, found by BFS.

> **Theorem.** Edmonds-Karp performs `O(VE)` augmentations, hence runs in `O(VE^2)`, independent of capacities.

*Proof sketch:* the BFS distance from s to any vertex in the residual graph never decreases across augmentations, and each augmentation saturates at least one edge; a saturated edge cannot reappear on an augmenting path until the distance to one of its endpoints has increased by at least 2. Since distances are bounded by V, each edge can be critical `O(V)` times, giving `O(VE)` augmentations total.

**Dinic's algorithm** improves this to `O(V^2 E)` in general and `O(E sqrt(V))` on unit-capacity graphs, which is the bound to quote for bipartite matching. **Push-relabel** achieves `O(V^3)`. Know the names and the bounds.

### The integrality theorem

> **Theorem.** If all capacities are integers, there is a maximum flow in which every `f(u,v)` is an integer, and Ford-Fulkerson finds one.

Obvious from the algorithm (every bottleneck is an integer if you start at 0 with integer capacities), and it is what licenses every combinatorial application below. Without it, "route 0.5 of a person through this edge" would be a legal answer.

---

## 27.9 Modelling with flow

This is what actually gets tested. The algorithm is a black box you cite; the skill is building the network.

### Bipartite matching

> Given a bipartite graph `(L, R, E)`, find a maximum matching.

**Construction.** Add a source s with a unit-capacity edge to every vertex of L. Add a sink t with a unit-capacity edge from every vertex of R. Direct every original edge from L to R with capacity 1 (or infinity, either works).

**Claim: the maximum matching size equals the maximum flow value.**

*Proof (both directions, and both are required).*

*Matching to flow.* Given a matching M, push one unit along `s -> u -> v -> t` for each matched pair `(u,v)`. Capacities are respected because each vertex is in at most one pair, so each unit-capacity edge from s or to t carries at most 1. Conservation holds. Value is `|M|`.

*Flow to matching.* Given an integral max flow (which exists by the integrality theorem), take the set of L-to-R edges carrying one unit. Each vertex of L has at most 1 incoming from s, so at most one of its edges carries flow; likewise for R. So the selected edges form a matching of size `|f|`.

Hence the two maxima are equal. QED

**Time.** `O(VE)` by Ford-Fulkerson since the max flow is at most `V`, or `O(E sqrt(V))` with Hopcroft-Karp / Dinic.

**Konig's theorem** falls right out of max-flow min-cut: in a bipartite graph, the maximum matching size equals the minimum vertex cover size. Constructing the vertex cover from the min cut is a standard exercise.

### Vertex capacities

Flow networks constrain edges, not vertices. To bound the flow **through a vertex** v by `c(v)`: **split v into `v_in` and `v_out`**, route all incoming edges to `v_in`, all outgoing edges from `v_out`, and add a single edge `v_in -> v_out` with capacity `c(v)`.

This vertex-splitting gadget appears constantly. Learn it.

### Edge-disjoint and vertex-disjoint paths

**Menger's theorem.** The maximum number of edge-disjoint s-t paths equals the minimum number of edges whose removal disconnects s from t. Proof: set every capacity to 1 and apply max-flow min-cut. The vertex version follows by splitting every vertex as above.

### Multiple sources and sinks

Add a **super-source** with infinite-capacity edges to every real source, and a **super-sink** with infinite-capacity edges from every real sink. Now it is a single-source single-sink problem.

### Lower bounds on edges, and circulations

If an edge must carry at least `l(u,v)`, use a **circulation with demands** formulation: subtract the lower bound from the capacity, and adjust the demands at the endpoints by `l`. Standard construction, worth knowing if your course covers circulations.

### The modelling checklist

```
1. What are the units flowing?  (people, jobs, units of product)
2. What is scarce?              -> those become capacities
3. What are the two "sides"?    -> source side and sink side
4. Any per-vertex limit?        -> split the vertex
5. Multiple sources or sinks?   -> super-source, super-sink
6. Is the answer a max or a min? A min usually means you want the CUT.
7. State and prove the correspondence in BOTH directions.
```

Step 7 is where the substance is. "Max flow equals max matching" is not a proof; the two constructions above are.

---

## 27.10 Practice

1. Give an `O(V+E)` algorithm to test whether an undirected graph is bipartite. Prove it.
2. Prove that a graph with `n` vertices and more than `n-1` edges has a cycle.
3. Given a DAG, count the number of distinct paths from s to t. Time?
4. Why does Dijkstra fail with negative edges? Give a 3-vertex counterexample and identify the exact step of the correctness proof that breaks.
5. You have a graph where every edge weight is 1 or 2. Give an `O(V+E)` shortest path algorithm.
6. n students, m projects, each student lists the projects they will accept, each project takes at most `k` students. Decide whether all students can be assigned. Model as flow and prove the correspondence.
7. Prove that in any flow network with integer capacities, the max flow value equals the min cut capacity, and explain how to extract the min cut from a completed max flow.
8. A company has n employees and m tasks; employee i can do a subset of tasks and can work at most `h[i]` hours; task j needs `r[j]` hours. Can all tasks be covered? Model as flow.

### Answers

Do not read this until you have written your own attempt on paper.

1. BFS from each unvisited vertex, colouring each vertex by the parity of its level. If any edge joins two vertices of the same colour, report not bipartite. Correctness: a 2-colouring exists iff there is no odd cycle; BFS levels give a valid 2-colouring iff no edge is within a level, and an edge within a level `d` closes a cycle of length `2d' + 1` for some d', which is odd. `O(V+E)`.

2. A connected graph on n vertices needs at least `n-1` edges, and a spanning tree has exactly `n-1`. If the graph is acyclic it is a forest with `k` components and exactly `n - k <= n - 1` edges. So more than `n-1` edges forces a cycle. (Careful: the graph need not be connected, hence the forest phrasing.)

3. `paths[t] = 1`; `paths[v] = sum over edges (v,u) of paths[u]`, evaluated in reverse topological order. `O(V+E)`. This is a DP whose evaluation order is exactly the topological sort.

4. Counterexample: edges `s->a` weight 2, `s->b` weight 1, `b->a` weight -2. Dijkstra extracts b (d=1), then extracts a with `d=2`, finalizing it, but the true distance is `1 + (-2) = -1`. The broken step is `delta(s,y) <= delta(s,u)` in the correctness proof: it assumes a prefix of a shortest path is no longer than the whole path, which requires non-negative weights.

5. Replace each weight-2 edge with two weight-1 edges through a new dummy vertex, then run BFS. The graph grows to `O(V+E)` vertices and edges, so the total is still `O(V+E)`. (Alternative: 0-1-2 BFS with a deque, or a bucket queue with 2V+1 buckets.)

6. Source s to each student with capacity 1; student to each acceptable project with capacity 1; each project to sink t with capacity k. All students can be assigned iff the max flow equals n. Forward direction: a valid assignment gives a flow of value n by pushing one unit along each student's chosen path, respecting the project capacities since at most k students choose each. Backward: an integral max flow of value n saturates every s-to-student edge, and each student sends its unit along exactly one project edge, giving a valid assignment; the project-to-t capacity ensures no project exceeds k.

7. The equivalence proof is in 27.8. To extract the cut: in the residual graph of the final flow, let `S` be the set of vertices reachable from s by a BFS or DFS, and `T = V - S`. Every edge from S to T is saturated and every edge from T to S carries zero flow, so `c(S,T) = |f|`, and since every cut has capacity at least `|f|`, this cut is minimum.

8. Source to each employee with capacity `h[i]`; employee to each task they can do with capacity infinity (or `min(h[i], r[j])`); task j to sink with capacity `r[j]`. All tasks are coverable iff the max flow equals `sum_j r[j]`, that is iff every task-to-sink edge is saturated. This is a transportation problem, and the integrality theorem gives whole-hour assignments when all `h` and `r` are integers.


---

Next: [28 — NP-Completeness](28-np-completeness.md).
