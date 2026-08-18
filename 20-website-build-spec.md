# 20 — Learning Platform: Build Specification

**Status:** ready to hand to a build agent.
**Working title:** `dsa-mastery-web`
**Owner:** Harshit Wandhare
**Source content:** the 21 markdown files and `practice/` project in this repository.

This document is the complete brief. An agent given this file plus the repo should be able to build the product without further clarification. §20.11 is the prompt to hand over.

---

## 20.1 What this is and why

**Problem.** The curriculum currently lives as markdown files plus a local Python project. That works, but three things are lost: progress is tracked by hand in a markdown table, running code requires a terminal, and spaced repetition depends on remembering to do it.

**Product.** A single-user web app that turns the curriculum into an interactive course: lessons rendered as pages, code runnable in the browser, drills auto-graded, progress and the spaced-repetition queue tracked automatically.

**Explicit non-goals.** Not a LeetCode competitor. Not multi-user, not a social product, not monetised. No user accounts in v1. It is a personal learning tool, and every feature decision should be judged against "does this make Harshit learn faster."

**Definition of done for v1:** he can complete Day 0 through Day 5 entirely in the browser — read the lesson, write code, run it, see tests pass, and have his progress and review queue update without touching a terminal.

---

## 20.2 Users and core flows

One user. Four flows.

**Flow A — Learn.** Open a lesson → read → hit an embedded code block → edit it → run it → see output inline. No context switch to a terminal.

**Flow B — Drill.** Open a drill (Day 0's 50 exercises, Day 1's 25) → see the exercise list with pass/fail state → write into an editor → run → get per-exercise green/red immediately. Same feedback loop as `python -m drills.day0_python`, but visual.

**Flow C — Solve.** Open a problem from the 327-problem index → see the analysis template (constraints, brute force, optimal, insight) → start a 22-minute timer → write a solution → run it against test cases → log the result.

**Flow D — Review.** Open the dashboard → see what's due for re-solving today → do it → the interval updates automatically.

---

## 20.3 Technology

Chosen for: zero backend in v1, zero running cost, fast to build, and it runs offline.

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 15 (App Router) + TypeScript** | static export, file-based routing, huge ecosystem |
| Styling | **Tailwind CSS** | fast, consistent, dark mode built in |
| Python runtime | **Pyodide** (CPython compiled to WebAssembly) | full Python in the browser, no server, no cost, works offline. Includes the stdlib, so `collections`, `heapq`, `bisect`, `itertools` all work |
| Code editor | **CodeMirror 6** | lighter than Monaco, good Python mode, mobile-friendly |
| Content | Markdown → **MDX** at build time | the existing `.md` files are the source of truth |
| Storage | **IndexedDB** via `idb-keyval` | local-first, survives refresh, no accounts |
| Charts | **Recharts** | progress over time, complexity benchmark plots |
| Hosting | **Vercel** (free tier) | zero config for Next.js |
| Tests | **Vitest** + **Playwright** | unit and one end-to-end path |

**Pyodide notes for the implementer.** It is a ~10 MB download; load it lazily on first code-run and cache in a service worker. Run it in a **Web Worker** so a student's infinite loop doesn't freeze the UI — the worker can be terminated on a timeout (default 10 s). Capture `stdout`/`stderr` by redirecting `sys.stdout` to a JS callback.

**Deferred to v2, deliberately:** any backend, any auth, any database. If cross-device sync is ever wanted, add Supabase and sync the same IndexedDB shapes — the data model below is designed for that.

---

## 20.4 Information architecture

```
/                        Dashboard: streak, due reviews, next action, progress
/learn                   Curriculum index (all 21 files as a tree)
/learn/[slug]            One lesson, with runnable code blocks
/drills                  Drill index
/drills/[id]             One drill: exercise list + editor + runner
/problems                The 327-problem index, filterable
/problems/[slug]         One problem: template, editor, tests, timer
/review                  Today's spaced-repetition queue
/progress                Charts, mistakes log, weekly review
/reference               Glossary (file 19) + pattern inventory, searchable
/playground              Blank Python scratchpad
```

---

## 20.5 Data model

All client-side. TypeScript types are the contract.

```ts
type Lesson = {
  slug: string;              // "01-foundations"
  fileNumber: number;
  title: string;
  sections: Section[];       // parsed from ## headings
  estimatedMinutes: number;
  prerequisites: string[];   // slugs, drives the "you should read X first" banner
};

type Exercise = {
  id: string;                // "day0.ex04"
  drillId: string;           // "day0-python"
  day: number;               // 1-4, for the day filter
  title: string;             // "ex04 is_even"
  prompt: string;            // the docstring
  starterCode: string;       // signature + `raise TODO`
  testCode: string;          // asserts, hidden from the learner until they pass
  hintUrl?: string;          // deep link into the lesson section
};

type Problem = {
  slug: string;              // "two-sum"
  title: string;
  difficulty: "easy" | "medium" | "hard";
  topic: string;             // "arrays_hashing"
  patterns: string[];        // ["hashing"]
  insight: string;           // the one-line insight from file 12
  leetcodeUrl: string;
  inBlind75: boolean;
  frequentlyAsked: boolean;
  neetcodeTier: 150 | 250 | "extra";
  starterCode: string;
  testCases: TestCase[];
};

type Attempt = {
  id: string;
  targetId: string;          // exercise id or problem slug
  targetType: "exercise" | "problem";
  timestamp: number;
  durationSeconds: number;
  passed: boolean;
  confidence: 1|2|3|4|5;     // asked after each attempt
  code: string;              // what they wrote, for later diffing
  notes: string;             // pattern + insight, the tracker.md fields
};

type ReviewItem = {
  targetId: string;
  dueDate: number;
  round: number;             // how many times reviewed
  lastConfidence: number;
};

type Progress = {
  completedLessons: string[];
  streakDays: number;
  lastActiveDate: string;
  mistakes: { date: string; targetId: string; category: string; note: string }[];
};
```

