import type { Metadata } from "next";

import { ProgressBackup } from "@/components/progress-backup";
import { ProgressCharts } from "@/components/progress-charts";

export const metadata: Metadata = {
  title: "Progress",
  description: "What you have solved, when, and where the gaps are.",
};

export default function ProgressPage() {
  return (
    <main className="mx-auto max-w-4xl px-5 py-14">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Progress
        </h1>
        <p className="mt-3 text-text-muted">
          Drawn entirely from attempts you logged, in this browser. Nothing here
          is an estimate.
        </p>
      </header>

      <ProgressCharts />

      <div className="mt-12">
        <ProgressBackup />
      </div>
    </main>
  );
}
