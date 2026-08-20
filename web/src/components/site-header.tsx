"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ThemeToggle } from "@/components/ui/theme-toggle";

const NAV = [
  { href: "/learn", label: "Lessons" },
  { href: "/drills", label: "Drills" },
  { href: "/problems", label: "Problems" },
  { href: "/playground", label: "Playground" },
  { href: "/reference", label: "Reference" },
];

/**
 * Points at Cmd+K without duplicating the palette's logic. Clicking it fires
 * the same key event the palette already listens for, so there is one code path
 * for opening search rather than two that can drift.
 */
function SearchHint() {
  return (
    <button
      type="button"
      aria-label="Search"
      onClick={() =>
        window.dispatchEvent(
          new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true }),
        )
      }
      className="hidden items-center gap-2 rounded-lg border border-border-subtle px-2.5 py-1.5 text-xs text-text-faint transition-colors hover:border-border-strong hover:text-text-muted lg:flex"
    >
      <span>Search</span>
      <kbd className="font-mono">Ctrl K</kbd>
    </button>
  );
}

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border-subtle bg-bg/85 backdrop-blur-md">
      <nav
        aria-label="Main"
        className="mx-auto flex max-w-6xl items-center gap-2 px-5 py-3"
      >
        <Link
          href="/"
          className="mr-1 shrink-0 font-display text-[1.05rem] font-semibold tracking-tight text-text transition-colors hover:text-accent"
        >
          DSA<span className="text-accent">.</span>Mastery
        </Link>

        <ul className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto">
          {NAV.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative block whitespace-nowrap rounded-md px-2.5 py-1.5 text-sm transition-colors ${
                    active
                      ? "text-text"
                      : "text-text-muted hover:bg-bg-inset hover:text-text"
                  }`}
                >
                  {item.label}
                  {active && (
                    <span className="absolute inset-x-2.5 -bottom-[13px] h-[2px] rounded-full bg-accent" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex shrink-0 items-center gap-1">
          <SearchHint />
          <Link
            href="/dashboard"
            className="hidden rounded-lg border border-border-subtle px-3 py-1.5 text-sm text-text-muted transition-colors hover:border-border-strong hover:text-text sm:block"
          >
            Dashboard
          </Link>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
