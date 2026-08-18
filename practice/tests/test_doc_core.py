"""Verification suite for files 01-07.

Every algorithm in the curriculum docs is reimplemented here VERBATIM and
tested. If a doc snippet is wrong, this file fails. Run it after any edit
to the docs:

    pytest tests/test_doc_core.py -v

It doubles as a reference library: when you are stuck on a pattern, read the
implementation here, then close the file and write it yourself.
"""

from __future__ import annotations

import heapq
import math
from collections import Counter, defaultdict, deque

import pytest

from dsa.helpers import ListNode, TreeNode, build_list, build_tree, list_to_array, make_cycle


# =========================================================================
# FILE 01 -- FOUNDATIONS
# =========================================================================
class TestFoundations:
    def test_fib_all_four_versions(self):
        def fib_naive(n):
            if n <= 1:
                return n
            return fib_naive(n - 1) + fib_naive(n - 2)

        def fib_memo(n, memo=None):
            if memo is None:
                memo = {}
            if n <= 1:
                return n
            if n in memo:
                return memo[n]
            memo[n] = fib_memo(n - 1, memo) + fib_memo(n - 2, memo)
            return memo[n]

        def fib_tab(n):
            if n <= 1:
                return n
            dp = [0] * (n + 1)
            dp[1] = 1
            for i in range(2, n + 1):
                dp[i] = dp[i - 1] + dp[i - 2]
            return dp[n]

        def fib_optimised(n):
            prev, curr = 0, 1
            for _ in range(n):
                prev, curr = curr, prev + curr
            return prev

        expected = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55]
        for n, want in enumerate(expected):
            assert fib_naive(n) == want
            assert fib_memo(n) == want
            assert fib_tab(n) == want
            assert fib_optimised(n) == want
        assert fib_memo(90) == 2880067194370816120

    def test_two_sum_returns_empty_when_no_pair(self):
        """Regression: the `return []` must be OUTSIDE the loop."""
        def two_sum(nums, target):
            seen = {}
            for i, x in enumerate(nums):
                need = target - x
                if need in seen:
                    return [seen[need], i]
                seen[x] = i
            return []

        assert two_sum([2, 7, 11, 15], 9) == [0, 1]
        assert two_sum([3, 2, 4], 6) == [1, 2]
        assert two_sum([3, 3], 6) == [0, 1]
        assert two_sum([1, 2, 3], 100) == []
        assert two_sum([1, 2, 3, 4, 5], 9) == [3, 4]   # answer at the very end

    def test_valid_parentheses(self):
        def is_valid(s):
            pairs = {')': '(', ']': '[', '}': '{'}
            stack = []
            for c in s:
                if c in pairs:
                    if not stack or stack.pop() != pairs[c]:
                        return False
                else:
                    stack.append(c)
            return not stack

        assert is_valid("()[]{}")
        assert is_valid("")
        assert not is_valid("(]")
        assert not is_valid(")")
        assert not is_valid("(")
        assert is_valid("{[()]}")


# =========================================================================
# FILE 02 -- ARRAYS, HASHING, TWO POINTERS, SLIDING WINDOW
# =========================================================================
class TestArraysHashing:
    def test_group_anagrams(self):
        def group_anagrams_fast(strs):
            groups = defaultdict(list)
            for s in strs:
                count = [0] * 26
                for c in s:
                    count[ord(c) - ord('a')] += 1
                groups[tuple(count)].append(s)
            return list(groups.values())

        got = group_anagrams_fast(["eat", "tea", "tan", "ate", "nat", "bat"])
        assert sorted(sorted(g) for g in got) == [["ate", "eat", "tea"], ["bat"], ["nat", "tan"]]

    def test_longest_consecutive(self):
        def longest_consecutive(nums):
            s = set(nums)
            best = 0
            for x in s:
                if x - 1 in s:
                    continue
                length = 1
                while x + length in s:
                    length += 1
                best = max(best, length)
            return best

        assert longest_consecutive([100, 4, 200, 1, 3, 2]) == 4
        assert longest_consecutive([0, 3, 7, 2, 5, 8, 4, 6, 0, 1]) == 9
        assert longest_consecutive([]) == 0
        assert longest_consecutive([1]) == 1

    def test_subarray_sum_equals_k(self):
        def subarray_sum(nums, k):
            count = 0
            running = 0
            seen = {0: 1}
            for x in nums:
                running += x
                count += seen.get(running - k, 0)
                seen[running] = seen.get(running, 0) + 1
            return count

        assert subarray_sum([1, 1, 1], 2) == 2
        assert subarray_sum([1, 2, 3], 3) == 2
        assert subarray_sum([1], 0) == 0
        assert subarray_sum([-1, -1, 1], 0) == 1

    def test_product_except_self(self):
        def product_except_self(nums):
            n = len(nums)
            out = [1] * n
            prefix = 1
            for i in range(n):
                out[i] = prefix
                prefix *= nums[i]
            suffix = 1
            for i in range(n - 1, -1, -1):
                out[i] *= suffix
                suffix *= nums[i]
            return out

        assert product_except_self([1, 2, 3, 4]) == [24, 12, 8, 6]
        assert product_except_self([-1, 1, 0, -3, 3]) == [0, 0, 9, 0, 0]


class TestTwoPointers:
    def test_two_sum_sorted(self):
        def two_sum_sorted(nums, target):
            lo, hi = 0, len(nums) - 1
            while lo < hi:
                s = nums[lo] + nums[hi]
                if s == target:
                    return [lo, hi]
                elif s < target:
                    lo += 1
                else:
                    hi -= 1
            return []

        assert two_sum_sorted([2, 7, 11, 15], 9) == [0, 1]
        assert two_sum_sorted([2, 3, 4], 6) == [0, 2]
        assert two_sum_sorted([1, 2, 3], 99) == []

    def test_three_sum(self):
        def three_sum(nums):
            nums.sort()
            res = []
            n = len(nums)
            for i in range(n - 2):
                if nums[i] > 0:
                    break
                if i > 0 and nums[i] == nums[i - 1]:
                    continue
                lo, hi = i + 1, n - 1
                while lo < hi:
                    s = nums[i] + nums[lo] + nums[hi]
                    if s < 0:
                        lo += 1
                    elif s > 0:
                        hi -= 1
                    else:
                        res.append([nums[i], nums[lo], nums[hi]])
                        lo += 1
                        hi -= 1
                        while lo < hi and nums[lo] == nums[lo - 1]:
                            lo += 1
            return res

        assert sorted(three_sum([-1, 0, 1, 2, -1, -4])) == [[-1, -1, 2], [-1, 0, 1]]
        assert three_sum([0, 1, 1]) == []
        assert three_sum([0, 0, 0]) == [[0, 0, 0]]
        assert three_sum([0, 0, 0, 0]) == [[0, 0, 0]]
        assert sorted(three_sum([-2, 0, 0, 2, 2])) == [[-2, 0, 2]]

    def test_max_area(self):
        def max_area(height):
            lo, hi = 0, len(height) - 1
            best = 0
            while lo < hi:
                best = max(best, min(height[lo], height[hi]) * (hi - lo))
                if height[lo] < height[hi]:
                    lo += 1
                else:
                    hi -= 1
            return best

        assert max_area([1, 8, 6, 2, 5, 4, 8, 3, 7]) == 49
        assert max_area([1, 1]) == 1

    def test_remove_duplicates_and_move_zeroes(self):
        def remove_duplicates(nums):
            if not nums:
                return 0
            write = 1
            for read in range(1, len(nums)):
                if nums[read] != nums[write - 1]:
                    nums[write] = nums[read]
                    write += 1
            return write

        def move_zeroes(nums):
            write = 0
            for read in range(len(nums)):
                if nums[read] != 0:
                    nums[write], nums[read] = nums[read], nums[write]
                    write += 1

        a = [1, 1, 2, 2, 3]
        assert remove_duplicates(a) == 3 and a[:3] == [1, 2, 3]
        assert remove_duplicates([]) == 0
        b = [0, 1, 0, 3, 12]
        move_zeroes(b)
        assert b == [1, 3, 12, 0, 0]


