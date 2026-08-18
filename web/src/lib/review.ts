/**
 * Spaced repetition.
 *
 * The intervals come straight from file 08 §8.4 of the curriculum. They are not
 * tuned here and should not be: the site exists to run the curriculum, not to
 * invent a competing schedule.
 */

export type Confidence = 1 | 2 | 3 | 4 | 5;

export const INTERVALS: Record<Confidence, number[]> = {
  1: [1, 3, 7, 21],
  2: [1, 3, 7, 21],
  3: [3, 7, 30],
  4: [14, 42],
  5: [14, 42],
};

export type ReviewItem = {
  targetId: string;
  targetType: "exercise" | "problem";
  dueDate: number;
  /** How many times it has come back round. */
  round: number;
  lastConfidence: Confidence;
};

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Schedule the next sighting of something just attempted.
 *
 * Returns null once the item has been through every interval for its
 * confidence, which retires it: the schedule is finite on purpose, so the queue
 * drains instead of growing without end.
 */
export function schedule(
  item: Pick<ReviewItem, "targetId" | "targetType" | "round">,
  confidence: Confidence,
  now: number = Date.now(),
): ReviewItem | null {
  const intervals = INTERVALS[confidence];
  const days = intervals[item.round];
  if (days === undefined) return null;

  return {
    targetId: item.targetId,
    targetType: item.targetType,
    dueDate: now + days * DAY_MS,
    round: item.round + 1,
    lastConfidence: confidence,
  };
}

/** Items due now or overdue, oldest due first. */
export function dueItems(items: ReviewItem[], now: number = Date.now()): ReviewItem[] {
  return items
    .filter((item) => item.dueDate <= now)
    .sort((a, b) => a.dueDate - b.dueDate);
}

/** A human-readable gap, used in the queue and the dashboard. */
export function describeDue(dueDate: number, now: number = Date.now()): string {
  const diff = dueDate - now;
  const days = Math.round(diff / DAY_MS);
  if (diff <= 0) {
    const overdue = Math.abs(days);
    if (overdue === 0) return "due today";
    return overdue === 1 ? "1 day overdue" : `${overdue} days overdue`;
  }
  if (days === 0) return "due today";
  if (days === 1) return "due tomorrow";
  return `due in ${days} days`;
}
