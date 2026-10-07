import { describe, expect, it } from 'vitest';
import type { InfrastructureProfile } from '../../src/engine/model.js';
import { validateInfrastructure } from '../../src/engine/validation.js';
import { TIB } from '../../src/engine/units.js';
import { INF_A, INF_B } from '../fixtures/samples.js';

function mutate(patch: (e: NonNullable<InfrastructureProfile['environment']>) => void): InfrastructureProfile {
  const i = structuredClone(INF_A);
  patch(i.environment!);
  return i;
}

describe('R-ENV-1 environment block coherence', () => {
  it('both shipped profiles validate OK', () => {
    expect(validateInfrastructure(INF_A).diagnostics).toEqual([]);
    expect(validateInfrastructure(INF_B).diagnostics).toEqual([]);
  });

  it('7.68 TB (decimal) = 6.98492 TiB', () => {
    expect(7.68e12 / 2 ** 40).toBeCloseTo(6.98492, 5);
    expect(INF_A.capacity.usableBytes).toBe(291370581360640);
    expect(INF_A.capacity.usableBytes / TIB).toBe(265);
    expect(INF_B.capacity.usableBytes / TIB).toBe(212);
  });

  it('rejects driveCount ≠ groups × width + spares', () => {
    const i = mutate((e) => (e.driveCount = 46));
    // 46 also breaks rawBytesDecimal; fix raw so the driveCount diagnostic is the targeted one
    i.environment!.rawBytesDecimal = 46 * i.environment!.driveNominalBytesDecimal;
    const r = validateInfrastructure(i);
    expect(r.diagnostics.some((d) => d.path === 'environment.driveCount')).toBe(true);
  });

  it('rejects driveCount exceeding enclosureSlots', () => {
    const i = mutate((e) => {
      e.driveCount = 49;
      e.groupCount = 5;
      e.spareDrives = 4; // keep arithmetic coherent
      e.rawBytesDecimal = 49 * e.driveNominalBytesDecimal;
    });
    const r = validateInfrastructure(i);
    expect(r.diagnostics.some((d) => d.path === 'environment.driveCount' && d.message.includes('enclosureSlots'))).toBe(true);
  });

  it('rejects parityWidth mismatch with backend', () => {
    const i = mutate((e) => (e.parityWidth = 2));
    const r = validateInfrastructure(i);
    expect(r.diagnostics.some((d) => d.path === 'environment.parityWidth')).toBe(true);
  });

  it('rejects usable capacity above the raw-to-usable bound', () => {
    const i = structuredClone(INF_A);
    i.capacity.usableBytes = 291840000000001; // bound is exactly 291,840,000,000,000
    const r = validateInfrastructure(i);
    expect(r.diagnostics.some((d) => d.path === 'capacity.usableBytes')).toBe(true);
  });

  it('rejects rawBytesDecimal ≠ driveCount × driveNominalBytesDecimal', () => {
    const i = mutate((e) => (e.rawBytesDecimal = 48 * e.driveNominalBytesDecimal));
    const r = validateInfrastructure(i);
    expect(r.diagnostics.some((d) => d.path === 'environment.rawBytesDecimal')).toBe(true);
  });
});
