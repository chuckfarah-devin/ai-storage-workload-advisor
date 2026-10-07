// Pure view-model layer: every computed value the UI needs comes from here.
// Components render; they never run engine arithmetic themselves.
import type {
  AssessmentOptions,
  CheckDelta,
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
  derivedDay: DerivedMinute[];
  budgets: ReturnType<typeof traceBudgets>;
  ceilings: {
    frontendIops: number | null;
    throughputBytesPerSecond: number | null;
    backendOps: number | null;
  };
}

export function assess(scenario: Scenario, options: AssessmentOptions): AssessmentBundle {
  const { infra, workload, trace } = scenario;
  const assessment = assessTrace(infra, workload, trace, options);
  const derived = deriveTraceMinutes(infra, trace, options.demandMultiplier);
  const budgets = traceBudgets(infra);
  const dayIndex = assessment.defaultDay.dayIndex;
  return {
    assessment,
    buckets: bucketize(trace, derived, budgets),
    day: extractDay(trace, dayIndex),
    derivedDay: derived.slice(dayIndex * MINUTES_PER_DAY, (dayIndex + 1) * MINUTES_PER_DAY),
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

export function baselineAndWhatIf(scenario: Scenario, options: AssessmentOptions): WhatIfBundle {
  const baseline = assess(scenario, { demandMultiplier: 1, horizonYears: 1 });
  const selected =
    options.demandMultiplier === 1 && options.horizonYears === 1
      ? baseline
      : assess(scenario, options);
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
