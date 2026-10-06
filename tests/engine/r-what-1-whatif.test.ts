import { describe, expect, it } from 'vitest';
import { assessSample } from '../../src/engine/assess.js';
import { applyDemandMultiplier, compareAssessments } from '../../src/engine/whatif.js';
import { INF_A, RAG_SAMPLES, WL_RAG } from '../fixtures/samples.js';

const BURST = RAG_SAMPLES[1]; // existing 52,500/22,500 (75k); proposed 27,000/3,000 (30k)

function check(m: 1 | 1.5 | 2, id: string) {
  const a = assessSample(INF_A, WL_RAG, BURST, { demandMultiplier: m, horizonYears: 1 });
  for (const d of a.dimensions)
    for (const c of d.checks) if (c.id === id) return { check: c, assessment: a };
  throw new Error(`check ${id} not found`);
}

describe('R-WHAT-1 demand multiplier on WL-RAG burst / INF-A', () => {
  it('1× → front-end 105,000 ready', () => {
    const { check: c } = check(1, 'iops.frontend');
    expect(c.budgetUtilization).toBeCloseTo(105000 / 120000, 6);
    expect(c.status).toBe('modeled-ready');
  });

  it('1.5× → front-end 120,000 exactly at budget → ready, headroom 0', () => {
    const { check: c } = check(1.5, 'iops.frontend');
    expect(c.status).toBe('modeled-ready');
    expect(c.headroom?.value).toBe(0);
  });

  it('2× → front-end 135,000 constraint', () => {
    const { check: c } = check(2, 'iops.frontend');
    expect(c.status).toBe('modeled-constraint');
    expect(c.headroom?.value).toBe(-15000);
  });

  it('capacity dimension unchanged across multipliers', () => {
    const caps = ([1, 1.5, 2] as const).map((m) => check(m, 'capacity').check);
    expect(caps[0].budgetUtilization).toBe(caps[1].budgetUtilization);
    expect(caps[1].budgetUtilization).toBe(caps[2].budgetUtilization);
  });

  it('backend scales with the multiplier: 157,650 → 173,100 → 188,550', () => {
    expect(check(1, 'iops.backend').check.budgetUtilization).toBeCloseTo(157650 / 200000, 6);
    expect(check(1.5, 'iops.backend').check.budgetUtilization).toBeCloseTo(173100 / 200000, 6);
    expect(check(2, 'iops.backend').check.budgetUtilization).toBeCloseTo(188550 / 200000, 6);
  });

  it('multiplier applied exactly once: combined FE = existing + proposed × m', () => {
    const { check: c } = check(1.5, 'iops.frontend');
    // 75,000 + 30,000 × 1.5 = 120,000 → utilization exactly 1.0, not 1.125
    expect(c.budgetUtilization).toBe(1);
  });

  it('compareAssessments lists the iops.frontend change and nothing for capacity', () => {
    const a1 = check(1, 'iops.frontend').assessment;
    const a2 = check(2, 'iops.frontend').assessment;
    const deltas = compareAssessments(a1, a2);
    const fe = deltas.filter((d) => d.checkId === 'iops.frontend');
    expect(fe).toHaveLength(1);
    expect(fe[0].before).toBe('modeled-ready');
    expect(fe[0].after).toBe('modeled-constraint');
    expect(deltas.some((d) => d.dimension === 'capacity')).toBe(false);
    // Checks without headroom (latency, protection) are unchanged and must not appear.
    expect(deltas.some((d) => d.dimension === 'latency' || d.dimension === 'protection')).toBe(false);
    expect(deltas.map((d) => d.checkId).sort()).toEqual(['iops.backend', 'iops.frontend', 'throughput']);
  });

  it('applyDemandMultiplier scales proposed IOPS only, leaving blocks and capacity', () => {
    const s = applyDemandMultiplier(BURST, 2);
    expect(s.proposed.readIops).toBe(54000);
    expect(s.proposed.writeIops).toBe(6000);
    expect(s.proposed.readBlockBytes).toBe(BURST.proposed.readBlockBytes);
    expect(s.usedCapacityBytes).toBe(BURST.usedCapacityBytes);
    expect(s.existing).toEqual(BURST.existing);
    expect(applyDemandMultiplier(BURST, 1)).toBe(BURST);
  });
});
