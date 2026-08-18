import { describe, expect, it } from "vitest";

import {
  describeDue,
  dueItems,
  INTERVALS,
  schedule,
  type Confidence,
  type ReviewItem,
} from "@/lib/review";

const DAY = 24 * 60 * 60 * 1000;
const NOW = 1_700_000_000_000;

describe("the intervals match the curriculum", () => {
  // File 08 §8.4. If these change, the site has stopped running the curriculum
  // it claims to run.
  it("uses the published table", () => {
    expect(INTERVALS[1]).toEqual([1, 3, 7, 21]);
    expect(INTERVALS[2]).toEqual([1, 3, 7, 21]);
    expect(INTERVALS[3]).toEqual([3, 7, 30]);
    expect(INTERVALS[4]).toEqual([14, 42]);
    expect(INTERVALS[5]).toEqual([14, 42]);
  });

  it("treats low confidence as needing to come back tomorrow", () => {
    const next = schedule(
      { targetId: "two-sum", targetType: "problem", round: 0 },
      1,
      NOW,
    );
    expect(next?.dueDate).toBe(NOW + 1 * DAY);
  });

  it("treats high confidence as needing a fortnight, not a day", () => {
    const next = schedule(
      { targetId: "two-sum", targetType: "problem", round: 0 },
      5,
      NOW,
    );
    expect(next?.dueDate).toBe(NOW + 14 * DAY);
  });
});

describe("scheduling", () => {
  it("advances the round each time", () => {
    const next = schedule(
      { targetId: "x", targetType: "problem", round: 2 },
      1,
      NOW,
    );
    expect(next?.round).toBe(3);
    expect(next?.dueDate).toBe(NOW + 7 * DAY);
  });

  it("retires an item once its intervals run out", () => {
    // Confidence 4 has two intervals, so round 2 is past the end.
    expect(
      schedule({ targetId: "x", targetType: "problem", round: 2 }, 4, NOW),
    ).toBeNull();
  });

  it.each([1, 2, 3, 4, 5] as Confidence[])(
    "confidence %s eventually retires rather than repeating forever",
    (confidence) => {
      let item = { targetId: "x", targetType: "problem" as const, round: 0 };
      let rounds = 0;
      for (; rounds < 20; rounds += 1) {
        const next = schedule(item, confidence, NOW);
        if (!next) break;
        item = { ...item, round: next.round };
      }
      expect(rounds).toBe(INTERVALS[confidence].length);
    },
  );

  it("keeps the confidence that produced the schedule", () => {
    const next = schedule({ targetId: "x", targetType: "exercise", round: 0 }, 3, NOW);
    expect(next?.lastConfidence).toBe(3);
    expect(next?.targetType).toBe("exercise");
  });
});

describe("the due queue", () => {
  const item = (id: string, dueDate: number): ReviewItem => ({
    targetId: id,
    targetType: "problem",
    dueDate,
    round: 1,
    lastConfidence: 3,
  });

  it("includes anything due now or in the past", () => {
    const queue = dueItems(
      [item("a", NOW - DAY), item("b", NOW), item("c", NOW + DAY)],
      NOW,
    );
    expect(queue.map((entry) => entry.targetId)).toEqual(["a", "b"]);
  });

  it("puts the most overdue first", () => {
    const queue = dueItems(
      [item("recent", NOW - DAY), item("ancient", NOW - 10 * DAY)],
      NOW,
    );
    expect(queue.map((entry) => entry.targetId)).toEqual(["ancient", "recent"]);
  });

  it("is empty when nothing is due", () => {
    expect(dueItems([item("a", NOW + DAY)], NOW)).toEqual([]);
  });
});

describe("describing when something is due", () => {
  it.each([
    [NOW, "due today"],
    [NOW + DAY, "due tomorrow"],
    [NOW + 5 * DAY, "due in 5 days"],
    [NOW - DAY, "1 day overdue"],
    [NOW - 4 * DAY, "4 days overdue"],
  ])("%s reads as %s", (dueDate, expected) => {
    expect(describeDue(dueDate, NOW)).toBe(expected);
  });

  it("does not call something due an hour ago overdue by a day", () => {
    expect(describeDue(NOW - 60 * 60 * 1000, NOW)).toBe("due today");
  });
});

describe("the phase-6 acceptance test", () => {
  it("an attempt at confidence 2 is due the next day", () => {
    // HANDOFF: "an attempt logged at confidence 2 appears in /review the next day".
    const scheduled = schedule(
      { targetId: "two-sum", targetType: "problem", round: 0 },
      2,
      NOW,
    );
    expect(scheduled).not.toBeNull();

    const tomorrow = NOW + DAY;
    expect(dueItems([scheduled as ReviewItem], tomorrow)).toHaveLength(1);
    // ...and not before then.
    expect(dueItems([scheduled as ReviewItem], NOW + DAY / 2)).toHaveLength(0);
  });
});
