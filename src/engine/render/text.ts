import type { Assessment, CheckResult, Finding } from '../model.js';
import { formatHeadroom } from '../units.js';

function pct(v: number | null): string {
  return v === null ? 'n/a' : `${(v * 100).toFixed(1)}%`;
}

function renderCheck(c: CheckResult): string[] {
  const lines = [`  Check ${c.id}: ${c.status}`];
  if (c.worstSampleId !== undefined) lines.push(`    worst sample: ${c.worstSampleId}`);
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
