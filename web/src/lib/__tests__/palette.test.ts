import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * Contrast tests for the design tokens.
 *
 * The palette is warm and low-chroma by design, which is exactly the kind of
 * palette where a colour can look right and still fail a contrast check. Two
 * tokens did: `--text-faint` sat at 3.66 on paper and 4.28 on charcoal while
 * being used for small metadata. These tests read the real stylesheet so a
 * future colour tweak cannot quietly drop below AA again.
 */

const CSS = readFileSync(
  join(process.cwd(), "src", "app", "globals.css"),
  "utf8",
);

/** Pull a token's value out of a specific block of the stylesheet. */
function token(block: string, name: string): string {
  const start = CSS.indexOf(block);
  if (start === -1) throw new Error(`block not found: ${block}`);
  const end = CSS.indexOf("}", start);
  const section = CSS.slice(start, end);
  const match = section.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`));
  if (!match) throw new Error(`token --${name} not found in ${block}`);
  return match[1];
}

function relativeLuminance(hex: string): number {
  const channels = (hex.replace("#", "").match(/../g) ?? []).map((pair) => {
    const value = parseInt(pair, 16) / 255;
    return value <= 0.03928
      ? value / 12.92
      : Math.pow((value + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort(
    (x, y) => y - x,
  );
  return (hi + 0.05) / (lo + 0.05);
}

const LIGHT = ":root {";
const DARK = ':root[data-theme="dark"] {';

const THEMES = [
  { name: "light", block: LIGHT },
  { name: "dark", block: DARK },
] as const;

describe.each(THEMES)("$name theme", ({ block }) => {
  const bg = () => token(block, "bg");

  // WCAG AA for normal-size text.
  it.each([
    ["text", 4.5],
    ["text-muted", 4.5],
    ["text-faint", 4.5],
    ["accent", 4.5],
    ["pass", 4.5],
    ["fail", 4.5],
    ["warn", 4.5],
  ])("--%s reaches %s:1 against the page background", (name, minimum) => {
    expect(contrast(token(block, name), bg())).toBeGreaterThanOrEqual(minimum);
  });

  it("body text clears the stricter AAA bar", () => {
    expect(contrast(token(block, "text"), bg())).toBeGreaterThanOrEqual(7);
  });

  it("--on-accent is legible on --accent", () => {
    expect(
      contrast(token(block, "on-accent"), token(block, "accent")),
    ).toBeGreaterThanOrEqual(4.5);
  });

  it("the accent stays legible on raised surfaces too", () => {
    expect(
      contrast(token(block, "accent"), token(block, "bg-raised")),
    ).toBeGreaterThanOrEqual(4.5);
  });
});

describe("theme structure", () => {
  it("defines the dark palette for both the toggle and the system default", () => {
    // A token defined only inside the media query would leave the explicit
    // toggle broken, and vice versa.
    expect(CSS).toContain(':root:not([data-theme="light"])');
    expect(CSS).toContain(':root[data-theme="dark"]');
  });

  it("keeps light and dark defining the same token names", () => {
    const names = (block: string) => {
      const start = CSS.indexOf(block);
      const section = CSS.slice(start, CSS.indexOf("}", start));
      return new Set(
        [...section.matchAll(/--([a-z-]+):/g)].map((match) => match[1]),
      );
    };
    expect([...names(DARK)].sort()).toEqual([...names(LIGHT)].sort());
  });
});
