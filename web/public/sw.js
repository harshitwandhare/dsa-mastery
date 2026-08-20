/**
 * Offline support.
 *
 * Spec 20.8 phase 8: the site should work after a first load. Two things are
 * cached, for different reasons and with different strategies:
 *
 * - The app itself, stale-while-revalidate. A lesson that renders instantly
 *   from cache and quietly updates behind you is the right trade for content
 *   that changes rarely.
 * - Pyodide, cache-first and never revalidated. It is a ~10 MB download pinned
 *   to one version, so re-fetching it would be pure waste; a new version means
 *   a new URL, which misses this cache and downloads once.
 *
 * Nothing here caches a POST, and nothing caches a response it did not get a
 * 200 for, so a failed request cannot be served back as though it succeeded.
 */

const VERSION = "v1";
const APP_CACHE = `dsa-app-${VERSION}`;
const PYODIDE_CACHE = "dsa-pyodide";

const PYODIDE_HOST = "cdn.jsdelivr.net";

self.addEventListener("install", () => {
  // Take over as soon as the new worker is ready rather than waiting for every
  // tab to close, so a fix does not sit behind a long-lived tab.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((name) => name.startsWith("dsa-app-") && name !== APP_CACHE)
          .map((name) => caches.delete(name)),
      );
      await self.clients.claim();
    })(),
  );
});

/** Pyodide: serve from cache forever, fetch only on a miss. */
async function cacheFirst(request) {
  const cache = await caches.open(PYODIDE_CACHE);
  const hit = await cache.match(request);
  if (hit) return hit;

  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
  return response;
}

/** The app: serve what is cached, refresh it in the background. */
async function staleWhileRevalidate(request) {
  const cache = await caches.open(APP_CACHE);
  const hit = await cache.match(request);

  const network = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => null);

  if (hit) return hit;

  const response = await network;
  if (response) return response;

  // Offline with nothing cached. A navigation gets the shell if we have it,
  // so the reader sees the site rather than the browser's error page.
  if (request.mode === "navigate") {
    const shell = await cache.match("/");
    if (shell) return shell;
  }
  return Response.error();
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (url.hostname === PYODIDE_HOST) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Only this origin. Anything else is somebody else's to cache.
  if (url.origin !== self.location.origin) return;

  event.respondWith(staleWhileRevalidate(request));
});
