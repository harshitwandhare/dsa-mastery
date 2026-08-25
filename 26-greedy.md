# 26 — Greedy Algorithms

Assumes [25 — Dynamic Programming](25-dynamic-programming.md).

Greedy algorithms are the easiest to write and the hardest to justify. **The algorithm is usually three lines. The proof is the assignment.** More points are lost in this unit than any other, because a plausible-sounding greedy that happens to be wrong looks exactly like a correct one until you find the counterexample.

---

## 26.1 What greedy means

At each step, make the choice that looks best right now, according to some fixed rule, and **never reconsider it**.

Contrast with the other paradigms:

| | Greedy | DP | Divide and conquer |
|---|---|---|---|
| Choices considered per step | one | all of them | split, not choose |
| Revisits decisions | never | implicitly, by comparing | no |
| Typical cost | sort + linear scan | states x work | solve a recurrence |
| Proof | exchange argument | cut-and-paste | strong induction |
| Risk | may be flat wrong | slow | none, if applicable |

DP asks "what if I take item i, and what if I do not, which was better?" Greedy asserts "I know which, without checking." That assertion is what needs proving.

### The two properties

**1. Greedy choice property.** There exists an optimal solution that makes the greedy choice first. Not "the greedy choice is in every optimal solution", only that it is in *some* optimal solution, which is all you need.

**2. Optimal substructure.** After making the greedy choice, what remains is a smaller instance of the same problem, and combining the greedy choice with an optimal solution to the remainder gives an optimal solution overall.

Property 2 is shared with DP. **Property 1 is what makes greedy work**, and it is what your proof must establish.

---

## 26.2 The two proof techniques

### Technique A: the exchange argument

The workhorse. The shape:

> Let `G` be the greedy solution and `O` be any optimal solution. If `O = G`, done. Otherwise, find the first place they differ. Show that you can **modify `O` to agree with `G` at that place** without making `O` worse and without breaking feasibility. Repeating this transformation turns `O` into `G` while never decreasing quality, so `G` is optimal too.

The two obligations, and graders check both:

- **The exchange preserves feasibility.** After swapping, the solution still satisfies the constraints.
- **The exchange does not worsen the objective.** New value is at least as good as old.

A common presentation variant: argue by contradiction on the *first difference*. "Let O be an optimal solution agreeing with G on the longest possible prefix. If they differ at position k, exchange, producing an optimal solution agreeing on a longer prefix, contradicting maximality." This version is tidy and is what most textbooks use.

### Technique B: greedy stays ahead

Better for problems where you can measure partial progress.

> Define a measure of progress after `k` steps. Prove by induction on k that the greedy solution's measure is at least as good as any other solution's measure after the same number of steps. Conclude at `k = |G|`.

Used for interval scheduling below, and for Dijkstra.

### Technique C: the counterexample

Just as important. **When a greedy is wrong, the answer is a specific small input where it fails.** Do not write "this is not always optimal" without one. A concrete counterexample with the greedy's value and the true optimum side by side is a complete answer and takes three lines.

---

## 26.3 Activity selection, proved properly

> **Problem.** n activities with start `s[i]` and finish `f[i]`. Select the maximum **number** of mutually non-overlapping activities.

Note this is the **unweighted** version. Weighted needs DP (file 25), and the reason will be visible in the proof.

### Candidate greedy rules, and why most fail

| Rule | Counterexample |
|---|---|
| Earliest **start** time | one activity spanning the whole day blocks everything |
| **Shortest** duration | `[1,10], [9,11], [10,20]`: shortest is `[9,11]`, which kills both others; optimum is 2 |
| Fewest **conflicts** | fails on a carefully built instance; the standard one has 4 rows |
| Earliest **finish** time | **correct** |

Being able to produce those counterexamples on demand is itself an exam skill.

### The algorithm

```
ACTIVITY-SELECT(s, f, n)
1  sort activities so that f[1] <= f[2] <= ... <= f[n]
2  A = {1}
3  last = 1
4  for i = 2 to n
5      if s[i] >= f[last]
6          A = A union {i}
7          last = i
8  return A
```

