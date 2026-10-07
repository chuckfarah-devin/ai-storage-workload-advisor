import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type {
  AssessmentOptions,
  InfrastructureProfile,
  ScheduleRow,
  WorkloadProfile,
} from '../../src/engine/index.js';
import { assessTrace, generateTrace, type Trace } from '../../src/engine/index.js';

const DATA_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'data', 'profiles');
const load = <T>(name: string): T =>
  JSON.parse(readFileSync(join(DATA_DIR, name), 'utf8')) as T;

export const BASELINE_SCHEDULE = load<{ schedule: ScheduleRow[] }>('existing-baseline.json').schedule;

export const DEFAULT_TRACE_OPTIONS: AssessmentOptions = { demandMultiplier: 1, horizonYears: 1 };

export function traceFor(
  infra: InfrastructureProfile,
  workload: WorkloadProfile,
  missingMinutes?: number[],
): Trace {
  return generateTrace(BASELINE_SCHEDULE, workload, {
    usedCapacityStartBytes: infra.capacity.usedBytes,
    annualGrowthFraction: infra.capacity.annualGrowthFraction,
    backgroundBackendOpsPerSecond: infra.backend.backgroundBackendOpsPerSecond ?? 0,
    missingMinutes,
  });
}

export function assessFor(
  infra: InfrastructureProfile,
  workload: WorkloadProfile,
  missingMinutes?: number[],
) {
  return assessTrace(infra, workload, traceFor(infra, workload, missingMinutes), DEFAULT_TRACE_OPTIONS);
}
