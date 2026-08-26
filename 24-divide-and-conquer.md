# 24 — Divide and Conquer

The first real design paradigm. Assumes [23 — Recurrences](23-recurrences.md), because every analysis in this file is a recurrence you now know how to solve.

---

## 24.1 The pattern

Three steps, always:

1. **Divide** the problem into subproblems that are smaller instances of the *same* problem.
2. **Conquer** the subproblems by recursing. When they are small enough, solve directly.
3. **Combine** the subproblem answers into an answer for the original.

The recurrence writes itself: `T(n) = (number of subproblems) * T(size of each) + (cost of divide + combine)`.

**The design lever is almost always the combine step.** Everyone can split an array in half. What distinguishes a good divide-and-conquer algorithm is noticing that the combine can be done in linear time, or that clever algebra reduces the number of subproblems. Mergesort is "the combine is a linear merge". Karatsuba is "algebra turns 4 subproblems into 3". Closest pair is "the combine only has to look at a thin strip".

### Correctness is always strong induction

Template you will use for every algorithm in this file:

```
Claim: D-AND-C(X) returns the correct answer for every input X of size n >= n0.

Base case: for |X| <= (threshold), the algorithm solves directly; verify it.

Induction hypothesis: assume D-AND-C is correct on every input of size < n.

Step: on input of size n, the algorithm forms subproblems of size < n. By the
      hypothesis, the recursive calls return correct answers for those. Then show
      the combine step turns correct sub-answers into a correct answer for X.

Therefore correct for all n, by strong induction on n.  QED
```

Note **strong** induction: the subproblems are of size `n/2`, not `n-1`, so ordinary induction on `n-1` gives you nothing. Every divide-and-conquer correctness proof in this track is strong induction, and writing "by induction on n" without the word strong is a small but real loss of points.

The step almost always reduces to proving **one lemma about the combine**. Isolate that lemma, prove it, and cite it. That is what a clean proof looks like.

---

## 24.2 Mergesort

The reference example.

```
MERGE-SORT(A, p, r)
1  if p < r
2      q = floor((p + r) / 2)
3      MERGE-SORT(A, p, q)
4      MERGE-SORT(A, q+1, r)
5      MERGE(A, p, q, r)

MERGE(A, p, q, r)
1  n1 = q - p + 1;  n2 = r - q
2  copy A[p..q]   into L[1..n1+1],  set L[n1+1] = INF
3  copy A[q+1..r] into R[1..n2+1],  set R[n2+1] = INF
4  i = 1;  j = 1
5  for k = p to r
6      if L[i] <= R[j]
7          A[k] = L[i];  i = i + 1
8      else
9          A[k] = R[j];  j = j + 1
```

The sentinel `INF` at the end of each half is a small trick that removes the "one array ran out" special case, so the loop has no boundary tests. Worth copying.

**Combine lemma.** `MERGE` turns two sorted subarrays into one sorted subarray containing exactly their union, in `Theta(n1 + n2)` time.

*Proof.* Loop invariant: at the start of each iteration of the loop on line 5, `A[p..k-1]` contains the `k - p` smallest elements of `L[1..n1+1]` and `R[1..n2+1]` in sorted order, and `L[i]` and `R[j]` are the smallest elements of their arrays not yet copied.

*Initialization.* `k = p`, so `A[p..p-1]` is empty and holds the 0 smallest elements. `i = j = 1` so `L[1]` and `R[1]` are indeed the smallest uncopied elements. Holds.

*Maintenance.* Suppose `L[i] <= R[j]`. Then `L[i]` is the smallest element not yet copied, since it is the smallest remaining in L and no larger than the smallest remaining in R. Copying it to `A[k]` keeps `A[p..k]` sorted and makes it the `k - p + 1` smallest. Incrementing `i` restores the second half of the invariant. The `else` branch is symmetric, with `R[j]` strictly smaller. Holds.

*Termination.* `k = r + 1`, so `A[p..r]` contains the `r - p + 1` smallest elements in sorted order, which is all of them. The sentinels guarantee neither `i` nor `j` runs past the end, because a sentinel is never the strictly smaller element while a real element remains. QED

