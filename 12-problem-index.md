# 12 — Complete Problem Index

Every problem you need, in order, with the pattern and the one-line insight. **Do not read the insight before attempting the problem** — it's for the review pass and for when your 22-minute timer runs out.

Legend: **E** Easy · **M** Medium · **H** Hard · ⭐ = also in Blind 75 · 🔥 = very frequently asked

---

## Phase 1 — NeetCode 150 (weeks 1–13)

### Arrays & Hashing (9)

| # | Problem | Diff | Pattern | Insight |
|---|---|---|---|---|
| 1 | Contains Duplicate ⭐ | E | hash set | `len(set(nums)) != len(nums)` |
| 2 | Valid Anagram ⭐ | E | frequency | `Counter(s) == Counter(t)` |
| 3 | Two Sum ⭐🔥 | E | hash map | store value→index; check complement *before* inserting |
| 4 | Group Anagrams ⭐ | M | hash + canonical key | key = sorted string, or a 26-length count tuple for O(n·k) |
| 5 | Top K Frequent Elements ⭐ | M | heap / bucket | bucket by frequency → O(n), beats the heap's O(n log k) |
| 6 | Encode and Decode Strings | M | serialization | length-prefix each string (`4#word`); delimiters alone are ambiguous |
| 7 | Product of Array Except Self ⭐ | M | prefix/suffix | left pass then right pass, O(1) extra space |
| 8 | Valid Sudoku | M | hash sets | three dicts of sets; box key is `(r//3, c//3)` |
| 9 | Longest Consecutive Sequence ⭐ | M | hash set | only start counting from `x` where `x-1` isn't in the set |

### Two Pointers (5)

| # | Problem | Diff | Pattern | Insight |
|---|---|---|---|---|
| 10 | Valid Palindrome ⭐ | E | converging | skip non-alphanumeric, compare lowercase |
| 11 | Two Sum II — Sorted | M | converging | sum too small → move left up; too big → move right down |
| 12 | 3Sum ⭐🔥 | M | sort + two pointers | fix one anchor; dedup twice (anchors *and* after a hit) |
| 13 | Container With Most Water ⭐ | M | converging greedy | always move the **shorter** line — moving the taller can't help |
| 14 | Trapping Rain Water ⭐ | H | two pointers | water at i = `min(left_max, right_max) - h[i]`; advance the smaller side |

### Sliding Window (6)

| # | Problem | Diff | Pattern | Insight |
|---|---|---|---|---|
| 15 | Best Time to Buy and Sell Stock ⭐🔥 | E | running min | track the min so far; profit = price − min |
| 16 | Longest Substring Without Repeating ⭐🔥 | M | variable window | last-seen index map; guard `last[c] >= left` |
| 17 | Longest Repeating Character Replacement ⭐ | M | variable window | valid iff `window_len - max_freq <= k` |
| 18 | Permutation in String | M | fixed window | window of `len(s1)`, compare frequency counts |
| 19 | Minimum Window Substring ⭐🔥 | H | variable window | `formed`/`required` counters make validity O(1) |
| 20 | Sliding Window Maximum | H | monotonic deque | deque of indices, values decreasing; front is the max |

### Stack (7)

| # | Problem | Diff | Pattern | Insight |
|---|---|---|---|---|
| 21 | Valid Parentheses ⭐🔥 | E | stack | push openers; on a closer, the top must match |
| 22 | Min Stack | M | auxiliary stack | parallel stack of running minimums |
| 23 | Evaluate Reverse Polish Notation | M | stack | pop two, apply, push; `int(a/b)` truncates toward zero |
| 24 | Generate Parentheses | M | backtracking | rule: `open < n` to add '(', `close < open` to add ')' |
| 25 | Daily Temperatures | M | monotonic stack | decreasing stack of indices; answer is the index distance |
| 26 | Car Fleet | M | monotonic stack | sort by position descending; a slower car ahead absorbs you |
| 27 | Largest Rectangle in Histogram | H | monotonic stack | increasing stack of `(start_index, height)`, then drain |

### Binary Search (7)

| # | Problem | Diff | Pattern | Insight |
|---|---|---|---|---|
| 28 | Binary Search | E | template | inclusive bounds, `lo <= hi`, always exclude mid |
| 29 | Search a 2D Matrix | M | flatten | treat as one array: `row = i // cols`, `col = i % cols` |
| 30 | Koko Eating Bananas | M | search the answer | monotonic: if speed k works, every speed > k works |
| 31 | Find Minimum in Rotated Sorted Array ⭐ | M | modified BS | compare `nums[mid]` to `nums[hi]`, never to `nums[lo]` |
| 32 | Search in Rotated Sorted Array ⭐🔥 | M | modified BS | one half is always sorted — find it, then test containment |
| 33 | Time Based Key-Value Store | M | BS on timestamps | dict of sorted lists + `bisect_right - 1` |
| 34 | Median of Two Sorted Arrays | H | BS on partition | binary search the split point of the *smaller* array |

### Linked List (11)

