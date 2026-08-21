import { describe, expect, it } from "vitest";

import {
  clampSize,
  DEFAULT_STATE,
  MAX_VIEWPORT_FRACTION,
  MIN_HEIGHT,
  MIN_WIDTH,
  readState,
} from "@/lib/scratchpad-store";

/**
 * The scratchpad's sizing and persistence rules.
 *
 * A resizable panel is awkward to test through the DOM: it needs real pointer
 * drags against a real viewport. The arithmetic is where the bugs live, so it
 * is tested directly.
 */

describe("clampSize", () => {
  const WIDE = 1920;
  const TALL = 1080;

  it("keeps a comfortable size untouched", () => {
    expect(clampSize(600, 500, WIDE, TALL)).toEqual({ width: 600, height: 500 });
  });

  it("refuses to shrink below a usable minimum", () => {
    const { width, height } = clampSize(10, 10, WIDE, TALL);
    expect(width).toBe(MIN_WIDTH);
    expect(height).toBe(MIN_HEIGHT);
  });

  it("leaves some page visible rather than covering it entirely", () => {
    const { width, height } = clampSize(99_999, 99_999, WIDE, TALL);
    expect(width).toBe(Math.round(WIDE * MAX_VIEWPORT_FRACTION));
    expect(height).toBe(Math.round(TALL * MAX_VIEWPORT_FRACTION));
  });

  it("shrinks a panel sized on a monitor to fit a laptop", () => {
    // The failure this prevents: the resize handle ends up off screen with no
    // way to get the panel back.
    const onMonitor = clampSize(1600, 900, 2560, 1440);
    const onLaptop = clampSize(onMonitor.width, onMonitor.height, 1280, 800);
    expect(onLaptop.width).toBeLessThanOrEqual(1280);
    expect(onLaptop.height).toBeLessThanOrEqual(800);
  });

  it("still returns something usable on a tiny viewport", () => {
    // The minimum wins over the fraction, so the panel never collapses.
    const { width, height } = clampSize(400, 400, 200, 150);
    expect(width).toBe(MIN_WIDTH);
    expect(height).toBe(MIN_HEIGHT);
  });

  it("returns whole pixels", () => {
    const { width, height } = clampSize(500.7, 400.2, WIDE, TALL);
    expect(Number.isInteger(width)).toBe(true);
    expect(Number.isInteger(height)).toBe(true);
  });
});

describe("readState", () => {
  it("returns the default when nothing is stored", () => {
    expect(readState(null)).toEqual(DEFAULT_STATE);
  });

  it("starts closed by default, so it never blocks a first visit", () => {
    expect(DEFAULT_STATE.open).toBe(false);
  });

  it("reads a complete stored state", () => {
    const stored = { open: true, width: 500, height: 400, code: "print(1)" };
    expect(readState(JSON.stringify(stored))).toEqual(stored);
  });

  it("survives corrupted JSON rather than throwing", () => {
    expect(readState("{not json")).toEqual(DEFAULT_STATE);
  });

  it("fills in fields a previous version did not write", () => {
    const partial = readState(JSON.stringify({ open: true }));
    expect(partial.open).toBe(true);
    expect(partial.width).toBe(DEFAULT_STATE.width);
    expect(partial.code).toBe(DEFAULT_STATE.code);
  });

  it("rejects values of the wrong type", () => {
    const bad = readState(
      JSON.stringify({ open: "yes", width: "wide", height: null, code: 42 }),
    );
    expect(bad).toEqual(DEFAULT_STATE);
  });

  it("rejects a width that is not a finite number", () => {
    // JSON.stringify turns Infinity into null, so test the parsed shape.
    expect(readState('{"width": null}').width).toBe(DEFAULT_STATE.width);
  });

  it("keeps an empty string of code, which is a legitimate state", () => {
    expect(readState(JSON.stringify({ code: "" })).code).toBe("");
  });
});
