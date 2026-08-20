"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A Python that follows you down the page.
 *
 * The snake slithers along a fixed path as the page scrolls: the body is a
 * stroked SVG path revealed by dash-offset, and the head rides the same path
 * using `getPointAtLength`, so head and body can never disagree. The head is
 * rotated to the path's tangent, which is what makes it look like it is going
 * somewhere rather than being dragged sideways.
 *
 * It is decoration on top of decoration, so it is hidden from assistive tech,
 * skipped under prefers-reduced-motion, and hidden on narrow screens where the
 * reading column takes the whole width.
 */

/**
 * How much of the snake is showing at a given scroll position.
 *
 * Pulled out as a pure function because the browser is the one place this is
 * awkward to test: it needs a real scroll, which headless environments often
 * refuse. The floor keeps a little of the snake visible before any scrolling,
 * so it reads as present rather than appearing from nowhere.
 */
export function revealedFraction(
  scrollY: number,
  scrollHeight: number,
  innerHeight: number,
  floor = 0.06,
): number {
  const scrollable = scrollHeight - innerHeight;
  if (scrollable <= 0) return floor;
  const progress = Math.min(Math.max(scrollY / scrollable, 0), 1);
  return floor + progress * (1 - floor);
}

/** The route down the page, as a share of scroll progress through the landing. */
const PATH =
  "M 60 0 C 60 90, 16 130, 16 210 C 16 300, 104 330, 104 420 C 104 510, 20 540, 20 630 C 20 720, 92 745, 92 830 C 92 910, 46 940, 46 1000";

export function ScrollSnake() {
  const svgRef = useRef<SVGSVGElement>(null);
  const bodyRef = useRef<SVGPathElement>(null);
  const headRef = useRef<SVGGElement>(null);
  const [enabled, setEnabled] = useState(false);
  const frame = useRef<number | undefined>(undefined);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const wide = window.matchMedia("(min-width: 1280px)");
    const decide = () => setEnabled(!reduced.matches && wide.matches);
    decide();
    reduced.addEventListener("change", decide);
    wide.addEventListener("change", decide);
    return () => {
      reduced.removeEventListener("change", decide);
      wide.removeEventListener("change", decide);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const body = bodyRef.current;
    const head = headRef.current;
    if (!body || !head) return;

    const length = body.getTotalLength();
    body.style.strokeDasharray = `${length}`;

    const update = () => {
      frame.current = undefined;

      const shown = revealedFraction(
        window.scrollY,
        document.documentElement.scrollHeight,
        window.innerHeight,
      );
      body.style.strokeDashoffset = `${length * (1 - shown)}`;

      const point = body.getPointAtLength(length * shown);
      // A point just behind the head gives the tangent, so the head faces along
      // the path rather than sitting at a fixed angle.
      const behind = body.getPointAtLength(Math.max(0, length * shown - 6));
      const angle = (Math.atan2(point.y - behind.y, point.x - behind.x) * 180) / Math.PI;
      head.setAttribute(
        "transform",
        `translate(${point.x} ${point.y}) rotate(${angle + 90})`,
      );
    };

    const onScroll = () => {
      // getPointAtLength forces layout, so coalesce to one read per frame.
      frame.current ??= requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <svg
      ref={svgRef}
      aria-hidden="true"
      viewBox="0 0 120 1000"
      preserveAspectRatio="xMidYMin meet"
      className="pointer-events-none fixed left-3 top-0 z-10 hidden h-screen w-24 xl:block"
    >
      <title>A python following the page</title>

      {/* The track it will cover, so the route is legible before scrolling. */}
      <path
        d={PATH}
        fill="none"
        stroke="var(--border)"
        strokeWidth="1.5"
        strokeDasharray="2 7"
        strokeLinecap="round"
      />

      {/* The body. */}
      <path
        ref={bodyRef}
        d={PATH}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="7"
        strokeLinecap="round"
        opacity="0.85"
      />

      {/* A lighter belly line, offset, to give the body some roundness. */}
      <path
        d={PATH}
        fill="none"
        stroke="var(--accent-line)"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.5"
        style={{ mixBlendMode: "overlay" }}
      />

      <g ref={headRef}>
        {/* Head, drawn pointing up so the tangent rotation reads correctly. */}
        <ellipse cx="0" cy="0" rx="6.5" ry="8" fill="var(--accent)" />
        <circle cx="-2.6" cy="-3" r="1.5" fill="var(--bg)" />
        <circle cx="2.6" cy="-3" r="1.5" fill="var(--bg)" />
        <circle cx="-2.6" cy="-3.3" r="0.7" fill="var(--text)" />
        <circle cx="2.6" cy="-3.3" r="0.7" fill="var(--text)" />
        {/* Tongue. */}
        <path
          d="M 0 -8 L 0 -12 M 0 -12 L -1.8 -14 M 0 -12 L 1.8 -14"
          stroke="var(--fail)"
          strokeWidth="1"
          strokeLinecap="round"
          fill="none"
        />
      </g>
    </svg>
  );
}