class TestSlidingWindow:
    def test_longest_substring_without_repeating(self):
        def length_of_longest_substring(s):
            last = {}
            left = 0
            best = 0
            for right, c in enumerate(s):
                if c in last and last[c] >= left:
                    left = last[c] + 1
                last[c] = right
                best = max(best, right - left + 1)
            return best

        assert length_of_longest_substring("abcabcbb") == 3
        assert length_of_longest_substring("bbbbb") == 1
        assert length_of_longest_substring("pwwkew") == 3
        assert length_of_longest_substring("") == 0
        assert length_of_longest_substring("abba") == 2   # the guard matters

    def test_character_replacement(self):
        def character_replacement(s, k):
            count = {}
            left = 0
            max_freq = 0
            best = 0
            for right, c in enumerate(s):
                count[c] = count.get(c, 0) + 1
                max_freq = max(max_freq, count[c])
                while (right - left + 1) - max_freq > k:
                    count[s[left]] -= 1
                    left += 1
                best = max(best, right - left + 1)
            return best

        assert character_replacement("ABAB", 2) == 4
        assert character_replacement("AABABBA", 1) == 4
        assert character_replacement("A", 0) == 1

    def test_min_window_substring(self):
        def min_window(s, t):
            if not s or not t:
                return ""
            need = Counter(t)
            have = {}
            required = len(need)
            formed = 0
            left = 0
            best_len = float('inf')
            best_range = (0, 0)
            for right, c in enumerate(s):
                have[c] = have.get(c, 0) + 1
                if c in need and have[c] == need[c]:
                    formed += 1
                while formed == required:
                    if right - left + 1 < best_len:
                        best_len = right - left + 1
                        best_range = (left, right)
                    lc = s[left]
                    have[lc] -= 1
                    if lc in need and have[lc] < need[lc]:
                        formed -= 1
                    left += 1
            return "" if best_len == float('inf') else s[best_range[0]:best_range[1] + 1]

        assert min_window("ADOBECODEBANC", "ABC") == "BANC"
        assert min_window("a", "a") == "a"
        assert min_window("a", "aa") == ""
        assert min_window("", "a") == ""

    def test_sliding_window_maximum(self):
        def max_sliding_window(nums, k):
            dq = deque()
            out = []
            for i, x in enumerate(nums):
                while dq and dq[0] <= i - k:
                    dq.popleft()
                while dq and nums[dq[-1]] <= x:
                    dq.pop()
                dq.append(i)
                if i >= k - 1:
                    out.append(nums[dq[0]])
            return out

        assert max_sliding_window([1, 3, -1, -3, 5, 3, 6, 7], 3) == [3, 3, 5, 5, 6, 7]
        assert max_sliding_window([1], 1) == [1]


# =========================================================================
# FILE 03 -- STACK, BINARY SEARCH, LINKED LIST
# =========================================================================
class TestStack:
    def test_eval_rpn(self):
        def eval_rpn(tokens):
            stack = []
            for t in tokens:
                if t in "+-*/" and len(t) == 1:
                    b, a = stack.pop(), stack.pop()
                    if t == '+':
                        stack.append(a + b)
                    elif t == '-':
                        stack.append(a - b)
                    elif t == '*':
                        stack.append(a * b)
                    else:
                        stack.append(int(a / b))
                else:
                    stack.append(int(t))
            return stack[0]

        assert eval_rpn(["2", "1", "+", "3", "*"]) == 9
        assert eval_rpn(["4", "13", "5", "/", "+"]) == 6
        assert eval_rpn(["-7", "2", "/"]) == -3      # truncates toward zero
        assert eval_rpn(["10", "6", "9", "3", "+", "-11", "*", "/", "*", "17", "+", "5", "+"]) == 22

    def test_min_stack(self):
        class MinStack:
            def __init__(self):
                self.stack = []
                self.mins = []

            def push(self, x):
                self.stack.append(x)
                self.mins.append(x if not self.mins else min(x, self.mins[-1]))

            def pop(self):
                self.stack.pop()
                self.mins.pop()

            def top(self):
                return self.stack[-1]

            def getMin(self):
                return self.mins[-1]

        ms = MinStack()
        for v in (-2, 0, -3):
            ms.push(v)
        assert ms.getMin() == -3
        ms.pop()
        assert ms.top() == 0
        assert ms.getMin() == -2

    def test_daily_temperatures(self):
        def daily_temperatures(temps):
            res = [0] * len(temps)
            stack = []
            for i, t in enumerate(temps):
                while stack and temps[stack[-1]] < t:
                    j = stack.pop()
                    res[j] = i - j
                stack.append(i)
            return res

        assert daily_temperatures([73, 74, 75, 71, 69, 72, 76, 73]) == [1, 1, 4, 2, 1, 1, 0, 0]
        assert daily_temperatures([30, 40, 50, 60]) == [1, 1, 1, 0]

    def test_next_greater(self):
        def next_greater(nums):
            res = [-1] * len(nums)
            stack = []
            for i, x in enumerate(nums):
                while stack and nums[stack[-1]] < x:
                    res[stack.pop()] = x
                stack.append(i)
            return res

        assert next_greater([2, 1, 2, 4, 3]) == [4, 2, 4, -1, -1]

    def test_largest_rectangle(self):
        def largest_rectangle_area(heights):
            stack = []
            best = 0
            for i, h in enumerate(heights):
                start = i
                while stack and stack[-1][1] > h:
                    idx, height = stack.pop()
                    best = max(best, height * (i - idx))
                    start = idx
                stack.append((start, h))
            n = len(heights)
            for idx, height in stack:
                best = max(best, height * (n - idx))
            return best

        assert largest_rectangle_area([2, 1, 5, 6, 2, 3]) == 10
        assert largest_rectangle_area([2, 4]) == 4
        assert largest_rectangle_area([1]) == 1
        assert largest_rectangle_area([]) == 0


