"use client";

import { del, get, set } from "idb-keyval";
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