| # | Problem | Diff | Pattern | Insight |
|---|---|---|---|---|
| 35 | Reverse Linked List ⭐🔥 | E | pointer reversal | prev / curr / next, 4 lines — memorize |
| 36 | Merge Two Sorted Lists ⭐ | E | dummy head | compare heads, advance the smaller |
| 37 | Reorder List ⭐ | M | composition | find middle → reverse second half → interleave |
| 38 | Remove Nth Node From End ⭐ | M | gap pointers | fast leads slow by n; dummy head handles head removal |
| 39 | Copy List With Random Pointer | M | hash map | old→new map, then a second pass wiring pointers |
| 40 | Add Two Numbers | M | dummy + carry | loop while either list or a carry remains |
| 41 | Linked List Cycle ⭐ | E | fast/slow | they meet iff a cycle exists |
| 42 | Find the Duplicate Number | M | Floyd's | treat values as `next` pointers → cycle detection |
| 43 | LRU Cache ⭐🔥 | M | hashmap + DLL | sentinel head/tail; nodes must store their key for eviction |
| 44 | Merge K Sorted Lists ⭐ | H | heap | heap of k heads, `(val, i, node)` — index breaks ties |
| 45 | Reverse Nodes in K-Group | H | pointer surgery | count k ahead first; reverse the block; reconnect |

### Trees (15)

| # | Problem | Diff | Pattern | Insight |
|---|---|---|---|---|
| 46 | Invert Binary Tree ⭐ | E | any traversal | swap children, recurse |
| 47 | Maximum Depth of Binary Tree ⭐ | E | postorder | `1 + max(left, right)` |
| 48 | Diameter of Binary Tree | E | postorder | record `l + r`, return `1 + max(l, r)` |
| 49 | Balanced Binary Tree | E | postorder | fuse height + balance; `-1` sentinel propagates failure |
| 50 | Same Tree ⭐ | E | parallel recursion | compare structure and value simultaneously |
| 51 | Subtree of Another Tree ⭐ | E | nested recursion | at each node, run `isSameTree` |
| 52 | Lowest Common Ancestor of a BST ⭐ | M | BST property | walk down while both targets are on the same side |
| 53 | Binary Tree Level Order Traversal ⭐ | M | BFS | snapshot `len(q)` to process exactly one level |
| 54 | Binary Tree Right Side View | M | BFS | last node of each level |
| 55 | Count Good Nodes in Binary Tree | M | preorder | pass `max_so_far` down |
| 56 | Validate BST ⭐🔥 | M | preorder bounds | inherit `(low, high)` — local checks are wrong |
| 57 | Kth Smallest Element in a BST ⭐ | M | inorder | iterative inorder lets you stop early, O(h+k) |
| 58 | Construct Tree from Preorder & Inorder ⭐ | M | divide & conquer | index map for O(1) root lookup → O(n) |
| 59 | Binary Tree Maximum Path Sum ⭐ | H | postorder | clamp negative branches to 0; return one side only |
| 60 | Serialize and Deserialize Binary Tree ⭐ | H | preorder + markers | `#` for null encodes the shape |

### Tries (3)

| # | Problem | Diff | Pattern | Insight |
|---|---|---|---|---|
| 61 | Implement Trie ⭐ | M | trie | `children` dict + `is_word` flag |
| 62 | Design Add and Search Words ⭐ | M | trie + DFS | `.` recurses into every child |
| 63 | Word Search II ⭐ | H | trie + backtracking | one grid DFS; prune when the prefix leaves the trie |

### Heap / Priority Queue (7)

| # | Problem | Diff | Pattern | Insight |
|---|---|---|---|---|
| 64 | Kth Largest Element in a Stream | E | min-heap size k | the root *is* the k-th largest |
| 65 | Last Stone Weight | E | max-heap | negate values for Python's min-heap |
| 66 | K Closest Points to Origin | M | heap | compare squared distance — no `sqrt` needed |
| 67 | Kth Largest Element in an Array | M | heap / quickselect | heap O(n log k); quickselect O(n) average |
| 68 | Task Scheduler | M | greedy + heap | most frequent task first; or the closed-form gap formula |
| 69 | Design Twitter | M | heap merge | merge the k followed feeds by timestamp |
| 70 | Find Median from Data Stream ⭐ | H | two heaps | max-heap low half, min-heap high half, rebalance ritual |

### Backtracking (9)

| # | Problem | Diff | Pattern | Insight |
|---|---|---|---|---|
| 71 | Subsets ⭐ | M | backtracking | every node is an answer; `start` prevents reordering |
| 72 | Combination Sum ⭐ | M | backtracking | `backtrack(i, ...)` — same index allows reuse |
| 73 | Permutations ⭐ | M | backtracking | `used[]` array; scan all indices since order matters |
| 74 | Subsets II | M | backtracking + dedup | sort, then `if i > start and a[i]==a[i-1]: continue` |
| 75 | Combination Sum II | M | backtracking + dedup | sort + dedup + `backtrack(i+1)` for single use |
| 76 | Word Search ⭐ | M | grid backtracking | mark the cell, recurse, unmark |
| 77 | Palindrome Partitioning ⭐ | M | backtracking | try each prefix; recurse only if it's a palindrome |
| 78 | Letter Combinations of a Phone Number ⭐ | M | backtracking | digit→letters map, recurse by index |
| 79 | N-Queens | H | backtracking + pruning | conflict sets on `col`, `r-c`, `r+c` |

