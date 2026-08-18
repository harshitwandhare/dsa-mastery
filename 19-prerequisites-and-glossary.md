# 19 — Prerequisites, Math & Glossary

**Reference. Read §19.1 and §19.2 once before [01-foundations](01-foundations.md); look the rest up as needed.**

Everything the other files quietly assume you already know. If a word in this curriculum stopped you, it's here.

---

## 19.1 The maths you actually need

Less than you fear. This is all of it.

### Exponents and scientific notation

`10³` means 10 × 10 × 10 = 1,000. The small raised number is the **exponent** — how many times to multiply.

```
10¹ = 10            10⁵ = 100,000           2¹⁰ = 1,024  (≈ a thousand)
10² = 100           10⁶ = 1,000,000         2²⁰ ≈ 1,000,000
10³ = 1,000         10⁹ = 1,000,000,000     2³⁰ ≈ 1,000,000,000
```

**Reading `10⁵` quickly: it's a 1 followed by 5 zeros.** Constraints are always written this way — `1 <= n <= 10^5` means n can be up to 100,000.

Two facts worth memorising because they recur everywhere:

- **2¹⁰ ≈ 10³.** So 2²⁰ ≈ 10⁶ and 2³⁰ ≈ 10⁹. This is why "n ≤ 20 suggests 2ⁿ" works — 2²⁰ is about a million, which is fine.
- **10⁸ operations per second** is roughly what a machine does. Every constraint judgement in this curriculum comes from that number.

In Python, `**` is the exponent operator: `2 ** 10` is 1024.

### Logarithms

A logarithm is the **inverse of an exponent**. It answers: *"how many times do I multiply the base to reach this number?"*

```
2³ = 8          so    log₂(8) = 3
2¹⁰ = 1024      so    log₂(1024) = 10
```

For algorithms, only base 2 matters, and there's a single interpretation you need:

> **log₂(n) = how many times you can halve n before reaching 1.**

Halve 1,000,000: 500k, 250k, 125k, … you reach 1 after about **20** steps. So log₂(10⁶) ≈ 20.

```
log₂(1,000)         ≈ 10
log₂(1,000,000)     ≈ 20
log₂(1,000,000,000) ≈ 30
```

**Why this dominates algorithms:** any procedure that throws away half the remaining possibilities each step finishes in log₂(n) steps. Binary search on a billion items takes 30 comparisons. A balanced tree of a billion nodes is 30 levels deep. That's the whole reason "O(log n)" is treated as nearly free.

You never compute a logarithm by hand in an interview. You only need "log means repeated halving, and it's a small number."

### O, Ω, and Θ

Three related notations. You'll use one.

| Notation | Means | Spoken |
|---|---|---|
| **O(f)** | grows **no faster than** f — an upper bound | "big-oh" |
| **Ω(f)** | grows **no slower than** f — a lower bound | "big-omega" |
| **Θ(f)** | both — grows exactly like f | "big-theta" |

In practice everyone says "O(n)" even when they mean Θ(n). That's fine and expected. Ω appears once in this curriculum: the proof that comparison-based sorting cannot beat **Ω(n log n)** — meaning no comparison sort can ever be faster than that, as a matter of mathematics, not engineering.

### Series and why "amortized" works

Some sums that appear constantly:

```
1 + 2 + 3 + ... + n  =  n(n+1)/2  ≈  n²/2      → O(n²)
```
That's why a nested loop where the inner one shrinks (`for j in range(i+1, n)`) is still O(n²).

```
n + n/2 + n/4 + n/8 + ...  =  2n                → O(n)
```
**This one is the key to several "surprisingly fast" results.** Each term is half the last, and the whole infinite sum converges to just 2n. It's why:
- quickselect is O(n) on average, not O(n log n)
- building a heap (`heapify`) is O(n), not O(n log n)
- a dynamic array's repeated doubling costs O(1) per append *amortized*

**Amortized** means: averaged over a *sequence* of operations, even in the worst case. One `append` might trigger an expensive copy, but that copy buys many cheap appends, so the average stays O(1). It is not the same as "average case", which is about random inputs.

### Modular arithmetic

`a % b` is the **remainder** after dividing. `17 % 5 = 2`.

Uses you'll actually hit:

```python
n % 2 == 0                  # even?
i % len(arr)                # wrap around to 0 — circular arrays
(i + 1) % n                 # next index, cyclically
hash(key) % capacity        # which bucket — this is how dicts work
result % (10**9 + 7)        # keep huge numbers manageable
```

**Why `10**9 + 7`?** Competitive problems ask for answers "modulo 10⁹+7" because results overflow otherwise. It's a large prime, which makes the arithmetic well-behaved. In Python, integers never overflow, so you just apply `% MOD` where the problem says to.

### Combinatorics

Only two facts needed.

**Permutations** — orderings of n distinct things: `n!` (n factorial) = n × (n−1) × … × 1.
```
3! = 6     4! = 24     10! = 3,628,800     20! ≈ 2.4 × 10¹⁸
```
Factorials explode. That's why "generate all permutations" problems always have n ≤ 10.

**Subsets** — for n items, each is either in or out, so there are `2ⁿ` subsets.
```
2¹⁰ = 1,024      2²⁰ ≈ 1,000,000      2³⁰ ≈ 10⁹
```
That's why "generate all subsets" problems cap at n ≈ 20.

**Combinations** — choosing k from n without caring about order: written `C(n,k)` or "n choose k". Python: `math.comb(n, k)`.

### Proof styles you'll be asked to gesture at

You never write a formal proof in an interview. You do need to *argue* convincingly.

**Proof by contradiction** — assume the opposite, derive nonsense, conclude the opposite is impossible. Used in: "this pointer can't be part of any solution, so discarding it is safe."

**The exchange argument** (for greedy) — suppose an optimal answer differs from your greedy choice; show you can *swap* your choice in without making it worse; conclude some optimal answer contains your choice. Two sentences of this is a strong senior signal.

**Induction** — prove it for the smallest case, then prove that "if it works for k it works for k+1". This is the formal skeleton behind recursion: your base case plus your recursive step *is* an induction proof.

**Invariant** — a statement that stays true throughout a loop. "Everything left of `write` is already sorted." "The window always contains at most k distinct characters." Naming your invariant out loud is how you convince an interviewer your loop is correct, and how you debug it when it isn't.

---

## 19.2 CS vocabulary, decoded

Words this curriculum uses as if you know them.

| Term | Means |
|---|---|
| **in-place** | modifies the input directly, using O(1) extra memory, instead of building a new structure |
| **stable** (sorting) | equal elements keep their original relative order |
| **invariant** | something that stays true throughout a loop or structure |
| **canonical form** | a normalised representation so equivalent things become identical — e.g. sorting a word's letters so all anagrams share one key |
| **monotonic** | only ever moves one direction — never increases, or never decreases |
| **sentinel** | a fake element added to remove edge cases, e.g. a dummy head node so "delete the first item" needs no special case |
| **brute force** | the obvious, exhaustive, usually-too-slow solution. Always your starting point |
| **heuristic** | a rule that usually works but isn't guaranteed optimal |
| **deterministic** | same input always gives the same output |
| **idempotent** | doing it twice has the same effect as doing it once |
| **contiguous** | stored in one unbroken block of memory (arrays) or adjacent in a sequence (subarrays) |
| **aliasing** | two names pointing at the same object, so changing one changes "both" |
| **reference vs value** | a variable holds a *reference* (an arrow to an object) for lists/dicts/objects, and behaves like a *value* for ints/strings. This is why `b = a` doesn't copy a list |
| **pointer** | a variable holding a memory address. Python has no explicit pointers, but linked-list `.next` is exactly this idea |
| **allocate** | reserve memory for something |
| **stack frame** | the memory holding one function call's local variables. Nested calls stack up; too many = `RecursionError` |
| **DAG** | Directed Acyclic Graph — arrows have direction and there are no cycles. Required for topological sort |
| **acyclic** | contains no cycles (no path that loops back to where it started) |
| **bipartite** | a graph whose nodes can be split into two groups with every edge crossing between them |
| **indegree** | how many arrows point *into* a node. Used by Kahn's topological sort |
| **NP-hard** | no known efficient (polynomial-time) algorithm exists. If you can *identify* a problem as NP-hard, that itself is the right interview answer |
| **polynomial time** | O(n^k) for some fixed k — considered "tractable" |
| **hash function** | turns a key into a number, so you can jump straight to a slot instead of searching |
| **collision** | two different keys hashing to the same slot |
| **load factor** | how full a hash table is. Python resizes at about 2/3 to keep collisions rare |
| **cache** | a small fast store of recently or frequently used data |
| **cache locality** | how close together in memory the data you access is. Arrays have great locality; linked lists have terrible locality — this is why arrays are faster in practice despite identical Big-O |
| **garbage collection** | automatic freeing of memory you're no longer using |
| **compile vs interpret** | compiled languages (C++, Java) translate to machine code ahead of time; Python interprets line by line at runtime. This is why Python is slower and why LeetCode gives it more generous time limits |
| **runtime** | (1) when the program is running, as opposed to when it's written; (2) how long it takes |
| **two's complement** | how computers represent negative numbers in binary. Relevant only to bit-manipulation problems |

