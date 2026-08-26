# 08 — Interview Craft: Being Smarter and Faster

**Start week 1. Continue forever.** Knowing algorithms and passing interviews are two different skills. This file is the second one. It is worth more per hour than another 50 problems.

---

## 8.1 What is actually being scored

Interviewers fill in a rubric, usually four axes:

1. **Problem solving** — did you find a reasonable approach, and *how* did you get there?
2. **Coding** — is it clean, correct, and does it compile in your head?
3. **Communication** — could they follow your thinking? Did you take hints?
4. **Verification** — did you test it, or hand it over and hope?

Notice what's absent: "solved it fast." A candidate who reaches the optimal solution silently in 10 minutes often scores *worse* than one who reasons out loud, takes a hint, and lands it in 35. The rubric measures whether you'd be a good colleague on a hard problem — not whether you memorized this one.

This means **the way you talk is not overhead. It is the product.**

---

## 8.2 The seven-phase script for a 45-minute round

Follow this every single time, in practice and live, until it's automatic.

### Phase 1 — Restate (1 min)

> "Let me make sure I have this. I'm given an array of integers and a target, and I need to return the indices of two numbers that sum to the target. Is that right?"

Catches misunderstandings while they're free. Also buys you 60 seconds of thinking time.

### Phase 2 — Clarify (2 min)

Ask 2–4 questions. Not zero — silence reads as not thinking. Not ten — that reads as stalling.

The universal question bank:
- "Can the input be empty or null?"
- "Can values be negative? Zero? Duplicated?"
- "How large can the input get?" ← **always ask this; it determines your target complexity**
- "Is the input sorted, or can I sort it?"
- "Is there exactly one valid answer, or multiple? Any one, or all of them?"
- "Can I modify the input in place?"
- "What should I return if there's no valid answer?"
- (strings) "ASCII or Unicode? Case-sensitive? Whitespace?"

### Phase 3 — Examples (2 min)

Walk one small example by hand. Then propose the edge cases *yourself*:

> "So `[2,7,11,15]` with target 9 gives `[0,1]`. Edge cases I want to handle: empty array, no valid pair, and duplicates like `[3,3]` with target 6."

Naming edge cases unprompted is one of the highest-signal things you can do. Most candidates never do it, and it's free.

### Phase 4 — Brute force + complexity (3 min)

**Always state a brute force. Never skip to the optimum.**

> "The straightforward approach checks every pair — two nested loops, O(n²) time, O(1) space. Given n can be 10⁵ that's 10¹⁰ operations, too slow, but it's a correct baseline."

Three reasons this matters: it guarantees you have *something*; it demonstrates process instead of memorization; and it gives the interviewer a place to hint from. Jumping straight to the optimal answer often reads as "I've seen this problem," which scores lower than deriving it.

### Phase 5 — Optimize (5 min) — think out loud

This is the highest-scoring phase. Narrate the *search*, not just the destination:

> "The waste is that for each element I re-scan the whole array looking for its complement. That lookup is what's expensive. If I store what I've seen in a hash map, lookup becomes O(1). One pass, O(n) time, O(n) space. I'm trading memory for time, which is the right call here."

The pattern to verbalize, always: **identify the repeated work → name the structure that eliminates it → state the new complexity → state the trade-off.**

Get explicit agreement before writing code:

> "Does that approach sound reasonable to you before I code it up?"

If the interviewer hesitates, you just saved 15 minutes of writing the wrong thing.

### Phase 6 — Code (15 min)

Rules while writing:
- **Narrate at the level of intent**, not syntax. Say "now I check whether the complement is in the map," not "now I type if."
- **Use real names.** `seen`, `left`, `window_sum`, `remaining` — not `a`, `b`, `tmp`, `x2`.
- **Write the happy path first.** Then add guards. Announce it: "I'll handle the main logic first and come back to the empty-input case."
- **Say when you're stuck**, don't go quiet: "I'm deciding whether the pointer should move before or after the update — let me think for a second." Ten seconds of silence is fine. Ninety seconds is a red flag.
- **Take hints instantly and gracefully.** "Oh — good point, if there are duplicates that breaks. Let me sort first and skip repeats." Interviewers *expect* to hint; resisting one is a genuine negative.

### Phase 7 — Test (5 min) — do not skip this

