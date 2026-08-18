import type { Metadata } from "next";

import { GlossaryBrowser } from "@/components/glossary-browser";
import { contentStats, glossary } from "@/lib/content";

export const metadata: Metadata = {
  title: "Reference",
  description:
    "Every term in the curriculum, defined in plain English and searchable.",
};

export default function ReferencePage() {
  return (
    <main className="mx-auto max-w-4xl px-5 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Reference</h1>
        <p className="mt-3 max-w-2xl text-text-muted">
          {contentStats.glossaryTerms} terms, defined in plain English. If a word
          in a lesson is unfamiliar, it is defined here rather than assumed.
        </p>
      </header>

      <GlossaryBrowser terms={glossary} />
    </main>
  );
}
