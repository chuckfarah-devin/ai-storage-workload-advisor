import { describe, expect, it } from 'vitest';
import { checkCapacity } from '../../src/engine/rules/capacity.js';
import { checkGrowth } from '../../src/engine/rules/growth.js';
import { TIB, toTiB } from '../../src/engine/units.js';
import { INF_A, INF_B, VM_SAMPLES, WL_RAG, WL_VM } from '../fixtures/samples.js';

describe('R-GRO-1 compounded growth projection', () => {
  const s = VM_SAMPLES[0]; // usedCapacityBytes = 120 TiB

  it('INF-A + WL-VM, horizon 1 → 164.4 TiB, ready', () => {
    const r = checkGrowth(INF_A, WL_VM, s, 1);
    const projected = 120 * TIB * 1.15 + 24 * TIB * 1.1; // 138 + 26.4 = 164.4
    expect(toTiB(projected)).toBeCloseTo(164.4, 6);
    expect(r.budgetUtilization).toBeCloseTo(164.4 / 212, 4);
    expect(r.status).toBe('modeled-ready');
    expect(r.findings[0].condition).toContain('1-year horizon');
  });

  it('INF-B + WL-VM, horizon 1 → 164.4 / 169.6 = 96.9%, ready', () => {
    const r = checkGrowth(INF_B, WL_VM, s, 1);
    expect(r.budgetUtilization).toBeCloseTo(164.4 / 169.6, 4);
    expect(r.status).toBe('modeled-ready');
  });

  it('INF-A + WL-VM, horizon 3 → 214.45 TiB, narrow constraint (101.2%)', () => {
    const r = checkGrowth(INF_A, WL_VM, s, 3);
    // 120 × 1.15^3 + 24 × 1.1^3 = 182.505 + 31.944 = 214.449
    const projected = 120 * TIB * 1.15 ** 3 + 24 * TIB * 1.1 ** 3;
    expect(toTiB(projected)).toBeCloseTo(214.449, 2);
    expect(r.budgetUtilization).toBeCloseTo(toTiB(projected) / 212, 6);
    expect(r.status).toBe('modeled-constraint');
  });

  it('INF-B + WL-RAG, horizon 1 → 180 TiB > 169.6 TiB budget, constraint', () => {
    const r = checkGrowth(INF_B, WL_RAG, s, 1);
    const projected = 120 * TIB * 1.15 + 30 * TIB * 1.4; // 138 + 42 = 180
    expect(toTiB(projected)).toBeCloseTo(180, 6);
    expect(r.budgetUtilization).toBeCloseTo(180 / 169.6, 6);
    expect(r.status).toBe('modeled-constraint');
  });

  it('INF-A + WL-RAG, horizon 1 → 180 TiB < 212 TiB budget, ready', () => {
    const r = checkGrowth(INF_A, WL_RAG, s, 1);
    expect(r.status).toBe('modeled-ready');
  });

  it('horizon 0 equals the current-capacity check combined value', () => {
    const cap = checkCapacity(INF_A, WL_VM, s);
    const gro = checkGrowth(INF_A, WL_VM, s, 0);
    const capCombined = 120 * TIB + WL_VM.capacityBytes;
    expect(gro.headroom?.value).toBe(cap.headroom?.value);
    expect(toTiB(capCombined)).toBeCloseTo(144, 6);
  });
});