### Graphs (13)

| # | Problem | Diff | Pattern | Insight |
|---|---|---|---|---|
| 80 | Number of Islands ⭐🔥 | M | flood fill | sink each island on visit; count the starts |
| 81 | Max Area of Island | M | flood fill | DFS returns a size |
| 82 | Clone Graph ⭐ | M | DFS + hash map | old→new map doubles as the visited set |
| 83 | Walls and Gates / Islands and Treasure ⭐ | M | multi-source BFS | seed the queue with every gate |
| 84 | Rotting Oranges | M | multi-source BFS | count levels; track remaining fresh |
| 85 | Pacific Atlantic Water Flow ⭐ | M | reverse BFS/DFS | flow *outward* from each ocean, then intersect |
| 86 | Surrounded Regions | M | boundary DFS | mark from the border, then flip the rest |
| 87 | Course Schedule ⭐🔥 | M | topological sort | processed count < n → a cycle exists |
| 88 | Course Schedule II | M | topological sort | Kahn's, return the order |
| 89 | Graph Valid Tree ⭐ | M | union-find / DFS | connected **and** exactly `n-1` edges |
| 90 | Number of Connected Components ⭐ | M | union-find | `count` decrements on each successful union |
| 91 | Redundant Connection | M | union-find | the edge where `union` returns False |
| 92 | Word Ladder ⭐ | H | BFS on states | bucket by wildcard patterns (`h*t`) to build adjacency |

### Advanced Graphs (6)

| # | Problem | Diff | Pattern | Insight |
|---|---|---|---|---|
| 93 | Reconstruct Itinerary | H | Hierholzer's | Eulerian path; append on dead-end, reverse at the end |
| 94 | Min Cost to Connect All Points | M | Prim's MST | heap of (distance, node) |
| 95 | Network Delay Time | M | Dijkstra | answer is the max of all final distances |
| 96 | Swim in Rising Water | H | Dijkstra variant | minimize the *maximum* edge along the path |
| 97 | Alien Dictionary | H | topological sort | derive edges from the first differing char of adjacent words |
| 98 | Cheapest Flights Within K Stops | M | Bellman-Ford | exactly k+1 rounds; relax from a snapshot |

### 1-D Dynamic Programming (12)

| # | Problem | Diff | Pattern | Insight |
|---|---|---|---|---|
| 99 | Climbing Stairs ⭐ | E | linear DP | it's Fibonacci |
| 100 | Min Cost Climbing Stairs | E | linear DP | `dp[i] = cost[i] + min(dp[i-1], dp[i-2])` |
| 101 | House Robber ⭐🔥 | M | linear DP | `max(skip, rob + dp[i-2])` |
| 102 | House Robber II ⭐ | M | linear DP ×2 | circular → run linear on `nums[:-1]` and `nums[1:]` |
| 103 | Longest Palindromic Substring ⭐🔥 | M | expand around center | 2n−1 centers, O(1) space, beats the DP |
| 104 | Palindromic Substrings ⭐ | M | expand around center | same loop, count instead of measure |
| 105 | Decode Ways ⭐ | M | linear DP | add one-digit and two-digit options; guard leading '0' |
| 106 | Coin Change ⭐🔥 | M | unbounded knapsack | `dp[0]=0`, minimize; unreachable stays `inf` |
| 107 | Maximum Product Subarray ⭐ | M | linear DP | track min *and* max — a negative flips them |
| 108 | Word Break ⭐ | M | segmentation DP | `dp[i]` true if some `dp[j]` true and `s[j:i]` is a word |
| 109 | Longest Increasing Subsequence ⭐ | M | LIS | `dp[i]` = LIS *ending at* i; then `bisect` for O(n log n) |
| 110 | Partition Equal Subset Sum ⭐ | M | 0/1 knapsack | reachable-sum set; odd total → immediate False |

### 2-D Dynamic Programming (11)

| # | Problem | Diff | Pattern | Insight |
|---|---|---|---|---|
| 111 | Unique Paths ⭐ | M | grid DP | one row rolling: `dp[j] += dp[j-1]` |
| 112 | Longest Common Subsequence ⭐ | M | two-sequence | match → diagonal+1; else max of the two neighbors |
| 113 | Best Time to Buy/Sell with Cooldown ⭐ | M | state machine | three states: hold, sold, rest |
| 114 | Coin Change II | M | unbounded knapsack | **coin loop outside** counts combinations, not permutations |
| 115 | Target Sum | M | 0/1 knapsack | `dp[(index, running_sum)]`, memoized |
| 116 | Interleaving String | M | two-sequence | `dp[i][j]`: can `s3[:i+j]` be formed from `s1[:i]` + `s2[:j]` |
| 117 | Longest Increasing Path in a Matrix | H | DFS + memo | DAG by strict increase → no visited set needed |
| 118 | Distinct Subsequences | H | two-sequence | match → `dp[i-1][j-1] + dp[i-1][j]`; else `dp[i-1][j]` |
| 119 | Edit Distance ⭐🔥 | M | two-sequence | three-way min: replace, delete, insert |
| 120 | Burst Balloons | H | interval DP | think about which balloon bursts **last** |
| 121 | Regular Expression Matching | H | two-sequence | `*` → zero occurrences, or one more if chars match |