`Theta(n log n)` for the sort, `Theta(n)` for the scan.

### Proof by exchange argument

**Greedy choice property.** *Claim: there is an optimal solution containing activity 1, the one with the earliest finish time.*

*Proof.* Let `O` be any optimal solution, and let `j` be the activity in `O` with the earliest finish time. If `j = 1` we are done. Otherwise consider `O' = O - {j} + {1}`.

*Feasibility.* Since activity 1 has the earliest finish time of all activities, `f[1] <= f[j]`. Every other activity `k` in `O` is compatible with `j` and finishes later than `j`, so it starts at or after `f[j] >= f[1]`. Therefore activity 1 does not overlap any of them, and `O'` is a valid set of non-overlapping activities.

*Objective.* `|O'| = |O|`, since we removed one and added one.

So `O'` is also optimal and contains activity 1. QED

**Optimal substructure.** *Claim: if `A` is an optimal solution containing activity 1, then `A - {1}` is an optimal solution to the subproblem of activities that start at or after `f[1]`.*

*Proof (cut and paste).* Every activity in `A - {1}` is compatible with 1 and hence starts at or after `f[1]`, so `A - {1}` is a feasible solution to the subproblem. If some feasible `B` for the subproblem had `|B| > |A - {1}|`, then `B + {1}` would be feasible for the whole problem (every activity in B starts at or after `f[1]`) and larger than `A`, contradicting optimality of A. QED

**Conclusion.** By induction on the number of activities: greedy picks activity 1, which by the greedy choice property is in some optimal solution; the remaining problem is a smaller instance, on which greedy is optimal by the induction hypothesis; combining, greedy is optimal. QED

### Same problem, greedy-stays-ahead version

Let `g_1, g_2, ...` be greedy's picks in order and `o_1, o_2, ...` be any other feasible solution's picks in order.

*Claim: `f[g_k] <= f[o_k]` for all k.*

*Base.* `g_1` has the earliest finish time of all activities, so `f[g_1] <= f[o_1]`.

*Step.* Assume `f[g_{k-1}] <= f[o_{k-1}]`. Since `o_k` is compatible with `o_{k-1}`, we have `s[o_k] >= f[o_{k-1}] >= f[g_{k-1}]`, so `o_k` was available to greedy at step k. Greedy picks the compatible activity with the smallest finish time, so `f[g_k] <= f[o_k]`.

*Conclusion.* Suppose the other solution has more activities, `m > |G|`. Then `o_{|G|+1}` exists, and `s[o_{|G|+1}] >= f[o_{|G|}] >= f[g_{|G|}]`, so it was compatible with greedy's last pick and greedy would have taken it. Contradiction. Hence `|G| >= m`. QED

**Both proofs are full credit.** Learn both shapes; some problems suit one much better than the other.

### Why weights break it

With weights, the exchange step fails: swapping in the earliest-finishing activity is still feasible but may **reduce the objective**, because the displaced activity could be worth more. The feasibility half of the exchange survives, the objective half dies, and that is exactly the crack that sends you to DP.

---

## 26.4 Scheduling to minimize lateness

> **Problem.** One machine, n jobs. Job i needs `t[i]` time and has deadline `d[i]`. Schedule all jobs, no overlap. The lateness of job i is `max(0, finish[i] - d[i])`. Minimize the **maximum** lateness.

**Correct rule: earliest deadline first.** Sort by `d[i]` and run them in that order with no idle time.

Note that the rule ignores `t[i]` entirely, which feels wrong and is not.

**Two lemmas.**

*Lemma 1: some optimal schedule has no idle time.* Removing idle time only moves jobs earlier, which cannot increase any finish time, hence cannot increase any lateness.

*Lemma 2: some optimal schedule has no inversions*, where an inversion is a pair of jobs scheduled with a later-deadline job before an earlier-deadline one.

