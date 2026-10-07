import { describe, expect, it } from 'vitest';
import { INF_A, WL_RAG } from '../fixtures/samples.js';
import { assessFor } from '../fixtures/trace.js';

// R-TS-4: WL-RAG on INF-A — 64 KiB proposed blocks exceed the modeled 16 KiB
// backend block during weekday 02:00–05:00 ingestion, so 900 backend minutes
// are unknown and must not be hidden by averaging.
describe('R-TS-4 WL-RAG × INF-A', () => {
  const a = assessFor(INF_A, WL_RAG);
  const w = a.weekly;

  it('900 unknown backend minutes during weekday ingestion', () => {
    expect(w.backendOps.unknownMinutes).toBe(900);
    expect(w.backendOps.summary.count).toBe(10080 - 900);
  });

  it('computable backend max and front-end max', () => {
    expect(w.backendOps.summary.max).toBeCloseTo(157650, 5);
    expect(w.frontendIops.summary.max).toBe(105000);
    expect(w.frontendIops.summary.max! / w.frontendIops.budget!).toBeCloseTo(0.875, 5);
  });

  it('backend check is needs-investigation driven by the earliest unknown minute', () => {
    const dim = Object.fromEntries(a.dimensions.map((d) => [d.dimension, d]));
    const backend = dim.iops.checks.find((c) => c.id === 'iops.backend')!;
    expect(backend.status).toBe('needs-investigation');
    expect(backend.drivingMinuteIndex).toBe(120); // Monday 02:00
    expect(dim.iops.status).toBe('needs-investigation');
  });

  it('default day is Monday via front-end utilization', () => {
    expect(a.defaultDay.dayIndex).toBe(0);
    expect(a.defaultDay.reason).toContain('105000');
    expect(a.defaultDay.reason).toContain('2026-10-05T10:05:00');
  });
});
