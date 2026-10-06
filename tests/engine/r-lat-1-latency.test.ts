import { describe, expect, it } from 'vitest';
import { checkLatency } from '../../src/engine/rules/latency.js';
import { VM_SAMPLES, WL_VM } from '../fixtures/samples.js';

describe('R-LAT-1 baseline latency screening', () => {
  it('p95 1.2 ms vs target 2.0 ms → needs-investigation (never ready)', () => {
    const r = checkLatency(WL_VM, VM_SAMPLES[0]);
    expect(r.status).toBe('needs-investigation');
    expect(r.findings[0].condition).toContain('post-addition latency unknown');
    // second finding/evidence reports maxMs
    const allEvidence = r.findings.flatMap((f) => f.evidence);
    expect(allEvidence.some((e) => e.label === 'baseline maximum latency' && e.value === 1.4)).toBe(true);
  });

  it('p95 2.5 ms vs target 2.0 ms → constraint labeled baseline, before addition', () => {
    const s = structuredClone(VM_SAMPLES[0]);
    s.baselineLatency.p95Ms = 2.5;
    const r = checkLatency(WL_VM, s);
    expect(r.status).toBe('modeled-constraint');
    expect(r.findings[0].condition).toContain('baseline, before addition');
    expect(r.findings[0].confidence).toBe('high');
  });

  it('p95 null → needs-investigation with missingReason', () => {
    const s = structuredClone(VM_SAMPLES[0]);
    s.baselineLatency.p95Ms = null;
    const r = checkLatency(WL_VM, s);
    expect(r.status).toBe('needs-investigation');
    const ev = r.findings[0].evidence.find((e) => e.label === 'baseline P95 latency');
    expect(ev?.missingReason).toBeTruthy();
    expect(r.findings[0].confidence).toBe('insufficient');
  });

  it('never modeled-ready in any case', () => {
    const statuses = [
      checkLatency(WL_VM, VM_SAMPLES[0]).status,
      checkLatency(WL_VM, { ...structuredClone(VM_SAMPLES[0]), baselineLatency: { p95Ms: 2.5, maxMs: 3 } }).status,
      checkLatency(WL_VM, { ...structuredClone(VM_SAMPLES[0]), baselineLatency: { p95Ms: null, maxMs: null } }).status,
      checkLatency({ ...WL_VM, latencyTargetMs: null }, VM_SAMPLES[0]).status,
    ];
    expect(statuses).not.toContain('modeled-ready');
  });
});
