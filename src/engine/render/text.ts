import type { Assessment, CheckResult, Finding } from '../model.js';
import type { TraceAssessment } from '../trace/assessTrace.js';
import { formatBytesPerSecond, formatHeadroom, formatBytes } from '../units.js';

function pct(v: number | null): string {
  return v === null ? 'n/a' : `${(v * 100).toFixed(1)}%`;
}

function renderCheck(c: CheckResult): string[] {
  const lines = [`  Check ${c.id}: ${c.status}`];
  if (c.worstSampleId !== undefined) lines.push(`    worst sample: ${c.worstSampleId}`);
  if (c.drivingMinuteIndex !== undefined) lines.push(`    driving minute: ${c.drivingMinuteIndex}`);
  lines.push(`    headroom: ${formatHeadroom2(c.headroom)}`);
  lines.push(`    % of operating budget: ${pct(c.budgetUtilization)}   % of limit: ${pct(c.limitUtilization)}`);
  for (const f of c.findings) lines.push(...renderFinding(f));
  return lines;
}

function formatHeadroom2(h: CheckResult['headroom']): string {
  return h === null ? 'n/a' : formatHeadroom(h.value, h.unit);
}

function renderFinding(f: Finding): string[] {
  const lines = [
    `    Finding ${f.ruleId}: ${f.condition}`,
    `      evidence:`,
    ...f.evidence.map(
      (e) =>
        `        - ${e.label}: ${e.value === null ? 'unknown' : e.value} ${e.unit} (basis: ${e.basis}` +
        `${e.missingReason ? `; missing: ${e.missingReason}` : ''})`,
    ),
    `      calculation: ${f.calculation}`,
    `      implication: ${f.implication}`,
    `      next investigation: ${f.nextInvestigation}`,
    `      confidence: ${f.confidence} — ${f.confidenceRationale}`,
    `      assumptions:`,
    ...f.assumptions.map((a) => `        - ${a}`),
  ];
  return lines;
}

/** Plain-text rendering of one assessment (label first, then overall). */
export function renderAssessmentText(a: Assessment): string {
  const lines: string[] = [
    a.label,
    `Overall: ${a.overall}`,
    `Ruleset: ${a.rulesetVersion}   Budget fraction: ${a.budgetFraction}`,
    `Infrastructure: ${a.infrastructureId}   Workload: ${a.workloadId}   Sample: ${a.sampleId}`,
    `Options: demand multiplier ${a.options.demandMultiplier}x, horizon ${a.options.horizonYears} year(s)`,
  ];
  for (const d of a.dimensions) {
    lines.push(`Dimension ${d.dimension}: ${d.status}`);
    for (const c of d.checks) lines.push(...renderCheck(c));
  }
  return lines.join('\n');
}

function fmtVal(v: number | null, unit: string): string {
  if (v === null) return 'n/a';
  if (unit === 'bytes') return formatBytes(v);
  if (unit === 'bytes/second') return formatBytesPerSecond(v);
  return `${Math.round(v * 100) / 100} ${unit}`;
}

function weeklyLine(
  name: string,
  unit: string,
  w: { summary: { mean: number | null; p90: number | null; p95: number | null; max: number | null }; budget: number | null; exceedance: { minutes: number; fractionOfValidMinutes: number; longestRunMinutes: number; runCount: number } },
): string {
  return (
    `  ${name}: mean ${fmtVal(w.summary.mean, unit)}  P90 ${fmtVal(w.summary.p90, unit)}  ` +
    `P95 ${fmtVal(w.summary.p95, unit)}  max ${fmtVal(w.summary.max, unit)}  |  ` +
    `budget ${fmtVal(w.budget, unit)}  |  exceedance ${w.exceedance.minutes} min ` +
    `(${(w.exceedance.fractionOfValidMinutes * 100).toFixed(2)}% of valid), ` +
    `longest run ${w.exceedance.longestRunMinutes} min, ${w.exceedance.runCount} runs`
  );
}

/** Plain-text rendering of a weekly trace assessment (M2). */
export function renderTraceAssessmentText(a: TraceAssessment): string {
  const w = a.weekly;
  const lines: string[] = [
    a.label,
    `Overall: ${a.overall}`,
    `Ruleset: ${a.rulesetVersion}   Budget fraction: ${a.budgetFraction}`,
    `Infrastructure: ${a.infrastructureId}   Workload: ${a.workloadId}   Trace: ${a.sampleId}`,
    `Options: demand multiplier ${a.options.demandMultiplier}x, horizon ${a.options.horizonYears} year(s)`,
    `Weekly (10,080-minute trace; coverage ${w.coverage.valid}/${w.coverage.total} = ${(w.coverage.fraction * 100).toFixed(1)}%):`,
    weeklyLine('front-end IOPS', 'IOPS', w.frontendIops),
    weeklyLine('backend ops', 'ops/s', w.backendOps) + `  |  unknown minutes ${w.backendOps.unknownMinutes}`,
    weeklyLine('throughput', 'bytes/second', w.throughput),
    `  latency: P90 ${w.latencyMs.p90} ms  P95 ${w.latencyMs.p95} ms  max ${w.latencyMs.max} ms`,
    `  max used capacity: ${w.maxUsedCapacityBytes === null ? 'n/a' : formatBytes(w.maxUsedCapacityBytes)}`,
    `Default detail day: day ${a.defaultDay.dayIndex} (${['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'][a.defaultDay.dayIndex]}) — ${a.defaultDay.reason}`,
  ];
  for (const d of a.dimensions) {
    lines.push(`Dimension ${d.dimension}: ${d.status}`);
    for (const c of d.checks) lines.push(...renderCheck(c));
  }
  return lines.join('\n');
}
