/**
 * Python execution worker.
 *
 * Everything the learner runs happens in here, off the main thread, because an
 * infinite loop is a normal thing for a beginner to write and it must not take
 * the tab down with it. The page cannot interrupt Python once it is running, so
 * the only reliable stop is for the page to terminate this whole worker; the
 * timeout that does so lives on the page side.
 *
 * Plain JavaScript rather than TypeScript: it is served as a static asset and
 * loaded with `new Worker(...)`, so it never passes through the bundler.
 */

/* global importScripts, loadPyodide */

const PYODIDE_VERSION = "0.29.2";
const INDEX_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

let pyodide = null;
let loading = null;

/**
 * One namespace per session, keyed by the page that owns it.
 *
 * Lessons are written as a continuous piece of code: a block imports
 * `defaultdict` and the next block three paragraphs down uses it. Running each
 * block in a fresh namespace would give a NameError on perfectly correct lesson
 * code, so blocks on a page share state the way notebook cells do.
 *
 * State is shared, but failure is not: file 00 teaches reading tracebacks with
 * blocks that raise on purpose, and those must not stop the blocks after them.
 */
const namespaces = new Map();

/**
 * Helpers preloaded into every namespace.
 *
 * Spec 20.7 F1: tree and linked-list snippets in the lessons assume these exist,
 * so they have to be importable without the learner setting anything up. This
 * mirrors `practice/dsa/helpers.py` for the shapes the lessons actually use.
 */
const HELPERS = `
import sys as _sys, types as _types

_dsa = _types.ModuleType("dsa")
_helpers = _types.ModuleType("dsa.helpers")

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

    def __repr__(self):
        vals, node, guard = [], self, 0
        while node and guard < 100:
            vals.append(repr(node.val))
            node = node.next
            guard += 1
        if node:
            vals.append("...(cycle or very long)")
        return " -> ".join(vals)


class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

    def __repr__(self):
        return f"TreeNode({self.val})"


def build_list(values):
    head = None
    for value in reversed(list(values)):
        head = ListNode(value, head)
    return head


def build_tree(values):
    """Level-order list to a tree, with None for a missing child."""
    values = list(values)
    if not values or values[0] is None:
        return None
    root = TreeNode(values[0])
    queue, i = [root], 1
    while queue and i < len(values):
        node = queue.pop(0)
        if i < len(values):
            value = values[i]; i += 1
            if value is not None:
                node.left = TreeNode(value); queue.append(node.left)
        if i < len(values):
            value = values[i]; i += 1
            if value is not None:
                node.right = TreeNode(value); queue.append(node.right)
    return root


def show(label, value):
    print(f"{label}: {value!r}")


for _name in ("ListNode", "TreeNode", "build_list", "build_tree", "show"):
    setattr(_helpers, _name, globals()[_name])

_dsa.helpers = _helpers
_sys.modules["dsa"] = _dsa
_sys.modules["dsa.helpers"] = _helpers
`;

async function ensurePyodide() {
  if (pyodide) return pyodide;
  if (loading) return loading;

  loading = (async () => {
    postMessage({ type: "status", stage: "downloading" });
    importScripts(`${INDEX_URL}pyodide.js`);
    const instance = await loadPyodide({ indexURL: INDEX_URL });

    postMessage({ type: "status", stage: "preparing" });
    await instance.runPythonAsync(HELPERS);

    pyodide = instance;
    postMessage({ type: "status", stage: "ready" });
    return instance;
  })();

  return loading;
}

/**
 * Run one snippet and report what happened.
 *
 * stdout and stderr are captured together in submission order, because that is
 * what a terminal shows and the lessons teach reading terminal output. The
 * traceback is passed through exactly as Python produced it — file 00 §0.15
 * teaches reading tracebacks and prettifying them here would undo that.
 */
