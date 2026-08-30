# 21 — The Course Track: Orientation

**This file starts a second track.** Files 00 through 20 are the interview track: patterns, speed, pass the phone screen. Files 21 through 28 are the **course track**, written the way a graduate algorithms textbook is written: every algorithm arrives with the argument that justifies it.

They are different sports played with the same equipment.

| | Interview track (00–20) | Course track (21–28) |
|---|---|---|
| Deliverable | working code, fast | a written proof |
| Judged on | does it pass the tests | is every claim justified |
| Time budget | 25 minutes, live | days, alone, with references |
| Failure mode | you froze | you hand-waved |
| "Correct" means | no failing case found | correctness argued for **all** inputs |
| Typical answer | 30 lines of Python | one page of English and math |

You can be excellent at the first and lost in the second. The gap is not intelligence, it is that nobody ever taught you that **the algorithm is the easy half and the proof is the half that counts**.

> ### How to read the course track
>
> Read 21 through 28 in order. Each assumes the previous one. They assume **nothing** from files 00–20, so you can start here cold, but the interview track is a good source of concrete implementations for everything proved here.
>
> Notation is written in plain text rather than typeset math, on purpose: `O(n^2)`, `Theta(n log n)`, `sum_{i=1}^{n}`. You will read the typeset version in CLRS and write it out by hand. Learning to translate between the two is part of the skill.
>
> `21 Orientation -> 22 Asymptotics -> 23 Recurrences -> 24 Divide and Conquer -> 25 Dynamic Programming -> 26 Greedy -> 27 Graphs and Flow -> 28 NP-Completeness`

---

## 21.1 What this material actually teaches

Strip away the topic list and a graduate algorithms course teaches exactly four skills, in this order of weight:

1. **Analyze** a given algorithm's running time, rigorously, usually by setting up and solving a recurrence.
2. **Design** an algorithm for a problem you have never seen, by recognizing which of five paradigms applies.
3. **Prove** your algorithm correct, using induction, an exchange argument, or a cut-and-paste argument.
4. **Reduce** one problem to another, both to solve things and to prove things are hard.

The topic list (sorting, graphs, flow, NP-completeness) is the *vehicle*. The four skills are the cargo. Almost every problem you will be set is one of the four wearing a costume.

### The five paradigms, in one table

This is the decision tree the whole course hangs off. Memorize it now, understand it over the next seven files.

| Paradigm | Shape of the idea | Correctness proved by | Typical cost |
|---|---|---|---|
| **Brute force / iterative** | try everything, or sweep once | loop invariant + induction | O(n), O(n^2), or exponential |
| **Divide and conquer** | split into independent subproblems, recurse, combine | strong induction on size | solve a recurrence |
| **Dynamic programming** | overlapping subproblems, solve each once, memoize | cut-and-paste (optimal substructure) | (number of states) x (work per state) |
| **Greedy** | commit to a locally best choice, never reconsider | exchange argument, or greedy-stays-ahead | usually sort + linear scan |
| **Reduction** | turn my problem into one already solved | correctness of the mapping, both directions | cost of transform + cost of solver |

And the sixth thing, which is not a design paradigm but a proof technique: **lower bounds**, where you argue that *no* algorithm can beat some cost. That is the Omega side of the world, and it is where NP-completeness lives.

---

## 21.2 How to study this material

The gap between reading an algorithm and being able to reconstruct it is enormous, and reading more does not close it. Four habits do.

**Write from memory.** After finishing a section, close the file and write a one-page summary on blank paper. Recognition feels like knowledge and is not knowledge. If you cannot restate the master theorem's three cases without looking, you do not know it, however many times you have read them.

**Attempt alone before discussing.** Working through a hard problem with other people is genuinely useful, and it is useless if you have not first spent forty-five minutes stuck on it yourself. The struggle is where the learning happens; the discussion only consolidates it. Reversed, you watch someone else learn.

**Redo solved problems cold.** Once a week, take a problem you already solved and solve it again from a blank page with nothing open. This is the single activity that most reliably converts "I followed that" into "I can produce that".

**Never leave a proof blank.** When you cannot finish, write down what you do know: the definition of the thing being asked, the base case, the induction hypothesis, and an honest statement of what remains to be shown. A structured partial argument is worth far more than a blank page, and writing the skeleton often shows you the missing step.

That last habit is worth generalizing. **Most of the difficulty in this material is not having ideas, it is knowing what a complete argument looks like.** Once the shape is automatic, you can tell in seconds whether your own reasoning has a hole in it, which is most of the skill.

---

## 21.3 Using this file honestly

This is a textbook. Reading it to learn a technique is what textbooks are for, and it is the same act as reading CLRS or Erickson.

