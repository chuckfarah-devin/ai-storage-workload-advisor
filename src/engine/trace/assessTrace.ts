import type {
  Assessment,
  AssessmentOptions,
  CheckResult,
  DemandSample,
  DimensionResult,
  Evidence,
  InfrastructureProfile,
  WorkloadProfile,
} from '../model.js';
import { MANDATORY_LABEL } from '../model.js';
import { budgetOf } from '../budget.js';
import { assessSample, RULESET_VERSION } from '../assess.js';
import { combineStatuses } from '../status.js';
import { bucketize, type Bucket, type BucketBudgets } from './aggregate.js';
import { selectDefaultDay, type DaySelection } from './daySelect.js';
import { deriveMinute } from './generate.js';
import { coverage, exceedance, weeklySummary, type Coverage, type Exceedance, type WeeklySummary } from './stats.js';
import type { DerivedMinute, Trace } from './types.js';

export interface ResourceWeekly {
  summary: WeeklySummary;
  /** null only for backendOps when the profile declares no backend limit */
  budget: number | null;
  exceedance: Exceedance;
}

export interface BackendWeekly extends ResourceWeekly {
  unknownMinutes: number;
}

export interface TraceWeekly {
  coverage: Coverage;
  frontendIops: ResourceWeekly;
  backendOps: BackendWeekly;
  throughput: ResourceWeekly;
  latencyMs: { p90: number | null; p95: number | null; max: number | null };
  maxUsedCapacityBytes: number | null;
}

export interface TraceAssessment extends Assessment {
  weekly: TraceWeekly;
  defaultDay: DaySelection;
}

/** Find the valid/computable minute with the highest budget utilization
 *  (earliest on tie) — the driving-minute selection consistent with R-SET-1. */
function drivingMinute(series: (number | null)[], budget: number): number | null {
  let best = -1;
  let bestRatio = Number.NEGATIVE_INFINITY;
  series.forEach((v, i) => {
    if (v === null) return;
    const ratio = v / budget;
    if (ratio > bestRatio) {
      bestRatio = ratio;
      best = i;
    }
  });
  return best === -1 ? null : best;
}

function makeSample(
  id: string,
  record: Trace['records'][number],
  baselineP95: number | null,
  baselineMax: number | null,
  usedCapacityBytes: number | null,
): DemandSample {
  return {
    id,
    description: `trace minute ${record.index} (${record.timestampUtc})`,
    existing: record.existing ?? { readIops: 0, writeIops: 0, readBlockBytes: 16384, writeBlockBytes: 8192 },
    proposed: record.proposed ?? { readIops: 0, writeIops: 0, readBlockBytes: 16384, writeBlockBytes: 8192 },
    usedCapacityBytes: usedCapacityBytes ?? 0,
    baselineLatency: { p95Ms: baselineP95, maxMs: baselineMax },
    backgroundBackendOpsPerSecond: record.backgroundBackendOpsPerSecond ?? 0,
  };
}

function weeklyEvidence(prefix: string, unit: string, s: WeeklySummary, ex: Exceedance, cov: Coverage): Evidence[] {
  return [
    { label: `${prefix} weekly mean`, value: s.mean, unit, basis: 'duration-weighted mean over valid minutes' },
    { label: `${prefix} weekly P90`, value: s.p90, unit, basis: 'nearest-rank over valid minute samples' },
    { label: `${prefix} weekly P95`, value: s.p95, unit, basis: 'nearest-rank over valid minute samples' },
    { label: `${prefix} weekly max`, value: s.max, unit, basis: 'observed interval maximum' },
    { label: `${prefix} exceedance minutes`, value: ex.minutes, unit: 'minutes', basis: 'minutes above operating budget' },
    { label: `${prefix} longest exceedance run`, value: ex.longestRunMinutes, unit: 'minutes', basis: 'longest continuous run above budget' },
    { label: `${prefix} exceedance recurrences`, value: ex.runCount, unit: 'count', basis: 'number of runs above budget' },
    { label: 'weekly coverage', value: cov.fraction, unit: 'fraction', basis: `${cov.valid}/${cov.total} observed minutes` },
  ];
}

/**
 * Weekly trace assessment (M2). Reuses the M1 scalar rules via assessSample on
 * a driving minute per check — the valid computable minute with the highest
 * budget utilization (earliest on tie). Backend: if no computable minute
 * exceeds the budget but any minute is uncomputable, the earliest unknown
 * minute drives the check (status needs-investigation). Coverage below 100%
 * downgrades a would-be ready check to needs-investigation (D-7); an observed
 * constraint stands.
 */
export function traceBudgets(infra: InfrastructureProfile): BucketBudgets {
  return {
    frontendIops: budgetOf(infra.limits.frontendIops),
    backendOps:
      infra.limits.backendOpsPerSecond === null
        ? null
        : budgetOf(infra.limits.backendOpsPerSecond),
    throughputBytesPerSecond: budgetOf(infra.limits.throughputBytesPerSecond),
  };
}

/** Derive every minute; the demand multiplier scales proposed demand of every
 *  minute before derivation (applyDemandMultiplier semantics). */
