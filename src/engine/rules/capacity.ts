import { budgetOf } from '../budget.js';
import type {
  CheckResult,
  DemandSample,
  InfrastructureProfile,
  WorkloadProfile,
} from '../model.js';
import { formatBytes } from '../units.js';
import { budgetComparison, checkResult, evidence, headroomText } from './util.js';

// R-CAP-1: current capacity = sample used capacity + proposed workload capacity,
// compared against the capacity operating budget.
export function checkCapacity(
  infra: InfrastructureProfile,
  workload: WorkloadProfile,
  sample: DemandSample,
): CheckResult {
  const used = sample.usedCapacityBytes;
  const proposed = workload.capacityBytes;
  const combined = used + proposed;
  const cmp = budgetComparison({
    combined,
    limit: infra.capacity.usableBytes,
    unit: 'bytes',
  });
  const budget = budgetOf(infra.capacity.usableBytes);
  const findings = [
    {
      ruleId: 'R-CAP-1',
      condition:
        cmp.status === 'modeled-ready'
          ? 'Combined used plus proposed capacity is within the capacity operating budget.'
          : 'Combined used plus proposed capacity exceeds the capacity operating budget.',
      evidence: [
        evidence('existing used capacity', used, 'bytes', 'aligned demand sample'),
        evidence('proposed workload capacity', proposed, 'bytes', 'synthetic workload profile'),
        evidence('capacity operating budget', budget, 'bytes', '0.8 × usable capacity'),
        evidence('usable capacity limit', infra.capacity.usableBytes, 'bytes', 'synthetic infrastructure profile'),
      ],
      calculation: `${formatBytes(used)} used + ${formatBytes(proposed)} proposed = ${formatBytes(combined)} combined vs ${formatBytes(budget)} budget (0.8 × ${formatBytes(infra.capacity.usableBytes)} usable); headroom ${headroomText(cmp.headroom)}.`,
      implication:
        cmp.status === 'modeled-ready'
          ? 'Modeled capacity headroom exists for the proposed workload at the declared synthetic values.'
          : 'The proposed workload pushes modeled used capacity beyond the operating budget; usable capacity planning is required.',
      nextInvestigation:
        cmp.status === 'modeled-ready'
          ? 'Confirm real usable capacity and current consumption before relying on this result.'
          : 'Investigate capacity expansion, reclamation, or a smaller workload footprint.',
      confidence: 'high' as const,
      confidenceRationale:
        'Arithmetic comparison on complete declared inputs; synthetic values are not validated against a real array.',
      assumptions: ['Usable capacity excludes spares and metadata reserves.'],
    },
  ];
  return checkResult('capacity', cmp, findings);
}
