// Internal model for the M1 static assessment engine.
// Canonical units: bytes, bytes/second, IOPS, ops/s, milliseconds, fractions.

export type Status = 'modeled-ready' | 'modeled-constraint' | 'needs-investigation';
export type Confidence = 'high' | 'moderate' | 'insufficient';
export type RaidLayout = 'raid5' | 'raid6';
export type Replication = 'none' | 'async' | 'sync' | 'unknown';
export type ReplicationRequirement = 'none' | 'async' | 'sync';
export type ExistingBackendBasis = 'derived-from-logical-trace' | 'supplied-physical';

export const MANDATORY_LABEL =
  'Synthetic data. Educational demonstration; not vendor sizing or production configuration guidance.';

export interface Evidence {
  label: string;
  value: number | string | boolean | null;
  unit: string;
  basis: string;
  assumptionRefs?: string[];
  missingReason?: string;
}

/** Descriptive physical-environment block (ENV-5). No field participates in any rule. */
export interface Environment {
  architecture: string;
  enclosureSlots: number;
  driveCount: number;
  spareDrives: number;
  groupCount: number;
  dataWidth: number;
  parityWidth: number;
  mediaType: string;
  driveNominalBytesDecimal: number;
  driveNominalTBDecimal: number;
  rawBytesDecimal: number;
  metadataReserveFraction: number;
  hostPorts: string;
  note: string;
}

export interface InfrastructureProfile {
  id: string;
  schemaVersion: string;
  synthetic: boolean;
  name: string;
  description: string;
  provenance: string;
  assumptions: string[];
  capacity: {
    usableBytes: number;
    usedBytes: number;
    annualGrowthFraction: number;
  };
  limits: {
    frontendIops: number;
    throughputBytesPerSecond: number;
    backendOpsPerSecond: number | null;
  };
  backend: {
    layout: RaidLayout;
    dataWidth: number;
    parityWidth: number;
    backendBlockBytes: number | null;
    readCacheHitFraction: number | null;
    writePolicy: string;
    backgroundBackendOpsPerSecond: number | null;
    existingBackendBasis: ExistingBackendBasis;
  };
  protection: {
    toleratedDriveFailures: number | null;
    snapshots: boolean | null;
    encryptionAtRest: boolean | null;
    replication: Replication;
  };
  baselineLatency: {
    p95Ms: number | null;
    maxMs: number | null;
    basis: string;
  };
  environment?: Environment;
}

export interface ScheduleRow {
  name?: string;
  days: string;
  start: string;
  end: string;
  iops?: number;
  iopsStart?: number;
  iopsEnd?: number;
  /** baseline latency plateau (ms) — existing-baseline schedule only */
  latencyMs?: number;
  /** ramp variant: interpolate latencyStartMs → latencyEndMs over the window */
  latencyStartMs?: number;
  latencyEndMs?: number;
  readFraction: number;
  readBlockBytes: number;
  writeBlockBytes: number;
}

export interface WorkloadProfile {
  id: string;
  schemaVersion: string;
  synthetic: boolean;
  name: string;
  description: string;
  provenance: string;
  assumptions?: string[];
  capacityBytes: number;
  annualGrowthFraction: number;
  peakIops: number;
  readFraction: number;
  readBlockBytes: number;
  writeBlockBytes: number;
  latencyTargetMs: number | null;
  protectionRequired: {
    minToleratedDriveFailures: number | null;
    snapshots: boolean;
    encryptionAtRest: boolean;
    replicationRequired: ReplicationRequirement;
  };
  replicationOverhead: unknown;
  schedule: ScheduleRow[];
}

export interface LogicalDemand {
  readIops: number;
  writeIops: number;
  readBlockBytes: number;
  writeBlockBytes: number;
}

export interface DemandSample {
  id: string;
  description: string;
  existing: LogicalDemand;
  proposed: LogicalDemand;
  usedCapacityBytes: number;
  baselineLatency: { p95Ms: number | null; maxMs: number | null };
  backgroundBackendOpsPerSecond: number;
  /** Only valid when the profile's existingBackendBasis = 'supplied-physical'. */
  suppliedExistingBackend?: { reads: number; writes: number };
}

export interface BackendEstimate {
  reads: number;
  writes: number;
  total: number;
}

export type BackendResult =
  | {
      kind: 'computed';
      existing: BackendEstimate;
      background: number;
      proposed: BackendEstimate;
      combinedTotal: number;
    }
  | { kind: 'unknown'; reason: string };

export interface Finding {
  ruleId: string;
  condition: string;
  evidence: Evidence[];
  calculation: string;
  implication: string;
  nextInvestigation: string;
  confidence: Confidence;
  confidenceRationale: string;
  assumptions: string[];
}

export interface CheckResult {
  id: string;
  status: Status;
  headroom: { value: number; unit: string } | null;
  budgetUtilization: number | null;
  limitUtilization: number | null;
  findings: Finding[];
  /** Set by assessSampleSet: the sample whose evidence this check retains. */
  worstSampleId?: string;
  /** Set by assessSampleSet: how the worst sample was chosen within its tier. */
  selectionBasis?: 'highest-budget-utilization' | 'earliest-at-status';
  /** Set by assessSampleSet: all sample ids at the winning status tier, input order. */
  tierSampleIds?: string[];
  /** Set by assessTrace: trace minute index whose evidence this check retains. */
  drivingMinuteIndex?: number;
}

export type Dimension = 'capacity' | 'iops' | 'throughput' | 'latency' | 'protection' | 'growth';

export interface DimensionResult {
  dimension: Dimension;
  status: Status;
  checks: CheckResult[];
}

export interface AssessmentOptions {
  demandMultiplier: 1 | 1.5 | 2;
  horizonYears: 0 | 1 | 3;
}

export interface Assessment {
  rulesetVersion: string;
  budgetFraction: 0.8;
  infrastructureId: string;
  workloadId: string;
  sampleId: string;
  options: AssessmentOptions;
  dimensions: DimensionResult[];
  overall: Status;
  label: string;
}

export interface ValidationDiagnostic {
  path: string;
  message: string;
}

export interface ValidationResult {
  ok: boolean;
  diagnostics: ValidationDiagnostic[];
}
