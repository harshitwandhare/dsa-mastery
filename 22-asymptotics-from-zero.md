# 22 — Asymptotics from Zero

**Assumes nothing.** If you have never seen a Big-O in your life, start here. If you have seen them but keep guessing on true/false quiz questions, that is a symptom of learning the *notation* without the *definition*, and this file fixes it.

Read [21 — The Course Track: Orientation](21-course-track-orientation.md) first for the proof conventions used throughout.

---

## 22.1 Why we throw information away

Suppose you write a sorting function and want to answer "how fast is this?"

You could time it. But the number you get depends on your CPU, your language, whether the browser was eating RAM, and how big the input was. None of that says anything durable about the *algorithm*. Run it on a laptop from 2012 and a server from 2026 and you get two different answers to what should be one question.

So we make two moves.

**Move one: count operations, not seconds.** Pick a machine model, declare that a fixed set of primitive operations each cost 1 unit, and count units. This is the **RAM model** (random access machine): arithmetic, comparison, assignment, array indexing, and control flow each cost O(1), and memory access is O(1) regardless of address. It is a lie, caches exist, but it is a *productive* lie: conclusions drawn in the RAM model almost always survive contact with real hardware.

**Move two: care only about growth as the input gets large.** We deliberately discard constants and lower-order terms.

```
3n^2 + 500n + 9000    ->    n^2
```

That looks reckless. At n = 10 the constant 9000 dominates everything. But:

| n | 3n^2 | 500n | 9000 | 3n^2 share of total |
|---|---|---|---|---|
| 10 | 300 | 5,000 | 9,000 | 2% |
| 100 | 30,000 | 50,000 | 9,000 | 34% |
| 1,000 | 3,000,000 | 500,000 | 9,000 | 85% |
| 1,000,000 | 3 x 10^12 | 5 x 10^8 | 9,000 | 99.98% |

Past some point the n^2 term is the whole story. Asymptotic notation is a claim about **the far right end of the graph**, and it is silent about the left end. That is the deal you sign. In exchange you get a machine-independent, language-independent, implementation-independent answer to "does this scale".

Two justifications for dropping constants specifically:

1. **They are not stable.** A constant factor of 3 becomes 1.5 with a better compiler or 6 with a slower language. It is not a property of the algorithm.
2. **They lose to growth eventually, always.** A 1000n algorithm beats a n^2 algorithm for every n above 1000, and n is usually above 1000.

The honest caveat, which good courses state and bad ones do not: **constants sometimes decide the winner in practice.** Strassen's matrix multiply is asymptotically better than the naive method and is slower until the matrices are large. Insertion sort beats mergesort below roughly n = 30, which is why real sort libraries switch to it at small sizes. Asymptotics is the first question, not the only question.

---

## 22.2 The five notations as a comparison system

The cleanest mental model: the five asymptotic notations are exactly the five ways you can compare two numbers.

Let `a` and `b` be ordinary numbers, and `f` and `g` be functions from positive integers to non-negative reals.

| Comparing numbers | Comparing growth | In words |
|---|---|---|
| `a <= b` | `f = O(g)` | f grows **no faster than** g |
| `a >= b` | `f = Omega(g)` | f grows **no slower than** g |
| `a == b` | `f = Theta(g)` | f grows **at the same rate as** g |
| `a < b` | `f = o(g)` | f grows **strictly slower than** g |
| `a > b` | `f = omega(g)` | f grows **strictly faster than** g |

Read them out loud that way until it is automatic:

- **Big-O is a ceiling.** An upper bound.
- **Big-Omega is a floor.** A lower bound.
- **Theta is a sandwich.** Both at once. The tight, honest answer.
- **little-o and little-omega are the strict versions**, meaning the gap actually grows without limit rather than staying within a constant factor.

### The equals sign is a lie

We write `f = O(g)` but this is not equality. `O(g)` is a **set of functions**, and the correct statement is `f` is in `O(g)`. The `=` is historical abuse of notation that everyone including CLRS uses.

Two consequences you will be tested on:

- **It does not commute.** `n = O(n^2)` is true. `O(n^2) = n` is meaningless. Never write it reversed.
- **You cannot chain it like equality.** From `f = O(h)` and `g = O(h)` you may not conclude `f = g`. Both `n` and `n^2` are `O(n^3)` and they are not equal to each other.

