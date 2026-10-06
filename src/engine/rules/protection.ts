import type {
  CheckResult,
  Confidence,
  Evidence,
  InfrastructureProfile,
  Status,
  WorkloadProfile,
} from '../model.js';
import { combineStatuses } from '../status.js';
import { evidence } from './util.js';

const VOCABULARY_CAVEAT =
  'The V1 capability vocabulary covers selected capabilities, not complete availability assurance.';

interface CapabilityCheck {
  label: string;
  status: Status;
  detail: string;
  requiredEvidence: Evidence;
  availableEvidence: Evidence;
}

function replicationStatus(
  required: 'none' | 'async' | 'sync',
  available: 'none' | 'async' | 'sync' | 'unknown',
): { status: Status; detail: string } {
  if (required === 'none') {
    return { status: 'modeled-ready', detail: 'no replication is required, so any replication capability satisfies the requirement' };
  }
  if (available === 'unknown') {
    return { status: 'needs-investigation', detail: `replication ${required} is required but the infrastructure capability is unknown` };
  }
  if (available === required || (required === 'async' && available === 'sync')) {
    return { status: 'modeled-ready', detail: `replication requirement ${required} is satisfied by capability ${available}` };
  }
  return { status: 'modeled-constraint', detail: `replication requirement ${required} is not met by capability ${available}` };
}

// R-PRO-1: fixed-vocabulary capability matching. A definite shortfall is a
// constraint; an unknown capability against a requirement is needs
// investigation; a 'none' replication requirement is satisfied regardless.
export function checkProtection(
  infra: InfrastructureProfile,
  workload: WorkloadProfile,
): CheckResult {
  const req = workload.protectionRequired;
  const cap = infra.protection;
  const checks: CapabilityCheck[] = [];

  // toleratedDriveFailures
  if (cap.toleratedDriveFailures === null || cap.toleratedDriveFailures === undefined) {
    checks.push({
      label: 'toleratedDriveFailures',
      status: 'needs-investigation',
      detail: 'infrastructure tolerated drive failures is unknown against a requirement',
      requiredEvidence: evidence('minimum tolerated drive failures required', req.minToleratedDriveFailures, 'count', 'workload protection requirement'),
      availableEvidence: evidence('tolerated drive failures', null, 'count', 'synthetic infrastructure profile', { missingReason: 'capability not declared' }),
    });
  } else if (req.minToleratedDriveFailures === null || req.minToleratedDriveFailures === undefined) {
    checks.push({
      label: 'toleratedDriveFailures',
      status: 'needs-investigation',
      detail: 'workload does not declare a minimum tolerated-drive-failure requirement',
      requiredEvidence: evidence('minimum tolerated drive failures required', null, 'count', 'workload protection requirement', { missingReason: 'requirement not declared' }),
      availableEvidence: evidence('tolerated drive failures', cap.toleratedDriveFailures, 'count', 'synthetic infrastructure profile'),
    });
  } else {
    const ok = cap.toleratedDriveFailures >= req.minToleratedDriveFailures;
    checks.push({
      label: 'toleratedDriveFailures',
      status: ok ? 'modeled-ready' : 'modeled-constraint',
      detail: `requires tolerating ${req.minToleratedDriveFailures} drive failure(s); the layout tolerates ${cap.toleratedDriveFailures}`,
      requiredEvidence: evidence('minimum tolerated drive failures required', req.minToleratedDriveFailures, 'count', 'workload protection requirement'),
      availableEvidence: evidence('tolerated drive failures', cap.toleratedDriveFailures, 'count', 'synthetic infrastructure profile'),
    });
  }

  // boolean capabilities: snapshots, encryptionAtRest
  for (const key of ['snapshots', 'encryptionAtRest'] as const) {
    const required = req[key];
    const available = cap[key];
    let status: Status;
    let detail: string;
    if (!required) {
      status = 'modeled-ready';
      detail = `${key} is not required; capability ${available === null ? 'unknown' : available} is acceptable`;
    } else if (available === null || available === undefined) {
      status = 'needs-investigation';
      detail = `${key} is required but the infrastructure capability is unknown`;
    } else {
      status = available ? 'modeled-ready' : 'modeled-constraint';
      detail = available
        ? `${key} is required and declared`
        : `${key} is required but not declared by the infrastructure profile`;
    }
    checks.push({
      label: key,
      status,
      detail,
      requiredEvidence: evidence(`${key} required`, required, 'flag', 'workload protection requirement'),
      availableEvidence: evidence(`${key} capability`, available, 'flag', 'synthetic infrastructure profile', {
        missingReason: available === null || available === undefined ? 'capability not declared' : undefined,
      }),
    });
  }

  // replication
  const rep = replicationStatus(req.replicationRequired, cap.replication);
  checks.push({
    label: 'replication',
    status: rep.status,
    detail: rep.detail,
    requiredEvidence: evidence('replication required', req.replicationRequired, 'mode', 'workload protection requirement'),
    availableEvidence: evidence('replication capability', cap.replication, 'mode', 'synthetic infrastructure profile', {
      missingReason: cap.replication === 'unknown' ? 'replication capability not modeled' : undefined,
    }),
  });

  const statuses = checks.map((c) => c.status);
  const status = combineStatuses(statuses);
  const anyUnknown = statuses.includes('needs-investigation');
  const confidence: Confidence = anyUnknown ? 'insufficient' : 'moderate';
  const shortfalls = checks.filter((c) => c.status === 'modeled-constraint');
  const unknowns = checks.filter((c) => c.status === 'needs-investigation');

  const finding = {
    ruleId: 'R-PRO-1',
    condition:
      status === 'modeled-ready'
        ? 'All declared workload protection requirements are satisfied by the infrastructure capabilities.'
        : status === 'modeled-constraint'
          ? `Protection shortfall: ${shortfalls.map((c) => c.detail).join('; ')}.`
          : `Protection cannot be fully confirmed: ${unknowns.map((c) => c.detail).join('; ')}.`,
    evidence: checks.flatMap((c) => [c.requiredEvidence, c.availableEvidence]),
    calculation:
      'Capability matching over the fixed V1 vocabulary: ' +
      checks.map((c) => `${c.label}: required ${String(c.requiredEvidence.value)} vs available ${String(c.availableEvidence.value)} → ${c.status}`).join('; ') +
      '.',
    implication:
      status === 'modeled-ready'
        ? 'Declared protection capabilities meet the workload requirements within the V1 vocabulary.'
        : status === 'modeled-constraint'
          ? 'A definite protection shortfall exists against the declared requirement.'
          : 'Protection readiness cannot be confirmed; unknown capabilities must be resolved.',
    nextInvestigation:
      status === 'modeled-ready'
        ? 'Confirm capabilities on the real array; vocabulary coverage is selected capabilities only.'
        : 'Resolve unknown capabilities or remediate shortfalls with the infrastructure owner.',
    confidence,
    confidenceRationale: anyUnknown
      ? 'An unknown capability participates, so confidence is insufficient.'
      : 'Declared capability matching only; not a complete availability assurance.',
    assumptions: [
      VOCABULARY_CAVEAT,
      'Replication is not equated with backup; availability is not inferred from a single feature.',
    ],
  };

  return {
    id: 'protection',
    status,
    headroom: null,
    budgetUtilization: null,
    limitUtilization: null,
    findings: [finding],
  };
}
