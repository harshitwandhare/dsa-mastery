"use client";

import { del, get, keys, set } from "idb-keyval";
import { useCallback, useEffect, useState } from "react";

import {
  dueItems,
  schedule,
  type Confidence,
  type ReviewItem,
} from "@/lib/review";

/**
 * Local progress.
 *
 * Everything a learner does stays in their own browser: no account, no server,
 * nothing to sign up for. IndexedDB rather than localStorage because attempts
 * accumulate code, and localStorage is a synchronous 5 MB budget shared with
 * everything else on the origin.
 */

const SOLVED_KEY = (drillId: string) => `drill:${drillId}:solved`;
const ATTEMPTS_KEY = "attempts";

/**
 * The recurring failure modes from the tracker.
 *
 * Grouping by these is the point of the mistakes log: three or four categories
 * repeating is a signal you can act on, where a flat list of forty attempts is
 * not.
 */
export const MISTAKE_CATEGORIES = [
  "Misread the constraints",
  "Wrong pattern chosen",
  "Right idea, wrong implementation",
  "Off-by-one or boundary",
  "Missed an edge case",
  "Ran out of time",
  "Needed the editorial",
] as const;

export type MistakeCategory = (typeof MISTAKE_CATEGORIES)[number];

export type Attempt = {
  id: string;
  targetId: string;
  targetType: "exercise" | "problem";
  timestamp: number;
  durationSeconds: number;
  passed: boolean;
  confidence: 1 | 2 | 3 | 4 | 5;
  code: string;
  notes: string;
  /** Only set on an attempt that did not go well. */
  category?: MistakeCategory;
};

/**
 * Which exercises in a drill are solved.
 *
 * Reads once on mount. A miss just means an empty list, which is the correct
 * state for a first visit, so a storage failure degrades to "nothing solved
 * yet" rather than to a broken page.
 */
export function useDrillProgress(drillId: string) {
  const [solved, setSolved] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    get<string[]>(SOLVED_KEY(drillId))
      .then((stored) => {
        if (!cancelled && stored) setSolved(stored);
      })
      .catch(() => {
        /* storage unavailable: start from nothing */
      });
    return () => {
      cancelled = true;
    };
  }, [drillId]);

  const markSolved = useCallback(
    (exerciseId: string) => {
      setSolved((current) => {
        if (current.includes(exerciseId)) return current;
        const next = [...current, exerciseId];
        void set(SOLVED_KEY(drillId), next).catch(() => {});
        return next;
      });
    },
    [drillId],
  );

  const clear = useCallback(() => {
    setSolved([]);
    void del(SOLVED_KEY(drillId)).catch(() => {});
  }, [drillId]);

  return { solved, markSolved, clear };
}

/** Every attempt ever logged, newest last. */
export function useAttempts() {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    get<Attempt[]>(ATTEMPTS_KEY)
      .then((stored) => {
        if (cancelled) return;
        if (stored) setAttempts(stored);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
    return () => {
      cancelled = true;
    };
  }, []);

  const log = useCallback((attempt: Attempt) => {
    setAttempts((current) => {
      const next = [...current, attempt];
      void set(ATTEMPTS_KEY, next).catch(() => {});
      return next;
    });
  }, []);

  return { attempts, log, loaded };
}

const ANALYSIS_KEY = (slug: string) => `analysis:${slug}`;
const REVIEW_KEY = "review-queue";

export type Analysis = {
  constraints?: string;
  brute?: string;
  optimal?: string;
  insight?: string;
};

/**
 * The analysis template for one problem, saved as it is typed.
 *
 * Losing this to a refresh would punish exactly the behaviour the curriculum is
 * trying to build, so it is written on every keystroke rather than on submit.
 */
