# Verification

## M1 executed checks

Executed October 6, 2026, on the uncommitted M1 working tree:

| Check | Command | Outcome |
|---|---|---|
| Type-check | `npm run typecheck` (`tsc --noEmit -p tsconfig.app.json`) | 0 errors |
| Lint | `npm run lint` (oxlint) | 0 warnings, 0 errors (39 files, 116 rules) |
| Engine test suite | `npm test` (`vitest run`) | 17 test files, 92 tests, all passed |
| Golden per-sample assessments | `npm run golden` (`tsx scripts/golden.ts`) | regenerated `tests/golden/*.json` (18 files) and `docs/verification/m1/golden-assessments.md`; golden test confirms engine output reproduces the committed fixtures |

Rendered per-sample rule output for review: [docs/verification/m1/golden-assessments.md](verification/m1/golden-assessments.md) — plain-text `renderAssessmentText` for every infrastructure × workload × sample combination at baseline (1×, horizon 1), plus what-if renders for the burst samples (1.5×/2× demand, 0/1/3-year horizons).

Notable verified results: WL-VM on INF-B burst → backend 206,100 ops/s vs 200,000 budget → *modeled constraint* while front-end is ready (75% of budget); WL-RAG ingestion (64 KiB blocks) → backend unknown → *needs investigation*; WL-RAG 2× demand → front-end 135,000 > 120,000 → constraint; 1.5× → exactly 120,000 → equality within budget. All overall results are *needs investigation* or *modeled constraint*; none is unconditionally ready because post-addition latency is unknown in V1.

No screenshots exist — no UI or browser checks have been implemented or run.

## Not yet verified

- **M2 trace checks**: 10,080-record generation, ten-minute buckets, weekly nearest-rank percentiles, exceedance durations, day selection, coverage handling (R-TS-1…R-TS-7, R-DAY-1, R-REP-1).
- **M3 UI**: dimension cards, findings, what-if comparison, charts, labels (R-UI-1, R-UI-2).
- **M4 browser verification**: Playwright walkthrough, screenshots, narrow-viewport check, forbidden-phrase scan (R-UI-3, R-UI-4).
