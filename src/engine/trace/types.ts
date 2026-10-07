import type { BackendResult, LogicalDemand } from '../model.js';

export interface TraceRecord {
  index: number;
  timestampUtc: string;
  durationSeconds: number;
  /** true → record is missing evidence; demand/latency fields are null */
  missing: boolean;
  existing: LogicalDemand | null;
  proposed: LogicalDemand | null;
  usedCapacityBytes: number | null;
  baselineLatencyMs: number | null;
  backgroundBackendOpsPerSecond: number | null;
}

export interface Trace {
  startUtc: string;
  minuteCount: number;
  records: TraceRecord[];
}

export interface DerivedMinute {
  frontendIops: number | null;
  throughputBytesPerSecond: number | null;
  backend: BackendResult | null;
}
