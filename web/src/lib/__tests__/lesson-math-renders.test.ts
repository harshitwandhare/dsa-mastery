import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { renderMarkdown } from "@/lib/markdown";

/**
 * Every lesson renders with no broken maths.
 *
 * The course-track maths was converted from ASCII code spans to LaTeX in bulk
 * by `tools/asciimath.py`, which is a lot of mechanical edits across nine
 * files. KaTeX is the only thing that can tell us whether all of them are
 * well formed, and it reports a failure as a `katex-error` span rather than by
 * throwing, so nothing else would notice.
 *
 * This walks the real markdown sources. If a future edit writes `$\Theat(n)$`,
 * this is what catches it.
 */

const REPO_ROOT = join(__dirname, "..", "..", "..", "..");

function lessonFiles(): string[] {
  return readdirSync(REPO_ROOT)
    .filter((name) => /^\d\d-.*\.md$/.test(name))
    .sort();
}

describe("lesson maths is well formed", () => {
  const files = lessonFiles();

  it("finds the lesson sources", () => {
    expect(files.length).toBeGreaterThan(25);
  });

  it.each(files)("%s renders without a KaTeX error", async (name) => {
    const markdown = readFileSync(join(REPO_ROOT, name), "utf8");
    const html = await renderMarkdown(markdown);

    if (html.includes("katex-error")) {
      // Report the offending source, not just "it failed somewhere in 700 lines".
      const broken = [...html.matchAll(/title="([^"]*)"[^>]*class="[^"]*katex-error/g)]
        .map((match) => match[1])
        .slice(0, 5);
      expect.fail(`${name} has broken maths: ${broken.join(" | ") || "(source not recoverable)"}`);
    }
    expect(html).not.toContain("katex-error");
  });
});