**Running time.** `T(n) = 2T(n/2) + Theta(n)`, master theorem case 2, **`Theta(n log n)`** in all cases: best, worst, and average are identical, which is a real advantage over quicksort.

**Space.** `Theta(n)` auxiliary for the temporary arrays. Mergesort is not in-place, and that is its real cost. (In-place merging exists but is complicated and slow in practice.)

**Stability.** The `<=` on line 6 is not cosmetic. It makes ties resolve in favour of the left half, which preserves the original relative order of equal elements. Change it to `<` and mergesort stops being stable, which is exactly what gets asked about.

---

## 24.3 Counting inversions

The first problem where divide and conquer is not obvious, and a classic exercise.

> **Problem.** Given `A[1..n]`, count the pairs `(i, j)` with `i < j` and `A[i] > A[j]`.

Brute force is `Theta(n^2)`. The insight: **inversions decompose exactly along a split.** Every inversion is either entirely in the left half, entirely in the right half, or **crossing**, with `i` in the left and `j` in the right. So:

```
inversions(A) = inversions(left) + inversions(right) + crossing(left, right)
```

The recursive parts are free. All the work is counting crossings, and if the two halves are already **sorted**, crossings can be counted during a merge.

```
SORT-AND-COUNT(A, p, r)
1  if p >= r
2      return 0
3  q = floor((p+r)/2)
4  left  = SORT-AND-COUNT(A, p, q)
5  right = SORT-AND-COUNT(A, q+1, r)
6  cross = MERGE-AND-COUNT(A, p, q, r)
7  return left + right + cross
```

`MERGE-AND-COUNT` is `MERGE` with one added line: **when an element from the right half is copied, add `(number of elements remaining in the left half)` to the count.**

**Why that line is correct.** At the moment `R[j]` is copied, every element still in `L[i..n1]` is greater than `R[j]` (otherwise it would have been copied first) and every one of them originally sat at an index left of `R[j]`'s. So each forms a crossing inversion with `R[j]`, and there are exactly `n1 - i + 1` of them. Conversely every crossing inversion `(i, j)` is counted exactly once, at the moment `A[j]` is copied. Therefore the count is exact.

**Time.** Same recurrence as mergesort, **`Theta(n log n)`**.

The transferable idea: **make the recursion return more than the answer.** Here it returns a count *and* leaves the array sorted, and the sorting is what makes the combine cheap. Asking "what extra information would make my combine step fast?" is the main creative move in this paradigm.

---

## 24.4 Quicksort and the cost of a bad split

```
QUICKSORT(A, p, r)
1  if p < r
2      q = PARTITION(A, p, r)
3      QUICKSORT(A, p, q-1)
4      QUICKSORT(A, q+1, r)

PARTITION(A, p, r)
1  x = A[r]                      # the pivot
2  i = p - 1
3  for j = p to r-1
4      if A[j] <= x
5          i = i + 1
6          exchange A[i] with A[j]
7  exchange A[i+1] with A[r]
8  return i + 1
```

**Partition invariant.** At the start of each iteration of line 3, for any index `k`: if `p <= k <= i` then `A[k] <= x`; if `i+1 <= k <= j-1` then `A[k] > x`; if `k = r` then `A[k] = x`. Initialization, maintenance, and termination follow the same drill as `MERGE`, and this is a standard exercise, so be able to write it.

Partition is `Theta(n)` and **in place**, which is quicksort's whole advantage.

**Best case:** the pivot lands in the middle, `T(n) = 2T(n/2) + Theta(n) = Theta(n log n)`.

**Worst case:** the pivot is always the minimum or maximum, so one side is empty:

```
T(n) = T(n-1) + T(0) + Theta(n) = T(n-1) + Theta(n) = Theta(n^2)
```

This happens on **already-sorted input** with the last-element pivot, which is exactly the input people test with, and is why naive quicksort has an embarrassing reputation.

**The 99-to-1 split is fine.** `T(n) = T(n/100) + T(99n/100) + Theta(n)` is `Theta(n log n)` by the tree argument in 23.8: every level costs `n`, the shallowest path has depth `log_100 n` and the deepest has depth `log_{100/99} n`, and both are `Theta(log n)`. **Any constant-fraction split gives `n log n`.** Quicksort is only bad when the split fraction is not constant, and random pivots make that vanishingly unlikely.

