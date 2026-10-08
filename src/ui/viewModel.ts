// Pure view-model layer: every computed value the UI needs comes from here.
// Components render; they never run engine arithmetic themselves.
import type {
  AssessmentOptions,
  CheckDelta,
  CheckResult,
  Evidence,
  InfrastructureProfile,
  ScheduleRow,
  TraceAssessment,
  WorkloadProfile,
} from '../engine/index.js';
import {
  assessTrace,
  bucketize,
  compareAssessments,
  deriveTraceMinutes,
  extractDay,
  generateTrace,
  renderTraceAssessmentText,
  traceBudgets,
  MINUTES_PER_DAY,
} from '../engine/index.js';
import type { Bucket, DerivedMinute, Trace, TraceRecord } from '../engine/index.js';
import { TIB } from '../engine/units.js';
import infraA from '../../data/profiles/inf-a-raid5.json';
import infraB from '../../data/profiles/inf-b-raid6.json';
import wlVm from '../../data/profiles/wl-vm.json';
import wlRag from '../../data/profiles/wl-rag.json';
import baselineJson from '../../data/profiles/existing-baseline.json';

const INFRASTRUCTURES: Record<string, InfrastructureProfile> = {
  'INF-A': infraA as InfrastructureProfile,
  'INF-B': infraB as InfrastructureProfile,
};
const WORKLOADS: Record<string, WorkloadProfile> = {
  'WL-VM': wlVm as unknown as WorkloadProfile,
  'WL-RAG': wlRag as unknown as WorkloadProfile,
};
export const BASELINE_SCHEDULE = (baselineJson as { schedule: ScheduleRow[] }).schedule;

export const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export interface Scenario {
  infra: InfrastructureProfile;
  workload: WorkloadProfile;
  trace: Trace;
}

const traceCache = new Map<string, Trace>();

export function loadScenario(infraId: string, workloadId: string): Scenario {
  const infra = INFRASTRUCTURES[infraId];
  const workload = WORKLOADS[workloadId];
  if (!infra || !workload) throw new Error(`unknown scenario ${infraId} × ${workloadId}`);
  const key = `${infraId}|${workloadId}`;
  let trace = traceCache.get(key);
  if (!trace) {
    trace = generateTrace(BASELINE_SCHEDULE, workload, {
      usedCapacityStartBytes: infra.capacity.usedBytes,
      annualGrowthFraction: infra.capacity.annualGrowthFraction,
      backgroundBackendOpsPerSecond: infra.backend.backgroundBackendOpsPerSecond ?? 0,
    });
    traceCache.set(key, trace);
  }
  return { infra, workload, trace };
}

export interface AssessmentBundle {
  assessment: TraceAssessment;
  buckets: Bucket[];
  day: TraceRecord[];
  dayIndex: number;
  derivedDay: DerivedMinute[];
  budgets: ReturnType<typeof traceBudgets>;
  ceilings: {
    frontendIops: number | null;
    throughputBytesPerSecond: number | null;
    backendOps: number | null;
  };
}

export function assess(
  scenario: Scenario,
  options: AssessmentOptions,
  dayIndex?: number,
): AssessmentBundle {
  const { infra, workload, trace } = scenario;
  const assessment = assessTrace(infra, workload, trace, options);
  const derived = deriveTraceMinutes(infra, trace, options.demandMultiplier);
  const budgets = traceBudgets(infra);
  const dayIdx = dayIndex ?? assessment.defaultDay.dayIndex;
  return {
    assessment,
    buckets: bucketize(trace, derived, budgets),
    dayIndex: dayIdx,
    day: extractDay(trace, dayIdx),
    derivedDay: derived.slice(dayIdx * MINUTES_PER_DAY, (dayIdx + 1) * MINUTES_PER_DAY),
    budgets,
    ceilings: {
      frontendIops: infra.limits.frontendIops,
      throughputBytesPerSecond: infra.limits.throughputBytesPerSecond,
      backendOps: infra.limits.backendOpsPerSecond,
    },
  };
}

export interface WhatIfBundle {
  baseline: AssessmentBundle;
  selected: AssessmentBundle;
  deltas: CheckDelta[];
}

export function baselineAndWhatIf(
  scenario: Scenario,
  options: AssessmentOptions,
  dayIndex?: number,
): WhatIfBundle {
  const baseline = assess(scenario, { demandMultiplier: 1, horizonYears: 1 });
  const selected =
    options.demandMultiplier === 1 && options.horizonYears === 1
      ? baseline
      : assess(scenario, options, dayIndex);
  if (dayIndex !== undefined && selected.dayIndex !== dayIndex) {
    // baseline was shared but a different day was requested — re-extract.
    return {
      baseline,
      selected: assess(scenario, options, dayIndex),
      deltas: compareAssessments(baseline.assessment, selected.assessment),
    };
  }
  return { baseline, selected, deltas: compareAssessments(baseline.assessment, selected.assessment) };
}

