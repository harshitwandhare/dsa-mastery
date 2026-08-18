"use client";

import { useEffect, useState } from "react";

import { CodeEditor } from "@/components/code-editor";
import { PythonOutput } from "@/components/python-output";
import { usePython } from "@/components/use-python";

const STORAGE_KEY = "playground-draft";

const STARTER = `# Anything you write here runs in your browser.
# Ctrl/Cmd + Enter to run.

print(sum(range(10)))

from collections import Counter
print(Counter("mississippi").most_common(2))
`;

const SAMPLES = [
  {
    label: "Two Sum",
    code: `def two_sum(nums, target):
    seen = {}
    for i, x in enumerate(nums):
        if target - x in seen:
            return [seen[target - x], i]
        seen[x] = i
    return []

print(two_sum([2, 7, 11, 15], 9))
`,
  },
  {
    label: "Walk a tree",
    code: `from dsa.helpers import build_tree

root = build_tree([1, 2, 3, 4, 5])

def inorder(node):
    if not node:
        return []
    return inorder(node.left) + [node.val] + inorder(node.right)

print(inorder(root))
`,
  },
  {
    label: "See a traceback",
    code: `def average(numbers):
    return sum(numbers) / len(numbers)

# An empty list has no average, so this raises. Read the traceback bottom-up:
# the last line is what went wrong, the lines above are how it got there.
print(average([]))
`,
  },
];

export function Playground() {
  // Read the saved draft during the first render rather than in an effect.
  // That is safe here because the editor mounts client-side and its contents
  // never appear in the server HTML, so there is nothing to mismatch.
  const [code, setCode] = useState(() => {
    if (typeof window === "undefined") return STARTER;
    return window.localStorage.getItem(STORAGE_KEY) ?? STARTER;
  });
  const { run, reset, running, result, stageLabel, stage } = usePython("playground");

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, code);
  }, [code]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => run(code)}
          disabled={running}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-on-accent transition-colors hover:bg-accent-strong disabled:opacity-60"
        >
          {running ? "Running" : "Run"}
        </button>

        <span className="mr-1 text-xs text-text-faint">Try:</span>
        {SAMPLES.map((sample) => (
          <button
            key={sample.label}
            type="button"
            onClick={() => setCode(sample.code)}
            className="rounded-md border border-border-subtle px-2.5 py-1.5 text-xs text-text-muted transition-colors hover:border-border-strong hover:text-text"
          >
            {sample.label}
          </button>
        ))}

        <button
          type="button"
          onClick={reset}
          className="rounded-md px-2 py-1.5 text-xs text-text-faint transition-colors hover:text-text"
          title="Forget every name defined so far"
        >
          Clear session
        </button>

        <span className="ml-auto font-mono text-xs text-text-faint">
          {stage === "ready" ? "python ready" : "python loads on first run"}
        </span>
      </div>

      <CodeEditor
        value={code}
        onChange={setCode}
        onRun={() => run(code)}
        minHeight="20rem"
        ariaLabel="Python scratchpad"
      />

      <PythonOutput result={result} running={running} stageLabel={stageLabel} />

      <p className="text-xs text-text-faint">
        Runs share state, so a name you define stays defined until you clear the
        session. Runs are cut off after 10 seconds, so an accidental infinite
        loop stops the code rather than the tab.
      </p>
    </div>
  );
}