### Greedy (8)

| # | Problem | Diff | Pattern | Insight |
|---|---|---|---|---|
| 122 | Maximum Subarray ⭐🔥 | M | Kadane's | `curr = max(x, curr + x)` — restart or extend |
| 123 | Jump Game ⭐ | M | greedy reach | fail if `i > furthest_reachable` |
| 124 | Jump Game II | M | greedy levels | BFS by level without a queue |
| 125 | Gas Station | M | greedy reset | on a deficit, no station in the failed span can start |
| 126 | Hand of Straights | M | greedy | the smallest remaining card must start a group |
| 127 | Merge Triplets to Form Target | M | greedy filter | ignore any triplet exceeding the target in any position |
| 128 | Partition Labels | M | greedy interval | extend to the last occurrence of every char seen |
| 129 | Valid Parenthesis String | M | greedy range | track `[min_open, max_open]`; `*` widens the range |

### Intervals (6)

| # | Problem | Diff | Pattern | Insight |
|---|---|---|---|---|
| 130 | Insert Interval ⭐ | M | interval merge | three phases: before / absorb / after — no sort needed |
| 131 | Merge Intervals ⭐🔥 | M | sort by start | extend the last interval when it overlaps |
| 132 | Non-overlapping Intervals ⭐ | M | **sort by end** | interval scheduling — earliest end leaves the most room |
| 133 | Meeting Rooms ⭐ | E | sort by start | check each adjacent pair |
| 134 | Meeting Rooms II ⭐🔥 | M | sweep / heap | min-heap of end times, or separate sorted start/end arrays |
| 135 | Minimum Interval to Include Each Query | H | sort + heap | sort queries, push intervals as they become active |

### Math & Geometry (8)

| # | Problem | Diff | Pattern | Insight |
|---|---|---|---|---|
| 136 | Rotate Image | M | matrix | reverse rows, then transpose |
| 137 | Spiral Matrix ⭐ | M | matrix | four shrinking bounds + two guards for single row/col |
| 138 | Set Matrix Zeroes ⭐ | M | matrix, O(1) space | use row 0 / col 0 as markers, then fill backward |
| 139 | Happy Number | E | cycle detection | fast/slow, or a seen-set |
| 140 | Plus One | E | array math | propagate the carry from the right |
| 141 | Pow(x, n) | M | binary exponentiation | square the base, halve the exponent |
| 142 | Multiply Strings | M | array math | `res[i+j+1] += d1*d2`, then carry |
| 143 | Detect Squares | M | hash counting | count points; for each diagonal partner, multiply counts |

### Bit Manipulation (7)

| # | Problem | Diff | Pattern | Insight |
|---|---|---|---|---|
| 144 | Single Number ⭐ | E | XOR | pairs cancel to 0 |
| 145 | Number of 1 Bits ⭐ | E | bit trick | `n &= n-1` clears the lowest set bit |
| 146 | Counting Bits ⭐ | E | DP + bits | `dp[i] = dp[i>>1] + (i&1)` |
| 147 | Reverse Bits ⭐ | E | bit trick | shift out of one end, into the other |
| 148 | Missing Number ⭐ | E | XOR / math | XOR indices with values, or `n(n+1)/2 − sum` |
| 149 | Sum of Two Integers ⭐ | M | bit arithmetic | XOR = sum without carry; `(a&b)<<1` = carry; loop |
| 150 | Reverse Integer | M | overflow | check 32-bit bounds before the final digit |

---

## Phase 2 — High-frequency extras (weeks 14–22)

Not in NeetCode 150, but asked often enough that they're worth doing. Grouped by why they matter.

### Very frequently asked (do all of these) 🔥

