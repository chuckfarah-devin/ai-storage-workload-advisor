import type { DerivedMinute, Trace, TraceRecord } from './types.js';
import { MINUTES_PER_DAY } from './schedule.js';

/** The 24-hour detail window: exactly 1,440 minute records for dayIndex 0–6. */
export function extractDay(trace: Trace, dayIndex: number): TraceRecord[] {
  if (dayIndex < 0 || dayIndex > 6) {
    throw new Error(`dayIndex ${dayIndex} out of range (0–6)`);
  }
  return trace.records.slice(dayIndex * MINUTES_PER_DAY, (dayIndex + 1) * MINUTES_PER_DAY);
}

export interface BucketStats {
  frontendIops: number | null;
  backendOps: number | null;
  throughputBytesPerSecond: number | null;
}

export interface Bucket {
  startIndex: number;
  timestampUtc: string;
  validMinutes: number;
  /** duration-weighted mean rates over valid/computable minutes only */
  mean: BucketStats;
  /** per-metric minute maxima (different metrics may peak in different minutes) */
  max: BucketStats;
  minutesAboveBudget: { frontendIops: number; backendOps: number; throughput: number };
  /** minutes whose backend estimate was unknown (block-size inapplicability, missing fields) */
  unknownMinutes: number;
  usedCapacityEndBytes: number | null;
}

export interface BucketBudgets {
  frontendIops: number;
  /** null when the profile declares no backend operation limit — the backend
   *  is then unknown for every minute and never exceeds a budget. */
  backendOps: number | null;
  throughputBytesPerSecond: number;
}

function statsOf(
  values: (number | null)[],
): { mean: number | null; max: number | null } {
  const valid = values.filter((v): v is number => v !== null);
  if (valid.length === 0) return { mean: null, max: null };
  return {
    mean: valid.reduce((a, b) => a + b, 0) / valid.length,
    max: Math.max(...valid),
  };
}

/** Aggregate the minute trace into nonoverlapping buckets (1,008 × 10 min for
 *  the weekly view). Means are over valid minutes only; backend means/maxima
 *  use only minutes with a computable estimate. Rates are never summed. */
export function bucketize(
  trace: Trace,
  derived: DerivedMinute[],
  budgets: BucketBudgets,
  bucketMinutes = 10,
): Bucket[] {
  const buckets: Bucket[] = [];
  for (let start = 0; start < trace.records.length; start += bucketMinutes) {
    const recs = trace.records.slice(start, start + bucketMinutes);
    const der = derived.slice(start, start + bucketMinutes);
    const fe = der.map((d) => d.frontendIops);
    const thr = der.map((d) => d.throughputBytesPerSecond);
    const be = der.map((d) =>
      d.backend !== null && d.backend.kind === 'computed' ? d.backend.combinedTotal : null,
    );
    const feS = statsOf(fe);
    const thrS = statsOf(thr);
    const beS = statsOf(be);
    const validCap = recs.filter((r) => r.usedCapacityBytes !== null);
    buckets.push({
      startIndex: start,
      timestampUtc: recs[0].timestampUtc,
      validMinutes: recs.filter((r) => !r.missing).length,
      mean: {
        frontendIops: feS.mean,
        backendOps: beS.mean,
        throughputBytesPerSecond: thrS.mean,
      },
      max: {
        frontendIops: feS.max,
        backendOps: beS.max,
        throughputBytesPerSecond: thrS.max,
      },
      minutesAboveBudget: {
        frontendIops: fe.filter((v) => v !== null && v > budgets.frontendIops).length,
        backendOps:
          budgets.backendOps === null
            ? 0
            : be.filter((v) => v !== null && v > (budgets.backendOps as number)).length,
        throughput: thr.filter((v) => v !== null && v > budgets.throughputBytesPerSecond).length,
      },
      unknownMinutes: der.filter(
        (d, i) => !recs[i].missing && (d.backend === null || d.backend.kind === 'unknown'),
      ).length,
      usedCapacityEndBytes:
        validCap.length === 0 ? null : validCap[validCap.length - 1].usedCapacityBytes,
    });
  }
  return buckets;
}
