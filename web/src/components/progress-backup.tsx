"use client";

import { useRef, useState } from "react";

import { exportProgress, importProgress, type Backup } from "@/lib/use-progress";

/**
 * Export and import.
 *
 * Everything is stored in one browser profile with no server copy, so clearing
 * site data or changing machine loses the lot. This is the only backup that
 * exists, which is why it is a plain JSON file the reader keeps rather than
 * anything clever.
 */
export function ProgressBackup() {
  const fileInput = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ tone: "ok" | "bad"; text: string } | null>(
    null,
  );

  async function download() {
    try {
      const backup = await exportProgress();
      const blob = new Blob([JSON.stringify(backup, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `dsa-mastery-progress-${backup.exportedAt.slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
      setMessage({
        tone: "ok",
        text: `Saved ${backup.attempts.length} attempts and ${backup.review.length} scheduled reviews.`,
      });
    } catch {
      setMessage({ tone: "bad", text: "Could not read your progress." });
    }
  }

  async function upload(file: File) {
    try {
      const backup = JSON.parse(await file.text()) as Backup;
      await importProgress(backup);
      setMessage({
        tone: "ok",
        text: "Imported and merged. Reload to see it.",
      });
    } catch (error) {
      setMessage({
        tone: "bad",
        text: error instanceof Error ? error.message : "That file could not be read.",
      });
    }
  }

  return (
    <section className="rounded-xl border border-border-subtle bg-bg-raised p-5">
      <h2 className="font-display text-lg font-semibold">Back up your progress</h2>
      <p className="mt-1 text-sm leading-relaxed text-text-muted">
        Everything is stored in this browser and nowhere else. Clearing site data
        or moving to another machine loses it, so keep a copy.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={download}
          className="rounded-lg bg-accent px-3.5 py-2 text-sm font-medium text-on-accent transition-colors hover:bg-accent-strong"
        >
          Export
        </button>
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          className="rounded-lg border border-border-strong px-3.5 py-2 text-sm text-text-muted transition-colors hover:text-text"
        >
          Import
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void upload(file);
            event.target.value = "";
          }}
        />
      </div>

      {message && (
        <p
          className={`mt-3 text-sm ${message.tone === "ok" ? "text-pass" : "text-fail"}`}
        >
          {message.text}
        </p>
      )}

      <p className="mt-3 text-xs text-text-faint">
        Importing merges rather than replaces, so an older file cannot wipe out
        newer work.
      </p>
    </section>
  );
}