Most candidates hand over the code and say "done." Trace it instead, out loud, on a real input:

> "Let me trace `[2,7,11,15]`, target 9. i=0, x=2, need=7, not in seen, so seen={2:0}. i=1, x=7, need=2, which is in seen at index 0 — return [0,1]. Correct."

Then check the edge cases you named in Phase 3:

> "Empty array — the loop doesn't execute, we return []. Good. `[3,3]` target 6 — i=0 stores 3, i=1 finds need=3 in seen, returns [0,1]. Good, and that works because I check before inserting."

Then close:

> "Final complexity: O(n) time, O(n) space. If we needed O(1) space and could modify the input, I'd sort and use two pointers, but that's O(n log n) and loses the original indices."

**That last sentence — an unprompted alternative with its trade-off — is often what turns "hire" into "strong hire."**

---

## 8.3 Getting faster: the recognition drill

Speed does not come from typing faster. It comes from spending 30 seconds on identification instead of 10 minutes on exploration.

### The 60-second identification protocol

Before writing anything, run this checklist. Practice it on problems you've *already solved* until it's reflex.

```
1. What is the INPUT type?
   array / string / tree / graph / grid / linked list / stream / intervals

2. What is the OUTPUT?
   a single value / all solutions / a boolean / a modified structure / a count

3. What do the CONSTRAINTS allow?
   n ≤ 20 → exponential OK (backtracking, bitmask)
   n ≤ 5,000 → O(n²) OK (2-D DP)
   n ≤ 10⁵ → need O(n log n) (sort, heap, two pointers, window)
   n ≤ 10⁹ → need O(log n) (binary search on the answer, math)

4. Which KEYWORDS appear?
   "contiguous"           → sliding window
   "all combinations"     → backtracking
   "shortest / minimum steps" (unweighted) → BFS
   "number of ways"       → DP
   "kth largest/smallest" → heap or quickselect
   "sorted input"         → binary search or two pointers
   "prefix"               → trie
   "dependency / order"   → topological sort
   "connected / groups"   → DFS, BFS, or union-find
   "next greater/smaller" → monotonic stack
   "overlapping ranges"   → sort intervals
   "in O(1) space"        → two pointers, in-place swaps, bit tricks
   "maximize/minimize X subject to Y" → DP, greedy, or binary search on answer
   "values are 1..n" + O(1) space → cyclic sort

5. Which of my ~16 PATTERNS matches?
   If two candidates, pick the simpler and mention the other.
```

**Drill it:** take 20 problems you've already solved. For each, spend exactly 60 seconds naming the pattern — don't code. Check yourself. Do this weekly. Your identification time will drop from minutes to seconds, and that is where interview speed actually comes from.

### The complete pattern inventory

If you can name and template all sixteen of these, you can attempt essentially any interview problem:

| # | Pattern | Trigger |
|---|---|---|
| 1 | Hashing / frequency | "seen before", counting, grouping |
| 2 | Two pointers | sorted, pairs, in-place |
| 3 | Sliding window | contiguous + optimize |
| 4 | Prefix sum | range sums, subarray counts |
| 5 | Binary search (+ on answer) | sorted, or min/max with a checkable condition |
| 6 | Monotonic stack | next greater/smaller |
| 7 | Fast/slow pointers | cycles, middle, nth-from-end |
| 8 | Tree DFS (pre/in/post) | subtree properties |
| 9 | Tree/graph BFS | levels, shortest unweighted path |
| 10 | Heap / top-K | kth, merge-k, running median |
| 11 | Backtracking | all combinations, constraints, small n |
| 12 | Graph traversal + union-find | connectivity, components |
| 13 | Topological sort | dependencies, ordering |
| 14 | Dynamic programming | overlapping subproblems, counting, optimization |
| 15 | Greedy / intervals | local choice provably safe, scheduling |
| 16 | Cyclic sort (index-as-hash) | values are 1..n **and** O(1) space required |

Write this list from memory once a week. If any entry is fuzzy, that's your next study block.

### The speed protocol for a 70-minute OA

Online assessments are pure time management.

