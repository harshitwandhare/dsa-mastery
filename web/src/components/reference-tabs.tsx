"use client";

import * as Tabs from "@radix-ui/react-tabs";
import type { ReactNode } from "react";

/**
 * Radix tabs, so arrow-key navigation and roving focus come for free rather
 * than being reimplemented with buttons and a state variable.
 */
export function ReferenceTabs({
  patterns,
  glossary,
  complexity,
}: {
  patterns: ReactNode;
  glossary: ReactNode;
  complexity: ReactNode;
}) {
  const trigger =
    "rounded-lg px-3.5 py-2 text-sm text-text-muted transition-colors hover:text-text data-[state=active]:bg-accent-soft data-[state=active]:text-accent";

  return (
    <Tabs.Root defaultValue="patterns">
      <Tabs.List
        aria-label="Reference sections"
        className="mb-6 flex flex-wrap gap-1 border-b border-border-subtle pb-2"
      >
        <Tabs.Trigger value="patterns" className={trigger}>
          Patterns
        </Tabs.Trigger>
        <Tabs.Trigger value="glossary" className={trigger}>
          Glossary
        </Tabs.Trigger>
        <Tabs.Trigger value="complexity" className={trigger}>
          Complexity
        </Tabs.Trigger>
      </Tabs.List>

      <Tabs.Content value="patterns">{patterns}</Tabs.Content>
      <Tabs.Content value="glossary">{glossary}</Tabs.Content>
      <Tabs.Content value="complexity">{complexity}</Tabs.Content>
    </Tabs.Root>
  );
}
