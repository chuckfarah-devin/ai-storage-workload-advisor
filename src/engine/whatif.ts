import type { Assessment, CheckResult, DemandSample } from './model.js';

// R-WHAT-1: the demand multiplier scales proposed read/write IOPS only;
// derived throughput and backend estimates follow automatically. Proposed
// capacity is unaffected. assessSample applies this once at the top.

export function applyDemandMultiplier(sample: DemandSample, m: 1 | 1.5 | 2): DemandSample {
  if (m === 1) return sample;
  return {
    ...sample,
    proposed: {
      ...sample.proposed,
      readIops: sample.proposed.readIops * m,
      writeIops: sample.proposed.writeIops * m,
    },
  };
}

export interface CheckDelta {
  dimension: string;
  checkId: string;
  before: CheckResult['status'];
  after: CheckResult['status'];
  headroomDelta: number | null;
}

/** Compare two assessments (baseline vs what-if): per-check status and headroom deltas. */
export function compareAssessments(a: Assessment, b: Assessment): CheckDelta[] {
  const deltas: CheckDelta[] = [];
  for (const da of a.dimensions) {
    const db = b.dimensions.find((x) => x.dimension === da.dimension);
    if (db === undefined) continue;
    for (const ca of da.checks) {
      const cb = db.checks.find((x) => x.id === ca.id);
      if (cb === undefined) continue;
      const headroomDelta =
        ca.headroom !== null && cb.headroom !== null ? cb.headroom.value - ca.headroom.value : null;
      if (ca.status !== cb.status || (headroomDelta !== null && headroomDelta !== 0)) {
        deltas.push({
          dimension: da.dimension,
          checkId: ca.id,
          before: ca.status,
          after: cb.status,
          headroomDelta,
        });
      }
    }
  }
  return deltas;
}