async function run(id, code, session) {
  const instance = await ensurePyodide();

  instance.setStdout({
    batched: (text) => postMessage({ type: "output", id, stream: "stdout", text }),
  });
  instance.setStderr({
    batched: (text) => postMessage({ type: "output", id, stream: "stderr", text }),
  });

  let namespace = namespaces.get(session);
  if (!namespace) {
    namespace = instance.globals.get("dict")();
    namespaces.set(session, namespace);
  }

  const started = Date.now();
  try {
    await instance.runPythonAsync(code, { globals: namespace });
    postMessage({ type: "done", id, ok: true, ms: Date.now() - started });
  } catch (error) {
    postMessage({
      type: "done",
      id,
      ok: false,
      ms: Date.now() - started,
      traceback: String(error && error.message ? error.message : error),
    });
  }
}

/**
 * Grade one drill exercise.
 *
 * The verdict has to match `python -m drills.day0_python` exactly, so the same
 * three outcomes the CLI distinguishes are reproduced here: an unfinished stub
 * raising NotImplementedError is "not attempted yet" rather than a failure, any
 * other exception is a failure carrying its traceback, and otherwise the answer
 * is compared with `==` against the expected value.
 *
 * Each grading run gets a throwaway namespace. Sharing one would let a name
 * defined while solving exercise 12 satisfy exercise 30, which would mark work
 * correct that fails the moment it is run on its own.
 */
async function grade(id, payload) {
  const instance = await ensurePyodide();
  const { code, support, call, expected } = payload;

  // Output during grading is the learner's own prints; keep them.
  const collected = [];
  instance.setStdout({ batched: (text) => collected.push(text) });
  instance.setStderr({ batched: (text) => collected.push(text) });

  const namespace = instance.globals.get("dict")();
  const started = Date.now();

  try {
    // The learner's code first, so a syntax error is reported as theirs.
    try {
      await instance.runPythonAsync(code, { globals: namespace });
    } catch (error) {
      postMessage({
        type: "graded",
        id,
        status: "code-error",
        traceback: String(error && error.message ? error.message : error),
        stdout: collected.join(""),
        ms: Date.now() - started,
      });
      return;
    }

    if (support) {
      await instance.runPythonAsync(support, { globals: namespace });
    }

    const harness = [
      "import json as _json, traceback as _tb",
      "_v = {}",
      "try:",
      "    _got = (" + call + ")",
      "    _v['status'] = 'ran'",
      "    _v['got'] = repr(_got)",
      "except NotImplementedError:",
      "    _v['status'] = 'todo'",
      "except Exception:",
      "    _v['status'] = 'error'",
      "    _v['traceback'] = _tb.format_exc()",
      "_exp = (" + expected + ")",
      "_v['expected'] = repr(_exp)",
      "if _v['status'] == 'ran':",
      "    _v['passed'] = bool(_got == _exp)",
      "_json.dumps(_v)",
    ].join("\n");

    const raw = await instance.runPythonAsync(harness, { globals: namespace });
    const verdict = JSON.parse(raw);

    postMessage({
      type: "graded",
      id,
      ...verdict,
      stdout: collected.join(""),
      ms: Date.now() - started,
    });
  } catch (error) {
    postMessage({
      type: "graded",
      id,
      status: "error",
      traceback: String(error && error.message ? error.message : error),
      stdout: collected.join(""),
      ms: Date.now() - started,
    });
  } finally {
    namespace.destroy();
  }
}

self.onmessage = (event) => {
  const { type, id, code, session } = event.data || {};
  if (type === "warmup") {
    ensurePyodide().catch((error) =>
      postMessage({ type: "fatal", message: String(error) }),
    );
    return;
  }
  if (type === "reset") {
    const namespace = namespaces.get(session);
    if (namespace) {
      namespace.destroy();
      namespaces.delete(session);
    }
    postMessage({ type: "reset-done", session });
    return;
  }
  if (type === "grade") {
    grade(id, event.data.payload).catch((error) =>
      postMessage({
        type: "graded",
        id,
        status: "error",
        traceback: String(error),
        ms: 0,
      }),
    );
    return;
  }

  if (type === "run") {
    run(id, code, session || "default").catch((error) =>
      postMessage({
        type: "done",
        id,
        ok: false,
        ms: 0,
        traceback: String(error),
      }),
    );
  }
};
