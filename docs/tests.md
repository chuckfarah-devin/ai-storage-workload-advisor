# Tests

## How to run

```sh
npm install
npm test            # vitest run — engine suite under tests/engine
npm run typecheck   # tsc --noEmit -p tsconfig.app.json (src + tests + scripts)
npm run lint        # oxlint
npm run golden      # regenerate tests/golden/*.json and docs/verification/m1/golden-assessments.md
npm run e2e         # Playwright browser checks (desktop + mobile); reuses a dev server on :5173
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
| R-SET-1 | Sample-set selection: precedence tiers, highest budget utilization within numeric tiers, earliest-at-status for non-numeric/unknown, aligned evidence retained | `tests/engine/r-set-1-sample-set-selection.test.ts` |
| R-WHAT-1 | Multipliers apply to proposed IOPS/throughput/backend, not capacity | `tests/engine/r-what-1-whatif.test.ts` |
| R-FIND-1 | Every finding has rule ID, inputs, calculation, implication, next investigation, confidence, assumptions | `tests/engine/r-find-1-findings.test.ts` |
| R-ENV-1 | Environment block coherence: drive arithmetic, slots, parity widths, raw bytes, usable bound, reserve range | `tests/engine/r-env-1-environment.test.ts` |
| Golden | Per-sample assessments for all combos equal committed fixtures | `tests/engine/golden.test.ts`, `tests/fixtures/samples.ts`, `tests/golden/*.json` |

## Requirement-to-test map — M2 (implemented)

| Req ID | Requirement | Test file(s) |
|---|---|---|
| R-TS-1 | 10,080 records, strictly increasing 60 s UTC timestamps, cyclic schedule coverage, day extraction, 1,008 buckets, full coverage, determinism | `tests/engine/r-ts-1-generation.test.ts` |
| R-TS-2 | WL-VM × INF-B weekly values, hidden-burst buckets, statuses, default day | `tests/engine/r-ts-2-vm-infb.test.ts` |
| R-TS-3 | WL-VM × INF-A weekly values and utilization-based day selection | `tests/engine/r-ts-3-vm-infa.test.ts` |
| R-TS-4 | WL-RAG × INF-A unknown backend minutes preserved, earliest-unknown driving minute | `tests/engine/r-ts-4-rag-infa.test.ts` |
| R-TS-5 | WL-RAG × INF-B constraint with unknown minutes still reported | `tests/engine/r-ts-5-rag-infb.test.ts` |
| R-TS-6 | Noncoincident peaks: each check keeps its own driving minute | `tests/engine/r-ts-6-driving-minutes.test.ts` |
| R-TS-7 | Missing minutes: coverage fraction, removed exceedances, ready-downgrade | `tests/engine/r-ts-7-coverage.test.ts` |
| R-DAY-1 | Default-day selection rules and reason strings | `tests/engine/r-day-1.test.ts` |
| R-WHAT-2 | Trace what-if: multiplier scales series and driving-minute checks identically; capacity unaffected; null backend limit → unknown all week | `tests/engine/r-what-2-trace-whatif.test.ts` |
| R-REP-1 | Derived weekly latency/capacity, rendered weekly block, ruleset version | `tests/engine/r-rep-1.test.ts` |
| Golden M2 | TraceAssessment (m=1, h=1) + Monday 10:00–10:39 buckets equal committed fixtures | `tests/engine/golden-m2.test.ts`, `tests/golden/m2/*.json` |

## Requirement-to-test map — M3 (implemented)

| Req ID | Requirement | Test file(s) |
|---|---|---|
| R-UI-1 | View model: rate-unit selection (decimal MB/s–GB/s, one unit per chart incl. budget/ceiling), schedule-derived presets with explained absence, export bundle fields, what-if bundle, all-combination assess | `tests/ui/viewModel.test.ts` |
| R-UI-2 | Component smoke: label, banner status, workload/what-if switching, hidden-burst readout, preset note, no predicted-latency claims, preview controls don't alter assessment | `tests/ui/App.test.tsx` |
| — | Zero-coverage contract and coverage-downgrade wording (Part A engine fix) | `tests/engine/r-ts-7-coverage.test.ts` |
| — | `bucketLabel` derives labels from bucket UTC timestamps (Mon 10:00 / Sun 23:50) | `tests/ui/viewModel.test.ts` |
| — | `minuteReadout` scaled breakdown, explicit units, missing/unknown discrimination, additivity invariant | `tests/ui/viewModel.test.ts` |
| — | `formatHeadroom` binary units; `latencyCard`/`protectionCard` non-budget card data | `tests/ui/viewModel.test.ts` |
| — | Card vocabulary/units; nightly note only under selected preset | `tests/ui/App.test.tsx` |
| — | Detail day selector: re-extraction, Saturday preset unavailable, engine-default reason | `tests/ui/viewModel.test.ts`, `tests/ui/App.test.tsx` |
| R-UI-3 | Narrow layout: no horizontal overflow at 375 px, panels stack, SVG axes and non-overlapping Y1/Y2 labels, wrapped legend | `tests/e2e/advisor.spec.ts` (Playwright, mobile project) |
| R-UI-4 | No PowerMax/ONTAP/validated/production-sizing claims; no predicted post-addition latency | `tests/e2e/advisor.spec.ts` (Playwright, both projects) |
| — | Browser checks: four combinations, what-ifs, weekly/detail inspection, exports, screenshots | `tests/e2e/advisor.spec.ts` |

## Executed results history

| Milestone | Date | Result |
|---|---|---|
| M1 | 2026-10-06 | `npm test`: 17 files / 92 tests passed |
| R-SET-1 | 2026-10-06 | `npm test`: 18 files / 100 tests passed |
| M2 | 2026-10-07 | `npm test`: 30 files / 150 tests passed |
| M3 | 2026-10-07 | `npm test`: 32 files / 171 tests passed |
| M3 corrections + M4 | 2026-10-07 | `npm test`: 32 files / 179 tests passed; `npm run e2e` (Playwright, Chromium): 15 passed, 3 project-gated skips — 2 mobile-only tests skipped in the desktop viewport project, 1 desktop-only screenshot test skipped in the mobile viewport project |
| M4 review fixes | 2026-10-07 | `npm test`: 32 files / 183 tests passed; `npm run e2e` (Playwright, Chromium): 15 passed, 3 project-gated skips (same viewport gating) |

Latest run (October 7, 2026): `npm run typecheck` — 0 errors; `npm run lint` — 0 warnings, 0 errors (77 files); `npm run build` — `dist/assets/index-*.js` 311.38 kB (92.75 kB gzip).
`npm run golden` regenerated `tests/golden/` M1 fixtures and `tests/golden/m2/*.json` with wording-only diffs ('validated' → 'measured'/'response curve' phrasing for R-UI-4); both golden tests confirm reproduction.