Read `=` as **"is"**. `n is O(n^2)`. That single habit prevents most of the errors here.

---

## 22.3 The definitions, unpacked term by term

### Big-O

> `f(n) = O(g(n))` if there exist positive constants `c` and `n0` such that
> `0 <= f(n) <= c * g(n)` for all `n >= n0`.

Two constants, and each one is a specific license you are being granted.

**`c` is your license to ignore constant factors.** Without it, `3n^2 = O(n^2)` would be false, because `3n^2` is not `<= n^2`. With it, you pick `c = 3` and you are done.

**`n0` is your license to ignore small inputs.** Without it you would have to make the inequality hold at n = 1, n = 2, and every other tiny case where lower-order terms can dominate. With it you say "I only care about `n >= 100`" and everything below that is somebody else's problem.

Together: **past some point, and up to some scaling factor, g is a ceiling for f.**

Draw it. Plot `f(n)`. Plot `c * g(n)` for your chosen `c`. Find the x-coordinate past which the second curve is always above the first. That x-coordinate is `n0`. If such a `c` exists at all, you have a Big-O.

### Big-Omega

> `f(n) = Omega(g(n))` if there exist positive constants `c` and `n0` such that
> `0 <= c * g(n) <= f(n)` for all `n >= n0`.

The mirror image. Past some point, and up to some scaling factor, g is a **floor** for f.

### Theta

> `f(n) = Theta(g(n))` if there exist positive constants `c1`, `c2`, and `n0` such that
> `0 <= c1 * g(n) <= f(n) <= c2 * g(n)` for all `n >= n0`.

f is sandwiched between two scaled copies of g. Equivalently, and this is the version to use in proofs:

> `f = Theta(g)` **iff** `f = O(g)` **and** `f = Omega(g)`.

This is the strongest of the three claims, so it earns the most credit and takes the most work.

### little-o and little-omega

> `f(n) = o(g(n))` if for **every** positive constant `c` there exists `n0` such that
> `0 <= f(n) < c * g(n)` for all `n >= n0`.

Read the quantifier change carefully, because it is the entire difference. Big-O says *there exists some* `c` that works. little-o says *every* `c` works, including `c = 0.0000001`. That is only possible if `f` becomes negligible relative to `g`, so:

```
f = o(g)  means  lim (f/g) = 0
f = omega(g)  means  lim (f/g) = infinity
```

`n = o(n^2)` is true. `3n^2 = o(n^2)` is false, because `c = 1` fails. But `3n^2 = O(n^2)` is true. **Big-O permits equality of growth rates; little-o forbids it.**

### The relationships, summarized

```
f = Theta(g)   iff   f = O(g)  and  f = Omega(g)
f = o(g)       implies  f = O(g)      (but not conversely)
f = omega(g)   implies  f = Omega(g)  (but not conversely)
f = O(g)       iff   g = Omega(f)     <- the duality, worth remembering
f = o(g)       iff   g = omega(f)
f = Theta(g)   iff   g = Theta(f)     <- Theta is symmetric, the others are not
```

That fourth line is the one that gets tested. "f is bounded above by g" and "g is bounded below by f" are the same statement viewed from the two ends.

---

## 22.4 Proving a bound from the definition

The homework asks for this and the exam asks for this, so drill the mechanics.

### Example 1: prove `3n^2 + 500n + 9000 = O(n^2)`

We must exhibit specific `c` and `n0`.

For all `n >= 1` we have `n <= n^2` and `1 <= n^2`. Therefore:

```
3n^2 + 500n + 9000  <=  3n^2 + 500n^2 + 9000n^2  =  9503 n^2
```

Take `c = 9503` and `n0 = 1`. The definition is satisfied. QED

The constant is absurd and **nobody cares**. Big-O asks you to find *a* `c`, not the *best* `c`. This is why these proofs feel like cheating. They are supposed to.

The technique generalizes: **to prove a polynomial is O of its leading term, replace every lower power by the leading power and add the coefficients.**

### Example 2: prove the same function is `Omega(n^2)`

For all `n >= 0`, since `500n >= 0` and `9000 >= 0`:

```
3n^2 + 500n + 9000  >=  3n^2
```

Take `c = 3`, `n0 = 0`. QED

