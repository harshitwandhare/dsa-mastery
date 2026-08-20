"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useCallback, useSyncExternalStore } from "react";

type Theme = "light" | "dark" | "system";

const OPTIONS: { value: Theme; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

const EVENT = "themechange";

/**
 * The stored theme is external state that React does not own, so it is read
 * through `useSyncExternalStore` rather than copied into state inside an
 * effect. That keeps the server render and the first client render agreeing
 * (both see "system") without a mounted flag, and it picks up a change made in
 * another tab for free.
 */
function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(EVENT, onChange);
  };
}

function getSnapshot(): Theme {
  const stored = localStorage.getItem("theme");
  return stored === "light" || stored === "dark" ? stored : "system";
}

/** The server has no storage to read, and no preference to guess. */
function getServerSnapshot(): Theme {
  return "system";
}

function SunMoon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <circle cx="7.5" cy="7.5" r="3.2" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M7.5 1v1.4M7.5 12.6V14M14 7.5h-1.4M2.4 7.5H1M12.1 2.9l-1 1M3.9 11.1l-1 1M12.1 12.1l-1-1M3.9 3.9l-1-1"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const choose = useCallback((next: Theme) => {
    const root = document.documentElement;
    if (next === "system") {
      root.removeAttribute("data-theme");
      localStorage.removeItem("theme");
    } else {
      root.setAttribute("data-theme", next);
      localStorage.setItem("theme", next);
    }
    // `storage` only fires in other tabs, so tell this one explicitly.
    window.dispatchEvent(new Event(EVENT));
  }, []);

  const current = OPTIONS.find((option) => option.value === theme);

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        aria-label="Colour theme"
        className="inline-flex items-center gap-1.5 rounded-lg border border-transparent px-2 py-1.5 text-text-muted transition-colors hover:border-border-subtle hover:bg-bg-inset hover:text-text data-[state=open]:bg-bg-inset"
      >
        <SunMoon />
        <span className="hidden text-xs sm:inline">{current?.label}</span>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={6}
          className="overlay-panel z-50 min-w-36 p-1"
        >
          {OPTIONS.map((option) => (
            <DropdownMenu.Item
              key={option.value}
              onSelect={() => choose(option.value)}
              className="flex cursor-pointer select-none items-center justify-between rounded-md px-2.5 py-2 text-sm text-text outline-none data-[highlighted]:bg-accent-soft"
            >
              {option.label}
              {theme === option.value && (
                <span className="text-accent" aria-hidden="true">
                  ✓
                </span>
              )}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
