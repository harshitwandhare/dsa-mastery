/**
 * The page side of Python execution.
 *
 * One worker is shared by the whole tab, because Pyodide is a ~10 MB download
 * and paying for it per component would be absurd. Runs are queued so two Run
 * buttons cannot interleave their output.
 *
 * The important guarantee: a run that exceeds the timeout kills the worker.
 * Nothing else can stop Python once it has entered a loop, so the timeout is
 * enforced here rather than inside the worker, and the next run transparently
 * starts a fresh one.
 */

export const RUN_TIMEOUT_MS = 10_000;

export type OutputChunk = {
  stream: "stdout" | "stderr";
  text: string;
};

export type RunResult = {
  ok: boolean;
  output: OutputChunk[];
  /** Python's own traceback, unmodified. Empty when the run succeeded. */
  traceback: string;
  ms: number;
  timedOut: boolean;
};

export type RuntimeStage = "idle" | "downloading" | "preparing" | "ready";

/**
 * The outcome of grading one drill exercise.
 *
 * The three statuses mirror what the CLI runner distinguishes: an untouched
 * stub is "todo" rather than a failure, a raised exception is "error", and a
 * completed call is "ran" and compared against the expected value.
 */
export type Verdict = {
  status: "ran" | "todo" | "error" | "code-error";
  passed?: boolean;
  got?: string;
  expected?: string;
  traceback?: string;
  stdout?: string;
  ms: number;
};

export type GradeRequest = {
  /** What the learner wrote. */
  code: string;
  /** Helper definitions the assertion needs, from the pipeline. */
  support: string;
  /** Expression producing the answer. */
  call: string;
  /** Expression producing what the answer should be. */
  expected: string;
};

type StageListener = (stage: RuntimeStage) => void;

type PendingRun = {
  kind: "run";
  code: string;
  session: string;
  resolve: (result: RunResult) => void;
};

type PendingGrade = {
  kind: "grade";
  payload: GradeRequest;
  resolve: (verdict: Verdict) => void;
};

type Pending = PendingRun | PendingGrade;

let worker: Worker | null = null;
let stage: RuntimeStage = "idle";
const stageListeners = new Set<StageListener>();

let queue: Pending[] = [];
let active: {
  id: number;
  pending: Pending;
  output: OutputChunk[];
  timer: ReturnType<typeof setTimeout>;
  startedAt: number;
} | null = null;
let nextId = 1;

function setStage(next: RuntimeStage) {
  stage = next;
  for (const listener of stageListeners) listener(next);
}

export function onStageChange(listener: StageListener): () => void {
  stageListeners.add(listener);
  listener(stage);
  return () => stageListeners.delete(listener);
}

export function currentStage(): RuntimeStage {
  return stage;
}

function handleMessage(event: MessageEvent) {
  const data = event.data as Record<string, unknown>;

  if (data.type === "status") {
    setStage(data.stage as RuntimeStage);
    return;
  }

  if (data.type === "output" && active && data.id === active.id) {
    active.output.push({
      stream: data.stream as "stdout" | "stderr",
      text: String(data.text),
    });
    return;
  }

  if (data.type === "done" && active && data.id === active.id) {
    const finished = active;
    clearTimeout(finished.timer);
    active = null;
    if (finished.pending.kind === "run") {
      finished.pending.resolve({
        ok: Boolean(data.ok),
        output: finished.output,
        traceback: data.ok ? "" : String(data.traceback ?? ""),
        ms: Number(data.ms ?? 0),
        timedOut: false,
      });
    }
    drain();
    return;
  }

  if (data.type === "graded" && active && data.id === active.id) {
    const finished = active;
    clearTimeout(finished.timer);
    active = null;
    if (finished.pending.kind === "grade") {
      finished.pending.resolve({
        status: data.status as Verdict["status"],
        passed: data.passed as boolean | undefined,
        got: data.got as string | undefined,
        expected: data.expected as string | undefined,
        traceback: data.traceback as string | undefined,
        stdout: data.stdout as string | undefined,
        ms: Number(data.ms ?? 0),
      });
    }
    drain();
  }
}

function ensureWorker(): Worker {
  if (worker) return worker;
  worker = new Worker("/python-worker.js");
  worker.onmessage = handleMessage;
  return worker;
}

/**
 * Start downloading Pyodide before anything needs it.
 *
 * Called when a page with runnable code mounts, so the first Run press does not
 * sit through the whole download.
 */
export function warmUp(): void {
  if (stage !== "idle") return;
  ensureWorker().postMessage({ type: "warmup" });
}

/** Kill the worker mid-run. The only way to stop a runaway loop. */
function terminate() {
  worker?.terminate();
  worker = null;
  setStage("idle");
}

/** Resolve a queued item with whatever "it was stopped" means for its kind. */
function cancel(pending: Pending, traceback: string, ms: number) {
  if (pending.kind === "run") {
    pending.resolve({ ok: false, output: [], traceback, ms, timedOut: true });
  } else {
    pending.resolve({ status: "error", traceback, ms });
  }
}

function drain() {
  if (active || queue.length === 0) return;

  const next = queue.shift();
  if (!next) return;

  const id = nextId++;
  const instance = ensureWorker();

  active = {
    id,
    pending: next,
    output: [],
    startedAt: Date.now(),
    timer: setTimeout(() => {
      const timedOut = active;
      active = null;
      terminate();
      if (timedOut) {
        cancel(
          timedOut.pending,
          `Stopped after ${RUN_TIMEOUT_MS / 1000} seconds.\n\n` +
            "Python was still running, so it was cut off. This almost always means\n" +
            "a loop that never reaches its stopping condition. Check that whatever\n" +
            "the loop tests actually changes inside the loop.",
          RUN_TIMEOUT_MS,
        );
      }
      // Anything queued behind a runaway run is abandoned rather than silently
      // executed against a worker that no longer exists.
      const abandoned = queue;
      queue = [];
      for (const pending of abandoned) {
        cancel(pending, "Cancelled: an earlier run had to be stopped.", 0);
      }
    }, RUN_TIMEOUT_MS),
  };

  if (next.kind === "run") {
    instance.postMessage({ type: "run", id, code: next.code, session: next.session });
  } else {
    instance.postMessage({ type: "grade", id, payload: next.payload });
  }
}

/**
 * Run a snippet inside a named session.
 *
 * Blocks sharing a session see each other's definitions, which is what lets a
 * lesson import a name in one block and use it in the next. Pass a different
 * session to get an isolated namespace.
 */
export function runPython(code: string, session = "default"): Promise<RunResult> {
  return new Promise<RunResult>((resolve) => {
    queue.push({ kind: "run", code, session, resolve });
    drain();
  });
}

/** Forget everything a session has defined, without reloading Python. */
export function resetSession(session: string): void {
  worker?.postMessage({ type: "reset", session });
}

/**
 * Grade one drill exercise against its hidden assertion.
 *
 * Each call runs in a throwaway namespace, so a name defined while solving one
 * exercise cannot make a later one pass.
 */
export function gradeExercise(payload: GradeRequest): Promise<Verdict> {
  return new Promise<Verdict>((resolve) => {
    queue.push({ kind: "grade", payload, resolve });
    drain();
  });
}
