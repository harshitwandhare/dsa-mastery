# 18 — CodeSignal OA: The 5-Day Sprint

**Trigger:** TikTok Fullstack SWE Intern (Global E-Commerce), Summer 2027. CodeSignal pre-screen, **4 questions / 70 minutes / one attempt / 5-day window.**

This file is the emergency protocol for a CodeSignal General Coding Assessment when the window is short. It overrides the normal daily protocol for these five days.

---

## 18.1 What this test actually is

A CodeSignal GCA is **not** a LeetCode contest. That distinction is the single most useful thing to know going in.

| | LeetCode / FAANG OA | CodeSignal GCA |
|---|---|---|
| Rewards | recognising the clever pattern | reading carefully and implementing correctly |
| Problem statements | short | **long, wordy, spec-like** |
| Q1–Q2 | already medium | genuinely easy — loops and string work |
| Main failure mode | can't find the algorithm | **misread the spec, or ran out of time** |
| Partial credit | usually none | **yes, per test case** |

The standard shape:

| Q | Time budget | Difficulty | Typical content |
|---|---|---|---|
| **Q1** | 5–8 min | very easy | one or two loops, string or array manipulation |
| **Q2** | 12–15 min | easy–medium | reading-heavy conversion, simulation, parsing |
| **Q3** | 20–25 min | medium | hash map, sorting, matrix implementation, sometimes BFS or basic DP |
| **Q4** | remainder | hard | optimisation — monotonic stack, harder hash map, DP, graphs |

Scoring is a scaled score whose range depends on the company's configuration, and **each question awards partial credit per passing test case.** That changes your strategy completely: a working brute force on Q4 scores real points, and a blank Q4 scores zero.

**On the "Fullstack" label:** it doesn't change the pre-screen. The GCA is language-agnostic algorithmic implementation — no React, no APIs, no databases. Use Python.

---

## 18.2 Tonight, before anything else (45 minutes)

Do these in order. None of it is studying.

