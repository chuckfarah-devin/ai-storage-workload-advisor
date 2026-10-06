// Operating-budget policy (R-BUD-1): 80% of each supplied sustainable limit,
// reserving 20% headroom. Applied to capacity, front-end IOPS, throughput,
// and backend operations only — never to latency or protection.

export const BUDGET_FRACTION = 0.8;

export function budgetOf(limit: number): number {
  return limit * BUDGET_FRACTION;
}
