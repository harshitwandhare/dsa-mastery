# 29 — Problem Sets, Worked

The rest of the track teaches technique. This file is where technique meets the kind of question that actually appears on a problem set or an exam: the phrasing is terse, the work is yours, and partial credit depends on writing the right three sentences rather than the right thirty.

Every problem here is worked end to end. **Cover the solution and attempt it on paper first.** Reading a solution you did not attempt produces a strong feeling of understanding and almost no ability, which is the single most common way people lose marks on material they "knew".

Assumes files [22](22-asymptotics-from-zero.md) through [24](24-divide-and-conquer.md). Sets A through E are first-half material; set F is divide-and-conquer design.

---

## 29.1 What the six problem types are

Problem sets in this material recycle six shapes. Recognizing which one you are looking at is most of the work.

| Set | Shape | The skill being tested |
|---|---|---|
| A | Here is code, give a tight `Theta` | Translating control flow into a recurrence or a sum |
| B | Here is an expression, give a tight `Theta` | Log identities, and knowing what the variable is |
| C | Order these functions by growth | Comparing by logs, and the notation's edge cases |
| D | Here is a counting problem, write a recurrence | Conditioning on one decision, exhaustively and disjointly |
| E | Here is a recurrence, give a tight `Theta` | Level sums and the geometric ratio test |
| F | Here is a problem, design an algorithm | Divide and conquer, plus proving the combine step |

Sets A, B, C and E ask for **tight** bounds. A correct `O` where a `Theta` was asked for is a partial answer, and saying `O(n^2)` when the truth is `Theta(n log n)` is simply wrong even though the `O` statement is true.

---

## 29.2 Set A: reading a running time off code

### A1. A recursion whose parameter goes both up and down

```
STRANGE(n)
1  if n <= 10
2      return n
3  if n is even
4      return STRANGE(n / 2)
5  else
6      return STRANGE(n + 3)
```

> Give a tight bound on the worst-case running time.

**The difficulty.** Line 6 makes the argument *larger*. The standard "each call shrinks the input" reasoning does not apply, and the recursion is not obviously terminating, let alone fast.

**Step 1: look at two calls at a time, not one.** If `n` is odd, then `n + 3` is even, so the very next call takes the even branch. Odd inputs therefore never appear twice in a row, and it is enough to understand the two-call block

```
n  ->  n + 3  ->  (n + 3)/2
```

**Step 2: show the block still shrinks by a constant factor.** We want `(n+3)/2 <= (3/4) n`, which rearranges to `4(n+3) <= 6n`, that is `n >= 6`. The odd branch is only reached when `n > 10`, so the condition holds every time it matters, with room to spare. Even inputs shrink by a full half in one call, which is better. So:

> **every two calls reduce `n` to at most `3/4` of its value.**

**Step 3: count.** Starting from `n`, after `2k` calls the argument is at most `(3/4)^k n`. The recursion stops once the argument drops to 10 or below, which happens once `(3/4)^k n <= 10`, that is `k = O(log n)`. Each call does `O(1)` work of its own. So the running time is `O(log n)`.

**Step 4: the matching lower bound, which is the half people skip.** The question said `Theta`, so an upper bound alone is half an answer. No single call reduces the argument by more than a factor of 2 (halving is the best case; adding 3 makes it worse). So after `k` calls the argument is at least `n / 2^k`, and reaching the base case at 10 needs `n / 2^k <= 10`, that is `k >= lg n - lg 10`. Hence `Omega(log n)`.

**Answer: `Theta(lg n)`.**

**What earns full marks.** Three sentences: odd is always followed by even, so two calls take `n` to `(n+3)/2 <= 3n/4`; that is a constant-factor shrink so `O(lg n)` calls; no call beats halving so `Omega(lg n)`.

**The trap to avoid.** Do not try to write a recurrence like `T(n) = T(n+3)` and feed it to the master theorem. It is not that kind of recurrence. When the parameter does not shrink monotonically, **argue about the potential function directly** (here, the value of `n` itself) instead of reaching for machinery.

### A2. Nested loops on top of a recursion

```
FINDPAIR(A[1..n])
1  if n == 1
2      return False
3  mid = ceil(n/2)
4  for i = 1 to mid
5      for j = mid + 1 to n
6          if A[i] == A[j]
7              return True
8  return ( FINDPAIR(A[1..mid]) OR FINDPAIR(A[mid+1..n]) )
```

> (a) Give a tight bound on the worst-case running time. (b) Say in one sentence what the procedure computes.

**(a) The non-recursive work.** Lines 4 to 7 are a double loop running `mid * (n - mid)` times. With `mid = ceil(n/2)` both factors are `Theta(n)`, so the loop nest is `Theta(n^2)`.

**The worst case is what makes the recursion run.** If line 7 fires, the procedure returns immediately and does no recursion at all, so the *fast* case is an array full of duplicates. For the worst case, hand it an array whose entries are all distinct: line 7 never fires, both recursive calls run in full, and