*Proof.* Suppose an optimal schedule has an inversion. Then it has an **adjacent** inversion (if `i` precedes `j` with `d[i] > d[j]` but they are not adjacent, some adjacent pair between them must also be inverted). Swap that adjacent pair.

*Feasibility.* Both are still scheduled, no overlap introduced, so the schedule is valid.

*Objective.* Only the two swapped jobs change finish time. The job moved earlier finishes sooner, so its lateness cannot increase. The job moved later, call it `i` with the larger deadline, now finishes at the time `j` previously finished. Its new lateness is `finish_old(j) - d[i]`, and since `d[i] > d[j]`, that is less than `finish_old(j) - d[j]`, which was `j`'s old lateness and hence at most the old maximum. So the maximum lateness does not increase.

Each swap reduces the inversion count by at least one, so finitely many swaps reach an inversion-free schedule that is still optimal. QED

**Conclusion.** All inversion-free, idle-free schedules have the same maximum lateness (they differ only in the order of equal-deadline jobs, which does not change the max). Earliest-deadline-first produces one. Therefore it is optimal. QED

The "adjacent inversion" move is a standard trick and is worth stealing whenever the objects have a natural order.

---

## 26.5 Huffman coding

> **Problem.** Given characters with frequencies `f[c]`, build a **prefix-free** binary code minimizing `sum over c of f[c] * depth(c)`.

Prefix-free means no codeword is a prefix of another, which is exactly the condition that the codewords are the leaves of a binary tree.

```
HUFFMAN(C)
1  Q = a min-priority queue of all characters, keyed by frequency
2  for i = 1 to |C| - 1
3      x = EXTRACT-MIN(Q)
4      y = EXTRACT-MIN(Q)
5      create a new node z with z.left = x, z.right = y, z.freq = x.freq + y.freq
6      INSERT(Q, z)
7  return EXTRACT-MIN(Q)          # the root
```

`Theta(n log n)` with a binary heap.

**Greedy choice lemma.** *Let x and y be the two characters with the lowest frequencies. There is an optimal prefix code in which x and y are siblings at maximum depth.*

*Proof.* Let `T` be an optimal tree, and let `a` and `b` be two siblings at maximum depth (an optimal tree is full, so a deepest node has a sibling). Without loss of generality `f[a] <= f[b]` and `f[x] <= f[y]`. Since x and y have the two smallest frequencies overall, `f[x] <= f[a]` and `f[y] <= f[b]`.

Swap x with a to get `T'`. The change in cost is

```
cost(T) - cost(T') = (f[a] - f[x]) * (depth(a) - depth(x))
```

Both factors are non-negative: `f[a] >= f[x]` by choice of x, and `depth(a) >= depth(x)` because a is at maximum depth. So `cost(T') <= cost(T)`, and since T was optimal, `T'` is optimal too. Swap y with b similarly to get `T''`, optimal, with x and y as deepest siblings. QED

**Optimal substructure.** Merging x and y into a single character z with `f[z] = f[x] + f[y]` produces an instance with one fewer character, and any optimal tree for that instance extends to an optimal tree for the original by splitting z back into x and y. The cost difference between the two instances is exactly `f[x] + f[y]`, a constant independent of the tree, so minimizing one minimizes the other.

*Proof of the constant.* If z sits at depth `d` in the merged tree, x and y sit at depth `d+1` in the expanded tree, so
`cost(expanded) = cost(merged) - f[z]*d + f[x](d+1) + f[y](d+1) = cost(merged) + f[x] + f[y]`.

Induction on the number of characters completes the proof. QED

Huffman is the best example in the course of a greedy whose choice property is genuinely non-obvious and whose proof is genuinely short once you see the right exchange.

---

## 26.6 Minimum spanning trees

Two greedy algorithms, one theorem behind both.

### The cut property

> **Definitions.** A **cut** `(S, V - S)` is a partition of the vertices. An edge **crosses** the cut if it has one endpoint on each side. A cut **respects** a set of edges A if no edge of A crosses it. An edge is **light** for a cut if it is a minimum-weight edge crossing it.

