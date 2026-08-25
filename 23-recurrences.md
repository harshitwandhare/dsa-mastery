# 23 — Recurrences

**The single most tested skill in the first half of the course.** An algorithm that calls itself does not have an obvious operation count, so we write down an equation that the count satisfies and then solve the equation. That equation is a recurrence.

Assumes [22 — Asymptotics from Zero](22-asymptotics-from-zero.md).

---

## 23.1 Where a recurrence comes from

Take mergesort:

```
MERGE-SORT(A, p, r)
1  if p < r
2      q = floor((p + r) / 2)
3      MERGE-SORT(A, p, q)
4      MERGE-SORT(A, q + 1, r)
5      MERGE(A, p, q, r)
```

Let `T(n)` be the worst-case number of operations on an input of size n. Read the code and translate line by line:

- Line 2 is O(1).
- Line 3 sorts half the array, costing `T(n/2)`.
- Line 4 sorts the other half, costing `T(n/2)`.
- Line 5 merges two sorted halves, which is a linear scan, costing `Theta(n)`.

So:

```
T(n) = 2 T(n/2) + Theta(n)      for n > 1
T(1) = Theta(1)
```

That is the recurrence. It defines `T` in terms of itself on smaller inputs, plus a **base case**, which is the thing students forget and which is required for the definition to mean anything.

### The general shape

Most divide-and-conquer recurrences look like:

```
T(n) = a T(n/b) + f(n)
```

read as: **`a` subproblems, each of size `n/b`, plus `f(n)` work to split and combine.**

| symbol | meaning | mergesort |
|---|---|---|
| `a` | how many recursive calls | 2 |
| `b` | by what factor the size shrinks | 2 |
| `f(n)` | non-recursive work per call | `Theta(n)` for the merge |

`a` and `b` are independent. `a` is a count, `b` is a ratio, and they are equal in mergesort only by coincidence. Binary search has `a = 1, b = 2`. Strassen has `a = 7, b = 2`.

The other common shape is **subtract-and-conquer**:

```
T(n) = a T(n - b) + f(n)
```

which behaves completely differently and is covered in 23.7.

### Three conventions that save you pain

**1. Ignore floors and ceilings.** The real mergesort recurrence is `T(ceil(n/2)) + T(floor(n/2)) + Theta(n)`. Writing `2T(n/2)` gives the same asymptotic answer. This is a theorem, not laziness (CLRS proves it), and every course lets you do it. Say "we omit floors and ceilings, which does not affect the asymptotics" once and move on.

**2. Ignore the base case when it is constant.** `T(1) = Theta(1)` is assumed unless stated otherwise. It only matters when the recursion bottoms out at something unusual.

**3. Assume `T(n)` is constant for small n.** Needed so that the boundary conditions do not blow up the algebra.

---

## 23.2 Method 1: the recursion tree

**Do this first, always.** Even when you plan to finish with the master theorem, draw the tree, because it tells you *why* the answer is what it is and it is the only method that survives when the master theorem does not apply.

The idea: draw the recursion as a tree, where each node is one call, labelled with the **non-recursive** work that call does. Then total up.

### Mergesort's tree

```
level 0:            n                            cost n            (1 node,  size n)
                  /   \
level 1:      n/2      n/2                       cost n            (2 nodes, size n/2)
             /   \    /   \
level 2:  n/4  n/4  n/4  n/4                     cost n            (4 nodes, size n/4)
             ...
level i:  2^i nodes, each of size n/2^i          cost n
             ...
level lg n: n nodes, each of size 1              cost n
```

Three questions to answer for any tree:

1. **How many levels?** Sizes go `n, n/2, n/4, ...` and stop at 1. That takes `log_2 n` halvings, so the tree has `lg n + 1` levels, indexed 0 through `lg n`.
2. **What does each level cost?** Level i has `2^i` nodes each doing `c(n/2^i)` work, so level cost is `c * n`. **Constant across levels**, which is the special thing about mergesort.
3. **Total?** `(number of levels) x (cost per level) = (lg n + 1) * cn = Theta(n lg n)`.

