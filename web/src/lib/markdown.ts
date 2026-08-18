/**
 * Markdown to HTML, rendered on the server.
 *
 * The lesson bodies come out of the Python pipeline with their inter-document
 * links already rewritten to app routes. This turns that markdown into
 * highlighted, anchored HTML at request time, so a reader gets the full lesson
 * as documents rather than waiting on client-side JavaScript to draw it.
 *
 * Runnable code is layered on top of this output by `LessonRunners`, which finds
 * the Python blocks in the rendered DOM. Highlighting therefore has to happen
 * here, once, rather than inside a client component.
 */

import rehypeAutolinkHeadings, {
  type Options as AutolinkOptions,
} from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import type { Element, Root } from "hast";
import { visit } from "unist-util-visit";

/**
 * Wrap every table so wide ones scroll inside their own box.
 *
 * The problem index and the complexity tables are far too wide for a reading
 * column, and without this the whole page scrolls sideways on a phone.
 */
function wrapTables() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element, index, parent) => {
      if (node.tagName !== "table" || !parent || index === undefined) return;
      if (parent.type === "element" && parent.properties?.className) {
        const className = parent.properties.className;
        if (Array.isArray(className) && className.includes("table-scroll")) return;
      }
      parent.children[index] = {
        type: "element",
        tagName: "div",
        properties: { className: ["table-scroll"] },
        children: [node],
      };
    });
  };
}

/**
 * Tag Python blocks so the client runner can find them, and record their source.
 *
 * Spec 20.7 F1: a ```python fence is runnable, ```python:static is not. The raw
 * source is stashed on the element because the highlighted markup is a tree of
 * spans that would be painful to read code back out of.
 */
function markRunnableBlocks() {
  return (tree: Root) => {
    visit(tree, "element", (figure: Element) => {
      // rehype-pretty-code wraps each block in a figure and hoists unknown
      // properties onto it, so the source stashed below lands here rather than
      // on the <pre> it was set on.
      const raw = readProperty(figure, "dataRawSource");
      if (!raw) return;

      const pre = figure.children.find(
        (child): child is Element => child.type === "element" && child.tagName === "pre",
      );
      if (!pre) return;

      if (readProperty(pre, "dataLanguage") !== "python") return;

      pre.properties = {
        ...pre.properties,
        "data-runnable": "true",
        "data-source": raw,
      };
    });
  };
}

/** Property keys survive as camelCase or kebab-case depending on the plugin. */
function readProperty(node: Element, camelKey: string): string {
  const kebabKey = camelKey.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
  const value = node.properties?.[camelKey] ?? node.properties?.[kebabKey];
  return value === undefined || value === null ? "" : String(value);
}

/** Stash the pre-highlight source on the node, since Shiki discards it. */
function keepRawSource() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element) => {
      if (node.tagName !== "pre") return;
      const code = node.children.find(
        (child): child is Element => child.type === "element" && child.tagName === "code",
      );
      if (!code) return;
      const text = code.children
        .filter((child) => child.type === "text")
        .map((child) => (child.type === "text" ? child.value : ""))
        .join("");
      if (text) {
        node.properties = { ...node.properties, dataRawSource: text };
      }
    });
  };
}

/**
 * A `#` link appended to every heading, so a section can be linked to directly.
 * Declared separately because inlining it makes TypeScript resolve `.use()`
 * against the wrong overload in the middle of the chain.
 */
const AUTOLINK_OPTIONS: AutolinkOptions = {
  behavior: "append",
  properties: { className: ["heading-anchor"], ariaHidden: "true", tabIndex: -1 },
  content: { type: "text", value: "#" },
};

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(keepRawSource)
  .use(rehypeSlug)
  .use(rehypeAutolinkHeadings, AUTOLINK_OPTIONS)
  .use(rehypePrettyCode, {
    // Both themes are emitted as CSS variables; globals.css picks one per scheme.
    theme: { dark: "github-dark-dimmed", light: "github-light" },
    keepBackground: true,
    defaultLang: "text",
  })
  .use(markRunnableBlocks)
  .use(wrapTables)
  .use(rehypeStringify, { allowDangerousHtml: true });

export async function renderMarkdown(markdown: string): Promise<string> {
  const file = await processor.process(markdown);
  return String(file);
}

/** One piece of a lesson: either prose, or a Python block that can be run. */
export type LessonPart =
  | { kind: "html"; html: string }
  | { kind: "python"; html: string; code: string };

/**
 * Render a lesson as an ordered list of parts.
 *
 * The alternative was to render one HTML string and have the client find the
 * Python blocks in the DOM afterwards. Splitting on the server instead means the
 * Run controls are real children in the React tree rather than portals into
 * nodes React does not own, and the page needs no post-mount DOM surgery to
 * become interactive.
 */
export async function renderLesson(
  markdown: string,
  /**
   * Per-fence runnability from the pipeline, in document order. Some lesson
   * blocks are one-line illustrations of an API whose names were never defined;
   * offering Run on those guarantees a NameError, so they render as plain code.
   */
  fenceRunnable: boolean[] = [],
): Promise<LessonPart[]> {
  const tree = processor.parse(markdown);
  const hast = (await processor.run(tree)) as Root;

  const parts: LessonPart[] = [];
  let buffer: Root["children"] = [];
  let fenceIndex = 0;

  const flush = () => {
    if (buffer.length === 0) return;
    parts.push({
      kind: "html",
      html: processor.stringify({ type: "root", children: buffer }),
    });
    buffer = [];
  };

  for (const node of hast.children) {
    const code = node.type === "element" ? runnableSource(node) : null;
    if (code === null) {
      buffer.push(node);
      continue;
    }

    // Every Python fence advances the counter, runnable or not, so the flags
    // stay aligned with the pipeline's ordering.
    const canRun = fenceRunnable[fenceIndex] ?? true;
    fenceIndex += 1;
    if (!canRun) {
      buffer.push(node);
      continue;
    }

    flush();
    parts.push({
      kind: "python",
      html: processor.stringify({ type: "root", children: [node] }),
      code,
    });
  }
  flush();

  return parts;
}

/** The Python source of a runnable block, or null if this is not one. */
function runnableSource(node: Element): string | null {
  const pre = node.children.find(
    (child): child is Element => child.type === "element" && child.tagName === "pre",
  );
  if (!pre || readProperty(pre, "data-runnable") !== "true") return null;
  return readProperty(pre, "data-source") || null;
}