> **Cut property (the theorem the whole unit runs on).** Let `A` be a subset of some MST. Let `(S, V-S)` be any cut respecting `A`, and let `e` be a light edge crossing it. Then `A + {e}` is also a subset of some MST. Such an `e` is called **safe** for A.

*Proof (an exchange argument).* Let `T` be an MST containing `A`. If `e` is in `T`, done. Otherwise, adding `e` to `T` creates exactly one cycle. That cycle crosses the cut an even number of times, so it contains another edge `e'` crossing the cut, and `e'` is not in `A` because the cut respects A. Let `T' = T - {e'} + {e}`.

*Feasibility.* Removing an edge of the unique cycle leaves a spanning tree: `T'` is connected (any path using `e'` can reroute the rest of the way around the cycle) and has `|V| - 1` edges.

*Objective.* `w(e) <= w(e')` because `e` is light for the cut. So `w(T') <= w(T)`, and since T is minimum, `w(T') = w(T)` and `T'` is an MST.

`T'` contains `A + {e}`, since we only removed `e'`, which is not in A. QED

**Every MST algorithm in the course is an application of this one theorem.** Say the words "by the cut property, this edge is safe" and you have justified the step.

### Kruskal

Sort edges by weight, add each edge if it does not create a cycle. Uses a **disjoint-set (union-find)** structure.

```
MST-KRUSKAL(G, w)
1  A = {}
2  for each vertex v: MAKE-SET(v)
3  sort edges by weight
4  for each edge (u,v) in weight order
5      if FIND-SET(u) != FIND-SET(v)
6          A = A + {(u,v)};  UNION(u,v)
7  return A
```

*Why each added edge is safe.* When `(u,v)` is added, let `S` be the connected component of `u` in the forest `A`. The cut `(S, V-S)` respects A by construction. Every edge crossing it that was examined earlier was rejected only because it was internal to a component, contradiction, so every crossing edge has weight at least `w(u,v)`. Hence `(u,v)` is light for that cut and safe by the cut property.

**Time.** Sorting `O(E log E)`. Union-find with union by rank and path compression gives `O(E alpha(V))` for the operations, where alpha is the inverse Ackermann function and is at most 4 for any input in the universe. **Total `O(E log E) = O(E log V)`**, since `E < V^2` makes `log E < 2 log V`.

### Prim

Grow a single tree from an arbitrary root, always adding the cheapest edge leaving it. Uses a min-priority queue.

```
MST-PRIM(G, w, r)
1  for each vertex u: u.key = INF;  u.parent = NIL
2  r.key = 0
3  Q = all vertices
4  while Q is not empty
5      u = EXTRACT-MIN(Q)
6      for each v adjacent to u
7          if v in Q and w(u,v) < v.key
8              v.parent = u;  v.key = w(u,v)
```

*Why each added edge is safe.* The cut is `(vertices removed from Q, vertices still in Q)`. It respects the tree built so far, and `EXTRACT-MIN` returns exactly a light edge crossing it.

**Time.** Binary heap: `O(E log V)`. Fibonacci heap: `O(E + V log V)`, which is better for dense graphs. Adjacency matrix with a linear scan instead of a heap: `O(V^2)`, which is better still for very dense graphs.

| Algorithm | Structure | Time | Best when |
|---|---|---|---|
| Kruskal | union-find | `O(E log V)` | sparse, or edges already sorted |
| Prim (binary heap) | heap | `O(E log V)` | general |
| Prim (Fibonacci heap) | heap | `O(E + V log V)` | dense |
| Prim (array) | array | `O(V^2)` | very dense, `E ~ V^2` |

**Uniqueness.** If all edge weights are distinct, the MST is unique. Proof: suppose two distinct MSTs T1 and T2; take the minimum-weight edge in exactly one of them, say `e` in T1; adding `e` to T2 creates a cycle containing an edge `e'` not in T1; by minimality of `e`, `w(e) < w(e')`, so swapping gives a lighter spanning tree than T2, contradiction. This "distinct weights implies unique MST" fact is a standard exam question, as is its converse being false.

