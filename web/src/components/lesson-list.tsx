import Link from "next/link";

import type { Lesson } from "@/lib/content";

/**
 * The lesson index, shared by both track pages.
 *
 * The two curricula render identically and only differ in which lessons they
 * are handed, so the markup lives here rather than being copied per route.
 */
export function LessonList({ lessons }: { lessons: Lesson[] }) {
  return (
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
  );
}
