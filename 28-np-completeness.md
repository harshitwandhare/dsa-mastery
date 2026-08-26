# 28 — NP-Completeness and Lower Bounds

The last unit, and the one that changes how you think. Everything before this was "here is how to solve it faster". This is "here is how to prove nobody can".

Assumes [27 — Graphs and Network Flow](27-graphs-and-network-flow.md).

---

## 28.1 Setting up: decision problems and encodings

To reason about hardness we need to be precise about two things people are normally sloppy with.

**Decision problems.** A decision problem has a yes/no answer. `CLIQUE = { (G, k) : G has a clique of size k }` is a decision problem; "find the largest clique" is an optimization problem. **The theory is built on decision problems**, because a yes/no answer is a clean object to reason about.

This is not a limitation. Optimization and decision are polynomially equivalent for essentially every problem you will meet: if you can decide "is there a clique of size k" in polynomial time, you can binary search on k to find the size, and then find an actual clique by testing vertices one at a time for removal. So proving the decision version hard proves the optimization version hard. Say that sentence once in your answer and then work with decision problems.

**Input size means the number of bits.** This is the definition that makes the whole subject coherent, and it is the one that trips people up.

For a graph, the size is `Theta(V + E)` or `Theta(V^2)` depending on encoding, and these differ only polynomially, so it does not matter. For a **number** N, the size is `Theta(log N)` bits, not N. An algorithm that loops N times on input N runs in time exponential in the input size.

That is why the `Theta(nW)` knapsack DP from file 25 does not prove `P = NP`. It is **pseudo-polynomial**: polynomial in the numeric value, exponential in the encoding length. Whenever a running time mentions a numeric input value rather than a count of objects, say the word.

**The complexity classes.**

- **P** = decision problems solvable in polynomial time by a deterministic algorithm.
- **NP** = decision problems whose YES instances have a **certificate** that can be **verified** in polynomial time.
- **NP-hard** = at least as hard as everything in NP, meaning every problem in NP reduces to it in polynomial time.
- **NP-complete** = in NP **and** NP-hard.

**NP does not stand for "not polynomial".** It stands for **nondeterministic polynomial**, and the verifier definition above is the one to use. Getting this wrong is a visible, avoidable error.

The verifier framing is the useful one. `SAT` is in NP because if I claim a formula is satisfiable, I hand you a satisfying assignment and you check it in linear time. `CLIQUE` is in NP because I hand you the k vertices and you check all pairs in `O(k^2)`. **Proving membership in NP is nearly always this easy, and it is worth one paragraph of your answer, never more.**

Note the asymmetry: NP is about YES instances only. There is no requirement that NO instances have short proofs; that is the class **co-NP**, and whether `NP = co-NP` is open.

---

## 28.2 Reductions

> **Definition.** A **polynomial-time many-one reduction** from problem A to problem B, written `A <=_p B`, is a polynomial-time computable function `f` mapping instances of A to instances of B such that
>
> ```
> x is a YES instance of A   iff   f(x) is a YES instance of B
> ```

**Read the direction carefully, because getting it backwards is the single most common failure in this unit.**

`A <=_p B` means **A is no harder than B**. It says: if I could solve B, I could solve A, by transforming and calling B's solver. So:

- To prove **B is hard**, reduce a **known hard** problem A **to** B. (`known-hard <=_p new`)
- To prove **B is easy**, reduce B **to** a known easy problem. (`new <=_p known-easy`)

The mnemonic that actually works: **you reduce the problem you know to the problem you want to learn about.** For hardness, you know 3-SAT is hard, so you convert 3-SAT instances into instances of your problem. If your problem had a fast algorithm, 3-SAT would too.

Students routinely write "I reduce my problem to 3-SAT, therefore my problem is hard." That proves the opposite of nothing: it proves your problem is *no harder than* 3-SAT, which is true of every problem in NP and says nothing.

**Reductions compose.** If `A <=_p B` and `B <=_p C`, then `A <=_p C`, because the composition of two polynomial functions is polynomial. This is what lets you use any previously-proven NP-complete problem as your starting point rather than going back to SAT every time.

---

## 28.3 Cook-Levin, and the shape of the field

> **Cook-Levin theorem.** SAT is NP-complete.

**Why it matters.** It is the bootstrap. Before it, "NP-complete" was a definition with no known members; after it, everything else follows by reduction from SAT.

