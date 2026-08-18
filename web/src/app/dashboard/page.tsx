import type { Metadata } from "next";
import Link from "next/link";

import { DashboardPanels } from "@/components/dashboard-panels";
import { allLessons } from "@/lib/content";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "What to do right now: reviews due, drills in progress, next lesson.",
};

export default function DashboardPage() {
  const first = allLessons()[0];

  return (
    <main className="mx-auto max-w-4xl px-5 py-14">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          What now?
        </h1>
        <p className="mt-3 text-text-muted">
          One question, answered in order of what matters. Everything here comes
          from your own browser.
        </p>
      </header>

      <DashboardPanels />

      <section className="mt-4 rounded-xl border border-border-subtle bg-bg-raised p-5">
        <h2 className="font-display text-lg font-semibold">Reading</h2>
        <p className="mt-1 text-sm text-text-muted">
          If you are new, start at the beginning. The order is load-bearing.
        </p>
        <Link
          href={first ? `/learn/${first.slug}` : "/learn"}
          className="mt-4 inline-block text-sm text-accent underline decoration-accent-line underline-offset-4"
        >
          {first?.title ?? "Open the curriculum"}
        </Link>
      </section>
    </main>
  );
}
