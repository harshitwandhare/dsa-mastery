# DSA & Engineering Mastery: Zero to Offer

[![CI](https://github.com/harshitwandhare/dsa-mastery/actions/workflows/ci.yml/badge.svg)](https://github.com/harshitwandhare/dsa-mastery/actions/workflows/ci.yml)
[![CodeQL](https://github.com/harshitwandhare/dsa-mastery/actions/workflows/codeql.yml/badge.svg)](https://github.com/harshitwandhare/dsa-mastery/actions/workflows/codeql.yml)
[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/harshitwandhare/dsa-mastery/badge)](https://scorecard.dev/viewer/?uri=github.com/harshitwandhare/dsa-mastery)
[![Python 3.11+](https://img.shields.io/badge/python-3.11%20%7C%203.12%20%7C%203.13-blue)](https://www.python.org/)
[![Code style: ruff](https://img.shields.io/badge/code%20style-ruff-261230)](https://github.com/astral-sh/ruff)
[![License: MIT + CC BY 4.0](https://img.shields.io/badge/license-MIT%20%2B%20CC--BY--4.0-green)](LICENSE)

A complete algorithms curriculum written from first principles, in two tracks:
21 interview lessons and 8 graduate course lessons, plus 315 indexed problems,
75 graded Python drills, and a runnable practice environment. Everything is
generated from the markdown, so the lessons and the tooling can never disagree.

## Read it in the browser

**<https://dsa-mastery-delta.vercel.app>**

Every lesson renders as a page, and the Python in it runs where you read it.
There is nothing to install and no account to make: Python is compiled to
WebAssembly and executes in your own tab, and your progress is stored in your
own browser.

| | |
|---|---|
| **Lessons** | All 21, with runnable code blocks you can edit in place |
| **Drills** | 75 exercises, graded against the same assertions the CLI uses |
| **Problems** | 315 in NeetCode order, with a 22-minute timer and the analysis template |
| **Review** | Spaced repetition on the schedule from [file 08](08-interview-craft.md) |
| **Reference** | The 16 patterns as flashcards, 104 terms, and a complexity visualiser that times real Python |
| **Playground** | A blank scratchpad, if you only want to write Python |

Press `Ctrl/Cmd + K` anywhere to search, and `?` for the shortcuts. It works
offline after the first visit.

**New here?** Start with [Python From Zero](00-python-from-zero.md) if you have
never programmed, or [Foundations](01-foundations.md) if you have.

## Working on the repository

Read [CONTRIBUTING.md](CONTRIBUTING.md) first. There is one hard rule: the
numbered markdown files are the single source of truth, and nothing may rewrite
them automatically.

| Path | What it is |
|---|---|
| `00-*.md` … `19-*.md` | The curriculum. Never generated, never auto-formatted. |
| `20-website-build-spec.md`, `HANDOFF.md` | Specification for the learning platform. |
| `tools/build_content.py` | Turns the lessons into JSON. 97% test coverage. |
| `web/content/*.json` | Generated. Never hand-edit; rerun the pipeline. |
| `web/` | The Next.js app. |
| `practice/` | Local Python: drills, solutions, helpers, benchmarks. |
| `tests/` | Tests for the pipeline. These gate CI. |

```bash
uv sync --all-groups             # set up the toolchain
python tools/build_content.py    # regenerate web/content from the lessons
uv run pytest -m "not practice"  # the CI gate
uv run pytest -m practice        # your own progress through the problems
npm --prefix web run dev         # the site, on localhost:3000
```

Pushing to `main` deploys to Vercel, and every pull request gets a preview URL.

---

The curriculum is written against a specific plan: a fixed daily time budget, a
target hiring cycle, and Python as the interview language. That plan lives in
[PLAN.md](PLAN.md), along with the application-timing research it was built
from. Read it if you want to know what assumptions the schedules below make, or
adapt it to your own timeline.

---

## 1. Why Python, decided once

You will not revisit this decision. Revisiting language choice is the single most common way people lose two weeks.

**Interviews → Python.**
- 30–50% fewer keystrokes than Java for identical logic. In a 45-minute round where you write ~40 lines, that is a real 5–8 minute margin.
- Built-ins map 1:1 onto interview data structures: `dict` (hash map), `set` (hash set), `list` (dynamic array), `collections.deque` (queue/deque), `heapq` (priority queue), `collections.Counter`, `collections.defaultdict`.
- Accepted at every FAANG, every quant shop, every AI lab.
- Slicing, tuple unpacking, comprehensions, and `enumerate`/`zip` remove entire categories of index bugs.

**Product work → Python (FastAPI) primary, TypeScript secondary.**
This stacks with your existing repos (`job-sentinel`, `atlas-ra`) and with AI/agent work, which is Python-native. One language for DSA + backend + ML means every hour compounds instead of splitting.

**Java / Spring — explicitly deferred.** It's an enterprise-hiring signal (banks, insurance, legacy shops), not a FAANG-or-AI-lab signal. Learning it now costs 60+ hours that buy you nothing this cycle. Revisit only if you specifically target Amazon enterprise teams or a Java shop.

**C++ — no.** Faster runtime, far more footguns under a timer. Only relevant for competitive programming and some HFT roles.

---

## 2. Curriculum map

Work through these in order. Each file is self-contained teaching, not a link dump.

| # | File | What it covers | Time |
|---|---|---|---|
| 00 | [Python From Zero](00-python-from-zero.md) | **Start here if you are new to Python.** Syntax, types, strings, lists, dicts, loops, functions, classes, errors, reading tracebacks | Days 1–4 |
| 01 | [Foundations](01-foundations.md) | How memory works, Big-O from first principles, constraint reading, recursion, the Python DSA toolkit | Days 1–5 |
| 02 | [Arrays, Hashing, Two Pointers, Sliding Window](02-arrays-hashing-pointers.md) | The 40% core. Prefix sums, in-place tricks, window invariants | Weeks 1–3 |
| 03 | [Stacks, Queues, Binary Search, Linked Lists](03-stack-search-linkedlist.md) | Monotonic stack, binary search on the answer, pointer surgery | Weeks 3–5 |
| 04 | [Trees, Tries, Heaps](04-trees-heaps.md) | Traversal templates, BST invariants, top-K, two-heap median | Weeks 5–7 |
| 05 | [Backtracking & Graphs](05-backtracking-graphs.md) | The universal backtracking template, BFS/DFS, topo sort, union-find, Dijkstra | Weeks 7–10 |
| 06 | [Dynamic Programming](06-dynamic-programming.md) | The full DP method: state design, 1-D, 2-D, knapsack, LIS, intervals | Weeks 10–13 |
| 07 | [Greedy, Intervals, Bit Manipulation, Math](07-greedy-intervals-bits.md) | Exchange argument, interval sweeps, bit tricks, number theory | Weeks 13–15 |
| 08 | [Interview Craft — being smarter and faster](08-interview-craft.md) | The 7-phase round script, pattern recognition drills, speed protocol, behavioral/STAR, negotiation | Ongoing from week 1 |
| 09 | [Systems overview: LLD, HLD, SQL, Backend](09-systems-lld-hld-sql.md) | The orientation file for everything systems: read before 13/14/15 | Weeks 9+ |
| 10 | [Resources](10-resources.md) | Every link worth having, ranked, with what to skip | Reference |
| 11 | [Advanced Algorithms & The Gaps](11-advanced-algorithms.md) | Sorting implementations, quickselect, KMP/Rabin-Karp, bitmask DP, advanced graphs, segment trees, math, game theory, randomized, design-heavy structures | Weeks 16–22 |
| 12 | [Complete Problem Index](12-problem-index.md) | **NeetCode 150 (100%) and NeetCode 250 (100%)** plus ~70 further high-frequency extras — ~320 problems, each with pattern and insight; company tendencies | Reference, daily |
| 13 | [Low-Level Design, in depth](13-lld-deep.md) | OOP foundations, SOLID with violations/fixes, every pattern with code, the LLD method, full Parking Lot build, 17 designs | Weeks 12–18 |
| 14 | [High-Level Design, in depth](14-hld-deep.md) | Latency/capacity numbers, every building block, estimation, the 7-phase framework, 21 designs including AI/LLM infra | Weeks 19–28 |
| 15 | [Databases, end to end](15-databases.md) | SQL from zero through window functions, B+ trees and indexes, transactions and isolation, modeling, NoSQL, backend concerns | Weeks 9–13 |
| 16 | [CS Fundamentals](16-cs-fundamentals.md) | OS, networking, HTTP, security, concurrency (GIL, threads, async), Python internals, testing, Git | 1 hr/week, ongoing |
| 17 | [Practice Environment](17-practice-setup.md) | The local Python project: setup, daily commands, local vs online judge, troubleshooting | Set up on day 1 |
| 18 | [CodeSignal OA Sprint](18-codesignal-oa-sprint.md) | **Emergency 5-day protocol** for a CodeSignal GCA: format, 70-min strategy, proctoring setup | When an OA lands |
| 19 | [Prerequisites, Math & Glossary](19-prerequisites-and-glossary.md) | The maths, CS vocabulary, engineering terms, interview lexicon, and terminal/git basics the other files assume | Reference; §19.1–19.2 before file 01 |
| 20 | [Learning Platform Build Spec](20-website-build-spec.md) | Complete spec for the interactive website — hand to a build agent | When you want it built |
| — | [Tracker](tracker.md) | Spaced-repetition log + progress table | Daily |
| — | [practice/](practice/) | The runnable project: scaffolder, timer, benchmarks, 124 verified algorithms | Daily |

### Course track (files 21–28)

A second, independent curriculum for a graduate algorithms class of the CLRS and
Erickson kind. Where the interview track optimises for writing working code
fast, this one optimises for writing proofs that earn full marks. It assumes
nothing from files 00–20, so it can be read cold.

| # | File | Covers |
|---|---|---|
| 21 | [The Course Track: Orientation](21-course-track-orientation.md) | What the class is, how it is graded, pseudocode conventions, the maths toolkit, how to write a proof that scores |
| 22 | [Asymptotics from Zero](22-asymptotics-from-zero.md) | O, Omega, Theta, o, omega from the definitions; proofs with explicit constants; the limit method; reading complexity off loops; amortized analysis |
| 23 | [Recurrences](23-recurrences.md) | Recursion trees, the master theorem and where it fails, substitution, iteration, change of variables, subtract-and-conquer, unequal splits |
| 24 | [Divide and Conquer](24-divide-and-conquer.md) | Mergesort, counting inversions, quickselect, median of medians, the sorting lower bound, Karatsuba, Strassen, closest pair, KMP and Rabin-Karp |
| 25 | [Dynamic Programming](25-dynamic-programming.md) | The five-step recipe, cut-and-paste proofs, the canonical problem set, pseudo-polynomial bounds, DP on trees and DAGs |
| 26 | [Greedy Algorithms](26-greedy.md) | Exchange arguments, greedy-stays-ahead, activity selection, minimizing lateness, Huffman, MSTs and the cut property, matroids |
| 27 | [Graphs and Network Flow](27-graphs-and-network-flow.md) | BFS/DFS structure theorems, topological sort, SCCs, all four shortest-path algorithms, Ford-Fulkerson, max-flow min-cut, modelling with flow |
| 28 | [NP-Completeness](28-np-completeness.md) | P and NP, reductions in the right direction, Cook-Levin, the standard hard problems, writing a hardness proof, approximation, undecidability |

**Reading order if you're starting today:** [17](17-practice-setup.md) (set up the environment) → **[19 §19.1–19.2](19-prerequisites-and-glossary.md)** (the maths and vocabulary everything assumes, ~20 min) → **[00](00-python-from-zero.md)** → 01 → 02 → 03 → 04 → 05 → 06 → 07, with 08 and 12 open alongside from day one. Then 09 as orientation, then 15, 11, 13, 14. File 16 runs one hour a week throughout.

### Master calendar (authoritative: resolves the per-file week ranges)

Each file lists indicative weeks for its own topic. Where those overlap, **this table wins**: weekdays are the DSA track, weekends are the systems track, and they run in parallel.

| Weeks | Weekdays: 90 min (DSA) | Weekends: 2 hr (Systems) | +1 hr/week |
|---|---|---|---|
| **0** | **[00](00-python-from-zero.md) Python from zero, days 1–4** — `python -m drills.day0_python` | set up [17](17-practice-setup.md) | — |
| 1 | [01](01-foundations.md) Foundations, days 1–5 | set up [17](17-practice-setup.md), run `dsa.bench` | [16](16-cs-fundamentals.md) §16.1 |
| 1–3 | [02](02-arrays-hashing-pointers.md) Arrays, hashing, two pointers, sliding window | [08](08-interview-craft.md): write 8 STAR stories | [16](16-cs-fundamentals.md) §16.2 |
| 3–5 | [03](03-stack-search-linkedlist.md) Stack, binary search, linked list | mock #1, recognition drill | [16](16-cs-fundamentals.md) §16.3 |
| 5–7 | [04](04-trees-heaps.md) Trees, tries, heaps | mocks #2–3 | [16](16-cs-fundamentals.md) §16.4 |
| 7–10 | [05](05-backtracking-graphs.md) Backtracking, graphs | **[15](15-databases.md) SQL — LeetCode SQL 50** | [16](16-cs-fundamentals.md) §16.5–16.6 |
| 10–13 | [06](06-dynamic-programming.md) Dynamic programming | [15](15-databases.md) DB internals, indexes, transactions | [16](16-cs-fundamentals.md) §16.7 |
| 13–15 | [07](07-greedy-intervals-bits.md) Greedy, intervals, bits, math | [13](13-lld-deep.md) SOLID + Strategy/Factory/Observer/State | review |
| 15–20 | [11](11-advanced-algorithms.md) Sorting, quickselect, strings, bitmask DP, advanced graphs | [13](13-lld-deep.md) build the 5 Tier-1 designs | — |
| 20–24 | [12](12-problem-index.md) Phase 2 extras (🔥 first) | [14](14-hld-deep.md) concepts, numbers, estimation drills | — |
| 24–30 | maintenance: 1 problem/day + weak areas | [14](14-hld-deep.md) the 5 Tier-1 designs, then Tier 2 and AI infra | — |
| 30+ | maintenance forever | Tier-3 designs, deepen backend and agent work | — |

---

## 3. The daily 90-minute protocol

This structure is the product, not the problem count. Follow it exactly.

```
0–10 min   REVIEW      Re-solve one problem from ~7 days ago, from memory, no notes.
                       If you can't, that's information — re-add it to the queue.

10–50 min  PROBLEM 1   New problem.
                       - 3 min: read, restate, note constraints, ask clarifying Qs out loud
                       - 22 min: struggle. Hard cap.
                       - Then: watch NeetCode solution / read editorial
                       - Re-implement from scratch, closed tab
                       - Log the PATTERN, not the code

50–85 min  PROBLEM 2   Same protocol.

85–90 min  LOG         tracker.md: date, problem, pattern name, one-line insight,
                       time/space complexity, confidence 1–5.
```

**The 22-minute cap is non-negotiable in both directions.** Under it, you're being handed answers and learn nothing. Over it, you're burning your scarcest resource for diminishing returns. The learning happens in minutes 5–22 and then again in the re-implementation.

**Why the 10-minute review is the most important block:** solving 150 problems once produces almost no retention. Spaced repetition is the actual mechanism by which patterns become automatic. Everyone skips this. Skipping it is why people solve 300 problems and still freeze in interviews.

### Weekly shape

| Day | Block |
|---|---|
| Mon–Sat | 90 min DSA protocol |
| Sun | 2 hrs: 1 timed mock (45 min, 2 problems, out loud) + LLD/HLD/SQL rotation |
| Any time outside the block | Applications, resume, projects, OSS |

Applications never come out of the study block. They are separate. Protect the 90 minutes like an enrolled class.

---

## 4. Phase plan

### Phase 1: OA Survival (Weeks 1–8)

Target: solve a random LeetCode Medium in under 25 minutes, ~60% of the time.

That's the online-assessment bar. Most OAs are 2 mediums / 70 minutes.

Order (this ordering matters — each builds on the last):

1. Arrays & Hashing
2. Two Pointers
3. Sliding Window
4. Stack
5. Binary Search
6. Linked List
7. Trees
8. Heap / Priority Queue
9. Backtracking
10. Graphs
11. 1-D Dynamic Programming

~101 problems from NeetCode 150. At 2/day × 6 days = 8.5 weeks. At 1/day minimum, extend to 14 weeks but never break the streak.

**Simultaneously:** apply to 15–20 roles/week. Use your `summer2027-apply` skill. Early OAs you fail are calibration, and virtually every company lets you reapply next cycle.

### Phase 2: Depth + Live Interviews (Weeks 9–16)

- Finish NeetCode 150: Tries, Intervals, Greedy, 2-D DP, Bit Manipulation, Advanced Graphs
- Weekly timed mock, spoken aloud, recorded
- Add LLD (2 hrs/week): SOLID → design patterns → Parking Lot, Elevator, Rate Limiter, LRU Cache, Splitwise
- Add SQL (1 hr/week): LeetCode SQL 50 — cheap, high-yield points
- Behavioral: write 8 STAR stories, rehearse until they're 90 seconds each

### Phase 3: Senior Signal (Weeks 16–28)

- **Advanced algorithms** ([file 11](11-advanced-algorithms.md), weeks 16–22): sorting implementations, quickselect, string algorithms, bitmask DP, advanced graphs, design-heavy data structures
- **LLD** ([file 13](13-lld-deep.md), weeks 12–18): build the five Tier-1 designs into a public `lld-practice` repo
- **HLD** ([file 14](14-hld-deep.md), weeks 19–28): concepts and numbers first, then the five Tier-1 designs, then AI/LLM infrastructure
- **Backend depth:** FastAPI + Postgres + Redis + Docker, one deployed service with real observability
- **AI/agents:** your genuine differentiator. RAG, evals, tool-calling, orchestration. `atlas-ra` is already the artifact — deepen it
- **DSA maintenance:** 1 problem/day forever. Skill decays in weeks

### Phase 4: Full-time (2027)

Same machinery, higher bar: Hard problems appear, HLD is mandatory, behavioral depth increases. If you did Phases 1–3, this is maintenance plus system design.

---

## 5. Non-negotiable rules

1. **Never skip the 10-minute review.** It is the mechanism.
2. **22-minute struggle cap.** Strict, both directions.
3. **Read constraints before you think.** They tell you the intended complexity. Free signal.
4. **Always state brute force first**, give its complexity, then optimize. Never open with the optimal answer — interviewers score your process, and jumping to a memorized optimum reads as memorization.
5. **Talk out loud from day one**, alone, feeling stupid. Silent solving is a different skill from interviewing, and interviews test the spoken one.
6. **Apply before you feel ready.** There is no penalty and no shortage of companies.
7. **Consistency beats volume.** 90 min × 6 days destroys a 9-hour Sunday. Your only real risk is a two-week gap in October when coursework spikes — pre-plan a reduced 30-min "streak-keeper" day instead of a zero day.
8. **Log every problem.** Untracked practice is unmeasurable and unreviewable.
9. **Re-implement after watching a solution.** Watching creates the illusion of competence. Typing it blind creates the competence.
10. **One problem you understand deeply > five you skimmed.**

---

## 6. Progress bar

Copy this into [tracker.md](tracker.md) and update weekly.

- [ ] Phase 0: Foundations (5 days)
- [ ] Arrays & Hashing (9)
- [ ] Two Pointers (5)
- [ ] Sliding Window (6)
- [ ] Stack (7)
- [ ] Binary Search (7)
- [ ] Linked List (11)
- [ ] Trees (15)
- [ ] Heap / PQ (7)
- [ ] Backtracking (9)
- [ ] Graphs (13)
- [ ] 1-D DP (12)
- [ ] Intervals (6)
- [ ] Greedy (8)
- [ ] Advanced Graphs (6)
- [ ] 2-D DP (11)
- [ ] Bit Manipulation (7)
- [ ] Math & Geometry (8)
- [ ] Tries (3)
- [ ] SQL 50
- [ ] 8 STAR stories written & rehearsed
- [ ] 5 LLD designs implemented
- [ ] 5 HLD designs whiteboarded
- [ ] 10 timed mocks completed

---

*Start with [01-foundations.md](01-foundations.md). Do not skip it even though it looks basic — the constraint-reading table alone will save you dozens of hours.*
