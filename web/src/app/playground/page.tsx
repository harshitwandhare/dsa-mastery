import type { Metadata } from "next";

import { Playground } from "@/components/playground";

export const metadata: Metadata = {
  title: "Playground",
  description:
    "A blank Python scratchpad that runs in your browser. No install, no account, no server.",
};

export default function PlaygroundPage() {
  return (
    <main className="mx-auto max-w-4xl px-5 py-12">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight">Playground</h1>
        <p className="mt-3 text-text-muted">
          Real CPython, compiled to WebAssembly and running in this tab. The
          standard library is there, so <code>collections</code>,{" "}
          <code>heapq</code>, <code>bisect</code> and <code>itertools</code> all
          work, and <code>dsa.helpers</code> is preloaded for linked lists and
          trees.
        </p>
      </header>

      <Playground />
    </main>
  );
}
