# 25 — Dynamic Programming

Assumes [24 — Divide and Conquer](24-divide-and-conquer.md). The interview track covers DP as pattern recognition in [06 — Dynamic Programming](06-dynamic-programming.md); this file covers it as a *provable* design paradigm, which is a different and harder thing.

---

## 25.1 What DP actually is

Two conditions must hold. State them by name in every written solution; they are the first thing a reader checks for.

**1. Optimal substructure.** An optimal solution to the problem contains within it optimal solutions to subproblems. If you knew the optimal answers to the smaller instances, you could assemble the optimal answer to the big one.

**2. Overlapping subproblems.** The naive recursion revisits the same subproblem many times. The number of *distinct* subproblems is small (polynomial), even though the number of *recursive calls* is large (exponential).

If only the first holds, you have divide and conquer. If only the second holds, you probably have nothing. Both together mean: **write the recursion, then stop it from recomputing.**

Fibonacci is the minimal example. `FIB(n) = FIB(n-1) + FIB(n-2)` has optimal substructure trivially and massive overlap. Naive: `Theta(phi^n)`. Memoized: `Theta(n)`, because there are only `n` distinct subproblems and each is computed once.

### The cost formula

```
running time = (number of distinct states) x (work to compute one state from others)
```

This is the single most useful sentence in the file. Once you have defined the state space, the running time is arithmetic. If a problem has `O(n^2)` states and each takes `O(n)` work to fill, the algorithm is `O(n^3)`, and you can say that before writing any code.

Space is `(number of states)` by default, often reducible.

---

## 25.2 The recipe

Follow these five steps in order, every time, and write them as labelled sections in your answer. Skipping straight to a table is how people get stuck.

**Step 1: Define the subproblem in one English sentence.**

> `OPT[i]` = the maximum value obtainable using only items `1..i`.

This is the step people rush and it is the step that decides everything. The sentence must be precise enough that someone else could compute the value from the definition alone. If you cannot write the sentence, you do not have a DP yet, and adding more indices at random will not help. Common shapes:

- `OPT[i]` = best answer for the prefix `1..i`
- `OPT[i]` = best answer for a solution that **ends at** `i` (different from the above, and often the one that works)
- `OPT[i][j]` = best answer for the substring/subarray `i..j`
- `OPT[i][j]` = best answer using first `i` items with budget `j`
- `OPT[i][j]` = best answer aligning prefix `1..i` of X with prefix `1..j` of Y
- `OPT[v]` = best answer for the subtree rooted at vertex `v`

**Step 2: Write the recurrence, plus base cases.**

Ask: what is the **last decision** the optimal solution makes? Enumerate the possible last decisions, and for each, what subproblem remains. Take the best.

**Step 3: Prove optimal substructure**, usually by cut-and-paste. See 25.3.

**Step 4: Give the evaluation order**, so every value is computed before it is used. Either bottom-up with explicit loops, or top-down with memoization, in which case the order is handled for you.

**Step 5: State the running time and space**, using the formula above, and say how to recover the actual solution and not just its value. See 25.4.

---

## 25.3 The cut-and-paste argument

This is *the* correctness proof for DP and it always has the same shape. Learn it as a template.

> **To prove:** an optimal solution to the problem contains optimal solutions to its subproblems.
>
> **Proof.** Let S be an optimal solution to the whole problem. Suppose the piece of S restricted to subproblem P were **not** optimal for P. Then there exists a better solution S' for P. **Cut** the suboptimal piece out of S and **paste** S' in its place. The result is still feasible (argue this, it is where the real content is) and has strictly better value than S. That contradicts S being optimal. Therefore the restriction of S to P is optimal for P. QED

Worked on shortest paths:

> **Claim.** Any subpath of a shortest path is itself a shortest path.
>
> **Proof.** Let `p` be a shortest path from `u` to `v`, and decompose it as `u ->p1-> x ->p2-> y ->p3-> v`. Suppose `p2` is not a shortest path from `x` to `y`, so some `p2'` from `x` to `y` has strictly smaller weight. Then `u ->p1-> x ->p2'-> y ->p3-> v` is a path from `u` to `v` (feasibility: concatenating paths gives a walk from u to v, which contains a path of no greater weight) with weight strictly less than `p`. That contradicts `p` being shortest. QED

**The feasibility clause is not optional.** In problems with constraints, pasting in a better sub-solution can break the constraint, and if it can, the substructure property may genuinely fail. That is exactly what happens with **longest simple path**: a subpath of a longest simple path need not be a longest simple path, because pasting in a longer one can revisit a vertex and destroy simplicity. That failure is not an accident of the proof technique; longest simple path is NP-hard (file 28), and the broken substructure is the visible symptom.

**So when a proof of optimal substructure resists you, consider that the problem might be hard.** That instinct is worth a lot in the second half of the course.

---

## 25.4 Memoization vs bottom-up, and recovering the solution

**Top-down with memoization**: write the natural recursion, add a table, check it before recursing and fill it after.

```
MEMO-FIB(n)
1  if memo[n] exists: return memo[n]
2  if n <= 1: result = n
3  else: result = MEMO-FIB(n-1) + MEMO-FIB(n-2)
4  memo[n] = result
5  return result
```

**Bottom-up**: order the states so dependencies come first, then loop.

```
BOTTOM-UP-FIB(n)
1  F[0] = 0;  F[1] = 1
2  for i = 2 to n
3      F[i] = F[i-1] + F[i-2]
4  return F[n]
```

| | Top-down | Bottom-up |
|---|---|---|
| Order | figured out for you by the call stack | you must find a valid topological order |
| Computes | only the states actually reachable | every state in the table |
| Overhead | recursion, hashing | none |
| Space optimization | hard | easy (keep only the last row) |
| Risk | stack overflow at large n | wasted work on unreachable states |

Both are correct DP and both are complete answers. Use top-down when the reachable state space is much smaller than the full table, or when the dependency order is awkward. Use bottom-up when you want to compress space.

### Recovering the solution, not just the value

`OPT[n]` gives you the optimal *value*. You are almost always asked for the optimal *solution* as well. Two standard techniques:

1. **Store choices.** Alongside `OPT[i]`, record `choice[i]` = which option achieved the max. Then walk backwards from the final state following `choice`, which is `O(n)` or `O(n + m)`.
2. **Recompute by comparison.** Do not store anything extra; at the end, walk back and at each state re-derive which predecessor produced the stored value. Same time, less space.

Say which one you are using and give the backtracking loop. "Standard backtracking through the choice table recovers the solution in O(n)" is one sentence and it does the job.

---

## 25.5 The canonical problems

Know these cold. Most problems you meet are one of these with the story changed.

### Rod cutting

> A rod of length n, and a price `p[i]` for a piece of length i. Cut it to maximize revenue.

**Subproblem.** `r[j]` = maximum revenue from a rod of length `j`.

**Recurrence.** The last decision is: how long is the first piece?

```
r[0] = 0
r[j] = max over i = 1..j of ( p[i] + r[j - i] )
```

**States** `n`, **work per state** `O(n)`, so **`Theta(n^2)`**.

This is the cleanest illustration of "enumerate the last decision". Note that we do not need to consider whether the remainder is cut optimally; the recurrence asserts it, and cut-and-paste proves it.

### 0/1 Knapsack

> n items, item i has weight `w[i]` and value `v[i]`. Capacity W. Maximize value, each item used at most once.

**Subproblem.** `K[i][j]` = maximum value using only items `1..i` with capacity exactly `j` available.

**Recurrence.** The last decision is: do we take item i?

```
K[0][j] = 0  for all j
K[i][j] = K[i-1][j]                                  if w[i] > j     (cannot take it)
K[i][j] = max( K[i-1][j],  v[i] + K[i-1][j - w[i]] ) otherwise
```