### The three tree shapes, and this is the whole master theorem

When you sum a recursion tree, the level costs form a sequence. That sequence is essentially always geometric, and geometric series are dominated by their largest term. So there are exactly three outcomes:

**Shape A: costs grow going down. The leaves dominate.**

```
T(n) = 4 T(n/2) + n
level 0:  n
level 1:  4 * (n/2)    = 2n
level 2:  16 * (n/4)   = 4n
level i:  4^i * n/2^i  = 2^i n          <- doubling each level
```

Increasing geometric, so the total is within a constant factor of the **last** level. The last level is the leaves. Number of leaves is `4^(lg n) = n^2`, each costing O(1), so `T(n) = Theta(n^2)`.

**Shape B: costs are equal at every level. Everybody contributes.**

Mergesort. Total is `(cost per level) x (number of levels) = Theta(n log n)`.

**Shape C: costs shrink going down. The root dominates.**

```
T(n) = 2 T(n/2) + n^2
level 0:  n^2
level 1:  2 * (n/2)^2  = n^2/2
level 2:  4 * (n/4)^2  = n^2/4
level i:  2^i (n/2^i)^2 = n^2 / 2^i     <- halving each level
```

Decreasing geometric with ratio 1/2, and `sum_{i>=0} n^2/2^i < 2n^2`. Total is within a constant factor of the **first** level. `T(n) = Theta(n^2)`.

> **Those three shapes are the three cases of the master theorem.** If you understand the tree, you never have to memorize the theorem, you can rederive it. Do the tree once for every new recurrence until this is instinct.

### Counting leaves, in general

For `T(n) = a T(n/b) + f(n)`:

- depth of the tree is `log_b n`
- level i has `a^i` nodes, each of size `n / b^i`
- number of leaves is `a^(log_b n)`, which equals **`n^(log_b a)`**

That identity `a^(log_b n) = n^(log_b a)` is the "weird one" from the logarithm toolkit in file 21, and this is where it earns its keep. `n^(log_b a)` is called the **watershed function**, and comparing `f(n)` against it is exactly what the master theorem does.

Sanity checks: mergesort has `n^(log_2 2) = n^1 = n` leaves, correct, one per element. Binary search has `n^(log_2 1) = n^0 = 1` leaf, correct, it follows a single path.

---

## 23.3 Method 2: the master theorem

The tree argument, packaged. Use it to write the answer down fast once you have understood the tree.

> **Master theorem.** Let `a >= 1` and `b > 1` be constants, `f(n)` a non-negative function, and
> ```
> T(n) = a T(n/b) + f(n)
> ```
> Let `W(n) = n^(log_b a)` be the watershed. Then:
>
> **Case 1 (leaves win).** If `f(n) = O(n^(log_b a - eps))` for some constant `eps > 0`, then `T(n) = Theta(n^(log_b a))`.
>
> **Case 2 (tie).** If `f(n) = Theta(n^(log_b a))`, then `T(n) = Theta(n^(log_b a) * log n)`.
>
> **Case 3 (root wins).** If `f(n) = Omega(n^(log_b a + eps))` for some constant `eps > 0`, **and** the regularity condition `a f(n/b) <= c f(n)` holds for some `c < 1` and all sufficiently large n, then `T(n) = Theta(f(n))`.

### How to use it, mechanically

```
1. Read off a, b, f(n).
2. Compute the watershed  W(n) = n^(log_b a).
3. Compare f(n) to W(n):
     f polynomially SMALLER  -> Case 1 -> answer Theta(W)
     f the SAME (Theta)      -> Case 2 -> answer Theta(W log n)
     f polynomially LARGER   -> Case 3 -> answer Theta(f), after checking regularity
```

