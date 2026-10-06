import type {
  DemandSample,
  InfrastructureProfile,
  ValidationDiagnostic,
  ValidationResult,
  WorkloadProfile,
} from './model.js';

function result(diagnostics: ValidationDiagnostic[]): ValidationResult {
  return { ok: diagnostics.length === 0, diagnostics };
}

function isNumber(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v);
}

function checkFraction(
  diagnostics: ValidationDiagnostic[],
  path: string,
  v: unknown,
): void {
  if (!isNumber(v) || v < 0 || v > 1) {
    diagnostics.push({ path, message: 'expected a fraction in [0, 1]' });
  }
}

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$|^24:00$/;

function validateSchedule(diagnostics: ValidationDiagnostic[], base: string, schedule: unknown): void {
  if (!Array.isArray(schedule)) {
    diagnostics.push({ path: base, message: 'schedule must be an array' });
    return;
  }
  schedule.forEach((row, i) => {
    const p = `${base}[${i}]`;
    if (row === null || typeof row !== 'object' || Array.isArray(row)) {
      diagnostics.push({ path: p, message: 'schedule row must be an object' });
      return;
    }
    const r = row as Record<string, unknown>;
    if (typeof r.days !== 'string' || r.days.length === 0) {
      diagnostics.push({ path: `${p}.days`, message: 'days must be a non-empty string' });
    }
    for (const k of ['start', 'end'] as const) {
      if (typeof r[k] !== 'string' || !HHMM.test(r[k] as string)) {
        diagnostics.push({ path: `${p}.${k}`, message: 'expected HH:MM (00:00–24:00)' });
      }
    }
    const hasFlat = isNumber(r.iops);
    const hasRamp = isNumber(r.iopsStart) && isNumber(r.iopsEnd);
    if (hasFlat === hasRamp) {
      diagnostics.push({
        path: p,
        message: 'schedule row must carry either iops or both iopsStart and iopsEnd',
      });
    }
    for (const k of ['iops', 'iopsStart', 'iopsEnd'] as const) {
      if (r[k] !== undefined && (!isNumber(r[k]) || (r[k] as number) < 0)) {
        diagnostics.push({ path: `${p}.${k}`, message: 'IOPS must be a non-negative number' });
      }
    }
    checkFraction(diagnostics, `${p}.readFraction`, r.readFraction);
    for (const k of ['readBlockBytes', 'writeBlockBytes'] as const) {
      if (!isNumber(r[k]) || (r[k] as number) <= 0) {
        diagnostics.push({ path: `${p}.${k}`, message: 'block size must be a positive number of bytes' });
      }
    }
  });
}

export function validateInfrastructure(p: InfrastructureProfile): ValidationResult {
  const d: ValidationDiagnostic[] = [];
  if (p.synthetic !== true) {
    d.push({ path: 'synthetic', message: 'V1 accepts synthetic profiles only' });
  }
  if (!isNumber(p.capacity?.usableBytes) || p.capacity.usableBytes <= 0) {
    d.push({ path: 'capacity.usableBytes', message: 'usable capacity must be positive' });
  }
  if (!isNumber(p.capacity?.usedBytes) || p.capacity.usedBytes < 0) {
    d.push({ path: 'capacity.usedBytes', message: 'used capacity must be non-negative' });
  } else if (isNumber(p.capacity?.usableBytes) && p.capacity.usedBytes > p.capacity.usableBytes) {
    d.push({ path: 'capacity.usedBytes', message: 'used capacity exceeds usable capacity' });
  }
  if (!isNumber(p.capacity?.annualGrowthFraction) || p.capacity.annualGrowthFraction < 0) {
    d.push({ path: 'capacity.annualGrowthFraction', message: 'growth fraction must be non-negative' });
  }
  for (const k of ['frontendIops', 'throughputBytesPerSecond'] as const) {
    if (!isNumber(p.limits?.[k]) || (p.limits[k] as number) <= 0) {
      d.push({ path: `limits.${k}`, message: 'limit must be positive' });
    }
  }
  if (
    p.limits?.backendOpsPerSecond !== null &&
    p.limits?.backendOpsPerSecond !== undefined &&
    (!isNumber(p.limits.backendOpsPerSecond) || p.limits.backendOpsPerSecond <= 0)
  ) {
    d.push({ path: 'limits.backendOpsPerSecond', message: 'backend limit must be positive or null' });
  }
  if (p.backend?.layout !== 'raid5' && p.backend?.layout !== 'raid6') {
    d.push({ path: 'backend.layout', message: "layout must be 'raid5' or 'raid6'" });
  }
  if (
    p.backend?.readCacheHitFraction !== null &&
    p.backend?.readCacheHitFraction !== undefined
  ) {
    checkFraction(d, 'backend.readCacheHitFraction', p.backend.readCacheHitFraction);
  }
  if (
    p.backend?.existingBackendBasis !== 'derived-from-logical-trace' &&
    p.backend?.existingBackendBasis !== 'supplied-physical'
  ) {
    d.push({
      path: 'backend.existingBackendBasis',
      message: "must be 'derived-from-logical-trace' or 'supplied-physical'",
    });
  }
  if (typeof p.backend?.writePolicy !== 'string' || p.backend.writePolicy.length === 0) {
    d.push({ path: 'backend.writePolicy', message: 'write policy must be declared' });
  }
  if (
    p.backend?.backendBlockBytes !== null &&
    p.backend?.backendBlockBytes !== undefined &&
    (!isNumber(p.backend.backendBlockBytes) || p.backend.backendBlockBytes <= 0)
  ) {
    d.push({ path: 'backend.backendBlockBytes', message: 'backend block must be positive or null' });
  }
  return result(d);
}

