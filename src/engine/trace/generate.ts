import type { DemandSample, LogicalDemand, ScheduleRow, WorkloadProfile } from '../model.js';
import { backendResult } from '../rules/backendIops.js';
import type { InfrastructureProfile } from '../model.js';
import type { DerivedMinute, Trace, TraceRecord } from './types.js';
import {
  MINUTES_PER_DAY,
  MINUTES_PER_WEEK,
  resolveSchedule,
  rowIops,
  rowLatencyMs,
} from './schedule.js';

export const DEFAULT_START_UTC = '2026-10-05T00:00:00Z'; // a Monday

export interface GenerateOptions {
  startUtc?: string;
  usedCapacityStartBytes: number;
  /** existing environment annual growth fraction */
  annualGrowthFraction: number;
  backgroundBackendOpsPerSecond: number;
  /** test-only: minute indexes whose records are marked missing */
  missingMinutes?: number[];
}

function logicalDemand(iops: number, readFraction: number, rB: number, wB: number): LogicalDemand {
  return {
    readIops: iops * readFraction,
    writeIops: iops * (1 - readFraction),
    readBlockBytes: rB,
    writeBlockBytes: wB,
  };
}

/**
 * Generate the deterministic 10,080-minute trace (R-TS-1). Same inputs produce
 * deep-equal output; there is no randomness and no seeded jitter in V1.
 */
export function generateTrace(
  existing: ScheduleRow[],
  workload: WorkloadProfile,
  opts: GenerateOptions,
): Trace {
  const startUtc = opts.startUtc ?? DEFAULT_START_UTC;
  const startMs = Date.parse(startUtc);
  const missing = new Set(opts.missingMinutes ?? []);
  const records: TraceRecord[] = [];
  for (let i = 0; i < MINUTES_PER_WEEK; i++) {
    const timestampUtc = new Date(startMs + i * 60000).toISOString();
    if (missing.has(i)) {
      records.push({
        index: i,
        timestampUtc,
        durationSeconds: 60,
        missing: true,
        existing: null,
        proposed: null,
        usedCapacityBytes: null,
        baselineLatencyMs: null,
        backgroundBackendOpsPerSecond: null,
      });
      continue;
    }
    const ex = resolveSchedule(existing, i);
    const pr = resolveSchedule(workload.schedule, i);
    if (ex === null || pr === null) {
      throw new Error(
        `schedule does not cover minute ${i} (existing: ${ex === null ? 'gap' : 'ok'}, proposed: ${pr === null ? 'gap' : 'ok'})`,
      );
    }
    const usedCapacityBytes =
      opts.usedCapacityStartBytes *
      (1 + opts.annualGrowthFraction) ** (i / (365.25 * MINUTES_PER_DAY));
    records.push({
      index: i,
      timestampUtc,
      durationSeconds: 60,
      missing: false,
      existing: logicalDemand(
        rowIops(ex), ex.row.readFraction, ex.row.readBlockBytes, ex.row.writeBlockBytes,
      ),
      proposed: logicalDemand(
        rowIops(pr), pr.row.readFraction, pr.row.readBlockBytes, pr.row.writeBlockBytes,
      ),
      usedCapacityBytes,
      baselineLatencyMs: rowLatencyMs(ex),
      backgroundBackendOpsPerSecond: opts.backgroundBackendOpsPerSecond,
    });
  }
  return { startUtc, minuteCount: MINUTES_PER_WEEK, records };
}

/** Per-minute derivation reusing the M1 rules — no duplicated RAID arithmetic. */
export function deriveMinute(
  infra: InfrastructureProfile,
  record: TraceRecord,
): DerivedMinute {
  if (record.missing || record.existing === null || record.proposed === null) {
    return { frontendIops: null, throughputBytesPerSecond: null, backend: null };
  }
  const frontendIops =
    record.existing.readIops + record.existing.writeIops +
    record.proposed.readIops + record.proposed.writeIops;
  const throughputBytesPerSecond =
    record.existing.readIops * record.existing.readBlockBytes +
    record.existing.writeIops * record.existing.writeBlockBytes +
    record.proposed.readIops * record.proposed.readBlockBytes +
    record.proposed.writeIops * record.proposed.writeBlockBytes;
  let backend: DerivedMinute['backend'] = null;
  if (infra.backend.existingBackendBasis === 'supplied-physical') {
    backend = {
      kind: 'unknown',
      reason:
        "existingBackendBasis is 'supplied-physical' but the generated trace carries no per-minute supplied backend telemetry",
    };
  } else {
    const pseudoSample: DemandSample = {
      id: `minute-${record.index}`,
      description: `trace minute ${record.index} (${record.timestampUtc})`,
      existing: record.existing,
      proposed: record.proposed,
      usedCapacityBytes: record.usedCapacityBytes ?? 0,
      baselineLatency: { p95Ms: null, maxMs: null },
      backgroundBackendOpsPerSecond: record.backgroundBackendOpsPerSecond ?? 0,
    };
    backend = backendResult(infra, pseudoSample);
  }
  return { frontendIops, throughputBytesPerSecond, backend };
}