| Problem | Diff | Pattern | Insight |
|---|---|---|---|
| Two Sum II / 3Sum Closest | M | two pointers | track the closest sum seen |
| 4Sum | M | two pointers | two nested anchors → O(n³) |
| Move Zeroes | E | read/write pointers | swap non-zeros forward |
| Remove Duplicates from Sorted Array | E | read/write pointers | write index trails read |
| Sort Colors (Dutch flag) | M | three pointers | low/mid/high partition in one pass |
| Merge Sorted Array | E | two pointers backward | fill from the end to avoid overwriting |
| Majority Element | E | Boyer-Moore | candidate + count; the majority survives cancellation |
| Subarray Sum Equals K | M | prefix + hash | seed `{0: 1}`; count `running - k` |
| Longest Palindromic Subsequence | M | 2-D DP | LCS of `s` and `s[::-1]` |
| Longest Substring with At Most K Distinct | M | sliding window | shrink while `len(window) > k` |
| Find All Anagrams in a String | M | fixed window | compare count arrays |
| Binary Tree Zigzag Level Order | M | BFS | reverse alternate levels |
| Path Sum I / II / III | E/M/M | DFS | III uses prefix-sum counts along the path |
| Flatten Binary Tree to Linked List | M | reverse postorder | build right-skewed, `prev` pointer |
| Populating Next Right Pointers | M | BFS / level links | use the already-linked level above |
| Symmetric Tree | E | parallel recursion | compare left.left with right.right |
| Binary Tree Inorder Traversal (iterative) | E | stack | go left, pop, go right |
| Implement Queue using Stacks | E | two stacks | amortized O(1) via lazy transfer |
| Implement Stack using Queues | E | one queue | rotate after each push |
| Number of Provinces | M | union-find | count components in an adjacency matrix |
| Accounts Merge | M | union-find | union by shared email, group by root |
| Word Search (grid) | M | backtracking | mark/unmark |
| Insert Delete GetRandom O(1) | M | array + index map | swap-with-last on removal |
| Design Hit Counter | M | deque | evict timestamps older than 300s |
| Design Underground System | M | two hash maps | in-progress trips + route totals |
| Random Pick with Weight | M | prefix + bisect | binary search the cumulative array |
| Basic Calculator II | M | stack | push signed terms; handle `*` and `/` immediately |
| Decode String | M | two stacks | push counts and partial strings on `[` |
| Asteroid Collision | M | stack | resolve collisions while pushing |
| Remove K Digits | M | monotonic stack | pop larger digits while budget remains |
| Next Greater Element I / II | E/M | monotonic stack | II loops the array twice with modulo |
| Simplify Path | M | stack | split on `/`, pop on `..` |
| Kth Smallest in a Sorted Matrix | M | heap / BS on value | binary search the value, count elements ≤ mid |
| Search a 2D Matrix II | M | staircase | start top-right; move left or down |
| First Bad Version | E | boundary BS | `lo < hi`, `hi = mid` |
| Find Peak Element | M | BS without sorting | move toward the higher neighbor |
| Split Array Largest Sum | H | BS on the answer | feasibility check = greedy chunking |
| Capacity to Ship Packages in D Days | M | BS on the answer | same shape as Koko |
| Minimum Size Subarray Sum | M | sliding window | shrink while `sum >= target` |
| Container/Trapping variants | H | two pointers | see file 02 |

### Strings

| Problem | Diff | Pattern | Insight |
|---|---|---|---|
| Longest Common Prefix | E | scan | compare column by column |
| String to Integer (atoi) | M | parsing | whitespace → sign → digits → clamp |
| Implement strStr() | E | KMP or Rabin-Karp | naive O(nm) usually accepted |
| Repeated Substring Pattern | E | KMP | `n % (n - lps[-1]) == 0` |
| Group Shifted Strings | M | canonical key | normalize by the offset from the first char |
| Text Justification | H | simulation | careful spacing; last line is left-justified |
| Valid Number | H | state machine / regex | enumerate the states explicitly |
| Zigzag Conversion | M | simulation | bounce a row pointer |
| Compare Version Numbers | M | parsing | split, pad the shorter with zeros |
| Reverse Words in a String | M | parsing | `" ".join(s.split()[::-1])` |
| Word Pattern / Isomorphic Strings | E | bijection | two maps, both directions |
| Longest Duplicate Substring | H | rolling hash + BS | binary search the length |

### Trees & Tries, extended

| Problem | Diff | Pattern | Insight |
|---|---|---|---|
| LCA of a Binary Tree ⭐ | M | postorder | found in both subtrees → this node is the LCA |
| Binary Tree Vertical Order Traversal | M | BFS + column map | track a column index per node |
| Delete Node in a BST | M | BST surgery | two children → replace with the inorder successor |
| Convert Sorted Array to BST | E | divide & conquer | mid becomes the root |
| Recover Binary Search Tree | M | inorder | find the two swapped nodes in the sorted sequence |
| All Nodes Distance K in Binary Tree | M | build parent links + BFS | convert the tree into a graph |
| Sum Root to Leaf Numbers | M | preorder | carry the running number down |
| House Robber III | M | tree DP | return `(rob_this, skip_this)` from each node |
| Maximum Width of Binary Tree | M | BFS + indices | index children as `2i` / `2i+1` |
| Design Search Autocomplete System | H | trie + heap | cache the top-3 at each trie node |
| Maximum XOR of Two Numbers | M | bitwise trie | greedily walk the opposite bit at each level |

### Graphs, extended

| Problem | Diff | Pattern | Insight |
|---|---|---|---|
| Is Graph Bipartite? | M | BFS coloring | conflict → odd cycle exists |
| Critical Connections (bridges) | H | Tarjan | `low[child] > disc[node]` |
| Minimum Height Trees | M | topological peeling | strip leaves until ≤ 2 nodes remain |
| Evaluate Division | M | weighted graph DFS | edge weight = the ratio; multiply along the path |
| Path with Maximum Probability | M | Dijkstra variant | maximize the product instead of minimizing a sum |
| Shortest Path in Binary Matrix | M | BFS 8-directional | grid BFS |
| Open the Lock | M | BFS on states | each combination is a node |
| Sliding Puzzle | H | BFS on board states | serialize the board as a string key |
| Number of Islands II | H | union-find | islands appear incrementally |
| Making a Large Island | H | union-find | pre-size each island, then test each 0 |
| Course Schedule IV | M | Floyd-Warshall / DFS | transitive reachability |
| Find Eventual Safe States | M | reverse topo / colors | nodes that can't reach a cycle |

### DP, extended

