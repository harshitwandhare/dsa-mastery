"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

/**
 * Loads the 3D hero, or deliberately does not.
 *
 * three.js is a large dependency for something purely decorative, so it is
 * split out and fetched after the page is interactive. It is skipped entirely
 * for anyone who asked for reduced motion, and on small screens, where a
 * drag-to-throw toy competes with the scroll gesture and costs battery for no
 * benefit.
 *
 * Nothing in the hero depends on it: the headline, the copy and the buttons are
 * server-rendered and complete on their own.
 */
const Scene = dynamic(() => import("@/components/hero-scene"), {
  ssr: false,
  loading: () => null,
});

export function HeroCanvas() {
  const [enabled, setEnabled] = useState(false);

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

  if (!enabled) return null;

  return (
    <div className="absolute inset-0 -z-0 hidden xl:block" aria-hidden="true">
      <Scene />
    </div>
  );
}
