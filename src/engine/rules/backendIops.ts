import { budgetOf } from '../budget.js';
import type {
  BackendEstimate,
  BackendResult,
  CheckResult,
  DemandSample,
  Finding,
  InfrastructureProfile,
  LogicalDemand,
  RaidLayout,
} from '../model.js';
import { budgetComparison, checkResult, evidence, headroomText } from './util.js';

// R-BE-1..R-BE-4: classic read-modify-write backend model.
// Each logical write on RAID 5 = 2 backend reads + 2 backend writes (factor 4);
// on RAID 6 = 3 backend reads + 3 backend writes (factor 6).
export function rmwFactors(layout: RaidLayout): { reads: number; writes: number } {
  return layout === 'raid5' ? { reads: 2, writes: 2 } : { reads: 3, writes: 3 };
}

export type DemandEstimate =
  | { kind: 'computed'; estimate: BackendEstimate }
  | { kind: 'unknown'; reason: string };

function applicabilityReason(
  infra: InfrastructureProfile,
  side: 'existing' | 'proposed',
  demand: LogicalDemand,
): string | null {
  const block = infra.backend.backendBlockBytes;
  if (block === null || block === undefined) {
    return 'the modeled backend block size is not declared; the classic read-modify-write factor cannot be applied';
  }
  if (demand.readBlockBytes > block || demand.writeBlockBytes > block) {
    return `${side} IO size exceeds the modeled backend block (read ${demand.readBlockBytes} bytes, write ${demand.writeBlockBytes} bytes, backend block ${block} bytes); the classic read-modify-write factor does not apply; full-stripe or multi-block behavior is outside V1 scope.`;
  }
  return null;
}

/** Derive the backend estimate for one side of logical demand, or explain why unknown. */
export function estimateBackend(
  infra: InfrastructureProfile,
  side: 'existing' | 'proposed',
  demand: LogicalDemand,
): DemandEstimate {
  const reason = applicabilityReason(infra, side, demand);
  if (reason !== null) return { kind: 'unknown', reason };
  const hit = infra.backend.readCacheHitFraction;
  if (hit === null || hit === undefined) {
    return {
      kind: 'unknown',
      reason:
        'the read-cache hit fraction is not declared; the backend read estimate is unknown',
    };
  }
  const rmw = rmwFactors(infra.backend.layout);
  const reads = demand.readIops * (1 - hit) + demand.writeIops * rmw.reads;
  const writes = demand.writeIops * rmw.writes;
  return { kind: 'computed', estimate: { reads, writes, total: reads + writes } };
}

function globalBackendUnknown(infra: InfrastructureProfile): string | null {
  if (infra.backend.writePolicy !== 'write-back-no-coalescing') {
    return `write policy '${infra.backend.writePolicy}' is outside the modeled 'write-back-no-coalescing' boundary; the backend estimate is unknown`;
  }
  if (
    infra.limits.backendOpsPerSecond === null ||
    infra.limits.backendOpsPerSecond === undefined ||
    infra.limits.backendOpsPerSecond <= 0
  ) {
    return 'the backend sustainable operation limit is absent or nonpositive; the backend check cannot be evaluated';
  }
  if (infra.backend.readCacheHitFraction === null || infra.backend.readCacheHitFraction === undefined) {
    return 'the read-cache hit fraction is not declared; the backend read estimate is unknown';
  }
  return null;
}

/** R-BE-2: resolve the existing backend demand according to existingBackendBasis. */
export function backendResult(
  infra: InfrastructureProfile,
  sample: DemandSample,
): BackendResult {
  const globalReason = globalBackendUnknown(infra);
  if (globalReason !== null) return { kind: 'unknown', reason: globalReason };

  let existing: BackendEstimate;
  if (infra.backend.existingBackendBasis === 'supplied-physical') {
    // Validation guarantees suppliedExistingBackend is present here.
    const s = sample.suppliedExistingBackend as { reads: number; writes: number };
    existing = { reads: s.reads, writes: s.writes, total: s.reads + s.writes };
  } else {
    const e = estimateBackend(infra, 'existing', sample.existing);
    if (e.kind === 'unknown') return { kind: 'unknown', reason: e.reason };
    existing = e.estimate;
  }

  const p = estimateBackend(infra, 'proposed', sample.proposed);
  if (p.kind === 'unknown') return { kind: 'unknown', reason: p.reason };

  const background = sample.backgroundBackendOpsPerSecond;
  return {
    kind: 'computed',
    existing,
    background,
    proposed: p.estimate,
    combinedTotal: existing.total + background + p.estimate.total,
  };
}

