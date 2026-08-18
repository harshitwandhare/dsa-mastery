import Link from "next/link";

import { allLessons, contentStats } from "@/lib/content";

const STATS = [
  { value: contentStats.lessons, label: "lessons, written from scratch" },
  { value: contentStats.problems, label: "problems, indexed and explained" },
  { value: contentStats.exercises, label: "drills, graded automatically" },
  { value: contentStats.glossaryTerms, label: "terms defined in plain English" },
];

const STEPS = [
  {
    step: "01",
    title: "Read the lesson",
    body: "Every topic is taught from first principles, not summarised from somewhere else. You learn why a hash map trades space for time before you are asked to use one.",
  },
  {
    step: "02",
    title: "Run the code where you read it",
    body: "Python runs inside the page. Edit any example, press Run, and read the real output. No terminal, no install, and tracebacks are shown exactly as Python wrote them, because reading them is a skill.",
  },
  {
    step: "03",
    title: "Practise until it is automatic",
    body: "75 graded drills build the syntax reflexes first. Then work the problem index in NeetCode order, with a 22-minute timer and the analysis template that interviewers actually want to hear.",
  },
];

export default function LandingPage() {
  const lessons = allLessons();
  const first = lessons[0];

  return (
    <main>
      {/* Hero */}
      <section className="border-b border-border-subtle px-5 py-20 sm:py-28">
        <div className="mx-auto max-w-3xl">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-border-subtle bg-bg-raised px-3 py-1 font-mono text-xs text-text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Python runs in your browser
          </p>

          <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
            Everything you need to be interview ready,
            <span className="text-accent"> in one place you can run.</span>
          </h1>

          <p className="mt-6 text-lg leading-relaxed text-text-muted">
            A complete data-structures and algorithms course that starts at
            &ldquo;what is a variable&rdquo; and ends at system design. Read a
            lesson, edit the examples, run them, and practise against{" "}
            {contentStats.problems} problems &mdash; without leaving the page or
            opening a terminal.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              href={first ? `/learn/${first.slug}` : "/learn"}
              className="rounded-lg bg-accent px-5 py-2.5 font-medium text-[#08130d] transition-colors hover:bg-accent-strong"
            >
              Start from the beginning
            </Link>
            <Link
              href="/learn"
              className="rounded-lg border border-border-strong px-5 py-2.5 font-medium text-text transition-colors hover:bg-bg-inset"
            >
              See the full roadmap
            </Link>
            <Link
              href="/playground"
              className="px-2 py-2.5 font-medium text-text-muted underline decoration-border-strong underline-offset-4 transition-colors hover:text-text"
            >
              Just let me write Python
            </Link>
          </div>

          <p className="mt-5 text-sm text-text-faint">
            Free, open source, and nothing to sign up for. Your progress stays in
            your own browser.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-border-subtle px-5 py-12">
        <dl className="mx-auto grid max-w-5xl grid-cols-2 gap-8 sm:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <dt className="font-mono text-3xl font-semibold text-text">
                {stat.value}
              </dt>
              <dd className="mt-1 text-sm leading-snug text-text-muted">
                {stat.label}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* How it works */}
      <section className="border-b border-border-subtle px-5 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-semibold tracking-tight">
            How it works
          </h2>
          <p className="mt-2 max-w-2xl text-text-muted">
            The order matters. Most people fail interviews because they practised
            problems before they had the foundations to see the pattern.
          </p>

          <ol className="mt-10 grid gap-8 md:grid-cols-3">
            {STEPS.map((item) => (
              <li key={item.step}>
                <span className="font-mono text-sm text-accent">{item.step}</span>
                <h3 className="mt-2 text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-text-muted">
                  {item.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* The roadmap */}
      <section className="px-5 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                The roadmap
              </h2>
              <p className="mt-2 text-text-muted">
                {contentStats.lessons} lessons in the order they should be read.
              </p>
            </div>
            <Link
              href="/learn"
              className="text-sm text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
            >
              Open the curriculum
            </Link>
          </div>

          <ol className="mt-8 divide-y divide-[var(--border)] overflow-hidden rounded-xl border border-border-subtle bg-bg-raised">
            {lessons.map((lesson) => (
              <li key={lesson.slug}>
                <Link
                  href={`/learn/${lesson.slug}`}
                  className="flex items-baseline gap-4 px-4 py-3 transition-colors hover:bg-bg-inset sm:px-5"
                >
                  <span className="w-6 shrink-0 font-mono text-sm text-text-faint">
                    {String(lesson.fileNumber).padStart(2, "0")}
                  </span>
                  <span className="flex-1 font-medium">{lesson.title}</span>
                  <span className="hidden shrink-0 font-mono text-xs text-text-faint sm:block">
                    {lesson.estimatedMinutes} min
                  </span>
                  {lesson.runnableBlocks > 0 && (
                    <span className="hidden shrink-0 font-mono text-xs text-accent sm:block">
                      {lesson.runnableBlocks} runnable
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </main>
  );
}
