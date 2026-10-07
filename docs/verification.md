# Verification

## M1 executed checks

Executed October 6, 2026, on the uncommitted M1 working tree:

| Check | Command | Outcome |
|---|---|---|
| Type-check | `npm run typecheck` (`tsc --noEmit -p tsconfig.app.json`) | 0 errors |
| Lint | `npm run lint` (oxlint) | 0 warnings, 0 errors (39 files, 116 rules) |
| Engine test suite | `npm test` (`vitest run`) | 18 test files, 100 tests, all passed |
| Golden per-sample assessments | `npm run golden` (`tsx scripts/golden.ts`) | regenerated `tests/golden/*.json` (18 files) and `docs/verification/m1/golden-assessments.md`; golden test confirms engine output reproduces the committed fixtures |

Rendered per-sample rule output for review: [docs/verification/m1/golden-assessments.md](verification/m1/golden-assessments.md) — plain-text `renderAssessmentText` for every infrastructure × workload × sample combination at baseline (1×, horizon 1), plus what-if renders for the burst samples (1.5×/2× demand, 0/1/3-year horizons).

Notable verified results: WL-VM on INF-B burst → backend 206,100 ops/s vs 200,000 budget → *modeled constraint* while front-end is ready (75% of budget); WL-RAG ingestion (64 KiB blocks) → backend unknown → *needs investigation*; WL-RAG 2× demand → front-end 135,000 > 120,000 → constraint; 1.5× → exactly 120,000 → equality within budget. All overall results are *needs investigation* or *modeled constraint*; none is unconditionally ready because post-addition latency is unknown in V1.

No screenshots exist — no UI or browser checks have been implemented or run.

## M2 executed checks

Executed October 6, 2026, on the uncommitted M2 working tree (ruleset 1.0.0-m2):

| Check | Command | Outcome |
|---|---|---|
| Type-check | `npm run typecheck` | 0 errors |
| Lint | `npm run lint` (oxlint) | 0 warnings, 0 errors |
| Engine test suite | `npm test` (`vitest run`) | 30 test files, 150 tests, all passed |
| Golden regeneration | `npm run golden` | regenerated M1 goldens (capacity/growth-only diff after the approved ENV-1…ENV-5 capacity changes), wrote `tests/golden/m2/*.json` and `docs/verification/m2/weekly-summaries.md`; `golden-m2.test.ts` confirms reproduction |

Weekly trace summaries for all four combinations: [docs/verification/m2/weekly-summaries.md](verification/m2/weekly-summaries.md).

Notable verified results: WL-VM on INF-B — backend max 206,100 ops/s vs 200,000 budget, 100 exceedance minutes in 10 runs of 10 minutes (weekday 10:05–10:14 and 14:05–14:14), P95 164,360; **hidden-burst check** — the Monday 10:00 and 10:10 buckets each average 177,475 ops/s (below the 200,000 budget) while their per-minute maxima hit 206,100 with 5 minutes above budget each; no ten-minute mean exceeds the budget while 20 buckets' maxima do (2 bursts × 2 straddled buckets × 5 weekdays). WL-RAG on INF-A — 900 unknown backend minutes during weekday 02:00–05:00 ingestion preserved (64 KiB proposed blocks exceed the 16 KiB modeled backend block); computable max 157,650; backend check needs-investigation driven by the earliest unknown minute. Derived weekly latency: P90 0.9 ms, P95 1.2 ms, max 1.4 ms. Max used capacity 120.3218 TiB at week end. Default detail day: Monday in all four combinations, with the reason string citing the selecting minute. Missing-coverage test: removing Monday 10:05–10:14 drops exceedances to 90 minutes / 9 runs and downgrades a would-be ready check to needs-investigation.

No screenshots exist — no UI or browser checks have been implemented or run.

## Not yet verified

- **M3 UI**: dimension cards, findings, what-if comparison, charts, labels (R-UI-1, R-UI-2).
- **M4 browser verification**: Playwright walkthrough, screenshots, narrow-viewport check, forbidden-phrase scan (R-UI-3, R-UI-4).