export function useAnalysis(slug: string) {
  const [analysis, setAnalysis] = useState<Analysis>({});

  useEffect(() => {
    let cancelled = false;
    get<Analysis>(ANALYSIS_KEY(slug))
      .then((stored) => {
        if (!cancelled && stored) setAnalysis(stored);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const update = useCallback(
    (field: keyof Analysis, value: string) => {
      setAnalysis((current) => {
        const next = { ...current, [field]: value };
        void set(ANALYSIS_KEY(slug), next).catch(() => {});
        return next;
      });
    },
    [slug],
  );

  return { analysis, update };
}

/**
 * The spaced-repetition queue.
 *
 * `record` replaces any existing entry for the same target, so re-attempting
 * something reschedules it rather than queueing it twice. An item whose
 * intervals have run out is dropped, which is how the queue drains.
 */
export function useReviewQueue() {
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    get<ReviewItem[]>(REVIEW_KEY)
      .then((stored) => {
        if (cancelled) return;
        if (stored) setItems(stored);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
    return () => {
      cancelled = true;
    };
  }, []);

  const record = useCallback(
    (targetId: string, targetType: "exercise" | "problem", confidence: Confidence) => {
      setItems((current) => {
        const existing = current.find((item) => item.targetId === targetId);
        const next = schedule(
          { targetId, targetType, round: existing?.round ?? 0 },
          confidence,
        );
        const without = current.filter((item) => item.targetId !== targetId);
        const updated = next ? [...without, next] : without;
        void set(REVIEW_KEY, updated).catch(() => {});
        return updated;
      });
    },
    [],
  );

  return { items, record, loaded, due: dueItems(items) };
}

/**
 * Everything the browser is holding, as one object.
 *
 * Spec 20.10 lists losing progress as a real risk, and it is: this data lives
 * in one browser profile with no server copy, so clearing site data or moving
 * machine loses it. Export is the only backup that exists.
 */
export type Backup = {
  version: 1;
  exportedAt: string;
  attempts: Attempt[];
  review: ReviewItem[];
  drills: Record<string, string[]>;
  analysis: Record<string, Analysis>;
};

const DRILL_IDS = ["day0_python", "day1_toolkit"];

export async function exportProgress(): Promise<Backup> {
  const [attempts, review] = await Promise.all([
    get<Attempt[]>(ATTEMPTS_KEY),
    get<ReviewItem[]>(REVIEW_KEY),
  ]);

  const drills: Record<string, string[]> = {};
  for (const id of DRILL_IDS) {
    const solved = await get<string[]>(SOLVED_KEY(id));
    if (solved?.length) drills[id] = solved;
  }

  const analysis: Record<string, Analysis> = {};
  for (const key of await keys()) {
    if (typeof key === "string" && key.startsWith("analysis:")) {
      const value = await get<Analysis>(key);
      if (value) analysis[key.slice("analysis:".length)] = value;
    }
  }

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    attempts: attempts ?? [],
    review: review ?? [],
    drills,
    analysis,
  };
}

/**
 * Restore a backup, merging rather than replacing.
 *
 * Replacing would make importing an older file silently destroy newer work.
 * Attempts are merged by id, and the review queue keeps whichever entry is
 * further along, so importing twice is harmless.
 */
export async function importProgress(backup: Backup): Promise<void> {
  if (backup.version !== 1) {
    throw new Error(`Unsupported backup version: ${String(backup.version)}`);
  }

  const existingAttempts = (await get<Attempt[]>(ATTEMPTS_KEY)) ?? [];
  const byId = new Map(existingAttempts.map((attempt) => [attempt.id, attempt]));
  for (const attempt of backup.attempts) byId.set(attempt.id, attempt);
  await set(ATTEMPTS_KEY, [...byId.values()].sort((a, b) => a.timestamp - b.timestamp));

  const existingReview = (await get<ReviewItem[]>(REVIEW_KEY)) ?? [];
  const queue = new Map(existingReview.map((item) => [item.targetId, item]));
  for (const item of backup.review) {
    const current = queue.get(item.targetId);
    if (!current || item.round > current.round) queue.set(item.targetId, item);
  }
  await set(REVIEW_KEY, [...queue.values()]);

  for (const [id, solved] of Object.entries(backup.drills)) {
    const current = (await get<string[]>(SOLVED_KEY(id))) ?? [];
    await set(SOLVED_KEY(id), [...new Set([...current, ...solved])]);
  }

  for (const [slug, value] of Object.entries(backup.analysis)) {
    const current = (await get<Analysis>(ANALYSIS_KEY(slug))) ?? {};
    await set(ANALYSIS_KEY(slug), { ...current, ...value });
  }
}