If you are taking a course, your instructor's rules on collaboration, outside sources, and citation govern, and they vary. Read them and follow them. The general principle that holds everywhere: **learn the method from the explanation, then close it and solve the assigned problem yourself, in your own words.** If a worked example here was close enough to something you were assigned that you leaned on it, cite it. Citing costs nothing.

There is also a purely practical argument. Anything you get through without building the skill is a loan, and it comes due the first time you have to produce the argument from a blank page with nothing open.

---

## 21.4 How to write a proof that holds up

This is the section to reread before every written solution. Most of what goes wrong here is not wrong ideas, it is correct ideas presented in a form a reader cannot verify.

### The four-part answer

Every "design an algorithm for X" problem wants four things, usually in this order. Label them literally with headers. Someone checking your work should never have to guess which part they are looking at.

**1. The idea, in English, in three sentences.** Before any pseudocode. If a reader understands your approach from the first paragraph, everything after is confirmation and you will be read generously. If they have to reverse-engineer your intent from pseudocode, you will be read suspiciously.

> *Idea: we sort the intervals by right endpoint and repeatedly take the first interval that does not overlap what we have already taken. Sorting by right endpoint means each accepted interval leaves the maximum possible room for the rest.*

**2. The algorithm, as pseudocode.** Not a language. Pseudocode. Indexed from 1 like CLRS if your course does. Use real variable names. It should be unambiguous enough that a competent person could implement it and short enough to read in thirty seconds.

**3. Correctness proof.** This is the biggest block and the one people amputate. Covered below.

**4. Running time analysis.** State it, then justify it line by line or by naming the dominant step. "Sorting is O(n log n), the scan is O(n), so the total is O(n log n)" is a complete answer. "O(n log n)" alone is not.

### Choosing the right proof technique

| If your algorithm is... | Prove it with... |
|---|---|
| A loop | a **loop invariant**: state it, prove initialization, maintenance, termination |
| Recursive / divide and conquer | **strong induction** on the input size |
| Dynamic programming | **optimal substructure** via a cut-and-paste argument, then induction on the table order |
| Greedy | an **exchange argument** (transform any optimal solution into yours without making it worse) or **greedy stays ahead** |
| A reduction | show the mapping is computable, and prove **both** directions of "yes iff yes" |
| A lower bound | a **decision tree** count, or an **adversary argument** |

Each of these is developed with worked examples in the files that follow. What matters right now is that you know a menu exists and that picking from it is not optional.

### The sentences that lose points

Cross these out of your vocabulary for the semester:

- *"Clearly..."* and *"Obviously..."* and *"It is easy to see that..."* These are exactly the places a careful reader looks for gaps. If it is genuinely obvious, one more clause proving it costs you a line. If it is not obvious, you just advertised the hole.
- *"And so on..."* and *"...similarly for the other cases."* Do the other cases, or say precisely why they are symmetric.
- *"This works because it tries all possibilities."* Does it? Prove that every possibility is reached.
- *"By induction."* Naming the technique is not applying it. Write the base case, write the hypothesis, write the step.

### The template that never fails

For any induction:

```
Claim: P(n) holds for all n >= n0.

Base case: n = n0.  [show P(n0) directly]

Induction hypothesis: assume P(k) holds for all n0 <= k < n.
  (Use STRONG induction by default. It costs nothing extra and
   recursive algorithms almost always need more than P(n-1).)

Induction step: [show P(n), using the hypothesis, and say exactly where
  you used it]

Therefore P(n) holds for all n >= n0 by induction.  QED
```

Fill that skeleton in even when you cannot complete the step. A blank page scores zero. A skeleton with a correct base case, a correctly stated hypothesis, and an honest "we would now need to show X" often scores half.

---

## 21.5 Pseudocode conventions

Courses in this lineage use CLRS-style pseudocode. Match it and your work reads as fluent.

```
MERGE-SORT(A, p, r)
1  if p < r
2      q = floor((p + r) / 2)
3      MERGE-SORT(A, p, q)
4      MERGE-SORT(A, q + 1, r)
5      MERGE(A, p, q, r)
```

The conventions worth copying:

- **Arrays are 1-indexed**, and `A[p..r]` denotes the slice inclusive of both ends. This is different from Python and it will trip you up in exactly one place: the midpoint and the recursive boundaries. Be deliberate.
- **Indentation indicates block structure.** No braces, no `end`.
- `=` is assignment, `==` is comparison.
- **Line numbers**, so your analysis can say "line 5 runs n times".
- `A.length` for the size of an array, `x.key` for attributes of an object.
- Return with `return`. Infinity is written `INF`. Swap is `exchange A[i] with A[j]`.

