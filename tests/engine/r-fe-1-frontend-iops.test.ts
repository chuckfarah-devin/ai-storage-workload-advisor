import { describe, expect, it } from 'vitest';
import type { DemandSample } from '../../src/engine/model.js';
import { checkFrontendIops } from '../../src/engine/rules/frontendIops.js';
import { TIB } from '../../src/engine/units.js';
import { INF_A } from '../fixtures/samples.js';

function feSample(existingIops: number, proposedIops: number): DemandSample {
  return {
    id: 'fe-fixture',
    description: 'front-end IOPS fixture',
    existing: {
      readIops: Math.round(existingIops * 0.7),
      writeIops: existingIops - Math.round(existingIops * 0.7),
      readBlockBytes: 16384,
      writeBlockBytes: 8192,
    },
    proposed: {
      readIops: Math.round(proposedIops * 0.7),
      writeIops: proposedIops - Math.round(proposedIops * 0.7),
      readBlockBytes: 16384,
      writeBlockBytes: 8192,
    },
    usedCapacityBytes: 100 * TIB,
    baselineLatency: { p95Ms: 1.2, maxMs: 1.4 },
    backgroundBackendOpsPerSecond: 0,
  };
}

describe('R-FE-1 combined front-end IOPS vs budget (120,000)', () => {
  it('90,000 → ready', () => {
    const r = checkFrontendIops(INF_A, feSample(75000, 15000));
    expect(r.status).toBe('modeled-ready');
    expect(r.headroom).toEqual({ value: 30000, unit: 'IOPS' });
  });

  it('105,000 → ready', () => {
    const r = checkFrontendIops(INF_A, feSample(75000, 30000));
    expect(r.status).toBe('modeled-ready');
    expect(r.budgetUtilization).toBeCloseTo(0.875, 6);
  });

  it('120,000 exactly at budget → ready, headroom 0', () => {
    const r = checkFrontendIops(INF_A, feSample(75000, 45000));
    expect(r.status).toBe('modeled-ready');
    expect(r.headroom?.value).toBe(0);
  });

  it('135,000 → constraint', () => {
    const r = checkFrontendIops(INF_A, feSample(75000, 60000));
    expect(r.status).toBe('modeled-constraint');
    expect(r.headroom?.value).toBe(-15000);
  });
});
