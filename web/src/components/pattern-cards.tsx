"use client";

import { useState } from "react";

import { patterns } from "@/lib/content";

/**
 * The sixteen patterns as flashcards.
 *
 * The trigger is the hidden side, not the name. Recognising "sorted, pairs,
 * in-place" and reaching for two pointers is the skill being drilled; reading a
 * pattern name and reciting its trigger is not the direction the recall has to
 * work in during an interview.
 */
export function PatternCards() {
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const [allShown, setAllShown] = useState(false);

  const shown = (number: number) => allShown || Boolean(revealed[number]);
  const revealedCount = patterns.filter((pattern) => shown(pattern.number)).length;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => {
            setAllShown((value) => !value);
            if (allShown) setRevealed({});
          }}
          className="rounded-lg border border-border-strong px-3 py-1.5 text-sm text-text-muted transition-colors hover:text-text"
        >
          {allShown ? "Hide all triggers" : "Show all triggers"}
        </button>
        <span className="font-mono text-xs text-text-faint">
          {revealedCount} of {patterns.length} showing
        </span>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {patterns.map((pattern) => {
          const open = shown(pattern.number);
          return (
            <li key={pattern.number}>
              <button
                type="button"
                aria-expanded={open}
                onClick={() =>
                  setRevealed((current) => ({
                    ...current,
                    [pattern.number]: !current[pattern.number],
                  }))
                }
                className="flex h-full w-full flex-col rounded-xl border border-border-subtle bg-bg-raised p-4 text-left transition-colors hover:border-border-strong"
              >
                <span className="flex items-baseline gap-2.5">
                  <span className="font-mono text-xs text-text-faint">
                    {String(pattern.number).padStart(2, "0")}
                  </span>
                  <span className="font-display text-base font-semibold">
                    {pattern.name}
                  </span>
                </span>

                <span className="mt-2 pl-8 text-sm leading-relaxed">
                  {open ? (
                    <span className="text-text-muted">{pattern.trigger}</span>
                  ) : (
                    <span className="text-text-faint">
                      Reach for it when&hellip;
                    </span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
