"use client";

import type { RunResult } from "@/lib/python-runtime";

type Props = {
  result: RunResult | null;
  running: boolean;
  /** What the runtime is doing, so a 10 MB download does not look like a hang. */
  stageLabel: string | null;
};

/**
 * The output panel.
 *
 * Tracebacks are printed exactly as Python produced them. File 00 §0.15 teaches
 * reading them, and the app has to reinforce that rather than replace it with a
 * friendlier summary that hides the line number the reader needs.
 */
export function PythonOutput({ result, running, stageLabel }: Props) {
  if (running) {
    return (
      <div className="rounded-lg border border-border-subtle bg-bg-inset px-3.5 py-3 font-mono text-sm text-text-muted">
        <span className="inline-flex items-center gap-2">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
          {stageLabel ?? "Running"}
        </span>
      </div>
    );
  }

  if (!result) return null;

  const stdout = result.output
    .filter((chunk) => chunk.stream === "stdout")
    .map((chunk) => chunk.text)
    .join("");
  const stderr = result.output
    .filter((chunk) => chunk.stream === "stderr")
    .map((chunk) => chunk.text)
    .join("");

  const nothingAtAll = !stdout && !stderr && result.ok;

  return (
    <div className="overflow-hidden rounded-lg border border-border-subtle bg-bg-inset">
      <div className="flex items-center justify-between border-b border-border-subtle px-3.5 py-2">
        <span className="font-mono text-xs uppercase tracking-wide text-text-faint">
          Output
        </span>
        <span
          className={`font-mono text-xs ${result.ok ? "text-pass" : "text-fail"}`}
        >
          {result.timedOut
            ? "stopped"
            : result.ok
              ? `ok · ${result.ms} ms`
              : "error"}
        </span>
      </div>

      <div className="max-h-80 overflow-auto px-3.5 py-3">
        {nothingAtAll && (
          <p className="font-mono text-sm text-text-faint">
            Ran without errors, but nothing was printed. Add a{" "}
            <code>print(...)</code> to see a value.
          </p>
        )}

        {stdout && (
          <pre className="whitespace-pre-wrap break-words font-mono text-sm text-text">
            {stdout}
          </pre>
        )}

        {stderr && (
          <pre className="mt-2 whitespace-pre-wrap break-words font-mono text-sm text-warn">
            {stderr}
          </pre>
        )}

        {result.traceback && (
          <pre className="mt-2 whitespace-pre-wrap break-words font-mono text-sm text-fail">
            {result.traceback}
          </pre>
        )}
      </div>
    </div>
  );
}
