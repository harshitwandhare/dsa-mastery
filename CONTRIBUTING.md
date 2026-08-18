# Contributing

This is primarily a personal study repository, but it is public because the
curriculum may be useful to other people preparing for the same interviews.
Corrections and improvements are welcome.

## The one rule that matters

**The numbered markdown files are the single source of truth, and nothing may
rewrite them automatically.**

Everything under `web/content/` is generated from those lessons by
`tools/build_content.py`. Two consequences:

- Never hand-edit `web/content/*.json`. Edit the markdown and rebuild.
- Never point a formatter at the markdown. Ruff formats Python code fences
  inside markdown files, which quietly reflowed fifteen lessons the first time
  it ran here. Markdown is excluded in `pyproject.toml` and CI fails the build
  if a run modifies any `.md` file.

After changing a lesson:

```bash
python tools/build_content.py
```

Commit the regenerated JSON in the same commit as the markdown change. CI
rebuilds the content and fails if the committed output is stale.

## Getting set up

```bash
uv sync --all-groups
uv run pre-commit install
```

## The quality gate

Run this before pushing. It is exactly what CI runs.

```bash
uv run ruff check . && uv run ruff format --check . && uv run mypy && uv run pytest -m "not practice" --cov --cov-fail-under=95
```

## Two populations of Python

The repository holds code with genuinely different purposes, and the toolchain
treats them differently on purpose rather than by neglect.

| Path | Standard | Why |
|---|---|---|
| `tools/`, `tests/` | Full strictness: linted, formatted, fully annotated, 95% coverage floor. | This is production code. The web app is built on its output. |
| `practice/dsa/` | Linted, formatted, fully annotated. | A small shared library the solutions import. |
| `practice/solutions/` | Linted and formatted; annotations not required. | Interview practice. Real interviews are written in plain Python, and `new_problem.py` scaffolds a bare `def solve():` for that reason. |
| `practice/drills/`, `practice/tests/test_doc_*.py` | Linted for correctness only; never auto-formatted. | These mirror curriculum code character-for-character. Reflowing them would desync the practice environment from the lessons that teach it. |

Each exemption is written down in `pyproject.toml` with its reason. If you need
a new one, add the reason too.

## Tests

`practice/tests/test_<problem>.py` files fail until that problem is solved.
That is by design, so `conftest.py` auto-marks them `practice` and CI deselects
them. A separate non-blocking CI job reports how many are passing.

```bash
uv run pytest -m "not practice"   # the gate; must be green
uv run pytest -m practice         # your own progress
uv run pytest                     # everything
```

If you add a test that must always pass, put it in `tests/` at the repository
root.

## Deployment

`main` deploys itself. Every push to `main` that touches `web/` builds and ships
to Vercel through `.github/workflows/deploy.yml`, and every pull request gets its
own preview URL in the run summary. Nothing needs to be deployed by hand.

The workflow needs three repository secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID` and
`VERCEL_PROJECT_ID`. The two IDs come from `web/.vercel/project.json` after
`vercel link`; the token comes from <https://vercel.com/account/tokens>.

A deploy is only trusted once it has been fetched back: the workflow requests the
deployed URL and fails if it does not return 200 with the app on it, because a
successful upload is not the same thing as a working site.

## Commits and pull requests

- Branch off `main`; do not commit to it directly.
- Write commit messages that explain *why*, not just what changed. The existing
  history is the style guide.
- One logical change per commit.
- Open a pull request and let CI go green before merging.

## Reporting problems in the curriculum

If a lesson is wrong, unclear, or a complexity claim does not hold, open an
issue with the file and section. Corrections to the material are as valuable as
corrections to the code.