class TestBinarySearch:
    def test_binary_search_template(self):
        def binary_search(nums, target):
            lo, hi = 0, len(nums) - 1
            while lo <= hi:
                mid = lo + (hi - lo) // 2
                if nums[mid] == target:
                    return mid
                elif nums[mid] < target:
                    lo = mid + 1
                else:
                    hi = mid - 1
            return -1

        arr = [-1, 0, 3, 5, 9, 12]
        assert binary_search(arr, 9) == 4
        assert binary_search(arr, 2) == -1
        assert binary_search([], 1) == -1
        for i, v in enumerate(arr):
            assert binary_search(arr, v) == i

    def test_first_true_boundary_template(self):
        def first_true(lo, hi, condition):
            while lo < hi:
                mid = lo + (hi - lo) // 2
                if condition(mid):
                    hi = mid
                else:
                    lo = mid + 1
            return lo

        assert first_true(0, 10, lambda x: x >= 7) == 7
        assert first_true(0, 10, lambda x: x >= 0) == 0

    def test_koko(self):
        def min_eating_speed(piles, h):
            def hours_needed(k):
                return sum(math.ceil(p / k) for p in piles)

            lo, hi = 1, max(piles)
            while lo < hi:
                mid = (lo + hi) // 2
                if hours_needed(mid) <= h:
                    hi = mid
                else:
                    lo = mid + 1
            return lo

        assert min_eating_speed([3, 6, 7, 11], 8) == 4
        assert min_eating_speed([30, 11, 23, 4, 20], 5) == 30
        assert min_eating_speed([30, 11, 23, 4, 20], 6) == 23

    def test_search_rotated(self):
        def search_rotated(nums, target):
            lo, hi = 0, len(nums) - 1
            while lo <= hi:
                mid = (lo + hi) // 2
                if nums[mid] == target:
                    return mid
                if nums[lo] <= nums[mid]:
                    if nums[lo] <= target < nums[mid]:
                        hi = mid - 1
                    else:
                        lo = mid + 1
                else:
                    if nums[mid] < target <= nums[hi]:
                        lo = mid + 1
                    else:
                        hi = mid - 1
            return -1

        assert search_rotated([4, 5, 6, 7, 0, 1, 2], 0) == 4
        assert search_rotated([4, 5, 6, 7, 0, 1, 2], 3) == -1
        assert search_rotated([1], 0) == -1
        assert search_rotated([3, 1], 1) == 1        # the `<=` case

    def test_find_min_rotated(self):
        def find_min(nums):
            lo, hi = 0, len(nums) - 1
            while lo < hi:
                mid = (lo + hi) // 2
                if nums[mid] > nums[hi]:
                    lo = mid + 1
                else:
                    hi = mid
            return nums[lo]

        assert find_min([3, 4, 5, 1, 2]) == 1
        assert find_min([4, 5, 6, 7, 0, 1, 2]) == 0
        assert find_min([11, 13, 15, 17]) == 11      # not rotated
        assert find_min([2, 1]) == 1


class TestLinkedList:
    def test_reverse(self):
        def reverse_list(head):
            prev = None
            curr = head
            while curr:
                nxt = curr.next
                curr.next = prev
                prev = curr
                curr = nxt
            return prev

        assert list_to_array(reverse_list(build_list([1, 2, 3, 4, 5]))) == [5, 4, 3, 2, 1]
        assert list_to_array(reverse_list(build_list([]))) == []
        assert list_to_array(reverse_list(build_list([1]))) == [1]

    def test_reverse_recursive(self):
        def reverse_recursive(head):
            if not head or not head.next:
                return head
            new_head = reverse_recursive(head.next)
            head.next.next = head
            head.next = None
            return new_head

        assert list_to_array(reverse_recursive(build_list([1, 2, 3]))) == [3, 2, 1]

    def test_middle_and_cycle(self):
        def middle(head):
            slow = fast = head
            while fast and fast.next:
                slow = slow.next
                fast = fast.next.next
            return slow

        def has_cycle(head):
            slow = fast = head
            while fast and fast.next:
                slow, fast = slow.next, fast.next.next
                if slow is fast:
                    return True
            return False

        def detect_cycle(head):
            slow = fast = head
            while fast and fast.next:
                slow, fast = slow.next, fast.next.next
                if slow is fast:
                    slow2 = head
                    while slow2 is not slow:
                        slow2, slow = slow2.next, slow.next
                    return slow
            return None

        assert middle(build_list([1, 2, 3, 4, 5])).val == 3
        assert middle(build_list([1, 2, 3, 4])).val == 3      # second middle
        assert not has_cycle(build_list([1, 2, 3]))
        cyc = make_cycle(build_list([3, 2, 0, -4]), 1)
        assert has_cycle(cyc)
        assert detect_cycle(cyc).val == 2
        assert detect_cycle(build_list([1, 2])) is None

    def test_remove_nth_from_end(self):
        def remove_nth_from_end(head, n):
            dummy = ListNode(0, head)
            slow = fast = dummy
            for _ in range(n):
                fast = fast.next
            while fast.next:
                slow, fast = slow.next, fast.next
            slow.next = slow.next.next
            return dummy.next

        assert list_to_array(remove_nth_from_end(build_list([1, 2, 3, 4, 5]), 2)) == [1, 2, 3, 5]
        assert list_to_array(remove_nth_from_end(build_list([1]), 1)) == []
        assert list_to_array(remove_nth_from_end(build_list([1, 2]), 2)) == [2]

    def test_reorder_list(self):
        def reorder_list(head):
            if not head or not head.next:
                return
            slow, fast = head, head.next
            while fast and fast.next:
                slow, fast = slow.next, fast.next.next
            second = slow.next
            slow.next = None
            prev = None
            while second:
                nxt = second.next
                second.next = prev
                prev = second
                second = nxt
            first, second = head, prev
            while second:
                n1, n2 = first.next, second.next
                first.next = second
                second.next = n1
                first, second = n1, n2

        h = build_list([1, 2, 3, 4])
        reorder_list(h)
        assert list_to_array(h) == [1, 4, 2, 3]
        h = build_list([1, 2, 3, 4, 5])
        reorder_list(h)
        assert list_to_array(h) == [1, 5, 2, 4, 3]

    def test_lru_cache(self):
        class Node:
            def __init__(self, key=0, val=0):
                self.key, self.val = key, val
                self.prev = self.next = None

        class LRUCache:
            def __init__(self, capacity):
                self.cap = capacity
                self.map = {}
                self.head = Node()
                self.tail = Node()
                self.head.next, self.tail.prev = self.tail, self.head

            def _remove(self, node):
                node.prev.next = node.next
                node.next.prev = node.prev

            def _add_front(self, node):
                node.next = self.head.next
                node.prev = self.head
                self.head.next.prev = node
                self.head.next = node

            def get(self, key):
                if key not in self.map:
                    return -1
                node = self.map[key]
                self._remove(node)
                self._add_front(node)
                return node.val

            def put(self, key, value):
                if key in self.map:
                    self._remove(self.map[key])
                node = Node(key, value)
                self.map[key] = node
                self._add_front(node)
                if len(self.map) > self.cap:
                    lru = self.tail.prev
                    self._remove(lru)
                    del self.map[lru.key]

        c = LRUCache(2)
        c.put(1, 1)
        c.put(2, 2)
        assert c.get(1) == 1
        c.put(3, 3)              # evicts key 2
        assert c.get(2) == -1
        c.put(4, 4)              # evicts key 1
        assert c.get(1) == -1
        assert c.get(3) == 3
        assert c.get(4) == 4
        c2 = LRUCache(2)
        c2.put(1, 1)
        c2.put(1, 10)            # overwrite must not grow the map
        assert c2.get(1) == 10