```
T(n) = 2 T(n/2) + Theta(n^2),     T(1) = Theta(1)
```

**Solve it.** Level `i` holds `2^i` subproblems of size `n/2^i`, each costing `(n/2^i)^2`, so the level sum is

```
2^i * (n / 2^i)^2 = n^2 / 2^i
```

Consecutive levels have ratio `1/2`, a decreasing geometric series, so the root dominates and the total is `Theta(n^2)`.

(By the master theorem, `a = 2`, `b = 2`, `W(n) = n^(log_2 2) = n`, and `f(n) = n^2` is polynomially larger, so case 3, with the regularity condition `2 (n/2)^2 = n^2/2 <= c n^2` holding at `c = 1/2`. Either route is fine; the level sum is faster to write.)

**Answer: `Theta(n^2)`.**

**(b)** It returns True exactly when `A` contains a repeated value, and False when all `n` entries are distinct.

*Why that is right, since "one sentence" still has to be a true sentence.* If two equal entries exist at positions `i < j`, follow the recursion down: at every level they are either in the same half, in which case the recursion keeps them together, or in different halves, in which case the double loop at that level compares them directly and returns True. They cannot stay together forever, because subarrays shrink to length 1. So some level splits them and catches them.

**The lesson from A2.** Notice that the worst case came from the *early exit*, not from the loops. Any time code can return early, ask "what input prevents the early return?" before writing the recurrence, because that input is the worst case.

---

## 29.3 Set B: asymptotics of an expression

No algorithms here, just algebra. Two identities carry almost all of these:

```
a^(log_b c) = c^(log_b a)          the swap identity
n^(1/lg n)  = 2                    a constant, not a function of n
```

The second is worth proving to yourself once, because it looks wrong: `n^(1/lg n) = 2^(lg n * (1/lg n)) = 2^1 = 2`.

### B1. `lg^3(n) + 5^(lg lg n) + lg^2(lg^4 n)`

Recall the convention from 21.6: `lg^3 n` means `(lg n)^3`, not `lg lg lg n`.

Take the terms one at a time.

- `lg^3 n = (lg n)^3`.
- `5^(lg lg n)`. Apply the swap identity with `n` replaced by `lg n`: `5^(lg(lg n)) = (lg n)^(lg 5)`. Since `lg 5 = 2.3219...`, this is `(lg n)^2.32`.
- `lg^2(lg^4 n) = ( lg(lg^4 n) )^2 = ( 4 lg lg n )^2 = 16 (lg lg n)^2`.

Now compare. The first is `(lg n)^3`, the second is `(lg n)^2.32`, and since `lg 5 < 3` the first dominates the second. The third is only `(lg lg n)^2`, far below both. A sum is `Theta` of its largest term (22.12, answer 8).

**Answer: `Theta(lg^3 n)`.**

**The trap:** reading `5^(lg lg n)` as exponential. It is not. Anything of the form `c^(log of something)` is a *polynomial* in that something, and the swap identity is how you see it.

### B2. The number of bits needed to write `12^n` in binary

The number of bits to write an integer `N` in binary is `floor(lg N) + 1`. So

```
lg(12^n) + 1 = n lg 12 + 1 = Theta(n)
```

**Answer: `Theta(n)`.**

**Why this problem exists.** It is the input-size point from 22.11 in disguise. The *value* `12^n` is exponential; the *number of bits to write it down* is linear. Confusing the two is what makes pseudo-polynomial algorithms look polynomial, and that distinction is the entire content of half of file 28.

### B3. A population doubles every year. Give an asymptotic bound on its size 100 years from now.

Starting from one billion, the answer is `10^9 * 2^100`. That is a specific, enormous, **fixed number**. It does not depend on `n`, or on anything else that grows.

**Answer: `Theta(1)`.**

**The point.** Asymptotic notation describes how a quantity behaves as some variable goes to infinity. If nothing is going to infinity, every answer is `Theta(1)`, no matter how large the constant. `10^9 * 2^100 = Theta(1)` is the same joke as `10^85 = O(1)` in 22.1, and the reflex the question is testing is *identify the variable before answering*. If a problem gives you a fixed horizon, there is no variable, and the answer is a constant.

### B4. `sum_{i=1}^{n} log(n/i)`

Split the logarithm and pull the constant out:

```
sum_{i=1}^{n} log(n/i) = sum_{i=1}^{n} (log n - log i)
                       = n log n - sum_{i=1}^{n} log i
                       = n log n - log(n!)
```

Now use Stirling (21.6), in the form that matters:

```
ln(n!) = n ln n - n + O(log n)
```

so, working in base `e` for cleanliness and converting at the end,

```
sum = n ln n - (n ln n - n + O(log n)) = n - O(log n) = Theta(n)
```

**Answer: `Theta(n)`.**