| Problem | Diff | Pattern | Insight |
|---|---|---|---|
| Best Time to Buy/Sell Stock III / IV | H | state machine + k | `dp[day][transactions][holding]` |
| Best Time with Transaction Fee | M | state machine | subtract the fee on sale |
| Perfect Squares | M | unbounded knapsack | coins are the square numbers |
| Triangle | M | grid DP | fill bottom-up, in place |
| Minimum Path Sum | M | grid DP | accumulate in place |
| Unique Paths II | M | grid DP | obstacle cell → 0 ways |
| Maximal Square | M | 2-D DP | `dp[i][j] = 1 + min(up, left, diagonal)` |
| Maximal Rectangle | H | histogram per row | run Largest Rectangle on each row |
| Number of Longest Increasing Subsequences | M | LIS + counts | track length *and* count arrays |
| Russian Doll Envelopes | H | sort + LIS | sort widths asc, heights **desc** to block ties |
| Cherry Pickup | H | 3-D DP | two paths simultaneously, indexed by step |
| Dungeon Game | H | reverse DP | fill from the destination backward |
| Stone Game (I–IX) | M/H | game theory | score-difference formulation |
| Frog Jump | H | DP with a state set | `(position, last_jump)` |
| Minimum Falling Path Sum | M | grid DP | three predecessors per cell |
| Count Vowels Permutation | H | linear DP | state machine over the 5 vowels |
| Ones and Zeroes | M | 2-D knapsack | two capacity dimensions |
| Last Stone Weight II | M | 0/1 knapsack | minimize `|sum − 2·subset|` |

### Design / OOP-flavored

| Problem | Diff | Why |
|---|---|---|
| LFU Cache | H | two maps + frequency buckets — the LRU follow-up |
| All O(1) Data Structure | H | DLL of frequency buckets |
| Design Circular Queue / Deque | M | fixed array with wraparound |
| Design Browser History | M | two stacks or a DLL |
| Snapshot Array | M | per-index (snap_id, value) list + bisect |
| Design File System | M | trie of paths |
| Design In-Memory File System | H | nested dict tree |
| Logger Rate Limiter | E | hashmap of last-seen timestamps |
| Moving Average from Data Stream | E | deque + running sum |
| Design Tic-Tac-Toe | M | row/col/diagonal counters, O(1) per move |
| Encode and Decode TinyURL | M | counter/base62 + two maps |
| Serialize and Deserialize N-ary Tree | H | preorder + child counts |

### Concurrency (Amazon, some backend loops)

| Problem | Diff | Concept |
|---|---|---|
| Print in Order | E | semaphores / events |
| Print FooBar Alternately | M | two semaphores ping-ponging |
| Building H2O | M | barriers, resource counting |
| Dining Philosophers | M | deadlock avoidance via lock ordering |
| Web Crawler Multithreaded | M | thread pool + a shared visited set with a lock |

See [16 — CS Fundamentals](16-cs-fundamentals.md) for the underlying concepts.

---

## Phase 3 — completing NeetCode 250 (weeks 20–26)

The 100 problems NeetCode 250 adds on top of the 150. Roughly 40 of them already appear in Phase 2 above; the **59 listed here are the remainder**, so working this section takes you to full 250 coverage. They're easier on average than Phase 2 — a lot are Easy warm-ups that build fluency — so treat them as volume, 3–4 per session rather than 2.

### One new pattern first: cyclic sort (index-as-hash)

Not in NeetCode's category list, but it's the technique behind several problems below, and it's the answer whenever you see **"values are in the range 1..n"** with an **O(1) space** requirement.

The idea: if values are 1..n and the array has length n, then value `v` *belongs* at index `v-1`. Put each value where it belongs by swapping, then scan for the index whose value is wrong. That index is your answer.

```python
def first_missing_positive(nums):
    n = len(nums)
    for i in range(n):
        # keep swapping nums[i] into its home until it's out of range or settled
        while 1 <= nums[i] <= n and nums[nums[i] - 1] != nums[i]:
            v = nums[i]
            nums[i], nums[v - 1] = nums[v - 1], nums[i]
    for i in range(n):
        if nums[i] != i + 1:
            return i + 1
    return n + 1
# O(n) time, O(1) space. The while loop is amortised O(1): each swap
# places one value permanently, so there are at most n swaps overall.
```

Being able to argue that the nested `while` is still O(n) total is the whole point of this problem. Same technique: Find All Numbers Disappeared in an Array, Find the Duplicate Number (array variant), Missing Number, Set Mismatch.

### Arrays & Hashing (8)

| Problem | Diff | Pattern | Insight |
|---|---|---|---|
| Concatenation of Array | E | warm-up | `nums + nums`; state the O(n) anyway |
| Sort an Array | M | sorting | implement merge sort — see [11 §11.1](11-advanced-algorithms.md) |
| Design HashSet | E | design | array of buckets + chaining; explain your collision strategy |
| Design HashMap | E | design | same, storing `(key, value)` pairs |
| Range Sum Query 2D Immutable | M | 2-D prefix sum | `pre[r][c]` = sum of the rectangle from origin; inclusion–exclusion for a query |
| Best Time to Buy and Sell Stock II | M | greedy | take every upward step: sum of all positive deltas |
| Majority Element II | M | Boyer-Moore ×2 | at most two elements can exceed n/3, so track two candidates |
| First Missing Positive | H | **cyclic sort** | place each value at index `v-1`, then scan |