export function checkBackendIops(
  infra: InfrastructureProfile,
  sample: DemandSample,
  frontend: CheckResult,
): CheckResult {
  const result = backendResult(infra, sample);
  const rmw = rmwFactors(infra.backend.layout);
  const layoutLabel = infra.backend.layout === 'raid5' ? 'RAID 5' : 'RAID 6';

  if (result.kind === 'unknown') {
    const finding: Finding = {
      ruleId: 'R-BE-3',
      condition: 'Backend operation demand cannot be estimated for this sample.',
      evidence: [
        evidence('backend estimate', null, 'ops/s', 'backend model', {
          missingReason: result.reason,
        }),
        evidence('existing read block', sample.existing.readBlockBytes, 'bytes', 'aligned demand sample'),
        evidence('existing write block', sample.existing.writeBlockBytes, 'bytes', 'aligned demand sample'),
        evidence('proposed read block', sample.proposed.readBlockBytes, 'bytes', 'aligned demand sample'),
        evidence('proposed write block', sample.proposed.writeBlockBytes, 'bytes', 'aligned demand sample'),
        evidence('modeled backend block', infra.backend.backendBlockBytes, 'bytes', 'synthetic infrastructure profile'),
      ],
      calculation: `No backend estimate produced: ${result.reason}`,
      implication:
        'The backend load for this demand sample is unknown; the IOPS dimension cannot be unconditionally ready.',
      nextInvestigation:
        'Determine the real backend behavior for this IO profile (full-stripe or multi-block handling is outside V1) or bound the demand to the modeled block size.',
      confidence: 'insufficient',
      confidenceRationale: 'An unknown participates: the model deliberately refuses to extrapolate.',
      assumptions: [
        'The classic read-modify-write model applies only when read and write block sizes are at or below the modeled backend block.',
      ],
    };
    return {
      id: 'iops.backend',
      status: 'needs-investigation',
      headroom: null,
      budgetUtilization: null,
      limitUtilization: null,
      findings: [finding],
    };
  }

  const cmp = budgetComparison({
    combined: result.combinedTotal,
    limit: infra.limits.backendOpsPerSecond as number,
    unit: 'ops/s',
  });
  const budget = budgetOf(infra.limits.backendOpsPerSecond as number);
  const frontendHeadroomNote =
    frontend.status === 'modeled-ready' && cmp.status === 'modeled-constraint'
      ? ' Front-end headroom exists, but backend operations exceed the budget because of the RAID write factor.'
      : '';
  const finding: Finding = {
    ruleId:
      cmp.status === 'modeled-constraint' && frontend.status === 'modeled-ready'
        ? 'R-BE-4'
        : 'R-BE-1',
    condition:
      cmp.status === 'modeled-ready'
        ? 'Combined backend operation demand is within the backend operating budget.'
        : `Combined backend operation demand exceeds the backend operating budget.${frontendHeadroomNote}`,
    evidence: [
      evidence('existing backend reads', result.existing.reads, 'ops/s', infra.backend.existingBackendBasis === 'supplied-physical' ? 'supplied physical telemetry' : 'derived from existing logical demand'),
      evidence('existing backend writes', result.existing.writes, 'ops/s', infra.backend.existingBackendBasis === 'supplied-physical' ? 'supplied physical telemetry' : 'derived from existing logical demand'),
      evidence('background backend demand', result.background, 'ops/s', 'declared on the demand sample; added exactly once'),
      evidence('proposed backend reads', result.proposed.reads, 'ops/s', 'derived: proposed reads × (1 − hit) + writes × factor'),
      evidence('proposed backend writes', result.proposed.writes, 'ops/s', 'derived: proposed writes × factor'),
      evidence('backend operating budget', budget, 'ops/s', '0.8 × backend sustainable operation limit'),
      evidence('backend sustainable operation limit', infra.limits.backendOpsPerSecond, 'ops/s', 'synthetic infrastructure profile'),
    ],
    calculation:
      `existing ${result.existing.total} ops/s + background ${result.background} + proposed ${result.proposed.total} ops/s ` +
      `(reads ${result.proposed.reads} + writes ${result.proposed.writes}; ${layoutLabel} factor ${rmw.reads}+${rmw.writes} per logical write) ` +
      `= ${result.combinedTotal} ops/s vs ${budget} ops/s budget; headroom ${headroomText(cmp.headroom)}.`,
    implication:
      cmp.status === 'modeled-ready'
        ? `Modeled backend load is within budget under the ${layoutLabel} read-modify-write factor.`
        : `The ${layoutLabel} write factor pushes modeled backend operations over budget.${frontendHeadroomNote}`,
    nextInvestigation:
      cmp.status === 'modeled-ready'
        ? 'Validate cache-hit fraction and write policy on the real system before relying on the estimate.'
        : 'Investigate whether the real array coalesces writes (outside the V1 model), or reduce proposed write demand.',
    confidence: 'high',
    confidenceRationale:
      'Arithmetic on complete declared inputs within the explicitly bounded model; not a physical-array simulation.',
    assumptions: [
      `${layoutLabel} classic read-modify-write: each logical write costs ${rmw.reads} backend reads + ${rmw.writes} backend writes.`,
      'Write-back cache with no coalescing; sustained writes are not treated as zero.',
      'Full-stripe writes, erasure coding, compression/dedup, metadata IO, flash write amplification, replication overhead, and rebuild load are outside this calculation.',
    ],
  };
  return checkResult('iops.backend', cmp, [finding]);
}