**The sanity check** that catches an algebra slip: the terms `log(n/i)` run from `log n` down to `log 1 = 0`, and the average term is a constant (most of the `i` values are within a constant factor of `n`, and for those `log(n/i)` is `O(1)`). `n` terms with constant average gives `Theta(n)`, which agrees.

**Why the crude bound is not enough.** Bounding every term by `log n` gives `O(n log n)`, which is true and loose. The question asked for `Theta`, so the cancellation is compulsory.

---

## 29.4 Set C: ordering functions by growth

The full-length version of this exercise is the single best hour you can spend on asymptotics, because everything that can go wrong with the notation goes wrong somewhere in the list.

### The five moves

**1. Take logs.** `log` is strictly increasing, so `log f = o(log g)` implies `f = o(g)`. Use it on anything with an exponent. **The converse fails**: `log f = Theta(log g)` does *not* give `f = Theta(g)`, since `n` and `n^2` have logs within a constant factor. So logs prove strict separations, never ties.

**2. The swap identity.** `a^(lg b) = b^(lg a)`. It turns `4^(lg n)` into `n^(lg 4) = n^2` and `n^(lg lg n)` into `(lg n)^(lg n)`.

**3. Watch for disguised constants.** `n^(c/lg n) = 2^c`. Anything whose log is bounded is `Theta(1)`.

**4. Bounded oscillation is `Theta(1)`.** `sin(n) + 3` lives in `[2,4]` forever. It has no limit, so the limit method of 22.5 does not apply, but the definition does: it is between two positive constants, so it is `Theta(1)`. Mentioning that the limit does not exist and the definition still settles it is exactly the kind of remark that earns a mark.

**5. Know the two slow functions cold.** `lg* n` grows slower than `lg lg lg n`, and it absorbs towers: `lg*(2^n) = 1 + lg* n` and `lg*(lg n) = lg* n - 1`, both `Theta(lg* n)`. Any fixed number of `lg`s applied inside a `lg*` changes it by a constant.

### The worked list

Order these 28 functions from smallest to largest, grouping ties.

```
sin(n) + 3        n^(2/lg n)        lg*(2^n)          lg*(lg lg n)
lg(lg^3 n)        7 + lg lg n       (lg n)^(1/3)      sum_{i=1}^{n} 1/i
ceil(lg n)        lg(n!)/n          (lg n)^50         n^(2/lg lg n)
n^(1/99)          n                 3^(log_3 n)       n lg^2 n
(sqrt n)^3        9^(log_3 n)       sum_{i=1}^{n} i   (n-7)^2.5
sum_{i=1}^{n} i^2 (lg* n)^(lg n)    (lg n)^(lg n)     n^(lg lg n)
n^(sqrt n)        1.001^n           2^n               n!
```

Functions on the same line are `Theta` of one another. Each line is `o` of the line below.

```
 1.  sin(n) + 3,  n^(2/lg n)                       Theta(1)
 2.  lg*(2^n),  lg*(lg lg n)                       Theta(lg* n)
 3.  lg(lg^3 n),  7 + lg lg n                      Theta(lg lg n)
 4.  (lg n)^(1/3)
 5.  sum 1/i,  ceil(lg n),  lg(n!)/n               Theta(lg n)
 6.  (lg n)^50
 7.  n^(2/lg lg n)
 8.  n^(1/99)
 9.  n,  3^(log_3 n)                               Theta(n)
10.  n lg^2 n
11.  (sqrt n)^3                                    Theta(n^1.5)
12.  9^(log_3 n),  sum i                           Theta(n^2)
13.  (n-7)^2.5
14.  sum i^2                                       Theta(n^3)
15.  (lg* n)^(lg n)
16.  (lg n)^(lg n),  n^(lg lg n)
17.  n^(sqrt n)
18.  1.001^n
19.  2^n
20.  n!
```

### Line by line, why

**Line 1.** `sin(n) + 3` is bounded in `[2,4]`, so `Theta(1)` by move 4. `n^(2/lg n) = 2^(2 lg n / lg n) = 2^2 = 4`, a constant by move 3. Two functions that look nothing alike and are the same size.

**Line 2.** `lg*(2^n) = 1 + lg* n` and `lg*(lg lg n) = lg* n - 2`, both `Theta(lg* n)` by move 5.

**Line 3.** `lg(lg^3 n) = lg((lg n)^3) = 3 lg lg n`. And `7 + lg lg n` differs by an additive constant. Both `Theta(lg lg n)`.

**Line 4.** `(lg n)^(1/3)` beats `lg lg n`, because taking logs gives `(1/3) lg lg n` versus `lg lg lg n`, and the first is larger. Any positive power of `lg n` beats any number of stacked logs, the same way any positive power of `n` beats any power of `lg n`.

**Line 5.** `sum_{i=1}^{n} 1/i = H_n = Theta(lg n)` (21.6). `ceil(lg n) = Theta(lg n)`, since the ceiling changes it by less than 1. And `lg(n!)/n = Theta(n lg n)/n = Theta(lg n)` using `lg(n!) = Theta(n lg n)` from 22.12. Three different-looking routes to the same place.

