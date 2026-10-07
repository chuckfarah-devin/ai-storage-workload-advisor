import { describe, expect, it } from 'vitest';
import { coverage } from '../../src/engine/index.js';
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
});
