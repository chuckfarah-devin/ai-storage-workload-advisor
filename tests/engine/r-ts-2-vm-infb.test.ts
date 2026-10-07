import { describe, expect, it } from 'vitest';
import { traceBuckets } from '../../src/engine/index.js';
import { INF_B, WL_VM } from '../fixtures/samples.js';
import { assessFor, DEFAULT_TRACE_OPTIONS, traceFor } from '../fixtures/trace.js';

// R-TS-2: WL-VM on INF-B — backend modeled-constraint with the documented
// weekday burst windows (10:05–10:14, 14:05–14:14).
describe('R-TS-2 WL-VM × INF-B', () => {
  const a = assessFor(INF_B, WL_VM);
  const w = a.weekly;

  it('backend weekly statistics match expected values', () => {
    expect(w.backendOps.summary.max).toBeCloseTo(206100, 5);
    expect(w.backendOps.summary.p95).toBeCloseTo(164360, 5);
    expect(w.backendOps.summary.p90).toBeGreaterThanOrEqual(148000);
    expect(w.backendOps.summary.p90 as number).toBeLessThanOrEqual(148850);
    expect(w.backendOps.budget).toBe(200000);
    expect(w.backendOps.exceedance.minutes).toBe(100);
    expect(w.backendOps.exceedance.longestRunMinutes).toBe(10);
    expect(w.backendOps.exceedance.runCount).toBe(10);
    expect(w.backendOps.exceedance.fractionOfValidMinutes).toBeCloseTo(100 / 10080, 8);
    expect(w.backendOps.unknownMinutes).toBe(0);
  });

  it('front-end weekly statistics match expected values', () => {
    expect(w.frontendIops.summary.max).toBe(90000);
    expect(w.frontendIops.summary.max! / w.frontendIops.budget!).toBeCloseTo(0.75, 5);
    expect(w.frontendIops.exceedance.minutes).toBe(0);
  });

  it('check statuses and overall', () => {
    const dim = Object.fromEntries(a.dimensions.map((d) => [d.dimension, d]));
    const backend = dim.iops.checks.find((c) => c.id === 'iops.backend')!;
    const frontend = dim.iops.checks.find((c) => c.id === 'iops.frontend')!;
    expect(backend.status).toBe('modeled-constraint');
    expect(frontend.status).toBe('modeled-ready');
    expect(backend.drivingMinuteIndex).toBe(605); // Monday 10:05
    expect(a.overall).toBe('modeled-constraint');
  });

  it('default day is Monday citing the 10:05 backend exceedance', () => {
    expect(a.defaultDay.dayIndex).toBe(0);
    expect(a.defaultDay.reason).toContain('2026-10-05T10:05:00');
    expect(a.defaultDay.reason).toContain('206100');
    expect(a.defaultDay.reason).toContain('200000');
  });

  it('hidden burst: 10-minute buckets smooth the mean but keep the max', () => {
    const trace = traceFor(INF_B, WL_VM);
    const buckets = traceBuckets(trace, INF_B, DEFAULT_TRACE_OPTIONS);
    const b1000 = buckets[60]; // minutes 600–609, starts Monday 10:00
    const b1010 = buckets[61]; // 10:10–10:19
    for (const b of [b1000, b1010]) {
      expect(b.mean.backendOps).toBeCloseTo(177475, 3);
      expect(b.max.backendOps).toBeCloseTo(206100, 3);
      expect(b.minutesAboveBudget.backendOps).toBe(5);
    }
    // No bucket mean exceeds the budget although burst maxima do.
    const meanExceed = buckets.filter((b) => (b.mean.backendOps ?? 0) > 200000);
    expect(meanExceed).toHaveLength(0);
    // Each 10-minute burst straddles two buckets: 2 bursts × 2 buckets × 5 weekdays.
    const maxExceed = buckets.filter((b) => (b.max.backendOps ?? 0) > 200000);
    expect(maxExceed).toHaveLength(20);
  });
});