**Line 6.** `(lg n)^50` is polylogarithmic, above every fixed power of `lg n` below 50 and below the next entry.

**Line 7.** `n^(2/lg lg n)`. Take logs: `2 lg n / lg lg n`. Compare against polylog, whose log is `c lg lg n`: since `lg n / lg lg n` beats `c lg lg n` for every constant `c`, this is **larger than every polylog**. Compare against `n^eps`, whose log is `eps lg n`: since `2/lg lg n -> 0`, this is **smaller than every polynomial**. It sits strictly between the two families. Such functions are called *quasi-polynomial*, and the list contains one precisely to check you do not assume everything is either polylog or polynomial.

**Line 8.** `n^(1/99)` is a genuine polynomial, however small the exponent, so it beats everything above it.

**Line 9.** `3^(log_3 n) = n` by the definition of a logarithm. Do not overthink it.

**Line 10.** `n lg^2 n` is above `n` and below every `n^(1+eps)`, since `lg^2 n = o(n^eps)`.

**Line 11.** `(sqrt n)^3 = n^1.5`.

**Line 12.** `9^(log_3 n)`: use the swap identity, or note `9 = 3^2` so `9^(log_3 n) = 3^(2 log_3 n) = n^2`. And `sum_{i=1}^{n} i = n(n+1)/2 = Theta(n^2)`.

**Line 13.** `(n-7)^2.5 = Theta(n^2.5)`, because subtracting a constant inside a fixed power changes the value by a constant factor for large `n`.

**Line 14.** `sum_{i=1}^{n} i^2 = n(n+1)(2n+1)/6 = Theta(n^3)`.

**Line 15.** `(lg* n)^(lg n)`. Take logs: `lg n * lg lg* n`. Compare against any polynomial `n^c`, whose log is `c lg n`. Since `lg lg* n -> infinity`, however slowly, `lg n * lg lg* n` eventually exceeds `c lg n` for every constant `c`. So this function is **above every polynomial**, despite being built from the slowest-growing function in the list. That inversion is the whole point of the entry: `lg* n` is tiny, but `lg n` copies of it multiplied together is not.

**Line 16.** `(lg n)^(lg n) = 2^(lg lg n * lg n) = n^(lg lg n)` by the swap identity, so the two entries are literally the same function written two ways, hence `Theta` of each other. Their common log is `lg n * lg lg n`, which beats line 15's `lg n * lg lg* n` because `lg lg n` dominates `lg lg* n`.

**Line 17.** `n^(sqrt n)` has log `sqrt n * lg n`, which beats `lg n * lg lg n` because `sqrt n` beats `lg lg n` outright.

**Line 18.** `1.001^n` has log `n lg(1.001) = Theta(n)`, and `n` beats `sqrt n lg n`. This is the entry that catches people: a base barely above 1 still beats `n^(sqrt n)`, because exponential beats everything sub-exponential eventually, and "eventually" is the only word in the definition.

**Line 19.** `2^n` over `1.001^n`: the ratio `(2/1.001)^n -> infinity`. Two exponentials with different bases are never `Theta` of each other.

**Line 20.** `n!` over `2^n`: the ratio goes to infinity (22.6). `n!` is roughly `(n/e)^n`, whose log is `n lg n`, against `n` for `2^n`.

### The three answers that lose marks here

- Writing `n` and `n^2` on the same line because their logs agree. Move 1's converse does not hold.
- Declaring `sin(n) + 3` incomparable because it has no limit. It is bounded, therefore `Theta(1)`, and the definition never mentioned limits.
- Putting `(lg* n)^(lg n)` down among the logarithms because it is "built from `lg*`". Check the log of the whole expression, not the mood of its parts.

---

## 29.5 Set D: writing a recurrence from a counting problem

You are given a combinatorial object and asked for a recurrence counting how many there are. You are usually **not** asked to solve it, and solving it when it was not asked for wastes time you need elsewhere.

### The method

1. Find **one decision** that every object in the set has to make. Usually the leftmost piece, the bottom item, the first character.
2. Enumerate the possible values of that decision. They have to be **exhaustive** (every object makes one of them) and **disjoint** (no object makes two), or you will over- or under-count.
3. For each value, the rest of the object is a smaller instance of the same problem. Write down its size.
4. Add the cases. Multiply only when two independent choices are made at once.
5. **State every base case**, and state enough of them: a recurrence reaching back `k` steps needs `k` base cases.

Step 5 is where marks are lost most often, and it costs one line.

### D1. Tiling a 2-by-n strip with dominoes

> A `2 x n` rectangle is to be covered exactly by `n` dominoes, each `1 x 2`, placed either horizontally or vertically. Write a recurrence for the number of coverings, `T(n)`.

**The decision: what covers the leftmost column?** Every tiling covers the two squares of column 1 somehow, and there are exactly two ways:

