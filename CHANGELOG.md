# Changelog

All notable changes to this project are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and
this project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
Because the curriculum is the substance of the project, a version records what a
reader can do, not only what changed in the code.

## [Unreleased]

Nothing yet.

## [0.1.0] - 2026-08-18

The curriculum becomes something you can run. Phases 0 to 3 of the
[build specification](20-website-build-spec.md), plus the production
infrastructure the repository had been missing.

### Added

**The learning platform** — <https://dsa-mastery-delta.vercel.app>

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

[Unreleased]: https://github.com/harshitwandhare/dsa-mastery/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/harshitwandhare/dsa-mastery/releases/tag/v0.1.0