Lower bounds on polynomials are usually easier: **throw away the non-negative lower-order terms.**

### Example 3: therefore `Theta(n^2)`

Both bounds hold, so by the definition of Theta, `3n^2 + 500n + 9000 = Theta(n^2)`. With `c1 = 3`, `c2 = 9503`, `n0 = 1`. QED

### Example 4: prove `n^2 != O(n)`

To disprove an existential you must argue for **all** candidate constants. Proof by contradiction.

Suppose `n^2 = O(n)`. Then there exist `c > 0` and `n0` with `n^2 <= c*n` for all `n >= n0`. Dividing both sides by `n` (positive, so the inequality direction is preserved) gives `n <= c` for all `n >= n0`. But `c` is a fixed constant, and taking `n = max(n0, c+1)` gives `n > c`, a contradiction. Therefore no such `c` exists. QED

**Study that shape.** Every "prove this is *not* O of that" proof is: assume the constant exists, derive that a variable is bounded by a constant, take the variable bigger than the constant, contradiction.

### Example 5: a trap worth doing once

Prove or disprove: `2^(n+1) = O(2^n)`.

**True.** `2^(n+1) = 2 * 2^n`, so `c = 2` and `n0 = 0` work. A constant in the *exponent* becomes a constant *factor*, and constant factors are free.

Now: `2^(2n) = O(2^n)`?

**False.** `2^(2n) = (2^n)^2`, so the ratio is `2^n`, which grows without bound. By the same contradiction shape as Example 4, no constant `c` can dominate `2^n`. **A multiplier in the exponent is not a constant factor.** This distinction shows up in file 28 when you compare `2^n` to `2^(n/2)`.

---

## 22.5 The limit method: the shortcut you will actually use

Grinding out constants is slow. Limits do the same work in one line, and they are accepted on homework provided you state which case of the rule you are in.

Compute:

```
L = lim_{n -> infinity} f(n) / g(n)
```

and read the answer off this table.

| L | Conclusion | Intuition |
|---|---|---|
| `0` | `f = o(g)`, hence `f = O(g)` but **not** `Omega(g)` | f is dwarfed by g |
| `0 < L < infinity` | `f = Theta(g)` | same growth, differ by the constant factor L |
| `infinity` | `f = omega(g)`, hence `f = Omega(g)` but **not** `O(g)` | f dwarfs g |
| does not exist, but `f/g` stays bounded | still `f = O(g)` | O only needs a ceiling, not convergence |

That last row matters more than it looks, and it is where the definition and the shortcut come apart.

Take `f(n) = n(2 + sin n)` and `g(n) = n`. The ratio oscillates between 1 and 3 forever, so `lim f/g` does not exist. Yet `f = O(g)` holds perfectly well with `c = 3`, and `f = Omega(g)` holds with `c = 1`, so in fact `f = Theta(g)`. **Boundedness is the real requirement. The limit is a convenient sufficient condition, not the definition.** If a limit fails to exist, fall back to the definition rather than concluding anything.

### The classic quiz question, decoded

> You are told that the limit of `f(n)/g(n)` as n goes to infinity is **at most** 10. You can conclude:
> (a) `f(n) = O(g(n))`  (b) `g(n) = O(f(n))`  (c) both  (d) neither

The wording is engineered. "At most 10" pins `L` into the interval `[0, 10]`.

**Finite,** so row one or row two of the table applies, and both give you `f = O(g)`. Statement (a) is true. Concretely: if `L <= 10`, then past some `n0` the ratio is below 11, so `f(n) <= 11 g(n)`, which is the definition with `c = 11`.

**But 0 is not excluded,** and `L = 0` is exactly the row where the reverse direction dies. Counterexample: `f(n) = n`, `g(n) = n^2`. Then `L = 0 <= 10`, the hypothesis holds. `f = O(g)` since `n <= n^2`. But `g = O(f)` would mean `n^2 <= c*n`, which we disproved in Example 4. So (b) is false, which kills (c) too. And since (a) is provably true, (d) is out.

**Answer: (a) only.**

The trap in one sentence: **a finite limit buys you O in one direction; you only get Theta when the limit is finite AND nonzero.** "At most 10" hands you finiteness while quietly withholding nonzero-ness. Had the question said "the limit is exactly 10", the answer flips to (c), because 10 is finite and positive so `f = Theta(g)`.