**Spaced-repetition schedule** — implement exactly the table from [08 §8.4](08-interview-craft.md):

```ts
const INTERVALS: Record<number, number[]> = {
  1: [1, 3, 7, 21],   // days, for confidence 1-2
  2: [1, 3, 7, 21],
  3: [3, 7, 30],      // confidence 3
  4: [14, 42],        // confidence 4-5
  5: [14, 42],
};
```

On each completed attempt: look up the interval list by confidence, take `intervals[round]`, set `dueDate = now + days`, increment `round`. When `round` exceeds the list, retire the item.

---

## 20.6 Content pipeline

The markdown files stay the single source of truth. A build script transforms them; **it must never require editing the source `.md` files by hand.**

```
scripts/build-content.ts
  ├─ read ../*.md
  ├─ parse frontmatter-less markdown (remark)
  ├─ extract: title (H1), sections (H2), estimated time (from "Days X" / "Weeks X")
  ├─ rewrite inter-file links:  (02-arrays-...md)  ->  /learn/02-arrays-...
  ├─ tag python code fences as runnable unless marked ```python:static
  └─ emit content/lessons.json

scripts/build-problems.ts
  ├─ parse 12-problem-index.md tables
  ├─ every row -> Problem { title, difficulty, pattern, insight, tier, flags }
  └─ emit content/problems.json      (expect ~327 rows)

scripts/build-drills.ts
  ├─ parse practice/drills/day0_python.py and day1_toolkit.py with a Python AST pass
  ├─ each `def exNN_*` -> Exercise { prompt from docstring, starterCode, day }
  ├─ CASES list -> testCode per exercise
  └─ emit content/drills.json
```

Run all three in `prebuild`. **Acceptance:** editing a `.md` file and rebuilding must update the site with no other change.

---

## 20.7 Feature specifications

### F1 — Runnable code blocks (highest value, build first)

Every ```python fence in a lesson renders with a **Run** button. Clicking runs it in Pyodide and shows stdout inline beneath. Editable in place; edits persist per block in IndexedDB.