**Randomized quicksort.** Replace line 1 of `PARTITION` with "exchange `A[r]` with `A[random(p, r)]`" first. The expected running time is then `Theta(n log n)` on **every** input, because the randomness lives in the algorithm rather than in an assumption about the data. That is a strictly stronger guarantee than "average case over random inputs", and saying so precisely is worth the extra clause.

*Sketch of the expected-time proof.* Let `z_1 < z_2 < ... < z_n` be the sorted elements and let `X_ij` indicate whether `z_i` and `z_j` are ever compared. They are compared iff the first pivot chosen from the range `{z_i, ..., z_j}` is `z_i` or `z_j`, which has probability `2/(j - i + 1)`. Total expected comparisons:

```
sum_{i<j} 2/(j-i+1)  =  sum_{i=1}^{n} sum_{k=1}^{n-i} 2/(k+1)  <  sum_{i=1}^{n} 2 H_n  =  O(n log n)
```

That harmonic sum appearing again is not a coincidence; it is the signature of "random splits".

---

## 24.5 Selection: the k-th smallest in linear time

> **Problem.** Given an unsorted array and an integer k, return the k-th smallest element.

Sorting gives `O(n log n)`. We can do better.

### Quickselect (randomized, expected linear)

```
RANDOMIZED-SELECT(A, p, r, k)
1  if p == r
2      return A[p]
3  q = RANDOMIZED-PARTITION(A, p, r)
4  i = q - p + 1                     # rank of the pivot within A[p..r]
5  if k == i
6      return A[q]
7  elseif k < i
8      return RANDOMIZED-SELECT(A, p, q-1, k)
9  else
10     return RANDOMIZED-SELECT(A, q+1, r, k - i)
```

The difference from quicksort is that we recurse into **one** side, not both. With a good split, `T(n) = T(n/2) + Theta(n)`, which by master theorem case 3 is **`Theta(n)`**, not `n log n`. The geometric series `n + n/2 + n/4 + ...` sums to `2n`.

Expected time `Theta(n)`, worst case `Theta(n^2)`.

### Median of medians (deterministic linear)

The famous BFPRT algorithm. It is the hard one, because the analysis is a recurrence with two different fractions.

```
SELECT(A, k)
1  divide A into ceil(n/5) groups of 5 elements (last group may be smaller)
2  find the median of each group by sorting it (5 elements: O(1) each)
3  x = SELECT(medians, ceil(n/10))          # recursively find the median of medians
4  partition A around x, let i be x's rank
5  if k == i:  return x
   elseif k < i: recurse on the low side
   else:         recurse on the high side with k - i
```

**Why the pivot is good.** Consider the `ceil(n/5)` group medians. At least half of them are `>= x`, that is at least `n/10` of them. Each such median has 2 elements in its own group that are `>= it`, hence `>= x`. So at least `3n/10` elements are `>= x`. Symmetrically at least `3n/10` are `<= x`. Therefore **each recursive side has at most `7n/10` elements.**

(The careful version of the count is `3(ceil(n/5)/2 - 2) >= 3n/10 - 6`, where the `-2` discards the group containing x and the possibly-short last group. The `-6` is a lower-order term and does not change the answer.)

**Recurrence:**

```
T(n) = T(n/5) + T(7n/10) + Theta(n)
```

Master theorem does not apply (unequal splits). But `1/5 + 7/10 = 9/10 < 1`, so by the rule in 23.8 the level costs form a decreasing geometric series with ratio 9/10, the root dominates, and **`T(n) = Theta(n)`**.

Prove it by substitution to be safe: claim `T(n) <= cn`. Then `T(n) <= c(n/5) + c(7n/10) + an = (9c/10)n + an <= cn` provided `c/10 >= a`, that is `c >= 10a`. Works.

**Why groups of 5?** Groups of 3 give `T(n/3) + T(2n/3) + Theta(n)`, and `1/3 + 2/3 = 1`, giving `Theta(n log n)`, which defeats the purpose. Groups of 7 also work (`1/7 + 5/7 = 6/7 < 1`). Five is the smallest odd group size that makes the fractions sum below 1. **This is the question that always gets asked, and the answer is "the fractions must sum to less than 1".**