### L'Hopital, and when you need it

For ratios like `(log n) / n` where both go to infinity, differentiate top and bottom with respect to n treated as a real variable:

```
lim (ln n)/n  =  lim (1/n)/1  =  lim 1/n  =  0        so log n = o(n)
lim n/(2^n)   =  lim 1/(2^n ln 2)         =  0        so n = o(2^n)
```

Repeat as needed. `n^k / 2^n` needs k applications and lands at 0 every time, which proves **every polynomial is little-o of every exponential.**

---

## 22.6 The growth hierarchy

Memorize this ordering. Everything to the right eventually and permanently dominates everything to the left.

```
1  <  log log n  <  log n  <  (log n)^2  <  n^0.5  <  n  <  n log n
   <  n^2  <  n^3  <  n^k  <  2^n  <  3^n  <  n!  <  n^n
```

Names, since exam questions use them:

| Growth | Name | Feels like |
|---|---|---|
| `O(1)` | constant | hash lookup |
| `O(log n)` | logarithmic | binary search |
| `O(n)` | linear | one scan |
| `O(n log n)` | linearithmic | comparison sorting, the good sorts |
| `O(n^2)` | quadratic | all pairs |
| `O(n^3)` | cubic | naive matrix multiply |
| `O(n^k)`, k constant | polynomial | "tractable", the P in P vs NP |
| `O(2^n)` | exponential | all subsets |
| `O(n!)` | factorial | all permutations |

Facts worth internalizing because they are quiz fodder:

- **Log base is irrelevant.** `log_2 n` and `log_10 n` differ by a constant factor, so they are Theta of each other. Hence we write `O(log n)` with no base at all.
- **Any positive power of n beats any power of log n.** Even `n^0.0001` eventually overtakes `(log n)^100`. Logs are astonishingly slow.
- **Any exponential beats any polynomial.** Even `1.0001^n` eventually overtakes `n^1000`.
- **`n log n` is strictly between `n` and `n^2`.** Not "basically linear" and not "basically quadratic". This is why `Theta(n log n)` comparison sorting is a genuinely meaningful result.
- **`log(n!) = Theta(n log n)`.** Used in the sorting lower bound in file 24.
- **`2^n` and `n!` are not the same.** `n!` is much worse. `n! / 2^n` goes to infinity.

### Comparing two expressions fast

When an exam asks "is `f = O(g)`, `Omega(g)`, or `Theta(g)`?", the fastest reliable move is to **take logs of both** when they are products, powers, or exponentials.

Example: compare `n^(log n)` and `2^n`.

```
log(n^(log n)) = (log n)(log n) = (log n)^2
log(2^n)       = n
```

Since `(log n)^2 = o(n)`, the first log is smaller, so `n^(log n) = o(2^n)`.

This works because `log` is strictly increasing, so it preserves ordering. It converts multiplication into addition and exponentiation into multiplication, which turns hard comparisons into easy ones. Be careful: `log` preserves the *ordering* but not the *ratio*, so `log f = o(log g)` gives you `f = o(g)`, but `log f = Theta(log g)` does **not** give you `f = Theta(g)`. Counterexample: `f = n`, `g = n^2` have logs `log n` and `2 log n`, which are Theta of each other, while `f` and `g` are not.

---

## 22.7 Reading complexity off code

Most exam questions hand you code, not algebra. The rules are mechanical.

### Rule 1: constant work is O(1)

```python:static
x = a + b * c
arr[i] = arr[j]
if x > y:
    z = 1
```

A fixed number of primitive operations, independent of n. O(1).

Careful with what "primitive" means. `arr[i]` is O(1). But `arr.insert(0, x)` in Python is O(n), and `s1 + s2` for strings of length n is O(n). In pseudocode on an exam, assume only the RAM-model primitives are O(1) and say so if a step is more.

### Rule 2: sequential blocks add, so the biggest wins

```
BLOCK-A     # O(n)
BLOCK-B     # O(n^2)
# total: O(n + n^2) = O(n^2)
```

Addition inside asymptotics collapses to the max. `O(f + g) = O(max(f, g))`.

### Rule 3: nested loops multiply

```
for i = 1 to n           # n iterations
    for j = 1 to n       #   x n iterations
        constant work    #     x O(1)
# total: Theta(n^2)
```

