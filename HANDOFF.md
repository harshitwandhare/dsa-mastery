# HANDOFF — Build the Learning Platform

**Read this file first, then [20-website-build-spec.md](20-website-build-spec.md) in full, before writing any code.**

---

## What you are building

A single-user web app that turns this repository's curriculum into an interactive course: lessons as pages, Python runnable in the browser, drills auto-graded, progress and spaced repetition tracked automatically.

**Definition of done for v1:** a complete beginner can work through Day 0 to Day 5 entirely in the browser — read a lesson, write code, run it, see tests pass — with progress and the review queue updating without touching a terminal.

---

## What already exists (do not rebuild these)

| Thing | Location | Status |
|---|---|---|
| Curriculum | `*.md`, 21 numbered files | **Source of truth. Never edit.** |
| Content pipeline | `tools/build_content.py` | **Written and verified. Use it.** |
| Generated content | `web/content/*.json` | 21 lessons, 315 problems, 75 exercises, 104 glossary terms |
| Practice project | `practice/` | Python drills, helpers, benchmarks, 125 passing tests |
| Full specification | `20-website-build-spec.md` | Architecture, data model, features, phases |

**The content pipeline is done and tested.** Run it and you get validated JSON:

```bash
python tools/build_content.py
```

It prints a report and fails loudly if the markdown drifts. Wire it into `prebuild`. **Do not write your own markdown parser** — this one already handles the two problem-table shapes, the ⭐/🔥 flags, NeetCode tier detection, class-based exercises, and inter-document link rewriting.

---

## The data you are given

```
web/content/lessons.json    21 lessons
    { slug, fileNumber, title, sections[], estimatedMinutes, runnableBlocks, body }
    `body` is markdown with links already rewritten to /learn/<slug>

web/content/problems.json   315 problems
    { slug, title, difficulty, topic, patterns[], insight,
      leetcodeUrl, inBlind75, frequentlyAsked, neetcodeTier, orderInList }
    orderInList 1..150 is the exact NeetCode 150 sequence — preserve it as the default sort

web/content/drills.json     2 drills, 75 exercises
    { id, title, sourceFile, exercises[
        { id, drillId, day, name, title, prompt, starterCode, kind, params } ] }
    day0-python has 50 (days 1-4), day1-toolkit has 25
    kind is "function" or "class" — two Day-4 exercises ask for a class

web/content/glossary.json   104 terms
    { term, meaning, section }
```

**What the JSON does not contain:** the hidden test assertions for each exercise. Those live in the `CASES` list at the bottom of `practice/drills/day0_python.py` and `day1_toolkit.py`. Extend `tools/build_content.py` to extract them — that is your first real task, and it must produce a runnable assertion per exercise.

---

## Build order

Follow the phases in [§20.8](20-website-build-spec.md). **Run each acceptance test and report the result before starting the next phase.**

| Phase | Acceptance test |
|---|---|
| 0 Skeleton | `npm run dev` serves every route in §20.4 |
| 1 Content | 21 lessons readable, internal links resolve, 315 problems listed |
| 2 Pyodide | `/playground` runs `print(sum(range(10)))` → 45; an infinite loop is killed without freezing the tab |
| 3 Runnable blocks | every runnable fence in files 00–02 executes correctly |
| 4 Drill runner | all 50 Day-0 exercises gradeable; results match the CLI exactly |
| 5 Problem workspace | solve Two Sum end to end; reload, the attempt persists |
| 6 Dashboard + review | an attempt logged at confidence 2 appears in `/review` the next day |
| 7 Progress + reference | charts render from real attempt data |
| 8 Polish | works offline after first load; Lighthouse ≥ 90 |

**Verify phase 4 against the real thing.** Run `cd practice && python -m drills.day0_python` and confirm your web runner produces identical pass/fail for the same inputs.

---

## Hard constraints

1. **Markdown is the single source of truth.** Generate everything. Never hand-edit `web/content/*.json`, never modify the numbered `.md` files.
2. **Python runs in a Web Worker with a 10-second timeout.** A learner's infinite loop must not freeze the tab.
3. **Show real Python tracebacks, unmodified.** [File 00 §0.15](00-python-from-zero.md) teaches reading them; the app must reinforce that, not hide it.
4. **No gamification beyond the streak counter.** No badges, XP, or confetti.
5. **No backend, no auth, no database in v1.** IndexedDB only.
6. **Hints never reveal answers.** Two-step confirm, then deep-link to the relevant lesson section.
7. **The 22-minute timer must be prominent** on the problem workspace. It is core pedagogy, not a widget.

---

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind · Pyodide in a Web Worker · CodeMirror 6 · IndexedDB via `idb-keyval` · Recharts · Vitest + Playwright · deploy to Vercel.

Put the app in `web/`. Do not restructure the repository root.

---

## Deliverables

- A working `npm run dev` and `npm run build`
- `web/README.md` covering how to run, rebuild content, and deploy
- Vitest coverage of the content build scripts and the spaced-repetition scheduler
- One Playwright test walking the phase-5 acceptance path
- A short report of anything in the spec you disagreed with and why

---

## Context worth having

The owner is a beginner working toward Summer 2027 SWE internships, currently on Day 0 of the curriculum with an active CodeSignal assessment. He is learning Python from scratch. **Design for someone who has never programmed**: clear errors, obvious next actions, no jargon in the UI that isn't defined in the glossary.

The repository is a git repo with one commit. Work on a branch, commit in logical increments with real messages, and do not rewrite existing history.
