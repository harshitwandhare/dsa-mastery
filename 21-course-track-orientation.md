# 21 — The Course Track: Orientation

**This file starts a second track.** Files 00 through 20 are the interview track: patterns, speed, pass the phone screen. Files 21 through 28 are the **course track**, written for a graduate algorithms class of the CLRS + Erickson kind (UT Dallas CS 6363, Advanced Algorithm Design and Analysis, and its equivalents everywhere else).

They are different sports played with the same equipment.

| | Interview track (00–20) | Course track (21–28) |
|---|---|---|
| Deliverable | working code, fast | a written proof |
| Judged on | does it pass the tests | is every claim justified |
| Time budget | 25 minutes, live | days, alone, with references |
| Failure mode | you froze | you hand-waved |
| "Correct" means | no failing case found | correctness argued for **all** inputs |
| Typical answer | 30 lines of Python | one page of English and math |

You can be excellent at the first and get a C in the second. The gap is not intelligence, it is that nobody ever taught you that **the algorithm is the easy half and the proof is the graded half**.

> ### How to read the course track
>
> Read 21 through 28 in order. Each assumes the previous one. They assume **nothing** from files 00–20, so you can start here cold, but the interview track is a good source of concrete implementations for everything proved here.
>
> Notation is written in plain text rather than typeset math, on purpose: `O(n^2)`, `Theta(n log n)`, `sum_{i=1}^{n}`. You will read the typeset version in CLRS and write it in your homework. Learning to translate between the two is part of the skill.
>
> `21 Orientation -> 22 Asymptotics -> 23 Recurrences -> 24 Divide and Conquer -> 25 Dynamic Programming -> 26 Greedy -> 27 Graphs and Flow -> 28 NP-Completeness`

---

## 21.1 What the class actually is

Strip away the topic list and a graduate algorithms course teaches exactly four skills, in this order of weight:

1. **Analyze** a given algorithm's running time, rigorously, usually by setting up and solving a recurrence.
2. **Design** an algorithm for a problem you have never seen, by recognizing which of five paradigms applies.
3. **Prove** your algorithm correct, using induction, an exchange argument, or a cut-and-paste argument.
4. **Reduce** one problem to another, both to solve things and to prove things are hard.

The topic list (sorting, graphs, flow, NP-completeness) is the *vehicle*. The four skills are the cargo. Every exam question is one of the four wearing a costume.

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

## 21.2 The grading reality, and how to actually top the class

A typical distribution for this course:

- **Exams 60%.** Two of them, each covering one half, second one not cumulative.
- **Homeworks 26%.** Around six, lowest dropped, groups of up to three allowed.
- **Quizzes 14%.** Short, after most lectures, lowest two dropped.

Three consequences that most students miss.

**Exams are 60% and they are closed-book and timed.** Homework is where you *learn*, but it is not where the grade is. A student who does great homework in a group and cannot reproduce a recurrence solve alone in 90 minutes gets a B. Your homework habit should therefore be: solve it alone first, *then* meet the group. Reversed, you learn nothing and find out in the exam hall.

**Grading is relative to the class average with no fixed curve.** This is a gift, not a threat. It means the target is not "get 95%", it is "be reliably in the top decile of a hard exam where the average might be 55%". On a brutal exam, the difference between a B and an A is often one problem where you wrote a *partially correct* proof instead of nothing. Which leads directly to the single highest-yield habit in this class:

> **Never leave a proof blank.** Write the definition of the thing being asked. Write the base case. State the induction hypothesis. State what you would need to show. Partial credit in proof-based grading is enormous and most students, faced with a problem they cannot finish, write nothing. Structure is worth points even when the middle is missing.

**Quizzes are 14% and are the cheapest points in the course.** They come after a lecture, they are open-note, they test whether you watched. Getting 100% on quizzes while the class averages 80% is a free third of a letter grade. Do the quiz the same day as the lecture, every time.

### The weekly loop that produces an A

```
Lecture day:      attend, then do the quiz within 24h while it is fresh
                  write a one-page summary of the lecture from memory, no notes
Homework release: attempt every problem ALONE for 45 minutes each before any group meeting
Group meeting:    compare, argue, but write your own solution in your own words
Weekly:           redo one already-solved problem from scratch, closed book
Before exam:      solve past exams under a timer, in ink, no references
```

The "from memory, no notes" summary is the part people skip and it is the part that works. Recognition feels like knowledge and is not knowledge. If you cannot restate the master theorem's three cases on a blank page, you do not know it, no matter how many times you have read it.

---

