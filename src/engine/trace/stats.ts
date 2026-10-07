import type { Trace } from './types.js';

/** Nearest-rank percentile over valid (non-null) values: sort ascending,
 *  take the value at 1-based rank ceil(p/100 × N). N = 10,080 → P90 rank
 *  9,072, P95 rank 9,576. Returns null for an empty series. */
export function nearestRankPercentile(values: number[], p: number): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const rank = Math.ceil((p / 100) * sorted.length);
  return sorted[Math.min(rank, sorted.length) - 1];
}

export interface WeeklySummary {
  count: number;
  mean: number | null;
  p90: number | null;
  p95: number | null;
  max: number | null;
}

/** Weekly mean/P90/P95/max over valid minute values; nulls are excluded, never
 *  filled with zero. */
export function weeklySummary(series: (number | null)[]): WeeklySummary {
  const valid = series.filter((v): v is number => v !== null);
  const count = valid.length;
  if (count === 0) return { count: 0, mean: null, p90: null, p95: null, max: null };
  const mean = valid.reduce((a, b) => a + b, 0) / count;
  return {
    count,
    mean,
    p90: nearestRankPercentile(valid, 90),
    p95: nearestRankPercentile(valid, 95),
    max: Math.max(...valid),
  };
}

export interface ExceedanceRun {
  startIndex: number;
  length: number;
}

export interface Exceedance {
  minutes: number;
  validMinutes: number;
  fractionOfValidMinutes: number;
  longestRunMinutes: number;
  runCount: number;
  runs: ExceedanceRun[];
}

/** Minutes where value > budget (strict — equality is within budget). null
 *  (missing or unknown) breaks a run and is never counted. */
export function exceedance(series: (number | null)[], budget: number): Exceedance {
  const runs: ExceedanceRun[] = [];
  let minutes = 0;
  let valid = 0;
  let runStart = -1;
  for (let i = 0; i <= series.length; i++) {
    const v = i < series.length ? series[i] : null;
    if (v !== null) valid++;
    const over = v !== null && v > budget;
    if (over) {
      minutes++;
      if (runStart === -1) runStart = i;
    } else if (runStart !== -1) {
      runs.push({ startIndex: runStart, length: i - runStart });
      runStart = -1;
    }
  }
  return {
    minutes,
    validMinutes: valid,
    fractionOfValidMinutes: valid === 0 ? 0 : minutes / valid,
    longestRunMinutes: runs.reduce((m, r) => Math.max(m, r.length), 0),
    runCount: runs.length,
    runs,
  };
}

export interface Coverage {
  total: number;
  valid: number;
  fraction: number;
}

/** Coverage of observed (non-missing) records. Missing intervals remain
 *  unknown and reduce coverage; they are never zero-filled. */
export function coverage(trace: Trace): Coverage {
  const valid = trace.records.filter((r) => !r.missing).length;
  return { total: trace.records.length, valid, fraction: valid / trace.records.length };
}
