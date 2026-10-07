import { describe, expect, it } from 'vitest';
import { BUDGET_FRACTION, budgetOf } from '../../src/engine/budget.js';
import { checkLatency } from '../../src/engine/rules/latency.js';
import { checkProtection } from '../../src/engine/rules/protection.js';
import { TIB } from '../../src/engine/units.js';
import { INF_A, VM_SAMPLES, WL_VM } from '../fixtures/samples.js';

describe('R-BUD-1 80% operating budget', () => {
  it('budget = 0.8 × limit for all four resources', () => {
    expect(BUDGET_FRACTION).toBe(0.8);
    expect(budgetOf(INF_A.capacity.usableBytes)).toBe(212 * TIB);
    expect(budgetOf(INF_A.limits.frontendIops)).toBe(120000);
    expect(budgetOf(INF_A.limits.throughputBytesPerSecond)).toBe(2516582400); // 2400 MiB/s
    expect(budgetOf(INF_A.limits.backendOpsPerSecond as number)).toBe(200000);
  });

  it('latency and protection rules ignore the budget', () => {
    const sample = VM_SAMPLES[0];
    const beforeLat = checkLatency(WL_VM, sample).status;
    const beforePro = checkProtection(INF_A, WL_VM).status;
    const scaled = structuredClone(INF_A);
    scaled.limits.frontendIops *= 10;
    scaled.limits.backendOpsPerSecond = (scaled.limits.backendOpsPerSecond as number) * 10;
    scaled.limits.throughputBytesPerSecond *= 10;
    scaled.capacity.usableBytes *= 10;
    expect(checkLatency(WL_VM, sample).status).toBe(beforeLat);
    expect(checkProtection(scaled, WL_VM).status).toBe(beforePro);
  });
});
