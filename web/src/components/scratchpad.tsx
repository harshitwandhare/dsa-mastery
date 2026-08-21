"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";

import { CodeEditor } from "@/components/code-editor";
import { PythonOutput } from "@/components/python-output";
import { usePython } from "@/components/use-python";
import {
  clampSize,
  commit,
  DEFAULT_STATE,
  getServerSnapshot,
  getSnapshot,
  readState,
  SEND_EVENT,
  subscribe,
  type ScratchpadState,
} from "@/lib/scratchpad-store";

/**
 * A Python scratchpad that follows you around the site.
 *
 * The point is not having somewhere to write Python, since /playground already
 * exists. The point is not having to leave the lesson to use it: reading about
 * `dict.get`, wanting to try one variation, and getting an answer without
 * losing your place on the page.
 *
 * It keeps its own namespace, separate from the lesson's runnable blocks, so
 * experimenting in here cannot redefine a name the lesson depends on further
 * down the page.
 *
 * Size, position in the open/closed cycle, and the code itself all persist, so
 * moving between lessons does not reset what you were in the middle of.
 */

const MAXIMISED = { width: 10_000, height: 10_000 }; // clamped to the viewport

function TerminalIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 17 17" fill="none" aria-hidden="true">
      <path
        d="M3 4.5L7 8.5L3 12.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M9 12.5H14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function Scratchpad() {
  const pathname = usePathname();
  const [resizing, setResizing] = useState(false);
  const { run, running, result, stageLabel, reset } = usePython("scratchpad");

  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const state = useMemo(() => readState(raw), [raw]);

  const update = useCallback(
    (patch: Partial<ScratchpadState>) => {
      commit({ ...readState(getSnapshot()), ...patch });
    },
    [],
  );

  const setState = useCallback(
    (produce: (current: ScratchpadState) => ScratchpadState) => {
      commit(produce(readState(getSnapshot())));
    },
    [],
  );

  // Cmd/Ctrl + J, the shortcut every editor uses for a bottom panel.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "j") {
        event.preventDefault();
        setState((current) => ({ ...current, open: !current.open }));
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [setState]);

  // "Try this" on a lesson block loads the snippet in here and opens the panel.
  useEffect(() => {
    function onSend(event: Event) {
      const code = (event as CustomEvent<string>).detail;
      if (typeof code === "string") {
        setState((current) => ({ ...current, code, open: true }));
      }
    }
    window.addEventListener(SEND_EVENT, onSend);
    return () => window.removeEventListener(SEND_EVENT, onSend);
  }, [setState]);

  /**
   * The size actually rendered, which is the stored preference clamped to the
   * window.
   *
   * The stored value is what the reader chose and is never overwritten by a
   * clamp. An earlier version wrote the clamped result back, so opening the
   * panel once in a narrow window shrank it to the minimum permanently: the
   * preference was gone and widening the window did not bring it back.
   */
  const [viewport, setViewport] = useState({ width: 1280, height: 800 });

  useEffect(() => {
    const measure = () =>
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const rendered = clampSize(state.width, state.height, viewport.width, viewport.height);

  /**
   * Drag the top-left corner to resize.
   *
   * The panel is anchored bottom-right, so dragging that corner up and left
   * grows it, which is the direction the cursor is already moving. Pointer
   * capture keeps the drag alive over the editor and outside the window.
   */
  const startResize = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      (event.target as Element).setPointerCapture(event.pointerId);
      setResizing(true);

      const startX = event.clientX;
      const startY = event.clientY;
      const startWidth = rendered.width;
      const startHeight = rendered.height;

      const onMove = (move: PointerEvent) => {
        const next = clampSize(
          startWidth + (startX - move.clientX),
          startHeight + (startY - move.clientY),
          window.innerWidth,
          window.innerHeight,
        );
        update(next);
      };

      const onUp = () => {
        setResizing(false);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [rendered.width, rendered.height, update],
  );

  const outputRef = useRef<HTMLDivElement>(null);

  async function handleRun() {
    await run(state.code);
    // Scroll the result into view; on a short panel it is otherwise below the fold.
    requestAnimationFrame(() =>
      outputRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" }),
    );
  }

  // The playground is this, full size. A floating copy of it would be silly.
  if (pathname === "/playground") return null;

  if (!state.open) {
    return (
      <button
        type="button"
        onClick={() => update({ open: true })}
        aria-label="Open the Python scratchpad"
        title="Python scratchpad (Ctrl/Cmd + J)"
        className="fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-accent text-on-accent shadow-[var(--shadow-card)] transition-transform hover:scale-105 focus-visible:scale-105"
      >
        <TerminalIcon />
      </button>
    );
  }

  return (
    <aside
      aria-label="Python scratchpad"
      style={{ width: rendered.width, height: rendered.height }}
      className="overlay-panel fixed bottom-4 right-4 z-40 flex max-w-[calc(100vw-2rem)] flex-col overflow-hidden"
    >
      {/* Title bar. Doubles as the resize corner. */}
      <div className="flex shrink-0 items-center gap-1 border-b border-border-subtle bg-bg-inset px-2 py-1.5">
        <button
          type="button"
          onPointerDown={startResize}
          aria-label="Resize the scratchpad"
          title="Drag to resize"
          className={`flex h-7 w-7 items-center justify-center rounded text-text-faint hover:text-text ${
            resizing ? "text-accent" : ""
          }`}
          style={{ cursor: "nwse-resize" }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
            <path
              d="M1 5L5 1M1 9L9 1"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <span className="flex items-center gap-1.5 text-xs font-medium text-text">
          <TerminalIcon />
          Scratchpad
        </span>

        <span className="ml-auto flex items-center gap-0.5">
          <button
            type="button"
            onClick={reset}
            title="Forget every name defined so far"
            className="rounded px-2 py-1 text-[0.7rem] text-text-faint transition-colors hover:text-text"
          >
            Clear session
          </button>
          <button
            type="button"
            onClick={() => update({ width: MAXIMISED.width, height: MAXIMISED.height })}
            aria-label="Expand the scratchpad"
            title="Expand"
            className="flex h-7 w-7 items-center justify-center rounded text-text-faint transition-colors hover:bg-bg-raised hover:text-text"
          >
            <svg width="11" height="11" viewBox="0 0 11 11" aria-hidden="true">
              <path
                d="M4 1H1V4M7 10h3V7"
                stroke="currentColor"
                strokeWidth="1.4"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => update({ width: DEFAULT_STATE.width, height: DEFAULT_STATE.height })}
            aria-label="Restore the default size"
            title="Reset size"
            className="flex h-7 w-7 items-center justify-center rounded text-text-faint transition-colors hover:bg-bg-raised hover:text-text"
          >
            <svg width="11" height="11" viewBox="0 0 11 11" aria-hidden="true">
              <rect
                x="1.5"
                y="1.5"
                width="8"
                height="8"
                rx="1.5"
                stroke="currentColor"
                strokeWidth="1.4"
                fill="none"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => update({ open: false })}
            aria-label="Minimise the scratchpad"
            title="Minimise (Ctrl/Cmd + J)"
            className="flex h-7 w-7 items-center justify-center rounded text-text-faint transition-colors hover:bg-bg-raised hover:text-text"
          >
            <svg width="11" height="11" viewBox="0 0 11 11" aria-hidden="true">
              <path d="M1.5 8.5h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </button>
        </span>
      </div>

      {/* Editor, which takes whatever height is left over. */}
      <div className="min-h-0 flex-1 overflow-auto p-2">
        <CodeEditor
          value={state.code}
          onChange={(code) => update({ code })}
          onRun={handleRun}
          minHeight="6rem"
          ariaLabel="Python scratchpad"
        />

        {(running || result) && (
          <div ref={outputRef} className="mt-2">
            <PythonOutput result={result} running={running} stageLabel={stageLabel} />
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2 border-t border-border-subtle px-2 py-1.5">
        <button
          type="button"
          onClick={handleRun}
          disabled={running}
          className="rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-on-accent transition-colors hover:bg-accent-strong disabled:opacity-60"
        >
          {running ? "Running" : "Run"}
        </button>
        <span className="font-mono text-[0.65rem] text-text-faint">Ctrl/Cmd + Enter</span>
      </div>
    </aside>
  );
}
