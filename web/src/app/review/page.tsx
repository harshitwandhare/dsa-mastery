import type { Metadata } from "next";

import Link from "next/link";

import { ReviewQueue } from "@/components/review-queue";

export const metadata: Metadata = {
  title: "Review",
  description:
    "What is due for re-solving today, scheduled by how confident you were last time.",
};

export default function ReviewPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-14">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Review
        </h1>
        <p className="mt-3 text-text-muted">
          Solving something once is not learning it. These come back on the
          schedule from{" "}
          <Link
            href="/learn/08-interview-craft"
            className="text-accent underline decoration-accent-line underline-offset-4"
          >
            file 08
          </Link>
          : sooner if you struggled, later if it was easy.
        </p>
      </header>

      <ReviewQueue />
    </main>
  );
}
