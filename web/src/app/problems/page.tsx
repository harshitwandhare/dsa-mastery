import type { Metadata } from "next";

import { ProblemBrowser } from "@/components/problem-browser";
import { allProblems, contentStats, problemTopics } from "@/lib/content";

export const metadata: Metadata = {
  title: "Problems",
  description:
    "315 interview problems in NeetCode order, each with the pattern it belongs to and the one-line insight that unlocks it.",
};

export default function ProblemsPage() {
  return (
    <main className="mx-auto max-w-5xl px-5 py-12">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight">Problems</h1>
        <p className="mt-3 max-w-2xl text-text-muted">
          {contentStats.problems} problems in NeetCode order, each with its
          pattern and the one-line insight that unlocks it. Work them top to
          bottom. The order is the curriculum.
        </p>
      </header>

      <ProblemBrowser problems={allProblems()} topics={problemTopics()} />
    </main>
  );
}
