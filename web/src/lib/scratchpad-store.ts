/**
 * The scratchpad's persisted state, and the rules about its size.
 *
 * Kept out of the component because the sizing is the part that can actually be
 * wrong, and a resizable panel is awkward to test through the DOM: it needs real
 * pointer drags against a real viewport. The clamping is pure arithmetic, so it
 * is tested directly instead.
 *
 * localStorage rather than IndexedDB: this is a few hundred bytes read on every
 * page load, and it has to be available synchronously during the first render
 * so the panel does not visibly jump to its stored size after mounting.
 */

export const STORAGE_KEY = "scratchpad";

export const MIN_WIDTH = 320;
export const MIN_HEIGHT = 220;
/** Leave the page usable behind the panel rather than covering it entirely. */
export const MAX_VIEWPORT_FRACTION = 0.9;

export type ScratchpadState = {
  open: boolean;
  width: number;
  height: number;
  code: string;
};

export const DEFAULT_CODE = `# A scratchpad that follows you around the site.
# Try the thing you just read about, without losing your place.

counts = {}
for c in "hello":
    counts[c] = counts.get(c, 0) + 1

print(counts)
`;

export const DEFAULT_STATE: ScratchpadState = {
  open: false,
  width: 460,
  height: 420,
  code: DEFAULT_CODE,
};

/**
 * Keep the panel inside the window and above a usable minimum.
 *
 * Without the upper bound a panel dragged large on a wide monitor stays that
 * size on a laptop and covers the whole page, with its own resize handle off
 * screen and no way back.
 */
export function clampSize(
  width: number,
  height: number,
  viewportWidth: number,
  viewportHeight: number,
): { width: number; height: number } {
  const maxWidth = Math.max(MIN_WIDTH, viewportWidth * MAX_VIEWPORT_FRACTION);
  const maxHeight = Math.max(MIN_HEIGHT, viewportHeight * MAX_VIEWPORT_FRACTION);
  return {
    width: Math.round(Math.min(Math.max(width, MIN_WIDTH), maxWidth)),
    height: Math.round(Math.min(Math.max(height, MIN_HEIGHT), maxHeight)),
  };
}

/**
 * Read the stored state, falling back to the default for anything missing.
 *
 * A stored blob written by an older version, or corrupted by hand, must not
 * stop the panel from opening, so every field is checked rather than trusted.
 */
export function readState(raw: string | null): ScratchpadState {
  if (!raw) return DEFAULT_STATE;
  try {
    const parsed = JSON.parse(raw) as Partial<ScratchpadState>;
    return {
      open: typeof parsed.open === "boolean" ? parsed.open : DEFAULT_STATE.open,
      width:
        typeof parsed.width === "number" && Number.isFinite(parsed.width)
          ? parsed.width
          : DEFAULT_STATE.width,
      height:
        typeof parsed.height === "number" && Number.isFinite(parsed.height)
          ? parsed.height
          : DEFAULT_STATE.height,
      code: typeof parsed.code === "string" ? parsed.code : DEFAULT_STATE.code,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export function writeState(state: ScratchpadState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* private browsing, or the quota is full; the panel still works */
  }
}

/** Load a snippet into the scratchpad and open it, from anywhere on the page. */
export const SEND_EVENT = "scratchpad:send";

export function sendToScratchpad(code: string): void {
  window.dispatchEvent(new CustomEvent(SEND_EVENT, { detail: code }));
}

/**
 * The store side of `useSyncExternalStore`.
 *
 * localStorage is state React does not own, so it is read through a subscribe
 * and snapshot pair rather than copied into component state inside an effect.
 * That keeps the server render and the first client render agreeing, and a
 * change made in another tab arrives for free.
 *
 * `getSnapshot` returns the raw string deliberately: React compares snapshots by
 * identity, and parsing here would hand back a new object every call and loop
 * forever.
 */
const CHANGE_EVENT = "scratchpad:changed";

export function subscribe(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

export function getSnapshot(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/** The server has no storage, so it always renders the closed default. */
export function getServerSnapshot(): string | null {
  return null;
}

/** Persist and tell this tab, since `storage` only fires in the others. */
export function commit(state: ScratchpadState): void {
  writeState(state);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}
