import { describe, expect, it } from 'vitest';
import type { ScheduleRow, WorkloadProfile } from '../../src/engine/index.js';
import { assessTrace, deriveTraceMinutes, generateTrace, traceBudgets } from '../../src/engine/index.js';
import { INF_A, WL_VM } from '../fixtures/samples.js';

// R-TS-6: noncoincident peaks — each numeric check keeps its own driving
// minute; unrelated peaks must not be merged into one representative sample.
describe('R-TS-6 noncoincident peaks', () => {
  // Existing baseline: trivially flat so proposed demand controls the shape.
  const existing: ScheduleRow[] = [
    { name: 'flat', days: 'daily', start: '00:00', end: '24:00', iops: 0, readFraction: 0.5, readBlockBytes: 16384, writeBlockBytes: 8192, latencyMs: 0.5 },
  ];
  // Proposed: read-heavy peak at Monday 00:00–00:59 (highest front-end IOPS),
  // write-heavy peak at Monday 02:00–02:59 (highest backend ops under RAID 5's
  // write penalty). FE max minute != backend max minute.
  const wl: WorkloadProfile = {
    ...WL_VM,
    id: 'WL-NONCOINCIDENT',
    schedule: [
      { name: 'fe-peak', days: 'mon', start: '00:00', end: '01:00', iops: 50000, readFraction: 1.0, readBlockBytes: 16384, writeBlockBytes: 8192 },
      { name: 'be-peak', days: 'mon', start: '02:00', end: '03:00', iops: 30000, readFraction: 0.0, readBlockBytes: 16384, writeBlockBytes: 8192 },
      { name: 'base', days: 'daily', start: '00:00', end: '24:00', iops: 1000, readFraction: 0.5, readBlockBytes: 16384, writeBlockBytes: 8192 },
    ],
  };
  const trace = generateTrace(existing, wl, {
    usedCapacityStartBytes: INF_A.capacity.usedBytes,
    annualGrowthFraction: INF_A.capacity.annualGrowthFraction,
    backgroundBackendOpsPerSecond: INF_A.backend.backgroundBackendOpsPerSecond ?? 0,
  });
  const assessment = assessTrace(INF_A, wl, trace, { demandMultiplier: 1, horizonYears: 1 });
  const dim = Object.fromEntries(assessment.dimensions.map((d) => [d.dimension, d]));
  const fe = dim.iops.checks.find((c) => c.id === 'iops.frontend')!;
  const be = dim.iops.checks.find((c) => c.id === 'iops.backend')!;

  it('front-end and backend driving minutes differ', () => {
    expect(fe.drivingMinuteIndex).toBe(0);
    expect(be.drivingMinuteIndex).toBe(120);
    expect(fe.drivingMinuteIndex).not.toBe(be.drivingMinuteIndex);
  });

  it('derivation agrees: FE max at minute 0, backend max at minute 120', () => {
    const derived = deriveTraceMinutes(INF_A, trace, 1);
    const budgets = traceBudgets(INF_A);
    const feVals = derived.map((d) => d.frontendIops);
    const beVals = derived.map((d) => (d.backend?.kind === 'computed' ? d.backend.combinedTotal : null));
    expect(feVals[0]).toBe(50000);
    expect(Math.max(...(feVals as number[]))).toBe(50000);
    // RAID 5: 30,000 logical writes cost the 4-op small-write penalty
    // (2 reads + 2 writes) → 120,000 backend ops.
    expect(beVals[120]).toBe(120000);
    expect(beVals[0]).toBe(35000); // 50000 reads x (1 - 0.30 hit)
    void budgets;
  });
});