In practice the constant factor is bad enough that randomized quickselect is what people actually use. Median of medians matters because it proves linear-time selection is *possible*, which is then used as a subroutine in worst-case-linear algorithms elsewhere.

---

## 24.6 The sorting lower bound

Now the other side of the world: proving that no algorithm can do better. This is the first `Omega` result in the course and the template for every lower bound after it.

> **Theorem.** Any **comparison-based** sorting algorithm requires `Omega(n log n)` comparisons in the worst case.

**The decision tree model.** A comparison sort's behaviour on inputs of size n can be drawn as a binary tree. Each internal node is a comparison `a_i : a_j`, the two children are the two outcomes, and each leaf is a permutation the algorithm outputs. Running the algorithm is walking a root-to-leaf path, and the number of comparisons is the depth of that leaf. The **worst-case** number of comparisons is the **height** of the tree.

**The counting argument.**

1. To sort correctly, the algorithm must be able to output any of the `n!` possible permutations, so the tree has **at least `n!` leaves**.
2. A binary tree of height `h` has at most `2^h` leaves.
3. Therefore `2^h >= n!`, so `h >= lg(n!)`.
4. And `lg(n!) = Theta(n lg n)` (proved in the file 22 practice set).

Therefore `h = Omega(n log n)`. QED

Read step 1 carefully, because it is where the argument actually lives. If two distinct permutations shared a leaf, the algorithm would produce the same output for two inputs needing different outputs, so it would be wrong on one of them.

**What the theorem does and does not say.** It bounds **comparison-based** sorting. Counting sort, radix sort, and bucket sort run in `O(n)` or `O(n + k)` and do not contradict it, because they do not compare elements to each other; they use the values as array indices. Any question of the form "algorithm X sorts in linear time, contradiction?" is answered by "X is not comparison-based, so the bound does not apply."

**The transferable technique.** Every information-theoretic lower bound has this shape:

```
1. Model the algorithm as a decision tree over its allowed primitive operations.
2. Count the number of distinct outputs the algorithm must be able to produce.
3. A tree of branching factor k and height h has at most k^h leaves.
4. So h >= log_k (number of outputs).
```

Applied to searching a sorted array with 3-way comparisons: n possible answers, branching 2, so `h >= lg n`, which proves binary search is optimal. Applied in file 28 to much larger effect.

---

## 24.7 Karatsuba: multiplying big integers

Two n-digit numbers. Grade-school multiplication is `Theta(n^2)`.

Split each into halves: `x = a * 10^(n/2) + b` and `y = c * 10^(n/2) + d`. Then

```
xy = ac * 10^n + (ad + bc) * 10^(n/2) + bd
```

Four multiplications of half-size numbers plus linear additions and shifts:

```
T(n) = 4 T(n/2) + Theta(n)
```

`log_2 4 = 2`, `W = n^2`, `f = n`, case 1, giving `Theta(n^2)`. **No improvement.** Splitting alone buys nothing.

**Karatsuba's trick is algebra, not recursion.** Note that

```
(a + b)(c + d) = ac + ad + bc + bd
```

so `ad + bc = (a+b)(c+d) - ac - bd`. We already need `ac` and `bd`. So compute three products:

```
P1 = ac
P2 = bd
P3 = (a+b)(c+d)
xy = P1 * 10^n + (P3 - P1 - P2) * 10^(n/2) + P2
```

Three recursive multiplications instead of four:

```
T(n) = 3 T(n/2) + Theta(n)
```

`log_2 3 ~ 1.585`, `W = n^1.585`, `f = n`, case 1: **`Theta(n^1.585)`**.

The lesson, and it is the deepest lesson of the paradigm: **reducing `a` by one changes the exponent, while reducing `f(n)` often changes nothing.** In case 1, `f` is irrelevant to the answer. All the leverage is in the number of subproblems. Look for algebraic identities that trade a multiplication for several additions.

---

## 24.8 Strassen: matrix multiplication

Multiplying two `n x n` matrices. The definition gives `Theta(n^3)`:

