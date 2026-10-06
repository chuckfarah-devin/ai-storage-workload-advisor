import { budgetOf } from '../budget.js';
import type { CheckResult, Evidence, Finding, Status } from '../model.js';
import { formatHeadroom } from '../units.js';

export interface BudgetComparison {
  combined: number;
  limit: number;
  unit: string;
}

/** Compare combined demand against the 80% operating budget. Equality is within budget. */
export function budgetComparison({ combined, limit, unit }: BudgetComparison): {
  status: Status;
  headroom: { value: number; unit: string };
  budgetUtilization: number;
  limitUtilization: number;
} {
  const budget = budgetOf(limit);
  const headroom = budget - combined;
  return {
    status: headroom >= 0 ? 'modeled-ready' : 'modeled-constraint',
    headroom: { value: headroom, unit },
    budgetUtilization: combined / budget,
    limitUtilization: combined / limit,
  };
}

export function checkResult(
  id: string,
  cmp: ReturnType<typeof budgetComparison>,
  findings: Finding[],
): CheckResult {
  return {
    id,
    status: cmp.status,
    headroom: cmp.headroom,
    budgetUtilization: cmp.budgetUtilization,
    limitUtilization: cmp.limitUtilization,
    findings,
  };
}

export function evidence(
  label: string,
  value: number | string | boolean | null,
  unit: string,
  basis: string,
  extra?: { assumptionRefs?: string[]; missingReason?: string },
): Evidence {
  return { label, value, unit, basis, ...extra };
}

export function headroomText(headroom: { value: number; unit: string } | null): string {
  return headroom === null ? 'unknown' : formatHeadroom(headroom.value, headroom.unit);
}