```
0:00  Read BOTH problems. Rank by difficulty. (2 min)
0:02  Start with the EASIER one.
      - identify pattern (1 min)
      - code it (12 min)
      - test on given cases + your own edge cases (5 min)
      - SUBMIT
0:20  Second problem.
      - identify (2 min)
      - if you know the optimal: code it (20 min)
      - if you don't: WRITE THE BRUTE FORCE FIRST and submit it
        Partial credit is real. Zero is not recoverable.
      - optimize with remaining time
0:60  Re-read both. Check off-by-ones, empty inputs, integer overflow notes.
0:70  Done.
```

**The single biggest OA mistake is spending 50 minutes on the hard problem and submitting nothing for the easy one.** A working brute force scores points. A half-written optimal solution scores zero.

---

## 8.4 Getting smarter: how to learn instead of memorize

### After every problem, answer these four questions

Write the answers in [tracker.md](tracker.md). Three minutes each, non-negotiable.

1. **What pattern was this?** (from the 15)
2. **What was the trigger** in the problem statement that should have told me?
3. **What was the one key insight?** One sentence. If you can't compress it to one sentence, you don't understand it yet.
4. **What would I get wrong if I saw this again in a month?**

Question 4 is the valuable one. It surfaces the fragile part — the dedup condition, the base case, the `i > start` guard — and that fragile part is exactly what you'll fumble live.

### Spaced repetition schedule

| Confidence after solving | Re-solve at |
|---|---|
| 1–2 (needed the solution) | +1 day, +3 days, +1 week, +3 weeks |
| 3 (solved with hints) | +3 days, +1 week, +1 month |
| 4–5 (solved cleanly) | +2 weeks, +6 weeks |

"Re-solve" means from a blank file, not re-reading your solution. Re-reading produces a strong feeling of competence and almost no actual retention. Typing it blind produces the retention.

### Deliberate practice, not volume

Three things separate people who solve 200 problems and get offers from people who solve 400 and don't:

1. **They re-solve.** Hard problems, three or four times, spread over weeks.
2. **They study one problem in depth** rather than five shallowly. Solve it brute force, then optimal, then space-optimized, then explain it out loud as if teaching.
3. **They practice the parts they're bad at.** If DP scares you, do DP. Grinding arrays because arrays feel good is procrastination with extra steps.

### Learn from your own failures systematically

Keep a **"Mistakes" section** in the tracker. Every time you get something wrong, log the *category*:

```
2026-09-14  Combination Sum II   dedup: used `i > 0` instead of `i > start`
2026-09-16  Validate BST         checked only local children, not inherited bounds
2026-09-18  Coin Change          set dp[0] = inf instead of 0
2026-09-21  Merge Intervals      sorted by end when I needed start
```

After 30 entries, patterns emerge — most people have three or four recurring failure modes, not thirty. Fixing those four is worth more than a hundred new problems.

---

## 8.5 Mock interviews

Starting week 9, one timed mock per week. Non-optional.

