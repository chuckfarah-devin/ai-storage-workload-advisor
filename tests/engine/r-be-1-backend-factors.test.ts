import { describe, expect, it } from 'vitest';
import type { InfrastructureProfile, LogicalDemand } from '../../src/engine/model.js';
import { estimateBackend } from '../../src/engine/rules/backendIops.js';
import { INF_A, INF_B } from '../fixtures/samples.js';

function demand(readIops: number, writeIops: number): LogicalDemand {
  return { readIops, writeIops, readBlockBytes: 16384, writeBlockBytes: 8192 };
}

function withHit(infra: InfrastructureProfile, hit: number): InfrastructureProfile {
  const i = structuredClone(infra);
  i.backend.readCacheHitFraction = hit;
  return i;
}

function est(infra: InfrastructureProfile, d: LogicalDemand) {
  const r = estimateBackend(infra, 'proposed', d);
  if (r.kind !== 'computed') throw new Error(`expected computed, got ${r.reason}`);
  return r.estimate;
}

describe('R-BE-1 classic read-modify-write factors', () => {
  it('spec example, hit 0: RAID 5 → reads 13,000 / writes 6,000 / total 19,000', () => {
    const e = est(withHit(INF_A, 0), demand(7000, 3000));
    expect(e).toEqual({ reads: 13000, writes: 6000, total: 19000 });
  });

  it('spec example, hit 0: RAID 6 → reads 16,000 / writes 9,000 / total 25,000', () => {
    const e = est(withHit(INF_B, 0), demand(7000, 3000));
    expect(e).toEqual({ reads: 16000, writes: 9000, total: 25000 });
  });

  it('existing burst 52,500/22,500 hit 0.30: RAID 5 → 81,750 / 45,000 / 126,750', () => {
    const e = est(INF_A, demand(52500, 22500));
    expect(e).toEqual({ reads: 81750, writes: 45000, total: 126750 });
  });

  it('existing burst 52,500/22,500 hit 0.30: RAID 6 → 104,250 / 67,500 / 171,750', () => {
    const e = est(INF_B, demand(52500, 22500));
    expect(e).toEqual({ reads: 104250, writes: 67500, total: 171750 });
  });

  it('all-read: writes 0 → backend writes 0, reads = reads × 0.7', () => {
    const e = est(INF_A, demand(10000, 0));
    expect(e).toEqual({ reads: 7000, writes: 0, total: 7000 });
  });

  it('all-write: reads 0 → backend = writes × factor', () => {
    expect(est(INF_A, demand(0, 5000))).toEqual({ reads: 10000, writes: 10000, total: 20000 });
    expect(est(INF_B, demand(0, 5000))).toEqual({ reads: 15000, writes: 15000, total: 30000 });
  });

  it('hit 1 boundary: backend reads = writes × rmw reads only', () => {
    const e = est(withHit(INF_A, 1), demand(5000, 2000));
    expect(e).toEqual({ reads: 4000, writes: 4000, total: 8000 });
  });

  it('hit 0 boundary: no cache benefit on reads', () => {
    const e = est(withHit(INF_B, 0), demand(5000, 2000));
    expect(e).toEqual({ reads: 11000, writes: 6000, total: 17000 });
  });
});