**Proof idea, at the level a course expects you to reproduce.** Let A be any problem in NP, with a polynomial-time verifier V that on input `(x, certificate)` runs for at most `p(|x|)` steps. Build a boolean formula whose variables encode the entire computation table of V: one set of variables per (time step, tape cell) recording the symbol there, plus variables for the head position and state. Add clauses asserting that (a) the initial configuration encodes x correctly, (b) each step follows from the previous by V's transition function, and (c) the final configuration is accepting. The formula is satisfiable iff some certificate makes V accept, and it has size polynomial in `p(|x|)`. Hence `A <=_p SAT` for every A in NP.

You will rarely be asked to write this out. You will be asked what it says and why it is the foundation.

**3-SAT is NP-complete too**, by a reduction from SAT that rewrites long clauses using new variables:

```
(x1 OR x2 OR x3 OR x4 OR x5)
becomes
(x1 OR x2 OR y1) AND (NOT y1 OR x3 OR y2) AND (NOT y2 OR x4 OR x5)
```

Verify both directions: any satisfying assignment of the original extends to one of the new formula by setting the `y` variables appropriately, and any satisfying assignment of the new formula must satisfy at least one original literal (otherwise the chain of `y` implications forces a contradiction).

**3-SAT is the usual starting point for reductions**, because its rigid structure (exactly three literals per clause) gives you something concrete to build gadgets around.

Note that **2-SAT is in P**, solvable in linear time via the implication graph and SCCs from file 27. The jump from 2 to 3 is where tractability dies, and pointing that out is a nice touch in an answer.

---

## 28.4 The standard NP-complete problems

Know each one's statement, and know at least one reduction into and out of it.

| Problem | Statement |
|---|---|
| **SAT** | Is a boolean formula satisfiable? |
| **3-SAT** | Same, with exactly 3 literals per clause |
| **CLIQUE** | Does G contain a complete subgraph on k vertices? |
| **INDEPENDENT SET** | Does G contain k pairwise non-adjacent vertices? |
| **VERTEX COVER** | Is there a set of k vertices touching every edge? |
| **SET COVER** | Can k of the given sets cover the universe? |
| **HAMILTONIAN CYCLE** | Is there a cycle visiting every vertex exactly once? |
| **TSP** | Is there a tour of total weight at most k? |
| **SUBSET SUM** | Does some subset of the given integers sum to exactly T? |
| **PARTITION** | Can the integers be split into two equal-sum halves? |
| **KNAPSACK** | Value at least V within weight W? |
| **GRAPH COLOURING** | Can G be properly coloured with k colours? |
| **3-COLOURING** | Same, with k = 3 |
| **LONGEST PATH** | Is there a simple path of length at least k? |

The classic reduction map, and knowing the arrows is worth the memorization:

```
                        SAT
                         |
                       3-SAT
            /       |        |         \
      CLIQUE   3-COLOUR   SUBSET SUM   HAM-CYCLE
         |                    |            |
   INDEP SET             PARTITION        TSP
         |                    |
   VERTEX COVER          KNAPSACK
         |
    SET COVER
```

### The three reductions to know by heart

**3-SAT to INDEPENDENT SET.** Given a 3-CNF formula with m clauses, build a graph with one **triangle** per clause, its three vertices labelled by that clause's three literals. Add an edge between any two vertices labelled with **contradictory** literals (`x` and `NOT x`). Ask for an independent set of size m.

*Forward.* If the formula is satisfiable, pick one true literal from each clause. No two chosen vertices are in the same triangle (one per clause) and no two are contradictory (they are all true under one assignment), so they form an independent set of size m.

*Backward.* If an independent set of size m exists, it has at most one vertex per triangle, so exactly one per triangle, so exactly one literal per clause. No two are contradictory, so we can set each chosen literal to true and extend arbitrarily to a full assignment. Every clause has a true literal, so the formula is satisfied.

*Polynomial.* The graph has `3m` vertices and `O(m^2)` edges, built in polynomial time. QED

**INDEPENDENT SET to VERTEX COVER.** `S` is an independent set **iff** `V - S` is a vertex cover. So G has an independent set of size k iff it has a vertex cover of size `n - k`. The transformation is "output `(G, n-k)`", which is trivially polynomial, and the iff is one line: no edge has both endpoints in S iff every edge has at least one endpoint outside S.

