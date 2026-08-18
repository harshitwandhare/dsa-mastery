"use client";

import { useMemo, useState } from "react";

import type { GlossaryTerm } from "@/lib/content";

export function GlossaryBrowser({ terms }: { terms: GlossaryTerm[] }) {
  const [query, setQuery] = useState("");

  const grouped = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const matching = needle
      ? terms.filter(
          (entry) =>
            entry.term.toLowerCase().includes(needle) ||
            entry.meaning.toLowerCase().includes(needle),
        )
      : terms;

    const groups = new Map<string, GlossaryTerm[]>();
    for (const entry of matching) {
      const bucket = groups.get(entry.section);
      if (bucket) bucket.push(entry);
      else groups.set(entry.section, [entry]);
    }
    return [...groups.entries()];
  }, [terms, query]);

  const total = grouped.reduce((sum, [, entries]) => sum + entries.length, 0);

  return (
    <div>
      <div className="flex items-center gap-3">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search terms and definitions"
          aria-label="Search the glossary"
          className="flex-1 rounded-md border border-border-subtle bg-bg-raised px-3 py-2 text-sm placeholder:text-text-faint focus:border-border-strong focus:outline-none"
        />
        <span className="font-mono text-xs text-text-faint">
          {total} of {terms.length}
        </span>
      </div>

      {grouped.map(([section, entries]) => (
        <section key={section} className="mt-10">
          {section && (
            <h2 className="mb-3 font-mono text-xs uppercase tracking-wide text-text-faint">
              {section}
            </h2>
          )}
          <dl className="divide-y divide-[var(--border)] overflow-hidden rounded-xl border border-border-subtle bg-bg-raised">
            {entries.map((entry) => (
              <div key={`${section}-${entry.term}`} className="px-4 py-3 sm:px-5">
                <dt className="font-mono text-sm font-medium text-accent">
                  {entry.term}
                </dt>
                <dd className="mt-1 text-sm leading-relaxed text-text-muted">
                  {entry.meaning}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ))}

      {total === 0 && (
        <p className="mt-10 text-center text-text-muted">
          No term matches that search.
        </p>
      )}
    </div>
  );
}
