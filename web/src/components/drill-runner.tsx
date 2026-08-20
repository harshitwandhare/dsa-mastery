"use client";

import { useCallback, useMemo, useState } from "react";

import { CodeEditor } from "@/components/code-editor";
import { Select } from "@/components/ui/select";
import type { Drill, Exercise } from "@/lib/content";
import { gradeExercise, warmUp, type Verdict } from "@/lib/python-runtime";
import { useDrillProgress } from "@/lib/use-progress";

type Props = {
  drill: Drill;
};

const STATUS_STYLE: Record<string, string> = {
  passed: "text-pass",
  failed: "text-fail",
  todo: "text-text-faint",
};

function Mark({ state }: { state: "passed" | "failed" | "todo" }) {
  if (state === "passed") {
    return (
      <span className="text-pass" aria-hidden="true">
        ✓
      </span>
    );
  }
  if (state === "failed") {
    return (
      <span className="text-fail" aria-hidden="true">
        ✕
      </span>
    );
  }
  return (
    <span className="text-text-faint" aria-hidden="true">
      ·
    </span>
  );
}

/**
 * The drill runner.
 *
 * Left is the exercise list with its state, right is the editor and the result,
 * which is the same shape as the CLI: a list you work down, and a verdict per
 * item. Grading goes through the assertion the pipeline lifted out of the drill
 * file, so passing here means passing `python -m drills.day0_python`.
 */