## 21.3 Academic integrity, stated plainly

Course policies of this type typically say: you may work in groups of up to three; you may discuss with a limited number of students outside your group and must name them; you must write solutions **in your own words**; and you must solve problems **without outside sources**, which explicitly includes searching online and using AI. Any source you do use must be cited, and failure to cite is plagiarism.

So be exact about what this file is. **This is a textbook.** Reading a textbook to learn a technique is what textbooks are for, and it is the same act as reading CLRS or Erickson. Taking a homework problem, finding the answer, and transcribing it is cheating, and it is cheating whether the source is a book, a friend, a website, or a model.

The line is: **learn the method from the explanation, then close it and solve the assigned problem yourself.** If a worked example here is close enough to an assigned problem that you leaned on it, cite it. Citing costs you nothing. Not citing can cost you the degree.

There is also a purely selfish argument. 60% of the grade is a closed-book timed exam. Any shortcut that gets a homework done without building the skill is a loan you repay at 3x in the exam hall.

---

## 21.4 How to write a proof that gets full marks

This is the section to reread before every homework. Most lost points in this course are not wrong ideas, they are correct ideas presented in a form that the grader cannot verify.

### The four-part answer

Every "design an algorithm for X" problem wants four things, usually in this order. Label them literally with headers. Graders love headers.

**1. The idea, in English, in three sentences.** Before any pseudocode. If the grader understands your approach from the first paragraph, everything after is confirmation and you will be read generously. If they have to reverse-engineer your intent from pseudocode, you will be read suspiciously.

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

- *"Clearly..."* and *"Obviously..."* and *"It is easy to see that..."* These are exactly the places graders look for gaps. If it is genuinely obvious, one more clause proving it costs you a line. If it is not obvious, you just advertised the hole.
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

Not a full course in discrete math, just the specific facts that appear over and over. If any of these is unfamiliar, spend an hour on it now rather than losing an exam problem to it in October.

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

The geometric series is the single most important one in this course, for a reason worth stating early: **a geometric series is dominated by its largest term, up to a constant factor.** If a recursion tree's level costs form a geometric series, you do not have to sum it carefully, you just take the biggest level and multiply by a constant. That intuition is the entire content of the master theorem.

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
- **Contradiction**: assume the negation, derive something false. The workhorse for lower bounds and for "no such algorithm exists".
- **Contraposition**: to prove "if A then B", prove "if not B then not A". These are logically identical and one direction is usually far easier.

### Graph vocabulary

Assumed from day one, so make sure all of it is instant: vertex, edge, directed vs undirected, weighted, degree, in-degree, out-degree, path, simple path, cycle, connected, strongly connected, tree, forest, DAG, subgraph, spanning tree, bipartite, adjacency list, adjacency matrix. File 27 rebuilds these anyway, but the lectures will use them before then.

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

Notice the proportions. Six lines of algorithm, four paragraphs of proof. **That ratio is the class.** If your homework looks like mostly code, you are writing an interview answer, not a course answer.

---

## 21.8 What is in the rest of the track

| File | Covers | The one skill it builds |
|---|---|---|
| [22 — Asymptotics from Zero](22-asymptotics-from-zero.md) | O, Omega, Theta, o, omega, limits, loop counting, summations | reading a bound and knowing exactly what it does and does not claim |
| [23 — Recurrences](23-recurrences.md) | substitution, recursion trees, master theorem, changing variables | turning a recursive algorithm into a closed-form running time |
| [24 — Divide and Conquer](24-divide-and-conquer.md) | mergesort, quickselect, Karatsuba, Strassen, closest pair, sorting lower bound, pattern matching | designing a split-and-combine algorithm and proving it |
| [25 — Dynamic Programming](25-dynamic-programming.md) | the recipe, optimal substructure, the standard problem zoo | going from recursive definition to table to correctness proof |
| [26 — Greedy](26-greedy.md) | exchange arguments, greedy stays ahead, scheduling, Huffman, MST | proving that never reconsidering is safe |
| [27 — Graphs and Network Flow](27-graphs-and-network-flow.md) | BFS/DFS, topological sort, SCC, MST, shortest paths, Ford-Fulkerson, max-flow min-cut, matching | modelling a problem as a graph or a flow and citing the right theorem |
| [28 — NP-Completeness](28-np-completeness.md) | P, NP, reductions, Cook-Levin, the standard hard problems, how to write a hardness proof | proving a problem hard instead of failing to solve it |

Start with [22 — Asymptotics from Zero](22-asymptotics-from-zero.md). It assumes you have never seen a Big-O in your life.
