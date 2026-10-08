import { describe, expect, it } from 'vitest';
import {
  BASELINE_SCHEDULE,
  assess,
  baselineAndWhatIf,
  bucketLabel,
  chooseRateUnit,
  exportAssessment,
  exportText,
  formatHeadroom,
  formatRate,
  latencyCard,
  protectionCard,
  loadScenario,
  minuteReadout,
  phaseRows,
  presetWindows,
} from '../../src/ui/viewModel.js';
import { deriveTraceMinutes } from '../../src/engine/index.js';

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

describe('bucketLabel', () => {
  it('derives day and HH:MM from the timestamp, not the index', () => {
    expect(bucketLabel('2026-10-05T10:00:00Z')).toBe('Mon 10:00');
    expect(bucketLabel('2026-10-11T23:50:00Z')).toBe('Sun 23:50');
    const b = assess(loadScenario('INF-B', 'WL-VM'), { demandMultiplier: 1, horizonYears: 1 }).buckets;
    expect(bucketLabel(b[60].timestampUtc)).toBe('Mon 10:00');
    expect(bucketLabel(b[1007].timestampUtc)).toBe('Sun 23:50');
    expect(b[60].startIndex).toBe(600);
    expect(b[1007].startIndex).toBe(10070);
  });
});

describe('minuteReadout', () => {
  const scenario = loadScenario('INF-B', 'WL-VM');
  const day0 = assess(scenario, { demandMultiplier: 1, horizonYears: 1 });
  const derived1 = deriveTraceMinutes(scenario.infra, scenario.trace, 1);
  const derived2 = deriveTraceMinutes(scenario.infra, scenario.trace, 2);
  const budgets = day0.budgets;

  it('1× FE IOPS at Monday 10:05: 75,000 existing / 15,000 proposed / 90,000 combined', () => {
    const r = minuteReadout(scenario.trace.records[605], derived1[605], 'frontendIops', 1, null, budgets.frontendIops);
    expect(r).toMatchObject({ kind: 'value', existing: 75000, proposed: 15000, combined: 90000, overBudget: false, unitLabel: 'IOPS' });
  });

  it('2× FE IOPS: 75,000 / 30,000 / 105,000', () => {
    const r = minuteReadout(scenario.trace.records[605], derived2[605], 'frontendIops', 2, null, budgets.frontendIops);
    expect(r).toMatchObject({ kind: 'value', existing: 75000, proposed: 30000, combined: 105000 });
  });

  it('2× backend: 171,750 existing / 68,700 proposed / 240,450 combined ops/s', () => {
    const r = minuteReadout(scenario.trace.records[605], derived2[605], 'backendOps', 2, null, budgets.backendOps);
    expect(r.kind).toBe('value');
    if (r.kind === 'value') {
      expect(r.existing).toBeCloseTo(171750, 4);
      expect(r.proposed).toBeCloseTo(68700, 4);
      expect(r.combined).toBeCloseTo(240450, 4);
      expect(r.overBudget).toBe(true);
      expect(r.unitLabel).toBe('ops/s');
    }
  });

  it('bandwidth minute uses the chart unit, parts sum to combined', () => {
    const unit = chooseRateUnit([2_516_582_400]);
    const r = minuteReadout(scenario.trace.records[605], derived1[605], 'frontendBandwidth', 1, unit, budgets.throughputBytesPerSecond);
    expect(r.kind).toBe('value');
    if (r.kind === 'value') {
      expect(r.combined).toBeCloseTo(derived1[605].throughputBytesPerSecond!, 6);
      expect(r.existing + r.proposed).toBeCloseTo(r.combined, 6);
      expect(r.unitLabel).toBe('GB/s');
      expect(formatRate(r.combined, unit)).toContain('GB/s');
    }
  });

  it('RAG ingestion minute is unknown (never "within budget")', () => {
    const rag = loadScenario('INF-A', 'WL-RAG');
    const derived = deriveTraceMinutes(rag.infra, rag.trace, 1);
    const r = minuteReadout(rag.trace.records[120], derived[120], 'backendOps', 1, null, 200000);
    expect(r.kind).toBe('unknown');
    if (r.kind === 'unknown') expect(r.reason).toContain('65536');
  });
});

