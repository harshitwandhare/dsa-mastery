"use client";

import { useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { usePython } from "@/components/use-python";

/**
 * The complexity visualiser.
 *
 * A port of `practice/dsa/bench.py` that runs in the browser. It times the same
 * pairs on real data at growing sizes and plots the result, because seeing
 * O(n²) peel away from O(n) is more convincing than being told the ratio
 * quadruples. The numbers are measured on the reader's own machine, not
 * precomputed, so they are honest about what their hardware actually does.
 */

type Benchmark = {
  id: string;
  title: string;
  blurb: string;
  sizes: number[];
  /** Python producing `slow` and `fast` callables plus a `make(n)` for inputs. */
  setup: string;
};

const BENCHMARKS: Benchmark[] = [
  {
    id: "membership",
    title: "`x in list` against `x in set`",
    blurb:
      "A list has to walk every element; a set hashes straight to the answer. This is the single most common accidental O(n²) in interview code.",
    sizes: [20000, 40000, 80000, 160000],
    setup: `
def make(n):
    return list(range(n)), set(range(n))

def slow(data):
    nums, _ = data
    return -1 in nums

def fast(data):
    _, seen = data
    return -1 in seen
`,
  },
  {
    id: "concat",
    title: "String `+=` against `join`",
    blurb:
      "Strings are immutable, so `+=` copies the whole thing every time. Building with a list and joining once does the copy a single time.",
    sizes: [4000, 8000, 16000, 32000],
    setup: `
def make(n):
    return n

def slow(n):
    s = ""
    for _ in range(n):
        s += "x"
    return len(s)

def fast(n):
    parts = []
    for _ in range(n):
        parts.append("x")
    return len("".join(parts))
`,
  },
  {
    id: "twosum",
    title: "Two Sum: brute force against a hash map",
    blurb:
      "Every pair, against one pass that remembers what it has seen. The same answer, a different order of growth.",
    sizes: [500, 1000, 2000, 4000],
    setup: `
def make(n):
    nums = list(range(n))
    return nums, nums[-1] + nums[-2]

def slow(data):
    nums, target = data
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]
    return []

def fast(data):
    nums, target = data
    seen = {}
    for i, x in enumerate(nums):
        if target - x in seen:
            return [seen[target - x], i]
        seen[x] = i
    return []
`,
  },
];

/**
 * Time both implementations at each size and print the table as JSON.
 *
 * Each measurement repeats until it has spent a few milliseconds, then divides.
 * A single set lookup finishes far below the clock's resolution, so timing it
 * once produced a column of zeros and a growth ratio of 0.0x, which is worse
 * than useless: it makes the fast version look broken rather than fast.
 */
function programFor(benchmark: Benchmark): string {
  return `
import json, time
${benchmark.setup}

def measure(fn, data, budget=0.02):
    """Milliseconds for one call, averaged over enough calls to be measurable."""
    reps = 1
    while True:
        start = time.perf_counter()
        for _ in range(reps):
            fn(data)
        elapsed = time.perf_counter() - start
        if elapsed >= budget or reps >= 1_000_000:
            return (elapsed / reps) * 1000
        # Grow toward the budget rather than doubling blindly, so an expensive
        # function is not run thousands of times to find that out.
        factor = max(2, min(10, int(budget / elapsed) + 1)) if elapsed > 0 else 10
        reps *= factor

rows = []
for n in ${JSON.stringify(benchmark.sizes)}:
    data = make(n)
    rows.append({
        "n": n,
        "slow": round(measure(slow, data), 4),
        "fast": round(measure(fast, data), 4),
    })

print(json.dumps(rows))
`;
}

type Row = { n: number; slow: number; fast: number };

const AXIS = {
  stroke: "var(--text-faint)",
  fontSize: 12,
  tickLine: false,
  axisLine: false,
};

export function ComplexityVisualiser() {
  const [selected, setSelected] = useState(BENCHMARKS[0]);
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { run, running, stageLabel } = usePython("bench");

  async function measure(benchmark: Benchmark) {
    setSelected(benchmark);
    setRows([]);
    setError(null);

    const result = await run(programFor(benchmark));
    if (!result.ok) {
      setError(result.traceback || "The benchmark did not finish.");
      return;
    }
    const printed = result.output
      .filter((chunk) => chunk.stream === "stdout")
      .map((chunk) => chunk.text)
      .join("")
      .trim();
    try {
      setRows(JSON.parse(printed) as Row[]);
    } catch {
      setError(`Could not read the timings back:\n${printed}`);
    }
  }

  // How much worse the slow version got, relative to how much bigger n got.
  const growth = (() => {
    if (rows.length < 2) return null;
    const first = rows[0];
    const last = rows[rows.length - 1];
    // A baseline at or below the clock's resolution cannot be divided into
    // anything meaningful, so say so rather than printing a ratio of zero.
    const factor = (start: number, end: number) =>
      start > 0.0001 ? end / start : null;
    return {
      sizeFactor: last.n / first.n,
      slowFactor: factor(first.slow, last.slow),
      fastFactor: factor(first.fast, last.fast),
    };
  })();

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {BENCHMARKS.map((benchmark) => (
          <button
            key={benchmark.id}
            type="button"
            onClick={() => measure(benchmark)}
            disabled={running}
            aria-pressed={selected.id === benchmark.id}
            className={`rounded-lg border px-3 py-1.5 text-sm transition-colors disabled:opacity-60 ${
              selected.id === benchmark.id
                ? "border-accent-line bg-accent-soft text-accent"
                : "border-border-subtle text-text-muted hover:text-text"
            }`}
          >
            {benchmark.title.replace(/`/g, "")}
          </button>
        ))}
      </div>

      <p className="mt-4 max-w-2xl text-[0.9375rem] leading-relaxed text-text-muted">
        {selected.blurb}
      </p>

      <button
        type="button"
        onClick={() => measure(selected)}
        disabled={running}
        className="mt-4 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-on-accent transition-colors hover:bg-accent-strong disabled:opacity-60"
      >
        {running ? (stageLabel ?? "Measuring") : "Measure it"}
      </button>

      {error && (
        <pre className="mt-4 overflow-x-auto whitespace-pre-wrap rounded-lg border border-fail bg-fail-soft p-3 font-mono text-sm text-fail">
          {error}
        </pre>
      )}

      {rows.length > 0 && (
        <>
          <div className="mt-6 h-72 rounded-xl border border-border-subtle bg-bg-raised p-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rows}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="n"
                  {...AXIS}
                  label={{
                    value: "n",
                    position: "insideBottomRight",
                    fill: "var(--text-faint)",
                    fontSize: 12,
                  }}
                />
                <YAxis
                  {...AXIS}
                  label={{
                    value: "ms",
                    angle: -90,
                    position: "insideLeft",
                    fill: "var(--text-faint)",
                    fontSize: 12,
                  }}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--bg-raised)",
                    border: "1px solid var(--border-strong)",
                    borderRadius: 8,
                    color: "var(--text)",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line
                  type="monotone"
                  dataKey="slow"
                  name="the slow one"
                  stroke="var(--fail)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="fast"
                  name="the fast one"
                  stroke="var(--pass)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {growth && (
            <p className="mt-3 text-sm leading-relaxed text-text-muted">
              Over this run, <strong>n grew {growth.sizeFactor.toFixed(0)}×</strong>.
              The slow version got{" "}
              <strong className="text-fail">
                {growth.slowFactor === null
                  ? "too little to measure"
                  : `${growth.slowFactor.toFixed(1)}× slower`}
              </strong>{" "}
              and the fast one{" "}
              <strong className="text-pass">
                {growth.fastFactor === null
                  ? "stayed too fast to time"
                  : `${growth.fastFactor.toFixed(1)}×`}
              </strong>
              . A ratio near the size factor is linear; markedly above it is not.
            </p>
          )}

          <div className="mt-4 overflow-x-auto rounded-xl border border-border-subtle">
            <table className="w-full text-sm">
              <thead className="bg-bg-inset">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">n</th>
                  <th className="px-3 py-2 text-right font-medium">slow (ms)</th>
                  <th className="px-3 py-2 text-right font-medium">fast (ms)</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                {rows.map((row) => (
                  <tr key={row.n} className="border-t border-border-subtle">
                    <td className="px-3 py-2">{row.n.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right text-fail">{row.slow}</td>
                    <td className="px-3 py-2 text-right text-pass">{row.fast}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-3 text-xs text-text-faint">
            Measured on your machine, in this tab, just now. Absolute numbers will
            differ from a native Python run; the shape of the curves will not.
          </p>
        </>
      )}
    </div>
  );
}