```
SQUARE-MATRIX-MULTIPLY(A, B)
1  n = A.rows
2  let C be a new n x n matrix
3  for i = 1 to n
4      for j = 1 to n
5          c_ij = 0
6          for k = 1 to n
7              c_ij = c_ij + a_ik * b_kj
8  return C
```

Three nested loops, `Theta(n^3)`.

**Block divide and conquer.** Split each matrix into four `n/2 x n/2` blocks. Then

```
C11 = A11 B11 + A12 B21
C12 = A11 B12 + A12 B22
C21 = A21 B11 + A22 B21
C22 = A21 B12 + A22 B22
```

Eight recursive multiplications of half-size matrices plus `Theta(n^2)` additions:

```
T(n) = 8 T(n/2) + Theta(n^2)
```

`log_2 8 = 3`, case 1, **`Theta(n^3)`**. Again no improvement, again because `a` did not change.

**Strassen's insight**: seven products suffice. Define

```
S1 = B12 - B22        P1 = A11 * S1
S2 = A11 + A12        P2 = S2 * B22
S3 = A21 + A22        P3 = S3 * B11
S4 = B21 - B11        P4 = A22 * S4
S5 = A11 + A22        P5 = S5 * (B11 + B22)
S6 = A12 - A22        P6 = S6 * (B21 + B22)
S7 = A11 - A21        P7 = S7 * (B11 + B12)
```

Then

```
C11 = P5 + P4 - P2 + P6
C12 = P1 + P2
C21 = P3 + P4
C22 = P5 + P1 - P3 - P7
```

Verifying these identities is pure algebra and is worth doing once; the point here is the recurrence:

```
T(n) = 7 T(n/2) + Theta(n^2)
```

`log_2 7 ~ 2.807`, `W = n^2.807`, `f = n^2`, case 1: **`Theta(n^lg 7) = Theta(n^2.807)`**.

**Know these numbers:** naive is `n^3`, block-recursive is still `n^3`, Strassen is `n^2.807`. Faster algorithms exist (Coppersmith-Winograd and successors, currently around `n^2.371`) but are galactic, meaning the constants make them useless in practice. The lower bound is `Omega(n^2)` trivially, since you must read the input, and closing the gap between `2` and `2.371` is a famous open problem.

**Practical caveats** worth one sentence: Strassen has a large constant, is numerically less stable than the naive method, and needs extra memory, so implementations switch to naive multiplication below a crossover size of roughly 32 to 128.

---

## 24.9 Closest pair of points

> **Problem.** Given n points in the plane, find the pair with the smallest Euclidean distance.

Brute force checks all pairs: `Theta(n^2)`. Divide and conquer gets `Theta(n log n)`, and the combine step is the interesting part.

```
CLOSEST-PAIR(P)
1  sort P by x-coordinate (once, up front)
2  divide P by a vertical line into left half L and right half R
3  dl = CLOSEST-PAIR(L);  dr = CLOSEST-PAIR(R)
4  d = min(dl, dr)
5  consider the strip of points within horizontal distance d of the dividing line
6  sort the strip by y-coordinate
7  for each point in the strip, compare it to the next 7 points in y-order
8  return the minimum distance found
```

**The combine lemma, which is the whole algorithm.** If a pair closer than `d` exists that spans the two halves, both points lie in the strip. Within the strip, **for any point p, only a constant number of other points can be within distance d of p and above it in y-order.**

*Proof.* Consider the `d x 2d` rectangle above p, spanning the strip's width and height d. Partition it into eight `d/2 x d/2` squares. Any two points inside the same small square are at distance at most `d/sqrt(2) < d`. But all points in the left half are at pairwise distance `>= d` (that is what `dl >= d` means), and likewise on the right. So each small square contains **at most one** point. Hence at most 8 points lie in the rectangle, one of which is p, so **at most 7 candidates.** QED

That is why line 7 says 7, and "why 7?" is the question that follows. The exact constant does not matter, only that it is a constant, which makes line 7 `Theta(size of strip)` rather than quadratic.

**Recurrence.** Naively, sorting the strip by y at every level costs `Theta(n log n)`, giving `T(n) = 2T(n/2) + Theta(n log n) = Theta(n log^2 n)` by the extended case 2. To get `Theta(n log n)`, presort by y once at the start and have the recursion return its points in y-order, so the strip can be built by a linear merge. Then `T(n) = 2T(n/2) + Theta(n) = Theta(n log n)`.

