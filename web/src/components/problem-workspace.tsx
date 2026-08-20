"use client";

import { useState } from "react";

import { CodeEditor } from "@/components/code-editor";
import { PracticeTimer } from "@/components/practice-timer";
import { PythonOutput } from "@/components/python-output";
import { Select } from "@/components/ui/select";
import { usePython } from "@/components/use-python";
import type { Problem } from "@/lib/content";
import type { Confidence } from "@/lib/review";
import {
  MISTAKE_CATEGORIES,
  useAnalysis,
  useAttempts,
  useReviewQueue,
  type MistakeCategory,
} from "@/lib/use-progress";

const STARTER = (slug: string) => `# ${slug}
# Write your solution, then run it against your own cases.

def solve():
    """Replace this signature with the real one from the problem."""
    raise NotImplementedError


print(solve())
`;

/**
 * The analysis template.
 *
 * Spec 20.7 F3 makes these required fields rather than a notes box, because the
 * curriculum's whole claim is that reading constraints before coding is what
 * separates a candidate who solves the problem from one who pattern-matches at
 * it. Answering them is the work, so they sit above the editor.
 */
const PROMPTS = [
  {
    key: "constraints" as const,
    label: "Constraints",
    hint: "n ≤ ? Value range? What complexity does that imply?",
  },
  {
    key: "brute" as const,
    label: "Brute force",
    hint: "The obvious answer, and its time and space.",
  },
  {
    key: "optimal" as const,
    label: "Optimal idea",
    hint: "What waste does it remove, and what does that cost?",
  },
  {
    key: "insight" as const,
    label: "Key insight",
    hint: "One sentence you would want to read in a month.",
  },
];

const CONFIDENCE: { value: string; label: string }[] = [
  { value: "1", label: "1 · no idea, needed the answer" },
  { value: "2", label: "2 · got there with heavy hints" },
  { value: "3", label: "3 · solved it, slowly" },
  { value: "4", label: "4 · solved it cleanly" },
  { value: "5", label: "5 · could teach it" },
];

export function ProblemWorkspace({ problem }: { problem: Problem }) {
  const [code, setCode] = useState(() => STARTER(problem.slug));
  const [confidence, setConfidence] = useState("3");
  const [notes, setNotes] = useState("");
  const [category, setCategory] = useState<string>(MISTAKE_CATEGORIES[0]);
  const [seconds, setSeconds] = useState(0);
  const [logged, setLogged] = useState(false);

  const { run, running, result, stageLabel } = usePython(`problem:${problem.slug}`);
  const { analysis, update } = useAnalysis(problem.slug);
  const { log } = useAttempts();
  const { record } = useReviewQueue();

  function handleLog(passed: boolean) {
    const level = Number(confidence) as Confidence;
    log({
      id: `${problem.slug}-${Date.now()}`,
      targetId: problem.slug,
      targetType: "problem",
      timestamp: Date.now(),
      durationSeconds: seconds,
      passed,
      confidence: level,
      code,
      notes,
      // Only meaningful when it went wrong, and the whole value of the log is
      // that the categories stay comparable across attempts.
      ...(passed ? {} : { category: category as MistakeCategory }),
    });
    record(problem.slug, "problem", level);
    setLogged(true);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="min-w-0 space-y-4">
        {/* Analysis before code, deliberately. */}
        <section className="rounded-xl border border-border-subtle bg-bg-raised p-4">
          <h2 className="font-display text-lg font-semibold">Before you code</h2>
          <p className="mt-1 text-sm text-text-muted">
            Fill these in first. This is the part interviewers actually listen to.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {PROMPTS.map((prompt) => (
              <label key={prompt.key} className="block">
                <span className="text-sm font-medium">{prompt.label}</span>
                <textarea
                  value={analysis[prompt.key] ?? ""}
                  onChange={(event) => update(prompt.key, event.target.value)}
                  placeholder={prompt.hint}
                  rows={3}
                  className="mt-1.5 w-full resize-y rounded-lg border border-border-subtle bg-bg px-3 py-2 text-sm placeholder:text-text-faint focus:border-accent-line focus:outline-none"
                />
              </label>
            ))}
          </div>
        </section>

        <CodeEditor
          value={code}
          onChange={setCode}
          onRun={() => run(code)}
          minHeight="18rem"
          ariaLabel={`Your solution for ${problem.title}`}
        />

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => run(code)}
            disabled={running}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-on-accent transition-colors hover:bg-accent-strong disabled:opacity-60"
          >
            {running ? "Running" : "Run"}
          </button>
          <span className="font-mono text-xs text-text-faint">
            Ctrl/Cmd + Enter
          </span>
        </div>

        <PythonOutput result={result} running={running} stageLabel={stageLabel} />
      </div>

      <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
        <PracticeTimer onElapsed={setSeconds} />

        <section className="rounded-xl border border-border-subtle bg-bg-raised p-4">
          <h2 className="font-display text-base font-semibold">Log the attempt</h2>
          <p className="mt-1 text-sm text-text-muted">
            This schedules when you next see it.
          </p>

          <div className="mt-3 space-y-3">
            <Select
              label="How did that go?"
              showLabel
              value={confidence}
              onValueChange={setConfidence}
              options={CONFIDENCE}
              className="w-full"
            />

            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={3}
              placeholder="Pattern, and what you would get wrong in a month."
              aria-label="Notes"
              className="w-full resize-y rounded-lg border border-border-subtle bg-bg px-3 py-2 text-sm placeholder:text-text-faint focus:border-accent-line focus:outline-none"
            />

            <Select
              label="If it went wrong, why?"
              showLabel
              value={category}
              onValueChange={setCategory}
              options={MISTAKE_CATEGORIES.map((name) => ({
                value: name,
                label: name,
              }))}
              className="w-full"
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleLog(true)}
                className="flex-1 rounded-lg bg-pass px-3 py-2 text-sm font-medium text-on-accent transition-opacity hover:opacity-90"
              >
                Solved
              </button>
              <button
                type="button"
                onClick={() => handleLog(false)}
                className="flex-1 rounded-lg border border-border-strong px-3 py-2 text-sm text-text-muted transition-colors hover:text-text"
              >
                Did not solve
              </button>
            </div>

            {logged && (
              <p className="text-sm text-pass">
                Logged. It will come back round in your review queue.
              </p>
            )}
          </div>
        </section>

        <section className="rounded-xl border border-border-subtle bg-bg-raised p-4 text-sm">
          <h2 className="font-display text-base font-semibold">The insight</h2>
          <p className="mt-2 leading-relaxed text-text-muted">{problem.insight}</p>
          <a
            href={problem.leetcodeUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-block text-accent underline decoration-accent-line underline-offset-4"
          >
            Open on LeetCode
          </a>
        </section>
      </aside>
    </div>
  );
}
