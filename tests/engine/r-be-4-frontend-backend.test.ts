import { describe, expect, it } from 'vitest';
import { assessSample } from '../../src/engine/assess.js';
import { INF_A, INF_B, VM_SAMPLES, WL_VM } from '../fixtures/samples.js';

const OPTS = { demandMultiplier: 1 as const, horizonYears: 1 as const };
const BURST = VM_SAMPLES[2]; // existing 52,500/22,500; proposed 10,500/4,500

function iopsChecks(infra: typeof INF_A) {
  const a = assessSample(infra, WL_VM, BURST, OPTS);
  const iops = a.dimensions.find((d) => d.dimension === 'iops')!;
  return {
    dimension: iops,
    fe: iops.checks.find((c) => c.id === 'iops.frontend')!,
    be: iops.checks.find((c) => c.id === 'iops.backend')!,
    assessment: a,
  };
}

describe('R-BE-4 front-end headroom but backend constraint', () => {
  it('INF-A (RAID 5): frontend ready 90,000; backend ready 152,100', () => {
    const { fe, be } = iopsChecks(INF_A);
    expect(fe.status).toBe('modeled-ready');
    expect(fe.budgetUtilization).toBeCloseTo(90000 / 120000, 6);
    expect(be.status).toBe('modeled-ready');
    // backend reads 81,750 + 16,350 = 98,100; writes 45,000 + 9,000 = 54,000
    expect(be.budgetUtilization).toBeCloseTo(152100 / 200000, 6);
  });

  it('INF-B (RAID 6): frontend ready, backend constraint 206,100, headroom −6,100', () => {
    const { dimension, fe, be, assessment } = iopsChecks(INF_B);
    expect(fe.status).toBe('modeled-ready');
    expect(fe.budgetUtilization).toBeCloseTo(0.75, 6);
    expect(be.status).toBe('modeled-constraint');
    expect(be.headroom).toEqual({ value: -6100, unit: 'ops/s' });
    expect(be.budgetUtilization).toBeCloseTo(206100 / 200000, 6);
    expect(dimension.status).toBe('modeled-constraint');
    expect(assessment.overall).toBe('modeled-constraint');
    const text = be.findings.map((f) => `${f.condition} ${f.implication}`).join(' ');
    expect(text).toMatch(/front-end headroom exists/i);
    expect(text).toMatch(/RAID write factor/i);
  });
});