export function deriveTraceMinutes(
  infra: InfrastructureProfile,
  trace: Trace,
  demandMultiplier: 1 | 1.5 | 2,
): DerivedMinute[] {
  return trace.records.map((r) => {
    if (r.missing || r.proposed === null) {
      return { frontendIops: null, throughputBytesPerSecond: null, backend: null };
    }
    const scaled =
      demandMultiplier === 1
        ? r
        : {
            ...r,
            proposed: {
              ...r.proposed,
              readIops: r.proposed.readIops * demandMultiplier,
              writeIops: r.proposed.writeIops * demandMultiplier,
            },
          };
    return deriveMinute(infra, scaled);
  });
}

export function assessTrace(
  infra: InfrastructureProfile,
  workload: WorkloadProfile,
  trace: Trace,
  options: AssessmentOptions,
): TraceAssessment {
  const budgets = traceBudgets(infra);
  const derived = deriveTraceMinutes(infra, trace, options.demandMultiplier);

  const feSeries = derived.map((d) => d.frontendIops);
  const thrSeries = derived.map((d) => d.throughputBytesPerSecond);
  const beSeries = derived.map((d) =>
    d.backend !== null && d.backend.kind === 'computed' ? d.backend.combinedTotal : null,
  );
  const latSeries = trace.records.map((r) => (r.missing ? null : r.baselineLatencyMs));
  const capSeries = trace.records.map((r) => (r.missing ? null : r.usedCapacityBytes));

  const cov = coverage(trace);
  const noBackendBudget = budgets.backendOps === null;
  const zeroExceedance: Exceedance = {
    minutes: 0,
    validMinutes: cov.valid,
    fractionOfValidMinutes: 0,
    longestRunMinutes: 0,
    runCount: 0,
    runs: [],
  };
  const feW: ResourceWeekly = { summary: weeklySummary(feSeries), budget: budgets.frontendIops, exceedance: exceedance(feSeries, budgets.frontendIops) };
  const beW: BackendWeekly = {
    summary: weeklySummary(beSeries),
    budget: budgets.backendOps,
    exceedance: noBackendBudget ? zeroExceedance : exceedance(beSeries, budgets.backendOps as number),
    unknownMinutes: noBackendBudget
      ? cov.valid
      : derived.filter((d, i) => !trace.records[i].missing && (d.backend === null || d.backend.kind === 'unknown')).length,
  };
  const thrW: ResourceWeekly = { summary: weeklySummary(thrSeries), budget: budgets.throughputBytesPerSecond, exceedance: exceedance(thrSeries, budgets.throughputBytesPerSecond) };
  const latW = {
    p90: weeklySummary(latSeries).p90,
    p95: weeklySummary(latSeries).p95,
    max: weeklySummary(latSeries).max,
  };
  const maxUsed = capSeries.reduce<number | null>(
    (m, v) => (v !== null && (m === null || v > m) ? v : m),
    null,
  );

  const defaultDay = selectDefaultDay(trace, derived, budgets);

  // Driving minutes per check.
  const feIdx = drivingMinute(feSeries, budgets.frontendIops);
  const thrIdx = drivingMinute(thrSeries, budgets.throughputBytesPerSecond);
  let beIdx = noBackendBudget ? null : drivingMinute(beSeries, budgets.backendOps as number);
  if (
    !noBackendBudget &&
    (beIdx === null || (beSeries[beIdx] as number) <= (budgets.backendOps as number)) &&
    derived.some((d) => d.backend !== null && d.backend.kind === 'unknown')
  ) {
    // Any unknown minute with no observed exceedance → earliest unknown minute drives.
    beIdx = derived.findIndex((d) => d.backend !== null && d.backend.kind === 'unknown');
  }
  if (beIdx === null && cov.valid > 0) {
    // No computable/exceeding minute (incl. missing backend limit): the
    // earliest valid minute drives so the M1 rule reports its own
    // "limit missing" needs-investigation.
    beIdx = trace.records.findIndex((r) => !r.missing);
  }
  const capIdx = capSeries.reduce<number | null>(
    (best, v, i) =>
      v !== null && (best === null || v > (capSeries[best] as number)) ? i : best,
    null,
  );

  // assessSample applies applyDemandMultiplier exactly once to the sample's
  // proposed demand — matching deriveTraceMinutes, so check evidence and the
  // weekly series stay at the same multiplier.
  const inner = { demandMultiplier: options.demandMultiplier, horizonYears: options.horizonYears };

  const sampleFor = (idx: number | null, label: string): DemandSample => {
    const i = idx ?? trace.records.findIndex((r) => !r.missing);
    const rec = trace.records[Math.max(i, 0)];
    return makeSample(
      `${label}@${rec.timestampUtc}`,
      rec,
      latW.p95,
      latW.max,
      idx === capIdx ? maxUsed : rec.usedCapacityBytes,
    );
  };

  const runCheck = (checkId: string, sample: DemandSample): CheckResult => {
    const a = assessSample(infra, workload, sample, inner);
    for (const d of a.dimensions)
      for (const c of d.checks) if (c.id === checkId) return c;
    throw new Error(`check ${checkId} not found`);
  };

  const checks: Record<string, { check: CheckResult; drivingIdx: number | null }> = {
    capacity: { check: runCheck('capacity', sampleFor(capIdx, 'capacity')), drivingIdx: capIdx },
    'iops.frontend': { check: runCheck('iops.frontend', sampleFor(feIdx, 'iops.frontend')), drivingIdx: feIdx },
    'iops.backend': { check: runCheck('iops.backend', sampleFor(beIdx, 'iops.backend')), drivingIdx: beIdx },
    throughput: { check: runCheck('throughput', sampleFor(thrIdx, 'throughput')), drivingIdx: thrIdx },
    latency: { check: runCheck('latency', sampleFor(capIdx ?? feIdx, 'latency')), drivingIdx: null },
    protection: { check: runCheck('protection', sampleFor(capIdx ?? feIdx, 'protection')), drivingIdx: null },
    growth: { check: runCheck('growth', sampleFor(capIdx, 'growth')), drivingIdx: capIdx },
  };

  // Weekly evidence + coverage policy. Incomplete coverage prevents a ready
  // result for coverage-driven checks; an observed constraint stands.
  const weeklyFor: Record<string, Evidence[]> = {
    'iops.frontend': weeklyEvidence('front-end IOPS', 'IOPS', feW.summary, feW.exceedance, cov),
    'iops.backend': weeklyEvidence('backend operations', 'ops/s', beW.summary, beW.exceedance, cov).concat([
      { label: 'backend unknown minutes', value: beW.unknownMinutes, unit: 'minutes', basis: 'minutes where the backend estimate is unknown' },
    ]),
    throughput: weeklyEvidence('throughput', 'bytes/second', thrW.summary, thrW.exceedance, cov),
    capacity: [
      {
        label: 'maximum used capacity over trace',
        value: maxUsed,
        unit: 'bytes',
        basis: 'maximum usedCapacityBytes over valid trace minutes (E-5)',
      },
    ],
    growth: [
      {
        label: 'maximum used capacity over trace',
        value: maxUsed,
        unit: 'bytes',
        basis: 'maximum usedCapacityBytes over valid trace minutes (E-5)',
      },
    ],
  };
  const coverageDriven = new Set(['capacity', 'iops.frontend', 'iops.backend', 'throughput', 'growth', 'latency']);

  const finalChecks: Record<string, CheckResult> = {};
  for (const [id, entry] of Object.entries(checks)) {
    const c = structuredClone(entry.check) as CheckResult;
    if (entry.drivingIdx !== null) c.drivingMinuteIndex = entry.drivingIdx;
    const ev = weeklyFor[id];
    if (ev && c.findings.length > 0) c.findings[0].evidence.push(...ev);
    if (cov.fraction < 1 && c.status === 'modeled-ready' && coverageDriven.has(id)) {
      c.status = 'needs-investigation';
      if (c.findings.length > 0) {
        c.findings[0].evidence.push({
          label: 'coverage downgrade',
          value: cov.fraction,
          unit: 'fraction',
          basis: 'weekly trace coverage',
          missingReason: `coverage ${cov.valid}/${cov.total} is below 100%; a ready result requires complete evidence`,
        });
        c.findings[0].condition += ` Downgraded: coverage ${cov.valid}/${cov.total} is below 100%.`;
        c.findings[0].confidence = 'insufficient';
      }
    }
    finalChecks[id] = c;
  }

  const dimensionOrder: DimensionResult['dimension'][] = [
    'capacity',
    'iops',
    'throughput',
    'latency',
    'protection',
    'growth',
  ];
  const dimensionChecks: Record<string, string[]> = {
    capacity: ['capacity'],
    iops: ['iops.frontend', 'iops.backend'],
    throughput: ['throughput'],
    latency: ['latency'],
    protection: ['protection'],
    growth: ['growth'],
  };
  const dimensions: DimensionResult[] = dimensionOrder.map((dim) => {
    const checks = dimensionChecks[dim].map((id) => finalChecks[id]);
    return { dimension: dim, status: combineStatuses(checks.map((c) => c.status)), checks };
  });

  return {
    rulesetVersion: `${RULESET_VERSION.replace('-m1', '-m2')}`,
    budgetFraction: 0.8,
    infrastructureId: infra.id,
    workloadId: workload.id,
    sampleId: `trace:${trace.startUtc}`,
    options,
    dimensions,
    overall: combineStatuses(dimensions.map((d) => d.status)),
    label: MANDATORY_LABEL,
    weekly: {
      coverage: cov,
      frontendIops: feW,
      backendOps: beW,
      throughput: thrW,
      latencyMs: latW,
      maxUsedCapacityBytes: maxUsed,
    },
    defaultDay,
  };
}

export function traceBuckets(
  trace: Trace,
  infra: InfrastructureProfile,
  options: AssessmentOptions,
): Bucket[] {
  return bucketize(trace, deriveTraceMinutes(infra, trace, options.demandMultiplier), traceBudgets(infra));
}