// ---- Inspection presets -----------------------------------------------------

export interface PresetWindow {
  id: string;
  label: string;
  available: boolean;
  /** [startMinuteOfDay, endMinuteOfDay) */
  window?: [number, number];
  explanation?: string;
  note?: string;
}

const DAY_SET: Record<string, Set<number>> = {
  daily: new Set([0, 1, 2, 3, 4, 5, 6]),
  weekday: new Set([0, 1, 2, 3, 4]),
  weekend: new Set([5, 6]),
  mon: new Set([0]), tue: new Set([1]), wed: new Set([2]), thu: new Set([3]),
  fri: new Set([4]), sat: new Set([5]), sun: new Set([6]),
};

function hhmm(s: string): number {
  const [h, m] = s.split(':').map(Number);
  return h * 60 + m;
}

function rowApplies(row: ScheduleRow, dayIndex: number): boolean {
  return DAY_SET[row.days]?.has(dayIndex) ?? false;
}

const NIGHTLY_NOTE =
  'Backup completion/window compliance not modeled — this inspects the existing nightly batch only.';

/** Resolve inspection windows from the baseline schedule — no hardcoded
 *  minute numbers. A window is [start−5, end+5] clipped to the day. */
export function presetWindows(baselineSchedule: ScheduleRow[], dayIndex: number): PresetWindow[] {
  const presets: PresetWindow[] = [
    { id: 'full-day', label: 'Full day', available: true, window: [0, MINUTES_PER_DAY] },
  ];
  const specs: { id: string; label: string; match: (r: ScheduleRow) => boolean }[] = [
    { id: 'morning-burst', label: 'Morning burst', match: (r) => r.name === 'burst-1' },
    { id: 'afternoon-burst', label: 'Afternoon burst', match: (r) => r.name === 'burst-2' },
    {
      id: 'nightly-batch',
      label: 'Nightly batch',
      match: (r) => r.name === 'batch' && hhmm(r.start) === 22 * 60,
    },
  ];
  for (const spec of specs) {
    const rows = baselineSchedule.filter(spec.match);
    const row = rows.find((r) => rowApplies(r, dayIndex));
    if (row === undefined) {
      const definedFor = rows.length > 0 ? rows.map((r) => r.days).join(', ') : 'no days';
      presets.push({
        id: spec.id,
        label: spec.label,
        available: false,
        explanation: `No ${spec.label.toLowerCase()} window is scheduled on ${DAY_NAMES[dayIndex]}; the baseline schedule defines it for ${definedFor}.`,
        ...(spec.id === 'nightly-batch' ? { note: NIGHTLY_NOTE } : {}),
      });
      continue;
    }
    const start = Math.max(0, hhmm(row.start) - 5);
    const end = Math.min(MINUTES_PER_DAY, hhmm(row.end) + 5);
    presets.push({
      id: spec.id,
      label: spec.label,
      available: true,
      window: [start, end],
      ...(spec.id === 'nightly-batch' ? { note: NIGHTLY_NOTE } : {}),
    });
  }
  return presets;
}

// ---- Workload phase table ----------------------------------------------------

export interface PhaseRow {
  name: string;
  days: string;
  /** 'HH:MM–HH:MM' UTC */
  windowUtc: string;
  durationMinutes: number;
  /** ramp-aware: start == end for flat rows */
  iopsStart: number;
  iopsEnd: number;
  readFraction: number;
  readBlockBytes: number;
  writeBlockBytes: number;
  /** derived front-end bandwidth at window start/end, bytes/second */
  bandwidthStartBps: number;
  bandwidthEndBps: number;
  note?: string;
}

const windowDuration = (start: number, end: number): number =>
  end > start ? end - start : MINUTES_PER_DAY - start + end;

/** Per-schedule-row demand phases with derived front-end bandwidth
 *  (IOPS × read/write-weighted block size — the same formula the trace
 *  generator uses; display only, never feeds the assessment). */
export function phaseRows(workload: WorkloadProfile): PhaseRow[] {
  return workload.schedule.map((r) => {
    const iopsStart = r.iops ?? r.iopsStart ?? 0;
    const iopsEnd = r.iops ?? r.iopsEnd ?? iopsStart;
    const weightedBlock =
      r.readFraction * r.readBlockBytes + (1 - r.readFraction) * r.writeBlockBytes;
    const start = hhmm(r.start);
    const end = hhmm(r.end);
    return {
      name: r.name ?? 'unnamed',
      days: r.days,
      windowUtc: `${r.start}–${r.end}`,
      durationMinutes: windowDuration(start, end),
      iopsStart,
      iopsEnd,
      readFraction: r.readFraction,
      readBlockBytes: r.readBlockBytes,
      writeBlockBytes: r.writeBlockBytes,
      bandwidthStartBps: iopsStart * weightedBlock,
      bandwidthEndBps: iopsEnd * weightedBlock,
      ...(r.note !== undefined ? { note: r.note } : {}),
    };
  });
}

