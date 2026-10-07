import { describe, expect, it } from 'vitest';
import { checkCapacity } from '../../src/engine/rules/capacity.js';
import { TIB } from '../../src/engine/units.js';
import { INF_A, VM_SAMPLES, WL_VM } from '../fixtures/samples.js';

describe('R-CAP-1 capacity vs budget', () => {
  it('below budget → ready', () => {
    const r = checkCapacity(INF_A, WL_VM, VM_SAMPLES[0]); // 120 + 24 = 144 TiB vs 212
    expect(r.status).toBe('modeled-ready');
    expect(r.headroom?.value).toBeCloseTo(68 * TIB, 0);
    expect(r.budgetUtilization).toBeCloseTo(144 / 212, 6);
    expect(r.limitUtilization).toBeCloseTo(144 / 265, 6);
  });

  it('exactly equal to budget → ready with zero headroom', () => {
    const s = structuredClone(VM_SAMPLES[0]);
    s.usedCapacityBytes = 188 * TIB; // 188 + 24 = 212 TiB = budget
    const r = checkCapacity(INF_A, WL_VM, s);
    expect(r.status).toBe('modeled-ready');
    expect(r.headroom?.value).toBe(0);
    expect(r.budgetUtilization).toBe(1);
  });

  it('above budget → constraint with negative headroom', () => {
    const s = structuredClone(VM_SAMPLES[0]);
    s.usedCapacityBytes = 200 * TIB; // 200 + 24 = 224 > 212
    const r = checkCapacity(INF_A, WL_VM, s);
    expect(r.status).toBe('modeled-constraint');
    expect(r.headroom?.value).toBeCloseTo(-12 * TIB, 0);
  });
});