# =========================================================================
# FILE 04 -- TREES, TRIES, HEAPS
# =========================================================================
class TestTrees:
    def test_traversals(self):
        def preorder(node, out):
            if not node:
                return
            out.append(node.val)
            preorder(node.left, out)
            preorder(node.right, out)

        def inorder(node, out):
            if not node:
                return
            inorder(node.left, out)
            out.append(node.val)
            inorder(node.right, out)

        def postorder(node, out):
            if not node:
                return
            postorder(node.left, out)
            postorder(node.right, out)
            out.append(node.val)

        def level_order(root):
            if not root:
                return []
            out, q = [], deque([root])
            while q:
                level = []
                for _ in range(len(q)):
                    node = q.popleft()
                    level.append(node.val)
                    if node.left:
                        q.append(node.left)
                    if node.right:
                        q.append(node.right)
                out.append(level)
            return out

        root = build_tree([1, 2, 3, 4, 5, 6, 7])
        pre, ino, post = [], [], []
        preorder(root, pre)
        inorder(root, ino)
        postorder(root, post)
        assert pre == [1, 2, 4, 5, 3, 6, 7]
        assert ino == [4, 2, 5, 1, 6, 3, 7]
        assert post == [4, 5, 2, 6, 7, 3, 1]
        assert level_order(root) == [[1], [2, 3], [4, 5, 6, 7]]
        assert level_order(None) == []

    def test_depth_balanced_diameter(self):
        def max_depth(root):
            if not root:
                return 0
            return 1 + max(max_depth(root.left), max_depth(root.right))

        def is_balanced(root):
            def height(node):
                if not node:
                    return 0
                lh = height(node.left)
                if lh == -1:
                    return -1
                rh = height(node.right)
                if rh == -1:
                    return -1
                if abs(lh - rh) > 1:
                    return -1
                return 1 + max(lh, rh)
            return height(root) != -1

        def diameter(root):
            best = 0

            def height(node):
                nonlocal best
                if not node:
                    return 0
                lh, rh = height(node.left), height(node.right)
                best = max(best, lh + rh)
                return 1 + max(lh, rh)
            height(root)
            return best

        assert max_depth(build_tree([3, 9, 20, None, None, 15, 7])) == 3
        assert max_depth(None) == 0
        assert is_balanced(build_tree([3, 9, 20, None, None, 15, 7]))
        assert not is_balanced(build_tree([1, 2, 2, 3, 3, None, None, 4, 4]))
        assert is_balanced(None)
        assert diameter(build_tree([1, 2, 3, 4, 5])) == 3
        assert diameter(build_tree([1, 2])) == 1

    def test_max_path_sum(self):
        def max_path_sum(root):
            best = float('-inf')

            def gain(node):
                nonlocal best
                if not node:
                    return 0
                l = max(gain(node.left), 0)
                r = max(gain(node.right), 0)
                best = max(best, node.val + l + r)
                return node.val + max(l, r)
            gain(root)
            return best

        assert max_path_sum(build_tree([1, 2, 3])) == 6
        assert max_path_sum(build_tree([-10, 9, 20, None, None, 15, 7])) == 42
        assert max_path_sum(build_tree([-3])) == -3

    def test_validate_bst(self):
        def is_valid_bst(root):
            def check(node, low, high):
                if not node:
                    return True
                if not (low < node.val < high):
                    return False
                return (check(node.left, low, node.val) and
                        check(node.right, node.val, high))
            return check(root, float('-inf'), float('inf'))

        assert is_valid_bst(build_tree([2, 1, 3]))
        assert not is_valid_bst(build_tree([5, 1, 4, None, None, 3, 6]))
        # the classic local-check trap: 3 sits in 5's right subtree
        assert not is_valid_bst(build_tree([5, 1, 7, None, None, 3, 8]))
        assert is_valid_bst(None)

    def test_kth_smallest_iterative_inorder(self):
        def kth_smallest(root, k):
            stack, curr = [], root
            while stack or curr:
                while curr:
                    stack.append(curr)
                    curr = curr.left
                curr = stack.pop()
                k -= 1
                if k == 0:
                    return curr.val
                curr = curr.right
            return -1

        assert kth_smallest(build_tree([3, 1, 4, None, 2]), 1) == 1
        assert kth_smallest(build_tree([5, 3, 6, 2, 4, None, None, 1]), 3) == 3

    def test_lca_variants(self):
        def lca_bst(root, p, q):
            while root:
                if p.val < root.val and q.val < root.val:
                    root = root.left
                elif p.val > root.val and q.val > root.val:
                    root = root.right
                else:
                    return root
            return None

        def lca(root, p, q):
            if not root or root is p or root is q:
                return root
            left = lca(root.left, p, q)
            right = lca(root.right, p, q)
            if left and right:
                return root
            return left or right

        root = build_tree([6, 2, 8, 0, 4, 7, 9])
        assert lca_bst(root, TreeNode(2), TreeNode(8)).val == 6
        assert lca_bst(root, TreeNode(2), TreeNode(4)).val == 2

        r = build_tree([3, 5, 1, 6, 2, 0, 8])
        p, q = r.left, r.right                     # nodes 5 and 1
        assert lca(r, p, q).val == 3
        p2 = r.left.right.right if r.left.right else None
        assert lca(r, r.left, r.left.right).val == 5

    def test_build_tree_from_traversals(self):
        def build(preorder, inorder):
            idx = {v: i for i, v in enumerate(inorder)}
            cursor = [0]

            def rec(lo, hi):
                if lo > hi:
                    return None
                root_val = preorder[cursor[0]]
                cursor[0] += 1
                node = TreeNode(root_val)
                mid = idx[root_val]
                node.left = rec(lo, mid - 1)
                node.right = rec(mid + 1, hi)
                return node
            return rec(0, len(inorder) - 1)

        tree = build([3, 9, 20, 15, 7], [9, 3, 15, 20, 7])
        out = []

        def ino(n):
            if not n:
                return
            ino(n.left)
            out.append(n.val)
            ino(n.right)
        ino(tree)
        assert out == [9, 3, 15, 20, 7]
        assert tree.val == 3 and tree.right.val == 20

    def test_serialize_deserialize(self):
        class Codec:
            def serialize(self, root):
                out = []

                def dfs(node):
                    if not node:
                        out.append("#")
                        return
                    out.append(str(node.val))
                    dfs(node.left)
                    dfs(node.right)
                dfs(root)
                return ",".join(out)

            def deserialize(self, data):
                vals = iter(data.split(","))

                def build():
                    v = next(vals)
                    if v == "#":
                        return None
                    node = TreeNode(int(v))
                    node.left = build()
                    node.right = build()
                    return node
                return build()

        codec = Codec()
        for arr in ([1, 2, 3, None, None, 4, 5], [], [1], [1, 2]):
            tree = build_tree(arr)
            s = codec.serialize(tree)
            assert codec.serialize(codec.deserialize(s)) == s


class TestTrie:
    def test_trie_and_wildcard(self):
        class TrieNode:
            def __init__(self):
                self.children = {}
                self.is_word = False

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

            def _walk(self, s):
                node = self.root
                for c in s:
                    if c not in node.children:
                        return None
                    node = node.children[c]
                return node

            def search(self, word):
                node = self._walk(word)
                return node is not None and node.is_word

            def startsWith(self, prefix):
                return self._walk(prefix) is not None

        t = Trie()
        t.insert("apple")
        assert t.search("apple")
        assert not t.search("app")
        assert t.startsWith("app")
        t.insert("app")
        assert t.search("app")

        class WordDictionary:
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
                        return any(dfs(ch, i + 1) for ch in node.children.values())
                    return c in node.children and dfs(node.children[c], i + 1)
                return dfs(self.root, 0)

        wd = WordDictionary()
        for w in ("bad", "dad", "mad"):
            wd.addWord(w)
        assert not wd.search("pad")
        assert wd.search("bad")
        assert wd.search(".ad")
        assert wd.search("b..")
        assert not wd.search("b...")

    def test_word_search_ii(self):
        class TrieNode:
            def __init__(self):
                self.children = {}
                self.word = None

        def find_words(board, words):
            root = TrieNode()
            for w in words:
                node = root
                for c in w:
                    node = node.children.setdefault(c, TrieNode())
                node.word = w

            rows, cols = len(board), len(board[0])
            found = set()

            def dfs(r, c, node):
                if not (0 <= r < rows and 0 <= c < cols):
                    return
                ch = board[r][c]
                if ch not in node.children:
                    return
                nxt = node.children[ch]
                if nxt.word:
                    found.add(nxt.word)
                board[r][c] = '#'
                for dr, dc in ((0, 1), (1, 0), (0, -1), (-1, 0)):
                    dfs(r + dr, c + dc, nxt)
                board[r][c] = ch

            for r in range(rows):
                for c in range(cols):
                    dfs(r, c, root)
            return list(found)

        board = [["o", "a", "a", "n"],
                 ["e", "t", "a", "e"],
                 ["i", "h", "k", "r"],
                 ["i", "f", "l", "v"]]
        assert sorted(find_words(board, ["oath", "pea", "eat", "rain"])) == ["eat", "oath"]


