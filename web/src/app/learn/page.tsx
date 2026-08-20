import type { Metadata } from "next";
import Link from "next/link";

import { allLessons, contentStats } from "@/lib/content";

export const metadata: Metadata = {
  title: "Curriculum",
  description:
    "All 21 lessons in the order they should be read, from first principles through to system design.",
};

export default function LearnIndexPage() {
  const lessons = allLessons();

  return (
    <main className="mx-auto max-w-4xl px-5 py-14">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Curriculum</h1>
        <p className="mt-3 max-w-2xl text-text-muted">
          {contentStats.lessons} lessons, {contentStats.runnableBlocks} runnable
          code blocks. Read them in order &mdash; each one assumes the last.
        </p>
      </header>

      <ol className="mt-10 space-y-3">
        {lessons.map((lesson) => (
          <li key={lesson.slug}>
            <Link
              href={`/learn/${lesson.slug}`}
              className="group block rounded-xl border border-border-subtle bg-bg-raised p-5 transition-colors hover:border-border-strong"
            >
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-sm text-text-faint">
                  {String(lesson.fileNumber).padStart(2, "0")}
                </span>
                <h2 className="font-display flex-1 text-lg font-medium group-hover:text-accent">
                  {lesson.title}
                </h2>
                <span className="shrink-0 font-mono text-xs text-text-faint">
                  {lesson.estimatedMinutes} min read
                </span>
              </div>

              {lesson.sections.length > 0 && (
                <p className="mt-2 line-clamp-2 pl-9 text-sm leading-relaxed text-text-muted">
                  {lesson.sections
                    .slice(0, 6)
                    .map((section) => section.heading)
                    .join(" · ")}
                </p>
              )}
            </Link>
          </li>
        ))}
      </ol>
    </main>
  );
}
