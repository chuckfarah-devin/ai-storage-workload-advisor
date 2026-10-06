import { describe, expect, it } from 'vitest';
import { checkCapacity } from '../../src/engine/rules/capacity.js';
import { checkGrowth } from '../../src/engine/rules/growth.js';
import { TIB, toTiB } from '../../src/engine/units.js';
import { INF_A, INF_B, VM_SAMPLES, WL_RAG, WL_VM } from '../fixtures/samples.js';

describe('R-GRO-1 compounded growth projection', () => {
  const s = VM_SAMPLES[0]; // usedCapacityBytes = 100 TiB

  it('INF-A + WL-VM, horizon 1 → 141.4 TiB, ready', () => {
    const r = checkGrowth(INF_A, WL_VM, s, 1);
    const projected = s.usedCapacityBytes + s.usedCapacityBytes * 0.15 + 24 * TIB * 1.1;
    expect(r.budgetUtilization).toBeCloseTo(projected / (160 * TIB), 6);
    expect(toTiB(160 * TIB * r.budgetUtilization!)).toBeCloseTo(141.4, 1);
    expect(r.status).toBe('modeled-ready');
    expect(r.findings[0].condition).toContain('1-year horizon');
  });

  it('INF-A + WL-VM, horizon 3 → 184.03 TiB, constraint', () => {
    const r = checkGrowth(INF_A, WL_VM, s, 3);
    // 100 × 1.15^3 + 24 × 1.1^3 = 152.0875 + 31.944 = 184.0315
    const projected = 100 * TIB * 1.15 ** 3 + 24 * TIB * 1.1 ** 3;
    expect(toTiB(projected)).toBeCloseTo(184.03, 2);
    expect(r.budgetUtilization).toBeCloseTo(projected / (160 * TIB), 6);
    expect(r.status).toBe('modeled-constraint');
  });

  it('INF-B + WL-RAG, horizon 1 → 157 TiB > 144 TiB budget, constraint', () => {
    const r = checkGrowth(INF_B, WL_RAG, s, 1);
    const projected = 100 * TIB * 1.15 + 30 * TIB * 1.4; // 115 + 42 = 157
    expect(toTiB(projected)).toBeCloseTo(157, 6);
    expect(r.budgetUtilization).toBeCloseTo(157 / 144, 6);
    expect(r.status).toBe('modeled-constraint');
  });

  it('INF-A + WL-RAG, horizon 1 → 157 TiB < 160 TiB budget, ready', () => {
    const r = checkGrowth(INF_A, WL_RAG, s, 1);
    expect(r.status).toBe('modeled-ready');
  });

  it('horizon 0 equals the current-capacity check combined value', () => {
    const cap = checkCapacity(INF_A, WL_VM, s);
    const gro = checkGrowth(INF_A, WL_VM, s, 0);
    const capCombined = 100 * TIB + WL_VM.capacityBytes;
    expect(gro.headroom?.value).toBe(cap.headroom?.value);
    expect(toTiB(capCombined)).toBeCloseTo(124, 6);
  });
});