---

## 26.7 Matroids, for the students who want the general theory

The question "when exactly does greedy work?" has a real answer for a class of problems.

A **matroid** is a pair `(S, I)` where S is a finite set and I is a family of subsets of S (called independent sets) with:

1. **Hereditary:** if `B` is in I and `A` is a subset of `B`, then `A` is in I.
2. **Exchange:** if `A, B` are in I and `|A| < |B|`, then there is some `x` in `B - A` with `A + {x}` in I.

> **Theorem (Rado, Edmonds).** For a weighted matroid with non-negative weights, the greedy algorithm "sort elements by weight descending, add each if it keeps the set independent" produces a maximum-weight independent set.

The forests of a graph form a matroid (the **graphic matroid**), which is exactly why Kruskal works. Scheduling unit-time tasks with deadlines and penalties forms a matroid too.

Most courses cover this as an optional section. What is worth carrying: **greedy works when the structure has the exchange property, and the exchange argument you write by hand for a specific problem is that property in disguise.**

Interval scheduling is *not* a matroid, and yet greedy works there. So matroids are sufficient, not necessary. Do not claim otherwise.

---

## 26.8 Greedies that look right and are not

Have these ready as counterexamples.

| Problem | Tempting greedy | Counterexample |
|---|---|---|
| 0/1 knapsack | take highest value/weight ratio | `W = 10`, items `(w=6,v=7)` and `(w=5,v=5),(w=5,v=5)`. Ratios 1.17 vs 1.0, greedy takes the first for 7, optimum is 10. |
| Coin change | take the largest coin that fits | denominations `{1,3,4}`, amount 6. Greedy `4+1+1 = 3` coins, optimum `3+3 = 2`. |
| Shortest path with negative edges | Dijkstra | `s->a` weight 2, `s->b` weight 1, `b->a` weight -2. Dijkstra finalizes `a` at 2, true distance is -1. |
| Longest path | repeatedly take the heaviest available edge | trivially fails; the problem is NP-hard. |
| Vertex cover | repeatedly take the highest-degree vertex | gives a `Theta(log n)` approximation, not optimal; a specific bipartite family forces the gap. |
| Set cover | take the set covering the most uncovered | `ln n` approximation, provably not better unless P = NP. |
| Weighted interval scheduling | earliest finish time | one long job of weight 100 versus two short ones of weight 1 each. |

**Fractional knapsack is the exception that proves the rule.** If you may take fractions of items, the ratio greedy **is** optimal, by a clean exchange argument: any solution not following ratio order can be improved by swapping a unit of lower-ratio material for higher-ratio material. The 0/1 restriction is what breaks it, because you cannot make the swap in fractional amounts. Being able to say precisely why the same rule works in one case and not the other is exam gold.

---

## 26.9 How to attack a greedy problem on an exam

```
1. Write down 3 or 4 plausible greedy rules.
2. Try to break each one on a small input (n = 3 usually suffices).
3. Whatever survives, attempt an exchange argument on it.
   - If the exchange preserves feasibility AND does not worsen the objective, you have it.
   - If the objective step fails, that failure is your counterexample, or your signal to use DP.
4. If no greedy survives, say so explicitly, give a counterexample for the most
   plausible one, and solve with DP.
```

Step 4 is worth stating because **"greedy does not work here, and here is why, so I use DP"** is a stronger answer than silently using DP. It shows the grader you considered the cheaper option and ruled it out for a reason.

### The sentences that earn marks

- "Sort by X. We claim greedy is optimal."
- "Let O be an optimal solution differing from G, and let k be the first index where they differ."
- "The exchange preserves feasibility because ..."
- "The objective does not worsen because ..."
- "Repeating this transformation converts O into G without decreasing quality, so G is optimal."

### The sentences that lose marks

- "Greedy clearly works here." No.
- "It is intuitive that taking the smallest first is best." No.
- "This is similar to activity selection so it is optimal." Similar is not the same. Do the exchange.
- Giving the algorithm and the running time with no proof at all. That is at most half credit on a design-and-prove question, and often less.