**INDEPENDENT SET and CLIQUE.** `S` is independent in G **iff** `S` is a clique in the **complement** graph. Map `(G,k)` to `(complement of G, k)`.

Those three together mean CLIQUE, INDEPENDENT SET, and VERTEX COVER are all the same problem wearing different clothes, and you can move between them in one sentence each. That is often the fastest route through a problem.

---

## 28.5 How to write an NP-completeness proof

Four parts. Write the headers.

> **To prove problem X is NP-complete:**
>
> **1. Show X is in NP.** Describe the certificate and the polynomial-time verification. One paragraph.
>
> **2. Choose a known NP-complete problem Y.** Pick one whose structure resembles X. 3-SAT for logical constraints, VERTEX COVER or INDEPENDENT SET for selection-with-conflicts, HAM-CYCLE for ordering or sequencing, SUBSET SUM for numeric targets, 3-COLOUR for partition-into-classes.
>
> **3. Give a polynomial-time reduction from Y to X.** Describe the construction explicitly and argue it takes polynomial time. Note the direction: **Y to X**, hard-to-new.
>
> **4. Prove correctness, BOTH directions.**
>    - If the Y-instance is a YES, then the constructed X-instance is a YES. (Take a solution to Y, build one for X.)
>    - If the constructed X-instance is a YES, then the Y-instance is a YES. (Take a solution to X, build one for Y.)

**Part 4 is where the substance lives, and the second direction is the one people skip.** Half of a reduction proof is showing that the construction cannot be "cheated", meaning that no solution to X exists other than the ones corresponding to real solutions of Y. Skipping it leaves the proof genuinely incomplete, not merely terse.

### Worked: VERTEX COVER is NP-complete

**1. In NP.** Certificate: the set of k vertices. Verification: check `|S| = k`, then check every edge has an endpoint in S. `O(V + E)`. Polynomial.

**2. Known problem.** 3-SAT.

**3. Reduction.** Given a 3-CNF formula with n variables and m clauses, build a graph:

- **Variable gadget:** for each variable `x_i`, two vertices `x_i` and `NOT x_i` joined by an edge.
- **Clause gadget:** for each clause, a triangle on three vertices.
- **Connections:** join each clause-triangle vertex to the variable-gadget vertex for the literal it represents.
- Set `k = n + 2m`.

The graph has `2n + 3m` vertices and `n + 3m + 3m` edges, constructed in polynomial time.

**4a. Satisfiable implies a cover of size `n + 2m`.** Take a satisfying assignment. From each variable gadget, put the **true** literal's vertex in the cover: n vertices, and this covers every variable-gadget edge. Each clause has at least one true literal; in that clause's triangle, put the **other two** vertices in the cover: `2m` vertices, covering all triangle edges. Total `n + 2m`. Every connecting edge is covered: an edge from a triangle vertex is covered by that vertex unless it is the excluded one, and the excluded one corresponds to a true literal, whose variable vertex is in the cover. So all edges are covered.

**4b. A cover of size `n + 2m` implies satisfiable.** Every variable-gadget edge needs at least one endpoint, costing at least n. Every triangle needs at least two of its three vertices, costing at least `2m`. That accounts for the entire budget `n + 2m`, so the cover contains **exactly one** vertex per variable gadget and **exactly two** per triangle. Define an assignment by setting each variable so that the covered literal is true; this is consistent because exactly one of `x_i`, `NOT x_i` is chosen. For each clause, one triangle vertex is uncovered, so its connecting edge to the variable gadget must be covered from the variable side, meaning that literal's vertex is in the cover, meaning that literal is true under our assignment. So every clause is satisfied. QED

Study 4b. It is the direction where the budget accounting does all the work, and "the budget is exactly tight, therefore the structure is forced" is the standard move.

---

## 28.6 Choosing the right source problem

The main creative step. Match the *shape*.

| If X involves... | Reduce from |
|---|---|
| Logical constraints, "at least one of these" | 3-SAT |
| Choosing a subset with pairwise conflicts | INDEPENDENT SET, VERTEX COVER, CLIQUE |
| Covering everything with few things | SET COVER, VERTEX COVER |
| Numbers hitting an exact target | SUBSET SUM, PARTITION |
| Visiting everything in an order | HAMILTONIAN CYCLE or PATH, TSP |
| Partitioning into groups with conflicts | GRAPH COLOURING, 3-COLOURING |
| Scheduling with a deadline | SUBSET SUM or PARTITION |
| A path or ordering with a length target | LONGEST PATH, HAM-PATH |