- Fences marked ```python:static render as plain code with no Run button (use for illustrative snippets that don't execute standalone).
- Errors render the real Python traceback, monospaced. **Do not prettify it** — [file 00 §0.15](00-python-from-zero.md) teaches reading tracebacks, and the app must reinforce that.
- Preload `dsa.helpers` (ListNode, TreeNode, build_list, build_tree) into the Pyodide namespace so tree and list snippets run without setup.

### F2 — Drill runner

Left: exercise list with state (not attempted / passing / failing). Right: editor for the selected exercise, Run button, result panel.

- Run executes the learner's function plus its hidden test, reports pass/fail with `got` vs `expected` — mirror the CLI output format exactly.
- **"Reveal hint" is a two-step confirm** and deep-links to the relevant lesson section. It never shows the answer.
- A per-drill progress bar. On 100%, a completion state and a prompt to log it.

### F3 — Problem workspace

- Analysis template above the editor as **required fields**: constraints, target complexity, brute-force idea, optimal idea. Persisted per problem.
- **The 22-minute timer is prominent.** At 22:00 it does not block anything, but it shows a banner: "Time. Open the editorial, then re-implement from blank." This is the pedagogy from [file 08](08-interview-craft.md) and it must be visible, not buried.
- Run against visible test cases; "Add your own test case" is a first-class button (writing your own cases is a taught skill).
- On finish: confidence prompt 1–5, notes field, and the review item schedules itself.

### F4 — Dashboard

Answers exactly one question: **what do I do right now?**

- Today's due reviews (count + a Start button)
- Next lesson or drill in sequence
- Streak counter with the month grid from [tracker.md](tracker.md)
- Application-deadline reminders (static list from [README §0](README.md))
- Nothing else. Resist adding vanity metrics.

### F5 — Progress and mistakes

- Problems solved over time; per-topic completion against NeetCode 150 / 250
- **Mistakes log grouped by category** — the point is to surface the three or four recurring failure modes, so make the grouping the primary view, not a flat list
- Weekly review form matching the tracker table

### F6 — Reference

- Searchable glossary from [file 19](19-prerequisites-and-glossary.md)
- The 16-pattern inventory as flashcards (name → trigger → template)
- Complexity ladder and the constraint→complexity table, always one click away

### F7 — Complexity visualiser

Port `practice/dsa/bench.py` to run in Pyodide and plot the results with Recharts. Seeing O(n²) curve away from O(n) is the single most convincing thing in the whole curriculum — it deserves a real chart, not a text table.

---

## 20.8 Build phases

Each phase ships something usable. Do not start a phase before the previous one's acceptance test passes.

| Phase | Scope | Acceptance test |
|---|---|---|
| **0. Skeleton** | Next.js + TS + Tailwind, routes, layout, dark mode | `npm run dev` serves all routes with placeholder content |
| **1. Content** | The three build scripts; lessons render | All 21 lessons readable; internal links resolve; 327 problems listed |
| **2. Python** | Pyodide in a Web Worker, output capture, 10 s timeout | `/playground` runs `print(sum(range(10)))` and prints 45; an infinite loop is killed without freezing the tab |
| **3. F1** | Runnable lesson code blocks | Every runnable fence in files 00–02 executes correctly |
| **4. F2** | Drill runner | All 50 Day-0 exercises gradeable; matches CLI results exactly |
| **5. F3 + storage** | Problem workspace, timer, IndexedDB persistence | Solve Two Sum end to end; reload the page and the attempt is still there |
| **6. F4 + review** | Dashboard, spaced repetition | An attempt with confidence 2 appears in `/review` the next day |
| **7. F5–F7** | Progress, reference, visualiser | Charts render from real attempt data |
| **8. Polish** | Keyboard shortcuts, mobile, service worker, Lighthouse | Works offline after first load; Lighthouse ≥ 90 |

**Estimate:** phases 0–5 are the core and are roughly a week of focused agent work. 6–8 are another few days.

---

## 20.9 Design direction

- **Reading-first.** Lesson pages are documents: generous line height, ~70-character measure, real typographic hierarchy. Not a dashboard with text stuffed in.
- **Dark mode by default**, light mode available. Respect `prefers-color-scheme`.
- **One accent colour.** Green for pass, red for fail, and that's the palette. Resist decoration.
- **The code editor is the centre of gravity** on drill and problem pages. Give it the most space.
- **No gamification.** No badges, no confetti, no XP. The streak counter is the only motivational element, because it maps to a real behaviour that matters. Everything else is noise that competes with learning.
- **Keyboard-first:** `Cmd+Enter` runs code, `Cmd+K` opens search, `?` shows shortcuts.
- Accessible: proper focus states, semantic HTML, WCAG AA contrast.

---

## 20.10 Risks and decisions already made

| Risk | Decision |
|---|---|
| Pyodide's 10 MB download | Lazy-load on first run; cache via service worker; show a one-time "preparing Python" state |
| Infinite loops freezing the browser | Run in a Web Worker; hard-terminate after 10 s |
| Content drifting from the markdown | Markdown is the only source of truth; the site is generated. Never hand-edit generated JSON |
| Scope creep into a LeetCode clone | v1 is single-user with no backend. Any feature not serving the four flows in §20.2 is out |
| Losing progress data | Export/import JSON button in settings from phase 5 |
| Over-engineering the UI | The definition of done is Day 0–5 completable in-browser. Ship that before anything else |

---

## 20.11 The handoff prompt

Copy this to the build agent verbatim.

> Build a personal DSA learning web app from the specification in `20-website-build-spec.md` in this repository. Read that file completely before writing any code, then read `README.md` for curriculum structure, `12-problem-index.md` for the problem data, and `practice/drills/day0_python.py` for the drill format.
>
> Stack: Next.js 15 App Router, TypeScript, Tailwind, Pyodide in a Web Worker, CodeMirror 6, IndexedDB via idb-keyval. No backend, no auth, no database.
>
> Work through the build phases in §20.8 **in order**. After each phase, run its acceptance test and report the result before continuing. Do not begin a phase until the previous one passes.
>
> Hard constraints:
> - The markdown files in the repository root are the single source of truth. Generate content from them with build scripts. Never hand-edit generated output, and never modify the source `.md` files.
> - Python execution must happen in a Web Worker with a 10-second timeout.
> - Show real Python tracebacks unmodified — the curriculum teaches reading them.
> - No gamification beyond the streak counter.
> - The v1 definition of done: a complete beginner can do Day 0 through Day 5 entirely in the browser, with progress and spaced repetition tracked automatically.
>
> Deliver a working `npm run dev`, a `README.md` explaining how to run and deploy it, and Vitest coverage of the content build scripts and the spaced-repetition scheduler.

---

## 20.12 After it's built

The site is a tool, not the goal. Two things worth remembering:

**Do not let building it become a substitute for using it.** You are a strong builder; the risk is that this project becomes the interesting thing and the studying stops. Hand it to an agent, keep doing the daily protocol in the terminal meanwhile, and switch over when it works.

**It is also a portfolio artifact.** A polished, genuinely useful learning platform with in-browser Python execution is a stronger GitHub project than most internship applicants have — and unlike a tutorial project, you'll have real usage data on it. Make it public when it's good.

→ Back to **[README](README.md)**
