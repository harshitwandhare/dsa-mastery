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

type StageListener = (stage: RuntimeStage) => void;

type PendingRun = {
  code: string;
  session: string;
  resolve: (result: RunResult) => void;
};

let worker: Worker | null = null;
let stage: RuntimeStage = "idle";
const stageListeners = new Set<StageListener>();

let queue: PendingRun[] = [];
let active: {
  id: number;
  resolve: (result: RunResult) => void;
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
    clearTimeout(active.timer);
    const finished = active;
    active = null;
    finished.resolve({
      ok: Boolean(data.ok),
      output: finished.output,
      traceback: data.ok ? "" : String(data.traceback ?? ""),
      ms: Number(data.ms ?? 0),
      timedOut: false,
    });
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

function drain() {
  if (active || queue.length === 0) return;

  const next = queue.shift();
  if (!next) return;

  const id = nextId++;
  const instance = ensureWorker();

  active = {
    id,
    resolve: next.resolve,
    output: [],
    startedAt: Date.now(),
    timer: setTimeout(() => {
      const timedOut = active;
      active = null;
      terminate();
      timedOut?.resolve({
        ok: false,
        output: timedOut.output,
        traceback:
          `Stopped after ${RUN_TIMEOUT_MS / 1000} seconds.\n\n` +
          "Python was still running, so it was cut off. This almost always means\n" +
          "a loop that never reaches its stopping condition. Check that whatever\n" +
          "the loop tests actually changes inside the loop.",
        ms: RUN_TIMEOUT_MS,
        timedOut: true,
      });
      // Anything queued behind a runaway run is abandoned rather than silently
      // executed against a worker that no longer exists.
      const abandoned = queue;
      queue = [];
      for (const pending of abandoned) {
        pending.resolve({
          ok: false,
          output: [],
          traceback: "Cancelled: an earlier run had to be stopped.",
          ms: 0,
          timedOut: true,
        });
      }
    }, RUN_TIMEOUT_MS),
  };

  instance.postMessage({ type: "run", id, code: next.code, session: next.session });
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
    queue.push({ code, session, resolve });
    drain();
  });
}

/** Forget everything a session has defined, without reloading Python. */
export function resetSession(session: string): void {
  worker?.postMessage({ type: "reset", session });
}