**States** `n * W`, **work per state** `O(1)`, so **`Theta(nW)`**.

**The pseudo-polynomial trap, and it is the thing that always gets asked.** `Theta(nW)` looks polynomial. It is not polynomial in the **input size**. The number W is written in binary using `lg W` bits, so the input size is `Theta(n log W + n log(max v))` and the running time `nW = n * 2^(lg W)` is **exponential in the input size**. Such an algorithm is called **pseudo-polynomial**: polynomial in the *numeric value* of the input, exponential in its *encoding length*. 0/1 knapsack is NP-hard (file 28) and this algorithm does not contradict that.

**Space.** Only row `i-1` is needed, so `O(W)` suffices. If you iterate `j` **downwards** you can even use a single 1D array, because the downward order guarantees `K[j - w[i]]` still holds the `i-1` value. That direction detail is a classic bug and a classic question.

**Unbounded knapsack** (unlimited copies) changes one index: `K[i][j] = max(K[i-1][j], v[i] + K[i][j - w[i]])`, using `K[i]` rather than `K[i-1]` because the item can be reused. In the 1D version, iterate `j` **upwards**.

### Longest common subsequence

> Given `X[1..m]` and `Y[1..n]`, find the longest sequence appearing (not necessarily contiguously) in both.

**Subproblem.** `c[i][j]` = length of the LCS of `X[1..i]` and `Y[1..j]`.

**Recurrence.** The last decision concerns the final characters:

```
c[i][0] = c[0][j] = 0
c[i][j] = c[i-1][j-1] + 1                    if X[i] == Y[j]
c[i][j] = max( c[i-1][j], c[i][j-1] )        otherwise
```

**Why the first case does not also need a max.** If `X[i] == Y[j]`, there is always an LCS that uses this matched pair. *Proof sketch:* take any LCS Z of `X[1..i]` and `Y[1..j]`. If Z ends with the character `X[i]`, we can assume it is matched to position `i` in X and `j` in Y, and dropping it gives a common subsequence of `X[1..i-1]`, `Y[1..j-1]` of length `|Z| - 1`. If Z does not end with that character, appending it produces a longer common subsequence, contradicting optimality. Either way `c[i][j] = c[i-1][j-1] + 1`.

