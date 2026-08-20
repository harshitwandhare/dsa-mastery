"use client";

import { useEffect } from "react";

/**
 * Registers the offline worker, in production only.
 *
 * In development a service worker serving stale assets is actively unhelpful:
 * it hides the change you just made behind a cached copy of the one before it.
 */
export function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    // After load, so registration never competes with the first render.
    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* offline support is a bonus; failing to get it is not an error */
      });
    };

    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });

    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
