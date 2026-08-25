import type { Metadata } from "next";
import Link from "next/link";

import { LessonList } from "@/components/lesson-list";
import { contentStats, lessonsInTrack } from "@/lib/content";

export const metadata: Metadata = {
  title: "Course track",
  description:
    "Graduate algorithm design and analysis from first principles: asymptotics, recurrences, divide and conquer, dynamic programming, greedy, network flow, and NP-completeness.",
};

/** What each track is for, side by side, because people land here unsure. */
const DIFFERENCES = [
  ["Deliverable", "working code, fast", "a written proof"],
  ["Judged on", "does it pass the tests", "is every claim justified"],
  ["Typical answer", "30 lines of Python", "a page of English and maths"],
  ["Failure mode", "you froze", "you hand-waved"],
];

export default function CourseIndexPage() {
  const lessons = lessonsInTrack("course");

  return (
    <main className="mx-auto max-w-4xl px-5 py-14">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Course track
        </h1>
        <p className="mt-3 max-w-2xl text-text-muted">
          {contentStats.courseLessons} lessons for a graduate algorithms class of
          the CLRS and Erickson kind. It assumes nothing, starts at what a
          logarithm is, and ends at writing an NP-completeness proof that earns
          full marks.
        </p>
        <p className="mt-3 max-w-2xl text-sm text-text-muted">
          Independent of the{" "}
          <Link href="/learn" className="text-accent hover:underline">
            interview track
          </Link>
          . Start either one cold.
        </p>
      </header>

      <div className="table-scroll mt-8 rounded-xl border border-border-subtle bg-bg-raised">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-subtle text-left text-text-faint">
              <th className="px-5 py-3 font-normal" />
              <th className="px-5 py-3 font-normal">Interview track</th>
              <th className="px-5 py-3 font-normal">Course track</th>
            </tr>
          </thead>
          <tbody>
            {DIFFERENCES.map(([label, interview, course]) => (
              <tr key={label} className="border-b border-border-subtle last:border-0">
                <th scope="row" className="px-5 py-3 text-left font-medium">
                  {label}
                </th>
                <td className="px-5 py-3 text-text-muted">{interview}</td>
                <td className="px-5 py-3 text-text-muted">{course}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <LessonList lessons={lessons} />
    </main>
  );
}