**Try 3-SAT first if nothing obviously matches.** Its rigid structure makes gadget-building most flexible.

---

## 28.7 The boundary: what makes a problem tip over

Pairs of problems that look alike and sit on opposite sides. These get asked constantly, because they show that hardness is not vague difficulty but a sharp structural threshold.

| In P | NP-complete | What changed |
|---|---|---|
| 2-SAT | 3-SAT | clause width 2 to 3 |
| Shortest path | Longest simple path | min to max |
| Euler circuit (every **edge** once) | Hamiltonian cycle (every **vertex** once) | edges to vertices |
| Minimum spanning tree | Steiner tree | must span all vs a subset |
| 2-colouring (bipartiteness) | 3-colouring | 2 colours to 3 |
| Matching in **bipartite** graphs | 3-dimensional matching | 2 sides to 3 |
| Linear programming | Integer programming | fractional to integral |
| Knapsack with **unary** numbers | Knapsack with binary numbers | encoding length |
| Independent set on a **tree** | Independent set on a general graph | restricted structure |
| Max flow | Multicommodity integral flow | one commodity to many |

**Two lessons worth stating in an answer.**

First, the tractable/intractable line is often a small parameter change, not a matter of degree. If you are asked whether a variant is hard, look for which side of one of these lines it sits on.

Second, **restricting the input structure can restore tractability**. Many NP-hard problems are polynomial on trees, on interval graphs, on planar graphs, or on bounded-treewidth graphs. If the problem statement says "on a tree", suspect a DP.

---

## 28.8 What to do when a problem is NP-hard

"And what would you do in practice?" is the natural follow-up. Have the four answers ready.

**1. Approximation algorithms.** Accept a solution within a provable factor of optimal.

> **2-approximation for vertex cover.** Repeatedly pick any uncovered edge and add **both** endpoints to the cover.
>
> *Proof.* The chosen edges form a matching, since once an edge is picked both its endpoints are covered and no later edge can share one. Any vertex cover must include at least one endpoint of each matched edge, so `|OPT| >= (number of matched edges) = |C|/2`, giving `|C| <= 2|OPT|`. QED

That proof is three lines and is worth having memorized. Other landmarks: greedy set cover is a `ln n` approximation and that is optimal unless P = NP; metric TSP has a 2-approximation from an MST and a 3/2-approximation from Christofides; general TSP has **no** constant-factor approximation unless P = NP (proved by a reduction from Hamiltonian cycle that makes non-tour edges enormous).

**2. Exact exponential algorithms with better constants.** `O(2^n * n^2)` DP over subsets for TSP (Held-Karp) beats `O(n!)` brute force enormously and is exact. Branch and bound with good pruning solves large real instances.

**3. Fixed-parameter tractability.** Vertex cover is solvable in `O(2^k * n)`, which is fast when the cover is small even if the graph is large. The parameter, not the input size, carries the exponent.

**4. Heuristics.** Local search, simulated annealing, SAT solvers. No guarantee, often excellent in practice. Modern SAT solvers routinely dispatch instances with millions of variables, which is worth remembering before declaring anything hopeless.

---

## 28.9 Undecidability, in one page

Beyond NP-hard there is "no algorithm exists at all", which is worth a short detour.

> **Halting problem.** Given a program P and input x, does P halt on x? **Undecidable.**

*Proof.* Suppose `H(P, x)` decides it. Build

```
D(P):
   if H(P, P) says "halts": loop forever
   else: halt
```

Now ask what `D(D)` does. If `D(D)` halts, then `H(D,D)` said "halts", so D loops, contradiction. If `D(D)` loops, then `H(D,D)` said "does not halt", so D halts, contradiction. Therefore no such H exists. QED

The self-reference is the whole trick, and it is the same diagonalization Cantor used for the uncountability of the reals and Godel used for incompleteness.

**Rice's theorem** generalizes: **every** non-trivial semantic property of programs is undecidable. "Does this program ever output 7?", "Are these two programs equivalent?", "Does this program have a bug of type T?" All undecidable. Which is why static analysers are necessarily either incomplete or unsound, a fact worth carrying well beyond this material.

