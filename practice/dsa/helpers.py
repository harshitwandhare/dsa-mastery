"""Shared structures and utilities for DSA practice.

Import these in any solution file:

    from dsa.helpers import ListNode, TreeNode, build_list, build_tree, show
"""

from __future__ import annotations

from collections.abc import Iterable
from typing import Any


# --------------------------------------------------------------------------
# Linked list
# --------------------------------------------------------------------------
class ListNode:
    def __init__(self, val: Any = 0, next: ListNode | None = None):
        self.val = val
        self.next = next

    def __repr__(self) -> str:
        vals: list[str] = []
        node: ListNode | None = self
        guard = 0
        while node and guard < 100:
            vals.append(repr(node.val))
            node = node.next
            guard += 1
        if node:
            vals.append("...(cycle or very long)")
        return " -> ".join(vals)


def build_list(values: Iterable[Any]) -> ListNode | None:
    """[1,2,3] -> 1 -> 2 -> 3"""
    dummy = ListNode()
    tail = dummy
    for v in values:
        tail.next = ListNode(v)
        tail = tail.next
    return dummy.next


def list_to_array(head: ListNode | None) -> list:
    out, guard = [], 0
    while head and guard < 10_000:
        out.append(head.val)
        head = head.next
        guard += 1
    return out


def make_cycle(head: ListNode | None, pos: int) -> ListNode | None:
    """Link the tail back to index `pos`. pos = -1 means no cycle."""
    if head is None or pos < 0:
        return head
    nodes: list[ListNode] = []
    node: ListNode | None = head
    while node:
        nodes.append(node)
        node = node.next
    nodes[-1].next = nodes[pos]
    return head


# --------------------------------------------------------------------------
# Binary tree
# --------------------------------------------------------------------------
class TreeNode:
    def __init__(
        self, val: Any = 0, left: TreeNode | None = None, right: TreeNode | None = None
    ) -> None:
        self.val = val
        self.left = left
        self.right = right

    def __repr__(self) -> str:
        return f"TreeNode({self.val})"


def build_tree(values: list) -> TreeNode | None:
    """LeetCode level-order format, with None for missing nodes.

    build_tree([3, 9, 20, None, None, 15, 7])
    """
    if not values or values[0] is None:
        return None
    root = TreeNode(values[0])
    queue = [root]
    i = 1
    while queue and i < len(values):
        node = queue.pop(0)
        if i < len(values):
            v = values[i]
            i += 1
            if v is not None:
                node.left = TreeNode(v)
                queue.append(node.left)
        if i < len(values):
            v = values[i]
            i += 1
            if v is not None:
                node.right = TreeNode(v)
                queue.append(node.right)
    return root


def tree_to_array(root: TreeNode | None) -> list:
    """Inverse of build_tree, with trailing Nones trimmed."""
    if not root:
        return []
    out: list[Any] = []
    queue: list[TreeNode | None] = [root]
    while queue:
        node = queue.pop(0)
        if node is None:
            out.append(None)
            continue
        out.append(node.val)
        queue.append(node.left)
        queue.append(node.right)
    while out and out[-1] is None:
        out.pop()
    return out


def show_tree(root: TreeNode | None, indent: str = "", side: str = "root") -> None:
    """Print a tree sideways so you can actually see its shape."""
    if root is None:
        return
    show_tree(root.right, indent + "    ", "R")
    print(f"{indent}{side}: {root.val}")
    show_tree(root.left, indent + "    ", "L")


# --------------------------------------------------------------------------
# Grid
# --------------------------------------------------------------------------
DIRS4 = ((0, 1), (1, 0), (0, -1), (-1, 0))
DIRS8 = (*DIRS4, (1, 1), (1, -1), (-1, 1), (-1, -1))


def show_grid(grid: list[list]) -> None:
    width = max((len(str(c)) for row in grid for c in row), default=1)
    for row in grid:
        print(" ".join(str(c).rjust(width) for c in row))


def in_bounds(grid: list[list], r: int, c: int) -> bool:
    return 0 <= r < len(grid) and 0 <= c < len(grid[0])


# --------------------------------------------------------------------------
# Output
# --------------------------------------------------------------------------
def show(label: str, value: Any) -> None:
    """Consistent labelled output so runs are readable."""
    print(f"{label:<28} {value}")


def check(label: str, got: Any, expected: Any) -> bool:
    ok: bool = got == expected
    mark = "PASS" if ok else "FAIL"
    print(f"[{mark}] {label:<40} got={got!r}" + ("" if ok else f"  expected={expected!r}"))
    return ok
