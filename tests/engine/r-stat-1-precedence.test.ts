import { describe, expect, it } from 'vitest';
import { assessSample } from '../../src/engine/assess.js';
import type { Status } from '../../src/engine/model.js';
import { combineStatuses } from '../../src/engine/status.js';
import { COMBINATIONS, samplesFor } from '../fixtures/samples.js';

const C: Status = 'modeled-constraint';
const I: Status = 'needs-investigation';
const R: Status = 'modeled-ready';

describe('R-STAT-1 status precedence', () => {
  it('truth table over all nonempty combinations of the three statuses', () => {
    const cases: [Status[], Status][] = [
      [[C], C],
      [[I], I],
      [[R], R],
      [[C, I], C],
      [[C, R], C],
      [[I, R], I],
      [[C, I, R], C],
    ];
    for (const [input, expected] of cases) {
      expect(combineStatuses(input), JSON.stringify(input)).toBe(expected);
    }
  });

  it('empty list → needs-investigation (no evidence cannot be ready)', () => {
    expect(combineStatuses([])).toBe('needs-investigation');
  });

  it('overall is never modeled-ready for shipped combos (latency is always unknown)', () => {
    for (const { infra, workload } of COMBINATIONS) {
      for (const s of samplesFor(workload)) {
        const a = assessSample(infra, workload, s, { demandMultiplier: 1, horizonYears: 1 });
        expect(a.overall).not.toBe('modeled-ready');
      }
    }
  });
});
