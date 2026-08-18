# 04 — Trees, Tries, Heaps

**Weeks 5–7. ~25 problems.** Trees are the most-asked topic in interviews after arrays. Almost every tree problem is a variation on one of four traversal templates.

> **Forward references:** this file may name techniques taught later. Those are previews, not prerequisites — read past them. See [How to read this curriculum](01-foundations.md#how-to-read-this-curriculum).

---

## Pattern 7: Binary Trees

```python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right
```

### Vocabulary you must use correctly

- **Height of a node** — edges on the longest path down to a leaf. A leaf has height 0.
- **Depth of a node** — edges from the root down to it. The root has depth 0.
- **Balanced** — for every node, the heights of the two subtrees differ by at most 1.
- **Complete** — every level full except possibly the last, which fills left to right. (Heaps are complete trees.)
- **Perfect** — every level completely full. n = 2^h⁺¹ − 1 nodes.
- **BST** — for every node: all values in the left subtree < node.val < all values in the right subtree. **This is a global property, not a local one** — the single most common tree bug is checking only immediate children.

Complexity intuition: a balanced tree has height O(log n), so search/insert/delete are O(log n). A degenerate tree (every node has one child) is a linked list with height O(n). That gap is why balanced trees (AVL, red-black) exist. You won't implement them, but know why they exist.

### The four traversals — memorize these

```python
# DFS PREORDER: node → left → right
# Use when: you need to process a node BEFORE its children (copying a tree,
# serialization, path-building from the root down)
def preorder(node, out):
    if not node: return
    out.append(node.val)
    preorder(node.left, out)
    preorder(node.right, out)

# DFS INORDER: left → node → right
# Use when: BST — this yields values in SORTED order. Huge.
def inorder(node, out):
    if not node: return
    inorder(node.left, out)
    out.append(node.val)
    inorder(node.right, out)

# DFS POSTORDER: left → right → node
# Use when: you need children's answers BEFORE computing the node's
# (height, diameter, subtree sums, deletion, "is this subtree valid")
def postorder(node, out):
    if not node: return
    postorder(node.left, out)
    postorder(node.right, out)
    out.append(node.val)

# BFS LEVEL ORDER: level by level, left to right
# Use when: levels matter, or you need the SHORTEST path/minimum depth
from collections import deque
def level_order(root):
    if not root: return []
    out, q = [], deque([root])
    while q:
        level = []
        for _ in range(len(q)):        # snapshot the size — this is the trick
            node = q.popleft()
            level.append(node.val)
            if node.left:  q.append(node.left)
            if node.right: q.append(node.right)
        out.append(level)
    return out
```

**The `for _ in range(len(q))` line is the entire trick for level-order.** Capturing the queue length before the loop means you process exactly one level per outer iteration, even though you're appending to the same queue.

All four are O(n) time. DFS is O(h) space for the call stack (O(log n) balanced, O(n) skewed); BFS is O(w) where w is the maximum width — up to n/2 for the bottom level of a full tree.

### Choosing a traversal — the decision rule

> **Do I need information from my children to compute my answer?**
> Yes → **postorder** (compute children first, combine).
> **Do I need information from my parent (a running path, a valid range)?**
> Yes → **preorder** (pass state down as parameters).
> **Is it a BST and do I want sorted order?** → **inorder**.
> **Do I care about level or shortest distance?** → **BFS**.

This one question resolves the vast majority of tree problems. It's worth more than memorizing solutions.

### The postorder pattern — "return a tuple up the tree"

Many tree problems want a global answer that depends on local subtree facts. Compute the local fact, return it up, and update a global as you go.

```python
# Maximum Depth
def max_depth(root):
    if not root: return 0
    return 1 + max(max_depth(root.left), max_depth(root.right))

# Balanced Binary Tree — O(n), computing height and balance together
def is_balanced(root):
    def height(node):
        if not node: return 0
        lh = height(node.left)
        if lh == -1: return -1            # -1 propagates "unbalanced" upward
        rh = height(node.right)
        if rh == -1: return -1
        if abs(lh - rh) > 1: return -1
        return 1 + max(lh, rh)
    return height(root) != -1
```

The naive version calls `max_depth` at every node — O(n²). Fusing the height computation with the balance check gives O(n). Interviewers specifically look for this.

```python
# Diameter of Binary Tree — longest path between ANY two nodes
def diameter(root):
    best = 0
    def height(node):
        nonlocal best
        if not node: return 0
        lh, rh = height(node.left), height(node.right)
        best = max(best, lh + rh)        # path THROUGH this node
        return 1 + max(lh, rh)           # but only ONE side goes to the parent
    height(root)
    return best
```

**The key distinction:** the answer *through* a node uses both subtrees; the value *returned to the parent* uses only one, because a path can't fork. This same "return one, record both" shape solves Binary Tree Maximum Path Sum (Hard):

```python
def max_path_sum(root):
    best = float('-inf')
    def gain(node):
        nonlocal best
        if not node: return 0
        l = max(gain(node.left), 0)      # clamp at 0 — skip negative branches
        r = max(gain(node.right), 0)
        best = max(best, node.val + l + r)   # path through this node
        return node.val + max(l, r)          # extendable path to parent
    gain(root)
    return best
```

Learn the shape once and you get diameter, max path sum, and longest univalue path.

### The preorder pattern — "pass state down"

```python
# Validate BST — the bounds must narrow as you descend
def is_valid_bst(root):
    def check(node, low, high):
        if not node: return True
        if not (low < node.val < high): return False
        return (check(node.left,  low, node.val) and
                check(node.right, node.val, high))
    return check(root, float('-inf'), float('inf'))
```

Checking `node.left.val < node.val` locally is **wrong** — `[5, 1, 7, null, null, 3, 8]` passes locally but 3 is in the right subtree of 5 while being less than 5. Bounds must be inherited from ancestors. This is the #1 BST mistake and interviewers deliberately plant it.

```python
# Count Good Nodes — a node is good if no ancestor is larger
def good_nodes(root):
    def dfs(node, max_so_far):
        if not node: return 0
        good = 1 if node.val >= max_so_far else 0
        max_so_far = max(max_so_far, node.val)
        return good + dfs(node.left, max_so_far) + dfs(node.right, max_so_far)
    return dfs(root, root.val)
```

### BST-specific operations

```python
# Search — O(h)
def search_bst(root, val):
    while root and root.val != val:
        root = root.left if val < root.val else root.right
    return root

# Lowest Common Ancestor in a BST — O(h), exploits the ordering
def lca_bst(root, p, q):
    while root:
        if p.val < root.val and q.val < root.val:
            root = root.left            # both on the left
        elif p.val > root.val and q.val > root.val:
            root = root.right           # both on the right
        else:
            return root                 # they split here → this is the LCA

# LCA in a GENERAL binary tree — no ordering to exploit
def lca(root, p, q):
    if not root or root is p or root is q:
        return root
    left = lca(root.left, p, q)
    right = lca(root.right, p, q)
    if left and right: return root      # found in both subtrees → root is LCA
    return left or right                # otherwise pass up whichever we found

# Kth Smallest in a BST — inorder gives sorted order
def kth_smallest(root, k):
    stack, curr = [], root
    while stack or curr:
        while curr:                     # go as far left as possible
            stack.append(curr)
            curr = curr.left
        curr = stack.pop()
        k -= 1
        if k == 0: return curr.val
        curr = curr.right
```

That iterative inorder with an explicit stack is worth memorizing — it lets you stop early (O(h + k) instead of O(n)) and demonstrates you can convert recursion to iteration.

### Construction from traversals

```python
# Build from preorder + inorder
def build_tree(preorder, inorder):
    idx = {v: i for i, v in enumerate(inorder)}      # O(1) root lookup
    self_pre = [0]                                   # mutable cursor

    def build(lo, hi):
        if lo > hi: return None
        root_val = preorder[self_pre[0]]
        self_pre[0] += 1
        node = TreeNode(root_val)
        mid = idx[root_val]
        node.left  = build(lo, mid - 1)     # preorder: left is built first
        node.right = build(mid + 1, hi)
        return node
    return build(0, len(inorder) - 1)
# O(n) with the index map; O(n²) without it (searching inorder each time)
```

The logic: preorder's first element is always the root; find it in inorder; everything left of it is the left subtree, everything right is the right subtree. Preorder and postorder alone cannot reconstruct a tree — inorder is required to establish the split. Say that if asked.

### Serialize / Deserialize (Hard, common at Google/Meta)

```python
class Codec:
    def serialize(self, root):
        out = []
        def dfs(node):
            if not node:
                out.append("#")          # explicit null marker
                return
            out.append(str(node.val))
            dfs(node.left); dfs(node.right)
        dfs(root)
        return ",".join(out)

    def deserialize(self, data):
        vals = iter(data.split(","))
        def build():
            v = next(vals)
            if v == "#": return None
            node = TreeNode(int(v))
            node.left = build()
            node.right = build()
            return node
        return build()
```

Null markers are what make preorder alone sufficient — they encode the shape.

### Problem set

| Problem | Key insight |
|---|---|
| Invert Binary Tree | swap children, recurse |
| Maximum Depth | 1 + max(children) |
| Diameter of Binary Tree | return one side, record both |
| Balanced Binary Tree | fuse height + balance, use −1 sentinel |
| Same Tree / Subtree of Another Tree | structural comparison recursion |
| LCA of a BST | walk down while both on the same side |
| Binary Tree Level Order Traversal | BFS with `len(q)` snapshot |
| Right Side View | BFS, take the last of each level |
| Count Good Nodes | preorder, pass max-so-far down |
| Validate BST | pass (low, high) bounds down |
| Kth Smallest in BST | iterative inorder, stop at k |
| Construct Tree from Preorder+Inorder | index map for O(n) |
| Binary Tree Max Path Sum (Hard) | clamp negatives at 0 |
| Serialize/Deserialize (Hard) | preorder + null markers |

---

## Pattern 8: Tries (Prefix Trees)

### The idea

A tree where each edge is a character. A word is a path from the root. Lookup costs O(length of the word) — **independent of how many words are stored**. That's the whole value proposition: a hash set can tell you if a word exists, but it cannot tell you if any word *starts with* a prefix without scanning everything.

### Implementation

```python
class TrieNode:
    def __init__(self):
        self.children = {}          # char -> TrieNode
        self.is_word = False        # marks the end of a complete word

class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word):
        node = self.root
        for c in word:
            if c not in node.children:
                node.children[c] = TrieNode()
            node = node.children[c]
        node.is_word = True

    def search(self, word):
        node = self._walk(word)
        return node is not None and node.is_word

    def startsWith(self, prefix):
        return self._walk(prefix) is not None

    def _walk(self, s):
        node = self.root
        for c in s:
            if c not in node.children:
                return None
            node = node.children[c]
        return node
```

Time: O(L) per operation where L is word length. Space: O(total characters across all words).

### With wildcards — where tries beat everything else

```python
class WordDictionary:
    """Supports '.' matching any single character."""
    def __init__(self):
        self.root = TrieNode()

    def addWord(self, word):
        node = self.root
        for c in word:
            node = node.children.setdefault(c, TrieNode())
        node.is_word = True

    def search(self, word):
        def dfs(node, i):
            if i == len(word):
                return node.is_word
            c = word[i]
            if c == '.':
                return any(dfs(child, i + 1) for child in node.children.values())
            return c in node.children and dfs(node.children[c], i + 1)
        return dfs(self.root, 0)
```

The `.` branches into every child — a trie plus DFS. This combination is exactly what Word Search II needs.

### Word Search II (Hard) — the classic trie payoff

> Given a grid of letters and a word list, find every word present in the grid.

Running a separate DFS per word is O(words × cells × 4^L) — far too slow. Instead build a trie of all words and run **one** DFS over the grid, pruning the moment the current path isn't a prefix of any word.

```python
def find_words(board, words):
    root = TrieNode()
    for w in words:                        # build the trie
        node = root
        for c in w:
            node = node.children.setdefault(c, TrieNode())
        node.word = w                       # store the full word at the end

    rows, cols = len(board), len(board[0])
    found = set()

    def dfs(r, c, node):
        if not (0 <= r < rows and 0 <= c < cols):
            return
        ch = board[r][c]
        if ch not in node.children:        # PRUNE — no word has this prefix
            return
        nxt = node.children[ch]
        if getattr(nxt, 'word', None):
            found.add(nxt.word)
        board[r][c] = '#'                  # mark visited
        for dr, dc in ((0,1),(1,0),(0,-1),(-1,0)):
            dfs(r + dr, c + dc, nxt)
        board[r][c] = ch                   # backtrack — restore

    for r in range(rows):
        for c in range(cols):
            dfs(r, c, root)
    return list(found)
```

The pruning is the entire point: one bad character kills the branch for *all* words simultaneously.

### Problem set

| Problem | Key insight |
|---|---|
| Implement Trie | children dict + is_word flag |
| Design Add and Search Words | `.` branches to all children |
| Word Search II (Hard) | one grid DFS + trie pruning + backtrack |
| Longest Common Prefix | walk the trie until a branch or word-end |
| Replace Words | insert roots, walk each word until a root is hit |

---

## Pattern 9: Heaps / Priority Queues

### The idea

A **complete binary tree** stored flat in an array, maintaining the heap property: every parent ≤ its children (min-heap). The minimum is always at index 0.

Array layout (no pointers needed):
```
parent(i) = (i-1)//2      left(i) = 2i+1      right(i) = 2i+2
```

| Operation | Cost | Mechanism |
|---|---|---|
| peek min | O(1) | it's `heap[0]` |
| push | O(log n) | append at the end, "sift up" while smaller than the parent |
| pop min | O(log n) | swap root with last, shrink, "sift down" |
| heapify a list | **O(n)** | sift down from the middle backwards |

Heapify being O(n) rather than O(n log n) surprises people: most nodes are near the bottom and sift down only a step or two. The sum converges. Worth knowing as a "did they actually study this" signal.

A heap is **not** sorted — it only guarantees the minimum at the root. Printing the array gives partial order. Interviewers ask this to check for genuine understanding.

### Python usage

```python
import heapq

h = [5, 1, 3]
heapq.heapify(h)                 # O(n), in place
heapq.heappush(h, 2)             # O(log n)
smallest = h[0]                  # O(1) peek
smallest = heapq.heappop(h)      # O(log n)
heapq.heappushpop(h, x)          # push then pop, faster than separate calls
heapq.heapreplace(h, x)          # pop then push

# MAX-heap: negate on the way in and out
maxh = []
for x in nums: heapq.heappush(maxh, -x)
largest = -heapq.heappop(maxh)

# Tuples compare lexicographically → (priority, tiebreak, payload)
heapq.heappush(h, (dist, node_id))

# If payloads aren't comparable, insert a counter as a tiebreaker:
counter = 0
heapq.heappush(h, (priority, counter, obj)); counter += 1
```

### Pattern A: Top-K (heap of size k)

```python
# K-th largest element — O(n log k), beats sorting's O(n log n) when k << n
def find_kth_largest(nums, k):
    h = []
    for x in nums:
        heapq.heappush(h, x)
        if len(h) > k:
            heapq.heappop(h)        # evict the smallest
    return h[0]                     # the k-th largest is the min of the top k
```

Counterintuitive but correct: to track the k *largest*, use a **min**-heap of size k, because you need cheap access to the *weakest* member you're holding, in order to evict it.

*(Quickselect gives O(n) average for k-th largest. Mention it exists; the heap answer is usually accepted and is far less error-prone under time pressure.)*

```python
# K Closest Points to Origin
def k_closest(points, k):
    return heapq.nsmallest(k, points, key=lambda p: p[0]**2 + p[1]**2)
    # no sqrt needed — squared distance preserves ordering. Say this out loud.

# Top K Frequent Elements — O(n log k), or O(n) with bucket sort
from collections import Counter
def top_k_frequent(nums, k):
    return [x for x, _ in Counter(nums).most_common(k)]
```

### Pattern B: Merging k sorted sources

```python
def merge_k_lists(lists):
    h = []
    for i, node in enumerate(lists):
        if node:
            heapq.heappush(h, (node.val, i, node))   # i breaks val ties
    dummy = tail = ListNode()
    while h:
        val, i, node = heapq.heappop(h)
        tail.next = node
        tail = node
        if node.next:
            heapq.heappush(h, (node.next.val, i, node.next))
    return dummy.next
# O(N log k), N = total nodes, k = number of lists
```

### Pattern C: Two heaps (running median)

Maintain a **max-heap of the smaller half** and a **min-heap of the larger half**, kept balanced. The median is at the tops.

```python
class MedianFinder:
    def __init__(self):
        self.small = []      # max-heap (negated) — the lower half
        self.large = []      # min-heap — the upper half

    def addNum(self, num):
        heapq.heappush(self.small, -num)
        # ensure every element in small <= every element in large
        heapq.heappush(self.large, -heapq.heappop(self.small))
        # rebalance sizes: small may hold one extra
        if len(self.large) > len(self.small):
            heapq.heappush(self.small, -heapq.heappop(self.large))

    def findMedian(self):
        if len(self.small) > len(self.large):
            return -self.small[0]
        return (-self.small[0] + self.large[0]) / 2
# addNum O(log n), findMedian O(1)
```

The push-then-transfer-then-rebalance sequence handles every case without branching on values. Learn it as a fixed three-step ritual.

### Pattern D: Scheduling / simulation

```python
# Task Scheduler, Meeting Rooms II, Reorganize String, Network Delay Time
# Shape: pop the most urgent item, process it, push back with updated state.

# Meeting Rooms II — minimum rooms needed
def min_meeting_rooms(intervals):
    intervals.sort(key=lambda x: x[0])       # by start time
    rooms = []                                # min-heap of END times
    for start, end in intervals:
        if rooms and rooms[0] <= start:
            heapq.heappop(rooms)              # a room freed up — reuse it
        heapq.heappush(rooms, end)
    return len(rooms)
# O(n log n)
```

The heap holds the earliest-ending meeting, which is exactly the only room that could possibly be free. That's the insight.

### Problem set

| Problem | Key insight |
|---|---|
| Kth Largest Element in a Stream | min-heap of size k |
| Last Stone Weight | max-heap via negation |
| K Closest Points to Origin | squared distance, no sqrt |
| Kth Largest Element in an Array | min-heap size k, or quickselect |
| Task Scheduler | max-heap by frequency + cooldown queue, or math formula |
| Design Twitter | heap-merge the k followed feeds |
| Find Median from Data Stream (Hard) | two heaps, rebalance ritual |
| Merge K Sorted Lists (Hard) | heap of k heads, tiebreaker index |
| Meeting Rooms II | sort by start, min-heap of ends |
| Reorganize String | max-heap by frequency, hold the previous char back |

---

## Weeks 5–7 schedule

| Week | Focus |
|---|---|
| 5 | Tree traversals — write all four from memory daily. Easy tree problems. |
| 6 | Postorder tuple-returning pattern (diameter, balanced, max path sum), BST properties, LCA, construction |
| 7 | Heaps: top-K, merge-k, two heaps. Tries: implement, wildcard, Word Search II |

**Section check:**
- Write all four traversals from memory in under 5 minutes.
- Given a new tree problem, state which traversal applies *and why*, in one sentence.
- Explain why validating a BST needs inherited bounds.
- Explain why top-K largest uses a min-heap.
- Explain why `heapify` is O(n).

→ Next: **[05 — Backtracking & Graphs](05-backtracking-graphs.md)**