/** Label a bucket/minute by its UTC timestamp: 'Mon 10:00'. Day names are
 *  derived from the timestamp, never from an index. */
export function bucketLabel(timestampUtc: string): string {
  const d = new Date(timestampUtc);
  const dow = (d.getUTCDay() + 6) % 7; // Monday=0 … Sunday=6
  const hh = String(d.getUTCHours()).padStart(2, '0');
  const mm = String(d.getUTCMinutes()).padStart(2, '0');
  return `${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][dow]} ${hh}:${mm}`;
}

// ---- Minute readout ----------------------------------------------------------

export type Y1Metric = 'frontendIops' | 'frontendBandwidth' | 'backendOps';

export type MinuteReadout =
  | { kind: 'missing' }
  | { kind: 'unknown'; reason: string }
  | {
      kind: 'value';
      existing: number;
      proposed: number;
      combined: number;
      /** null when the resource declares no budget */
      overBudget: boolean | null;
      /** additional named components of combined (e.g. declared background) */
      background?: number;
      unitLabel: string;
    };

function assertSums(parts: number[], combined: number, what: string): void {
  const sum = parts.reduce((a, b) => a + b, 0);
  const tol = Math.max(1e-6, Math.abs(combined) * 1e-6);
  if (Math.abs(sum - combined) > tol) {
    throw new Error(
      `minuteReadout invariant violated for ${what}: parts ${sum} ≠ combined ${combined}`,
    );
  }
}

/**
 * Breakdown of one minute's displayed demand for the selected Y1 metric, with
 * the demand multiplier applied to proposed demand exactly once. The dev
 * invariant throws if the parts don't sum to the derived combined value, so a
 * mismatch can never silently render. Unknown/missing is never 'within budget'.
 */
export function minuteReadout(
  record: TraceRecord,
  derived: DerivedMinute,
  metric: Y1Metric,
  multiplier: number,
  unit: RateUnit | null,
  budget: number | null,
): MinuteReadout {
  if (record.missing || record.existing === null || record.proposed === null) {
    return { kind: 'missing' };
  }
  if (metric === 'backendOps') {
    if (derived.backend === null || derived.backend.kind === 'unknown') {
      return {
        kind: 'unknown',
        reason: derived.backend?.kind === 'unknown' ? derived.backend.reason : 'no backend estimate',
      };
    }
    const b = derived.backend;
    assertSums([b.existing.total, b.background, b.proposed.total], b.combinedTotal, 'backendOps');
    return {
      kind: 'value',
      existing: b.existing.total,
      proposed: b.proposed.total, // already multiplier-scaled by deriveTraceMinutes
      combined: b.combinedTotal,
      background: b.background,
      overBudget: budget === null ? null : b.combinedTotal > budget,
      unitLabel: 'ops/s',
    };
  }
  if (metric === 'frontendIops') {
    const existing = record.existing.readIops + record.existing.writeIops;
    const proposed = (record.proposed.readIops + record.proposed.writeIops) * multiplier;
    const combined = derived.frontendIops as number;
    assertSums([existing, proposed], combined, 'frontendIops');
    return {
      kind: 'value',
      existing,
      proposed,
      combined,
      overBudget: budget === null ? null : combined > budget,
      unitLabel: 'IOPS',
    };
  }
  const existing =
    record.existing.readIops * record.existing.readBlockBytes +
    record.existing.writeIops * record.existing.writeBlockBytes;
  const proposed =
    (record.proposed.readIops * record.proposed.readBlockBytes +
      record.proposed.writeIops * record.proposed.writeBlockBytes) *
    multiplier;
  const combined = derived.throughputBytesPerSecond as number;
  assertSums([existing, proposed], combined, 'frontendBandwidth');
  return {
    kind: 'value',
    existing,
    proposed,
    combined,
    overBudget: budget === null ? null : combined > budget,
    unitLabel: unit?.unit ?? 'bytes/s',
  };
}

// ---- Units / formatting ------------------------------------------------------

export type RateUnit = { unit: 'MB/s' | 'GB/s'; divisor: number };

/** One decimal unit per chart from the largest displayed value (demand,
 *  budget and ceiling included). */
