import { describe, expect, it } from 'vitest';
import { demandThroughputBytesPerSecond } from '../../src/engine/rules/throughput.js';
import { toKiB, toMiBPerSecond } from '../../src/engine/units.js';
import { INF_A, VM_SAMPLES, WL_VM } from '../fixtures/samples.js';
import { assessSample } from '../../src/engine/assess.js';

describe('R-THR-1 derived throughput', () => {
  it('15,000 IOPS @ 0.7 read, 16/8 KiB → 208,896,000 B/s ≈ 199 MiB/s', () => {
    const t = demandThroughputBytesPerSecond({
      readIops: 10500,
      writeIops: 4500,
      readBlockBytes: 16384,
      writeBlockBytes: 8192,
    });
    expect(t).toBe(208896000);
    expect(toMiBPerSecond(t)).toBeCloseTo(199.2, 1);
  });

  it('all-read and all-write cases', () => {
    expect(
      demandThroughputBytesPerSecond({ readIops: 1000, writeIops: 0, readBlockBytes: 16384, writeBlockBytes: 8192 }),
    ).toBe(16384000);
    expect(
      demandThroughputBytesPerSecond({ readIops: 0, writeIops: 1000, readBlockBytes: 16384, writeBlockBytes: 8192 }),
    ).toBe(8192000);
  });

  it('vm-weekday-burst combined ≈ 1,224,000 KiB/s ≈ 1,195.3 MiB/s, ready', () => {
    const a = assessSample(INF_A, WL_VM, VM_SAMPLES[2], { demandMultiplier: 1, horizonYears: 1 });
    const check = a.dimensions.find((d) => d.dimension === 'throughput')!.checks[0];
    // combined = existing 1,044,480,000 + proposed 208,896,000 = 1,253,376,000 B/s
    const existing = 52500 * 16384 + 22500 * 8192;
    const proposed = 10500 * 16384 + 4500 * 8192;
    const expected = existing + proposed;
    expect(expected).toBe(1253376000);
    expect(toKiB(expected)).toBe(1224000);
    expect(toMiBPerSecond(expected)).toBeCloseTo(1195.3, 1);
    expect(check.status).toBe('modeled-ready');
    expect(check.budgetUtilization).toBeCloseTo(expected / 2516582400, 6);
  });
});
