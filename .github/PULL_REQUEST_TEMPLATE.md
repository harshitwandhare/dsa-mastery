## What & why

<!-- One or two sentences. Link the issue if there is one. -->

## Checklist

- [ ] `uv run ruff check . && uv run ruff format --check .` passes
- [ ] `uv run mypy` passes
- [ ] `uv run pytest -m "not practice"` passes with the coverage gate
- [ ] New behaviour has tests
- [ ] If a lesson changed: `python tools/build_content.py` was rerun and the
      regenerated `web/content/*.json` is in this branch
- [ ] No numbered `.md` file was modified by tooling
