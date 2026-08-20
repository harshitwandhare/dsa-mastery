"use client";

import * as RadixSelect from "@radix-ui/react-select";
import type { ReactNode } from "react";

/**
 * A styled select built on Radix.
 *
 * The native `<select>` renders its list with the operating system, so it
 * ignores the page's colours and type entirely and looks like a stray Windows
 * control sitting in the middle of the design. Radix draws the list itself
 * while keeping the parts that are genuinely hard: typeahead, arrow and
 * Home/End navigation, focus return on close, escape to dismiss, correct
 * `aria-activedescendant`, and pointer behaviour that works on touch.
 */

export type SelectOption = {
  value: string;
  label: string;
  /** Shown right-aligned and dimmed, e.g. a count. */
  hint?: string;
};

type Props = {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  /** Visually hidden unless `showLabel`, but always read by a screen reader. */
  label: string;
  showLabel?: boolean;
  placeholder?: string;
  className?: string;
};

function Chevron() {
  return (
    <svg
      width="10"
      height="6"
      viewBox="0 0 10 6"
      fill="none"
      aria-hidden="true"
      className="shrink-0 opacity-60"
    >
      <path
        d="M1 1L5 5L9 1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Tick() {
  return (
    <svg width="12" height="10" viewBox="0 0 12 10" fill="none" aria-hidden="true">
      <path
        d="M1 5L4.5 8.5L11 1.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Select({
  value,
  onValueChange,
  options,
  label,
  showLabel = false,
  placeholder,
  className = "",
}: Props) {
  const selected = options.find((option) => option.value === value);

  return (
    <label className={`inline-flex items-center gap-2 ${className}`}>
      <span
        className={
          showLabel
            ? "text-sm text-text-muted"
            : "sr-only"
        }
      >
        {label}
      </span>

      <RadixSelect.Root value={value} onValueChange={onValueChange}>
        <RadixSelect.Trigger
          aria-label={label}
          className="inline-flex min-w-0 items-center gap-2 rounded-lg border border-border-subtle bg-bg-raised px-3 py-2 text-sm text-text shadow-[var(--shadow-card)] transition-colors hover:border-border-strong data-[state=open]:border-accent-line"
        >
          <RadixSelect.Value placeholder={placeholder ?? label}>
            <span className="truncate">{selected?.label ?? placeholder ?? label}</span>
          </RadixSelect.Value>
          <RadixSelect.Icon>
            <Chevron />
          </RadixSelect.Icon>
        </RadixSelect.Trigger>

        <RadixSelect.Portal>
          <RadixSelect.Content
            position="popper"
            sideOffset={6}
            className="overlay-panel z-50 max-h-72 min-w-[var(--radix-select-trigger-width)] overflow-hidden"
          >
            <RadixSelect.ScrollUpButton className="flex justify-center py-1 text-text-faint">
              <span className="rotate-180">
                <Chevron />
              </span>
            </RadixSelect.ScrollUpButton>

            <RadixSelect.Viewport className="p-1">
              {options.map((option) => (
                <RadixSelect.Item
                  key={option.value}
                  value={option.value}
                  className="flex cursor-pointer select-none items-center gap-2 rounded-md px-2.5 py-2 text-sm text-text outline-none data-[highlighted]:bg-accent-soft data-[state=checked]:text-accent"
                >
                  <span className="flex w-3.5 shrink-0 justify-center text-accent">
                    <RadixSelect.ItemIndicator>
                      <Tick />
                    </RadixSelect.ItemIndicator>
                  </span>
                  <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
                  {option.hint && (
                    <span className="ml-auto pl-3 font-mono text-xs text-text-faint">
                      {option.hint}
                    </span>
                  )}
                </RadixSelect.Item>
              ))}
            </RadixSelect.Viewport>

            <RadixSelect.ScrollDownButton className="flex justify-center py-1 text-text-faint">
              <Chevron />
            </RadixSelect.ScrollDownButton>
          </RadixSelect.Content>
        </RadixSelect.Portal>
      </RadixSelect.Root>
    </label>
  );
}

/** A row of related selects that wraps sensibly on a phone. */
export function FilterBar({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3">{children}</div>
  );
}
