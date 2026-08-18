/**
 * The read side of the content pipeline.
 *
 * `tools/build_content.py` generates the JSON in `content/` from the curriculum
 * markdown. Nothing here parses markdown structure or reshapes the data; it
 * only types it and provides lookups. If a field is missing, the fix belongs in
 * the Python pipeline, never in a hand-edit of the JSON.
 */

import drillsJson from "../../content/drills.json";
import glossaryJson from "../../content/glossary.json";
import lessonsJson from "../../content/lessons.json";
import problemsJson from "../../content/problems.json";

export type Section = {
  heading: string;
  anchor: string;
};

export type Lesson = {
  slug: string;
  fileNumber: number;
  title: string;
  sections: Section[];
  estimatedMinutes: number;
  runnableBlocks: number;
  /** Per-Python-fence: can pressing Run actually work? */
  fenceRunnable: boolean[];
  body: string;
};

export type Difficulty = "easy" | "medium" | "hard";

export type Problem = {
  slug: string;
  title: string;
  difficulty: Difficulty;
  topic: string;
  patterns: string[];
  insight: string;
  leetcodeUrl: string;
  inBlind75: boolean;
  frequentlyAsked: boolean;
  neetcodeTier: number | "extra";
  orderInList: number | null;
};

export type Exercise = {
  id: string;
  drillId: string;
  day: number;
  name: string;
  title: string;
  prompt: string;
  starterCode: string;
  kind: "function" | "class";
  params: string[];
};

export type Drill = {
  id: string;
  title: string;
  sourceFile: string;
  exerciseCount: number;
  exercises: Exercise[];
};

export type GlossaryTerm = {
  term: string;
  meaning: string;
  section: string;
};

export const lessons = lessonsJson as Lesson[];
export const problems = problemsJson as Problem[];
export const drills = drillsJson as Drill[];
export const glossary = glossaryJson as GlossaryTerm[];

/** Lessons in curriculum order, which is file-number order. */
export function allLessons(): Lesson[] {
  return [...lessons].sort((a, b) => a.fileNumber - b.fileNumber);
}

export function getLesson(slug: string): Lesson | undefined {
  return lessons.find((lesson) => lesson.slug === slug);
}

/** The lesson before and after this one, for the footer navigation. */
export function lessonNeighbours(slug: string): {
  previous?: Lesson;
  next?: Lesson;
} {
  const ordered = allLessons();
  const index = ordered.findIndex((lesson) => lesson.slug === slug);
  if (index === -1) return {};
  return {
    previous: ordered[index - 1],
    next: ordered[index + 1],
  };
}

/**
 * Problems in the NeetCode 150 order, with everything unranked after it.
 * `orderInList` 1..150 is the canonical sequence and must stay the default.
 */
export function allProblems(): Problem[] {
  return [...problems].sort((a, b) => {
    const left = a.orderInList ?? Number.MAX_SAFE_INTEGER;
    const right = b.orderInList ?? Number.MAX_SAFE_INTEGER;
    if (left !== right) return left - right;
    return a.title.localeCompare(b.title);
  });
}

export function getProblem(slug: string): Problem | undefined {
  return problems.find((problem) => problem.slug === slug);
}

export function problemTopics(): string[] {
  return [...new Set(problems.map((problem) => problem.topic))].sort();
}

export function getDrill(id: string): Drill | undefined {
  return drills.find((drill) => drill.id === id);
}

/** Glossary terms grouped by the section of file 19 they came from. */
export function glossaryBySection(): { section: string; terms: GlossaryTerm[] }[] {
  const groups = new Map<string, GlossaryTerm[]>();
  for (const term of glossary) {
    const existing = groups.get(term.section);
    if (existing) existing.push(term);
    else groups.set(term.section, [term]);
  }
  return [...groups.entries()].map(([section, terms]) => ({ section, terms }));
}

/** Totals used by the landing page and the dashboard. */
export const contentStats = {
  lessons: lessons.length,
  problems: problems.length,
  neetcode150: problems.filter((problem) => problem.neetcodeTier === 150).length,
  blind75: problems.filter((problem) => problem.inBlind75).length,
  exercises: drills.reduce((total, drill) => total + drill.exerciseCount, 0),
  glossaryTerms: glossary.length,
  runnableBlocks: lessons.reduce((total, lesson) => total + lesson.runnableBlocks, 0),
};