### Worked examples

| Recurrence | a | b | `log_b a` | W(n) | f(n) | Case | Answer |
|---|---|---|---|---|---|---|---|
| `T(n)=2T(n/2)+n` | 2 | 2 | 1 | `n` | `n` | 2 | `Theta(n log n)` |
| `T(n)=2T(n/2)+1` | 2 | 2 | 1 | `n` | `1` | 1 | `Theta(n)` |
| `T(n)=2T(n/2)+n^2` | 2 | 2 | 1 | `n` | `n^2` | 3 | `Theta(n^2)` |
| `T(n)=T(n/2)+1` | 1 | 2 | 0 | `1` | `1` | 2 | `Theta(log n)` |
| `T(n)=T(n/2)+n` | 1 | 2 | 0 | `1` | `n` | 3 | `Theta(n)` |
| `T(n)=4T(n/2)+n` | 4 | 2 | 2 | `n^2` | `n` | 1 | `Theta(n^2)` |
| `T(n)=4T(n/2)+n^2` | 4 | 2 | 2 | `n^2` | `n^2` | 2 | `Theta(n^2 log n)` |
| `T(n)=4T(n/2)+n^3` | 4 | 2 | 2 | `n^2` | `n^3` | 3 | `Theta(n^3)` |
| `T(n)=3T(n/2)+n` | 3 | 2 | `lg 3 ~ 1.585` | `n^1.585` | `n` | 1 | `Theta(n^lg3)` |
| `T(n)=7T(n/2)+n^2` | 7 | 2 | `lg 7 ~ 2.807` | `n^2.807` | `n^2` | 1 | `Theta(n^lg7)` |
| `T(n)=8T(n/2)+n^2` | 8 | 2 | 3 | `n^3` | `n^2` | 1 | `Theta(n^3)` |
| `T(n)=9T(n/3)+n` | 9 | 3 | 2 | `n^2` | `n` | 1 | `Theta(n^2)` |
| `T(n)=2T(n/4)+sqrt(n)` | 2 | 4 | 0.5 | `sqrt(n)` | `sqrt(n)` | 2 | `Theta(sqrt(n) log n)` |

Rows 3, 5, and 7 are worth committing to memory as landmarks: binary search is `Theta(log n)`, mergesort is `Theta(n log n)`, naive matrix multiply is `Theta(n^3)`, Strassen is `Theta(n^lg 7)`.

### The word "polynomially" is the whole trap

Cases 1 and 3 require the gap to be a **polynomial factor**, `n^eps` for some fixed `eps > 0`. A gap of only `log n` is not enough, and this is where the master theorem fails.

**The famous failing example:**

```
T(n) = 2 T(n/2) + n log n
```

Here `a = 2, b = 2`, watershed `W(n) = n`. Is `f(n) = n log n` bigger than `n`? Yes. Is it *polynomially* bigger, meaning is `n log n = Omega(n^(1+eps))` for some fixed `eps > 0`? **No**, because `log n` grows slower than `n^eps` for every `eps > 0`. So the gap is real but sub-polynomial, and the master theorem in this form **does not apply**. Say so on the exam, then solve it with a recursion tree:

```
level i: 2^i nodes, each costing (n/2^i) lg(n/2^i) = (n/2^i)(lg n - i)
level cost: n(lg n - i)
total: sum_{i=0}^{lg n} n(lg n - i) = n * sum_{j=0}^{lg n} j = n * Theta(lg^2 n) = Theta(n lg^2 n)
```

So `T(n) = Theta(n log^2 n)`. Writing "master theorem gives `Theta(n log n)`" here is wrong and is a favourite exam trap.

**The extended case 2**, which some courses give you and which handles exactly this family:

> If `f(n) = Theta(n^(log_b a) * log^k n)` for some `k >= 0`, then `T(n) = Theta(n^(log_b a) * log^(k+1) n)`.

