"use client";

import { useEffect, useState } from "react";

const LIMIT_SECONDS = 22 * 60;

function format(seconds: number): string {
  const minutes = Math.floor(Math.abs(seconds) / 60);
  const rest = Math.abs(seconds) % 60;
  return `${seconds < 0 ? "-" : ""}${minutes}:${String(rest).padStart(2, "0")}`;
}

/**
 * The 22-minute timer.
 *
 * Spec 20.7 F3 is explicit that this is core pedagogy rather than a widget, so
 * it is the largest thing on the page after the editor. At 22:00 it does not
 * block anything: it says what to do next, which is to read the editorial and
 * then re-implement from blank. Struggling for 22 minutes is the lesson;
 * struggling for 90 is not.
 */
export function PracticeTimer({
  onElapsed,
}: {
  onElapsed?: (seconds: number) => void;
}) {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  // Report on every tick rather than on unmount, so whoever is logging the
  // attempt always has the current figure instead of one that only arrives once
  // the component goes away.
  useEffect(() => {
    onElapsed?.(seconds);
  }, [seconds, onElapsed]);

  const remaining = LIMIT_SECONDS - seconds;
  const over = remaining <= 0;
  const progress = Math.min(seconds / LIMIT_SECONDS, 1);

  return (
    <div
      className={`rounded-xl border p-4 ${
        over ? "border-warn bg-warn-soft" : "border-border-subtle bg-bg-raised"
      }`}
    >
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-text-faint">
            {over ? "Time" : "Time left"}
          </p>
          <p
            className={`font-mono text-3xl font-semibold tabular-nums ${
              over ? "text-warn" : "text-text"
            }`}
            aria-live="polite"
          >
            {format(over ? -(seconds - LIMIT_SECONDS) : remaining)}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setRunning((value) => !value)}
            className="rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-on-accent transition-colors hover:bg-accent-strong"
          >
            {running ? "Pause" : seconds === 0 ? "Start" : "Resume"}
          </button>
          <button
            type="button"
            onClick={() => {
              setRunning(false);
              setSeconds(0);
            }}
            className="rounded-lg border border-border-strong px-3 py-1.5 text-sm text-text-muted transition-colors hover:text-text"
          >
            Reset
          </button>
        </div>
      </div>

      <div
        className="mt-3 h-1.5 overflow-hidden rounded-full bg-bg-inset"
        role="progressbar"
        aria-valuenow={Math.round(progress * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Time used of 22 minutes"
      >
        <div
          className={`h-full rounded-full transition-[width] duration-500 ${
            over ? "bg-warn" : "bg-accent"
          }`}
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {over && (
        <p className="mt-3 text-sm leading-relaxed text-text">
          <strong>Time.</strong> Open the editorial, read it once, then close it
          and re-implement from blank. That is the part that makes it stick.
        </p>
      )}
    </div>
  );
}