export function validateWorkload(w: WorkloadProfile): ValidationResult {
  const d: ValidationDiagnostic[] = [];
  if (w.synthetic !== true) {
    d.push({ path: 'synthetic', message: 'V1 accepts synthetic profiles only' });
  }
  if (!isNumber(w.capacityBytes) || w.capacityBytes < 0) {
    d.push({ path: 'capacityBytes', message: 'capacity must be non-negative' });
  }
  if (!isNumber(w.annualGrowthFraction) || w.annualGrowthFraction < 0) {
    d.push({ path: 'annualGrowthFraction', message: 'growth fraction must be non-negative' });
  }
  if (!isNumber(w.peakIops) || w.peakIops < 0) {
    d.push({ path: 'peakIops', message: 'peak IOPS must be non-negative' });
  }
  checkFraction(d, 'readFraction', w.readFraction);
  for (const k of ['readBlockBytes', 'writeBlockBytes'] as const) {
    if (!isNumber(w[k]) || w[k] <= 0) {
      d.push({ path: k, message: 'block size must be positive' });
    }
  }
  if (w.latencyTargetMs !== null && (!isNumber(w.latencyTargetMs) || w.latencyTargetMs <= 0)) {
    d.push({ path: 'latencyTargetMs', message: 'latency target must be positive or null' });
  }
  if (!['none', 'async', 'sync'].includes(w.protectionRequired?.replicationRequired as string)) {
    d.push({
      path: 'protectionRequired.replicationRequired',
      message: "must be 'none', 'async', or 'sync'",
    });
  }
  validateSchedule(d, 'schedule', w.schedule);
  return result(d);
}

function validateDemand(d: ValidationDiagnostic[], base: string, demand: { readIops: number; writeIops: number; readBlockBytes: number; writeBlockBytes: number } | undefined): void {
  if (demand === undefined) {
    d.push({ path: base, message: 'demand is required' });
    return;
  }
  for (const k of ['readIops', 'writeIops'] as const) {
    if (!isNumber(demand[k]) || demand[k] < 0) {
      d.push({ path: `${base}.${k}`, message: 'IOPS must be a non-negative number' });
    }
  }
  for (const k of ['readBlockBytes', 'writeBlockBytes'] as const) {
    if (!isNumber(demand[k]) || demand[k] <= 0) {
      d.push({ path: `${base}.${k}`, message: 'block size must be positive' });
    }
  }
}

export function validateSample(infra: InfrastructureProfile, sample: DemandSample): ValidationResult {
  const d: ValidationDiagnostic[] = [];
  validateDemand(d, 'existing', sample.existing);
  validateDemand(d, 'proposed', sample.proposed);
  if (!isNumber(sample.usedCapacityBytes) || sample.usedCapacityBytes < 0) {
    d.push({ path: 'usedCapacityBytes', message: 'used capacity must be non-negative' });
  } else if (
    isNumber(infra.capacity?.usableBytes) &&
    sample.usedCapacityBytes > infra.capacity.usableBytes
  ) {
    d.push({ path: 'usedCapacityBytes', message: 'sample used capacity exceeds usable capacity' });
  }
  for (const k of ['p95Ms', 'maxMs'] as const) {
    const v = sample.baselineLatency?.[k];
    if (v !== null && v !== undefined && (!isNumber(v) || v < 0)) {
      d.push({ path: `baselineLatency.${k}`, message: 'latency must be non-negative or null' });
    }
  }
  if (
    !isNumber(sample.backgroundBackendOpsPerSecond) ||
    sample.backgroundBackendOpsPerSecond < 0
  ) {
    d.push({
      path: 'backgroundBackendOpsPerSecond',
      message: 'background backend demand must be non-negative',
    });
  }
  const basis = infra.backend?.existingBackendBasis;
  if (basis === 'supplied-physical' && sample.suppliedExistingBackend === undefined) {
    d.push({
      path: 'suppliedExistingBackend',
      message:
        "infrastructure declares existingBackendBasis 'supplied-physical' but the sample carries no suppliedExistingBackend",
    });
  }
  if (basis === 'derived-from-logical-trace' && sample.suppliedExistingBackend !== undefined) {
    d.push({
      path: 'suppliedExistingBackend',
      message:
        "infrastructure basis is 'derived-from-logical-trace' but the sample supplies physical backend figures; mixing bases is not allowed",
    });
  }
  if (sample.suppliedExistingBackend !== undefined) {
    const s = sample.suppliedExistingBackend;
    for (const k of ['reads', 'writes'] as const) {
      if (!isNumber(s[k]) || s[k] < 0) {
        d.push({
          path: `suppliedExistingBackend.${k}`,
          message: 'supplied backend operations must be non-negative',
        });
      }
    }
  }
  return result(d);
}
