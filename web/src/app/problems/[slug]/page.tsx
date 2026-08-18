import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProblemWorkspace } from "@/components/problem-workspace";
import { allProblems, getProblem } from "@/lib/content";

/**
 * Only the ranked list is prerendered. All 315 problems would be 315 static
 * pages for a single reader, so the long tail renders on demand instead.
 */
export function generateStaticParams() {
  return allProblems()
    .filter((problem) => problem.orderInList !== null)
    .map((problem) => ({ slug: problem.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const problem = getProblem(slug);
  if (!problem) return {};
  return { title: problem.title, description: problem.insight };
}

const DIFFICULTY_CLASS: Record<string, string> = {
  easy: "text-easy",
  medium: "text-medium",
  hard: "text-hard",
};

export default async function ProblemPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const problem = getProblem(slug);
  if (!problem) notFound();

  return (
    <main className="mx-auto max-w-6xl px-5 py-10">
      <nav className="mb-4 text-sm">
        <Link href="/problems" className="text-text-muted hover:text-accent">
          Problems
        </Link>
        <span className="mx-2 text-text-faint">/</span>
        <span className="text-text">{problem.title}</span>
      </nav>

      <header className="mb-8">
        <div className="flex flex-wrap items-baseline gap-3">
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            {problem.title}
          </h1>
          <span
            className={`font-mono text-sm ${DIFFICULTY_CLASS[problem.difficulty]}`}
          >
            {problem.difficulty}
          </span>
          {problem.orderInList && (
            <span className="font-mono text-xs text-text-faint">
              NeetCode #{problem.orderInList}
            </span>
          )}
        </div>
        <p className="mt-2 text-text-muted">
          {problem.topic} · {problem.patterns.join(", ")}
        </p>
      </header>

      <ProblemWorkspace problem={problem} />
    </main>
  );
}