### Rule 4: when the inner bound depends on the outer variable, sum it

This is the trap that separates the students who memorized "two loops means n^2" from the ones who understand.

```
for i = 1 to n
    for j = 1 to i        # <- i, not n
        constant work
```

The body runs `1 + 2 + 3 + ... + n = n(n+1)/2` times. That is still `Theta(n^2)`, but you have to *sum* it rather than pattern-match, and the next example shows why that matters:

```
for i = 1 to n
    for j = 1 to n/i      # <- n/i
        constant work
```

Total is `sum_{i=1}^{n} n/i = n * sum_{i=1}^{n} 1/i = n * H_n = Theta(n log n)`. Two nested loops, but **not** quadratic. The harmonic sum did the work.

### Rule 5: multiplicative shrinking gives logs

```
i = n
while i > 1
    i = i / 2
    constant work
```

The values are `n, n/2, n/4, ...` down to 1. The number of halvings is `log_2 n`, so this is `Theta(log n)`.

**The general principle: anything that repeatedly divides the problem size by a constant factor greater than 1 gives you a log.** And symmetrically, anything that repeatedly *multiplies* by a constant factor gives you a log:

```
i = 1
while i < n
    i = i * 2
```

Also `Theta(log n)`. Same series read backwards.

Contrast with subtraction:

```
i = n
while i > 0
    i = i - 1
```

That is `Theta(n)`. **Divide gives log, subtract gives linear.** Getting this backwards is a classic exam loss.

### Rule 6: a doubly-nested log is a real thing

```
for i = 1 to n
    j = 1
    while j < n
        j = j * 2
```

Outer is n, inner is log n, total `Theta(n log n)`. This is one of the few natural ways to get `n log n` from loops rather than from a recurrence.

### Worked walkthrough

```
MYSTERY(A, n)
1  total = 0
2  for i = 1 to n
3      j = 1
4      while j <= i
5          total = total + A[j]
6          j = j * 2
7  return total
```

Line 4 to 6: `j` takes values `1, 2, 4, ...` up to `i`, so the inner loop runs `floor(lg i) + 1` times. Total work:

```
sum_{i=1}^{n} (lg i + 1)  =  n + sum_{i=1}^{n} lg i  =  n + lg(n!)  =  n + Theta(n lg n)  =  Theta(n lg n)
```

Using `lg(n!) = Theta(n lg n)` from the toolkit. Answer: `Theta(n lg n)`.

---

## 22.8 The question everyone gets wrong: what Omega on a loop really means

Here is a true/false question of a kind that appears on quizzes constantly.

> An algorithm has two nested for loops, the outer ranging `i = 1 to n` and the inner ranging `j = 1 to n`. Inside the inner loop there is some **unknown** piece of code. You can conclude the running time must be `Omega(n^2)`.

Most students answer False, reasoning "we do not know the inner code, so we cannot conclude anything". That reasoning is wrong, and seeing why is worth more than the point.

**Answer: True.**

Ask which *direction* of bound is being requested. `Omega` is a **floor**. The loop scaffolding alone, ignoring the mystery body entirely, must execute its increment-and-test `n^2` times. The unknown body can only *add* work, since work is non-negative. So `n^2` is a guaranteed lower bound, and `Omega(n^2)` holds no matter what is inside.

Now notice the flip side, which is the actual lesson. Could you conclude `O(n^2)`? **No.** If the hidden body were itself an `O(n^3)` subroutine, the total is `n^5`. Could you conclude `Theta(n^2)`? Also no, since Theta requires the O.

> **Loop structure alone gives you lower bounds for free. It never gives you upper bounds.**

Instructors reuse this because students memorize "nested loops means n^2" as a Theta statement and never notice it is only half true.

The one caveat a very careful grader might raise: if the unknown code contains a `break` or a `return` that escapes the loops early, the `n^2` iterations do not all happen. Standard course convention treats "some unknown piece of code" as straight-line code inside the loop, and the intended answer is True. If you want to be bulletproof on an exam, write "assuming the inner code does not exit the loops early, True, because the loop control itself executes n^2 times regardless of the body."

---

## 22.9 Worst, best, and average case are a different axis

This is the second most common confusion after O-versus-Theta, and it is a confusion between two things that are completely independent.

