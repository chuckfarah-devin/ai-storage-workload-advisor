import { describe, expect, it } from 'vitest';
import { assessTrace } from '../../src/engine/index.js';
import type { CheckResult, InfrastructureProfile } from '../../src/engine/index.js';
import { INF_A, INF_B, WL_VM } from '../fixtures/samples.js';
import { traceFor } from '../fixtures/trace.js';

// R-WHAT-2: the demand multiplier must apply to the weekly series AND to the
// scalar checks on the driving minute — identical scaling, applied once.
describe('R-WHAT-2 trace what-if consistency', () => {
  const trace = traceFor(INF_B, WL_VM);
  const a2 = assessTrace(INF_B, WL_VM, trace, { demandMultiplier: 2, horizonYears: 1 });
  const a15 = assessTrace(INF_B, WL_VM, trace, { demandMultiplier: 1.5, horizonYears: 1 });
  const a1 = assessTrace(INF_B, WL_VM, trace, { demandMultiplier: 1, horizonYears: 1 });

  const checkOf = (a: typeof a2, id: string): CheckResult =>
    a.dimensions.flatMap((d) => d.checks).find((c) => c.id === id)!;

  it('2×: front-end check reflects scaled demand (105,000 / 120,000)', () => {
    const fe = checkOf(a2, 'iops.frontend');
    expect(fe.budgetUtilization).toBeCloseTo(105000 / 120000, 8);
    expect(a2.weekly.frontendIops.summary.max).toBe(105000);
    // proposed FE evidence: 15,000 × 2 = 30,000
    const ev = fe.findings[0].evidence.find((e) => /proposed/i.test(e.label));
    expect(ev).toBeDefined();
    expect(ev!.value).toBe(30000);
  });

  it('2×: backend check is modeled-constraint at 240,450 combined', () => {
    const be = checkOf(a2, 'iops.backend');
    expect(be.status).toBe('modeled-constraint');
    expect(a2.weekly.backendOps.summary.max).toBeCloseTo(240450, 5);
    expect(be.budgetUtilization).toBeCloseTo(240450 / 200000, 6);
  });

  it('capacity is unaffected by the demand multiplier', () => {
    const cap2 = checkOf(a2, 'capacity');
    const cap1 = checkOf(a1, 'capacity');
    expect(cap2.budgetUtilization).toBeCloseTo(cap1.budgetUtilization!, 10);
    expect(a2.weekly.maxUsedCapacityBytes).toBe(a1.weekly.maxUsedCapacityBytes);
  });

  it('1.5×: every numeric check utilization equals weekly max / budget', () => {
    const w = a15.weekly;
    const pairs: [string, number][] = [
      ['iops.frontend', w.frontendIops.summary.max! / w.frontendIops.budget!],
      ['iops.backend', w.backendOps.summary.max! / w.backendOps.budget!],
      ['throughput', w.throughput.summary.max! / w.throughput.budget!],
    ];
    for (const [id, expected] of pairs) {
      expect(checkOf(a15, id).budgetUtilization, id).toBeCloseTo(expected, 8);
    }
  });

  it('null backendOpsPerSecond: backend unknown all week, check needs-investigation', () => {
    const infra: InfrastructureProfile = JSON.parse(JSON.stringify(INF_A));
    infra.limits.backendOpsPerSecond = null;
    const t = traceFor(infra, WL_VM);
    const a = assessTrace(infra, WL_VM, t, { demandMultiplier: 1, horizonYears: 1 });
    expect(a.weekly.backendOps.budget).toBeNull();
    expect(a.weekly.backendOps.unknownMinutes).toBe(a.weekly.coverage.valid);
    expect(a.weekly.backendOps.exceedance.minutes).toBe(0);
    const be = checkOf(a, 'iops.backend');
    expect(be.status).toBe('needs-investigation');
    expect(be.drivingMinuteIndex).toBe(0); // earliest valid minute
  });
});
