import type {
  CheckResult,
  DemandSample,
  WorkloadProfile,
} from '../model.js';
import { evidence } from './util.js';

// R-LAT-1: baseline weekly P95 latency (screening indicator, max shown alongside)
// vs the workload target. P95 > target → modeled constraint labeled
// "baseline, before addition". P95 at/below target → needs investigation:
// post-addition latency is unknown in V1 (no validated response curve).
// Missing P95 or missing target → needs investigation. Never modeled-ready.
export function checkLatency(
  workload: WorkloadProfile,
  sample: DemandSample,
): CheckResult {
  const p95 = sample.baselineLatency.p95Ms;
  const max = sample.baselineLatency.maxMs;
  const target = workload.latencyTargetMs;

  const maxEvidence = [
    evidence('baseline maximum latency', max, 'ms', sample.baselineLatency === undefined ? 'not supplied' : 'aligned demand sample', {
      missingReason: max === null ? 'baseline maximum latency not supplied' : undefined,
    }),
    evidence('workload latency target', target, 'ms', 'synthetic workload profile', {
      missingReason: target === null ? 'no latency target declared' : undefined,
    }),
  ];

  if (p95 === null || target === null) {
    const missing =
      p95 === null && target === null
        ? 'baseline P95 latency and latency target are both missing'
        : p95 === null
          ? 'baseline P95 latency is missing'
          : 'workload latency target is missing';
    return {
      id: 'latency',
      status: 'needs-investigation',
      headroom: null,
      budgetUtilization: null,
      limitUtilization: null,
      findings: [
        {
          ruleId: 'R-LAT-1',
          condition: `Latency cannot be screened: ${missing}.`,
          evidence: [
            evidence('baseline P95 latency', p95, 'ms', 'aligned demand sample', {
              missingReason: p95 === null ? 'baseline P95 latency not supplied' : undefined,
            }),
            ...maxEvidence,
          ],
          calculation: 'No comparison performed; required evidence is missing.',
          implication:
            'Post-addition latency readiness cannot be established; V1 has no validated response curve.',
          nextInvestigation: 'Obtain baseline latency evidence and a workload latency target.',
          confidence: 'insufficient',
          confidenceRationale: 'An unknown participates: required latency evidence is missing.',
          assumptions: ['V1 has no validated latency response curve; post-addition latency is never modeled-ready.'],
        },
      ],
    };
  }

  const constrained = p95 > target;
  const findings = [
    {
      ruleId: 'R-LAT-1',
      condition: constrained
        ? `Baseline P95 latency ${p95} ms exceeds the workload target ${target} ms (baseline, before addition).`
        : `Baseline P95 latency ${p95} ms is at or below the workload target ${target} ms; post-addition latency unknown: no validated response curve in V1.`,
      evidence: [
        evidence('baseline P95 latency', p95, 'ms', 'aligned demand sample (screening indicator)'),
        ...maxEvidence,
      ],
      calculation: `baseline P95 ${p95} ms vs target ${target} ms; baseline max ${max ?? 'unknown'} ms shown alongside.`,
      implication: constrained
        ? 'The existing environment already exceeds the workload latency target before the proposed workload is added.'
        : 'No baseline latency concern is indicated, but this says nothing about latency after the proposed workload is added.',
      nextInvestigation: constrained
        ? 'Investigate the existing latency source before adding demand; the constraint is a baseline condition, not caused by the proposed workload.'
        : 'Establish post-addition latency with a validated response model or measurements; V1 cannot.',
      confidence: constrained ? ('high' as const) : ('insufficient' as const),
      confidenceRationale: constrained
        ? 'Arithmetic comparison on supplied evidence; a baseline condition, not a post-addition prediction.'
        : 'Post-addition latency is an unknown in V1 by design.',
      assumptions: [
        'Baseline P95 is a screening indicator only; the maximum is shown alongside.',
        'Post-addition latency unknown: no validated response curve in V1.',
      ],
    },
    {
      ruleId: 'R-LAT-1',
      condition: 'Baseline maximum latency is reported alongside P95 as context.',
      evidence: maxEvidence,
      calculation: `baseline max ${max ?? 'unknown'} ms vs target ${target} ms; the max is context, not the screening statistic.`,
      implication:
        'Single-interval maxima can exceed the target even when P95 does not; both are baseline evidence only.',
      nextInvestigation: 'Review the distribution of minute latencies in the M2 weekly statistics.',
      confidence: 'high' as const,
      confidenceRationale: 'Reported value from supplied evidence; no inference made.',
      assumptions: ['Latency evidence is synthetic baseline data for the existing environment only.'],
    },
  ];

  return {
    id: 'latency',
    status: constrained ? 'modeled-constraint' : 'needs-investigation',
    headroom: null,
    budgetUtilization: null,
    limitUtilization: null,
    findings,
  };
}
