# 17 — Your Practice Environment

Everything here is already built and verified on your machine. This file explains what it is, how to run it, and the daily workflow.

**Location:** `D:\Github\dsa-mastery\practice\`
**Verified on:** Python 3.12.0, pytest, Windows — 124 tests passing.

---

## 17.1 Local editor or online judge? Use both, for different things.

This question has a real answer, not a preference.

| | Local (VS Code + this project) | LeetCode's browser editor |
|---|---|---|
| Debugger, breakpoints, variable inspection | yes | no |
| Your own test cases | unlimited | limited |
| Speed of iteration | instant | a submit round-trip |
| Builds typing and tooling fluency | yes | partially |
| Matches interview conditions | no | **yes** |
| Judge verdict / hidden tests | no | **yes** |
| Works offline | yes | no |

**The workflow that uses each for what it's good at:**

1. **Solve locally first.** Write it in VS Code with your own tests. When you're stuck, you can set a breakpoint and *see* why the pointer moved wrong. That understanding is the whole point of the exercise, and you cannot get it from a red "Wrong Answer" banner.
2. **Then paste into LeetCode and submit.** You get the hidden tests, the edge cases you didn't think of, and a runtime percentile. That's the verification step.
3. **Occasionally, solve directly in the browser with no local help** — that simulates interview conditions, where you have no debugger and no autocomplete. Do this for your weekly mock.

**Do not use online compilers** like Replit or Programiz as your main environment. They're for quick one-off snippets. You want the local setup because typing fluency, file navigation, running tests, and reading tracebacks are all skills that transfer, and you build them by living in a real editor.

**One deliberate constraint:** turn off AI autocomplete (Copilot, Cursor tab-completion) while practicing DSA. It will finish your two-pointer loop before you've thought about it, and you'll learn nothing. Turn it back on for project work, where it's genuinely useful. This is the single most important setting change for someone learning DSA in 2026.

---

## 17.2 One-time setup

Everything is installed already, but here is the full sequence so you can rebuild it anywhere.

**1. Confirm Python** (you have 3.12.0):

```bash
python --version
```

**2. Create a virtual environment** — isolates this project's packages from your system Python:

```bash
cd D:\Github\dsa-mastery\practice
python -m venv .venv
```

**3. Activate it.** You must do this in every new terminal.

PowerShell:
```bash
.\.venv\Scripts\Activate.ps1
```

Git Bash:
```bash
source .venv/Scripts/activate
```

If PowerShell blocks the script, run this once:
```bash
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

**4. Install dependencies:**

```bash
pip install -r requirements.txt
```

**5. Verify everything works:**

```bash
pytest
```

You should see `124 passed`. That's the entire curriculum's algorithms running green.

**6. Open in VS Code:**

```bash
code D:\Github\dsa-mastery
```

Then in VS Code:
- `Ctrl+Shift+P` → "Python: Select Interpreter" → pick `.venv`
- Install the **Python** extension (Microsoft) if it isn't already
- Install **Pylance** for type hints and fast navigation
- Turn OFF Copilot for this workspace: `Ctrl+Shift+P` → "GitHub Copilot: Disable" (or set `"github.copilot.enable": {"python": false}` in the workspace settings)

---

## 17.3 What's in the project

```
practice/
├── dsa/
│   ├── helpers.py       ListNode, TreeNode, build_list, build_tree,
│   │                    tree_to_array, show_tree, grid utils, check()
│   ├── bench.py         empirical complexity measurement — SEE O(n) vs O(n^2)
│   └── timer.py         the 22-minute protocol timer
├── solutions/
│   └── arrays_hashing/
│       └── two_sum.py   the worked model — read this first
├── tests/
│   ├── test_two_sum.py           the model test file
│   ├── test_doc_core.py          every algorithm from files 01–07, verified
│   └── test_doc_advanced.py      every algorithm from file 11, verified
├── new_problem.py       scaffolds a solution + test file for a new problem
├── pyproject.toml       pytest config (pythonpath, test discovery)
└── requirements.txt
```

### The four commands you'll actually use

