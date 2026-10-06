import { describe, expect, it } from 'vitest';
import { assessSample } from '../../src/engine/assess.js';
import { MANDATORY_LABEL } from '../../src/engine/model.js';
import { COMBINATIONS, samplesFor } from '../fixtures/samples.js';

describe('R-FIND-1 every finding is complete', () => {
  const RULE_ID = /^R-[A-Z]+-\d+$/;

  it('all findings have all seven fields non-empty; evidence has unit and basis', () => {
    for (const { infra, workload } of COMBINATIONS) {
      for (const s of samplesFor(workload)) {
        for (const m of [1, 1.5, 2] as const) {
          for (const h of [0, 1, 3] as const) {
            const a = assessSample(infra, workload, s, { demandMultiplier: m, horizonYears: h });
            const ctx = `${infra.id}×${workload.id}×${s.id}×m${m}×h${h}`;
            expect(a.label, ctx).toBe(MANDATORY_LABEL);
            expect(a.rulesetVersion).toBe('1.0.0-m1');
            for (const d of a.dimensions) {
              for (const c of d.checks) {
                expect(c.findings.length, `${ctx} ${c.id}`).toBeGreaterThan(0);
                for (const f of c.findings) {
                  expect(f.ruleId, `${ctx} ruleId`).toMatch(RULE_ID);
                  expect(f.condition, `${ctx} condition`).toBeTruthy();
                  expect(f.calculation, `${ctx} calculation`).toBeTruthy();
                  expect(f.implication, `${ctx} implication`).toBeTruthy();
                  expect(f.nextInvestigation, `${ctx} nextInvestigation`).toBeTruthy();
                  expect(f.confidenceRationale, `${ctx} confidenceRationale`).toBeTruthy();
                  expect(['high', 'moderate', 'insufficient']).toContain(f.confidence);
                  expect(f.assumptions.length, `${ctx} assumptions`).toBeGreaterThan(0);
                  expect(f.evidence.length, `${ctx} evidence`).toBeGreaterThan(0);
                  for (const e of f.evidence) {
                    expect(e.unit, `${ctx} evidence unit`).toBeTruthy();
                    expect(e.basis, `${ctx} evidence basis`).toBeTruthy();
                  }
                }
              }
            }
          }
        }
      }
    }
  });
});
