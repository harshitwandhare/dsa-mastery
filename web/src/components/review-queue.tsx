"use client";

import Link from "next/link";

import { getProblem } from "@/lib/content";
import { describeDue } from "@/lib/review";
import { useReviewQueue } from "@/lib/use-progress";

export function ReviewQueue() {
  const { items, due, loaded } = useReviewQueue();

  if (!loaded) {
    return <p className="mt-8 text-sm text-text-faint">Reading your queue…</p>;
  }

  if (items.length === 0) {
    return (
      <div className="mt-8 rounded-xl border border-border-subtle bg-bg-raised p-6">
        <p className="font-medium">Nothing scheduled yet.</p>
        <p className="mt-2 text-sm leading-relaxed text-text-muted">
          Solve a problem and log how it went. Anything you rate 1 or 2 comes
          back tomorrow; a 5 waits a fortnight.
        </p>
        <Link
          href="/problems"
          className="mt-4 inline-block rounded-lg bg-accent px-4 py-2 text-sm font-medium text-on-accent transition-colors hover:bg-accent-strong"
        >
          Pick a problem
        </Link>
      </div>
    );
  }

  const later = items
    .filter((item) => !due.includes(item))
    .sort((a, b) => a.dueDate - b.dueDate);

  return (
    <div className="mt-8 space-y-8">
      <section>
        <h2 className="font-display text-lg font-semibold">
          Due now{" "}
          <span className="font-mono text-sm font-normal text-text-faint">
            {due.length}
          </span>
        </h2>

        {due.length === 0 ? (
          <p className="mt-3 rounded-xl border border-border-subtle bg-bg-raised p-5 text-sm text-text-muted">
            Nothing due today. The next one is{" "}
            {later[0] ? describeDue(later[0].dueDate) : "not scheduled"}.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-[var(--border)] overflow-hidden rounded-xl border border-border-subtle bg-bg-raised">
            {due.map((item) => {
              const problem = getProblem(item.targetId);
              return (
                <li key={item.targetId}>
                  <Link
                    href={`/problems/${item.targetId}`}
                    className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-bg-inset"
                  >
                    <span className="flex-1 font-medium">
                      {problem?.title ?? item.targetId}
                    </span>
                    <span className="font-mono text-xs text-warn">
                      {describeDue(item.dueDate)}
                    </span>
                    <span className="font-mono text-xs text-text-faint">
                      round {item.round}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {later.length > 0 && (
        <section>
          <h2 className="font-display text-lg font-semibold">Coming up</h2>
          <ul className="mt-3 divide-y divide-[var(--border)] overflow-hidden rounded-xl border border-border-subtle bg-bg-raised">
            {later.map((item) => {
              const problem = getProblem(item.targetId);
              return (
                <li
                  key={item.targetId}
                  className="flex items-center gap-3 px-4 py-3 text-text-muted"
                >
                  <span className="flex-1">{problem?.title ?? item.targetId}</span>
                  <span className="font-mono text-xs text-text-faint">
                    {describeDue(item.dueDate)}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