**Scaffold a new problem:**
```bash
python new_problem.py sliding_window "Longest Substring Without Repeating Characters"
```
Creates `solutions/sliding_window/longest_substring_without_repeating_characters.py` with the full analysis template (constraints, brute force, optimised, key insight, what-I'd-get-wrong) and a matching test file.

**Start the timer:**
```bash
python -m dsa.timer 22
```
Counts down 22 minutes with a progress bar, then tells you to open the editorial. `python -m dsa.timer 10 review` for the review block, `python -m dsa.timer 45 mock` for a mock.

**Run your tests:**
```bash
pytest tests/test_longest_substring.py -v
```
Or `pytest` for everything, or `pytest -k two_sum` to filter by name.

**Run a solution directly to see output:**
```bash
python -m solutions.arrays_hashing.two_sum
```

### See complexity with your own eyes

```bash
python -m dsa.bench
```

Times brute-force vs optimised implementations across growing input sizes and prints the ratio when n doubles. O(n) roughly doubles; O(n²) roughly quadruples. Run this in week 1 — watching the numbers is worth more than reading the Big-O table three times.

---

## 17.4 The daily workflow

```bash
# 1. Open a terminal, activate the environment
cd D:\Github\dsa-mastery\practice
source .venv/Scripts/activate        # or .\.venv\Scripts\Activate.ps1

# 2. REVIEW BLOCK (10 min) — re-solve a problem from ~7 days ago,
#    from a blank file, no notes
python -m dsa.timer 10 review

# 3. NEW PROBLEM (40 min)
python new_problem.py trees "Validate Binary Search Tree"
python -m dsa.timer 22
#    -> read the problem, fill in CONSTRAINTS in the docstring FIRST
#    -> write the brute force, then optimise
#    -> when the timer ends: open NeetCode, watch, close it,
#       re-implement from scratch
pytest tests/test_validate_binary_search_tree.py -v

# 4. Paste into LeetCode and submit

# 5. SECOND PROBLEM (35 min) — same loop

# 6. LOG IT (5 min) — tracker.md: pattern, insight, complexity, confidence
```

The solution template forces the right sequence: you fill in constraints and the target complexity *before* writing code. That's the habit that transfers to interviews.

---

## 17.5 The verification suites are also your reference library

`tests/test_doc_core.py` and `tests/test_doc_advanced.py` contain a working, tested implementation of every algorithm in this curriculum — 124 of them, each with edge cases.

Two ways to use them:

**As a safety net.** If you ever edit the docs, run `pytest` and any broken code fails immediately.

**As a reference.** When you're stuck on a pattern after your 22 minutes, open the relevant test, read the implementation, close the file, and write it yourself. Reading a *tested* implementation is better than reading a blog post, because you know it's correct — including the edge cases, which are the part that's usually wrong online.

To find something:
```bash
pytest -k "monotonic or largest_rectangle" -v
grep -n "def min_window" tests/test_doc_core.py
```

---

## 17.6 Git — track your own progress

Your practice history is worth keeping, and a green contribution graph of daily DSA commits is a real signal on your GitHub profile.

```bash
cd D:\Github\dsa-mastery
git init
git add .
git commit -m "Set up DSA curriculum and practice environment"
```

Add a `.gitignore` first:
```
.venv/
__pycache__/
.pytest_cache/
*.pyc
.vscode/
```

Then commit daily after your session:
```bash
git add .
git commit -m "Day 12: sliding window - min window substring, permutation in string"
```

Whether you make it public is your call. A public `dsa-mastery` repo with 200 daily commits and tested solutions is a genuinely strong artifact — it demonstrates consistency, which is the hardest thing to fake.

---

## 17.7 Troubleshooting

| Problem | Fix |
|---|---|
| `ModuleNotFoundError: No module named 'dsa'` | Run pytest from the `practice/` directory. `pyproject.toml` sets `pythonpath = ["."]`. |
| `No module named pytest` | The venv isn't activated, or run `pip install -r requirements.txt`. |
| PowerShell won't run the activate script | `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned` |
| VS Code doesn't find imports | `Ctrl+Shift+P` → "Python: Select Interpreter" → choose `.venv` |
| `RecursionError` on a deep recursion | `import sys; sys.setrecursionlimit(10**6)` — and consider whether an iterative version is what's actually wanted |
| Tests pass locally but LeetCode says Wrong Answer | Read the failing case. Usually an unhandled edge case — add it to your test file so it can never regress. |

---

→ Back to **[README](README.md)** · Log your work in **[tracker.md](tracker.md)**
