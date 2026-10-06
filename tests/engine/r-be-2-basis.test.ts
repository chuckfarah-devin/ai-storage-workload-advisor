import { describe, expect, it } from 'vitest';
import type { DemandSample } from '../../src/engine/model.js';
import { backendResult } from '../../src/engine/rules/backendIops.js';
import { INF_A, VM_SAMPLES } from '../fixtures/samples.js';

function sampleWith(background: number, supplied?: { reads: number; writes: number }): DemandSample {
  const s = structuredClone(VM_SAMPLES[0]); // existing 14,000 R / 6,000 W
  s.backgroundBackendOpsPerSecond = background;
  if (supplied) s.suppliedExistingBackend = supplied;
  return s;
}

describe('R-BE-2 no double counting; existing basis', () => {
  it('derived basis: existing derived once; background 0', () => {
    const r = backendResult(INF_A, sampleWith(0));
    if (r.kind !== 'computed') throw new Error(r.reason);
    // existing derived: 14,000×0.7 + 6,000×2 = 9,800 + 12,000 = 21,800 reads; 12,000 writes
    expect(r.existing).toEqual({ reads: 21800, writes: 12000, total: 33800 });
    expect(r.background).toBe(0);
    expect(r.combinedTotal).toBe(33800 + r.proposed.total);
  });

  it('background 5,000 adds exactly 5,000 to the combined total', () => {
    const withBg = backendResult(INF_A, sampleWith(5000));
    const withoutBg = backendResult(INF_A, sampleWith(0));
    if (withBg.kind !== 'computed' || withoutBg.kind !== 'computed') throw new Error('unexpected unknown');
    expect(withBg.combinedTotal - withoutBg.combinedTotal).toBe(5000);
    expect(withBg.background).toBe(5000);
  });

  it('supplied-physical basis: supplied reads/writes used verbatim, factor not applied', () => {
    const infra = structuredClone(INF_A);
    infra.backend.existingBackendBasis = 'supplied-physical';
    const s = sampleWith(0, { reads: 1000, writes: 500 });
    const r = backendResult(infra, s);
    if (r.kind !== 'computed') throw new Error(r.reason);
    expect(r.existing).toEqual({ reads: 1000, writes: 500, total: 1500 });
    // proposed still derived with the RAID 5 factor
    // proposed 2,800 R / 1,200 W: reads 1,960 + 2,400 = 4,360; writes 2,400
    expect(r.proposed).toEqual({ reads: 4360, writes: 2400, total: 6760 });
    expect(r.combinedTotal).toBe(1500 + 0 + 6760);
  });
});