class TestHeaps:
    def test_top_k(self):
        def top_k(nums, k):
            h = []
            for x in nums:
                heapq.heappush(h, x)
                if len(h) > k:
                    heapq.heappop(h)
            return h

        assert sorted(top_k([3, 2, 1, 5, 6, 4], 2)) == [5, 6]
        assert top_k([1], 1) == [1]

    def test_median_finder(self):
        class MedianFinder:
            def __init__(self):
                self.small = []
                self.large = []

            def addNum(self, num):
                heapq.heappush(self.small, -num)
                heapq.heappush(self.large, -heapq.heappop(self.small))
                if len(self.large) > len(self.small):
                    heapq.heappush(self.small, -heapq.heappop(self.large))

            def findMedian(self):
                if len(self.small) > len(self.large):
                    return -self.small[0]
                return (-self.small[0] + self.large[0]) / 2

        mf = MedianFinder()
        mf.addNum(1)
        mf.addNum(2)
        assert mf.findMedian() == 1.5
        mf.addNum(3)
        assert mf.findMedian() == 2
        mf2 = MedianFinder()
        for v in [6, 10, 2, 6, 5, 0, 6, 3, 1, 0, 0]:
            mf2.addNum(v)
        assert mf2.findMedian() == 3

    def test_min_meeting_rooms(self):
        def min_meeting_rooms(intervals):
            intervals.sort(key=lambda x: x[0])
            rooms = []
            for start, end in intervals:
                if rooms and rooms[0] <= start:
                    heapq.heappop(rooms)
                heapq.heappush(rooms, end)
            return len(rooms)

        assert min_meeting_rooms([[0, 30], [5, 10], [15, 20]]) == 2
        assert min_meeting_rooms([[7, 10], [2, 4]]) == 1
        assert min_meeting_rooms([]) == 0


# =========================================================================
# FILE 05 -- BACKTRACKING & GRAPHS
# =========================================================================
class TestBacktracking:
    def test_subsets_and_dups(self):
        def subsets(nums):
            res, path = [], []

            def backtrack(start):
                res.append(path[:])
                for i in range(start, len(nums)):
                    path.append(nums[i])
                    backtrack(i + 1)
                    path.pop()
            backtrack(0)
            return res

        def subsets_with_dup(nums):
            nums.sort()
            res, path = [], []

            def backtrack(start):
                res.append(path[:])
                for i in range(start, len(nums)):
                    if i > start and nums[i] == nums[i - 1]:
                        continue
                    path.append(nums[i])
                    backtrack(i + 1)
                    path.pop()
            backtrack(0)
            return res

        assert len(subsets([1, 2, 3])) == 8
        assert sorted(subsets([1, 2, 3])) == sorted(
            [[], [1], [1, 2], [1, 2, 3], [1, 3], [2], [2, 3], [3]])
        got = subsets_with_dup([1, 2, 2])
        assert sorted(got) == sorted([[], [1], [1, 2], [1, 2, 2], [2], [2, 2]])

    def test_permutations(self):
        def permute(nums):
            res, path = [], []
            used = [False] * len(nums)

            def backtrack():
                if len(path) == len(nums):
                    res.append(path[:])
                    return
                for i in range(len(nums)):
                    if used[i]:
                        continue
                    used[i] = True
                    path.append(nums[i])
                    backtrack()
                    path.pop()
                    used[i] = False
            backtrack()
            return res

        assert len(permute([1, 2, 3])) == 6
        assert sorted(permute([1, 2])) == [[1, 2], [2, 1]]

    def test_combination_sum_family(self):
        def combination_sum(candidates, target):
            res, path = [], []

            def backtrack(start, remaining):
                if remaining == 0:
                    res.append(path[:])
                    return
                if remaining < 0:
                    return
                for i in range(start, len(candidates)):
                    path.append(candidates[i])
                    backtrack(i, remaining - candidates[i])
                    path.pop()
            backtrack(0, target)
            return res

        def combination_sum2(candidates, target):
            candidates.sort()
            res, path = [], []

            def backtrack(start, remaining):
                if remaining == 0:
                    res.append(path[:])
                    return
                for i in range(start, len(candidates)):
                    if i > start and candidates[i] == candidates[i - 1]:
                        continue
                    if candidates[i] > remaining:
                        break
                    path.append(candidates[i])
                    backtrack(i + 1, remaining - candidates[i])
                    path.pop()
            backtrack(0, target)
            return res

        assert sorted(combination_sum([2, 3, 6, 7], 7)) == sorted([[2, 2, 3], [7]])
        assert sorted(combination_sum2([10, 1, 2, 7, 6, 1, 5], 8)) == sorted(
            [[1, 1, 6], [1, 2, 5], [1, 7], [2, 6]])

    def test_word_search(self):
        def exist(board, word):
            rows, cols = len(board), len(board[0])

            def dfs(r, c, k):
                if k == len(word):
                    return True
                if not (0 <= r < rows and 0 <= c < cols) or board[r][c] != word[k]:
                    return False
                board[r][c] = '#'
                found = (dfs(r + 1, c, k + 1) or dfs(r - 1, c, k + 1) or
                         dfs(r, c + 1, k + 1) or dfs(r, c - 1, k + 1))
                board[r][c] = word[k]
                return found

            return any(dfs(r, c, 0) for r in range(rows) for c in range(cols))

        board = [["A", "B", "C", "E"], ["S", "F", "C", "S"], ["A", "D", "E", "E"]]
        assert exist(board, "ABCCED")
        assert exist(board, "SEE")
        assert not exist(board, "ABCB")

    def test_n_queens(self):
        def solve_n_queens(n):
            res = []
            cols, diag, anti = set(), set(), set()
            board = [['.'] * n for _ in range(n)]

            def backtrack(r):
                if r == n:
                    res.append(["".join(row) for row in board])
                    return
                for c in range(n):
                    if c in cols or (r - c) in diag or (r + c) in anti:
                        continue
                    cols.add(c)
                    diag.add(r - c)
                    anti.add(r + c)
                    board[r][c] = 'Q'
                    backtrack(r + 1)
                    board[r][c] = '.'
                    cols.remove(c)
                    diag.remove(r - c)
                    anti.remove(r + c)
            backtrack(0)
            return res

        assert len(solve_n_queens(4)) == 2
        assert len(solve_n_queens(8)) == 92
        assert len(solve_n_queens(1)) == 1


