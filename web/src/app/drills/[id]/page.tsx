import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DrillRunner } from "@/components/drill-runner";
import { drills, getDrill } from "@/lib/content";

export function generateStaticParams() {
  return drills.map((drill) => ({ id: drill.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const drill = getDrill(id);
  if (!drill) return {};
  return {
    title: drill.title,
    description: `${drill.exerciseCount} graded Python exercises, checked in your browser.`,
  };
}

export default async function DrillPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const drill = getDrill(id);
  if (!drill) notFound();

  return (
    <main className="mx-auto max-w-6xl px-5 py-10">
      <nav className="mb-4 text-sm">
        <Link href="/drills" className="text-text-muted hover:text-accent">
          Drills
        </Link>
        <span className="mx-2 text-text-faint">/</span>
        <span className="text-text">{drill.title}</span>
      </nav>

      <header className="mb-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          {drill.title}
        </h1>
        <p className="mt-2 max-w-2xl text-text-muted">
          {drill.exerciseCount} exercises, graded against the same assertions the
          command-line runner uses. Write your answer, press Check, and read what
          came back.
        </p>
      </header>

      <DrillRunner drill={drill} />
    </main>
  );
}
