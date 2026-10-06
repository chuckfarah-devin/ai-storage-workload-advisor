import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assessSample } from '../../src/engine/assess.js';
import { COMBINATIONS, samplesFor } from '../fixtures/samples.js';

const GOLDEN_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'golden');

// Golden fixture: JSON.stringify(assessment, null, 2) for each combination and
// sample at multiplier 1, horizon 1. Regenerate with `npm run golden`.
describe('golden per-sample assessments (m=1, h=1)', () => {
  for (const { infra, workload } of COMBINATIONS) {
    for (const s of samplesFor(workload)) {
      it(`${infra.id} × ${workload.id} × ${s.id}`, () => {
        const a = assessSample(infra, workload, s, { demandMultiplier: 1, horizonYears: 1 });
        const file = join(GOLDEN_DIR, `${infra.id}-${workload.id}-${s.id}.json`);
        const expected = readFileSync(file, 'utf8');
        expect(JSON.stringify(a, null, 2) + '\n', `golden mismatch: ${file} (run npm run golden)`).toBe(expected);
      });
    }
  }
});
