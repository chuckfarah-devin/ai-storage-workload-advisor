import { describe, expect, it } from 'vitest';
import {
  BASELINE_SCHEDULE,
  assess,
  baselineAndWhatIf,
  chooseRateUnit,
  exportAssessment,
  exportText,
  formatRate,
  loadScenario,
  presetWindows,
} from '../../src/ui/viewModel.js';

// R-UI-1: view-model computation — unit selection, presets, exports, what-if.
describe('chooseRateUnit / formatRate', () => {
  it('selects one decimal unit from the largest displayed value', () => {
    const mb = chooseRateUnit([100_000_000]);
    expect(mb).toEqual({ unit: 'MB/s', divisor: 1e6 });
    expect(formatRate(100_000_000, mb)).toBe('100.0 MB/s');
    const gb = chooseRateUnit([2_500_000_000]);
    expect(gb).toEqual({ unit: 'GB/s', divisor: 1e9 });
    expect(formatRate(2_500_000_000, gb)).toBe('2.5 GB/s');
  });

  it('budget is included so the 2,400 MiB/s budget displays as GB/s', () => {
    const unit = chooseRateUnit([500_000_000, 2_516_582_400]);
    expect(unit.unit).toBe('GB/s');
    expect(formatRate(2_516_582_400, unit, 7)).toBe('2.5165824 GB/s');
  });
});

describe('presetWindows', () => {
  it('resolves burst windows from baseline schedule rows', () => {
    const p = Object.fromEntries(presetWindows(BASELINE_SCHEDULE, 0).map((w) => [w.id, w]));
    expect(p['morning-burst'].window).toEqual([600, 620]); // 10:05±5 → 10:00–10:20
    expect(p['afternoon-burst'].window).toEqual([840, 860]); // 14:00–14:20
    expect(p['nightly-batch'].window).toEqual([1315, 1440]); // 21:55–24:00
    expect(p['nightly-batch'].note).toContain('not modeled');
  });

  it('Saturday has no morning burst — explained, not hidden', () => {
    const p = Object.fromEntries(presetWindows(BASELINE_SCHEDULE, 5).map((w) => [w.id, w]));
    expect(p['morning-burst'].available).toBe(false);
    expect(p['morning-burst'].explanation).toContain('Saturday');
  });
});

describe('assess + exports (all four combinations)', () => {
  const combos: [string, string][] = [
    ['INF-A', 'WL-VM'],
    ['INF-B', 'WL-VM'],
    ['INF-A', 'WL-RAG'],
    ['INF-B', 'WL-RAG'],
  ];
  for (const [i, w] of combos) {
    it(`${i} × ${w} assesses without throwing`, () => {
      const b = assess(loadScenario(i, w), { demandMultiplier: 1, horizonYears: 1 });
      expect(b.buckets).toHaveLength(1008);
      expect(b.day).toHaveLength(1440);
      expect(b.derivedDay).toHaveLength(1440);
      const e = exportAssessment(b);
      expect(e.infrastructureId).toBe(i);
      expect(e.workloadId).toBe(w);
      expect(e.rulesetVersion).toContain('m2');
      expect(e.options).toEqual({ demandMultiplier: 1, horizonYears: 1 });
      expect(e.coverage.trace.fraction).toBe(1);
      expect(e.label).toContain('Synthetic data');
      expect(e.limitations.length).toBeGreaterThanOrEqual(4);
      expect(exportText(b)).toContain('Weekly (10,080-minute trace');
    });
  }

  it('INF-B × WL-VM weekly backend max equals the engine value 206,100', () => {
    const b = assess(loadScenario('INF-B', 'WL-VM'), { demandMultiplier: 1, horizonYears: 1 });
    expect(exportAssessment(b).weekly.backendOps.summary.max).toBeCloseTo(206100, 5);
  });

  it('INF-A × WL-RAG reports 900 unknown backend minutes over 9,180 computable', () => {
    const b = assess(loadScenario('INF-A', 'WL-RAG'), { demandMultiplier: 1, horizonYears: 1 });
    expect(b.assessment.weekly.backendOps.unknownMinutes).toBe(900);
    expect(b.assessment.weekly.backendOps.summary.count).toBe(9180);
  });
});

describe('baselineAndWhatIf', () => {
  it('2× INF-B × WL-VM: FE 0.875, backend constraint, capacity delta 0', () => {
    const { selected, deltas } = baselineAndWhatIf(loadScenario('INF-B', 'WL-VM'), {
      demandMultiplier: 2,
      horizonYears: 1,
    });
    const checks = selected.assessment.dimensions.flatMap((d) => d.checks);
    const fe = checks.find((c) => c.id === 'iops.frontend')!;
    const be = checks.find((c) => c.id === 'iops.backend')!;
    const cap = checks.find((c) => c.id === 'capacity')!;
    expect(fe.budgetUtilization).toBeCloseTo(0.875, 6);
    expect(be.status).toBe('modeled-constraint');
    const capDelta = deltas.find((d) => d.checkId === 'capacity');
    expect(capDelta === undefined || capDelta.headroomDelta === 0).toBe(true);
    expect(cap.budgetUtilization).toBeCloseTo(
      checks.find((c) => c.id === 'capacity')!.budgetUtilization!,
      10,
    );
  });
});