1. **Open the assessment link and find the exact expiry date and time.** Write it down. It's five days from the email, but confirm it yourself — everything below is scheduled backwards from that moment.
2. **Click "Take Now" → "View Sample".** This is the practice interface and it does **not** start the scored test. Learn where the run button is, how to add custom test cases, how to switch language, what the output panel looks like. Do not click "Next" — that begins the real assessment.
3. **Do CodeSignal's own free practice test** if one is offered on your dashboard. Their practice GCA is the closest possible match to the real thing. Nothing else you can do this week is worth as much per hour.
4. **Prepare the physical setup**, because a proctoring flag can invalidate a good score:
   - Photo ID out and ready (student ID, driver's license, or passport — unexpired)
   - **Physically disconnect the second monitor.** Dual monitors are an explicit violation.
   - Phone in another room. Not face-down on the desk — another room.
   - Close every application. You are sharing your entire desktop.
   - Clear desk, decent lighting, door shut, nobody walking in.
   - Test camera and mic.
   - Wired internet if you have it.
5. **Confirm the rules you must not break:** no external IDE, no second device, no online search, no AI tools, no starting the test in two tabs. Any of these can void the attempt.

### What the proctoring actually monitors

Useful to know so you avoid being flagged for something innocent.

**Monitored:** webcam video and stills · your entire desktop screen recording · microphone audio · browser focus (tab switches, window blur) · clipboard and paste events · typing patterns · similarity of your code to known public solutions. A suspicion score is generated and flagged sessions get human review.

**Not monitored:** your wifi network, other devices in the building, or anything outside the webcam's field of view. A roommate's laptop or phone in another room is invisible to it.

**What actually causes flags:**

| Trigger | Why it fires |
|---|---|
| Repeatedly looking down or off-screen | the classic phone tell — also catches people reading paper notes |
| Voices in the background | **your real risk in shared housing**, even if you never respond |
| Anyone entering the camera frame | second-person detection |
| Losing browser focus | alt-tab, or a notification stealing focus |
| Pasting a large block of code | paste-event detection |
| Leaving the frame mid-test | absence detection |

**Therefore:** tell your roommate you are in a proctored exam for 90 minutes and cannot be interrupted or talked near. Shut the door. Quit Slack, Discord, and anything else that can pop a notification. When you need to think, think while looking at the screen rather than down at the desk.

---

## 18.3 The five-day plan

> ### If you are starting from zero Python
>
> This section originally assumed you could already write Python fluently. If you cannot, **do not skip [00 — Python From Zero](00-python-from-zero.md) to cram patterns** — you cannot implement an algorithm you have no syntax for. The revised plan:
>
> | Day | Work |
> |---|---|
> | 1 | [00](00-python-from-zero.md) §0.1–0.8 · `python -m drills.day0_python 1` then `2` |
> | 2 | [00](00-python-from-zero.md) §0.9–0.12 · `python -m drills.day0_python 3` |
> | 3 | [00](00-python-from-zero.md) §0.13–0.17 · `python -m drills.day0_python 4` · re-run all 50 |
> | 4 | Easy problems only: Contains Duplicate, Valid Anagram, Two Sum, Valid Palindrome, Move Zeroes. Plus [§18.4](#184-the-70-minute-strategy) read twice. |
> | 5 | Take it. |
>
> **Realistic target: solve Q1 completely, make a genuine attempt at Q2, submit a brute force on everything else.** Q1 is loops and string manipulation — exactly what days 1–3 teach. That is an achievable goal, and partial credit means it is worth real points. Q3 and Q4 need pattern knowledge you will not have in five days, and that is fine.

### The original plan (if you already write Python comfortably)

Aim for 3 hours a day. If you only have 2, cut the second problem set — never the drills.

### Day 1 — Python implementation fluency

The highest-value day. Q1 and Q2 are won or lost on whether you can express an idea in Python without stopping to think about syntax.

**Drill (60 min).** Open [01-foundations.md §1.5](01-foundations.md) and type out every snippet by hand into a REPL. Not copy-paste — typing builds recall. Focus on:
- `Counter`, `defaultdict`, `dict.get`, `setdefault`
- `sorted(x, key=lambda ...)` with tuple keys and `reverse`
- string methods: `split`, `join`, `strip`, `isalnum`, `ord`/`chr`, slicing
- 2-D grids: `[[0]*c for _ in range(r)]`, bounds checks, direction vectors
- `enumerate`, `zip`, comprehensions, `any`/`all`

**Problems (90 min)** — all Easy, all from [the index](12-problem-index.md):
Contains Duplicate · Valid Anagram · Two Sum · Valid Palindrome · Best Time to Buy and Sell Stock · Move Zeroes

**Reading-comprehension drill (30 min).** Pick two Medium problems. Do *not* solve them. Instead write down, in your own words: what the input is, what the output is, and three edge cases. Then read the constraints. This is exactly what Q2 tests and almost nobody practices it.

### Day 2 — Hash maps, two pointers, matrices

Read [02-arrays-hashing-pointers.md](02-arrays-hashing-pointers.md) patterns 1 and 2.

**Problems:** Group Anagrams · Top K Frequent Elements · Product of Array Except Self · Valid Sudoku · Merge Sorted Array · Sort Colors

**Then matrix implementation**, which fills the Q3 slot constantly: Rotate Image · Spiral Matrix · Set Matrix Zeroes (all in [07](07-greedy-intervals-bits.md))

### Day 3 — Sliding window, stack, string parsing

Read [02 pattern 3](02-arrays-hashing-pointers.md) and [03 pattern 4](03-stack-search-linkedlist.md).

**Problems:** Longest Substring Without Repeating Characters · Minimum Size Subarray Sum · Valid Parentheses · Evaluate Reverse Polish Notation · Daily Temperatures

**String parsing** (the classic Q2 shape): String to Integer (atoi) · Longest Common Prefix · Reverse Words in a String · Compare Version Numbers

Daily Temperatures matters disproportionately — monotonic stack is a named favourite for the Q4 optimisation slot.

### Day 4 — Full timed mock

**Take a complete 70-minute, 4-question mock.** Use CodeSignal's practice GCA if available. Otherwise build one from the index: one Easy, two Medium, one Hard, and run the real clock.

Rules: no notes, no autocomplete, no looking anything up. Simulate it properly.

Then spend the rest of the day reviewing **every mistake**, and re-solving whatever you failed, from blank.

### Day 5 — Take it

**Do not study.** Warm up on one Easy problem you already know cold, then take the assessment.

Take it in the **morning**, when you're fresh, and leave buffer before the expiry. Never on the last hour of the last day, in case of a technical problem.

---

## 18.4 The 70-minute strategy

Write this on paper and keep it beside you.

```
00:00  Read Q1 only. Solve it. Submit. Do not read ahead first.
00:08  Q2. Read the ENTIRE statement twice before typing.
       Write input -> output in your own words.
00:22  Q3. Same. If you are stuck at 00:35, write the brute force,
       submit it for partial credit, and move on.
00:45  Q4. Read it. Decide within 3 minutes whether you see the
       optimal approach.
         yes -> implement it
         no  -> WRITE THE BRUTE FORCE. Submit it. Partial credit is
                real; a blank answer scores zero.
01:03  Stop new work. Re-run every question. Check edge cases:
       empty input, single element, all-same values, negatives,
       off-by-one at the boundaries.
01:10  Done.
```

**The eight rules that decide your score:**

1. **Never leave a question blank.** Partial credit per test case is the whole game. A brute force passing 6 of 20 tests beats an elegant unfinished solution passing 0.
2. **Read the statement twice before typing.** The most common CodeSignal failure isn't "couldn't solve it" — it's "solved the wrong problem." The statements are long on purpose.
3. **Use the custom test case box.** You can run your code on your own inputs. Do it before every submit.
4. **Bank Q1–Q3 before touching Q4.** Q4 is worth points you may not be able to get; Q1–Q3 are points you definitely can. Spending 40 minutes on Q4 and rushing Q3 is the classic way to fail.
5. **Watch the clock, hard.** If a question exceeds its budget, submit what works and move on. Return later if time remains.
6. **Brute force first, always.** Get something passing, then optimise in place. Never write the optimal solution as your first attempt under a clock.
7. **Handle the obvious edge cases** before submitting: empty, single element, duplicates, negatives, boundaries.
8. **Do not touch your phone or leave the frame.** A proctoring flag can invalidate a score you earned.

---

## 18.5 Honest expectations

You're taking this after five days of preparation from near-zero. Passing is possible. It is not the likely outcome, and that's fine.

Three things are true at once:

- **Not taking it is a guaranteed zero.** The link expires and there's no deferral. Take it.
- **The invitation itself is the meaningful signal.** TikTok screened your application and moved you forward. The half of the funnel where most people die — getting past resume screening — already worked. That isn't luck; it's `job-sentinel` and `atlas-ra` doing their job.
- **This score locks for TikTok's 2027 season** ("we will only use your first score"). So maximise it — but don't let that become paralysis, because waiting isn't an option the link gives you.

Whatever happens, the five days aren't spent. Everything on this plan is week 1–3 of the main curriculum pulled forward. You end the week ahead, plus one real OA of calibration data that no amount of practice can substitute for.

**Immediately afterwards:** write down every question you remember, while it's fresh. Log it in [tracker.md](tracker.md). If you fail at the Q3/Q4 boundary, that tells you precisely which two weeks of the roadmap matter most — and that information is worth more than the attempt was.

---

→ Back to **[README](README.md)** · Then resume the normal protocol at [01-foundations.md](01-foundations.md)