With `k = 1` that gives `Theta(n log^2 n)`, matching the tree. Use it if your course states it; derive it with a tree if not.

### The regularity condition in case 3

`a f(n/b) <= c f(n)` for some `c < 1` says the work is genuinely shrinking as you descend, so the root really does dominate. It holds for every polynomial `f`, so in practice you check it, note that it holds, and move on. It fails for pathological `f` like `n^2 (2 + sin n)`, which is why the condition is there at all. Mention it in one clause on homework so the grader sees you know it exists.

### When the master theorem does not apply at all

- `a` or `b` not constant (`T(n) = n T(n/2) + n`)
- `b <= 1` (the subproblem is not smaller)
- `f(n)` not positive
- Case 3's regularity fails
- The gap between `f` and `W` is sub-polynomial (the `n log n` case above)
- Unequal subproblem sizes (`T(n) = T(n/3) + T(2n/3) + n`)
- Subtract-and-conquer (`T(n) = 2T(n-1) + 1`)

For all of these: recursion tree, or substitution.

---

## 23.4 Method 3: substitution (guess and verify)

The most powerful method and the only one that is a genuine proof from first principles. Guess the answer, then prove it by induction.

**Warning that costs points:** you must prove the **exact** inductive statement, not an asymptotic one. Carrying `O()` inside an induction is the single most common error in this class, because it lets you "prove" false things. Prove `T(n) <= c n log n` with an explicit `c`, not `T(n) = O(n log n)`.

### Worked: `T(n) = 2T(n/2) + n`

**Guess:** `T(n) = O(n lg n)`. Concretely, claim `T(n) <= c n lg n` for some constant `c > 0` and all `n >= n0`.

**Induction step.** Assume the claim for all smaller sizes, in particular for `n/2`:

```
T(n) =  2 T(n/2) + n
     <= 2 * (c (n/2) lg(n/2)) + n              [induction hypothesis]
     =  c n lg(n/2) + n
     =  c n (lg n - 1) + n                     [lg(n/2) = lg n - 1]
     =  c n lg n - c n + n
     <= c n lg n                               [provided -cn + n <= 0, i.e. c >= 1]
```

So the step goes through for any `c >= 1`.

**Base case.** We need some `n0` where the claim holds directly. At `n = 1`, `c * 1 * lg 1 = 0`, but `T(1) > 0`, so `n = 1` fails. This is normal and the fix is standard: **start the base case higher.** Take `n0 = 2`. Then `T(2) = 2T(1) + 2`, and we need `T(2) <= c * 2 * lg 2 = 2c`, which holds by choosing `c` large enough (specifically `c >= T(2)/2`). Since the recursion for `n >= 4` only ever bottoms out at `n = 2` or `n = 3`, and we can pick `c` big enough to cover both, the base is fine.

Choose `c = max(1, T(2)/2, T(3)/(3 lg 3))`. Both requirements are satisfied. Therefore `T(n) = O(n lg n)`. QED

**Note the two moves that make substitution work in practice:** you may start the base case at any convenient `n0`, and you may pick `c` as large as you like at the end. Use both freely.

### The classic failure: not subtracting enough

Try to prove `T(n) = 2T(n/2) + n` is `O(n)`, which is false, and watch where it breaks:

```
T(n) <= 2 * c(n/2) + n = cn + n
```

We wanted `<= cn` and got `cn + n`. The extra `n` cannot be absorbed, so the proof fails, correctly telling you the guess was too small.

Now a subtler failure. Suppose you "prove" it anyway by writing `cn + n = O(n)`. That step is **illegal**, and it is illegal precisely because `O()` hides a constant that is growing with each level of the induction. This is why the rule above exists: no asymptotic notation inside the induction.

### The trick: strengthen the hypothesis

Sometimes a correct guess fails to go through, and the fix is to prove something **stronger**, which paradoxically makes the induction easier because you get more to work with.