describe('assess day selection', () => {
  it('an explicit dayIndex re-extracts the detail day', () => {
    const b = assess(loadScenario('INF-A', 'WL-VM'), { demandMultiplier: 1, horizonYears: 1 }, 5);
    expect(b.dayIndex).toBe(5);
    expect(b.day[0].index).toBe(5 * 1440);
    expect(b.derivedDay).toHaveLength(1440);
    // presets recompute: Saturday has no morning burst
    const p = presetWindows(BASELINE_SCHEDULE, b.dayIndex);
    expect(p.find((w) => w.id === 'morning-burst')!.available).toBe(false);
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

describe('formatHeadroom', () => {
  it('renders binary units with locale separators', () => {
    expect(formatHeadroom(27_793_649_922_512, 'bytes')).toBe('25.28 TiB');
    expect(formatHeadroom(-49_850_155_188_707, 'bytes')).toBe('-45.34 TiB');
    expect(formatHeadroom(1_263_206_400, 'bytes/second')).toBe('1,204.7 MiB/s');
    expect(formatHeadroom(30_000, 'IOPS')).toBe('30,000 IOPS');
    expect(formatHeadroom(-6_100, 'ops/s')).toBe('-6,100 ops/s');
  });
});

describe('latencyCard / protectionCard', () => {
  const b = assess(loadScenario('INF-B', 'WL-VM'), { demandMultiplier: 1, horizonYears: 1 });
  const checks = b.assessment.dimensions.flatMap((d) => d.checks);

  it('latency card shows baseline P95/max and the workload target — no budget vocabulary', () => {
    const card = latencyCard(checks.find((c) => c.id === 'latency')!, b.assessment.weekly);
    expect(card.baselineP95Ms).toBeCloseTo(1.2, 6);
    expect(card.baselineMaxMs).toBeCloseTo(1.4, 6);
    expect(card.targetMs).toBe(2);
  });

  it('protection card lists required vs declared capabilities', () => {
    const rows = protectionCard(checks.find((c) => c.id === 'protection')!);
    expect(rows).toHaveLength(4);
    const drive = rows.find((r) => r.name === 'tolerated drive failures')!;
    expect(drive).toMatchObject({ required: '1', declared: '2' }); // INF-B RAID 6 tolerates 2
    expect(rows.find((r) => r.name === 'snapshots')!.declared).toBe('true');
    expect(rows.find((r) => r.name === 'replication')!.declared).toBe('unknown');
  });
});

describe('phaseRows', () => {
  it('derives per-phase bandwidth from IOPS × read/write-weighted block size', () => {
    const rows = phaseRows(loadScenario('INF-A', 'WL-RAG').workload);
    const query = rows.find((r) => r.name === 'query-hours' && r.days === 'weekday')!;
    expect(query.bandwidthStartBps).toBeCloseTo(30_000 * 8192, 0); // 245,760,000 B/s
    const ingestion = rows.find((r) => r.name === 'ingestion')!;
    expect(ingestion.windowUtc).toBe('02:00–05:00');
    expect(ingestion.durationMinutes).toBe(180); // the three-hour synthetic assumption
    expect(ingestion.bandwidthStartBps).toBeCloseTo(20_000 * 65536, 0); // 1,310,720,000 B/s
    expect(ingestion.note).toMatch(/substantial synthetic assumption/);
  });

  it('handles overnight windows and ramp rows', () => {
    const rag = phaseRows(loadScenario('INF-A', 'WL-RAG').workload);
    const off = rag.find((r) => r.windowUtc === '20:00–02:00')!;
    expect(off.durationMinutes).toBe(360); // wraps midnight
    const vm = phaseRows(loadScenario('INF-B', 'WL-VM').workload);
    const ramp = vm.find((r) => r.name === 'morning-ramp')!;
    const weightedBlock = 0.7 * 16384 + 0.3 * 8192;
    expect(ramp.bandwidthStartBps).toBeCloseTo(4_000 * weightedBlock, 0);
    expect(ramp.bandwidthEndBps).toBeCloseTo(15_000 * weightedBlock, 0);
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
