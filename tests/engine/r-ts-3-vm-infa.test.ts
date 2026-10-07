import { describe, expect, it } from 'vitest';
import { INF_A, WL_VM } from '../fixtures/samples.js';
import { assessFor } from '../fixtures/trace.js';

// R-TS-3: WL-VM on INF-A — RAID 5 backend stays within budget; default day is
// chosen by highest utilization instead of an exceedance run.
describe('R-TS-3 WL-VM × INF-A', () => {
  const a = assessFor(INF_A, WL_VM);
  const w = a.weekly;

  it('backend weekly statistics match expected values', () => {
    expect(w.backendOps.summary.max).toBeCloseTo(152100, 5);
    expect(w.backendOps.summary.max! / w.backendOps.budget!).toBeCloseTo(0.7605, 4);
    expect(w.backendOps.exceedance.minutes).toBe(0);
    expect(w.backendOps.unknownMinutes).toBe(0);
  });

  it('front-end weekly statistics', () => {
    expect(w.frontendIops.summary.max).toBe(90000);
    expect(w.frontendIops.exceedance.minutes).toBe(0);
  });

  it('backend and front-end checks are modeled-ready', () => {
    const dim = Object.fromEntries(a.dimensions.map((d) => [d.dimension, d]));
    expect(dim.iops.status).toBe('modeled-ready');
    const backend = dim.iops.checks.find((c) => c.id === 'iops.backend')!;
    expect(backend.status).toBe('modeled-ready');
    expect(backend.drivingMinuteIndex).toBe(605);
  });

  it('default day is Monday via highest-utilization rule', () => {
    expect(a.defaultDay.dayIndex).toBe(0);
    expect(a.defaultDay.reason).toContain('152100');
    expect(a.defaultDay.reason).toContain('2026-10-05T10:05:00');
  });
});
