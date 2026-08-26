import type { Metadata } from "next";
import Link from "next/link";

import { LessonList } from "@/components/lesson-list";
import { contentStats, lessonsInTrack } from "@/lib/content";

export const metadata: Metadata = {
  title: "Curriculum",
  description:
    "The interview track, in the order it should be read, from first principles through to system design.",
};

export default function LearnIndexPage() {
  const lessons = lessonsInTrack("interview");

  return (
    <main className="mx-auto max-w-4xl px-5 py-14">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Curriculum</h1>
        <p className="mt-3 max-w-2xl text-text-muted">
          {contentStats.interviewLessons} lessons, {contentStats.runnableBlocks}{" "}
          runnable code blocks. Read them in order, because each one assumes the
          last.
        </p>
        <p className="mt-3 max-w-2xl text-sm text-text-muted">
          Preparing for a graduate algorithms class instead? The{" "}
          <Link href="/course" className="text-accent hover:underline">
            course track
          </Link>{" "}
          covers the same material as proofs rather than patterns.
        </p>
      </header>

      <LessonList lessons={lessons} />
    </main>
  );
}
