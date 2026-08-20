"use client";

import { useMemo, useState } from "react";

import { FilterBar, Select } from "@/components/ui/select";
import type { Difficulty, Problem } from "@/lib/content";

type Props = {
  problems: Problem[];
  topics: string[];
};

const DIFFICULTY_CLASS: Record<Difficulty, string> = {
  easy: "text-easy",
  medium: "text-medium",
  hard: "text-hard",
};

type ListFilter = "all" | "neetcode150" | "blind75" | "frequent";

const LISTS: { id: ListFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "neetcode150", label: "NeetCode 150" },
  { id: "blind75", label: "Blind 75" },
  { id: "frequent", label: "Asked often" },
];

export function ProblemBrowser({ problems, topics }: Props) {
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [list, setList] = useState<ListFilter>("all");

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return problems.filter((problem) => {
      if (topic !== "all" && problem.topic !== topic) return false;
      if (difficulty !== "all" && problem.difficulty !== difficulty) return false;
      if (list === "neetcode150" && problem.neetcodeTier !== 150) return false;
      if (list === "blind75" && !problem.inBlind75) return false;
      if (list === "frequent" && !problem.frequentlyAsked) return false;
      if (!needle) return true;
      return (
        problem.title.toLowerCase().includes(needle) ||
        problem.insight.toLowerCase().includes(needle) ||
        problem.patterns.some((pattern) => pattern.toLowerCase().includes(needle))
      );
    });
  }, [problems, query, topic, difficulty, list]);

  return (
    <div>
      <FilterBar>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search title, pattern or insight"
          aria-label="Search problems"
          className="min-w-56 flex-1 rounded-lg border border-border-subtle bg-bg-raised px-3 py-2 text-sm shadow-[var(--shadow-card)] placeholder:text-text-faint focus:border-accent-line focus:outline-none"
        />

        <Select
          label="Topic"
          value={topic}
          onValueChange={setTopic}
          options={[
            { value: "all", label: "All topics", hint: String(problems.length) },
            ...topics.map((name) => ({
              value: name,
              label: name,
              hint: String(problems.filter((p) => p.topic === name).length),
            })),
          ]}
        />

        <Select
          label="Difficulty"
          value={difficulty}
          onValueChange={setDifficulty}
          options={[
            { value: "all", label: "Any difficulty" },
            { value: "easy", label: "Easy" },
            { value: "medium", label: "Medium" },
            { value: "hard", label: "Hard" },
          ]}
        />
      </FilterBar>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {LISTS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setList(option.id)}
            aria-pressed={list === option.id}
            className={`rounded-full border px-3 py-1 text-xs transition-colors ${
              list === option.id
                ? "border-accent-line bg-accent-soft text-accent"
                : "border-border-subtle text-text-muted hover:text-text"
            }`}
          >
            {option.label}
          </button>
        ))}
        <span className="ml-auto font-mono text-xs text-text-faint">
          {visible.length} of {problems.length}
        </span>
      </div>

      <ol className="mt-6 divide-y divide-[var(--border)] overflow-hidden rounded-xl border border-border-subtle bg-bg-raised">
        {visible.map((problem) => (
          <li key={problem.slug} className="px-4 py-3 sm:px-5">
            <div className="flex items-baseline gap-3">
              <span className="w-8 shrink-0 font-mono text-xs text-text-faint">
                {problem.orderInList ?? "—"}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <a
                    href={problem.leetcodeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium hover:text-accent"
                  >
                    {problem.title}
                  </a>
                  {problem.inBlind75 && (
                    <span className="font-mono text-[0.65rem] uppercase tracking-wide text-accent">
                      blind75
                    </span>
                  )}
                  {problem.frequentlyAsked && (
                    <span className="font-mono text-[0.65rem] uppercase tracking-wide text-warn">
                      frequent
                    </span>
                  )}
                </div>

                {problem.insight && (
                  <p className="mt-0.5 text-sm leading-snug text-text-muted">
                    {problem.insight}
                  </p>
                )}

                <p className="mt-1 font-mono text-xs text-text-faint">
                  {problem.topic}
                  {problem.patterns.length > 0 && ` · ${problem.patterns.join(", ")}`}
                </p>
              </div>

              <span
                className={`shrink-0 font-mono text-xs ${DIFFICULTY_CLASS[problem.difficulty]}`}
              >
                {problem.difficulty}
              </span>
            </div>
          </li>
        ))}
      </ol>

      {visible.length === 0 && (
        <p className="mt-8 text-center text-text-muted">
          Nothing matches those filters.
        </p>
      )}
    </div>
  );
}