class TestGraphs:
    def test_num_islands(self):
        def num_islands(grid):
            if not grid:
                return 0
            rows, cols = len(grid), len(grid[0])
            count = 0

            def sink(r, c):
                if not (0 <= r < rows and 0 <= c < cols) or grid[r][c] != '1':
                    return
                grid[r][c] = '0'
                for dr, dc in ((0, 1), (1, 0), (0, -1), (-1, 0)):
                    sink(r + dr, c + dc)

            for r in range(rows):
                for c in range(cols):
                    if grid[r][c] == '1':
                        count += 1
                        sink(r, c)
            return count

        g = [list("11110"), list("11010"), list("11000"), list("00000")]
        assert num_islands(g) == 1
        g2 = [list("11000"), list("11000"), list("00100"), list("00011")]
        assert num_islands(g2) == 3

    def test_rotting_oranges(self):
        def oranges_rotting(grid):
            rows, cols = len(grid), len(grid[0])
            q = deque()
            fresh = 0
            for r in range(rows):
                for c in range(cols):
                    if grid[r][c] == 2:
                        q.append((r, c))
                    elif grid[r][c] == 1:
                        fresh += 1
            minutes = 0
            while q and fresh:
                for _ in range(len(q)):
                    r, c = q.popleft()
                    for dr, dc in ((0, 1), (1, 0), (0, -1), (-1, 0)):
                        nr, nc = r + dr, c + dc
                        if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1:
                            grid[nr][nc] = 2
                            fresh -= 1
                            q.append((nr, nc))
                minutes += 1
            return -1 if fresh else minutes

        assert oranges_rotting([[2, 1, 1], [1, 1, 0], [0, 1, 1]]) == 4
        assert oranges_rotting([[2, 1, 1], [0, 1, 1], [1, 0, 1]]) == -1
        assert oranges_rotting([[0, 2]]) == 0

    def test_topological_sort_both_ways(self):
        def topo_sort(n, prerequisites):
            graph = defaultdict(list)
            indegree = [0] * n
            for course, prereq in prerequisites:
                graph[prereq].append(course)
                indegree[course] += 1
            q = deque([i for i in range(n) if indegree[i] == 0])
            order = []
            while q:
                node = q.popleft()
                order.append(node)
                for nei in graph[node]:
                    indegree[nei] -= 1
                    if indegree[nei] == 0:
                        q.append(nei)
            return order if len(order) == n else []

        def topo_dfs(n, prerequisites):
            graph = defaultdict(list)
            for course, prereq in prerequisites:
                graph[prereq].append(course)
            WHITE, GRAY, BLACK = 0, 1, 2
            state = [WHITE] * n
            order = []

            def dfs(node):
                if state[node] == GRAY:
                    return False
                if state[node] == BLACK:
                    return True
                state[node] = GRAY
                for nei in graph[node]:
                    if not dfs(nei):
                        return False
                state[node] = BLACK
                order.append(node)
                return True

            for i in range(n):
                if not dfs(i):
                    return []
            return order[::-1]

        assert topo_sort(2, [[1, 0]]) == [0, 1]
        assert topo_sort(2, [[1, 0], [0, 1]]) == []
        assert topo_dfs(2, [[1, 0]]) == [0, 1]
        assert topo_dfs(2, [[1, 0], [0, 1]]) == []
        order = topo_sort(4, [[1, 0], [2, 0], [3, 1], [3, 2]])
        assert order[0] == 0 and order[-1] == 3

    def test_union_find(self):
        class UnionFind:
            def __init__(self, n):
                self.parent = list(range(n))
                self.rank = [1] * n
                self.count = n

            def find(self, x):
                while self.parent[x] != x:
                    self.parent[x] = self.parent[self.parent[x]]
                    x = self.parent[x]
                return x

            def union(self, a, b):
                ra, rb = self.find(a), self.find(b)
                if ra == rb:
                    return False
                if self.rank[ra] < self.rank[rb]:
                    ra, rb = rb, ra
                self.parent[rb] = ra
                self.rank[ra] += self.rank[rb]
                self.count -= 1
                return True

        uf = UnionFind(5)
        assert uf.union(0, 1)
        assert uf.union(1, 2)
        assert not uf.union(0, 2)          # already connected -> would be a cycle
        assert uf.count == 3
        assert uf.find(0) == uf.find(2)
        assert uf.find(3) != uf.find(0)

    def test_dijkstra(self):
        def dijkstra(graph, start):
            dist = {start: 0}
            heap = [(0, start)]
            while heap:
                d, node = heapq.heappop(heap)
                if d > dist.get(node, float('inf')):
                    continue
                for nei, w in graph.get(node, []):
                    nd = d + w
                    if nd < dist.get(nei, float('inf')):
                        dist[nei] = nd
                        heapq.heappush(heap, (nd, nei))
            return dist

        graph = {1: [(2, 1), (3, 4)], 2: [(3, 2), (4, 5)], 3: [(4, 1)], 4: []}
        assert dijkstra(graph, 1) == {1: 0, 2: 1, 3: 3, 4: 4}

    def test_cheapest_flights_k_stops(self):
        def find_cheapest_price(n, flights, src, dst, k):
            dist = [float('inf')] * n
            dist[src] = 0
            for _ in range(k + 1):
                tmp = dist[:]
                for u, v, w in flights:
                    if dist[u] + w < tmp[v]:
                        tmp[v] = dist[u] + w
                dist = tmp
            return dist[dst] if dist[dst] != float('inf') else -1

        flights = [[0, 1, 100], [1, 2, 100], [0, 2, 500]]
        assert find_cheapest_price(3, flights, 0, 2, 1) == 200
        assert find_cheapest_price(3, flights, 0, 2, 0) == 500
        f2 = [[0, 1, 100], [1, 2, 100], [2, 0, 100], [1, 3, 600], [2, 3, 200]]
        assert find_cheapest_price(4, f2, 0, 3, 1) == 700

    def test_bipartite(self):
        def is_bipartite(graph):
            color = {}
            for start in range(len(graph)):
                if start in color:
                    continue
                color[start] = 0
                q = deque([start])
                while q:
                    node = q.popleft()
                    for nei in graph[node]:
                        if nei not in color:
                            color[nei] = 1 - color[node]
                            q.append(nei)
                        elif color[nei] == color[node]:
                            return False
            return True

        assert is_bipartite([[1, 3], [0, 2], [1, 3], [0, 2]])
        assert not is_bipartite([[1, 2, 3], [0, 2], [0, 1, 3], [0, 2]])