---

## 19.3 The engineering vocabulary

Needed for files [09](09-systems-lld-hld-sql.md), [13](13-lld-deep.md), [14](14-hld-deep.md), [15](15-databases.md), [16](16-cs-fundamentals.md).

| Term | Means |
|---|---|
| **client / server** | the client asks (your browser, a phone app); the server answers |
| **request / response** | one round trip: client sends a request, server sends a response |
| **API** | Application Programming Interface — the set of operations one program exposes to another. "Call the API" = ask another program to do something |
| **endpoint** | one specific address in an API, e.g. `GET /users/42` |
| **REST** | a convention for APIs: resources as URLs, HTTP verbs for actions (GET reads, POST creates, DELETE removes) |
| **HTTP** | the protocol browsers and APIs speak |
| **JSON** | the standard text format for sending structured data: `{"name": "Harshit", "age": 22}`. Looks exactly like a Python dict |
| **latency** | how long one operation takes (a single request: 200 ms) |
| **throughput** | how many operations per second in total (10,000 requests/sec). **They are different and often traded against each other** |
| **QPS** | queries per second — throughput for a service |
| **scaling up / out** | up = a bigger machine; out = more machines |
| **stateless** | the server keeps no memory between requests, so any server can handle any request. Required for horizontal scaling |
| **schema** | the structure of your data: which tables, which columns, which types |
| **index** (database) | a lookup structure that makes searching a column fast — the same idea as binary search, applied to disk |
| **transaction** | a group of database operations that all succeed or all fail together |
| **ACID** | Atomicity, Consistency, Isolation, Durability — the guarantees a relational database gives a transaction |
| **shard** | split data across several machines |
| **replica** | a copy of the data, usually for serving reads |
| **load balancer** | sits in front of many servers and distributes incoming requests |
| **CDN** | Content Delivery Network — geographically distributed caches for images, video, and static files |
| **proxy** | a server that sits between two parties and forwards traffic |
| **middleware** | code that runs on every request before your handler (auth checks, logging) |
| **container / Docker** | a packaged app plus its dependencies, so it runs identically everywhere |
| **CI/CD** | Continuous Integration / Deployment — automation that runs your tests and ships your code on every push |
| **thread / process** | a process is a running program with its own memory; a thread is one execution path inside it |
| **race condition** | two things touch shared data at once and the result depends on timing. The bug class that concurrency exists to manage |
| **atomic** | happens completely or not at all; cannot be interrupted halfway |
| **mutex / lock** | a mechanism ensuring only one thread enters a section at a time |
| **deadlock** | two threads each holding what the other needs, both stuck forever |
| **serialize** | convert an object into a string or bytes so it can be stored or sent (and *deserialize* to reverse it) |
| **regression** | something that used to work and now doesn't. "Regression test" = a test that stops it recurring |

---

## 19.4 The interview lexicon

Words recruiters and engineers use that nobody explains to you.

