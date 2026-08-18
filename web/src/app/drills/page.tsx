import type { Metadata } from "next";
import Link from "next/link";

import { drills } from "@/lib/content";

export const metadata: Metadata = {
  title: "Drills",
  description:
    "75 short Python exercises that build syntax reflexes before you touch an interview problem.",
};

export default function DrillsPage() {
  return (
    <main className="mx-auto max-w-4xl px-5 py-12">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight">Drills</h1>
        <p className="mt-3 max-w-2xl text-text-muted">
          Short exercises that build the reflexes an interview problem assumes
          you already have. Do these before the problem index, not after.
        </p>
      </header>

      <ul className="space-y-3">
        {drills.map((drill) => {
          const days = [...new Set(drill.exercises.map((e) => e.day))].sort();
          return (
            <li key={drill.id}>
              <Link
                href={`/drills/${drill.id}`}
                className="group block rounded-xl border border-border-subtle bg-bg-raised p-5 transition-colors hover:border-border-strong"
              >
                <div className="flex items-baseline gap-3">
                  <h2 className="font-display flex-1 text-lg font-medium group-hover:text-accent">
                    {drill.title}
                  </h2>
                  <span className="font-mono text-xs text-text-faint">
                    {drill.exerciseCount} exercises
                  </span>
                </div>
                <p className="mt-1.5 font-mono text-xs text-text-faint">
                  Days {days.join(", ")} · {drill.sourceFile}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