# =========================================================================
# FILE 06 -- DYNAMIC PROGRAMMING
# =========================================================================
class TestDP:
    def test_house_robber(self):
        def rob(nums):
            prev2, prev1 = 0, 0
            for x in nums:
                prev2, prev1 = prev1, max(prev1, prev2 + x)
            return prev1

        def rob2(nums):
            if len(nums) == 1:
                return nums[0]

            def rob_line(a):
                p2 = p1 = 0
                for x in a:
                    p2, p1 = p1, max(p1, p2 + x)
                return p1
            return max(rob_line(nums[:-1]), rob_line(nums[1:]))

        assert rob([1, 2, 3, 1]) == 4
        assert rob([2, 7, 9, 3, 1]) == 12
        assert rob([]) == 0
        assert rob2([2, 3, 2]) == 3
        assert rob2([1, 2, 3, 1]) == 4
        assert rob2([1]) == 1

    def test_kadane(self):
        def max_subarray(nums):
            best = curr = nums[0]
            for x in nums[1:]:
                curr = max(x, curr + x)
                best = max(best, curr)
            return best

        assert max_subarray([-2, 1, -3, 4, -1, 2, 1, -5, 4]) == 6
        assert max_subarray([-1]) == -1
        assert max_subarray([5, 4, -1, 7, 8]) == 23

    def test_decode_ways(self):
        def num_decodings(s):
            if not s or s[0] == '0':
                return 0
            prev2, prev1 = 1, 1
            for i in range(1, len(s)):
                curr = 0
                if s[i] != '0':
                    curr += prev1
                if 10 <= int(s[i - 1:i + 1]) <= 26:
                    curr += prev2
                if curr == 0:
                    return 0
                prev2, prev1 = prev1, curr
            return prev1

        assert num_decodings("12") == 2
        assert num_decodings("226") == 3
        assert num_decodings("06") == 0
        assert num_decodings("10") == 1
        assert num_decodings("100") == 0
        assert num_decodings("2101") == 1

    def test_coin_change_both(self):
        def coin_change(coins, amount):
            dp = [float('inf')] * (amount + 1)
            dp[0] = 0
            for a in range(1, amount + 1):
                for c in coins:
                    if c <= a:
                        dp[a] = min(dp[a], dp[a - c] + 1)
            return dp[amount] if dp[amount] != float('inf') else -1

        def change(amount, coins):
            dp = [0] * (amount + 1)
            dp[0] = 1
            for c in coins:
                for a in range(c, amount + 1):
                    dp[a] += dp[a - c]
            return dp[amount]

        assert coin_change([1, 2, 5], 11) == 3
        assert coin_change([2], 3) == -1
        assert coin_change([1], 0) == 0
        assert coin_change([1, 3, 4], 6) == 2      # greedy would give 3
        assert change(5, [1, 2, 5]) == 4
        assert change(3, [2]) == 0
        assert change(10, [10]) == 1

    def test_word_break(self):
        def word_break(s, wordDict):
            words = set(wordDict)
            dp = [False] * (len(s) + 1)
            dp[0] = True
            for i in range(1, len(s) + 1):
                for j in range(i):
                    if dp[j] and s[j:i] in words:
                        dp[i] = True
                        break
            return dp[len(s)]

        assert word_break("leetcode", ["leet", "code"])
        assert word_break("applepenapple", ["apple", "pen"])
        assert not word_break("catsandog", ["cats", "dog", "sand", "and", "cat"])

    def test_lis_both(self):
        import bisect

        def lis(nums):
            if not nums:
                return 0
            dp = [1] * len(nums)
            for i in range(len(nums)):
                for j in range(i):
                    if nums[j] < nums[i]:
                        dp[i] = max(dp[i], dp[j] + 1)
            return max(dp)

        def lis_fast(nums):
            tails = []
            for x in nums:
                i = bisect.bisect_left(tails, x)
                if i == len(tails):
                    tails.append(x)
                else:
                    tails[i] = x
            return len(tails)

        for arr in ([10, 9, 2, 5, 3, 7, 101, 18], [0, 1, 0, 3, 2, 3], [7, 7, 7, 7]):
            assert lis(arr) == lis_fast(arr)
        assert lis_fast([10, 9, 2, 5, 3, 7, 101, 18]) == 4
        assert lis_fast([]) == 0

    def test_partition_equal_subset(self):
        def can_partition(nums):
            total = sum(nums)
            if total % 2:
                return False
            target = total // 2
            possible = {0}
            for x in nums:
                possible |= {p + x for p in possible if p + x <= target}
                if target in possible:
                    return True
            return target in possible

        assert can_partition([1, 5, 11, 5])
        assert not can_partition([1, 2, 3, 5])
        assert not can_partition([1])

    def test_knapsack_backward_loop(self):
        def knapsack(weights, values, capacity):
            dp = [0] * (capacity + 1)
            for i in range(len(weights)):
                for c in range(capacity, weights[i] - 1, -1):
                    dp[c] = max(dp[c], dp[c - weights[i]] + values[i])
            return dp[capacity]

        assert knapsack([1, 3, 4, 5], [1, 4, 5, 7], 7) == 9

    def test_two_sequence_dp(self):
        def lcs(a, b):
            m, n = len(a), len(b)
            dp = [[0] * (n + 1) for _ in range(m + 1)]
            for i in range(1, m + 1):
                for j in range(1, n + 1):
                    if a[i - 1] == b[j - 1]:
                        dp[i][j] = dp[i - 1][j - 1] + 1
                    else:
                        dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
            return dp[m][n]

        def min_distance(a, b):
            m, n = len(a), len(b)
            dp = [[0] * (n + 1) for _ in range(m + 1)]
            for i in range(m + 1):
                dp[i][0] = i
            for j in range(n + 1):
                dp[0][j] = j
            for i in range(1, m + 1):
                for j in range(1, n + 1):
                    if a[i - 1] == b[j - 1]:
                        dp[i][j] = dp[i - 1][j - 1]
                    else:
                        dp[i][j] = 1 + min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1])
            return dp[m][n]

        assert lcs("abcde", "ace") == 3
        assert lcs("abc", "def") == 0
        assert lcs("", "abc") == 0
        assert min_distance("horse", "ros") == 3
        assert min_distance("intention", "execution") == 5
        assert min_distance("", "abc") == 3

    def test_grid_dp(self):
        def unique_paths(m, n):
            dp = [1] * n
            for _ in range(1, m):
                for j in range(1, n):
                    dp[j] += dp[j - 1]
            return dp[-1]

        def min_path_sum(grid):
            m, n = len(grid), len(grid[0])
            for i in range(m):
                for j in range(n):
                    if i == 0 and j == 0:
                        continue
                    up = grid[i - 1][j] if i else float('inf')
                    left = grid[i][j - 1] if j else float('inf')
                    grid[i][j] += min(up, left)
            return grid[-1][-1]

        assert unique_paths(3, 7) == 28
        assert unique_paths(3, 2) == 3
        assert unique_paths(1, 1) == 1
        assert min_path_sum([[1, 3, 1], [1, 5, 1], [4, 2, 1]]) == 7

    def test_stock_cooldown(self):
        def max_profit(prices):
            hold = float('-inf')
            sold = float('-inf')
            rest = 0
            for p in prices:
                prev_sold = sold
                sold = hold + p
                hold = max(hold, rest - p)
                rest = max(rest, prev_sold)
            return max(sold, rest)

        assert max_profit([1, 2, 3, 0, 2]) == 3
        assert max_profit([1]) == 0

    def test_longest_palindrome_expand(self):
        def longest_palindrome(s):
            res = ""
            for i in range(len(s)):
                for l, r in ((i, i), (i, i + 1)):
                    while l >= 0 and r < len(s) and s[l] == s[r]:
                        l -= 1
                        r += 1
                    if r - l - 1 > len(res):
                        res = s[l + 1:r]
            return res

        assert longest_palindrome("babad") in ("bab", "aba")
        assert longest_palindrome("cbbd") == "bb"
        assert longest_palindrome("a") == "a"

    def test_burst_balloons(self):
        def max_coins(nums):
            nums = [1] + nums + [1]
            n = len(nums)
            dp = [[0] * n for _ in range(n)]
            for length in range(2, n):
                for i in range(n - length):
                    j = i + length
                    for k in range(i + 1, j):
                        dp[i][j] = max(dp[i][j],
                                       dp[i][k] + nums[i] * nums[k] * nums[j] + dp[k][j])
            return dp[0][n - 1]

        assert max_coins([3, 1, 5, 8]) == 167
        assert max_coins([1, 5]) == 10


# =========================================================================
# FILE 07 -- GREEDY, INTERVALS, BITS, MATH
# =========================================================================
class TestGreedy:
    def test_jump_games(self):
        def can_jump(nums):
            reach = 0
            for i, x in enumerate(nums):
                if i > reach:
                    return False
                reach = max(reach, i + x)
            return True

        def jump(nums):
            jumps = curr_end = furthest = 0
            for i in range(len(nums) - 1):
                furthest = max(furthest, i + nums[i])
                if i == curr_end:
                    jumps += 1
                    curr_end = furthest
            return jumps

        assert can_jump([2, 3, 1, 1, 4])
        assert not can_jump([3, 2, 1, 0, 4])
        assert jump([2, 3, 1, 1, 4]) == 2
        assert jump([2, 3, 0, 1, 4]) == 2
        assert jump([0]) == 0

    def test_gas_station(self):
        def can_complete_circuit(gas, cost):
            if sum(gas) < sum(cost):
                return -1
            start = tank = 0
            for i in range(len(gas)):
                tank += gas[i] - cost[i]
                if tank < 0:
                    start = i + 1
                    tank = 0
            return start

        assert can_complete_circuit([1, 2, 3, 4, 5], [3, 4, 5, 1, 2]) == 3
        assert can_complete_circuit([2, 3, 4], [3, 4, 3]) == -1

    def test_hand_of_straights(self):
        def is_n_straight_hand(hand, group_size):
            if len(hand) % group_size:
                return False
            count = Counter(hand)
            for x in sorted(count):
                c = count[x]
                if c > 0:
                    for k in range(x, x + group_size):
                        if count[k] < c:
                            return False
                        count[k] -= c
            return True

        assert is_n_straight_hand([1, 2, 3, 6, 2, 3, 4, 7, 8], 3)
        assert not is_n_straight_hand([1, 2, 3, 4, 5], 4)