---

## 26.10 Practice

1. n files of sizes `s[1..n]` to be stored on a tape. Each read of file i costs the sum of the sizes of all files up to and including i. Minimize the expected read cost assuming uniform access. Which order, and prove it.
2. You must schedule n jobs on one machine; job i takes `t[i]` time. Minimize the **average completion time**. Which greedy, and prove it by an adjacent exchange.
3. Given n intervals, find the minimum number of points that hit every interval. Give a greedy and prove it.
4. Prove: if all edge weights of a connected graph are distinct, the MST is unique.
5. Does Prim's algorithm work with negative edge weights? Does Dijkstra's? Explain the difference.
6. You are given a set of intervals and want the minimum number of "rooms" so that overlapping intervals get different rooms. Greedy? Proof? What is the lower bound that makes it tight?
7. Give a counterexample showing that the "fewest conflicts" rule for activity selection is not optimal.

### Answers

Do not read this until you have written your own attempt on paper.

1. Sort by increasing size. Adjacent exchange: if file `i` of size `a` precedes file `j` of size `b` with `a > b`, swapping them decreases the total cost by `a - b > 0`, because the total cost is `sum_k (n - k + 1) * s[k]`, so earlier positions carry larger multipliers and should hold smaller files. An inversion-free order is exactly increasing size.

2. **Shortest processing time first.** Total completion time is `sum_k (n - k + 1) * t[k]`, the same expression as problem 1, so the same adjacent-exchange argument applies: any adjacent pair out of increasing-time order can be swapped to strictly reduce the sum.

3. Sort intervals by right endpoint. Repeatedly take the right endpoint of the first uncovered interval as a point, and discard every interval it hits. Exchange: any solution must place a point inside the first interval, and moving that point to the interval's right endpoint can only hit more intervals (every interval hit by a point p in `[l, r]` and extending past r is still hit by r; nothing hit by p that ends before r could have been hit, since p <= r). So the greedy choice is safe, and induction on the remaining intervals finishes it. This is the dual of activity selection and the answer size equals the maximum number of pairwise-disjoint intervals.

4. Suppose T1 and T2 are distinct MSTs. Let `e` be the minimum-weight edge belonging to exactly one of them, say T1. Adding `e` to T2 creates a unique cycle, which must contain some edge `e'` not in T1 (otherwise the cycle lies entirely in T1). By the choice of `e` as the minimum such edge and by distinctness, `w(e) < w(e')`. Then `T2 - {e'} + {e}` is a spanning tree of strictly smaller weight, contradicting T2 being an MST.

5. **Prim works** with negative weights. Its correctness rests on the cut property, which never assumes non-negativity; it only compares edge weights to each other. **Dijkstra fails**, because its correctness rests on the claim that once a vertex is extracted its distance is final, which requires that extending a path can never decrease its length. A negative edge violates that. Use Bellman-Ford instead (file 27).

6. Sort intervals by start time and sweep, keeping a min-heap of the finish times of currently-occupied rooms; reuse a room if its finish time is at or before the current start, otherwise open a new one. `O(n log n)`. Optimality is immediate from a lower bound: if at some instant `d` intervals overlap, at least `d` rooms are necessary. The greedy opens a new room only at a moment when all existing rooms are busy, so the number of rooms it opens equals the maximum overlap depth, which meets the lower bound. This "greedy meets a matching lower bound" pattern is often shorter than an exchange argument, and is worth trying first.

7. Take one interval A at the top. Below it, four intervals B, C, D, E laid end to end so that B and C both overlap A's left half and D and E both overlap A's right half, arranged so A conflicts with exactly 2 while B, C, D, E each conflict with 3. Then "fewest conflicts" picks A first, which blocks all four, giving a solution of size 3 at best; the optimum takes B, C, D, E for size 4. Any instance with this shape works; the standard textbook picture has 11 intervals in 4 rows.


---

Next: [27 — Graphs and Network Flow](27-graphs-and-network-flow.md).