### Two Pointers (4)

| Problem | Diff | Pattern | Insight |
|---|---|---|---|
| Reverse String | E | converging | swap ends inward, in place |
| Merge Strings Alternately | E | parallel pointers | walk both, append the remainder |
| Rotate Array | M | reversal trick | reverse all, reverse first k, reverse rest → O(1) space |
| Boats to Save People | M | sort + converge | pair the lightest with the heaviest if they fit; else the heaviest goes alone |

Rotate Array's triple-reversal is worth memorising — it's the standard O(1)-space rotation and it shows up in string rotation problems too.

### Sliding Window (2)

| Problem | Diff | Pattern | Insight |
|---|---|---|---|
| Contains Duplicate II | E | window + set | keep a set of the last k elements; evict as you slide |
| Find K Closest Elements | M | binary search the window | search for the best left boundary in `[0, n-k]` |

### Stack (3)

| Problem | Diff | Pattern | Insight |
|---|---|---|---|
| Baseball Game | E | stack | straight simulation |
| Online Stock Span | M | monotonic stack | pop smaller prices, accumulating their spans |
| Maximum Frequency Stack | H | stacks by frequency | `freq[x]` plus `group[f]` = a stack of values seen f times |

Maximum Frequency Stack is the best "compose two structures" exercise in the set — pop the highest frequency group, which is naturally LIFO within itself.

### Binary Search (4)

| Problem | Diff | Pattern | Insight |
|---|---|---|---|
| Search Insert Position | E | boundary template | the answer is `lo` when the loop exits |
| Guess Number Higher or Lower | E | template | pure binary search against an API |
| Search in Rotated Sorted Array II | M | modified BS | duplicates break the "which half is sorted" test; shrink `lo`/`hi` when `nums[lo]==nums[mid]==nums[hi]` → O(n) worst case |
| Find in Mountain Array | H | BS ×3 | find the peak, then search ascending, then descending |

Search in Rotated Sorted Array **II** is specifically valuable: it's the same problem as the 150 version but duplicates destroy the invariant, and being able to explain *why the guarantee breaks* is a stronger answer than the original problem provides.

### Linked List (1)

| Problem | Diff | Pattern | Insight |
|---|---|---|---|
| Reverse Linked List II | M | pointer surgery | dummy head, walk to `left-1`, reverse `right-left` nodes by head-insertion |

### Trees (5)

| Problem | Diff | Pattern | Insight |
|---|---|---|---|
| Binary Tree Preorder Traversal | E | iterative stack | push right before left |
| Binary Tree Postorder Traversal | E | iterative stack | do preorder as node→right→left, then reverse |
| Insert into a Binary Search Tree | M | BST walk | descend until a null child, attach there |
| Delete Leaves With a Given Value | M | postorder | delete children first, then re-check yourself |
| Construct Quad Tree | M | divide & conquer | if the quadrant is uniform it's a leaf, else recurse into four |

Write all three traversals iteratively at least once. The postorder-via-reversed-preorder trick is the kind of thing that reads as genuine understanding.

### Heap / Priority Queue (2)

| Problem | Diff | Pattern | Insight |
|---|---|---|---|
| Single Threaded CPU | M | sort + heap | sort by enqueue time; heap of available tasks by `(duration, index)`; jump the clock when idle |
| Longest Happy String | M | greedy + max-heap | take the most frequent letter unless it would make three in a row, then take the second |

### Backtracking (4)

| Problem | Diff | Pattern | Insight |
|---|---|---|---|
| Sum of All Subsets XOR Total | E | subsets | or the O(n) math: every bit appears in exactly half the subsets |
| Matchsticks to Square | M | bitmask / backtracking | 4 buckets to a fixed target; sort descending to prune hard |
| N-Queens II | H | backtracking | identical to N-Queens, return only the count — no board needed |
| Word Break II | H | backtracking + memo | return *all* segmentations; memoise by start index or it explodes |

### Tries (1)

| Problem | Diff | Pattern | Insight |
|---|---|---|---|
| Extra Characters in a String | M | trie + DP | `dp[i]` = min extra chars from i; walk the trie forward from each index |

The trie-plus-DP combination is the point here — it's the shape behind Word Break, Concatenated Words, and Palindrome Pairs.

### Graphs (3)

| Problem | Diff | Pattern | Insight |
|---|---|---|---|
| Island Perimeter | E | grid scan | 4 per land cell, minus 2 for each shared edge |
| Verifying an Alien Dictionary | E | ordering | map each letter to its rank, compare adjacent words |
| Find the Town Judge | E | degree counting | judge has indegree n−1 and outdegree 0 |

### Advanced Graphs (4)

| Problem | Diff | Pattern | Insight |
|---|---|---|---|
| Path with Minimum Effort | M | Dijkstra on max-edge | minimise the largest single step, not the sum |
| Find Critical and Pseudo-Critical Edges in MST | H | Kruskal ×3 | critical = MST weight rises without it; pseudo = forcing it in keeps the weight |
| Build a Matrix With Conditions | H | topological sort ×2 | independently order rows and columns, then place |
| Greatest Common Divisor Traversal | H | union-find over prime factors | union each number with each of its prime factors; connected ⟺ traversable |

