import { describe, expect, it } from 'vitest';
import { deriveTraceMinutes, selectDefaultDay, traceBudgets } from '../../src/engine/index.js';
import { INF_A, INF_B, WL_RAG, WL_VM } from '../fixtures/samples.js';
import { traceFor } from '../fixtures/trace.js';

// R-DAY-1: default-day selection — day containing the start of the longest
// exceedance run (earliest on tie); otherwise the day of the highest
// budget-utilization minute.
describe('R-DAY-1 default day selection', () => {
  it('INF-B × WL-VM: longest-run rule picks Monday', () => {
    const t = traceFor(INF_B, WL_VM);
    const sel = selectDefaultDay(t, deriveTraceMinutes(INF_B, t, 1), traceBudgets(INF_B));
    expect(sel.dayIndex).toBe(0);
    expect(sel.reason).toMatch(/backend operations/);
    expect(sel.reason).toContain('2026-10-05T10:05:00Z');
  });

  it('INF-A × WL-VM: no exceedance → highest-utilization minute on Monday', () => {
    const t = traceFor(INF_A, WL_VM);
    const sel = selectDefaultDay(t, deriveTraceMinutes(INF_A, t, 1), traceBudgets(INF_A));
    expect(sel.dayIndex).toBe(0);
    expect(sel.reason).toMatch(/no budget exceedance/);
    expect(sel.reason).toContain('152100');
  });

  it('INF-A × WL-RAG: highest utilization is the front-end burst minute', () => {
    const t = traceFor(INF_A, WL_RAG);
    const sel = selectDefaultDay(t, deriveTraceMinutes(INF_A, t, 1), traceBudgets(INF_A));
    expect(sel.dayIndex).toBe(0);
    expect(sel.reason).toMatch(/front-end IOPS/);
    expect(sel.reason).toContain('105000');
  });
});
