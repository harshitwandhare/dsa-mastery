import { describe, expect, it } from "vitest";

import { revealedFraction } from "@/components/scroll-snake";

/**
 * The snake's reveal maths.
 *
 * Driving a real scroll is unreliable in headless environments, so the part
 * that can actually be wrong is tested directly rather than through the DOM.
 */
describe("revealedFraction", () => {
  const PAGE = 3000;
  const VIEW = 900;

  it("shows a sliver before any scrolling, so the snake is not invisible", () => {
    expect(revealedFraction(0, PAGE, VIEW)).toBeCloseTo(0.06);
  });

  it("reaches the end exactly at the bottom of the page", () => {
    expect(revealedFraction(PAGE - VIEW, PAGE, VIEW)).toBeCloseTo(1);
  });

  it("advances monotonically as the page scrolls", () => {
    const readings = [0, 0.25, 0.5, 0.75, 1].map((fraction) =>
      revealedFraction((PAGE - VIEW) * fraction, PAGE, VIEW),
    );
    for (let i = 1; i < readings.length; i += 1) {
      expect(readings[i]).toBeGreaterThan(readings[i - 1]);
    }
  });

  it("is halfway along at halfway down", () => {
    // 0.06 floor plus half of the remaining 0.94.
    expect(revealedFraction((PAGE - VIEW) / 2, PAGE, VIEW)).toBeCloseTo(0.53);
  });

  it("never exceeds the path, even if the browser overscrolls", () => {
    expect(revealedFraction(99_999, PAGE, VIEW)).toBeLessThanOrEqual(1);
  });

  it("never goes negative on a rubber-band scroll past the top", () => {
    expect(revealedFraction(-400, PAGE, VIEW)).toBeCloseTo(0.06);
  });

  it("does not divide by zero on a page shorter than the viewport", () => {
    const result = revealedFraction(0, 500, 900);
    expect(Number.isFinite(result)).toBe(true);
    expect(result).toBeCloseTo(0.06);
  });
});