export function DrillRunner({ drill }: Props) {
  const [selectedId, setSelectedId] = useState(drill.exercises[0]?.id ?? "");
  const [dayFilter, setDayFilter] = useState("all");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [verdicts, setVerdicts] = useState<Record<string, Verdict>>({});
  const [grading, setGrading] = useState(false);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  const { solved, markSolved } = useDrillProgress(drill.id);

  const days = useMemo(
    () => [...new Set(drill.exercises.map((exercise) => exercise.day))].sort(),
    [drill.exercises],
  );

  const visible = useMemo(
    () =>
      dayFilter === "all"
        ? drill.exercises
        : drill.exercises.filter((e) => String(e.day) === dayFilter),
    [drill.exercises, dayFilter],
  );

  const selected =
    drill.exercises.find((exercise) => exercise.id === selectedId) ??
    drill.exercises[0];

  const draft = drafts[selected?.id ?? ""] ?? selected?.starterCode ?? "";
  const verdict = verdicts[selected?.id ?? ""];

  const stateOf = useCallback(
    (exercise: Exercise): "passed" | "failed" | "todo" => {
      const result = verdicts[exercise.id];
      if (result?.passed || solved.includes(exercise.id)) return "passed";
      if (result && result.status !== "todo") return "failed";
      return "todo";
    },
    [verdicts, solved],
  );

  const passedCount = drill.exercises.filter(
    (exercise) => stateOf(exercise) === "passed",
  ).length;

  async function handleRun() {
    if (!selected?.check) return;
    setGrading(true);
    warmUp();
    try {
      const result = await gradeExercise({
        code: draft,
        support: drill.support,
        call: selected.check.call,
        expected: selected.check.expected,
      });
      setVerdicts((current) => ({ ...current, [selected.id]: result }));
      if (result.passed) markSolved(selected.id);
    } finally {
      setGrading(false);
    }
  }

  if (!selected) return null;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
      {/* Exercise list */}
      <aside className="lg:sticky lg:top-20 lg:self-start">
        <div className="mb-3 flex items-center justify-between gap-2">
          <Select
            label="Day"
            value={dayFilter}
            onValueChange={setDayFilter}
            options={[
              { value: "all", label: "All days", hint: String(drill.exercises.length) },
              ...days.map((day) => ({
                value: String(day),
                label: `Day ${day}`,
                hint: String(drill.exercises.filter((e) => e.day === day).length),
              })),
            ]}
          />
          <span className="font-mono text-xs text-text-faint">
            {passedCount}/{drill.exercises.length}
          </span>
        </div>

        {/* Progress bar. The only counter in the app, and it maps to real work. */}
        <div
          className="mb-3 h-1.5 overflow-hidden rounded-full bg-bg-inset"
          role="progressbar"
          aria-valuenow={passedCount}
          aria-valuemin={0}
          aria-valuemax={drill.exercises.length}
          aria-label="Exercises passing"
        >
          <div
            className="h-full rounded-full bg-pass transition-[width] duration-300"
            style={{
              width: `${(passedCount / drill.exercises.length) * 100}%`,
            }}
          />
        </div>

        <ol className="max-h-[28rem] overflow-y-auto rounded-xl border border-border-subtle bg-bg-raised lg:max-h-[calc(100vh-14rem)]">
          {visible.map((exercise) => {
            const state = stateOf(exercise);
            const active = exercise.id === selected.id;
            return (
              <li key={exercise.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(exercise.id)}
                  aria-current={active ? "true" : undefined}
                  className={`flex w-full items-center gap-2.5 border-l-2 px-3 py-2 text-left text-sm transition-colors ${
                    active
                      ? "border-accent bg-accent-soft text-text"
                      : "border-transparent text-text-muted hover:bg-bg-inset hover:text-text"
                  }`}
                >
                  <Mark state={state} />
                  <span className="truncate font-mono text-xs">{exercise.name}</span>
                  <span
                    className={`ml-auto shrink-0 font-mono text-[0.65rem] ${STATUS_STYLE[state]}`}
                  >
                    day {exercise.day}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </aside>

      {/* Editor and result */}
      <section className="min-w-0">
        <header className="mb-3">
          <h2 className="font-display text-xl font-semibold">{selected.name}</h2>
          {selected.prompt && (
            <p className="mt-1.5 whitespace-pre-line text-[0.9375rem] leading-relaxed text-text-muted">
              {selected.prompt}
            </p>
          )}
        </header>

        <CodeEditor
          value={draft}
          onChange={(value) =>
            setDrafts((current) => ({ ...current, [selected.id]: value }))
          }
          onRun={handleRun}
          minHeight="14rem"
          ariaLabel={`Your solution for ${selected.name}`}
        />

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleRun}
            disabled={grading}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-on-accent transition-colors hover:bg-accent-strong disabled:opacity-60"
          >
            {grading ? "Checking" : "Check"}
          </button>

          <button
            type="button"
            onClick={() =>
              setDrafts((current) => ({
                ...current,
                [selected.id]: selected.starterCode,
              }))
            }
            className="rounded-lg border border-border-strong px-3 py-2 text-sm text-text-muted transition-colors hover:text-text"
          >
            Reset
          </button>

          <span className="font-mono text-xs text-text-faint">
            Ctrl/Cmd + Enter
          </span>
        </div>

        {verdict && (
          <Result
            verdict={verdict}
            revealed={Boolean(revealed[selected.id])}
            onReveal={() =>
              setRevealed((current) => ({ ...current, [selected.id]: true }))
            }
          />
        )}
      </section>
    </div>
  );
}

/**
 * The verdict panel.
 *
 * The expected value is hidden behind a confirm. Showing it next to a failure
 * turns most exercises into copy-the-answer, and the whole point of the drill is
 * that the learner works out why their output differs.
 */
function Result({
  verdict,
  revealed,
  onReveal,
}: {
  verdict: Verdict;
  revealed: boolean;
  onReveal: () => void;
}) {
  const tone =
    verdict.passed === true
      ? "border-pass bg-pass-soft"
      : verdict.status === "todo"
        ? "border-border-strong bg-bg-inset"
        : "border-fail bg-fail-soft";

  return (
    <div className={`mt-4 overflow-hidden rounded-xl border ${tone}`}>
      <div className="flex items-center justify-between border-b border-border-subtle px-4 py-2.5">
        <span className="text-sm font-medium">
          {verdict.passed === true && "Passed"}
          {verdict.status === "todo" && "Not attempted yet"}
          {verdict.status === "code-error" && "Your code did not run"}
          {verdict.status === "error" && "Raised an error"}
          {verdict.status === "ran" && verdict.passed === false && "Wrong answer"}
        </span>
        <span className="font-mono text-xs text-text-faint">{verdict.ms} ms</span>
      </div>

      <div className="space-y-3 px-4 py-3">
        {verdict.status === "todo" && (
          <p className="text-sm text-text-muted">
            The body still raises <code>TODO</code>. Replace it with your answer,
            then check again.
          </p>
        )}

        {verdict.stdout && (
          <pre className="whitespace-pre-wrap font-mono text-sm text-text-muted">
            {verdict.stdout}
          </pre>
        )}

        {verdict.traceback && (
          <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-sm text-fail">
            {verdict.traceback}
          </pre>
        )}

        {verdict.status === "ran" && (
          <dl className="grid gap-2 font-mono text-sm">
            <div className="flex gap-3">
              <dt className="w-20 shrink-0 text-text-faint">you got</dt>
              <dd className="min-w-0 break-words">{verdict.got}</dd>
            </div>
            {verdict.passed === false && (
              <div className="flex gap-3">
                <dt className="w-20 shrink-0 text-text-faint">expected</dt>
                <dd className="min-w-0 break-words">
                  {revealed ? (
                    verdict.expected
                  ) : (
                    <button
                      type="button"
                      onClick={onReveal}
                      className="text-accent underline decoration-accent-line underline-offset-4"
                    >
                      Show the expected value
                    </button>
                  )}
                </dd>
              </div>
            )}
          </dl>
        )}
      </div>
    </div>
  );
}