export function chooseRateUnit(valuesBytesPerSecond: (number | null)[]): RateUnit {
  const max = valuesBytesPerSecond.reduce<number>(
    (m, v) => (v !== null && v > m ? v : m),
    0,
  );
  return max >= 1e9 ? { unit: 'GB/s', divisor: 1e9 } : { unit: 'MB/s', divisor: 1e6 };
}

export function formatRate(bytesPerSecond: number | null, unit: RateUnit, precision = 2): string {
  if (bytesPerSecond === null) return 'unknown';
  const v = bytesPerSecond / unit.divisor;
  return `${v.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: precision })} ${unit.unit}`;
}

export const formatCount = (v: number | null): string =>
  v === null ? 'unknown' : Math.round(v).toLocaleString('en-US');

/** Display a headroom value by its canonical unit: bytes → TiB (2 dp),
 *  bytes/second → MiB/s (0–1 dp), counts with locale separators. */
export function formatHeadroom(value: number, unit: string): string {
  if (unit === 'bytes')
    return `${(value / TIB).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TiB`;
  if (unit === 'bytes/second')
    return `${(value / 2 ** 20).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 1 })} MiB/s`;
  return `${Math.round(value).toLocaleString('en-US')} ${unit}`;
}

// ---- Dimension-card view models ----------------------------------------------

export interface LatencyCard {
  baselineP95Ms: number | null;
  baselineMaxMs: number | null;
  targetMs: number | null;
}

export interface ProtectionCapabilityRow {
  name: string;
  required: string;
  declared: string;
}

const evidenceValue = (check: CheckResult, label: string): Evidence | undefined =>
  check.findings.flatMap((f) => f.evidence).find((e) => e.label === label);

/** Baseline latency numbers for the latency card: P95/max from the weekly
 *  summary, target from the check's finding evidence. No budget vocabulary. */
export function latencyCard(check: CheckResult, weekly: TraceAssessment['weekly']): LatencyCard {
  const target = evidenceValue(check, 'workload latency target');
  return {
    baselineP95Ms: weekly.latencyMs.p95,
    baselineMaxMs: weekly.latencyMs.max,
    targetMs: typeof target?.value === 'number' ? target.value : null,
  };
}

/** Required vs declared protection capabilities for the protection card. */
export function protectionCard(check: CheckResult): ProtectionCapabilityRow[] {
  const ev = (label: string) => evidenceValue(check, label);
  const show = (v: Evidence | undefined): string =>
    v === undefined ? 'not declared' : v.value === null ? (v.missingReason ?? 'unknown') : String(v.value);
  return [
    {
      name: 'tolerated drive failures',
      required: show(ev('minimum tolerated drive failures required')),
      declared: show(ev('tolerated drive failures')),
    },
    { name: 'snapshots', required: show(ev('snapshots required')), declared: show(ev('snapshots capability')) },
    {
      name: 'encryption at rest',
      required: show(ev('encryptionAtRest required')),
      declared: show(ev('encryptionAtRest capability')),
    },
    {
      name: 'replication',
      required: show(ev('replication required')),
      declared: show(ev('replication capability')),
    },
  ];
}

export const formatTiB = (bytes: number | null, digits = 2): string =>
  bytes === null ? 'unknown' : `${(bytes / TIB).toFixed(digits)} TiB`;

export const formatMiBs = (bytesPerSecond: number | null, digits = 0): string =>
  bytesPerSecond === null ? 'unknown' : `${(bytesPerSecond / 2 ** 20).toFixed(digits)} MiB/s`;

// ---- Export ------------------------------------------------------------------

export function exportAssessment(bundle: AssessmentBundle) {
  const a = bundle.assessment;
  const traceCoverage = a.weekly.coverage;
  const backendModelCoverage =
    traceCoverage.valid === 0
      ? null
      : (traceCoverage.valid - a.weekly.backendOps.unknownMinutes) / traceCoverage.valid;
  return {
    infrastructureId: a.infrastructureId,
    workloadId: a.workloadId,
    rulesetVersion: a.rulesetVersion,
    options: a.options,
    coverage: {
      trace: traceCoverage,
      backendUnknownMinutes: a.weekly.backendOps.unknownMinutes,
      backendModelCoverage,
    },
    weekly: a.weekly,
    defaultDay: a.defaultDay,
    dimensions: a.dimensions,
    label: a.label,
    limitations: [
      'Post-addition latency is unknown — no response curve exists in V1.',
      'Synthetic data; educational demonstration only.',
      'Protection checks match a selected-capability vocabulary, not whole-system availability.',
      'No live array data, vendor integration, or deployment authorization.',
    ],
  };
}

export function exportText(bundle: AssessmentBundle): string {
  return renderTraceAssessmentText(bundle.assessment);
}
