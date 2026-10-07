import { budgetOf } from '../budget.js';
import type {
  CheckResult,
  DemandSample,
  InfrastructureProfile,
} from '../model.js';
import { budgetComparison, checkResult, evidence, headroomText } from './util.js';

// R-FE-1: combined logical front-end IOPS (existing + proposed) vs the
// front-end IOPS operating budget. Equality is within budget.
export function checkFrontendIops(
  infra: InfrastructureProfile,
  sample: DemandSample,
): CheckResult {
  const existingIops = sample.existing.readIops + sample.existing.writeIops;
  const proposedIops = sample.proposed.readIops + sample.proposed.writeIops;
  const combined = existingIops + proposedIops;
  const cmp = budgetComparison({
    combined,
    limit: infra.limits.frontendIops,
    unit: 'IOPS',
  });
  const budget = budgetOf(infra.limits.frontendIops);
  const findings = [
    {
      ruleId: 'R-FE-1',
      condition:
        cmp.status === 'modeled-ready'
          ? 'Combined front-end IOPS demand is within the front-end operating budget.'
          : 'Combined front-end IOPS demand exceeds the front-end operating budget.',
      evidence: [
        evidence('existing front-end IOPS', existingIops, 'IOPS', 'aligned demand sample (reads + writes)'),
        evidence('proposed front-end IOPS', proposedIops, 'IOPS', 'aligned demand sample (reads + writes)'),
        evidence('front-end IOPS operating budget', budget, 'IOPS', '0.8 × sustainable front-end IOPS limit'),
        evidence('sustainable front-end IOPS limit', infra.limits.frontendIops, 'IOPS', 'synthetic infrastructure profile'),
      ],
      calculation: `${existingIops} existing + ${proposedIops} proposed = ${combined} IOPS vs ${budget} budget; headroom ${headroomText(cmp.headroom)}.`,
      implication:
        cmp.status === 'modeled-ready'
          ? 'Front-end logical IOPS headroom exists for the proposed workload.'
          : 'Front-end logical IOPS demand exceeds the operating budget; the array front end is a candidate bottleneck.',
      nextInvestigation:
        'Confirm the declared sustainable IOPS envelope and the aligned demand peak on a real source.',
      confidence: 'high' as const,
      confidenceRationale:
        'Arithmetic comparison on complete declared inputs; synthetic values are not measured on a real array.',
      assumptions: ['Existing and proposed demand are aligned to the same modeled interval.'],
    },
  ];
  return checkResult('iops.frontend', cmp, findings);
}