Same trick as counting inversions: **have the recursion return extra structure so the combine gets cheaper.**

---

## 24.10 Pattern matching

The course description lists pattern matching, and it is a nice contrast because the best algorithms here are *not* divide and conquer; they are clever preprocessing.

> **Problem.** Given text `T[1..n]` and pattern `P[1..m]`, find every position where P occurs in T.

**Naive.** Try every alignment, compare up to m characters: `Theta((n - m + 1) * m)`, so `O(nm)`.

### Rabin-Karp: hashing

Compare a **hash** of the pattern to a rolling hash of each window. Choose the hash so that the window's hash can be updated in O(1) when the window slides by one:

```
h(T[s+1..s+m]) = (h(T[s..s+m-1]) - T[s] * d^(m-1)) * d + T[s+m]   (mod q)
```

for radix `d` and prime modulus `q`. Matching hashes trigger a full character check to rule out collisions.

- Preprocessing `Theta(m)`, matching `Theta(n)` expected.
- Worst case `Theta(nm)` if every window collides, which a random prime `q` makes very unlikely.
- Generalizes beautifully to 2D pattern matching and to finding duplicate substrings, which is why it stays useful.

### Knuth-Morris-Pratt: never re-examine a text character

The observation: when a mismatch occurs after matching `k` characters, we already know what those `k` text characters were, so we can shift the pattern by more than 1 without missing anything. How far to shift depends only on the pattern, so precompute it.

Define the **failure function** `pi[q]` = the length of the longest proper prefix of `P[1..q]` that is also a suffix of `P[1..q]`.

```
COMPUTE-PREFIX-FUNCTION(P)
1  pi[1] = 0;  k = 0
2  for q = 2 to m
3      while k > 0 and P[k+1] != P[q]
4          k = pi[k]
5      if P[k+1] == P[q]
6          k = k + 1
7      pi[q] = k

KMP-MATCHER(T, P)
1  compute pi
2  k = 0
3  for i = 1 to n
4      while k > 0 and P[k+1] != T[i]
5          k = pi[k]
6      if P[k+1] == T[i]
7          k = k + 1
8      if k == m
9          report a match ending at i
10         k = pi[k]
```

**Running time `Theta(n + m)`.** The proof is an **amortized** argument, which is why it appears here after file 22 introduced the idea: `k` increases by at most 1 per iteration of the outer loop, so it increases at most `n` times total; each iteration of the inner `while` strictly decreases `k`, and `k` never goes below 0, so the inner loop runs at most `n` times in total across the entire execution. Hence `O(n)` for the matcher and by the identical argument `O(m)` for the preprocessing.

Worth stating explicitly: the inner `while` looks like it makes the algorithm quadratic and does not, and the reason is a potential-function argument on `k`.

**Which to use.** KMP for worst-case guarantees and streaming (it never backs up in the text). Rabin-Karp when you want multiple patterns at once or 2D. In practice, library implementations often use Boyer-Moore variants that are sublinear on typical text.

---

## 24.11 The paradigm's failure mode, and the bridge to file 25

Divide and conquer requires the subproblems to be **independent**. When they overlap, the same subproblem gets solved many times and the recursion explodes.

Naive Fibonacci:

```
FIB(n)
1  if n <= 1: return n
2  return FIB(n-1) + FIB(n-2)
```

`T(n) = T(n-1) + T(n-2) + O(1)`, which by the subtract-and-conquer rule is `Theta(phi^n)`, exponential. And it is exponential for a stupid reason: `FIB(5)` computes `FIB(3)` twice, `FIB(2)` three times, `FIB(1)` five times. The distinct subproblems number only `n`; we are recomputing them `phi^n` times.

The fix is to **remember**. That is dynamic programming, and it is the next file.

The diagnostic:

| | Divide and conquer | Dynamic programming |
|---|---|---|
| Subproblems | independent, disjoint | overlapping, shared |
| Each subproblem solved | once, naturally | once, only because you memoized |
| Typical recurrence | `T(n) = aT(n/b) + f(n)` | not a recurrence in n; a table over states |
| Cost model | solve the recurrence | (states) x (work per state) |

