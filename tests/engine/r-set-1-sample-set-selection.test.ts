import { describe, expect, it } from 'vitest';
import { assessSampleSet } from '../../src/engine/assess.js';
import type { CheckResult } from '../../src/engine/model.js';
import { INF_A, INF_B, RAG_SAMPLES, VM_SAMPLES, WL_RAG, WL_VM } from '../fixtures/samples.js';

const OPTS = { demandMultiplier: 1 as const, horizonYears: 1 as const };

function backendCheck(infra: typeof INF_A, wl: typeof WL_VM, samples: Parameters<typeof assessSampleSet>[2]): CheckResult {
  const a = assessSampleSet(infra, wl, samples, OPTS);
  return a.dimensions.find((d) => d.dimension === 'iops')!.checks.find((c) => c.id === 'iops.backend')!;
}

describe('R-SET-1 sample-set selection', () => {
  it('a. constraint tier picks the later, larger sample by budgetUtilization', () => {
    const burst = structuredClone(VM_SAMPLES[2]); // 206,100 on INF-B → util 1.0305
    const bigger = structuredClone(VM_SAMPLES[2]);
    bigger.id = 'vm-weekday-burst-2x-proposed';
    bigger.proposed.readIops = 21000;
    bigger.proposed.writeIops = 9000; // 171,750 + 68,700 = 240,450 → util 1.20225
    const c = backendCheck(INF_B, WL_VM, [burst, bigger]);
    expect(c.status).toBe('modeled-constraint');
    expect(c.worstSampleId).toBe('vm-weekday-burst-2x-proposed');
    expect(c.headroom).toEqual({ value: -40450, unit: 'ops/s' });
    expect(c.budgetUtilization).toBeCloseTo(240450 / 200000, 6);
    expect(c.selectionBasis).toBe('highest-budget-utilization');
    expect(c.tierSampleIds).toEqual(['vm-weekday-burst', 'vm-weekday-burst-2x-proposed']);
  });

  it('b. reversed input order still selects the larger sample (deterministic)', () => {
    const burst = structuredClone(VM_SAMPLES[2]);
    const bigger = structuredClone(VM_SAMPLES[2]);
    bigger.id = 'vm-weekday-burst-2x-proposed';
    bigger.proposed.readIops = 21000;
    bigger.proposed.writeIops = 9000;
    const c = backendCheck(INF_B, WL_VM, [bigger, burst]);
    expect(c.worstSampleId).toBe('vm-weekday-burst-2x-proposed');
    expect(c.headroom).toEqual({ value: -40450, unit: 'ops/s' });
    expect(c.tierSampleIds).toEqual(['vm-weekday-burst-2x-proposed', 'vm-weekday-burst']);
  });

  it('c. ready tier picks the sample closest to budget', () => {
    const a = assessSampleSet(INF_A, WL_VM, [VM_SAMPLES[0], VM_SAMPLES[1]], OPTS);
    const fe = a.dimensions
      .find((d) => d.dimension === 'iops')!
      .checks.find((c) => c.id === 'iops.frontend')!;
    expect(fe.status).toBe('modeled-ready');
    expect(fe.worstSampleId).toBe('vm-weekday-business'); // 65,000 > 24,000
    expect(fe.selectionBasis).toBe('highest-budget-utilization');
    expect(fe.tierSampleIds).toEqual(['vm-weekday-quiet', 'vm-weekday-business']);
  });

  it('d. exact utilization tie → earliest sample in input order', () => {
    const dup = structuredClone(VM_SAMPLES[1]);
    dup.id = 'vm-business-dup';
    const a = assessSampleSet(INF_A, WL_VM, [VM_SAMPLES[1], dup], OPTS);
    const fe = a.dimensions
      .find((d) => d.dimension === 'iops')!
      .checks.find((c) => c.id === 'iops.frontend')!;
    expect(fe.worstSampleId).toBe('vm-weekday-business');
    expect(fe.tierSampleIds).toEqual(['vm-weekday-business', 'vm-business-dup']);
  });

  it('e. unknown tier picks earliest at status (unknowns have no magnitude)', () => {
    const ing1 = structuredClone(RAG_SAMPLES[2]);
    ing1.id = 'ing-1';
    const ing2 = structuredClone(RAG_SAMPLES[2]);
    ing2.id = 'ing-2';
    const c = backendCheck(INF_A, WL_RAG, [ing1, ing2]);
    expect(c.status).toBe('needs-investigation');
    expect(c.worstSampleId).toBe('ing-1');
    expect(c.selectionBasis).toBe('earliest-at-status');
    expect(c.tierSampleIds).toEqual(['ing-1', 'ing-2']);
  });

  it('f. mixed tiers → combined constraint; tier contains only the constraint sample', () => {
    const ready = structuredClone(VM_SAMPLES[0]); // quiet, all ready on INF-B
    const unknown = structuredClone(VM_SAMPLES[2]);
    unknown.id = 'vm-burst-oversize';
    unknown.proposed.readBlockBytes = 65536;
    unknown.proposed.writeBlockBytes = 65536; // backend unknown
    const constraint = structuredClone(VM_SAMPLES[2]); // 206,100 on INF-B
    const a = assessSampleSet(INF_B, WL_VM, [ready, unknown, constraint], OPTS);
    const be = a.dimensions
      .find((d) => d.dimension === 'iops')!
      .checks.find((c) => c.id === 'iops.backend')!;
    expect(be.status).toBe('modeled-constraint');
    expect(be.worstSampleId).toBe('vm-weekday-burst');
    expect(be.tierSampleIds).toEqual(['vm-weekday-burst']);
    expect(be.selectionBasis).toBe('highest-budget-utilization');
  });

  it('g. latency (non-numeric): two constraining samples → earliest wins', () => {
    // Documented V1 semantics, not an oversight: latency has no budget
    // denominator and M2 derives a single weekly P95, so per-sample latency
    // variation is not a selection signal.
    const s1 = structuredClone(VM_SAMPLES[0]);
    s1.id = 'lat-2.5';
    s1.baselineLatency = { p95Ms: 2.5, maxMs: 2.6 };
    const s2 = structuredClone(VM_SAMPLES[0]);
    s2.id = 'lat-3.0';
    s2.baselineLatency = { p95Ms: 3.0, maxMs: 3.1 };
    const a = assessSampleSet(INF_A, WL_VM, [s1, s2], OPTS);
    const lat = a.dimensions.find((d) => d.dimension === 'latency')!.checks[0];
    expect(lat.status).toBe('modeled-constraint');
    expect(lat.worstSampleId).toBe('lat-2.5');
    expect(lat.selectionBasis).toBe('earliest-at-status');
    expect(lat.tierSampleIds).toEqual(['lat-2.5', 'lat-3.0']);
  });

  it('h. protection (non-numeric): earliest at status', () => {
    const a = assessSampleSet(INF_A, WL_VM, [VM_SAMPLES[0], VM_SAMPLES[1]], OPTS);
    const pro = a.dimensions.find((d) => d.dimension === 'protection')!.checks[0];
    expect(pro.status).toBe('modeled-ready');
    expect(pro.worstSampleId).toBe('vm-weekday-quiet');
    expect(pro.selectionBasis).toBe('earliest-at-status');
    expect(pro.tierSampleIds).toEqual(['vm-weekday-quiet', 'vm-weekday-business']);
  });
});