- One **vertical** domino fills the column. What remains is a `2 x (n-1)` rectangle: `T(n-1)` ways.
- Two **horizontal** dominoes, stacked, cover the top and bottom of columns 1 and 2. What remains is a `2 x (n-2)` rectangle: `T(n-2)` ways.

Nothing else can reach column 1: a single horizontal domino covering only one square of the column would leave the other square unreachable, since its only remaining neighbour is below or above it in the same column and that is the vertical case. The two cases are disjoint, because the top-left square is covered by a vertical piece in one and a horizontal piece in the other.

```
T(n) = T(n-1) + T(n-2)        for n >= 3
T(1) = 1                       one vertical domino
T(2) = 2                       two vertical, or two horizontal
```

That is the Fibonacci recurrence, so `T(n) = F(n+1)` and `T(n) = Theta(phi^n)`, though the question did not ask.

**Why `T(1) = 1` and `T(2) = 2` are both needed:** the recurrence reaches back two steps, so one base case is not enough to start it.

### D2. Stacking plates of two thicknesses

> You have an unlimited supply of red, blue, and green plates. Red and blue are 1 unit thick; green is 3 units thick. Write a recurrence counting the colour orderings of a stack of total thickness exactly `n`.

**The decision: what is the bottom plate?** Exactly three cases, and they are disjoint because a stack has one bottom plate of one colour:

- Red, thickness 1, leaving thickness `n-1` to fill: `T(n-1)` orderings.
- Blue, thickness 1, likewise `T(n-1)`.
- Green, thickness 3, leaving `n-3`: `T(n-3)`.

```
T(n) = 2 T(n-1) + T(n-3)      for n >= 3
T(0) = 1                       the empty stack, exactly one way
T(1) = 2                       red or blue
T(2) = 4                       two independent choices of 1-unit plate
```

**Three base cases**, because the recurrence reaches back three. And `T(0) = 1`, not 0: there is exactly one way to build nothing, which is to build nothing. Setting `T(0) = 0` silently kills every stack that ends with a green plate at the top, and is the most common error on this type.

**A check worth doing.** `T(3)` should be `2 T(2) + T(0) = 8 + 1 = 9`. By hand: `2^3 = 8` stacks of three 1-unit plates, plus one all-green stack. Nine. Verifying one small case by hand catches a wrong base case immediately, and takes fifteen seconds.

### D3. A variant to attempt yourself

> Same plates, but now green plates may not be adjacent to each other. Write a recurrence.

*Answer.* Condition on the bottom plate again. The trouble is the green case: after placing a green plate you may not place another one directly on top, so "the rest of the stack" is no longer an unconstrained instance of the same problem, and a single-variable recurrence cannot express it.

The fix is the standard one from LIS in 25.5: **add a parameter recording the constraint.** Let `T(n, 0)` be the number of stacks of thickness `n` whose bottom plate is not green, `T(n, 1)` those whose bottom plate is green:

```
T(n, 0) = 2 ( T(n-1, 0) + T(n-1, 1) )
T(n, 1) = T(n-3, 0)                        the plate above a green one cannot be green
answer  = T(n, 0) + T(n, 1)
```

with `T(0,0) = 1`, `T(0,1) = 0`, and both zero for negative `n`. **When a constraint refers to a neighbouring choice, put the neighbouring choice in the state.** That is the same move as `LIS(prev, start)` and the same move as `MIS(v, bit)` for independent sets on trees, and recognizing it is worth more than this particular answer.

---

## 29.6 Set E: bounding recurrences by level sums

The instruction "state the level sum" is an instruction to do the tree method (23.5) explicitly rather than quote the master theorem. Write the level sum, take the ratio of consecutive levels, and read off which of the three cases you are in.

### The mechanical procedure

For `T(n) = a T(n/b) + f(n)`:

```
level i has a^i subproblems of size n/b^i
level sum  L_i = a^i * f(n / b^i)
ratio      L_{i+1} / L_i

ratio < 1 (bounded away)  ->  decreasing, ROOT dominates    ->  T(n) = Theta(f(n))
ratio = 1                 ->  every level equal             ->  T(n) = Theta(f(n) * log_b n)
ratio > 1 (bounded away)  ->  increasing, LEAVES dominate   ->  T(n) = Theta(number of leaves)
                                                                 = Theta(n^(log_b a))
```

The number of leaves is `a^(log_b n) = n^(log_b a)`, which is worth re-deriving once and then memorizing.

### E1. `T(n) = 4 T(n/2) + n`

```
L_i = 4^i * (n / 2^i) = n * 2^i
```

Increasing by a factor of 2 per level, so the leaves dominate. Leaves: `n^(log_2 4) = n^2`.

**`T(n) = Theta(n^2)`.**

### E2. `T(n) = 3 T(n/2) + n^(3/2)`

```
L_i = 3^i * (n / 2^i)^(3/2) = n^(3/2) * (3 / 2^(3/2))^i
```

`2^(3/2) = 2.828`, so the ratio is `3/2.828 = 1.06 > 1`. Increasing, leaves dominate. Leaves: `n^(log_2 3) = n^1.585`.

