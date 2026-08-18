# practice/

Local DSA practice environment. Full guide: **[../17-practice-setup.md](../17-practice-setup.md)**

## Quick start

```bash
cd D:\Github\dsa-mastery\practice
python -m venv .venv
source .venv/Scripts/activate          # PowerShell: .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
pytest                                  # expect: 124 passed
```

## Daily commands

```bash
python -m dsa.timer 10 review                          # review block
python new_problem.py trees "Validate Binary Search Tree"   # scaffold
python -m dsa.timer 22                                 # struggle timer
pytest tests/test_validate_binary_search_tree.py -v    # run your tests
python -m dsa.bench                                    # see O(n) vs O(n^2)
python -m solutions.arrays_hashing.two_sum             # run a solution
```

## Layout

| Path | What |
|---|---|
| `dsa/helpers.py` | `ListNode`, `TreeNode`, `build_list`, `build_tree`, grid utils |
| `dsa/timer.py` | 22-minute protocol timer |
| `dsa/bench.py` | empirical complexity measurement |
| `solutions/` | your solutions, one folder per topic |
| `tests/test_doc_core.py` | verified implementations of files 01–07 |
| `tests/test_doc_advanced.py` | verified implementations of file 11 |
| `new_problem.py` | scaffolds a solution + test pair |

`tests/test_doc_*.py` double as a reference library: 124 tested algorithms with
edge cases. Read one when stuck, close it, then write it yourself.
