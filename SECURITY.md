# Security Policy

## Scope

This repository holds a study curriculum, a local Python practice environment,
and the pipeline that converts the lessons into JSON. It has no server, no
accounts, no database, and it stores no personal data. The realistic security
surface is therefore small but not zero:

| Area | What could go wrong |
|---|---|
| `tools/build_content.py` | Parses repository markdown and Python via `ast.parse`. It never executes the code it reads, but a parser bug could produce malformed output. |
| Dependencies | The dev toolchain (ruff, mypy, pytest, pip-audit) is pinned in `uv.lock`. A compromised release is the most likely real risk. |
| GitHub Actions | Workflows are pinned to commit SHAs and run with `permissions: contents: read` unless a job genuinely needs more. |
| Future web app | The planned learning platform runs Python in the browser via Pyodide inside a Web Worker. That sandbox, and its timeout, are security-relevant. |

## Supported versions

Only `main` is supported. There are no released versions to backport to.

## Reporting a vulnerability

Please report privately rather than opening a public issue.

1. Preferred: open a [private security advisory](https://github.com/harshitwandhare/dsa-mastery/security/advisories/new).
2. Alternative: email **harshitwandhare45@gmail.com** with `[security]` in the subject.

Please include what you found, how to reproduce it, and what an attacker could
actually do with it.

**Response expectations.** This is a personal project maintained alongside
full-time study, so treat these as good-faith targets rather than guarantees:

| Stage | Target |
|---|---|
| Acknowledgement | within 5 days |
| Initial assessment | within 14 days |
| Fix or documented decision not to fix | within 30 days for anything exploitable |

You will be credited in the advisory unless you ask not to be.

## Out of scope

- Findings that require an attacker to already control the repository or the
  machine running the tooling.
- Automated scanner output with no demonstrated impact.
- Missing hardening headers on a site that does not yet exist.

## What this project already does

- Every GitHub Action is pinned to a full commit SHA, not a moving tag.
- Workflows default to read-only permissions and widen only where required.
- `gitleaks` scans full history on every pull request and every three days.
- `pip-audit` runs on every pull request and every three days.
- CodeQL runs on every pull request and weekly.
- The OpenSSF Scorecard publishes a weekly supply-chain posture score.
- Dependabot opens grouped weekly updates for Python dependencies and Actions.