Take `T(n) = 2T(n/2) + 1`, guess `T(n) = O(n)`, so claim `T(n) <= cn`:

```
T(n) <= 2c(n/2) + 1 = cn + 1
```

Off by one, and it fails. Strengthen the claim to `T(n) <= cn - d` for constants `c, d > 0`:

```
T(n) <= 2(c(n/2) - d) + 1 = cn - 2d + 1 <= cn - d      [provided d >= 1]
```

Works with `d = 1`. And `T(n) <= cn - 1` implies `T(n) = O(n)`, which is what we wanted. **Subtracting a lower-order term from the hypothesis is the standard rescue.** Adding one never helps.

### Substitution for a lower bound

Same machinery, inequality reversed. To show `T(n) = Omega(n lg n)`, claim `T(n) >= c n lg n` and derive:

```
T(n) =  2T(n/2) + n
     >= 2 c (n/2) lg(n/2) + n
     =  c n lg n - cn + n
     >= c n lg n                     [provided c <= 1]
```

Note that the constraint flipped: the upper bound needed `c >= 1`, the lower bound needs `c <= 1`. Take `c = 1` for both and you have proved `Theta(n lg n)`.

---

## 23.5 Method 4: iteration / expansion

Unroll the recurrence a few times, spot the pattern, sum it. Less rigorous than substitution but excellent for *finding* the guess that substitution then verifies.

`T(n) = T(n/2) + 1`:

```
T(n) = T(n/2) + 1
     = T(n/4) + 1 + 1
     = T(n/8) + 1 + 1 + 1
     = T(n/2^k) + k
```

Stop when `n/2^k = 1`, that is `k = lg n`:

```
T(n) = T(1) + lg n = Theta(log n)
```

Binary search, confirmed.

`T(n) = 2T(n/2) + n`:

```
T(n) = 2T(n/2) + n
     = 2(2T(n/4) + n/2) + n = 4T(n/4) + 2n
     = 8T(n/8) + 3n
     = 2^k T(n/2^k) + kn
```

At `k = lg n`: `T(n) = n T(1) + n lg n = Theta(n lg n)`. Confirmed again.

**On homework, use iteration to find the answer and substitution to prove it.** Iteration's "spot the pattern" step is not a proof, and a strict grader will say so.

---

## 23.6 Method 5: change of variables

For recurrences where the argument shrinks in a strange way.

**`T(n) = 2 T(sqrt(n)) + lg n`.**

Substitute `m = lg n`, so `n = 2^m` and `sqrt(n) = 2^(m/2)`. Define `S(m) = T(2^m)`:

```
T(2^m) = 2 T(2^(m/2)) + m
S(m)   = 2 S(m/2) + m
```

That is mergesort's recurrence, so `S(m) = Theta(m lg m)`. Substitute back `m = lg n`:

```
T(n) = Theta(lg n * lg lg n)
```

**`T(n) = T(n/2) + Theta(1)` where n is a *number*, not an array size.** Careful here: if the input is the integer n written in binary, the input *size* is `lg n` bits, so a `Theta(log n)` running time is `Theta(size)`, which is **linear**, not logarithmic, in the input size. This distinction is invisible until file 28 and then decides everything.

---

## 23.7 Subtract-and-conquer recurrences

`T(n) = a T(n - b) + f(n)` behaves nothing like the divide case. There is a separate rule.

> If `T(n) = a T(n - b) + f(n)` with `a >= 1`, `b > 0`, and `f(n) = O(n^k)`:
>
> - `a < 1`: `T(n) = O(n^k)`
> - `a = 1`: `T(n) = O(n^(k+1))`
> - `a > 1`: `T(n) = O(n^k * a^(n/b))`, which is **exponential**

The intuition is that the recursion depth is now `n/b`, which is linear rather than logarithmic, so a branching factor above 1 compounds catastrophically.

