import { describe, expect, it } from 'vitest';
import type { DemandSample, InfrastructureProfile } from '../../src/engine/model.js';
import { validateInfrastructure, validateSample, validateWorkload } from '../../src/engine/validation.js';
import { INF_A, INF_B, VM_SAMPLES, WL_RAG, WL_VM } from '../fixtures/samples.js';

function infraOverride(patch: Record<string, unknown>): InfrastructureProfile {
  return structuredClone({ ...INF_A, ...patch }) as InfrastructureProfile;
}

function baseSample(): DemandSample {
  return structuredClone(VM_SAMPLES[0]);
}

describe('R-VAL-1 validation', () => {
  it('all four shipped profiles validate OK', () => {
    for (const infra of [INF_A, INF_B]) {
      const r = validateInfrastructure(infra);
      expect(r.diagnostics, JSON.stringify(r.diagnostics)).toEqual([]);
      expect(r.ok).toBe(true);
    }
    for (const wl of [WL_VM, WL_RAG]) {
      const r = validateWorkload(wl);
      expect(r.diagnostics, JSON.stringify(r.diagnostics)).toEqual([]);
      expect(r.ok).toBe(true);
    }
    for (const s of VM_SAMPLES) {
      expect(validateSample(INF_A, s).ok).toBe(true);
    }
  });

  it('rejects negative IOPS in a sample', () => {
    const s = baseSample();
    s.proposed.readIops = -1;
    const r = validateSample(INF_A, s);
    expect(r.ok).toBe(false);
    expect(r.diagnostics.some((d) => d.path === 'proposed.readIops')).toBe(true);
  });

  it('rejects readFraction 1.2', () => {
    const w = structuredClone(WL_VM);
    w.readFraction = 1.2;
    const r = validateWorkload(w);
    expect(r.ok).toBe(false);
    expect(r.diagnostics.some((d) => d.path === 'readFraction')).toBe(true);
  });

  it('rejects a zero limit', () => {
    const infra = infraOverride({ limits: { ...INF_A.limits, frontendIops: 0 } });
    const r = validateInfrastructure(infra);
    expect(r.ok).toBe(false);
    expect(r.diagnostics.some((d) => d.path === 'limits.frontendIops')).toBe(true);
  });

  it('rejects used capacity above usable capacity', () => {
    const infra = structuredClone(INF_A);
    infra.capacity.usedBytes = infra.capacity.usableBytes + 1;
    const r = validateInfrastructure(infra);
    expect(r.ok).toBe(false);
    expect(r.diagnostics.some((d) => d.path === 'capacity.usedBytes')).toBe(true);
  });

  it('rejects a non-synthetic profile', () => {
    const infra = infraOverride({ synthetic: false });
    const r = validateInfrastructure(infra);
    expect(r.ok).toBe(false);
    expect(r.diagnostics.some((d) => d.path === 'synthetic')).toBe(true);
  });

  it('rejects mixed backend bases (derived basis + suppliedExistingBackend)', () => {
    const s = baseSample();
    s.suppliedExistingBackend = { reads: 1000, writes: 500 };
    const r = validateSample(INF_A, s);
    expect(r.ok).toBe(false);
    expect(r.diagnostics.some((d) => d.path === 'suppliedExistingBackend')).toBe(true);
  });

  it('rejects supplied-physical basis without suppliedExistingBackend', () => {
    const infra = structuredClone(INF_A);
    infra.backend.existingBackendBasis = 'supplied-physical';
    const r = validateSample(infra, baseSample());
    expect(r.ok).toBe(false);
    expect(r.diagnostics.some((d) => d.path === 'suppliedExistingBackend')).toBe(true);
  });

  it('rejects a malformed schedule row', () => {
    const w = structuredClone(WL_VM);
    w.schedule.push({ days: '', start: 'x', end: 'y', readFraction: 2 } as never);
    const r = validateWorkload(w);
    expect(r.ok).toBe(false);
    expect(r.diagnostics.some((d) => d.path.startsWith('schedule['))).toBe(true);
  });
});
