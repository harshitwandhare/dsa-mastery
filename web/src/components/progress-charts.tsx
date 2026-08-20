"use client";

import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { contentStats, getProblem, problems } from "@/lib/content";
import { useAttempts } from "@/lib/use-progress";

const AXIS = {
  stroke: "var(--text-faint)",
  fontSize: 12,
  tickLine: false,
  axisLine: false,
};

/** Attempts per day, cumulative, so a streak reads as a rising line. */
function solvedOverTime(
  attempts: { timestamp: number; passed: boolean }[],
): { date: string; solved: number }[] {
  const byDay = new Map<string, number>();
  for (const attempt of attempts) {
    if (!attempt.passed) continue;
    const day = new Date(attempt.timestamp).toISOString().slice(0, 10);
    byDay.set(day, (byDay.get(day) ?? 0) + 1);
  }

  let running = 0;
  return [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => {
      running += count;
      return { date: date.slice(5), solved: running };
    });
}

export function ProgressCharts() {
  const { attempts, loaded } = useAttempts();

  if (!loaded) {
    return <p className="mt-8 text-sm text-text-faint">Reading your history…</p>;
  }

  if (attempts.length === 0) {
    return (
      <div className="mt-8 rounded-xl border border-border-subtle bg-bg-raised p-6">
        <p className="font-medium">No attempts logged yet.</p>
        <p className="mt-2 text-sm leading-relaxed text-text-muted">
          These charts are drawn from what you actually do, so they stay empty
          until you have solved something and logged how it went. There are no
          sample numbers here on purpose.
        </p>
        <Link
          href="/problems"
          className="mt-4 inline-block rounded-lg bg-accent px-4 py-2 text-sm font-medium text-on-accent transition-colors hover:bg-accent-strong"
        >
          Start with the first problem
        </Link>
      </div>
    );
  }

  const solved = attempts.filter((attempt) => attempt.passed);
  const timeline = solvedOverTime(attempts);

  // Per-topic completion against what the index actually contains.
  const solvedSlugs = new Set(solved.map((attempt) => attempt.targetId));
  const byTopic = new Map<string, { total: number; done: number }>();
  for (const problem of problems) {
    const entry = byTopic.get(problem.topic) ?? { total: 0, done: 0 };
    entry.total += 1;
    if (solvedSlugs.has(problem.slug)) entry.done += 1;
    byTopic.set(problem.topic, entry);
  }
  const topics = [...byTopic.entries()]
    .filter(([, value]) => value.done > 0)
    .map(([topic, value]) => ({
      topic: topic.length > 18 ? `${topic.slice(0, 17)}…` : topic,
      done: value.done,
      total: value.total,
    }))
    .sort((a, b) => b.done - a.done);

  // Failures, bucketed by the category chosen when the attempt was logged.
  const mistakes = attempts.filter((attempt) => !attempt.passed);
  const grouped = (() => {
    const buckets = new Map<string, typeof mistakes>();
    for (const attempt of mistakes) {
      const key = attempt.category ?? "Not categorised";
      buckets.set(key, [...(buckets.get(key) ?? []), attempt]);
    }
    return [...buckets.entries()].sort((a, b) => b[1].length - a[1].length);
  })();

  const medianMinutes = (() => {
    const times = solved.map((a) => a.durationSeconds).sort((a, b) => a - b);
    if (times.length === 0) return 0;
    return Math.round(times[Math.floor(times.length / 2)] / 60);
  })();

  return (
    <div className="mt-8 space-y-10">
      <dl className="grid grid-cols-2 gap-6 sm:grid-cols-4">
        {[
          { label: "attempts logged", value: attempts.length },
          { label: "solved", value: solvedSlugs.size },
          { label: `of ${contentStats.problems} indexed`, value: `${Math.round((solvedSlugs.size / contentStats.problems) * 100)}%` },
          { label: "median minutes", value: medianMinutes || "—" },
        ].map((stat) => (
          <div key={stat.label}>
            <dt className="font-mono text-2xl font-semibold">{stat.value}</dt>
            <dd className="mt-1 text-sm text-text-muted">{stat.label}</dd>
          </div>
        ))}
      </dl>

      {timeline.length > 1 && (
        <section>
          <h2 className="font-display text-lg font-semibold">Solved over time</h2>
          <div className="mt-3 h-64 rounded-xl border border-border-subtle bg-bg-raised p-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeline}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="date" {...AXIS} />
                <YAxis allowDecimals={false} {...AXIS} />
                <Tooltip
                  contentStyle={{
                    background: "var(--bg-raised)",
                    border: "1px solid var(--border-strong)",
                    borderRadius: 8,
                    color: "var(--text)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="solved"
                  stroke="var(--accent)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {topics.length > 0 && (
        <section>
          <h2 className="font-display text-lg font-semibold">By topic</h2>
          <div
            className="mt-3 rounded-xl border border-border-subtle bg-bg-raised p-4"
            style={{ height: Math.max(200, topics.length * 34 + 40) }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topics} layout="vertical" margin={{ left: 12 }}>
                <CartesianGrid stroke="var(--border)" horizontal={false} />
                <XAxis type="number" allowDecimals={false} {...AXIS} />
                <YAxis
                  type="category"
                  dataKey="topic"
                  width={130}
                  {...AXIS}
                />
                <Tooltip
                  cursor={{ fill: "var(--bg-inset)" }}
                  contentStyle={{
                    background: "var(--bg-raised)",
                    border: "1px solid var(--border-strong)",
                    borderRadius: 8,
                    color: "var(--text)",
                  }}
                />
                <Bar dataKey="done" fill="var(--accent)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* Mistakes first, grouped. Spec F5: the grouping is the primary view,
          because the point is surfacing the three or four failure modes that
          keep recurring, which a flat list buries. */}
      {mistakes.length > 0 && (
        <section>
          <h2 className="font-display text-lg font-semibold">
            Where it goes wrong
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            {mistakes.length} unsuccessful{" "}
            {mistakes.length === 1 ? "attempt" : "attempts"}, grouped. The
            categories at the top are the ones worth drilling.
          </p>

          <ul className="mt-4 space-y-2">
            {grouped.map(([category, entries]) => (
              <li
                key={category}
                className="rounded-xl border border-border-subtle bg-bg-raised p-4"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-medium">{category}</span>
                  <span className="font-mono text-sm text-fail">
                    {entries.length}
                  </span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-bg-inset">
                  <div
                    className="h-full rounded-full bg-fail"
                    style={{
                      width: `${(entries.length / mistakes.length) * 100}%`,
                    }}
                  />
                </div>
                <p className="mt-2 text-xs text-text-faint">
                  {entries
                    .slice(0, 4)
                    .map((entry) => getProblem(entry.targetId)?.title ?? entry.targetId)
                    .join(", ")}
                  {entries.length > 4 && ` and ${entries.length - 4} more`}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="font-display text-lg font-semibold">Recent attempts</h2>
        <ul className="mt-3 divide-y divide-[var(--border)] overflow-hidden rounded-xl border border-border-subtle bg-bg-raised">
          {[...attempts]
            .reverse()
            .slice(0, 12)
            .map((attempt) => (
              <li
                key={attempt.id}
                className="flex flex-wrap items-center gap-3 px-4 py-3 text-sm"
              >
                <span className={attempt.passed ? "text-pass" : "text-fail"}>
                  {attempt.passed ? "✓" : "✕"}
                </span>
                <Link
                  href={`/problems/${attempt.targetId}`}
                  className="flex-1 font-medium hover:text-accent"
                >
                  {getProblem(attempt.targetId)?.title ?? attempt.targetId}
                </Link>
                <span className="font-mono text-xs text-text-faint">
                  {Math.round(attempt.durationSeconds / 60)} min · confidence{" "}
                  {attempt.confidence}
                </span>
              </li>
            ))}
        </ul>
      </section>
    </div>
  );
}
