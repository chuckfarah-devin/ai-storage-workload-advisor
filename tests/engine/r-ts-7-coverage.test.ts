import { describe, expect, it } from 'vitest';
import { coverage } from '../../src/engine/index.js';
import type { CheckResult } from '../../src/engine/index.js';
import { INF_A, INF_B, WL_VM } from '../fixtures/samples.js';
import { assessFor, traceFor } from '../fixtures/trace.js';

// R-TS-7: missing minutes — a hole inside Monday's 10:05–10:14 burst removes
// those exceedances and blocks any 'ready' conclusion on remaining checks.
describe('R-TS-7 coverage', () => {
  const missing = Array.from({ length: 10 }, (_, i) => 605 + i); // Mon 10:05–10:14

  it('missing minutes excluded from coverage', () => {
    const t = traceFor(INF_B, WL_VM, missing);
    const c = coverage(t);
    expect(c.valid).toBe(10080 - 10);
    expect(c.fraction).toBeCloseTo(10070 / 10080, 10);
    for (const i of missing) expect(t.records[i].missing).toBe(true);
  });

  it('exceedance minutes drop to 90 with 9 runs', () => {
    const a = assessFor(INF_B, WL_VM, missing);
    expect(a.weekly.backendOps.exceedance.minutes).toBe(90);
    expect(a.weekly.backendOps.exceedance.runCount).toBe(9);
    expect(a.weekly.backendOps.exceedance.longestRunMinutes).toBe(10);
  });

  it('a check that would be ready is downgraded to needs-investigation', () => {
    const a = assessFor(INF_A, WL_VM, missing);
    const dim = Object.fromEntries(a.dimensions.map((d) => [d.dimension, d]));
    const backend = dim.iops.checks.find((c) => c.id === 'iops.backend')!;
    expect(backend.status).toBe('needs-investigation');
    const ev = backend.findings[0].evidence.find((e) => e.label === 'coverage downgrade');
    expect(ev).toBeDefined();
    expect(ev!.missingReason).toContain('coverage');
    expect(ev!.missingReason).toContain('10070/10080');
  });

  it('downgraded finding no longer claims readiness', () => {
    const a = assessFor(INF_A, WL_VM, missing);
    const be = a.dimensions
      .find((d) => d.dimension === 'iops')!
      .checks.find((c) => c.id === 'iops.backend')!;
    const f = be.findings[0];
    expect(f.implication).toContain('cannot be established');
    expect(f.implication).not.toContain('headroom exists');
    expect(f.condition).toContain('Coverage 10070/10080 minutes is incomplete');
    expect(f.confidence).toBe('insufficient');
    expect(f.confidenceRationale).toContain('coverage is incomplete');
    // Observed headroom/utilization remain real for the observed minutes.
    expect(be.headroom).not.toBeNull();
    expect(be.budgetUtilization).not.toBeNull();
  });

  describe('zero coverage', () => {
    const allMissing = Array.from({ length: 10080 }, (_, i) => i);
    const a = assessFor(INF_B, WL_VM, allMissing);
    const numericIds = ['capacity', 'iops.frontend', 'iops.backend', 'throughput', 'growth'];
    const all = a.dimensions.flatMap((d) => d.checks);
    const byId = (id: string): CheckResult => all.find((c) => c.id === id)!;

    it('weekly summaries are null and coverage is 0', () => {
      expect(a.weekly.coverage.fraction).toBe(0);
      expect(a.weekly.frontendIops.summary.max).toBeNull();
      expect(a.weekly.backendOps.summary.mean).toBeNull();
      expect(a.weekly.latencyMs.p95).toBeNull();
      expect(a.weekly.maxUsedCapacityBytes).toBeNull();
      expect(a.defaultDay.dayIndex).toBe(0);
    });

    it('every numeric check is needs-investigation with no fabricated demand', () => {
      for (const id of numericIds) {
        const c = byId(id);
        expect(c.status, id).toBe('needs-investigation');
        expect(c.headroom, id).toBeNull();
        expect(c.budgetUtilization, id).toBeNull();
        expect(c.limitUtilization, id).toBeNull();
        const f = c.findings[0];
        expect(f.implication, id).toContain('cannot be modeled');
        expect(f.confidence, id).toBe('insufficient');
        expect(f.calculation).toContain('not computable');
        // Demand statistics stay null — nothing fabricates a zero demand.
        for (const e of f.evidence) {
          if (/weekly (mean|P90|P95|max)|maximum used capacity/i.test(e.label)) {
            expect(e.value, `${id} / ${e.label}`).toBeNull();
          }
        }
      }
      expect(byId('iops.backend').drivingMinuteIndex).toBeUndefined();
    });
  });
});