- **O, Omega, Theta** describe **how a function grows**.
- **Best, worst, average case** describe **which function you chose to analyze**.

For a given algorithm and a given input size n, there are many possible inputs, each with its own operation count. That gives you a *set* of counts, and:

- `T_worst(n)` = the maximum over all inputs of size n
- `T_best(n)` = the minimum
- `T_avg(n)` = the expectation under some stated input distribution

Each of those is a function of n, and each can be bounded with any of the five notations.

So all of these are coherent, meaningful sentences:

- "Quicksort's worst case is `Theta(n^2)`."
- "Quicksort's best case is `Theta(n log n)`."
- "Quicksort's average case is `Theta(n log n)`."
- "Quicksort's worst case is `O(n^3)`." (True. Loose, but true.)
- "Quicksort is `Omega(n log n)` in every case." (True, since it must at least look at everything and sorting has that lower bound.)

And this is the sentence that means nothing: **"Quicksort is O(n log n)"** without saying which case. Say the case. Always.

A useful convention: when someone says "the running time of algorithm X is O(f)" with no qualifier, they usually mean the worst case, because worst case is the default guarantee. But in a course, write the qualifier down.

**Average case needs a stated distribution.** "Average case" is meaningless until you say average *over what*. Quicksort's `Theta(n log n)` average assumes all `n!` input orderings are equally likely. If your inputs are usually nearly sorted, that assumption is false and the average is worse. Randomized quicksort fixes this by moving the randomness from the input to the algorithm, which is a genuinely different guarantee: **expected** `Theta(n log n)` on *every* input, rather than average `Theta(n log n)` over a hoped-for input distribution.

---

## 22.10 Amortized analysis, briefly

A related idea that gets confused with average case. **Amortized** cost is the average cost per operation over a worst-case *sequence* of operations. No probability is involved.

The canonical example is a dynamic array that doubles when full. A single `append` is usually O(1), but the one that triggers a resize copies everything and costs `Theta(n)`. Is `append` O(n)?

Sum over n appends. Resizes happen at sizes 1, 2, 4, 8, ..., n, and the copy costs are `1 + 2 + 4 + ... + n < 2n`. That is a geometric series, dominated by its last term. All other appends cost O(1) each, so O(n) total. Grand total `O(n)` for n appends, hence **O(1) amortized per append**.

Three standard methods for proving amortized bounds, in increasing power:

- **Aggregate**: bound the total cost of the whole sequence, divide by the number of operations. What we just did.
- **Accounting**: charge each operation a fixed "amortized cost", let cheap operations bank the surplus as credit, prove the credit never goes negative. For the array: charge 3 per append, one pays for the write, two are banked to fund the future copy of that element and one older element.
- **Potential**: define a potential function `Phi` on the data structure state, define amortized cost as `actual + Phi(after) - Phi(before)`, prove `Phi` starts at 0 and never goes negative. The most flexible method and the one CLRS develops fully.

Say "amortized O(1), worst case O(n) for a single operation" and you have given the complete and correct answer.

---

## 22.11 Common mistakes, each with the fix

**Treating O as tight.** `n = O(n^2)` is completely true and completely useless. When asked for "the complexity", give the tightest bound you can defend, ideally Theta. Writing O when you could prove Theta is not wrong, but it reads as not having finished.

**Confusing O with worst case.** Covered in 22.9. They are orthogonal axes.

**Leaving constants or lower terms in.** `O(2n)` and `O(n^2 + n)` are not wrong, but reduce them. `O(n)` and `O(n^2)`.

**Writing `O(g) = f`.** Never. Read `=` as "is".

**Flipping the direction of a claim.** From "runs in `O(n^2)`" you cannot conclude it ever actually takes `n^2` time. From "runs in `Omega(n^2)`" you cannot conclude it ever finishes within `n^2`. Upper and lower bounds are separate claims and neither implies the other.

**Assuming `f = O(g)` or `g = O(f)` must hold.** Asymptotic comparison is a **partial** order, not a total one. Some pairs are incomparable. Classic example:

```
f(n) = n            if n is even,  n^2 if n is odd
g(n) = n^2          if n is even,  n   if n is odd
```

Neither dominates the other, in either direction, past any point. Real algorithms rarely look like this, but exam questions do.

