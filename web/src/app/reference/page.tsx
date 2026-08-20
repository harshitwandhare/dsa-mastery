import type { Metadata } from "next";

import { ComplexityVisualiser } from "@/components/complexity-visualiser";
import { GlossaryBrowser } from "@/components/glossary-browser";
import { PatternCards } from "@/components/pattern-cards";
import { ReferenceTabs } from "@/components/reference-tabs";
import { contentStats, glossary } from "@/lib/content";

export const metadata: Metadata = {
  title: "Reference",
  description:
    "The sixteen patterns as flashcards, every term in the curriculum defined in plain English, and a complexity visualiser that measures real Python in your browser.",
};

export default function ReferencePage() {
  return (
    <main className="mx-auto max-w-4xl px-5 py-12">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Reference
        </h1>
        <p className="mt-3 max-w-2xl text-text-muted">
          The things worth having one click away: the {contentStats.patterns}{" "}
          patterns and what triggers them, {contentStats.glossaryTerms} terms
          defined in plain English, and a way to watch complexity actually happen.
        </p>
      </header>

      <ReferenceTabs
        patterns={<PatternCards />}
        glossary={<GlossaryBrowser terms={glossary} />}
        complexity={<ComplexityVisualiser />}
      />
    </main>
  );
}