| Recurrence | Answer | Where it shows up |
|---|---|---|
| `T(n) = T(n-1) + 1` | `Theta(n)` | linear scan by recursion |
| `T(n) = T(n-1) + n` | `Theta(n^2)` | naive selection sort, insertion sort worst case |
| `T(n) = 2T(n-1) + 1` | `Theta(2^n)` | towers of Hanoi, subset enumeration |
| `T(n) = 2T(n-1) + n` | `Theta(2^n)` | naive subset-sum |
| `T(n) = T(n-1) + T(n-2) + 1` | `Theta(phi^n)`, `phi ~ 1.618` | naive Fibonacci |
| `T(n) = n T(n-1) + 1` | `Theta(n!)` | permutation enumeration |

**The lesson to carry into file 25:** `T(n) = 2T(n-1) + O(1)` being exponential while `T(n) = 2T(n/2) + O(n)` is `n log n` is the entire reason dynamic programming exists. When a recursive solution subtracts instead of divides and branches more than once, the subproblems *overlap*, and memoizing them collapses the exponential into a polynomial.

---

## 23.8 Unequal splits

`T(n) = T(n/3) + T(2n/3) + n`.

Master theorem does not apply. Recursion tree:

- Every level costs `n`, because the subproblem sizes at each level always sum to `n`.
- The tree is **unbalanced**: the shortest root-to-leaf path shrinks by 1/3 each time, giving depth `log_3 n`; the longest shrinks by 2/3 each time, giving depth `log_{3/2} n`.
- So the total is between `n log_3 n` and `n log_{3/2} n`. Both are `Theta(n log n)`.

`T(n) = Theta(n log n)`.

**The general and genuinely useful fact:** if a recurrence splits into pieces whose sizes sum to n (or less), and the split fractions are **constants** bounded away from 0 and 1, the answer is `Theta(n log n)` with linear combine work. Even a 99/1 split is `Theta(n log n)`. It is only when the split is not a constant fraction, like `T(n) = T(n-1) + T(1) + n`, that you fall to `Theta(n^2)`. This is exactly why quicksort's average case is fine and its worst case is not.

---

## 23.9 Worked set with full solutions

Cover the answers. Do these on paper.

**1. `T(n) = 3T(n/3) + n`**

`a=3, b=3, log_3 3 = 1, W = n, f = n`. Case 2. **`Theta(n log n)`.**

**2. `T(n) = T(2n/3) + 1`**

`a=1, b=3/2, log_{3/2} 1 = 0, W = 1, f = 1`. Case 2. **`Theta(log n)`.**

**3. `T(n) = 3T(n/4) + n lg n`**

`log_4 3 ~ 0.793`, `W = n^0.793`. Is `n lg n` polynomially larger? Yes, `n lg n = Omega(n^(0.793 + 0.2))` comfortably. Case 3. Regularity: `3 (n/4) lg(n/4) <= (3/4) n lg n`, so `c = 3/4 < 1`, holds. **`Theta(n lg n)`.**

**4. `T(n) = 2T(n/2) + n / lg n`**

`W = n`. Is `f = n/lg n` polynomially *smaller* than `n`? It is smaller, but only by a `lg n` factor, which is sub-polynomial. **Master theorem does not apply.** Tree: level i costs `2^i * (n/2^i) / lg(n/2^i) = n / (lg n - i)`. Total `sum_{i=0}^{lg n - 1} n/(lg n - i) = n * sum_{j=1}^{lg n} 1/j = n * H_{lg n} = Theta(n lg lg n)`.

**5. `T(n) = T(n-1) + 1/n`**

Not a divide recurrence. Iterate: `T(n) = sum_{i=1}^{n} 1/i = H_n = Theta(log n)`.

**6. `T(n) = 4T(n/2) + n^2 lg n`**

`W = n^2`. `f = n^2 lg n` is larger but only sub-polynomially. Extended case 2 with `k=1`: **`Theta(n^2 lg^2 n)`.**