Path with Minimum Effort generalises Swim in Rising Water — both replace "sum of edges" with "max edge along the path" inside Dijkstra. Learn the substitution once.

### 1-D Dynamic Programming (4)

| Problem | Diff | Pattern | Insight |
|---|---|---|---|
| N-th Tribonacci Number | E | linear DP | three rolling variables instead of two |
| Combination Sum IV | M | unbounded knapsack | **amount loop outside** → counts permutations (contrast with Coin Change II) |
| Integer Break | M | linear DP | `dp[n] = max(i * dp[n-i], i * (n-i))`; the math answer is "use as many 3s as possible" |
| Stone Game III | H | game theory DP | score-difference formulation over 1–3 stones |

Combination Sum IV next to Coin Change II is the cleanest demonstration of why loop order decides combinations vs permutations. Do them back to back.

### Greedy (5)

| Problem | Diff | Pattern | Insight |
|---|---|---|---|
| Lemonade Change | E | greedy | always give the largest bills first, keeping small change in reserve |
| Maximum Sum Circular Subarray | M | Kadane ×2 | answer = max(normal Kadane, total − *min* subarray); guard the all-negative case |
| Longest Turbulent Subarray | M | state DP | two running lengths: last comparison was up, or down |
| Jump Game VII | M | BFS / sliding window | track the furthest reachable index and a window of valid launch points |
| Dota2 Senate | M | two queues | simulate bans round by round, re-queueing survivors at `i + n` |

Maximum Sum Circular Subarray's all-negative edge case (where `total − min` wrongly yields 0) is the trap the problem exists to test.

### Intervals (1)

| Problem | Diff | Pattern | Insight |
|---|---|---|---|
| Meeting Rooms III | H | two heaps | one heap of free rooms by index, one of busy rooms by end time |

### Math & Geometry (5)

| Problem | Diff | Pattern | Insight |
|---|---|---|---|
| Excel Sheet Column Title | E | base-26 | 1-indexed, so decrement before each `divmod` |
| Greatest Common Divisor of Strings | E | gcd | the answer exists iff `a+b == b+a`; length is `gcd(len(a), len(b))` |
| Insert Greatest Common Divisors in Linked List | M | traversal + gcd | splice a node between each adjacent pair |
| Transpose Matrix | E | matrix | `list(zip(*matrix))` — note it handles non-square, unlike an in-place swap |
| Roman to Integer | E | parsing | add each value; subtract twice when a smaller numeral precedes a larger |

### Bit Manipulation (3)

| Problem | Diff | Pattern | Insight |
|---|---|---|---|
| Add Binary | E | bit arithmetic | carry propagation from the right, as strings |
| Bitwise AND of Numbers Range | M | common prefix | the answer is the shared high-bit prefix of `left` and `right` |
| Minimum Array End | M | bit construction | keep `n`'s bits in the positions where `x` has zeros |

Bitwise AND of Numbers Range has a satisfying one-liner: shift both right until they're equal, then shift back. Any differing bit means some number in the range has a 0 there.

---

## How to use this index

**Weeks 1–13:** work Phase 1 strictly in order. The ordering encodes prerequisites.

**Weeks 14–22:** Phase 2, prioritizing 🔥 first, then whichever category your [tracker](tracker.md) shows as weakest.

**Before a specific company (2–3 weeks out):** buy LeetCode Premium, filter by that company + "last 6 months," and do 20–30 from that list. This is the only time premium is worth paying for.

**Company tendencies (2026):**

| Company | Emphasis |
|---|---|
| **Google** | OA Q1 = array/string/sliding window, Q2 = graph/tree/DP/heap. Clean code and complexity analysis weighted heavily. |
| **Meta** | Speed. Two problems in 40 minutes is common. Heavy on trees, graphs, and strings. Minimum Window Substring and Valid Palindrome II are perennials. |
| **Amazon** | ~75–80% Medium, framed in warehouse/server/parcel language. Graphs and weighted shortest paths rising. Behavioral (Leadership Principles) is roughly half the decision. |
| **Apple** | Applied and practical over puzzle-like — file dedup, task simulation, API throttling. Design-flavored data structures. |
| **Microsoft** | Trees, linked lists, strings. Gentler pace, more conversational. |
| **Uber / DoorDash** | Domain-shaped: routing, dispatch, surge → graphs, streaming aggregation, sliding window. |
| **Quant (Jane Street, HRT, Citadel)** | Probability, math, mental arithmetic, and clean reasoning over LeetCode volume. |
| **AI labs (Anthropic, OpenAI, Scale)** | Practical coding over puzzles — build something working, often with real APIs. Systems thinking and code quality weighted more than trick recognition. |

One 2026 change worth knowing: some companies now run an **AI-assisted coding round**, where you're given a model in the editor and evaluated on how well you direct and verify it. The skill being tested is judgment — decomposition, prompting, and catching wrong output — not memorized syntax. Your existing agent work is directly relevant preparation for that.

→ Next: **[13 — Low-Level Design, in depth](13-lld-deep.md)**
