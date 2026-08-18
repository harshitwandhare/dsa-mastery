"use client";

import { useState } from "react";

import { CodeEditor } from "@/components/code-editor";
import { PythonOutput } from "@/components/python-output";
import { usePython } from "@/components/use-python";

type Props = {
  /** The Python source, as written in the lesson. */
  code: string;
  /** The server-highlighted markup for that same source. */
  html: string;
  /** Lesson slug. Blocks on a page share one namespace, like notebook cells. */
  session: string;
};

/**
 * A lesson code block that can be run and edited.
 *
 * Reading is the default state: the block renders as the server-highlighted
 * markup until the reader actually wants to change something, at which point an
 * editor replaces it. That keeps a lesson with twenty code blocks from mounting
 * twenty CodeMirror instances nobody asked for.
 */
export function RunnableBlock({ code, html, session }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(code);
  const { run, running, result, setResult, stageLabel } = usePython(session);

  const edited = draft !== code;

  async function handleRun() {
    await run(editing || edited ? draft : code);
  }

  function reset() {
    setDraft(code);
    setEditing(false);
    setResult(null);
  }

  return (
    <div>
      {editing ? (
        <CodeEditor
          value={draft}
          onChange={setDraft}
          onRun={handleRun}
          minHeight="8rem"
          ariaLabel="Editable copy of this lesson example"
        />
      ) : (
        <div dangerouslySetInnerHTML={{ __html: html }} />
      )}

      <div className="not-prose mt-2 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleRun}
          disabled={running}
          className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-[#08130d] transition-colors hover:bg-accent-strong disabled:opacity-60"
        >
          {running ? "Running" : "Run"}
        </button>

        {!editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded-md border border-border-strong px-3 py-1.5 text-sm text-text-muted transition-colors hover:text-text"
          >
            Edit
          </button>
        )}

        {(editing || edited) && (
          <button
            type="button"
            onClick={reset}
            className="rounded-md px-2 py-1.5 text-sm text-text-faint transition-colors hover:text-text"
          >
            Reset
          </button>
        )}

        {editing && (
          <span className="font-mono text-xs text-text-faint">
            Ctrl/Cmd + Enter to run
          </span>
        )}
      </div>

      {(running || result) && (
        <div className="not-prose mt-2">
          <PythonOutput result={result} running={running} stageLabel={stageLabel} />
        </div>
      )}
    </div>
  );
}
