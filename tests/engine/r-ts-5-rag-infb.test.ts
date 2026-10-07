import { describe, expect, it } from 'vitest';
import { INF_B, WL_RAG } from '../fixtures/samples.js';
import { assessFor } from '../fixtures/trace.js';

// R-TS-5: WL-RAG on INF-B — RAID 6 write penalty pushes the business burst
// over budget while the ingestion window remains uncomputable (both reported).
describe('R-TS-5 WL-RAG × INF-B', () => {
  const a = assessFor(INF_B, WL_RAG);
  const w = a.weekly;

  it('backend max, exceedance, and unknown minutes', () => {
    expect(w.backendOps.summary.max).toBeCloseTo(208650, 5);
    expect(w.backendOps.exceedance.minutes).toBe(100);
    expect(w.backendOps.exceedance.longestRunMinutes).toBe(10);
    expect(w.backendOps.exceedance.runCount).toBe(10);
    expect(w.backendOps.unknownMinutes).toBe(900);
  });

  it('backend check is modeled-constraint and overall reflects it', () => {
    const dim = Object.fromEntries(a.dimensions.map((d) => [d.dimension, d]));
    const backend = dim.iops.checks.find((c) => c.id === 'iops.backend')!;
    expect(backend.status).toBe('modeled-constraint');
    expect(a.overall).toBe('modeled-constraint');
    expect(a.defaultDay.dayIndex).toBe(0);
    expect(a.defaultDay.reason).toContain('208650');
  });
});
