# Changelog

All notable changes to this project are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and
this project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
Because the curriculum is the substance of the project, a version records what a
reader can do, not only what changed in the code.

## [Unreleased]

Nothing yet.

## [0.2.0] - 2026-08-18

The platform is finished: every phase and feature in the
[build specification](20-website-build-spec.md) is implemented.

### Added

- The sixteen-pattern inventory as flashcards, generated from file 08. The
  trigger is the hidden side, because recognising "sorted, pairs, in-place" and
  reaching for two pointers is the direction recall has to work in.
- A complexity visualiser that times real Python in the browser at growing
  sizes and plots the result. Each measurement repeats until it is above the
  clock's resolution, so a set lookup reads as constant rather than as zero.
- Cmd+K search across every lesson, problem, drill and pattern, and `?` for the
  shortcut sheet.
- Offline support. The app is cached stale-while-revalidate; Pyodide is cached
  cache-first and never revalidated, since it is a 10 MB download pinned to one
  version.
- Export and import of progress. Everything lives in one browser profile with no
  server copy, so this is the only backup that exists. Importing merges, so an
  older file cannot wipe out newer work.
- The mistakes log, grouped by category rather than listed flat, because the
  point is surfacing the three or four failure modes that keep recurring.
- The drill runner: all 75 exercises graded in the browser against the
  assertions extracted from the drill files, so passing here means passing
  `python -m drills.day0_python`.
- The problem workspace: the analysis template as required fields, the
  22-minute timer, and attempts logged to a review schedule.
- Progress charts and a review queue, both drawn only from what you have
  actually done.
- A hero you can play with, and a python that follows the page as you scroll.
  Both are skipped under `prefers-reduced-motion` and below 1280px.

### Changed

- The site has its own design rather than the dark-navy-and-accent formula:
  warm paper, Fraunces set optically, one ochre accent, and a dark mode that
  stays warm instead of turning blue.
- Native `<select>` elements are gone. They render their list with the
  operating system, which ignores the page entirely.

### Fixed

- Two palette tokens failed WCAG AA while looking fine. `--text-faint` sat at
  3.66 on paper and 4.28 on charcoal while being used for small metadata.
- The hero glyphs could not be picked up. The canvas carried
  `pointer-events: none`, and the reading column painted above the ones behind
  it.
- The complexity visualiser timed each call once, which put a set lookup below
  the clock's resolution and reported a growth ratio of 0.0x. It now repeats
  each measurement until it is measurable.
- The code editor announced the previous exercise to a screen reader after
  switching, because its `aria-label` was fixed when the editor was created.

### Known limitations

- Lighthouse has not been measured. The structural work is done, but the number
  is unverified.
- Offline is registered and the caches are in place, but a full
  network-off reload has not been tested.

## [0.1.0] - 2026-08-18

The curriculum becomes something you can run. Phases 0 to 3 of the
[build specification](20-website-build-spec.md), plus the production
infrastructure the repository had been missing.

### Added

**The learning platform**: <https://dsa-mastery-delta.vercel.app>

- Landing page explaining what the curriculum is, and routing into it.
- All 21 lessons rendered as documents: syntax-highlighted code, scrollable
  tables, heading anchors, resolved internal links, and a section outline. They
  read with JavaScript switched off.
- Python running in the page through Pyodide in a Web Worker, with a hard
  10-second timeout so a beginner's infinite loop stops the code rather than the
  tab. Tracebacks are shown exactly as Python wrote them, because
  [file 00](00-python-from-zero.md) teaches reading them.
- Run and Edit on lesson code blocks, with a CodeMirror editor mounted only when
  a reader actually wants to change something.
- Blank playground with a persisted draft and worked samples.
- Problem browser over all 315 problems, filterable by topic, difficulty,
  NeetCode 150, Blind 75 and frequency.
- Searchable glossary of 104 terms.

**Toolchain**

- Root `pyproject.toml` driving ruff, mypy and pytest through uv, with `uv.lock`
  committed.
- 84 tests for the content pipeline, taking `tools/build_content.py` from no
  coverage to 97%.
- `tests/test_lesson_snippets.py` executes every lesson block the site offers a
  Run button for, against CPython, with the same shared-namespace semantics the
  browser uses.

**CI/CD and security**

- CI gates every pull request: ruff lint and format, mypy, pytest across Python
  3.11 to 3.13 with a 95% coverage floor, gitleaks over full history, pip-audit,
  and the web lint, type-check, build and audit.
- A job that rebuilds the content from the markdown and fails if the committed
  JSON is stale, or if the build modified a lesson.
- CodeQL for Python and TypeScript, weekly OpenSSF Scorecard, and a security
  heartbeat re-running secret and dependency scans every third day.
- Every action pinned to a commit SHA; workflows read-only by default.
- Dependabot for uv, npm and GitHub Actions, with the majors that break the
  build held back and the reason recorded against each.
- `main` protected: pull request required, nine required checks, linear history,
  no force pushes.
- Deployment through Vercel's Git integration, so no long-lived token is stored
  in the repository.

**Community health**

- Dual licence: MIT for the code, CC BY 4.0 for the curriculum, with third-party
  problem lists cited rather than claimed.
- Security policy, contributing guide, code of conduct, code owners, and issue
  and pull request templates.
- Pre-commit hooks mirroring the CI gate.

### Changed

- Drill exercises are published as unsolved stubs. The pipeline previously
  copied whatever the drill file currently held, so solving an exercise locally
  would have shipped the answer as the starter code for every reader. The
  starter is now rebuilt from the signature and docstring, with one deliberate
  worked example exempt.
- The content pipeline writes byte-identical output on every platform.
  `write_text` applied platform line endings, so a build on Windows and a build
  in CI disagreed.
- The application-timing research and the daily study plan moved from the README
  to [PLAN.md](PLAN.md). The README describes the curriculum; the plan describes
  one person's schedule.

### Fixed

- Markdown is excluded from the formatter. Ruff formats Python code fences
  *inside* markdown and silently rewrote fifteen lessons; CI now fails if any
  build modifies a lesson.
- Lesson blocks that cannot run no longer offer a Run button. Around a fifth of
  the fences are one-line illustrations of an API whose names were never
  defined, and pressing Run could only ever have produced a `NameError`. The
  pipeline resolves each fence's free names in document order and marks it.

### Known limitations

- Phases 4 to 8 of the build specification are not implemented: the drill
  runner, the problem workspace and its 22-minute timer, IndexedDB persistence,
  spaced repetition, progress charts, and offline support.
- The dashboard points at the next lesson and drill rather than showing
  progress, because nothing is recorded yet.

[Unreleased]: https://github.com/harshitwandhare/dsa-mastery/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/harshitwandhare/dsa-mastery/releases/tag/v0.2.0
[0.1.0]: https://github.com/harshitwandhare/dsa-mastery/releases/tag/v0.1.0
