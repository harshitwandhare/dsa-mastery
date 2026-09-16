import { describe, expect, it } from "vitest";

import { renderMarkdown } from "@/lib/markdown";

/**
 * Maths is typeset; code is not.
 *
 * The course track is asymptotics, recurrences and summations, and those were
 * set in monospace code spans, so a page of `Theta(n^2)` and `sum_{i=1}^{n}`
 * read as source rather than as mathematics. KaTeX now handles anything
 * between dollar signs.
 *
 * The risk this file guards is the other direction: `$` is an ordinary
 * character, and a maths parser that gets greedy turns a code span, a regex
 * anchor, or a price into an unreadable expression. So each test pins one side
 * of the boundary.
 */

describe("maths is typeset", () => {
  it("renders inline maths with KaTeX", async () => {
    const html = await renderMarkdown("Runs in $\\Theta(n \\log n)$ time.");
    expect(html).toContain("katex");
    expect(html).not.toContain("katex-error");
  });

  it("renders display maths as its own block", async () => {
    // The delimiters have to sit on their own lines. `$$x$$` inline is read as
    // inline maths, which is worth pinning: it is the easy mistake to make when
    // writing a new recurrence into a lesson.
    const html = await renderMarkdown("$$\nT(n) = 2T(n/2) + \\Theta(n)\n$$");
    expect(html).toContain("katex-display");
    expect(html).not.toContain("katex-error");
  });

  it("treats $$x$$ on one line as inline, not display", async () => {
    const html = await renderMarkdown("$$T(n) = \\Theta(n)$$");
    expect(html).toContain("katex");
    expect(html).not.toContain("katex-display");
  });

  it("typesets the notation the course track actually uses", async () => {
    const cases = [
      "$\\Theta(n^2)$",
      "$\\Omega(n \\log n)$",
      "$\\sum_{i=1}^{n} \\frac{1}{i} = H_n$",
      "$n^{\\log_b a}$",
      "$\\lg^{*} n$",
      "$T(n) \\le 2T(\\lceil n/2 \\rceil) + n$",
      "$\\binom{n}{2}$",
      "$\\Pr[X \\ge c] \\le \\mathbb{E}[X]/c$",
      "$f = o(g) \\iff \\lim_{n \\to \\infty} f/g = 0$",
    ];
    for (const source of cases) {
      const html = await renderMarkdown(source);
      expect(html, `failed on ${source}`).not.toContain("katex-error");
      expect(html, `not typeset: ${source}`).toContain("katex");
    }
  });
});

describe("code is left alone", () => {
  it("does not typeset inside a code span", async () => {
    const html = await renderMarkdown("Use `arr[i]` and `x in set`.");
    expect(html).toContain("<code");
    expect(html).not.toContain("katex");
  });

  it("does not typeset inside a fenced block", async () => {
    const html = await renderMarkdown(["```python", "total = n * (n + 1) // 2", "```"].join("\n"));
    expect(html).not.toContain("katex");
  });

  it("leaves a lone dollar sign as text", async () => {
    const html = await renderMarkdown("It costs $5 to run.");
    expect(html).not.toContain("katex");
    expect(html).toContain("$5");
  });

  it("keeps Python blocks runnable alongside maths", async () => {
    const markdown = [
      "The loop is $\\Theta(n)$.",
      "",
      "```python",
      "print(sum(range(10)))",
      "```",
    ].join("\n");
    const html = await renderMarkdown(markdown);
    expect(html).toContain("katex");
    expect(html).toContain('data-runnable="true"');
  });
});