**7. `T(n) = sqrt(n) T(sqrt(n)) + n`**

Not standard form since `a` depends on n. Tree: at every level, the total work is `n` (the subproblem sizes always multiply out to n). Depth: sizes go `n, n^(1/2), n^(1/4), ...` and reach 2 after `lg lg n` levels. **`Theta(n lg lg n)`.**

**8. `T(n) = T(n/2) + T(n/4) + T(n/8) + n`**

Fractions sum to `1/2 + 1/4 + 1/8 = 7/8 < 1`, so level costs form a decreasing geometric series with ratio 7/8. The root dominates. **`Theta(n)`.** Generalize: **if the fractions sum to less than 1 with linear combine work, the answer is linear; if exactly 1, it is `n log n`; if more than 1, it is superlinear.**

**9. `T(n) = 2T(n/2) + n^2`, prove by substitution.**

Claim `T(n) <= cn^2`. Step: `T(n) <= 2c(n/2)^2 + n^2 = cn^2/2 + n^2 = cn^2 (1/2 + 1/c)`. This is `<= cn^2` provided `1/2 + 1/c <= 1`, that is `c >= 2`. Base: choose c large enough to cover `T(2)`. **`O(n^2)`**, and the matching lower bound is immediate from `T(n) >= n^2`. So `Theta(n^2)`.

**10. `T(n) = T(n/2) + T(n/4) + 1`.**

Not master. Guess `T(n) = O(n^alpha)` and find alpha by substituting `n^alpha`: we need `(1/2)^alpha + (1/4)^alpha = 1`. Let `x = (1/2)^alpha`, then `x + x^2 = 1`, so `x = (sqrt(5)-1)/2 ~ 0.618`. Then `alpha = -lg(0.618) ~ 0.694`. **`Theta(n^0.694)`.** This "solve for the exponent that makes the fractions sum to 1" trick is the poor man's Akra-Bazzi and is worth knowing.

---

## 23.10 The Akra-Bazzi method, for completeness

If your course covers it, it handles unequal splits in full generality. For

```
T(n) = sum_{i=1}^{k} a_i T(n / b_i) + f(n)
```

find the unique `p` satisfying `sum_i a_i / b_i^p = 1`, and then

```
T(n) = Theta( n^p * (1 + integral from 1 to n of f(u)/u^(p+1) du) )
```

The master theorem is the special case `k = 1`, where `p = log_b a`. Problem 10 above is the `k = 2` case done by hand. Most courses only mention Akra-Bazzi; know that it exists and that the exponent `p` is defined by "the fractions raised to p sum to 1".

---

## 23.11 The exam checklist

When a recurrence appears on an exam, run this in order:

```
1. Is it a T(n/b) + f(n) with constant a, b?
     YES -> compute W = n^(log_b a), compare to f, apply master theorem.
             If the gap is only logarithmic, STOP and use a tree instead.
     NO  -> continue.
2. Is it T(n - b) with a subtracted argument?
     YES -> use the subtract-and-conquer rule. Branching > 1 means exponential.
3. Are the splits unequal but constant fractions?
     YES -> tree. Fractions summing to <1 gives Theta(f), =1 gives Theta(f log n).
4. Is the argument transformed (sqrt, log)?
     YES -> change of variables.
5. Otherwise: iterate to guess, then substitute to prove.
6. ALWAYS state the base case assumption and the floor/ceiling omission.
```

And two habits that pick up free marks:

- **State which case you are in and why.** "Case 1, since `f(n) = n = O(n^(2 - 0.5))`" earns the point that "Case 1" alone does not.
- **Sanity check against a known algorithm.** If you derive `Theta(n)` for mergesort, you made an arithmetic error. Keep the landmark table from 23.3 in your head as a set of tripwires.

---

Next: [24 — Divide and Conquer](24-divide-and-conquer.md), which is where these recurrences come from in the first place.
