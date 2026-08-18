import Link from "next/link";

import { contentStats } from "@/lib/content";

const COLUMNS = [
  {
    heading: "Learn",
    links: [
      { href: "/learn", label: "All lessons" },
      { href: "/learn/00-python-from-zero", label: "Start from zero" },
      { href: "/drills", label: "Drills" },
    ],
  },
  {
    heading: "Practise",
    links: [
      { href: "/problems", label: "Problem index" },
      { href: "/playground", label: "Playground" },
      { href: "/dashboard", label: "Dashboard" },
    ],
  },
  {
    heading: "Reference",
    links: [
      { href: "/reference", label: "Glossary" },
      { href: "/review", label: "Review queue" },
      { href: "/progress", label: "Progress" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border-subtle bg-bg-inset">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-base font-semibold">
            DSA<span className="text-accent">.</span>Mastery
          </p>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-text-muted">
            {contentStats.lessons} lessons, {contentStats.problems} problems and{" "}
            {contentStats.exercises} drills, generated from the curriculum
            markdown. Python runs in your browser.
          </p>
        </div>

        {COLUMNS.map((column) => (
          <nav key={column.heading} aria-label={column.heading}>
            <p className="text-xs font-semibold uppercase tracking-wider text-text-faint">
              {column.heading}
            </p>
            <ul className="mt-3 space-y-2">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-muted transition-colors hover:text-accent"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-border-subtle">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-5 text-xs text-text-faint">
          <p>
            Curriculum under CC BY 4.0, code under MIT. Your progress stays in
            your browser.
          </p>
          <a
            className="transition-colors hover:text-accent"
            href="https://github.com/harshitwandhare/dsa-mastery"
            target="_blank"
            rel="noreferrer"
          >
            Source on GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
