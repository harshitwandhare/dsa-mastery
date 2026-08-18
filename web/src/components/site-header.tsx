"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/learn", label: "Lessons" },
  { href: "/drills", label: "Drills" },
  { href: "/problems", label: "Problems" },
  { href: "/playground", label: "Playground" },
  { href: "/reference", label: "Reference" },
  { href: "/dashboard", label: "Dashboard" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border-subtle bg-bg/85 backdrop-blur">
      <nav
        aria-label="Main"
        className="mx-auto flex max-w-6xl items-center gap-1 px-5 py-3 sm:gap-2"
      >
        <Link
          href="/"
          className="mr-2 shrink-0 font-mono text-sm font-semibold tracking-tight text-text hover:text-accent"
        >
          dsa<span className="text-accent">/</span>mastery
        </Link>

        <ul className="flex flex-1 items-center gap-0.5 overflow-x-auto sm:gap-1">
          {NAV.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`block whitespace-nowrap rounded-md px-2.5 py-1.5 text-sm transition-colors sm:px-3 ${
                    active
                      ? "bg-bg-inset text-text"
                      : "text-text-muted hover:bg-bg-inset hover:text-text"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