Erickson's notes use a lighter style with a similar spirit. Either is fine; consistency within one answer is what is graded.

---

## 21.6 The mathematical toolkit you need on day one

Not a full treatment of discrete maths, just the specific facts that appear over and over. If any of these is unfamiliar, spend an hour on it now rather than losing a problem to it later.

### Logarithms

```
log(ab)     = log a + log b
log(a/b)    = log a - log b
log(a^b)    = b log a
a^(log_b c) = c^(log_b a)            <- the weird one, and it does show up
log_b a     = (log_c a) / (log_c b)  <- change of base
```

The change-of-base identity is why **the base of a logarithm never matters inside asymptotic notation**: changing base multiplies by the constant `1 / log_c b`, and constants vanish. `O(log_2 n)`, `O(log_10 n)`, and `O(ln n)` are the same set. This is why we just write `O(log n)`.

Two conventions from CLRS: `lg n` means `log_2 n`, and `lg^k n` means `(lg n)^k`, not `lg` applied k times (that is `lg* n`, the iterated logarithm, which is a different and much slower-growing thing).

The iterated logarithm is worth defining properly once, since it turns up in the analysis of union-find and nowhere else you will care about:

```
lg* n = 0                if n <= 1
lg* n = 1 + lg*(lg n)    if n > 1
```

In words: how many times you have to hit n with `lg` before it drops to 1 or below. It grows so slowly that `lg* n <= 5` for every n you will ever meet, since `lg*(2^65536) = 5`. Formally `lg* n = o(log log log n)`, and for practical purposes it is a constant that we are too honest to call one.

### Summations you must know cold

```
sum_{i=1}^{n} 1     = n
sum_{i=1}^{n} i     = n(n+1)/2                 = Theta(n^2)
sum_{i=1}^{n} i^2   = n(n+1)(2n+1)/6           = Theta(n^3)
sum_{i=1}^{n} i^k   = Theta(n^(k+1))           for constant k >= 0
sum_{i=0}^{n} x^i   = (x^(n+1) - 1)/(x - 1)    geometric, x != 1
sum_{i=0}^{inf} x^i = 1/(1 - x)                for |x| < 1
sum_{i=1}^{n} 1/i   = H_n = ln n + O(1)        = Theta(log n), the harmonic sum
```

The geometric series is the single most important one here, for a reason worth stating early: **a geometric series is dominated by its largest term, up to a constant factor.** If a recursion tree's level costs form a geometric series, you do not have to sum it carefully, you just take the biggest level and multiply by a constant. That intuition is the entire content of the master theorem.

### Factorials and Stirling

```
n!     = 1 x 2 x ... x n
lg(n!) = Theta(n lg n)                       <- appears in the sorting lower bound
n!     = sqrt(2 pi n) (n/e)^n (1 + Theta(1/n))    <- Stirling's approximation
```

You need `lg(n!) = Theta(n lg n)` in file 28. You almost never need full Stirling.

### Counting facts

```
number of subsets of an n-set     = 2^n
number of k-subsets of an n-set   = C(n,k) = n! / (k! (n-k)!)
number of permutations of n items = n!
C(n,k) <= (en/k)^k                          <- useful bound
```

### Proof by induction, contradiction, contraposition

- **Induction**: prove P(base), prove P(<n) implies P(n). Use **strong** induction by default.
- **Two ways to count the same thing**: if two expressions both count the elements of one set, they are equal. This is the cleanest proof of `sum_{i=1}^{n} i = n(n+1)/2`. Both sides count pairs `(j, k)` with `j < k` drawn from `n + 1` people. The left side fixes `k` and counts the choices of `j` below it. The right side picks any person, then a second, then divides by 2 because each pair got counted twice. No algebra, no induction, and it generalizes.
- **Contradiction**: assume the negation, derive something false. The workhorse for lower bounds and for "no such algorithm exists".
- **Contraposition**: to prove "if A then B", prove "if not B then not A". These are logically identical and one direction is usually far easier.

**One induction proof that is wrong, and worth staring at.** Claim: all people have the same name. Base case, one person: one name, true. Inductive step: given `n + 1` people `P_1, ..., P_{n+1}`, look at `S_1 = {P_1, ..., P_n}` and `S_2 = {P_2, ..., P_{n+1}}`. Each has size `n`, so by the hypothesis everyone in `S_1` shares a name and everyone in `S_2` shares a name. The two sets overlap, so all `n + 1` names agree.

The conclusion is false, so find the broken step before reading on. It is the overlap. `S_1` and `S_2` share a member only when `n >= 2`, so the step never carries the base case `n = 1` to `n = 2`, and the whole chain fails at its first link. The lesson generalizes: **an inductive step that quietly assumes the input is large enough is the most common way a wrong proof looks right.** When you write one, check it against the smallest case the step is supposed to handle, not against a comfortable large case.

