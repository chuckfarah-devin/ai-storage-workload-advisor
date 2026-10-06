import type {
  Assessment,
  AssessmentOptions,
  CheckResult,
  DemandSample,
  DimensionResult,
  InfrastructureProfile,
  WorkloadProfile,
} from './model.js';
import { MANDATORY_LABEL } from './model.js';
import { checkBackendIops } from './rules/backendIops.js';
import { checkCapacity } from './rules/capacity.js';
import { checkFrontendIops } from './rules/frontendIops.js';
import { checkGrowth } from './rules/growth.js';
import { checkLatency } from './rules/latency.js';
import { checkProtection } from './rules/protection.js';
import { checkThroughput } from './rules/throughput.js';
import { combineStatuses } from './status.js';
import { validateInfrastructure, validateSample, validateWorkload } from './validation.js';
import { applyDemandMultiplier } from './whatif.js';

export const RULESET_VERSION = '1.0.0-m1';

function dimension(
  dim: DimensionResult['dimension'],
  checks: CheckResult[],
): DimensionResult {
  return { dimension: dim, status: combineStatuses(checks.map((c) => c.status)), checks };
}

function assertValid(infra: InfrastructureProfile, workload: WorkloadProfile, sample: DemandSample): void {
  const results = [validateInfrastructure(infra), validateWorkload(workload), validateSample(infra, sample)];
  const diagnostics = results.flatMap((r) => r.diagnostics);
  if (diagnostics.length > 0) {
    throw new Error(
      'validation failed:\n' + diagnostics.map((d) => `  ${d.path}: ${d.message}`).join('\n'),
    );
  }
}

/**
 * Assess one aligned demand sample. Applies the demand multiplier to the
 * proposed demand exactly once (R-WHAT-1), then runs all scalar rules.
 */
export function assessSample(
  infra: InfrastructureProfile,
  workload: WorkloadProfile,
  sample: DemandSample,
  options: AssessmentOptions,
): Assessment {
  assertValid(infra, workload, sample);
  const s = applyDemandMultiplier(sample, options.demandMultiplier);

  const frontend = checkFrontendIops(infra, s);
  const backend = checkBackendIops(infra, s, frontend);
  const dimensions: DimensionResult[] = [
    dimension('capacity', [checkCapacity(infra, workload, s)]),
    dimension('iops', [frontend, backend]),
    dimension('throughput', [checkThroughput(infra, s)]),
    dimension('latency', [checkLatency(workload, s)]),
    dimension('protection', [checkProtection(infra, workload)]),
    dimension('growth', [checkGrowth(infra, workload, s, options.horizonYears)]),
  ];

  return {
    rulesetVersion: RULESET_VERSION,
    budgetFraction: 0.8,
    infrastructureId: infra.id,
    workloadId: workload.id,
    sampleId: s.id,
    options,
    dimensions,
    overall: combineStatuses(dimensions.map((d) => d.status)),
    label: MANDATORY_LABEL,
  };
}

/**
 * Assess a set of aligned samples. Per-check status combines across samples
 * with precedence constraint > needs-investigation > ready; the id of the
 * sample that drove each check's status is recorded as worstSampleId.
 */
export function assessSampleSet(
  infra: InfrastructureProfile,
  workload: WorkloadProfile,
  samples: DemandSample[],
  options: AssessmentOptions,
): Assessment {
  if (samples.length === 0) {
    throw new Error('assessSampleSet requires at least one sample');
  }
  const perSample = samples.map((s) => assessSample(infra, workload, s, options));

  // R-SET-1 sample-set selection. The combined status uses unchanged
  // precedence (constraint > needs-investigation > ready). Within the winning
  // tier (candidates whose status equals the combined status), numeric budget
  // checks select the highest budgetUtilization — largest exceedance in the
  // constraint tier, closest-to-budget in the ready tier — with ties broken by
  // input order. Checks with no magnitude (latency, protection, and numeric
  // checks whose tier is needs-investigation because the estimate was unknown)
  // select the earliest sample at the winning status: unknowns have no
  // magnitude, latency and protection have no budget denominator in V1, and M2
  // derives a single weekly latency P95 so per-sample latency variation is not
  // a selection signal. A tier mixing numeric and null utilizations is guarded
  // by treating null as lowest. The returned CheckResult keeps the selected
  // sample's evidence, findings, headroom, and utilizations.
  const dimensions: DimensionResult[] = perSample[0].dimensions.map((d0, di) => {
    const checks: CheckResult[] = d0.checks.map((_c0, ci) => {
      const candidates = perSample.map((a) => ({
        sampleId: a.sampleId,
        check: a.dimensions[di].checks[ci],
      }));
      const combined = combineStatuses(candidates.map((c) => c.check.status));
      const tier = candidates.filter((c) => c.check.status === combined);
      const anyNumeric = tier.some((c) => c.check.budgetUtilization !== null);
      let worst;
      let selectionBasis: CheckResult['selectionBasis'];
      if (anyNumeric) {
        worst = tier.reduce((best, c) =>
          (c.check.budgetUtilization ?? Number.NEGATIVE_INFINITY) >
          (best.check.budgetUtilization ?? Number.NEGATIVE_INFINITY)
            ? c
            : best,
        );
        selectionBasis = 'highest-budget-utilization';
      } else {
        worst = tier[0];
        selectionBasis = 'earliest-at-status';
      }
      return {
        ...worst.check,
        status: combined,
        worstSampleId: worst.sampleId,
        selectionBasis,
        tierSampleIds: tier.map((t) => t.sampleId),
      };
    });
    return dimension(d0.dimension, checks);
  });

  return {
    rulesetVersion: RULESET_VERSION,
    budgetFraction: 0.8,
    infrastructureId: infra.id,
    workloadId: workload.id,
    sampleId: samples.map((s) => s.id).join(','),
    options,
    dimensions,
    overall: combineStatuses(dimensions.map((d) => d.status)),
    label: MANDATORY_LABEL,
  };
}
