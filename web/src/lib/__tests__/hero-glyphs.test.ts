import { describe, expect, it } from "vitest";

import { GLYPHS } from "@/components/hero-scene";

/**
 * Where the hero glyphs are allowed to sit.
 *
 * The first version put them behind the headline. They were unreachable,
 * because the reading column paints above the canvas, so a glyph under the text
 * cannot be picked up no matter how the drag is written. These tests pin the
 * margins so a later tweak to the layout cannot quietly put them back.
 */

/** The reading column is max-w-3xl: 768px, centred. */
const COLUMN_PX = 768;
/** The narrowest width the scene runs at. */
const MIN_VIEWPORT_PX = 1280;

/** Half the column, as a share of the viewport, at the narrowest size. */
const COLUMN_HALF_FRACTION = COLUMN_PX / 2 / MIN_VIEWPORT_PX;

describe("glyph placement", () => {
  it("keeps every glyph clear of the reading column", () => {
    for (const glyph of GLYPHS) {
      expect(
        Math.abs(glyph.x),
        `${glyph.text} would sit under the text and be ungrabbable`,
      ).toBeGreaterThan(COLUMN_HALF_FRACTION);
    }
  });

  it("keeps every glyph inside the viewport", () => {
    // x is measured from the centre, so 0.5 is the edge.
    for (const glyph of GLYPHS) {
      expect(Math.abs(glyph.x), `${glyph.text} is off-screen`).toBeLessThan(0.48);
      expect(Math.abs(glyph.y), `${glyph.text} is off-screen`).toBeLessThan(0.45);
    }
  });

  it("uses both margins rather than crowding one side", () => {
    const left = GLYPHS.filter((glyph) => glyph.x < 0).length;
    const right = GLYPHS.length - left;
    expect(Math.abs(left - right)).toBeLessThanOrEqual(1);
  });

  it("varies size instead of scaling everything the same", () => {
    const scales = GLYPHS.map((glyph) => glyph.scale);
    expect(Math.max(...scales) / Math.min(...scales)).toBeGreaterThan(2);
  });

  it("has a few large glyphs rather than all of them large", () => {
    const large = GLYPHS.filter((glyph) => glyph.scale >= 0.9);
    expect(large.length).toBeGreaterThanOrEqual(2);
    expect(large.length).toBeLessThanOrEqual(GLYPHS.length / 2);
  });

  it("spreads them out vertically", () => {
    const ys = GLYPHS.map((glyph) => glyph.y);
    expect(Math.max(...ys) - Math.min(...ys)).toBeGreaterThan(0.5);
  });

  it("gives them different depths, so they do not read as a flat sheet", () => {
    expect(new Set(GLYPHS.map((glyph) => glyph.z)).size).toBeGreaterThan(4);
  });

  it("has no two glyphs sitting on top of each other", () => {
    for (let i = 0; i < GLYPHS.length; i += 1) {
      for (let j = i + 1; j < GLYPHS.length; j += 1) {
        const dx = GLYPHS[i].x - GLYPHS[j].x;
        const dy = GLYPHS[i].y - GLYPHS[j].y;
        expect(
          Math.hypot(dx, dy),
          `${GLYPHS[i].text} overlaps ${GLYPHS[j].text}`,
        ).toBeGreaterThan(0.1);
      }
    }
  });
});