| Term | Means |
|---|---|
| **OA** | Online Assessment — an automated coding test, usually the first technical filter. Your TikTok CodeSignal is one |
| **phone screen** | a 45-minute technical interview, typically one or two coding problems over video |
| **onsite / loop** | the final round: 4–6 back-to-back interviews in one day. "Loop" means the whole set |
| **new grad** | a full-time role for someone graduating within the year (as opposed to an internship) |
| **req** | requisition — an open, approved job slot. "The req closed" = they stopped accepting applications |
| **rolling** | applications are reviewed as they arrive rather than after a deadline. Applying early genuinely helps |
| **referral** | an existing employee submits you. Worth roughly 5–10 cold applications |
| **recruiter** | the person managing your process. Not an engineer; ask them about timeline and logistics, not technical detail |
| **hiring manager** | the person who'd be your boss and who makes the call |
| **STAR** | Situation, Task, Action, Result — the standard structure for behavioural answers |
| **behavioural** | the non-coding interview about how you work with people |
| **LP** | Leadership Principle — Amazon's named values, which they interview against explicitly |
| **L3 / L4 / L5** | seniority levels. L3 is typically new grad, L4 mid, L5 senior. Terminology varies by company |
| **editorial** | LeetCode's official written solution |
| **mock** | a practice interview under real conditions |
| **Blind 75 / NeetCode 150** | the two standard curated problem lists |
| **grinding** | working through problems in volume |
| **TC** | total compensation — base + bonus + equity |
| **exploding offer** | an offer with a short deadline, used to stop you interviewing elsewhere |
| **ghosting** | a company going silent. Common and rarely personal |

---

## 19.5 Terminal and Git survival

You need maybe fifteen commands, ever.

### Terminal

```bash
pwd                     # where am I?
ls                      # what's here?          (PowerShell: dir also works)
cd foldername           # go into a folder
cd ..                   # go up one level
mkdir newfolder         # make a folder
cat file.txt            # print a file
python file.py          # run a Python file
```

**Everything is relative to where you are standing.** That's the single concept. `pwd` when confused.

`Ctrl+C` stops a running program. Up-arrow recalls your last command. Tab auto-completes file names — use it, it prevents typos.

### Git — what it is

Git records **snapshots** of your project over time, so you can see what changed, undo mistakes, and work on several things at once. GitHub is a website that hosts those snapshots online.

| Term | Means |
|---|---|
| **repository (repo)** | a project tracked by git |
| **commit** | one saved snapshot, with a message describing it |
| **branch** | a parallel line of work; `main` is the default |
| **merge** | combine one branch into another |
| **push / pull** | send your commits to GitHub / fetch others' commits down |
| **pull request (PR)** | a proposal to merge your branch, where others review it |
| **clone** | download a repo for the first time |
| **diff** | the lines that changed |
| **staging** | choosing which changes go into the next commit |

### The eight commands you'll use

```bash
git init                          # start tracking this folder
git status                        # what's changed? — run this constantly
git add .                         # stage everything
git commit -m "message"           # save a snapshot
git log --oneline                 # history
git diff                          # what changed since the last commit
git push                          # send to GitHub
git pull                          # fetch from GitHub
```

Your daily rhythm for this curriculum is two lines:

```bash
git add .
git commit -m "Day 3: sliding window - min window substring"
```

A public repo with 200 daily commits demonstrates consistency, which is the hardest thing to fake on a resume.

---

## 19.6 Notation used in this curriculum

| You see | It means |
|---|---|
| `arr[i]` | the element at index i (counting from 0) |
| `arr[i:j]` | the slice from i up to **but not including** j |
| `arr[-1]` | the last element |
| `n` | the size of the input, almost always |
| `k` | a second, usually smaller quantity ("the k largest") |
| `V`, `E` | vertices (nodes) and edges, in graph complexity |
| `h` | the height of a tree |
| `O(1)` | constant — independent of input size |
| `dp[i]` | the dynamic-programming table entry for state i |
| `lo`, `hi` | the low and high bounds of a search range |
| `->` | "leads to" in prose; in Python type hints, the return type |
| `⭐` / `🔥` | in [file 12](12-problem-index.md): also in Blind 75 / asked very frequently |
| `# O(n) time, O(1) space` | the complexity of the code above it |

---

## 19.7 How to use this file

Do **not** read it cover to cover. It's a dictionary.

- **Before [01-foundations](01-foundations.md):** read §19.1 (maths) and §19.2 (CS vocabulary). About 20 minutes.
- **Before [09](09-systems-lld-hld-sql.md)/[13](13-lld-deep.md)/[14](14-hld-deep.md):** read §19.3.
- **Now, once:** skim §19.4 so recruiter emails make sense.
- **Whenever a word stops you:** search this file first.

If a term stops you and it *isn't* here, that's a gap worth fixing — note it in [tracker.md](tracker.md) so it can be added.

→ Back to **[README](README.md)** · Next: **[00 — Python From Zero](00-python-from-zero.md)**