**Ignoring the input-size definition.** "Size of the input" means the number of *bits* to write it down. For an array of n numbers we usually say the size is n and treat each number as O(1) bits, which is fine and standard. But for a problem whose input is a single number N, the input size is `log N`, not `N`. An algorithm that loops N times on input N is **exponential** in the input size. This distinction is invisible for most of the course and then becomes the entire point in file 28, where it is the difference between "polynomial" and "pseudo-polynomial".

**Dropping a term that is not actually lower-order.** `O(n + m)` for a graph with n vertices and m edges cannot be simplified to `O(n)` or `O(m)`. With two independent parameters, keep both. Writing `O(n)` for BFS is a real and common error; BFS is `O(n + m)`.

---

## 22.12 Practice set

Do these on paper before reading the answers. The whole file is worth less than actually attempting these.

1. Is `2^(n+1) = O(2^n)`?
2. Is `2^(2n) = O(2^n)`?
3. If `f = O(g)` and `g = O(h)`, is `f = O(h)`?
4. Is `n log n = Omega(n)`? Is it `Theta(n)`?
5. A loop runs `i = 1 to n`, and inside it a second loop runs `j = 1 to 1000`. Complexity?
6. Prove or disprove: `log(n!) = Theta(n log n)`.
7. Order these by growth: `n^2`, `2^n`, `n log n`, `n!`, `n^(1/2)`, `(log n)^3`, `n^(log log n)`.
8. Is `f + g = Theta(max(f, g))` for non-negative f, g?
9. Give functions f and g with `f = O(g)` but `lim f/g` not existing.
10. `T(n) = 3n^2 + 7n log n + 12`. Give the tightest Theta, with constants and n0.

### Answers

Do not read this until you have written your own attempt on paper.

1. **Yes.** `2^(n+1) = 2 * 2^n`, so `c = 2` works. A constant added in the exponent is a constant factor.

2. **No.** `2^(2n) = (2^n)^2`, so the ratio is `2^n`, unbounded. A constant multiplying the exponent is not a constant factor.

3. **Yes**, O is transitive. From `f <= c1 g` for `n >= n1` and `g <= c2 h` for `n >= n2`, we get `f <= c1 c2 h` for `n >= max(n1, n2)`. Take `c = c1 c2`.

4. `Omega(n)`: **yes**, since `n log n >= n` for `n >= 2`, so `c = 1`, `n0 = 2`. `Theta(n)`: **no**, since `lim (n log n)/n = lim log n = infinity`, so it is in fact `omega(n)`. A valid but loose lower bound.

5. **Theta(n).** The 1000 is a constant, not a function of n, so it folds into the constant factor.

6. **True.** Upper: `log(n!) = sum_{i=1}^{n} log i <= sum log n = n log n`. Lower: keep only the top half of the terms, `sum_{i=n/2}^{n} log i >= (n/2) log(n/2) = (n/2)(log n - 1) >= (n/4) log n` for `n >= 4`. So `c1 = 1/4`, `c2 = 1`, `n0 = 4`. That "keep the top half" trick is worth stealing; it appears again in file 24.

7. `(log n)^3  <  n^(1/2)  <  n log n  <  n^2  <  n^(log log n)  <  2^n  <  n!`
   The only subtle one is `n^(log log n)`. Take logs: `(log log n)(log n)`, which beats `log(n^2) = 2 log n` but loses to `log(2^n) = n`. So it sits strictly between every fixed polynomial and every exponential. It is called *quasi-polynomial*.

8. **Yes.** Upper: `f + g <= 2 max(f,g)`, so `c2 = 2`. Lower: `f + g >= max(f,g)`, so `c1 = 1`. This is the formal statement of "sequential blocks collapse to the max".

9. `f(n) = n(2 + sin n)`, `g(n) = n`. The ratio oscillates in `[1,3]`, never converging, but is bounded, so `f = Theta(g)` and in particular `f = O(g)`.

10. **Theta(n^2).** Upper: for `n >= 2`, `log n <= n` so `7 n log n <= 7n^2`, and `12 <= 12n^2`, giving `T(n) <= 22 n^2`, so `c2 = 22`. Lower: `T(n) >= 3n^2`, so `c1 = 3`. With `n0 = 2`.


---

Next: [23 — Recurrences](23-recurrences.md), which is how you get a running time out of an algorithm that calls itself.
