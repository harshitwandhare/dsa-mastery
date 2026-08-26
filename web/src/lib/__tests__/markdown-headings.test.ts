import { describe, expect, it } from "vitest";

import { renderLesson } from "@/lib/markdown";

/**
 * The sidebar links and the heading ids must come from the same place.
 *
 * They did not, and every link on every lesson was dead: the Python pipeline
 * slugged "0.1 Running Python" to "0-1-running-python" by turning punctuation
 * into dashes, while rehype-slug removed it and produced "01-running-python".
 * Nothing compared the two, so nothing noticed.
 *
 * These tests render real markdown and check the ids the page carries against
 * the headings the sidebar is built from.
 */

async function render(markdown: string) {
  return renderLesson(markdown, []);
}

/** Every id assigned in the rendered HTML, in document order. */
function idsInHtml(parts: { html: string }[]): string[] {
  const html = parts.map((part) => part.html).join("");
  return [...html.matchAll(/<h[23][^>]*\bid="([^"]+)"/g)].map((match) => match[1]);
}

describe("lesson headings", () => {
  it("reports an id for every heading it renders", async () => {
    const { parts, headings } = await render(
      "## First\n\ntext\n\n## Second\n\nmore\n",
    );
    expect(headings.map((h) => h.id)).toEqual(idsInHtml(parts));
  });

  it("matches ids for headings with dotted numbers", async () => {
    // The exact shape that was broken.
    const { parts, headings } = await render("## 0.1 Running Python\n\ntext\n");
    expect(headings).toHaveLength(1);
    expect(idsInHtml(parts)).toEqual([headings[0].id]);
  });

  it("keeps the heading text readable rather than slugged", async () => {
    const { headings } = await render("## 0.1 Running Python\n\ntext\n");
    expect(headings[0].text).toBe("0.1 Running Python");
  });

  it("excludes the appended anchor link from the text", async () => {
    // rehype-autolink-headings appends a "#" that must not leak into the label.
    const { headings } = await render("## Reading a Traceback\n\ntext\n");
    expect(headings[0].text).toBe("Reading a Traceback");
    expect(headings[0].text).not.toContain("#");
  });

  it("records the depth, so the sidebar can indent subsections", async () => {
    const { headings } = await render("## Top\n\n### Nested\n\ntext\n");
    expect(headings.map((h) => h.depth)).toEqual([2, 3]);
  });

  it("handles punctuation, ampersands and code spans in a heading", async () => {
    const { parts, headings } = await render(
      "## Lists & Tuples\n\na\n\n## Using `dict.get`\n\nb\n",
    );
    expect(headings.map((h) => h.id)).toEqual(idsInHtml(parts));
    expect(headings[1].text).toBe("Using dict.get");
  });

  it("gives repeated headings distinct ids", async () => {
    const { parts, headings } = await render("## Notes\n\na\n\n## Notes\n\nb\n");
    const ids = headings.map((h) => h.id);
    expect(new Set(ids).size).toBe(2);
    expect(ids).toEqual(idsInHtml(parts));
  });

  it("ignores h1, which is the lesson title rather than a section", async () => {
    const { headings } = await render("# Title\n\n## Section\n\ntext\n");
    expect(headings.map((h) => h.text)).toEqual(["Section"]);
  });

  it("returns nothing for a lesson with no sections", async () => {
    const { headings } = await render("Just a paragraph.\n");
    expect(headings).toEqual([]);
  });
});
