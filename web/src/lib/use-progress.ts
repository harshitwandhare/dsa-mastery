"use client";

import { del, get, set } from "idb-keyval";
import { useCallback, useEffect, useState } from "react";

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