**`T(n) = Theta(n^(lg 3))`, about `n^1.585`.**

Note how close this was: the ratio is only 6 percent above 1, and the answer `n^1.585` is only slightly above the root cost `n^1.5`. Close cases are exactly why you compute the ratio instead of eyeballing it.

### E3. `T(n) = 9 T(n/3) + n^2`

```
L_i = 9^i * (n / 3^i)^2 = 9^i * n^2 / 9^i = n^2
```

Every level costs the same. The depth is `log_3 n`.

**`T(n) = Theta(n^2 log n)`.**

### E4. `T(n) = 5 T(n/3) + n^2`

```
L_i = 5^i * (n / 3^i)^2 = n^2 * (5/9)^i
```

Ratio `5/9 < 1`, so the level sums die off geometrically and the root carries the whole cost. The root alone costs `n^2`, which is also the lower bound, since level 0 is part of the total.

**`T(n) = Theta(n^2)`.**

**E1 to E4 are the complete set of cases** for the shape `a T(n/b) + n^c`, and it is worth seeing them side by side once, because which one you are in is decided entirely by the ratio `a / b^c`:

| Recurrence | `a / b^c` | Level sums | Dominated by | Answer |
|---|---|---|---|---|
| E1, `4T(n/2) + n` | `4/2 = 2` | increasing | leaves | `Theta(n^2)` |
| E2, `3T(n/2) + n^1.5` | `3/2.83 = 1.06` | increasing | leaves | `Theta(n^(lg 3))` |
| E3, `9T(n/3) + n^2` | `9/9 = 1` | all equal | every level | `Theta(n^2 log n)` |
| E4, `5T(n/3) + n^2` | `5/9 = 0.56` | decreasing | root | `Theta(n^2)` |

Note E3 and E4 differ only in `a`, 9 against 5, and that single change moves the answer by a `log n` factor. **Compute the ratio; never guess from the shape of `f(n)`.**

### E5. `T(n) = T(n/4) + T(n/6) + n`

Unequal splits, so the master theorem does not apply. Use the level-ratio lemma from 23.11: for `T(n) = T(an) + T(bn) + n`, consecutive level sums satisfy `L_{i+1} = (a+b) L_i`. Here

```
a + b = 1/4 + 1/6 = 5/12 < 1
```

Decreasing geometric, so the root dominates, and the root alone costs `n`, which is also the lower bound.

**`T(n) = Theta(n)`.**

### E6. `T(n) = T(n/7) + T(n/11) + sqrt(n)`

Same shape, but the combine cost is `sqrt(n)`, not `n`, so the fractions have to be raised to the matching power before they are summed. A subproblem of size `m` hands its children

```
sqrt(m/7) + sqrt(m/11) = sqrt(m) ( 7^(-1/2) + 11^(-1/2) )
```

and `1/sqrt 7 + 1/sqrt 11 = 0.378 + 0.302 = 0.680 < 1`. Decreasing geometric, root dominates, root costs `sqrt(n)`.

**`T(n) = Theta(sqrt n)`.**

**The trap this one sets:** summing `1/7 + 1/11` instead of `1/sqrt 7 + 1/sqrt 11`. The comparison has to be between the *costs*, not the sizes. Here both sums are below 1 so the answer survives the error, which is precisely why the habit is dangerous.

### E7. `T(n) = T(sqrt n) + 3`

Every level costs 3, so the answer is `3 * depth` and the only question is the depth. After `i` levels the argument is `n^(1/2^i)`. It reaches a constant `c` when

```
n^(1/2^i) = c   =>   (1/2^i) lg n = lg c   =>   lg n = 2^i lg c
                =>   lg lg n = i + lg lg c   =>   i = lg lg n - O(1)
```

**`T(n) = Theta(lg lg n)`.**

**The move to remember:** *how many square roots until constant* is `lg lg n`, the same way *how many halvings until constant* is `lg n`. Alternatively, substitute `m = lg n`, which turns `T(n) = T(sqrt n) + 3` into `S(m) = S(m/2) + 3`, immediately `Theta(lg m) = Theta(lg lg n)`. That is the change of variables in 23.9, and it is the faster route once you trust it.

### E8. `T(n) = 2 T(sqrt n) + lg n`

Same substitution, `m = lg n`, so `S(m) = 2 S(m/2) + m`, which is the mergesort recurrence: `Theta(m lg m)`.

**`T(n) = Theta(lg n * lg lg n)`.**

### E9. `T(n) = T(lg n) + lg n`

Now the argument collapses logarithmically, so the costs going down the tree are

```
lg n,  lg lg n,  lg lg lg n,  ...
```

and the number of terms is `lg* n` by definition. The first term is `lg n`; every later term is at most `lg lg n`; so the tail is at most `lg* n * lg lg n`, which is `o(lg n)` because `lg* n` grows slower than any iterated log. The first term therefore swallows the entire rest of the tree.

