import { budgetOf } from '../budget.js';
import type {
  CheckResult,
  DemandSample,
  InfrastructureProfile,
  LogicalDemand,
} from '../model.js';
import { formatBytesPerSecond, toKiB } from '../units.js';
import { budgetComparison, checkResult, evidence, headroomText } from './util.js';

// R-THR-1: throughput bytes/s = readIops × readBlockBytes + writeIops × writeBlockBytes,
// computed separately for existing and proposed demand, combined vs the budget.
export function demandThroughputBytesPerSecond(d: LogicalDemand): number {
  return d.readIops * d.readBlockBytes + d.writeIops * d.writeBlockBytes;
}

export function checkThroughput(
  infra: InfrastructureProfile,
  sample: DemandSample,
): CheckResult {
  const existing = demandThroughputBytesPerSecond(sample.existing);
  const proposed = demandThroughputBytesPerSecond(sample.proposed);
  const combined = existing + proposed;
  const cmp = budgetComparison({
    combined,
    limit: infra.limits.throughputBytesPerSecond,
    unit: 'bytes/second',
  });
  const budget = budgetOf(infra.limits.throughputBytesPerSecond);
  const findings = [
    {
      ruleId: 'R-THR-1',
      condition:
        cmp.status === 'modeled-ready'
          ? 'Combined throughput demand is within the throughput operating budget.'
          : 'Combined throughput demand exceeds the throughput operating budget.',
      evidence: [
        evidence('existing throughput', existing, 'bytes/second', 'derived: existing IOPS × block sizes'),
        evidence('proposed throughput', proposed, 'bytes/second', 'derived: proposed IOPS × block sizes'),
        evidence('throughput operating budget', budget, 'bytes/second', '0.8 × sustainable throughput limit'),
        evidence('sustainable throughput limit', infra.limits.throughputBytesPerSecond, 'bytes/second', 'synthetic infrastructure profile'),
      ],
      calculation: `existing ${formatBytesPerSecond(existing)} (${Math.round(toKiB(existing))} KiB/s) + proposed ${formatBytesPerSecond(proposed)} = ${formatBytesPerSecond(combined)} vs ${formatBytesPerSecond(budget)} budget; headroom ${headroomText(cmp.headroom)}.`,
      implication:
        cmp.status === 'modeled-ready'
          ? 'Modeled sustained bandwidth headroom exists for the proposed workload.'
          : 'Modeled sustained bandwidth demand exceeds the operating budget; host connectivity and front-end bandwidth assumptions become suspect.',
      nextInvestigation:
        'Verify sustained throughput limits and the read/write block-size mix; derived throughput depends on both.',
      confidence: 'high' as const,
      confidenceRationale:
        'Derived directly from declared IOPS and block sizes; synthetic values, not a measured limit.',
      assumptions: ['Throughput is derived from IOPS × block size, never an independent input.'],
    },
  ];
  return checkResult('throughput', cmp, findings);
}
