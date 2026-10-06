import { describe, expect, it } from 'vitest';
import type { DemandSample } from '../../src/engine/model.js';
import { assessSample, assessSampleSet } from '../../src/engine/assess.js';
import { backendResult } from '../../src/engine/rules/backendIops.js';
import { INF_A, INF_B, RAG_SAMPLES, VM_SAMPLES, WL_RAG, WL_VM } from '../fixtures/samples.js';

const OPTS = { demandMultiplier: 1 as const, horizonYears: 1 as const };

describe('R-BE-3 block-size applicability → unknown', () => {
  it('proposed 64 KiB write vs 16 KiB backend block → unknown, reason cites both sizes', () => {
    const ingestion = RAG_SAMPLES[2];
    const r = backendResult(INF_A, ingestion);
    expect(r.kind).toBe('unknown');
    if (r.kind === 'unknown') {
      expect(r.reason).toContain('65536');
      expect(r.reason).toContain('16384');
      expect(r.reason).toContain('read-modify-write');
    }
  });

  it('iops.backend needs-investigation; iops dimension needs-investigation while frontend ready', () => {
    const a = assessSample(INF_A, WL_RAG, RAG_SAMPLES[2], OPTS);
    const iops = a.dimensions.find((d) => d.dimension === 'iops')!;
    const fe = iops.checks.find((c) => c.id === 'iops.frontend')!;
    const be = iops.checks.find((c) => c.id === 'iops.backend')!;
    expect(fe.status).toBe('modeled-ready'); // 20,000 + 20,000 = 40,000
    expect(be.status).toBe('needs-investigation');
    expect(be.headroom).toBeNull();
    expect(iops.status).toBe('needs-investigation');
  });

  it('16 KiB proposed blocks → computed', () => {
    const r = backendResult(INF_A, RAG_SAMPLES[0]); // 8 KiB query blocks
    expect(r.kind).toBe('computed');
  });

  it('oversize existing side → unknown too', () => {
    const s: DemandSample = structuredClone(VM_SAMPLES[0]);
    s.existing.readBlockBytes = 65536;
    const r = backendResult(INF_A, s);
    expect(r.kind).toBe('unknown');
    if (r.kind === 'unknown') expect(r.reason).toContain('existing');
  });

  it('assessSampleSet precedence: [computable-over-budget, unknown] → constraint', () => {
    // VM burst on INF-B is a computable constraint (206,100 > 200,000)
    const over = structuredClone(VM_SAMPLES[2]);
    const unknown = structuredClone(RAG_SAMPLES[2]);
    const a = assessSampleSet(INF_B, WL_VM, [over, unknown], OPTS);
    const be = a.dimensions
      .find((d) => d.dimension === 'iops')!
      .checks.find((c) => c.id === 'iops.backend')!;
    expect(be.status).toBe('modeled-constraint');
    expect(be.worstSampleId).toBe(over.id);
  });

  it('assessSampleSet precedence: [unknown, computable-ready] → needs-investigation', () => {
    const unknown = structuredClone(RAG_SAMPLES[2]);
    const ready = structuredClone(VM_SAMPLES[0]); // quiet: backend ready
    const a = assessSampleSet(INF_A, WL_VM, [unknown, ready], OPTS);
    const be = a.dimensions
      .find((d) => d.dimension === 'iops')!
      .checks.find((c) => c.id === 'iops.backend')!;
    expect(be.status).toBe('needs-investigation');
    expect(be.worstSampleId).toBe(unknown.id);
  });

  it('assessSampleSet precedence: [ready, ready] → ready', () => {
    const a = assessSampleSet(INF_A, WL_VM, [VM_SAMPLES[0], VM_SAMPLES[1]], OPTS);
    const be = a.dimensions
      .find((d) => d.dimension === 'iops')!
      .checks.find((c) => c.id === 'iops.backend')!;
    expect(be.status).toBe('modeled-ready');
  });
});