**`T(n) = Theta(lg n)`.**

**The general shape:** when the level costs shrink *faster* than geometrically, the root is not merely dominant, it is essentially the whole answer. Bounding the tail crudely and showing it is `o(root)` is the standard way to write this, and it is much easier than summing the tail exactly.

---

## 29.7 Set F: divide-and-conquer design

Now the problems stop being calculations. You are handed a task and a target running time, and the target is the hint: `O(n log n)` with nothing sorted in the statement almost always means `2T(n/2) + O(n)`, and `O(log n)` means you are throwing away a constant fraction per step.

**What a full-credit answer contains**, in this order:

1. The recursive structure, in words: what you split, and what you recurse on.
2. The combine step, in enough detail to implement.
3. **Why the combine step is correct.** This is the part being graded. It is almost always a lemma of the form "anything the recursion missed has to look like *this*".
4. The recurrence and its solution.

### F1. Items that appear more than `n/3` times

> `A[1..n]` holds items you can only compare for **equality**, in `O(1)` time. There is no order on them, so `A[i] < A[j]` is not a question you may ask. Find every item that appears more than `n/3` times, in `O(n log n)`.

**First, how many answers can there be?** At most two: three items each appearing more than `n/3` times would need more than `n` slots. Bounding the size of the output is the observation that makes the whole approach work, so say it first.

**The key lemma.** If `x` appears more than `n/3` times in `A`, and `A` is split into halves `L` and `R`, then `x` appears more than `|L|/3` times in `L` **or** more than `|R|/3` times in `R`.

*Proof.* Contrapositive. If `x` appears at most `|L|/3` times in `L` and at most `|R|/3` times in `R`, then it appears at most `(|L| + |R|)/3 = n/3` times in total, contradicting the assumption. QED

That lemma is the entire algorithm: it says **the recursion cannot lose a heavy item**, so the candidates from the two halves are guaranteed to include every real answer.

**The algorithm.**

```
FREQUENT(A[1..n])
1  if n is small (say n <= 3): return the items of A that occur > n/3 times
2  split A into halves L and R
3  C = FREQUENT(L)  union  FREQUENT(R)            # at most 4 candidates
4  for each c in C
5      count occurrences of c in A by one linear scan using equality tests
6  return those c with count > n/3
```

**Correctness.** By the lemma, every item appearing more than `n/3` times in `A` is returned by at least one recursive call, so it is in `C`. Line 5 then verifies each candidate against the true threshold, so nothing false survives. Both directions done.

**Running time.** `|C| <= 4` because each half returns at most 2 candidates, so line 4's loop runs a constant number of times and each iteration is one `O(n)` scan. Hence

```
T(n) = 2 T(n/2) + O(n) = O(n log n)
```

**The two things graders look for.** That you bounded the candidate set by a constant (otherwise line 4 is not linear), and that you proved the lemma rather than asserting it. Note also that only equality tests were used, which the problem insisted on: no sorting, no hashing on order, no median.

### F2. The outline of a set of boxes

> Each box `i` is an axis-aligned rectangle sitting on the x-axis, given by `(L_i, R_i, H_i)`: left edge, right edge, height. The **outline** of `n` boxes is the boundary of their union, which is a sequence of horizontal segments. Output the left endpoint of each segment, in order of `x`. Assume all x-coordinates are distinct. Give an efficient divide-and-conquer algorithm.

An outline is just a **step function** of `x`: the height at any point is the maximum height of the boxes covering it, and the output is the list of points where that maximum changes.

**The recursion.** Split the boxes into two halves **by index, not by position** (they can overlap arbitrarily, so there is no clean geometric split). Recursively compute the outline of each half. Then **merge two step functions by taking their pointwise maximum**.

**The merge, which is the whole problem.**

```
MERGE-OUTLINES(P, Q)                # P, Q are lists of (x, height), x-increasing
1  i = j = 1;  hP = hQ = 0;  out = empty
2  while both lists have entries left
3      take whichever of P[i], Q[j] has the smaller x;  call it (x, h)
4      update the corresponding current height (hP or hQ) to h, and advance that index
5      cur = max(hP, hQ)
6      if cur differs from the last height appended to out
7          append (x, cur) to out
8  append the remainder of the unfinished list, applying the same rule
9  return out
```

**Why line 6 is compulsory.** Without it you emit a point at every input x-coordinate, including the ones where the taller box is unchanged and the maximum does not move. That produces a technically-correct-looking list with redundant entries, and a list of segment starts that do not start segments is a wrong answer. The same suppression removes the artefacts where a shorter box begins or ends underneath a taller one.

**Why the pointwise maximum is right.** A point is covered by the union of all boxes iff it is covered by the union of the first half or of the second, and the height of the union at `x` is the max over all covering boxes, which splits over the two halves as `max(max over half 1, max over half 2)`. Maximum is associative, so the recursion is sound.

**Base case.** One box `(L, R, H)` has outline `[(L, H), (R, 0)]`.