---

## 24.12 Practice

1. `T(n) = 2T(n/2) + Theta(1)` describes an algorithm that recurses on both halves and does constant combine work. What is it, and what is the running time?
2. You are given a sorted array that has been rotated an unknown number of positions. Find the minimum in `O(log n)`. Prove it correct.
3. Given `A[1..n]` with a **majority element** (one appearing more than `n/2` times), find it in `O(n log n)` by divide and conquer. What is the combine step?
4. Prove that any algorithm to find the maximum of n elements requires at least `n - 1` comparisons.
5. Modify mergesort to count, for each element, how many elements to its right are smaller than it. Still `O(n log n)`?
6. Why does median-of-medians use groups of 5 rather than 3? Give the two recurrences and their solutions.
7. Multiplying an `n x n` matrix by an `n x 1` vector: can divide and conquer beat `Theta(n^2)`? Why or why not?
8. You have a `2^k x 2^k` board with one square removed. Tile it with L-shaped trominoes. Give a divide-and-conquer algorithm and its running time.

### Answers

Do not read this until you have written your own attempt on paper.

1. `Theta(n)` by master case 1 (`W = n`, `f = 1`). It describes any "recurse on both halves, combine in O(1)" algorithm, for example computing the maximum, the sum, or the height of a complete binary tree. The recursion visits `n` leaves and that dominates.

2. Compare `A[mid]` to `A[hi]`. If `A[mid] > A[hi]`, the minimum is in `A[mid+1..hi]`; otherwise it is in `A[lo..mid]`. Invariant: the minimum is always inside the current range. Each step halves the range, so `T(n) = T(n/2) + O(1) = Theta(log n)`. Correctness: strong induction plus the case analysis showing the discarded half cannot contain the minimum, which follows because a rotated sorted array is two increasing runs and `A[mid] > A[hi]` places `mid` in the first run.

3. Recursively find the majority of each half. If a majority of the whole exists, it must be a majority of at least one half (if it were a majority of neither, it would occupy at most `n/4 + n/4 = n/2` positions). So the combine step is: take the (at most two) candidates and count their occurrences in the full array in `O(n)`. `T(n) = 2T(n/2) + O(n) = Theta(n log n)`. There is also a `Theta(n)` non-recursive algorithm, Boyer-Moore voting, which is worth knowing.

4. Every element except the maximum must "lose" at least one comparison in order to be eliminated, and each comparison produces at most one new loser. There are `n - 1` non-maximum elements, so at least `n - 1` comparisons are needed. This is an adversary-flavoured counting argument and the bound is tight.

5. Yes, `O(n log n)`. Same structure as counting inversions, but instead of accumulating a single global count, attribute the count to the specific left-half element: when `L[i]` is copied out, add `(number of right-half elements already copied)` to that element's tally. Each element's answer is complete when the top-level merge finishes.

6. Groups of 5 give `T(n) = T(n/5) + T(7n/10) + Theta(n)` with `1/5 + 7/10 = 9/10 < 1`, so `Theta(n)`. Groups of 3 give `T(n) = T(n/3) + T(2n/3) + Theta(n)` with `1/3 + 2/3 = 1`, so `Theta(n log n)`. The fractions must sum to strictly less than 1 for the geometric series to converge to a constant times the root.

7. No. The output alone has n entries and every input entry affects the output, so any correct algorithm must read all `n^2` matrix entries. That gives an `Omega(n^2)` lower bound, which the naive algorithm already matches. Strassen-style tricks help only when the *output* is also `n^2`, which is what leaves room for a smaller exponent.

8. Split the board into four quadrants of size `2^(k-1) x 2^(k-1)`. One quadrant contains the hole. Place a single tromino at the centre covering one square of each of the other three quadrants, which gives each of those a "hole" too. Now all four quadrants are the same problem one size down. Base case `2 x 2` with one hole is exactly one tromino. `T(n) = 4T(n/4) + O(1)` where n is the number of squares, giving `Theta(n)`, which is optimal since every square must be covered.


---

Next: [25 — Dynamic Programming](25-dynamic-programming.md).
