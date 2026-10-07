import { describe, expect, it } from 'vitest';
import {
  bucketize,
  deriveTraceMinutes,
  extractDay,
  coverage,
  validateScheduleCoverage,
  MINUTES_PER_WEEK,
} from '../../src/engine/index.js';
import { traceBudgets } from '../../src/engine/index.js';
import { INF_A, INF_B, WL_RAG, WL_VM } from '../fixtures/samples.js';
import { BASELINE_SCHEDULE, traceFor } from '../fixtures/trace.js';

// R-TS-1: deterministic 10,080-minute weekly trace generation.
describe('R-TS-1 trace generation', () => {
  it('produces 10,080 records with strictly increasing 60 s timestamps', () => {
    const t = traceFor(INF_A, WL_VM);
    expect(t.minuteCount).toBe(MINUTES_PER_WEEK);
    expect(t.records).toHaveLength(10080);
    expect(t.startUtc).toBe('2026-10-05T00:00:00Z');
    expect(Date.parse(t.records[0].timestampUtc)).toBe(Date.parse('2026-10-05T00:00:00.000Z'));
    for (let i = 1; i < t.records.length; i++) {
      expect(Date.parse(t.records[i].timestampUtc) - Date.parse(t.records[i - 1].timestampUtc)).toBe(60_000);
      expect(t.records[i].index).toBe(i);
      expect(t.records[i].durationSeconds).toBe(60);
    }
  });

  it('shipped schedules cover the whole cyclic week', () => {
    for (const rows of [BASELINE_SCHEDULE, WL_VM.schedule, WL_RAG.schedule]) {
      const v = validateScheduleCoverage(rows);
      expect(v.diagnostics).toEqual([]);
      expect(v.ok).toBe(true);
    }
  });

  it('extractDay returns exactly 1,440 records per day', () => {
    const t = traceFor(INF_A, WL_VM);
    for (let d = 0; d < 7; d++) {
      const day = extractDay(t, d);
      expect(day).toHaveLength(1440);
      expect(day[0].index).toBe(d * 1440);
    }
  });

  it('bucketize returns 1,008 ten-minute buckets', () => {
    const t = traceFor(INF_A, WL_VM);
    const derived = deriveTraceMinutes(INF_A, t, 1);
    const buckets = bucketize(t, derived, traceBudgets(INF_A));
    expect(buckets).toHaveLength(1008);
    expect(buckets[0].validMinutes).toBe(10);
  });

  it('coverage is complete with no missing minutes', () => {
    const t = traceFor(INF_B, WL_RAG);
    const c = coverage(t);
    expect(c.total).toBe(10080);
    expect(c.valid).toBe(10080);
    expect(c.fraction).toBe(1);
  });

  it('is deterministic: two generations are deep-equal', () => {
    const a = traceFor(INF_B, WL_VM);
    const b = traceFor(INF_B, WL_VM);
    expect(a).toEqual(b);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });
});
