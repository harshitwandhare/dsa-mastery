import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { RunnableBlock } from "@/components/runnable-block";
import { allLessons, getLesson, lessonNeighbours } from "@/lib/content";
import { renderLesson } from "@/lib/markdown";

/** Every lesson is known at build time, so all of them prerender. */
export function generateStaticParams() {
  return allLessons().map((lesson) => ({ slug: lesson.slug }));
}

type LessonParams = { params: Promise<{ slug: string }> };

export async function generateMetadata({
  params,
}: LessonParams): Promise<Metadata> {
  const { slug } = await params;
  const lesson = getLesson(slug);
  if (!lesson) return {};
  return {
    title: lesson.title,
    description: lesson.sections
      .slice(0, 5)
      .map((section) => section.heading)
      .join(" · "),
  };
}

export default async function LessonPage({ params }: LessonParams) {
  const { slug } = await params;
  const lesson = getLesson(slug);
  if (!lesson) notFound();

  const parts = await renderLesson(lesson.body, lesson.fenceRunnable);
  const { previous, next } = lessonNeighbours(slug);

  return (
    <div className="mx-auto flex max-w-6xl gap-10 px-5 py-12">
      {/* On this page. Sticky, and only where there is room for it. */}
      {lesson.sections.length > 1 && (
        <aside className="hidden w-56 shrink-0 lg:block">
          <nav aria-label="On this page" className="sticky top-20">
            <p className="mb-3 font-mono text-xs uppercase tracking-wide text-text-faint">
              On this page
            </p>
            <ul className="space-y-1.5 border-l border-border-subtle">
              {lesson.sections.map((section) => (
                <li key={section.anchor}>
                  <a
                    href={`#${section.anchor}`}
                    className="-ml-px block border-l border-transparent py-0.5 pl-3 text-sm leading-snug text-text-muted transition-colors hover:border-accent hover:text-text"
                  >
                    {section.heading}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
      )}

      <main className="min-w-0 flex-1">
        <p className="font-mono text-sm text-text-faint">
          Lesson {String(lesson.fileNumber).padStart(2, "0")} ·{" "}
          {lesson.estimatedMinutes} min read
          {lesson.runnableBlocks > 0 && (
            <> · {lesson.runnableBlocks} runnable blocks</>
          )}
        </p>

        {/* The markdown carries its own H1, so the header above is metadata only. */}
        <article className="prose mt-6 max-w-[70ch]">
          {parts.map((part, index) =>
            part.kind === "html" ? (
              <div
                key={index}
                dangerouslySetInnerHTML={{ __html: part.html }}
              />
            ) : (
              <RunnableBlock
                key={index}
                code={part.code}
                html={part.html}
                session={lesson.slug}
              />
            ),
          )}
        </article>

        <nav className="mt-16 flex flex-wrap gap-4 border-t border-border-subtle pt-6">
          {previous && (
            <Link
              href={`/learn/${previous.slug}`}
              className="group flex-1 rounded-lg border border-border-subtle p-4 transition-colors hover:border-border-strong"
            >
              <span className="text-xs text-text-faint">Previous</span>
              <span className="mt-1 block font-medium group-hover:text-accent">
                {previous.title}
              </span>
            </Link>
          )}
          {next && (
            <Link
              href={`/learn/${next.slug}`}
              className="group flex-1 rounded-lg border border-border-subtle p-4 text-right transition-colors hover:border-border-strong"
            >
              <span className="text-xs text-text-faint">Next</span>
              <span className="mt-1 block font-medium group-hover:text-accent">
                {next.title}
              </span>
            </Link>
          )}
        </nav>
      </main>
    </div>
  );
}