**Keep the hierarchy straight**, because the standard questions test whether you conflate the levels:

```
P  subset of  NP  subset of  PSPACE  subset of  EXPTIME  subset of  ...  subset of  DECIDABLE  subset of  ALL PROBLEMS

known:    P != EXPTIME   (by the time hierarchy theorem)
open:     P vs NP, NP vs PSPACE
```

"NP-complete" means **hard but solvable**. "Undecidable" means **not solvable at any cost**. They are not the same and calling TSP undecidable is a serious error.

---

## 28.10 Lower bounds beyond NP

Two techniques from earlier in the course belong to the same family, and this is a good place to consolidate them.

**Decision tree / information-theoretic bounds** (file 24). Count the outputs the algorithm must distinguish, note that a tree of branching factor b and height h has at most `b^h` leaves, conclude `h >= log_b (outputs)`. Gave `Omega(n log n)` for comparison sorting and `Omega(log n)` for searching a sorted array.

**Adversary arguments.** Instead of counting, imagine an adversary answering the algorithm's queries, choosing answers to keep as many inputs consistent as possible for as long as possible. If the adversary can survive `k` queries while two different answers remain possible, the algorithm needs more than `k` queries.

> **Example.** Finding both the maximum and the minimum of n elements requires at least `ceil(3n/2) - 2` comparisons.
>
> *Idea.* Classify each element as never-compared, only-won, only-lost, or both. The adversary answers so that progress is slow: to finish, `n-1` elements must have lost at least once and `n-1` must have won at least once. A comparison between two never-compared elements gains 2 units of progress; every other comparison gains at most 1. There are `floor(n/2)` comparisons of the first kind available, so the total is at least `3n/2 - 2`.

Both techniques prove bounds **within a model**. The comparison-sort bound says nothing about radix sort, and that is a feature: naming the model is what makes the bound meaningful. **Always state the model.**

The reason NP-completeness exists as a separate theory is that we have no technique powerful enough to prove unconditional lower bounds for general computation. `P != NP` remains open precisely because decision trees and adversary arguments do not reach that far. NP-completeness is the workaround: instead of proving X is hard, prove X is **as hard as thousands of problems that thousands of people have failed to solve efficiently.** That is not a proof of hardness, and it is honest to say so, but it is overwhelming evidence.

---

## 28.11 Checklist for this unit

```
Asked to prove X is NP-complete?
  1. X in NP: certificate + polynomial verifier.  (one paragraph)
  2. Pick Y: match the SHAPE of X to the table in 28.6.
  3. Reduce Y -> X.  Direction: known-hard to new.  Say it out loud.
  4. Prove BOTH directions of the iff.  The second one is where the substance is.
  5. Note the construction is polynomial-time.

Asked whether an algorithm contradicts NP-completeness?
  - Check whether the running time mentions a numeric VALUE (pseudo-polynomial).
  - Check whether the input is restricted (trees, planar, bounded parameter).
  - Check whether the algorithm is approximate rather than exact.

Asked for a lower bound?
  - State the model first.
  - Decision tree: count the distinguishable outputs, take the log.
  - Adversary: define the adversary's strategy and a progress measure.

Never write:
  - "NP means not polynomial."               It means nondeterministic polynomial.
  - "X is NP so it is hard."                 Everything in P is also in NP.
  - "I reduce X to 3-SAT so X is hard."      Backwards. That proves nothing.
  - "NP-complete means unsolvable."          It means no known polynomial algorithm.
  - "This is undecidable" about anything in NP.
```

---

## 28.12 Practice

1. Prove that CLIQUE is NP-complete, given that INDEPENDENT SET is.
2. Prove SUBSET SUM is in NP. Then explain why the `O(nT)` DP does not put it in P.
3. Show that if any NP-complete problem is in P, then P = NP.
4. HAMILTONIAN PATH is NP-complete. Prove that LONGEST PATH is NP-complete.
5. Is `P` closed under complement? Is `NP` known to be?
6. Give a 2-approximation for metric TSP and prove the factor.
7. You have a polynomial-time algorithm for 3-COLOURING. Show how to use it to actually **produce** a 3-colouring, not just decide existence.
8. Explain the difference between "NP-hard" and "NP-complete", and give a problem that is the first but not the second.

### Answers

Do not read this until you have written your own attempt on paper.

