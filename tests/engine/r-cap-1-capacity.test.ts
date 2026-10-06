import { describe, expect, it } from 'vitest';
import { checkCapacity } from '../../src/engine/rules/capacity.js';
import { TIB } from '../../src/engine/units.js';
import { INF_A, VM_SAMPLES, WL_VM } from '../fixtures/samples.js';

describe('R-CAP-1 capacity vs budget', () => {
  it('below budget → ready', () => {
    const r = checkCapacity(INF_A, WL_VM, VM_SAMPLES[0]); // 100 + 24 = 124 TiB vs 160
    expect(r.status).toBe('modeled-ready');
    expect(r.headroom?.value).toBeCloseTo(36 * TIB, 0);
    expect(r.budgetUtilization).toBeCloseTo(124 / 160, 6);
    expect(r.limitUtilization).toBeCloseTo(124 / 200, 6);
  });

  it('exactly equal to budget → ready with zero headroom', () => {
    const s = structuredClone(VM_SAMPLES[0]);
    s.usedCapacityBytes = 136 * TIB; // 136 + 24 = 160 TiB = budget
    const r = checkCapacity(INF_A, WL_VM, s);
    expect(r.status).toBe('modeled-ready');
    expect(r.headroom?.value).toBe(0);
    expect(r.budgetUtilization).toBe(1);
  });

  it('above budget → constraint with negative headroom', () => {
    const s = structuredClone(VM_SAMPLES[0]);
    s.usedCapacityBytes = 150 * TIB; // 150 + 24 = 174 > 160
    const r = checkCapacity(INF_A, WL_VM, s);
    expect(r.status).toBe('modeled-constraint');
    expect(r.headroom?.value).toBeCloseTo(-14 * TIB, 0);
  });
});