**Running time.** Each merge is a single linear pass over two lists whose combined length is `O(n)`, since an outline of `k` boxes has `O(k)` segments.

```
T(n) = 2 T(n/2) + O(n) = O(n log n)
```

**The pattern worth extracting.** This is mergesort with `max` instead of `min`, over step functions instead of numbers. Whenever the quantity you want is an **associative combination of the inputs**, divide and conquer applies mechanically, and the only real work is implementing the combine in linear time.

### F3. Counting inversions, and the general trick

> An **inversion** in `A[1..n]` is a pair `i < j` with `A[i] > A[j]`. A sorted array has 0; a reversed array has `C(n,2)`. Modify mergesort to count inversions in `O(n log n)`.

Worked in full at 24.3, so here is only the idea and the reason it generalizes.

Split into halves. Every inversion is entirely in the left half, entirely in the right half, or **split** between them. The first two are counted by the recursive calls. For the split ones: during the merge, at the moment you take an element from the **right** half while `k` elements remain unconsumed in the left half, that element is smaller than all `k` of them, and each is an inversion. Add `k`.

```
count = countLeft + countRight + countSplit
T(n) = 2 T(n/2) + O(n) = O(n log n)
```

**The general trick, which is the transferable part:** *make the recursion return more than the answer.* Mergesort already sorts; we asked it to also report a count, and the count came for free because the merge already compares exactly the pairs that matter. The same move appears in closest-pair (24.11), where the recursion returns its points in y-order so the combine drops from `n log n` to `n`. When a combine step looks too expensive, ask what the recursive calls could hand back that would make it cheap.

### F4. The k-th smallest in the union of two sorted arrays

> `A[1..n]` and `B[1..m]` are each sorted, and all `n + m` values are distinct. Find the k-th smallest value of their union in `O(log(n + m))`.

`O(log(n+m))` rules out merging, which is `O(n+m)`. It means each step must discard a **constant fraction of `k`**.

**The idea.** Look `k/2` deep into each array and compare what you find. Whichever is smaller, everything up to and including it is too small to be the answer, and can be thrown away.

```
SELECT(A, B, k)
1  if A is empty:  return B[k]
2  if B is empty:  return A[k]
3  if k == 1:      return min(A[1], B[1])
4  i = min(|A|, floor(k/2))
5  j = min(|B|, k - i)
6  if A[i] < B[j]
7      return SELECT(A[i+1 ..], B, k - i)          # discard A[1..i]
8  else
9      return SELECT(A, B[j+1 ..], k - j)          # discard B[1..j]
```

**Why discarding is safe**, which is the only part being graded. Suppose `A[i] < B[j]`. How many elements of the union can be less than or equal to `A[i]`? At most `i` from `A` (its own prefix) and at most `j - 1` from `B` (everything before `B[j]`, since `B[j] > A[i]` and `B` is sorted). So the rank of `A[i]` in the union is at most `i + j - 1 <= k - 1 < k`. Every element of `A[1..i]` has rank at most that, so **none of them is the k-th**, and all `i` of them are below it. Discard them and reduce `k` by `i`. The symmetric argument covers the other branch.

**Running time.** Lines 4 and 5 ensure `i + j = k` whenever both arrays are long enough, so one of them is at least `k/2` and the discarded prefix has at least `floor(k/2)` elements in the common case. Thus `k` at least halves each call:

```
T(k) = T(k/2) + O(1) = O(log k) = O(log(n + m))
```

**Two details that cost marks if skipped.** The `min(|A|, ...)` clamps in lines 4 and 5, without which you index off the end of the shorter array. And the `k == 1` base case, without which the recursion can stall with `i = 0` and make no progress.

**If the analysis gives `O(log n + log m)`**, that is fine and equal: `log n + log m = log(nm) <= 2 log(n+m) = O(log(n+m))`.

---

## 29.8 The rubric, stated plainly

Across all six sets, marks come off for the same handful of things.

| Lost mark | Fix |
|---|---|
| `O` given where `Theta` was asked | Always give the lower bound too, even if it is one line |
| A recurrence with no base case | One line, and enough of them for how far back the recurrence reaches |
| A combine step asserted, not proved | State the lemma: "anything the recursion missed must look like this" |
| An algorithm with no running time | Recurrence plus its solution, every time |
| Cases that overlap or miss | Say explicitly that the cases are exhaustive and disjoint |
| "Clearly" or "obviously" doing real work | If it were clear you would not need the word |
| Answering in terms of the wrong variable | Identify what is growing before writing any bound |

And the habit that prevents most of them: **check one small case by hand.** A recurrence, an ordering, a combine step, and a base case all reveal their errors at `n = 3` in about fifteen seconds.

---

Next: nothing. This is the end of the track. Go back to [21 — The Course Track: Orientation](21-course-track-orientation.md) for the study plan, or start over at [22](22-asymptotics-from-zero.md) and see how much less it takes the second time.
