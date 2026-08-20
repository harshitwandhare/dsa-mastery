"use client";

import Link from "next/link";

import { drills, getProblem } from "@/lib/content";
import { describeDue } from "@/lib/review";
import { useAttempts, useDrillProgress, useReviewQueue } from "@/lib/use-progress";

/**
 * The dashboard body.
 *
 * Spec 20.7 F4: it answers one question, which is what to do right now. The
 * order is the answer to that question — anything due first, because a review
 * that slips is the whole point of the schedule; then the drill in progress;
 * then the reading. Deliberately no vanity metrics.
 */
export function DashboardPanels() {
  const { due, loaded: queueLoaded } = useReviewQueue();
  const { attempts } = useAttempts();
  const day0 = useDrillProgress("day0_python");

  const firstDrill = drills[0];
  const day0Total = firstDrill?.exerciseCount ?? 0;
  const day0Done = day0.solved.length;

  return (
    <div className="mt-8 space-y-4">
      {/* Due reviews come first, or an honest statement that none are. */}
      <section className="rounded-xl border border-border-subtle bg-bg-raised p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="font-display text-lg font-semibold">Due for review</h2>
          <span className="font-mono text-sm text-text-faint">
            {queueLoaded ? due.length : "…"}
          </span>
        </div>

        {!queueLoaded ? (
          <p className="mt-2 text-sm text-text-faint">Reading your queue…</p>
        ) : due.length === 0 ? (
          <p className="mt-2 text-sm text-text-muted">
            Nothing due. Reviews appear here once you have logged an attempt.
          </p>
        ) : (
          <>
            <ul className="mt-3 space-y-1.5">
              {due.slice(0, 4).map((item) => (
                <li key={item.targetId} className="flex items-center gap-3 text-sm">
                  <Link
                    href={`/problems/${item.targetId}`}
                    className="flex-1 font-medium hover:text-accent"
                  >
                    {getProblem(item.targetId)?.title ?? item.targetId}
                  </Link>
                  <span className="font-mono text-xs text-warn">
                    {describeDue(item.dueDate)}
                  </span>
                </li>
              ))}
            </ul>
            <Link
              href="/review"
              className="mt-4 inline-block rounded-lg bg-accent px-4 py-2 text-sm font-medium text-on-accent transition-colors hover:bg-accent-strong"
            >
              Start reviewing
            </Link>
          </>
        )}
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Drill progress: real work, so it earns a bar. */}
        <section className="rounded-xl border border-border-subtle bg-bg-raised p-5">
          <h2 className="font-display text-lg font-semibold">Day 0 drills</h2>
          <p className="mt-1 text-sm text-text-muted">
            Syntax reflexes, graded as you go.
          </p>

          <div
            className="mt-4 h-1.5 overflow-hidden rounded-full bg-bg-inset"
            role="progressbar"
            aria-valuenow={day0Done}
            aria-valuemin={0}
            aria-valuemax={day0Total}
            aria-label="Day 0 exercises passing"
          >
            <div
              className="h-full rounded-full bg-pass transition-[width] duration-300"
              style={{ width: `${day0Total ? (day0Done / day0Total) * 100 : 0}%` }}
            />
          </div>
          <p className="mt-2 font-mono text-xs text-text-faint">
            {day0Done} of {day0Total}
          </p>

          <Link
            href="/drills/day0_python"
            className="mt-4 inline-block text-sm text-accent underline decoration-accent-line underline-offset-4"
          >
            {day0Done === 0 ? "Start the drills" : "Keep going"}
          </Link>
        </section>

        <section className="rounded-xl border border-border-subtle bg-bg-raised p-5">
          <h2 className="font-display text-lg font-semibold">Problems</h2>
          <p className="mt-1 text-sm text-text-muted">
            {attempts.length === 0
              ? "Nothing attempted yet. The index is in NeetCode order."
              : `${attempts.filter((a) => a.passed).length} solved across ${attempts.length} attempts.`}
          </p>
          <Link
            href="/problems"
            className="mt-4 inline-block text-sm text-accent underline decoration-accent-line underline-offset-4"
          >
            {attempts.length === 0 ? "Open the index" : "Next problem"}
          </Link>
        </section>
      </div>
    </div>
  );
}