**Time** `Theta(mn)`, **space** `Theta(mn)`, reducible to `Theta(min(m,n))` if only the length is needed (but then you cannot backtrack; Hirschberg's algorithm recovers the sequence in linear space using a divide-and-conquer trick, worth mentioning if asked).

**Edit distance** is the same table with three operations instead of two:

```
d[i][j] = min( d[i-1][j] + 1,          # delete X[i]
               d[i][j-1] + 1,          # insert Y[j]
               d[i-1][j-1] + cost )    # substitute, cost 0 if X[i]==Y[j] else 1
```

### Matrix chain multiplication

> Multiply matrices `A1 A2 ... An` where `Ai` is `p[i-1] x p[i]`. Parenthesize to minimize scalar multiplications.

**Subproblem.** `m[i][j]` = minimum cost to compute `Ai ... Aj`.

**Recurrence.** The last decision is: where is the **outermost** split?

```
m[i][i] = 0
m[i][j] = min over k = i..j-1 of ( m[i][k] + m[k+1][j] + p[i-1]*p[k]*p[j] )
```

**States** `Theta(n^2)`, **work per state** `Theta(n)`, so **`Theta(n^3)`**.

**Evaluation order matters here** and is a common source of lost points. You cannot loop `i` then `j` naively, because `m[i][j]` depends on shorter intervals. Loop over **interval length** first:

```
for len = 2 to n
    for i = 1 to n - len + 1
        j = i + len - 1
        compute m[i][j]
```

This "loop by interval length" is the standard order for every interval DP, and there are many: optimal BST, palindrome partitioning, burst balloons, polygon triangulation.

Also note: the number of parenthesizations is the Catalan number, roughly `4^n / n^1.5`, so brute force is hopeless and this `n^3` is a spectacular win.

### Weighted interval scheduling

> n jobs, job i has start `s[i]`, finish `f[i]`, weight `v[i]`. Choose non-overlapping jobs maximizing total weight.

Note that the **unweighted** version is solved greedily (file 26). Adding weights breaks the greedy, which makes this the best problem in the course for illustrating the boundary.

**Setup.** Sort jobs by finish time. Define `p(i)` = the largest index `j < i` with `f[j] <= s[i]`, that is the last job that does not conflict with i. Computing all `p(i)` takes `O(n log n)` by binary search.

**Subproblem.** `OPT[i]` = maximum weight using only jobs `1..i` (in finish-time order).

**Recurrence.** The last decision is: is job i in the solution?

```
OPT[0] = 0
OPT[i] = max( OPT[i-1],  v[i] + OPT[p(i)] )
```

**Time** `Theta(n log n)` dominated by the sort. **States** n, **work per state** O(1).

**Why greedy fails here:** taking the job with the earliest finish time can forgo a single very valuable long job. The exchange argument of file 26 breaks precisely because swapping in the greedy choice can lower the total weight.

### Longest increasing subsequence

**Subproblem.** `L[i]` = length of the longest increasing subsequence **ending at** index i. (Note the "ending at" form; the prefix form does not give a usable recurrence here.)

```
L[i] = 1 + max( L[j] : j < i and A[j] < A[i] ),  or 1 if no such j
answer = max over i of L[i]
```

`Theta(n^2)`. There is an `O(n log n)` version using patience sorting and binary search over a "tails" array, worth knowing and worth deriving if asked.

### Subset sum and its relatives

> Given n positive integers and a target T, is there a subset summing to exactly T?

`S[i][t]` = true if some subset of the first i items sums to t.

```
S[i][t] = S[i-1][t]  OR  S[i-1][t - a[i]]
```

`Theta(nT)`, pseudo-polynomial, same caveat as knapsack. Partition (split into two equal-sum halves) reduces to subset sum with `T = total/2`. Coin change (minimum coins for amount A) is the same table with min instead of OR.

### DP on trees

`OPT[v]` = best answer for the subtree rooted at `v`, often with a second index for "is `v` itself used".

> **Maximum weight independent set on a tree.** Pick a set of vertices with no two adjacent, maximizing total weight.

```
IN[v]  = w[v] + sum over children c of OUT[c]
OUT[v] = sum over children c of max(IN[c], OUT[c])
answer = max(IN[root], OUT[root])
```

`Theta(n)`, since each vertex is processed once. Note that this problem is **NP-hard on general graphs** and easy on trees. That contrast (hard in general, polynomial on a restricted structure) recurs constantly and is worth flagging in answers.

### DP on a DAG

Any DP is secretly a shortest/longest path problem on a DAG whose vertices are states and whose edges are transitions. Conversely, **longest path in a DAG is solvable in `O(V + E)`** by processing vertices in topological order, while longest path in a general graph is NP-hard. The acyclicity is exactly what makes the DP well founded, and "is my state graph acyclic?" is the right way to check that your recurrence terminates.

---

## 25.6 Writing the answer, worked end to end

Full-credit form for weighted interval scheduling.

**Subproblem definition.** Sort the jobs so that `f[1] <= f[2] <= ... <= f[n]`. Let `p(i)` be the largest index `j < i` such that `f[j] <= s[i]`, and `p(i) = 0` if no such job exists. Define `OPT[i]` to be the maximum total weight of a set of mutually compatible jobs chosen from `{1, ..., i}`.

**Recurrence.**

```
OPT[0] = 0
OPT[i] = max( OPT[i-1],  v[i] + OPT[p(i)] )   for i >= 1
```

**Optimal substructure.** Consider an optimal solution S for `{1..i}`. Exactly one of two cases holds.

*Case A: job i is not in S.* Then S is a set of compatible jobs drawn from `{1..i-1}`, so `weight(S) <= OPT[i-1]`.

*Case B: job i is in S.* Every other job `j` in S has `f[j] <= s[i]`, because S is compatible and jobs are sorted by finish time, so `j <= p(i)`. Hence `S - {i}` is a compatible set drawn from `{1..p(i)}`, giving `weight(S) <= v[i] + OPT[p(i)]`.

In both cases `weight(S)` is at most the right-hand side of the recurrence. Conversely both options on the right-hand side are achievable: `OPT[i-1]` is a valid compatible set within `{1..i}`, and any optimal set for `{1..p(i)}` plus job i is compatible by definition of `p(i)`. Therefore equality holds. (This is the cut-and-paste argument: if the sub-solution used in case B were not optimal for `{1..p(i)}`, replacing it with an optimal one would keep compatibility, by definition of `p`, and strictly increase the weight, contradicting optimality of S.)

**Algorithm.**

```
WEIGHTED-INTERVAL-SCHEDULE(s, f, v, n)
1  sort jobs by finish time
2  compute p(i) for all i by binary search on the finish times
3  OPT[0] = 0
4  for i = 1 to n
5      if v[i] + OPT[p(i)] > OPT[i-1]
6          OPT[i] = v[i] + OPT[p(i)];  take[i] = TRUE
7      else
8          OPT[i] = OPT[i-1];          take[i] = FALSE
9  return OPT[n]

RECOVER(i)
1  if i == 0: return {}
2  if take[i]: return {i} + RECOVER(p(i))
3  else: return RECOVER(i-1)
```

**Correctness.** By induction on i. `OPT[0] = 0` is correct since no jobs are available. For `i >= 1`, assume `OPT[j]` is correct for all `j < i`. By the optimal substructure argument above, the maximum weight over `{1..i}` equals `max(OPT[i-1], v[i] + OPT[p(i)])`, and both terms are correct by the hypothesis since `i-1 < i` and `p(i) < i`. Line 5 computes exactly that. QED

`RECOVER` returns a set achieving `OPT[n]`: an easy induction using the fact that `take[i]` records which branch achieved the max.

**Running time.** Sorting is `O(n log n)`. Computing all `p(i)` is `n` binary searches, `O(n log n)`. The main loop is `n` iterations of `O(1)` work, so `O(n)`. Recovery is `O(n)`. **Total `Theta(n log n)`**, space `Theta(n)`.

That is the shape. Definition, recurrence, substructure proof, pseudocode, induction, time. Six blocks.

---

## 25.7 Where DP goes wrong

**Defining the state too weakly.** If the recurrence needs information the state does not carry, you will find yourself unable to write it. Fix: add an index. "Longest increasing subsequence" needs "ending at i" rather than "within the prefix" precisely because the prefix form loses the last value.

**Defining the state too richly.** If your state includes a whole set, you have `2^n` states and no algorithm. Bitmask DP (`O(2^n * n)` for travelling salesman) is sometimes exactly right, but only when n is around 20. Say so explicitly if you use it.

**A cyclic dependency.** If `OPT[i]` depends on `OPT[i]`, directly or through a cycle, the recurrence is not well founded and no evaluation order exists. This is the same condition as "the state graph must be a DAG". Shortest paths with negative *cycles* is the standard example of the failure; Bellman-Ford fixes it by adding a second index (number of edges used) that strictly increases, breaking the cycle.

**Forgetting base cases.** State them all, including the degenerate ones (`i = 0`, empty string, capacity 0). Half of DP bugs live there.

**Claiming polynomial when it is pseudo-polynomial.** If a bound involves a numeric value from the input rather than the number of items, say the word pseudo-polynomial. It is the distinction a careful reader is specifically watching for.

**Confusing "greedy works" with "DP is unnecessary".** If greedy works, prove it (file 26). If you cannot prove it, use DP and say why greedy fails, ideally with a counterexample. A counterexample to a greedy is worth including even in a DP answer, because it justifies the more expensive approach.

---

## 25.8 Practice

1. Give a DP for the maximum sum of a contiguous subarray, in the five-step form. Compare to the `Theta(n)` scan in file 21.
2. Given a string, find the longest palindromic subsequence. State, recurrence, order, time.
3. You have coins of denominations `d[1..k]` and want to make change for amount A with the fewest coins. Give the DP. Why does the greedy "take the largest coin that fits" fail in general, and for which denomination sets does it work?
4. Modify the LCS recurrence to compute the **shortest common supersequence** length.
5. Prove that the naive recursion for LCS makes `Omega(2^min(m,n))` calls without memoization.
6. Given a set of n positive integers, decide whether it can be split into two subsets of equal sum. Time? Is it polynomial?
7. Explain in two sentences why "longest simple path" has no DP over vertices, in terms of optimal substructure.
8. A DP has states `(i, j, k)` with `i, j in [1..n]` and `k in [1..log n]`, and each state takes `O(n)` work. Total running time?

### Answers

Do not read this until you have written your own attempt on paper.

1. State: `E[i]` = max sum of a subarray **ending at** i. Recurrence: `E[i] = max(A[i], E[i-1] + A[i])`, base `E[0] = -INF` or handle `i=1` directly, answer `max_i E[i]`. Substructure: an optimal subarray ending at i either is `A[i]` alone or extends an optimal subarray ending at `i-1`; if the extended part were not optimal, replacing it increases the sum, contradiction. States n, work O(1), `Theta(n)`. It is the same algorithm as the file 21 scan; the scan is just the space-optimized version keeping one variable instead of a table.

2. `L[i][j]` = longest palindromic subsequence of `S[i..j]`. `L[i][i] = 1`; if `S[i] == S[j]` then `L[i][j] = L[i+1][j-1] + 2` else `max(L[i+1][j], L[i][j-1])`. Loop by increasing interval length. `Theta(n^2)` states and time. Equivalently, it is LCS of S with its reverse.

3. `C[a]` = fewest coins for amount a. `C[0] = 0`, `C[a] = 1 + min over i with d[i] <= a of C[a - d[i]]`. `Theta(kA)`, pseudo-polynomial. Greedy fails for denominations `{1, 3, 4}` and `A = 6`: greedy takes `4 + 1 + 1 = 3` coins, optimal is `3 + 3 = 2`. Greedy is provably correct for **canonical** systems, which include the US and Euro coin sets; proving a given system canonical is itself non-trivial.

4. `SCS(m, n) = m + n - LCS(m, n)`. Directly: `s[i][j] = s[i-1][j-1] + 1` if the characters match, else `1 + min(s[i-1][j], s[i][j-1])`, with `s[i][0] = i` and `s[0][j] = j`.

5. In the worst case, when no characters match, every call `LCS(i, j)` spawns `LCS(i-1, j)` and `LCS(i, j-1)`. The call tree is then a binary tree whose depth along any root-to-leaf path is `i + j` decrements, and the number of leaves is the number of monotone lattice paths from `(m,n)` to the boundary, which is `C(m+n, m) = Omega(2^min(m,n))`.

6. Compute `T = total sum`. If T is odd, no. Otherwise run subset sum with target `T/2`, giving `Theta(nT)`. It is **pseudo-polynomial**, not polynomial: T can be exponential in the input length. Partition is NP-complete.

7. Optimal substructure fails because the subpaths of a longest simple path are not necessarily longest simple paths: the cut-and-paste step can paste in a longer subpath that revisits a vertex already used elsewhere in the solution, breaking simplicity. Feasibility is not preserved, so the argument collapses, and correspondingly the problem is NP-hard.

8. `n * n * log n` states, `O(n)` work each, so `O(n^3 log n)`.


---

Next: [26 — Greedy](26-greedy.md).
