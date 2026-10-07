import type { BucketBudgets } from './aggregate.js';
import type { DerivedMinute, Trace } from './types.js';
import { exceedance } from './stats.js';
import { MINUTES_PER_DAY } from './schedule.js';

export interface DaySelection {
  dayIndex: number;
  reason: string;
}

interface ResourceSeries {
  name: string;
  budget: number;
  values: (number | null)[];
}

function ts(trace: Trace, index: number): string {
  return trace.records[index].timestampUtc.replace(/\.000Z$/, 'Z');
}

const num = (v: number | null): string => String(Math.round((v ?? 0) * 100) / 100);

/**
 * R-DAY-1 default detail day. The earliest day containing the start of the
 * longest continuous exceedance across the modeled performance resources; a
 * run crossing midnight belongs to the day of its first minute, and
 * equal-length runs resolve to the earliest start. If nothing exceeds, the day
 * containing the earliest minute that achieves the week's highest
 * budget-utilization ratio across resources.
 */
export function selectDefaultDay(
  trace: Trace,
  derived: DerivedMinute[],
  budgets: BucketBudgets,
): DaySelection {
  const resources: ResourceSeries[] = [
    {
      name: 'front-end IOPS',
      budget: budgets.frontendIops,
      values: derived.map((d) => d.frontendIops),
    },
    {
      name: 'backend operations',
      // With no declared backend limit the estimate is unknown for selection
      // purposes: no exceedance and no utilization ratio can be computed.
      budget: budgets.backendOps ?? 1,
      values:
        budgets.backendOps === null
          ? derived.map(() => null)
          : derived.map((d) =>
              d.backend !== null && d.backend.kind === 'computed' ? d.backend.combinedTotal : null,
            ),
    },
    {
      name: 'throughput',
      budget: budgets.throughputBytesPerSecond,
      values: derived.map((d) => d.throughputBytesPerSecond),
    },
  ];

  // Longest exceedance run across resources; ties → earliest start.
  let bestRun: { resource: string; startIndex: number; length: number } | null = null;
  for (const r of resources) {
    const ex = exceedance(r.values, r.budget);
    for (const run of ex.runs) {
      if (
        bestRun === null ||
        run.length > bestRun.length ||
        (run.length === bestRun.length && run.startIndex < bestRun.startIndex)
      ) {
        bestRun = { resource: r.name, startIndex: run.startIndex, length: run.length };
      }
    }
  }
  if (bestRun !== null) {
    const dayIndex = Math.floor(bestRun.startIndex / MINUTES_PER_DAY);
    const value = resources.find((r) => r.name === bestRun!.resource)!.values[bestRun.startIndex];
    const budget = resources.find((r) => r.name === bestRun!.resource)!.budget;
    return {
      dayIndex,
      reason:
        `longest exceedance run: ${bestRun.resource} ${num(value)} vs budget ${num(budget)} ` +
        `at ${ts(trace, bestRun.startIndex)} (run length ${bestRun.length} min)`,
    };
  }

  // No exceedance anywhere: day of the earliest minute with the highest
  // budget-utilization ratio across resources.
  let best: { resource: string; index: number; ratio: number } | null = null;
  for (const r of resources) {
    r.values.forEach((v, i) => {
      if (v === null) return;
      const ratio = v / r.budget;
      if (best === null || ratio > best.ratio || (ratio === best.ratio && i < best.index)) {
        best = { resource: r.name, index: i, ratio };
      }
    });
  }
  if (best === null) {
    return { dayIndex: 0, reason: 'no valid minutes in the week; defaulting to day 0' };
  }
  const b = best as { resource: string; index: number; ratio: number };
  const res = resources.find((r) => r.name === b.resource)!;
  return {
    dayIndex: Math.floor(b.index / MINUTES_PER_DAY),
    reason:
      `no budget exceedance; highest utilization ratio minute: ${b.resource} ` +
      `${num(res.values[b.index])} vs budget ${num(res.budget)} (${(b.ratio * 100).toFixed(1)}% of budget) ` +
      `at ${ts(trace, b.index)}`,
  };
}
