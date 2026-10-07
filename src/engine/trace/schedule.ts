// Schedule resolution over a cyclic 7-day week of 10,080 minutes (day 0 = Monday).
import type { ScheduleRow, ValidationDiagnostic, ValidationResult } from '../model.js';

export const MINUTES_PER_WEEK = 10080;
export const MINUTES_PER_DAY = 1440;

const DAY_INDEX: Record<string, number> = {
  mon: 0, tue: 1, wed: 2, thu: 3, fri: 4, sat: 5, sun: 6,
};

type DayClass = 'named' | 'weekday' | 'weekend' | 'daily';

function dayClass(days: string): { cls: DayClass; days: Set<number> } | null {
  const d = days.trim().toLowerCase();
  if (d === 'daily') return { cls: 'daily', days: new Set([0, 1, 2, 3, 4, 5, 6]) };
  if (d === 'weekday') return { cls: 'weekday', days: new Set([0, 1, 2, 3, 4]) };
  if (d === 'weekend') return { cls: 'weekend', days: new Set([5, 6]) };
  if (d in DAY_INDEX) return { cls: 'named', days: new Set([DAY_INDEX[d]]) };
  return null;
}

function parseHHMM(s: string): number | null {
  const m = /^(\d{2}):(\d{2})$/.exec(s);
  if (!m) return null;
  const v = Number(m[1]) * 60 + Number(m[2]);
  return v >= 0 && v <= 1440 ? v : null;
}

interface CompiledRow {
  row: ScheduleRow;
  cls: DayClass;
  daySet: Set<number>;
  start: number; // minute-of-day
  end: number; // minute-of-day
  /** true when the interval wraps past midnight into the following day */
  wraps: boolean;
  length: number; // window length in minutes
}

function compile(row: ScheduleRow): CompiledRow | { error: string } {
  const dc = dayClass(row.days);
  if (dc === null) return { error: `unknown days vocabulary '${row.days}'` };
  const start = parseHHMM(row.start);
  const end = parseHHMM(row.end);
  if (start === null || end === null) return { error: `bad HH:MM '${row.start}'/'${row.end}'` };
  const length = end > start ? end - start : 1440 - start + end;
  if (length <= 0 || length > 1440) return { error: `empty or over-long window '${row.start}'-'${row.end}'` };
  return { row, cls: dc.cls, daySet: dc.days, start, end, wraps: end <= start, length };
}

/** Rank for overlap specificity: named day > weekday/weekend > daily. */
function specificity(c: CompiledRow): number {
  return c.cls === 'named' ? 3 : c.cls === 'daily' ? 1 : 2;
}

/**
 * Offset in minutes from a row's window start for minute-of-week `m`, or null
 * when the row does not cover `m`. The week is cyclic: a window with
 * end <= start spans midnight into the following day (Sunday wraps to Monday).
 */
function minuteOffset(c: CompiledRow, m: number): number | null {
  const day = Math.floor(m / MINUTES_PER_DAY);
  const minuteOfDay = m % MINUTES_PER_DAY;
  // m falls inside the window on a start-day (for non-wrapping windows,
  // offset < length is equivalent to minuteOfDay < end).
  if (c.daySet.has(day) && minuteOfDay >= c.start) {
    const off = minuteOfDay - c.start;
    if (off < c.length) return off;
  }
  // m falls inside the wrapped tail on the following day.
  if (c.wraps && c.daySet.has((day + 6) % 7) && minuteOfDay < c.end) {
    return MINUTES_PER_DAY - c.start + minuteOfDay;
  }
  return null;
}

export interface ResolvedRow {
  row: ScheduleRow;
  /** minutes elapsed since this row's window started (for ramp interpolation) */
  offsetMinutes: number;
  windowMinutes: number;
}

export class ScheduleResolutionError extends Error {}

/** Resolve the row covering minuteOfWeek ∈ [0, 10080). Most specific match wins:
 *  (1) named day > weekday/weekend > daily; (2) the shorter window.
 *  A tie on both criteria throws ScheduleResolutionError naming the rows. */
export function resolveSchedule(rows: ScheduleRow[], minuteOfWeek: number): ResolvedRow | null {
  const compiled: (CompiledRow & { offset: number })[] = [];
  for (const row of rows) {
    const c = compile(row);
    if ('error' in c) throw new ScheduleResolutionError(`schedule row ${JSON.stringify(row.name ?? row.days)}: ${c.error}`);
    const offset = minuteOffset(c, minuteOfWeek);
    if (offset !== null) compiled.push({ ...c, offset });
  }
  if (compiled.length === 0) return null;
  let best = compiled[0];
  const tied: string[] = [];
  for (const c of compiled.slice(1)) {
    const sC = specificity(c);
    const sB = specificity(best);
    if (sC > sB || (sC === sB && c.length < best.length)) {
      best = c;
      tied.length = 0;
    } else if (sC === sB && c.length === best.length) {
      tied.push(c.row.name ?? `${c.row.days} ${c.row.start}-${c.row.end}`);
    }
  }
  if (tied.length > 0) {
    throw new ScheduleResolutionError(
      `ambiguous schedule at minute ${minuteOfWeek}: rows tie on specificity — ` +
        [best.row.name ?? `${best.row.days} ${best.row.start}-${best.row.end}`, ...tied].join(', '),
    );
  }
  return { row: best.row, offsetMinutes: best.offset, windowMinutes: best.length };
}

/** Value of a row's IOPS at a resolved offset; ramps interpolate linearly so the
 *  first minute equals iopsStart and iopsEnd is approached, not reached. */
export function rowIops(resolved: ResolvedRow): number {
  const r = resolved.row;
  if (r.iops !== undefined) return r.iops;
  const a = r.iopsStart as number;
  const b = r.iopsEnd as number;
  return a + ((b - a) * resolved.offsetMinutes) / resolved.windowMinutes;
}

/** Same interpolation for the latency fields that only the baseline schedule carries. */
export function rowLatencyMs(resolved: ResolvedRow): number | null {
  const r = resolved.row;
  if (typeof r.latencyMs === 'number') return r.latencyMs;
  if (typeof r.latencyStartMs === 'number' && typeof r.latencyEndMs === 'number') {
    return (
      r.latencyStartMs +
      ((r.latencyEndMs - r.latencyStartMs) * resolved.offsetMinutes) / resolved.windowMinutes
    );
  }
  return null;
}

/** Prove every minute of the cyclic week resolves to exactly one row. */
export function validateScheduleCoverage(rows: ScheduleRow[]): ValidationResult {
  const d: ValidationDiagnostic[] = [];
  const gaps: number[] = [];
  for (let m = 0; m < MINUTES_PER_WEEK; m++) {
    try {
      if (resolveSchedule(rows, m) === null) gaps.push(m);
    } catch (e) {
      d.push({ path: 'schedule', message: (e as Error).message });
      return { ok: false, diagnostics: d };
    }
  }
  if (gaps.length > 0) {
    // summarize into contiguous ranges for readability
    const ranges: string[] = [];
    let s = gaps[0];
    let prev = gaps[0];
    for (const g of gaps.slice(1)) {
      if (g !== prev + 1) {
        ranges.push(`${s}-${prev}`);
        s = g;
      }
      prev = g;
    }
    ranges.push(`${s}-${prev}`);
    d.push({
      path: 'schedule',
      message: `schedule leaves ${gaps.length} minute(s) of the week unresolved: ${ranges.join(', ')}`,
    });
  }
  return { ok: d.length === 0, diagnostics: d };
}