**Free options:** [Pramp](https://www.pramp.com/) (peer-to-peer, free), [interviewing.io](https://interviewing.io/) (some free anonymous practice, paid for FAANG engineers), LeetCode's mock section, or a friend with a problem list.

**Solo mock protocol** when no partner is available:
1. Pick a random unseen Medium.
2. Set a 35-minute timer.
3. **Record yourself** (phone voice memo is fine).
4. Run the full seven-phase script, out loud, alone.
5. Play back the recording. Note every silent gap over 20 seconds and every "um, I think maybe."

Playing back your own recording is uncomfortable and it is the fastest improvement mechanism in this file. You will hear yourself go silent for 90 seconds, and you'll never do it again.

---

## 8.6 Behavioral rounds

Every loop has one. At Amazon it's roughly half the decision. Most engineers under-prepare it, which makes it cheap points.

### The STAR format

- **Situation** — context, 1–2 sentences
- **Task** — what you specifically needed to do
- **Action** — what *you* did. "I", not "we". This is 60% of the answer.
- **Result** — the outcome, quantified where possible, plus what you learned

Target 90 seconds to 2 minutes. Rehearse until that's natural.

### Write these eight stories now

Write them out fully, once. Then rehearse. Each story should be reusable for several questions.

1. A technical project you're proud of (your deepest one)
2. A time you disagreed with someone and how it resolved
3. A time you failed or shipped a bug — **and what you changed afterward**
4. A time you learned something hard, fast
5. A time you had to prioritize under pressure with limited time
6. A time you helped someone else / led without authority
7. A time you received hard feedback and acted on it
8. Your most interesting technical debugging story

Your existing work gives you unusually strong raw material for most of these — `job-sentinel` (a shipped v1.0.0 OSS platform), `atlas-ra` (a public multi-agent system with CI/CD), and the StreamDiffusion performance work. Mine those for real numbers: users, stars, latency figures, CI pass rates, the specific bug you fixed. Concrete numbers are what make behavioral answers land.

### Amazon-specific

Amazon interviews explicitly against its Leadership Principles, and interviewers name the principle they're probing. Prepare two stories each for: Customer Obsession, Ownership, Invent and Simplify, Dive Deep, Bias for Action, Deliver Results. Read the official list and map your eight stories onto them.

### "Tell me about yourself" — memorize a 90-second version

Structure: who you are now → one or two things you've built that matter → why this company/role → done. Do not recite your resume chronologically. Rehearse until it's smooth but not robotic. This is the first question in most interviews and it sets the tone for everything after.

### Your questions for them

Always have three. "No questions" reads as disinterest.

- "What does the first 90 days look like for an intern on your team?"
- "What's the hardest technical problem your team has hit this year?"
- "How do you measure whether an intern project was successful?"

---

## 8.7 The application pipeline

DSA gets you through the interview. It doesn't get you the interview.

**Rough funnel math:** ~100 applications → ~10 OAs → ~4 phone screens → ~2 onsites → 1 offer. Those ratios improve substantially with referrals, and they're better than average for anyone with real shipped projects.

**Priority order:**
1. **Referrals.** A referral is worth roughly 5–10 cold applications. Ask alumni from your university on LinkedIn, ask anyone who has starred or contributed to your repos, ask people you've interacted with in OSS. A short, specific message with your GitHub link works.
2. **Apply within 48 hours of a posting going live.** Rolling review is real and the early pile gets read properly.
3. **Resume:** one page, projects-first (your projects are stronger than most candidates' internships), quantified bullets, ATS-safe formatting. You already have the résumé engine for this.
4. **GitHub:** your profile is a live artifact. Pinned repos with real READMEs, CI badges, and clear demos do work that a resume line cannot.

**Track everything.** Company, role, date applied, source (referral/cold), status, next action. You already have the tracker and the `summer2027-apply` skill — use them every week.

**Timeline for right now (Aug–Oct 2026):** Google SWE intern roles posted July 20 and historically close within 2–3 weeks. Amazon and Meta open Aug–Sep. Microsoft Sep–Oct. **Apply this week**, regardless of how prepared you feel. The OA usually arrives 1–2 weeks after applying, which conveniently gives you exactly the buffer this curriculum's Phase 1 is designed to fill.

---

## 8.8 The day before / day of

**Day before:** no new problems. Re-solve two you already know cold — it's for confidence, not learning. Re-read your pattern list and your Mistakes log. Sleep.

**Day of:**
- Test your setup 20 minutes early: camera, mic, the coding environment, a second internet option.
- Have water and paper nearby.
- Warm up on one Easy problem you've done before — cold-starting a brain on the hardest problem of the day is avoidable.
- Have your three questions written down.

**If you completely blank:** say so honestly and go back to fundamentals out loud. "I'm not seeing the trick yet — let me start with the brute force and look for the waste." That is a *recoverable* moment and interviewers respect it. Silence is what kills.

**After:** write down every question asked, while it's fresh. Send a short thank-you note if you have the interviewer's email. Log the outcome. Rejections are data — if you fail on graph problems twice, that's your next two weeks.

---

## 8.9 The compressed version

If you remember only one page of this file:

1. **Restate → clarify → example → brute force → optimize → code → test.** Every time.
2. **Think out loud.** The reasoning is the product, not the code.
3. **Read constraints first.** They tell you the intended complexity.
4. **Never skip the brute force.** It's your floor and your hint-taking surface.
5. **Always test your own code out loud.** Trace a real input.
6. **Take hints instantly and gracefully.**
7. **Name a trade-off at the end**, unprompted.
8. **Re-solve problems.** Solving once is not learning.
9. **Log every mistake by category.** Four recurring failure modes, not forty.
10. **Apply now.** Preparation and applications run in parallel, never in sequence.

→ Next: **[09 — Systems: LLD, HLD, SQL, Backend](09-systems-lld-hld-sql.md)**
