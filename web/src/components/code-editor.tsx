"use client";

import { python } from "@codemirror/lang-python";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { EditorState } from "@codemirror/state";
import { EditorView, keymap, lineNumbers, placeholder as placeholderExt } from "@codemirror/view";
import { oneDark } from "@codemirror/theme-one-dark";
import { useEffect, useRef } from "react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  /** Fired on Cmd/Ctrl+Enter. Spec 20.9 makes this the primary run gesture. */
  onRun?: () => void;
  placeholder?: string;
  minHeight?: string;
  ariaLabel: string;
};

/**
 * A small CodeMirror 6 wrapper.
 *
 * The editor is created once and kept; `value` is only pushed back in when it
 * differs from what the editor already holds, so external resets (Reset to
 * starter code) work without the cursor jumping on every keystroke.
 */
export function CodeEditor({
  value,
  onChange,
  onRun,
  placeholder,
  minHeight = "12rem",
  ariaLabel,
}: Props) {
  const host = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | null>(null);

  // Kept in refs so the editor never has to be torn down when a handler
  // identity changes between renders. Assigned in an effect rather than during
  // render, because a render can be discarded and must not have side effects.
  const changeRef = useRef(onChange);
  const runRef = useRef(onRun);

  useEffect(() => {
    changeRef.current = onChange;
    runRef.current = onRun;
  });

  useEffect(() => {
    if (!host.current || view.current) return;

    const extensions = [
      lineNumbers(),
      history(),
      python(),
      oneDark,
      keymap.of([
        {
          key: "Mod-Enter",
          preventDefault: true,
          run: () => {
            runRef.current?.();
            return true;
          },
        },
        indentWithTab,
        ...defaultKeymap,
        ...historyKeymap,
      ]),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) changeRef.current(update.state.doc.toString());
      }),
      EditorView.theme({
        "&": { fontSize: "0.875rem", minHeight },
        "&.cm-focused": { outline: "none" },
        ".cm-scroller": {
          fontFamily: "var(--font-mono-stack), ui-monospace, monospace",
          lineHeight: "1.65",
        },
        ".cm-content": { padding: "0.75rem 0" },
      }),
      EditorView.contentAttributes.of({ "aria-label": ariaLabel }),
    ];

    if (placeholder) extensions.push(placeholderExt(placeholder));

    view.current = new EditorView({
      state: EditorState.create({ doc: value, extensions }),
      parent: host.current,
    });

    return () => {
      view.current?.destroy();
      view.current = null;
    };
    // Created once on mount; later prop changes are handled below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const instance = view.current;
    if (!instance) return;
    const current = instance.state.doc.toString();
    if (current === value) return;
    instance.dispatch({
      changes: { from: 0, to: current.length, insert: value },
    });
  }, [value]);

  return (
    <div
      ref={host}
      className="overflow-hidden rounded-lg border border-border-subtle bg-bg-inset"
    />
  );
}
