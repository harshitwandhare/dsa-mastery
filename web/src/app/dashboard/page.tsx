import type { Metadata } from "next";
import Link from "next/link";

import { allLessons, contentStats, drills } from "@/lib/content";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "What to do right now.",
};

/**
 * Spec 20.7 F4: this page answers exactly one question, "what do I do right
 * now?", and resists every temptation to add a vanity metric.
 *
 * Progress and the review queue arrive with IndexedDB in phase 5-6; until then
 * this points at the next thing rather than inventing numbers it cannot know.
 */
export default function DashboardPage() {
  const lessons = allLessons();
  const first = lessons[0];
  const firstDrill = drills[0];

  return (
    <main className="mx-auto max-w-3xl px-5 py-12">
      <h1 className="font-display text-3xl font-semibold tracking-tight">What now?</h1>

      <div className="mt-8 space-y-4">
        <section className="rounded-xl border border-border-subtle bg-bg-raised p-5">
          <p className="font-mono text-xs uppercase tracking-wide text-text-faint">
            Start here
          </p>
          <h2 className="font-display mt-2 text-lg font-medium">{first?.title}</h2>
          <p className="mt-1 text-sm text-text-muted">
            {first?.estimatedMinutes} minute read ·{" "}
            {first?.runnableBlocks ?? 0} runnable examples
          </p>
          <Link
            href={first ? `/learn/${first.slug}` : "/learn"}
            className="mt-4 inline-block rounded-md bg-accent px-4 py-2 text-sm font-medium text-on-accent hover:bg-accent-strong"
          >
            Open the lesson
          </Link>
        </section>

        <section className="rounded-xl border border-border-subtle bg-bg-raised p-5">
          <p className="font-mono text-xs uppercase tracking-wide text-text-faint">
            Then practise
          </p>
          <h2 className="font-display mt-2 text-lg font-medium">{firstDrill?.title}</h2>
          <p className="mt-1 text-sm text-text-muted">
            {firstDrill?.exerciseCount} exercises, graded as you go.
          </p>
          <Link
            href={firstDrill ? `/drills/${firstDrill.id}` : "/drills"}
            className="mt-4 inline-block rounded-md border border-border-strong px-4 py-2 text-sm font-medium hover:bg-bg-inset"
          >
            Open the drill
          </Link>
        </section>
      </div>

      <p className="mt-8 text-sm text-text-faint">
        Progress tracking and the spaced-repetition queue land next. Nothing here
        is invented: the app will only show numbers it has actually recorded.
      </p>

      <dl className="mt-6 grid grid-cols-3 gap-4 text-sm">
        <div>
          <dt className="text-text-faint">Lessons</dt>
          <dd className="font-mono text-lg">{contentStats.lessons}</dd>
        </div>
        <div>
          <dt className="text-text-faint">Problems</dt>
          <dd className="font-mono text-lg">{contentStats.problems}</dd>
        </div>
        <div>
          <dt className="text-text-faint">Exercises</dt>
          <dd className="font-mono text-lg">{contentStats.exercises}</dd>
        </div>
      </dl>
    </main>
  );
}
