"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { allLessons, allProblems, drills, patterns } from "@/lib/content";

/**
 * Cmd+K search, and the `?` shortcut sheet.
 *
 * Everything the site holds is known at build time, so search is a filter over
 * an in-memory list rather than anything that needs a server. Ranking is
 * deliberately simple: a title match beats a body match, and the NeetCode order
 * breaks ties, because for this content "what is it called" is almost always
 * what the reader is reaching for.
 */

type Entry = {
  id: string;
  label: string;
  hint: string;
  href: string;
  group: "Lessons" | "Problems" | "Drills" | "Patterns" | "Go to";
};

const DESTINATIONS: Entry[] = [
  { id: "go-dashboard", label: "Dashboard", hint: "what to do now", href: "/dashboard", group: "Go to" },
  { id: "go-learn", label: "Curriculum", hint: "all lessons", href: "/learn", group: "Go to" },
  { id: "go-problems", label: "Problem index", hint: "NeetCode order", href: "/problems", group: "Go to" },
  { id: "go-drills", label: "Drills", hint: "graded exercises", href: "/drills", group: "Go to" },
  { id: "go-playground", label: "Playground", hint: "blank Python", href: "/playground", group: "Go to" },
  { id: "go-review", label: "Review queue", hint: "what is due", href: "/review", group: "Go to" },
  { id: "go-progress", label: "Progress", hint: "charts", href: "/progress", group: "Go to" },
  { id: "go-reference", label: "Reference", hint: "patterns, glossary", href: "/reference", group: "Go to" },
];

function buildIndex(): Entry[] {
  return [
    ...DESTINATIONS,
    ...allLessons().map((lesson) => ({
      id: `lesson-${lesson.slug}`,
      label: lesson.title,
      hint: `${lesson.estimatedMinutes} min`,
      href: `/learn/${lesson.slug}`,
      group: "Lessons" as const,
    })),
    ...drills.map((drill) => ({
      id: `drill-${drill.id}`,
      label: drill.title,
      hint: `${drill.exerciseCount} exercises`,
      href: `/drills/${drill.id}`,
      group: "Drills" as const,
    })),
    ...patterns.map((pattern) => ({
      id: `pattern-${pattern.number}`,
      label: pattern.name,
      hint: pattern.trigger,
      href: "/reference",
      group: "Patterns" as const,
    })),
    ...allProblems().map((problem) => ({
      id: `problem-${problem.slug}`,
      label: problem.title,
      hint: `${problem.difficulty} · ${problem.topic}`,
      href: `/problems/${problem.slug}`,
      group: "Problems" as const,
    })),
  ];
}

const SHORTCUTS = [
  { keys: "Ctrl / Cmd + K", does: "Open this search" },
  { keys: "Ctrl / Cmd + J", does: "Open the scratchpad" },
  { keys: "Ctrl / Cmd + Enter", does: "Run the code you are editing" },
  { keys: "?", does: "Show these shortcuts" },
  { keys: "Esc", does: "Close whatever is open" },
];

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const index = useMemo(() => buildIndex(), []);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return index.slice(0, 8);

    const scored = index
      .map((entry) => {
        const label = entry.label.toLowerCase();
        if (label.startsWith(needle)) return { entry, score: 0 };
        if (label.includes(needle)) return { entry, score: 1 };
        if (entry.hint.toLowerCase().includes(needle)) return { entry, score: 2 };
        return null;
      })
      .filter((hit): hit is { entry: Entry; score: number } => hit !== null);

    scored.sort((a, b) => a.score - b.score);
    return scored.slice(0, 30).map((hit) => hit.entry);
  }, [index, query]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const typing =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
        return;
      }
      // `?` must not fire while someone is writing code or notes.
      if (event.key === "?" && !typing) {
        event.preventDefault();
        setHelpOpen(true);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const choose = useCallback(
    (entry: Entry) => {
      setOpen(false);
      setQuery("");
      router.push(entry.href);
    },
    [router],
  );

  // A stale index would point past the end after the list shrinks.
  const highlighted = Math.min(active, Math.max(results.length - 1, 0));

  function onInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive(Math.min(highlighted + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive(Math.max(highlighted - 1, 0));
    } else if (event.key === "Enter" && results[highlighted]) {
      event.preventDefault();
      choose(results[highlighted]);
    }
  }

  return (
    <>
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
          <Dialog.Content className="overlay-panel fixed left-1/2 top-[12vh] z-50 w-[min(40rem,92vw)] -translate-x-1/2 overflow-hidden p-0">
            <Dialog.Title className="sr-only">Search</Dialog.Title>
            <Dialog.Description className="sr-only">
              Search lessons, problems, drills and patterns.
            </Dialog.Description>

            <input
              autoFocus
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setActive(0);
              }}
              onKeyDown={onInputKeyDown}
              placeholder="Search lessons, problems, drills, patterns"
              aria-label="Search"
              className="w-full border-b border-border-subtle bg-transparent px-4 py-3.5 text-[0.95rem] placeholder:text-text-faint focus:outline-none"
            />

            <ul className="max-h-[52vh] overflow-y-auto p-1.5">
              {results.length === 0 && (
                <li className="px-3 py-6 text-center text-sm text-text-faint">
                  Nothing matches that.
                </li>
              )}
              {results.map((entry, position) => (
                <li key={entry.id}>
                  <button
                    type="button"
                    onMouseEnter={() => setActive(position)}
                    onClick={() => choose(entry)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm ${
                      position === highlighted ? "bg-accent-soft" : ""
                    }`}
                  >
                    <span className="w-16 shrink-0 font-mono text-[0.65rem] uppercase tracking-wide text-text-faint">
                      {entry.group}
                    </span>
                    <span className="flex-1 truncate">{entry.label}</span>
                    <span className="hidden shrink-0 truncate text-xs text-text-faint sm:block sm:max-w-[14rem]">
                      {entry.hint}
                    </span>
                  </button>
                </li>
              ))}
            </ul>

            <p className="border-t border-border-subtle px-4 py-2 font-mono text-[0.7rem] text-text-faint">
              ↑↓ to move · Enter to open · Esc to close
            </p>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root open={helpOpen} onOpenChange={setHelpOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
          <Dialog.Content className="overlay-panel fixed left-1/2 top-1/2 z-50 w-[min(26rem,92vw)] -translate-x-1/2 -translate-y-1/2 p-5">
            <Dialog.Title className="font-display text-lg font-semibold">
              Keyboard shortcuts
            </Dialog.Title>
            <Dialog.Description className="sr-only">
              The keyboard shortcuts available across the site.
            </Dialog.Description>

            <dl className="mt-4 space-y-2.5">
              {SHORTCUTS.map((shortcut) => (
                <div key={shortcut.keys} className="flex items-baseline gap-4">
                  <dt className="w-40 shrink-0 font-mono text-xs text-accent">
                    {shortcut.keys}
                  </dt>
                  <dd className="text-sm text-text-muted">{shortcut.does}</dd>
                </div>
              ))}
            </dl>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
