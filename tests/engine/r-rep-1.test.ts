import { describe, expect, it } from 'vitest';
import { renderTraceAssessmentText } from '../../src/engine/index.js';
import { TIB } from '../../src/engine/units.js';
import { INF_B, WL_VM } from '../fixtures/samples.js';
import { assessFor } from '../fixtures/trace.js';

// R-REP-1: derived weekly latency, weekly capacity max, and the rendered
// weekly block in the trace text report.
describe('R-REP-1 weekly reporting', () => {
  const a = assessFor(INF_B, WL_VM);

  it('baseline-derived weekly latency P90/P95/max', () => {
    expect(a.weekly.latencyMs.p90).toBeCloseTo(0.9, 5);
    expect(a.weekly.latencyMs.p95).toBeCloseTo(1.2, 5);
    expect(a.weekly.latencyMs.max).toBeCloseTo(1.4, 5);
  });

  it('max used capacity grows to ~120.3218 TiB by week end', () => {
    expect(a.weekly.maxUsedCapacityBytes! / TIB).toBeCloseTo(120.3218, 3);
    const cap = a.dimensions
      .find((d) => d.dimension === 'capacity')!
      .checks.find((c) => c.id === 'capacity')!;
    expect(cap.drivingMinuteIndex).toBe(10079); // week-end minute is the max
  });

  it('INF-B × WL-VM capacity utilization ≈ 144.32/169.6', () => {
    const cap = a.dimensions
      .find((d) => d.dimension === 'capacity')!
      .checks.find((c) => c.id === 'capacity')!;
    expect(cap.budgetUtilization).toBeCloseTo(0.8511, 3);
  });

  it('renderer emits the weekly block and default day', () => {
    const text = renderTraceAssessmentText(a);
    expect(text).toContain('Synthetic data. Educational demonstration');
    expect(text).toContain('Weekly (10,080-minute trace');
    expect(text).toContain('front-end IOPS');
    expect(text).toContain('backend ops');
    expect(text).toContain('unknown minutes 0');
    expect(text).toContain('latency: P90 0.9 ms  P95 1.2 ms  max 1.4 ms');
    expect(text).toContain('Default detail day: day 0 (Monday)');
    expect(text).toContain('driving minute: 605');
    expect(text).toContain('1.0.0-m2');
  });
});
