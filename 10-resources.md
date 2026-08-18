# 10 — Resources

Ranked by usefulness, with explicit guidance on what to skip. **The most common failure mode in DSA prep is collecting resources instead of using one.** Pick the primary in each category and ignore the rest until it's exhausted.

---

## Primary stack — this is all you actually need

| Purpose | Resource | Cost |
|---|---|---|
| **Problem list + video solutions** | [NeetCode.io](https://neetcode.io/practice) — the roadmap view with the dependency graph | Free |
| **Practice platform** | [LeetCode](https://leetcode.com/) | Free tier is enough |
| **Video explanations** | [NeetCode YouTube](https://www.youtube.com/@NeetCode) | Free |
| **Mock interviews** | [Pramp](https://www.pramp.com/) (peer, free) / [interviewing.io](https://interviewing.io/) | Free / paid |
| **SQL** | [LeetCode SQL 50](https://leetcode.com/studyplan/top-sql-50/) | Free |
| **System design** | [system-design-primer](https://github.com/donnemartin/system-design-primer) | Free |
| **LLD** | [low-level-design-primer](https://github.com/prasadgujar/low-level-design-primer) | Free |

**That's the whole stack.** Everything below is optional supplementation. If you're deciding between adding a resource and doing two more problems, do the problems.

---

## Problem lists

- **[NeetCode 150](https://neetcode.io/practice)** — your primary. Curated, ordered by dependency, video solution for every problem in multiple languages. The dependency-graph UI physically prevents you from attempting graphs before you've done arrays and trees, which is genuinely good pedagogy.
- **[Blind 75](https://www.teamblind.com/post/New-Year-Gift---Curated-List-of-Top-75-LeetCode-Questions-to-Save-Your-Time-OaM1orEU)** — the original list NeetCode 150 extends. Use it as a final-week revision set, not a primary.
- **[NeetCode 250 / NeetCode All](https://neetcode.io/practice)** — after 150, if you want more volume in a weak area.
- **[Striver's A2Z DSA Sheet](https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/)** — more exhaustive, more theory-heavy, Java/C++ oriented. Good as a *reference* for a topic you're weak in. Doing all of it is not a good use of your time budget.
- **[LeetCode company tags](https://leetcode.com/company/)** — in the 2–3 weeks before a specific interview, filter by that company and by "last 6 months." This is what premium is actually worth paying for, and only then.

---

## Learning the concepts

**Free, high quality:**
- [NeetCode YouTube](https://www.youtube.com/@NeetCode) — best explanations for interview-style problems, Python-first
- [Abdul Bari (algorithms)](https://www.youtube.com/@abdul_bari) — the best algorithm-theory channel that exists; go here when you want to genuinely *understand* an algorithm rather than pass a problem
- [MIT 6.006 Introduction to Algorithms](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/) — a real university course, free. Watch selectively when a topic won't click.
- [Errichto](https://www.youtube.com/@Errichto) — competitive-programming perspective; excellent for speed and for binary search intuition
- [Visualgo](https://visualgo.net/en) — animated data structures. Ten minutes here beats an hour of reading when you're confused about heaps or AVL rotations.
- [Big-O Cheat Sheet](https://www.bigocheatsheet.com/) — one-page reference
- [Python `collections` docs](https://docs.python.org/3/library/collections.html) and [`heapq` docs](https://docs.python.org/3/library/heapq.html) — read them once, properly

**Paid, worth it only if you have a specific gap:**
- [AlgoMonster](https://algo.monster/) — pattern-first organization; good if you want more structure than NeetCode
- [Grokking the Coding Interview (Educative)](https://www.educative.io/courses/grokking-coding-interview) — the original pattern-based course. Its main value is the *framing*; this curriculum already gives you that framing for free.
- **Books:** *Cracking the Coding Interview* (dated in places, still the standard behavioral/process reference), *Elements of Programming Interviews in Python* (harder, excellent problems), *Designing Data-Intensive Applications* by Kleppmann (the best systems book ever written — read it slowly during Phase 3, not now)

---

## System design

- **[system-design-primer](https://github.com/donnemartin/system-design-primer)** — free, comprehensive, includes Anki flashcards. Read the concept sections first, then the worked examples.
- **[ByteByteGo](https://bytebytego.com/)** + [Alex Xu's *System Design Interview* Vol 1 & 2](https://www.amazon.com/dp/B08CMF2CQF) — the clearest paid material. Worth it before full-time interviews.
- **[Gaurav Sen YouTube](https://www.youtube.com/@gkcs)** — strong intuition, real production experience
- **[Hussein Nasser YouTube](https://www.youtube.com/@hnasr)** — backend engineering depth (databases, networking, protocols). Excellent for the backend-role questions in [file 09](09-systems-lld-hld-sql.md).
- **[low-level-design-primer](https://github.com/prasadgujar/low-level-design-primer)** — LLD problems with solutions
- **[Refactoring Guru](https://refactoring.guru/design-patterns)** — the best design-patterns reference, with diagrams and code

---

## Practice environments and mocks

- **[Pramp](https://www.pramp.com/)** — free peer mock interviews. Quality varies with your partner, but the *speaking practice* is the point and that works regardless.
- **[interviewing.io](https://interviewing.io/)** — anonymous mocks with real FAANG engineers. Some free, mostly paid. The feedback quality is the best available.
- **[LeetCode Mock](https://leetcode.com/interview/)** — timed problem sets, no human
- **[Codeforces](https://codeforces.com/)** — competitive programming. Only if you want speed training and enjoy it; it is *not* on the critical path.

---

## Applications and job search

- **[Simplify](https://simplify.jobs/)** — autofill applications, plus a live big-tech internship list
- **[GitHub: summer-2027-internships](https://github.com/sndsh404/summer-2027-internships)** — community-maintained live posting tracker. Check weekly.
- **[levels.fyi](https://www.levels.fyi/)** — compensation data, for negotiation and target-setting
- **[Blind](https://www.teamblind.com/)** — anonymous industry discussion; useful for timelines and interview reports, heavily biased toward negativity. Calibrate accordingly.
- Your own **`summer2027-apply` skill** and internship tracker — the pipeline you already have. Use it weekly.

---

## What to skip

Being explicit about this is as valuable as the recommendations.

- **Do not do all of Striver + NeetCode + Blind 75 + Grokking.** They overlap ~80%. Pick one primary.
- **Do not learn a second language for DSA.** Python is decided. See [README §1](README.md).
- **Do not start with system design.** It doesn't gate internships and it consumes time DSA needs right now.
- **Do not do competitive programming** unless you enjoy it as a hobby. Codeforces skills only partially transfer, and the time cost is high.
- **Do not buy LeetCode Premium yet.** Buy it 2–3 weeks before a specific company's interview, for the company-tagged questions. Before that it adds nothing.
- **Do not watch "top 10 DSA tips" videos.** You have the plan. Watching content about preparing is a substitute for preparing.
- **Do not read solutions before struggling for 22 minutes.** See the [daily protocol](README.md#3-the-daily-90-minute-protocol).

---

## The one-line version

**NeetCode 150 in Python, 2 problems a day, log every one, re-solve on schedule, apply every week starting now.** Everything else on this page is optional.

→ Back to **[README](README.md)** · Log your work in **[tracker.md](tracker.md)**
