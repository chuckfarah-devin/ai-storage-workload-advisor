import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assessTrace, traceBuckets } from '../../src/engine/index.js';
import { COMBINATIONS } from '../fixtures/samples.js';
import { traceFor } from '../fixtures/trace.js';

const GOLDEN_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'golden', 'm2');

// Golden M2: TraceAssessment at multiplier 1 / horizon 1 (records omitted) plus
// the 4 ten-minute buckets covering Monday 10:00–10:39. Regenerate with
// `npm run golden`.
describe('golden weekly trace assessments (m=1, h=1)', () => {
  for (const { infra, workload } of COMBINATIONS) {
    it(`${infra.id} × ${workload.id}`, () => {
      const trace = traceFor(infra, workload);
      const a = assessTrace(infra, workload, trace, { demandMultiplier: 1, horizonYears: 1 });
      const whatIfs: Record<string, unknown> = {};
      if (infra.id === 'INF-B' && workload.id === 'WL-VM') {
        for (const m of [1.5, 2] as const) {
          const aw = assessTrace(infra, workload, trace, { demandMultiplier: m, horizonYears: 1 });
          whatIfs[`${m}x`] = {
            weekly: aw.weekly,
            overall: aw.overall,
            dimensions: aw.dimensions.map((d) => ({ dimension: d.dimension, status: d.status })),
          };
        }
      }
      const golden = {
        assessment: a,
        ...(Object.keys(whatIfs).length > 0 ? { whatIfs } : {}),
        bucketsMonday1000: traceBuckets(trace, infra, { demandMultiplier: 1, horizonYears: 1 }).slice(60, 64),
      };
      const file = join(GOLDEN_DIR, `${infra.id}-${workload.id}.json`);
      const expected = readFileSync(file, 'utf8');
      expect(JSON.stringify(golden, null, 2) + '\n', `golden mismatch: ${file} (run npm run golden)`).toBe(expected);
    });
  }
});