1. **In NP:** certificate is the k vertices; verify all `C(k,2)` pairs are edges, `O(k^2)`. **Reduction:** `INDEPENDENT SET <=_p CLIQUE` by mapping `(G, k)` to `(complement of G, k)`, computable in `O(V^2)`. **Both directions:** a set S has no edges among its members in G iff every pair among its members is an edge in the complement, which is precisely "S is independent in G iff S is a clique in the complement". Hence the instances are equivalent.

2. **In NP:** the certificate is the subset; verify by summing, which is polynomial in the input length since each number has polynomially many bits. **Why the DP does not help:** it runs in `O(nT)`, and T is written in `Theta(log T)` bits, so `T = 2^(number of bits)` and the running time is exponential in the input size. It is pseudo-polynomial.

3. Let X be NP-complete and suppose X is in P. Take any A in NP. By NP-hardness of X there is a polynomial reduction `f` from A to X. To decide A on input x, compute `f(x)` (polynomial time, so `|f(x)|` is polynomially bounded) and run X's polynomial algorithm on it. The composition of two polynomials is a polynomial, so A is in P. Since A was arbitrary, `NP` is a subset of `P`, and `P` is a subset of `NP` trivially, so `P = NP`.

4. **In NP:** certificate is the path; verify it is simple, uses only real edges, and has length at least k. **Reduction from HAM-PATH:** given G on n vertices, output `(G, n-1)`, asking for a simple path with `n-1` edges. A simple path with `n-1` edges visits n distinct vertices, which is all of them, so it is a Hamiltonian path; conversely a Hamiltonian path has exactly `n-1` edges. The transformation is trivially polynomial. Both directions are immediate from that equivalence.

5. **P is closed under complement**: run the decider and flip the answer, still polynomial. Formally `P = co-P`. **NP is not known to be**: `NP = co-NP` is open. The asymmetry is real, since the definition of NP requires short certificates only for YES instances. If `NP != co-NP` then `P != NP`, so proving closure either way would settle a famous problem.

6. Build an MST T of the complete metric graph. Walk T in a DFS preorder, listing vertices, and shortcut past repeats (legal by the triangle inequality). **Factor:** the optimal tour minus one edge is a spanning tree, so `w(T) <= OPT`. The full DFS traversal uses each tree edge exactly twice, costing `2w(T) <= 2 OPT`, and shortcutting only decreases cost by the triangle inequality. So the tour costs at most `2 OPT`. Christofides improves to 3/2 by adding a minimum matching on the odd-degree vertices instead of doubling.

7. **Self-reduction.** Pick two non-adjacent vertices u, v and test whether the graph with u and v merged is still 3-colourable. If yes, merge them permanently (this commits u and v to the same colour); if no, add the edge `uv` (committing them to different colours). Either way the graph gains structure, and repeating until the graph is a complete multipartite graph on 3 parts reveals the colour classes. Each step is one call to the decider and there are `O(V^2)` steps, so the whole thing is polynomial. This "decision implies search" self-reduction works for essentially every NP-complete problem and is a standard exercise.

8. **NP-hard** means every problem in NP reduces to it; it need not be in NP, and it need not even be a decision problem. **NP-complete** means NP-hard **and** in NP. The halting problem is NP-hard (every NP problem reduces to it, since you can reduce to "does this brute-force search halt with success") but is not in NP, indeed not decidable at all, so it is NP-hard and not NP-complete. The optimization version of TSP is another example, since it is not a decision problem.


---

## 28.13 You have finished the course track

What you should now be able to do on a blank page, with nothing open:

- State the definitions of O, Omega, Theta, o, omega, and prove a bound from the definition.
- Set up a recurrence from pseudocode and solve it three ways.
- Recognize which of the five paradigms a new problem wants.
- Write a loop invariant, a strong induction, a cut-and-paste argument, an exchange argument, and a reduction, each in the correct standard form.
- Cite max-flow min-cut, the cut property, and Cook-Levin by name and use them.
- Prove a problem NP-complete in four labelled parts, both directions.

If any of those is shaky, the fix is not rereading. Go to the practice set at the end of the relevant file, cover the answers, and write full solutions in ink. That is the only activity that transfers to a blank page under time pressure.

Back to [21 — The Course Track: Orientation](21-course-track-orientation.md) for the weekly study loop, or across to [08 — Interview Craft](08-interview-craft.md) if you want the other track.
