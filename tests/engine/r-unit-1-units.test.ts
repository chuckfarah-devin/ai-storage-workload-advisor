import { describe, expect, it } from 'vitest';
import {
  fromMiBPerSecond,
  fromTiB,
  KIB,
  MIB,
  TIB,
  toKiB,
  toMiBPerSecond,
  toTiB,
} from '../../src/engine/units.js';

describe('R-UNIT-1 canonical units', () => {
  it('1 TiB = 2^40 bytes', () => {
    expect(TIB).toBe(1099511627776);
    expect(fromTiB(1)).toBe(1099511627776);
  });

  it('16 KiB = 16384 bytes', () => {
    expect(16 * KIB).toBe(16384);
  });

  it('2400 MiB/s = 2,516,582,400 B/s', () => {
    expect(fromMiBPerSecond(2400)).toBe(2516582400);
  });

  it('round-trips bytes <-> TiB and B/s <-> MiB/s', () => {
    expect(toTiB(fromTiB(123.45))).toBeCloseTo(123.45, 10);
    expect(toMiBPerSecond(fromMiBPerSecond(199.9))).toBeCloseTo(199.9, 10);
    expect(toKiB(65536)).toBe(64);
    expect(MIB).toBe(1048576);
  });
});