### Graph vocabulary

Assumed from day one, so make sure all of it is instant: vertex, edge, directed vs undirected, weighted, degree, in-degree, out-degree, path, simple path, cycle, connected, strongly connected, tree, forest, DAG, subgraph, spanning tree, bipartite, adjacency list, adjacency matrix. File 27 rebuilds these anyway, but they get used before then.

---

## 21.7 A worked example, end to end

To make section 21.4 concrete, here is one complete answer at the standard the course expects. The problem is deliberately easy so that the *form* is the only thing to study.

> **Problem.** Given an array `A[1..n]` of integers, find the maximum sum of any contiguous subarray. (The empty subarray, with sum 0, is allowed.)

**Idea.** Scan left to right, maintaining the best sum of a subarray that *ends exactly at* the current position. That value is either the current element alone or the current element appended to the best subarray ending one position earlier, whichever is larger. The answer is the maximum of those values over all positions.

**Algorithm.**

```
MAX-SUBARRAY(A)
1  best = 0
2  ending-here = 0
3  for i = 1 to A.length
4      ending-here = max(0, ending-here + A[i])
5      best = max(best, ending-here)
6  return best
```

**Correctness.** We use a loop invariant.

*Invariant.* At the start of each iteration with index `i`, `ending-here` equals the maximum sum over all subarrays (possibly empty) ending at position `i-1`, and `best` equals the maximum sum over all subarrays (possibly empty) of `A[1..i-1]`.

*Initialization.* Before the first iteration `i = 1`, so `A[1..0]` is empty. The only subarray ending at position 0 is the empty one, of sum 0, and the only subarray of an empty array is the empty one, of sum 0. Both variables are 0, so the invariant holds.

*Maintenance.* Assume the invariant before iteration `i`. Any subarray ending at position `i` is either empty (sum 0) or is a subarray ending at `i-1` extended by `A[i]`. The best of the second kind has sum `ending-here + A[i]` by the invariant. So the maximum over subarrays ending at `i` is `max(0, ending-here + A[i])`, which is exactly what line 4 assigns. Every subarray of `A[1..i]` either ends at `i` or is a subarray of `A[1..i-1]`, so the maximum over `A[1..i]` is the larger of the new `ending-here` and the old `best`, which is what line 5 assigns. The invariant therefore holds before iteration `i+1`.

*Termination.* The loop ends with `i = n+1`. By the invariant, `best` is the maximum sum over all subarrays of `A[1..n]`, which is what line 6 returns. QED

**Running time.** The loop runs `n` times and each iteration does a constant number of arithmetic and comparison operations, so the total is `Theta(n)`. Space is `O(1)` beyond the input.

Notice the proportions. Six lines of algorithm, four paragraphs of proof. **That ratio is the whole difference between the two tracks.** If your written solution is mostly code, you are answering the interview question, not this one.

---

## 21.8 What is in the rest of the track

| File | Covers | The one skill it builds |
|---|---|---|
| [22 — Asymptotics from Zero](22-asymptotics-from-zero.md) | O, Omega, Theta, o, omega, limits, loop counting, summations | reading a bound and knowing exactly what it does and does not claim |
| [23 — Recursion and Recurrences](23-recurrences.md) | reduction, the recursion template, Tower of Hanoi, substitution, recursion trees, master theorem, changing variables | writing a recursive algorithm, proving it correct, and turning it into a closed-form running time |
| [24 — Divide and Conquer](24-divide-and-conquer.md) | mergesort, quickselect, Karatsuba, Strassen, closest pair, sorting lower bound, pattern matching | designing a split-and-combine algorithm and proving it |
| [25 — Dynamic Programming](25-dynamic-programming.md) | the recipe, optimal substructure, the standard problem zoo | going from recursive definition to table to correctness proof |
| [26 — Greedy](26-greedy.md) | exchange arguments, greedy stays ahead, scheduling, Huffman, MST | proving that never reconsidering is safe |
| [27 — Graphs and Network Flow](27-graphs-and-network-flow.md) | BFS/DFS, topological sort, SCC, MST, shortest paths, Ford-Fulkerson, max-flow min-cut, matching | modelling a problem as a graph or a flow and citing the right theorem |
| [28 — NP-Completeness](28-np-completeness.md) | P, NP, reductions, Cook-Levin, the standard hard problems, how to write a hardness proof | proving a problem hard instead of failing to solve it |

Start with [22 — Asymptotics from Zero](22-asymptotics-from-zero.md). It assumes you have never seen a Big-O in your life.
