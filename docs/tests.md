# Tests

## How to run

```sh
npm install
npm test            # vitest run — engine suite under tests/engine
npm run typecheck   # tsc --noEmit -p tsconfig.app.json (src + tests + scripts)
npm run lint        # oxlint
npm run golden      # regenerate tests/golden/*.json and docs/verification/m1/golden-assessments.md
```

Requirement IDs are defined in `docs/devin-initial-review.md` §6.1.

## Requirement-to-test map — M1 (implemented)

| Req ID | Requirement | Test file(s) |
|---|---|---|
| R-UNIT-1 | Canonical bytes/seconds/IOPS/ms; display TiB, MiB/s | `tests/engine/r-unit-1-units.test.ts` |
| R-VAL-1 | Reject negatives, invalid fractions, nonpositive limits, used > usable, non-synthetic input, mixed backend bases | `tests/engine/r-val-1-validation.test.ts` |
| R-BUD-1 | 80% budget on capacity, FE IOPS, throughput, backend; not on latency/protection | `tests/engine/r-bud-1-budget.test.ts` |
| R-CAP-1 | Capacity = used + proposed vs budget; equality within budget | `tests/engine/r-cap-1-capacity.test.ts` |
| R-GRO-1 | Compounded projection, horizons 0/1/3 | `tests/engine/r-gro-1-growth.test.ts` |
| R-THR-1 | Throughput = IOPS × block size; derived, not input | `tests/engine/r-thr-1-throughput.test.ts` |
| R-FE-1 | Combined FE IOPS vs budget | `tests/engine/r-fe-1-frontend-iops.test.ts` |
| R-BE-1 | RAID 5 factor 4, RAID 6 factor 6 with read/write split | `tests/engine/r-be-1-backend-factors.test.ts` |
| R-BE-2 | No double counting; derived vs supplied-physical basis | `tests/engine/r-be-2-basis.test.ts` |
| R-BE-3 | Block-size applicability → unknown | `tests/engine/r-be-3-block-size.test.ts` |
| R-BE-4 | FE headroom but backend constraint explained distinctly | `tests/engine/r-be-4-frontend-backend.test.ts` |
| R-LAT-1 | Baseline P95 vs target; post-addition always needs investigation | `tests/engine/r-lat-1-latency.test.ts` |
| R-PRO-1 | Capability matching; unknown → investigation; shortfall → constraint | `tests/engine/r-pro-1-protection.test.ts` |
| R-STAT-1 | Precedence constraint > unknown > ready at every level | `tests/engine/r-stat-1-precedence.test.ts` |
| R-WHAT-1 | Multipliers apply to proposed IOPS/throughput/backend, not capacity | `tests/engine/r-what-1-whatif.test.ts` |
| R-FIND-1 | Every finding has rule ID, inputs, calculation, implication, next investigation, confidence, assumptions | `tests/engine/r-find-1-findings.test.ts` |
| Golden | Per-sample assessments for all combos equal committed fixtures | `tests/engine/golden.test.ts`, `tests/fixtures/samples.ts`, `tests/golden/*.json` |

## Not yet implemented

| Req ID | Milestone |
|---|---|
| R-TS-1 … R-TS-7 (trace, buckets, percentiles, exceedance, noncoincident peaks, coverage) | M2 |
| R-DAY-1 (default day selection) | M2 |
| R-REP-1 (reproducibility) | M2 |
| R-BE-4 trace-level case | M2 |
| R-UI-1, R-UI-2 (UI, charts) | M3/M4 |
| R-UI-3 (narrow screen), R-UI-4 (no vendor claims) | M4 |

## Last executed results

`npm test` (vitest run), executed October 6, 2026:

```
Test Files  17 passed (17)
     Tests  92 passed (92)
  Duration  ~1s
```

`npm run typecheck` — 0 errors. `npm run lint` (oxlint) — 0 warnings, 0 errors, 39 files.
