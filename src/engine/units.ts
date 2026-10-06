// Canonical unit constants and display helpers (R-UNIT-1).

export const KIB = 1024;
export const MIB = 1024 * KIB;
export const TIB = 2 ** 40;

export function toTiB(bytes: number): number {
  return bytes / TIB;
}

export function fromTiB(tib: number): number {
  return tib * TIB;
}

export function toKiB(bytes: number): number {
  return bytes / KIB;
}

export function toMiBPerSecond(bytesPerSecond: number): number {
  return bytesPerSecond / MIB;
}

export function fromMiBPerSecond(mibPerSecond: number): number {
  return mibPerSecond * MIB;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Format a byte quantity as TiB for display. */
export function formatBytes(bytes: number): string {
  return `${round2(toTiB(bytes))} TiB`;
}

/** Format a byte rate as MiB/s for display. */
export function formatBytesPerSecond(bytesPerSecond: number): string {
  return `${round2(toMiBPerSecond(bytesPerSecond))} MiB/s`;
}

/** Format a headroom value by its unit. */
export function formatHeadroom(value: number, unit: string): string {
  if (unit === 'bytes') return formatBytes(value);
  if (unit === 'bytes/second') return formatBytesPerSecond(value);
  return `${round2(value)} ${unit}`;
}