class TestIntervals:
    def test_merge_and_insert(self):
        def merge(intervals):
            intervals.sort(key=lambda x: x[0])
            out = []
            for start, end in intervals:
                if out and start <= out[-1][1]:
                    out[-1][1] = max(out[-1][1], end)
                else:
                    out.append([start, end])
            return out

        def insert(intervals, new):
            out = []
            i, n = 0, len(intervals)
            while i < n and intervals[i][1] < new[0]:
                out.append(intervals[i])
                i += 1
            while i < n and intervals[i][0] <= new[1]:
                new = [min(new[0], intervals[i][0]), max(new[1], intervals[i][1])]
                i += 1
            out.append(new)
            out.extend(intervals[i:])
            return out

        assert merge([[1, 3], [2, 6], [8, 10], [15, 18]]) == [[1, 6], [8, 10], [15, 18]]
        assert merge([[1, 4], [4, 5]]) == [[1, 5]]
        assert insert([[1, 3], [6, 9]], [2, 5]) == [[1, 5], [6, 9]]
        assert insert([[1, 5]], [2, 3]) == [[1, 5]]
        assert insert([], [5, 7]) == [[5, 7]]

    def test_non_overlapping(self):
        def erase_overlap_intervals(intervals):
            intervals.sort(key=lambda x: x[1])
            count = 0
            prev_end = float('-inf')
            for start, end in intervals:
                if start >= prev_end:
                    prev_end = end
                else:
                    count += 1
            return count

        assert erase_overlap_intervals([[1, 2], [2, 3], [3, 4], [1, 3]]) == 1
        assert erase_overlap_intervals([[1, 2], [1, 2], [1, 2]]) == 2
        assert erase_overlap_intervals([[1, 2], [2, 3]]) == 0

    def test_min_meeting_rooms_sweep(self):
        def min_meeting_rooms(intervals):
            if not intervals:
                return 0
            starts = sorted(i[0] for i in intervals)
            ends = sorted(i[1] for i in intervals)
            rooms = best = 0
            s = e = 0
            while s < len(starts):
                if starts[s] < ends[e]:
                    rooms += 1
                    best = max(best, rooms)
                    s += 1
                else:
                    rooms -= 1
                    e += 1
            return best

        assert min_meeting_rooms([[0, 30], [5, 10], [15, 20]]) == 2
        assert min_meeting_rooms([[7, 10], [2, 4]]) == 1


class TestBits:
    def test_xor_family(self):
        def single_number(nums):
            result = 0
            for x in nums:
                result ^= x
            return result

        def missing_number(nums):
            result = len(nums)
            for i, x in enumerate(nums):
                result ^= i ^ x
            return result

        assert single_number([4, 1, 2, 1, 2]) == 4
        assert single_number([2, 2, 1]) == 1
        assert missing_number([3, 0, 1]) == 2
        assert missing_number([0]) == 1
        assert missing_number([9, 6, 4, 2, 3, 5, 7, 0, 1]) == 8

    def test_bit_tricks(self):
        def hamming_weight(n):
            count = 0
            while n:
                n &= n - 1
                count += 1
            return count

        def count_bits(n):
            dp = [0] * (n + 1)
            for i in range(1, n + 1):
                dp[i] = dp[i >> 1] + (i & 1)
            return dp

        assert hamming_weight(11) == 3
        assert hamming_weight(0) == 0
        assert hamming_weight(2 ** 31 - 1) == 31
        assert count_bits(5) == [0, 1, 1, 2, 1, 2]
        for i in range(64):
            assert count_bits(i)[i] == bin(i).count('1')
        assert 12 & 11 == 8            # n & (n-1) clears the lowest set bit
        assert 12 & -12 == 4           # n & -n isolates it


class TestMathGeometry:
    def test_rotate_image(self):
        def rotate(matrix):
            matrix.reverse()
            for i in range(len(matrix)):
                for j in range(i + 1, len(matrix)):
                    matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]

        m = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
        rotate(m)
        assert m == [[7, 4, 1], [8, 5, 2], [9, 6, 3]]

    def test_spiral_matrix(self):
        def spiral_order(matrix):
            out = []
            top, bottom = 0, len(matrix) - 1
            left, right = 0, len(matrix[0]) - 1
            while top <= bottom and left <= right:
                for c in range(left, right + 1):
                    out.append(matrix[top][c])
                top += 1
                for r in range(top, bottom + 1):
                    out.append(matrix[r][right])
                right -= 1
                if top <= bottom:
                    for c in range(right, left - 1, -1):
                        out.append(matrix[bottom][c])
                    bottom -= 1
                if left <= right:
                    for r in range(bottom, top - 1, -1):
                        out.append(matrix[r][left])
                    left += 1
            return out

        assert spiral_order([[1, 2, 3], [4, 5, 6], [7, 8, 9]]) == [1, 2, 3, 6, 9, 8, 7, 4, 5]
        assert spiral_order([[1, 2, 3, 4]]) == [1, 2, 3, 4]      # single row guard
        assert spiral_order([[1], [2], [3]]) == [1, 2, 3]        # single column guard

    def test_set_matrix_zeroes(self):
        def set_zeroes(matrix):
            rows, cols = len(matrix), len(matrix[0])
            first_col_zero = any(matrix[r][0] == 0 for r in range(rows))
            for r in range(rows):
                for c in range(1, cols):
                    if matrix[r][c] == 0:
                        matrix[r][0] = matrix[0][c] = 0
            for r in range(rows - 1, -1, -1):
                for c in range(cols - 1, 0, -1):
                    if matrix[r][0] == 0 or matrix[0][c] == 0:
                        matrix[r][c] = 0
                if first_col_zero:
                    matrix[r][0] = 0

        m = [[1, 1, 1], [1, 0, 1], [1, 1, 1]]
        set_zeroes(m)
        assert m == [[1, 0, 1], [0, 0, 0], [1, 0, 1]]
        m2 = [[0, 1, 2, 0], [3, 4, 5, 2], [1, 3, 1, 5]]
        set_zeroes(m2)
        assert m2 == [[0, 0, 0, 0], [0, 4, 5, 0], [0, 3, 1, 0]]

    def test_pow_and_sieve(self):
        def my_pow(x, n):
            if n < 0:
                x, n = 1 / x, -n
            result = 1
            while n:
                if n & 1:
                    result *= x
                x *= x
                n >>= 1
            return result

        def sieve(n):
            is_prime = [True] * n
            is_prime[0] = is_prime[1] = False
            for i in range(2, int(n ** 0.5) + 1):
                if is_prime[i]:
                    for j in range(i * i, n, i):
                        is_prime[j] = False
            return [i for i, p in enumerate(is_prime) if p]

        assert my_pow(2.0, 10) == 1024
        assert abs(my_pow(2.0, -2) - 0.25) < 1e-9
        assert my_pow(2.0, 0) == 1
        assert sieve(30) == [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]
