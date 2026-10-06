import { budgetOf } from '../budget.js';
import type {
  CheckResult,
  DemandSample,
  InfrastructureProfile,
  WorkloadProfile,
} from '../model.js';
import { formatBytes } from '../units.js';
import { budgetComparison, checkResult, evidence, headroomText } from './util.js';

// R-GRO-1: projected capacity at horizon h years =
//   used × (1 + existing growth)^h + proposed × (1 + proposed growth)^h
// compared against the capacity operating budget. h = 0 equals current capacity.
export function checkGrowth(
  infra: InfrastructureProfile,
  workload: WorkloadProfile,
  sample: DemandSample,
  horizonYears: number,
): CheckResult {
  const used = sample.usedCapacityBytes;
  const projected =
    used * (1 + infra.capacity.annualGrowthFraction) ** horizonYears +
    workload.capacityBytes * (1 + workload.annualGrowthFraction) ** horizonYears;
  const cmp = budgetComparison({
    combined: projected,
    limit: infra.capacity.usableBytes,
    unit: 'bytes',
  });
  const budget = budgetOf(infra.capacity.usableBytes);
  const findings = [
    {
      ruleId: 'R-GRO-1',
      condition:
        cmp.status === 'modeled-ready'
          ? `Projected capacity at the ${horizonYears}-year horizon is within the capacity operating budget.`
          : `Projected capacity at the ${horizonYears}-year horizon exceeds the capacity operating budget.`,
      evidence: [
        evidence('existing used capacity', used, 'bytes', 'aligned demand sample'),
        evidence('existing annual growth fraction', infra.capacity.annualGrowthFraction, 'fraction', 'synthetic infrastructure profile'),
        evidence('proposed workload capacity', workload.capacityBytes, 'bytes', 'synthetic workload profile'),
        evidence('proposed annual growth fraction', workload.annualGrowthFraction, 'fraction', 'synthetic workload profile'),
        evidence('planning horizon', horizonYears, 'years', 'assessment option'),
        evidence('capacity operating budget', budget, 'bytes', '0.8 × usable capacity'),
      ],
      calculation: `projected = ${formatBytes(used)} × (1 + ${infra.capacity.annualGrowthFraction})^${horizonYears} + ${formatBytes(workload.capacityBytes)} × (1 + ${workload.annualGrowthFraction})^${horizonYears} = ${formatBytes(projected)} vs ${formatBytes(budget)} budget; headroom ${headroomText(cmp.headroom)}.`,
      implication:
        cmp.status === 'modeled-ready'
          ? `The modeled environment retains capacity headroom at the ${horizonYears}-year planning horizon.`
          : `Growth projection exceeds the capacity operating budget within ${horizonYears} year(s); capacity expansion timing becomes a planning constraint.`,
      nextInvestigation:
        'Validate the declared growth fractions against observed consumption trends; compound growth dominates at longer horizons.',
      confidence: 'high' as const,
      confidenceRationale:
        'Deterministic compound-growth arithmetic on declared synthetic inputs; growth rates themselves are assumptions.',
      assumptions: [
        'Annual growth fractions are synthetic assumptions, not observed trends.',
        `Horizon is ${horizonYears} year(s); horizon 0 equals the current-capacity check.`,
      ],
    },
  ];
  return checkResult('growth', cmp, findings);
}
