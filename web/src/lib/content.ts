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
import patternsJson from "../../content/patterns.json";
import problemsJson from "../../content/problems.json";

export type Section = {
  heading: string;
  anchor: string;
};

/**
 * Which curriculum a lesson belongs to. `interview` is files 00-20, read in
 * order to prepare for interviews. `course` is files 21+, the graduate
 * algorithms track, which is proof-first and stands on its own.
 */
export type Track = "interview" | "course";

export type Lesson = {
  slug: string;
  fileNumber: number;
  track: Track;
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

/** The hidden assertion for an exercise, lifted out of the drill's CASES list. */
export type Check = {
  label: string;
  /** Expression producing the learner's answer. */
  call: string;
  /** Expression producing what it should be. */
  expected: string;
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
  check: Check | null;
};

export type Drill = {
  id: string;
  title: string;
  sourceFile: string;
  exerciseCount: number;
  /** How many exercises carry an assertion, so can be graded. */
  gradableCount: number;
  /** Helper definitions the assertions need, run before grading. */
  support: string;
  exercises: Exercise[];
};

/** One of the sixteen patterns from file 08, as a flashcard. */
export type Pattern = {
  number: number;
  name: string;
  /** What should make you reach for it. This is the side that gets tested. */
  trigger: string;
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
export const patterns = patternsJson as Pattern[];

/** Every lesson from both tracks, in file-number order. */
export function allLessons(): Lesson[] {
  return [...lessons].sort((a, b) => a.fileNumber - b.fileNumber);
}

/** One track's lessons, in reading order. */
export function lessonsInTrack(track: Track): Lesson[] {
  return allLessons().filter((lesson) => lesson.track === track);
}

export function getLesson(slug: string): Lesson | undefined {
  return lessons.find((lesson) => lesson.slug === slug);
}

/**
 * The lesson before and after this one, for the footer navigation.
 *
 * Neighbours stay inside the lesson's own track. The two curricula are read
 * separately, so walking off the end of the interview track into the course
 * track would present them as one sequence when they are not.
 */
export function lessonNeighbours(slug: string): {
  previous?: Lesson;
  next?: Lesson;
} {
  const lesson = getLesson(slug);
  if (!lesson) return {};
  const ordered = lessonsInTrack(lesson.track);
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
  interviewLessons: lessons.filter((lesson) => lesson.track === "interview").length,
  courseLessons: lessons.filter((lesson) => lesson.track === "course").length,
  problems: problems.length,
  neetcode150: problems.filter((problem) => problem.neetcodeTier === 150).length,
  blind75: problems.filter((problem) => problem.inBlind75).length,
  exercises: drills.reduce((total, drill) => total + drill.exerciseCount, 0),
  glossaryTerms: glossary.length,
  patterns: patterns.length,
  runnableBlocks: lessons.reduce((total, lesson) => total + lesson.runnableBlocks, 0),
};
