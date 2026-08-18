"use client";

import { useCallback, useEffect, useState } from "react";

import {
  currentStage,
  onStageChange,
  resetSession,
  runPython,
  warmUp,
  type RunResult,
  type RuntimeStage,
} from "@/lib/python-runtime";

const STAGE_LABEL: Record<RuntimeStage, string | null> = {
  idle: "Starting Python",
  downloading: "Downloading Python (about 10 MB, once)",
  preparing: "Preparing Python",
  ready: null,
};

/**
 * Shared wiring for anything that runs Python.
 *
 * Starts the download on mount so the first Run press is not the first time the
 * browser hears about a 10 MB payload.
 */
export function usePython(session = "default") {
  const [stage, setStage] = useState<RuntimeStage>(currentStage);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);

  useEffect(() => {
    warmUp();
    return onStageChange(setStage);
  }, []);

  const run = useCallback(
    async (code: string) => {
      setRunning(true);
      setResult(null);
      try {
        const outcome = await runPython(code, session);
        setResult(outcome);
        return outcome;
      } finally {
        setRunning(false);
      }
    },
    [session],
  );

  const reset = useCallback(() => {
    resetSession(session);
    setResult(null);
  }, [session]);

  return {
    run,
    reset,
    running,
    result,
    setResult,
    stage,
    /** Null once Python is ready, so callers can hide the loading note. */
    stageLabel: running ? STAGE_LABEL[stage] : null,
    ready: stage === "ready",
  };
}
