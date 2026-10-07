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
| Engine test suite | `npm test` (`vitest run`) | 32 test files, 171 tests, all passed |
| Golden regeneration | `npm run golden` | regenerated M1 goldens (capacity/growth-only diff after the approved ENV-1…ENV-5 capacity changes), wrote `tests/golden/m2/*.json` and `docs/verification/m2/weekly-summaries.md`; `golden-m2.test.ts` confirms reproduction |

Weekly trace summaries for all four combinations: [docs/verification/m2/weekly-summaries.md](verification/m2/weekly-summaries.md).

Notable verified results: WL-VM on INF-B — backend max 206,100 ops/s vs 200,000 budget, 100 exceedance minutes in 10 runs of 10 minutes (weekday 10:05–10:14 and 14:05–14:14), P95 164,360; **hidden-burst check** — the Monday 10:00 and 10:10 buckets each average 177,475 ops/s (below the 200,000 budget) while their per-minute maxima hit 206,100 with 5 minutes above budget each; no ten-minute mean exceeds the budget while 20 buckets' maxima do (2 bursts × 2 straddled buckets × 5 weekdays). WL-RAG on INF-A — 900 unknown backend minutes during weekday 02:00–05:00 ingestion preserved (64 KiB proposed blocks exceed the 16 KiB modeled backend block); computable max 157,650; backend check needs-investigation driven by the earliest unknown minute. Derived weekly latency: P90 0.9 ms, P95 1.2 ms, max 1.4 ms. Max used capacity 120.3218 TiB at week end. Default detail day: Monday in all four combinations, with the reason string citing the selecting minute. Missing-coverage test: removing Monday 10:05–10:14 drops exceedances to 90 minutes / 9 runs and downgrades a would-be ready check to needs-investigation.

## M3 executed checks

Executed October 7, 2026, on the uncommitted M3 working tree:

| Check | Command | Outcome |
|---|---|---|
| Type-check | `npm run typecheck` | 0 errors |
| Lint | `npm run lint` (oxlint) | 0 warnings, 0 errors (74 files) |
| Test suite | `npm test` (`vitest run`) | 32 test files, 171 tests, all passed (engine + `tests/ui`) |
| Production build | `npm run build` (`tsc -b && vite build`) | success — `dist/assets/index-*.js` 306.00 kB (91.41 kB gzip), CSS 5.56 kB |
| Dev server smoke | `npm run dev`, `curl http://localhost:5173/` | serves index.html; left running for review |

M3 UI implementation: all computation is in `src/ui/viewModel.ts` (trace generation cached per scenario, assessment, buckets, day extraction, presets resolved from schedule rows, decimal rate units, export bundle); components under `src/ui/components/` render only. Charts are hand-rolled SVG — no chart library. Allowed dev dependencies added exact-pinned: `@testing-library/react` 16.3.3, `@testing-library/jest-dom` 7.0.1, `jsdom` 30.1.1 (all released >7 days ago).

Part A engine contract (same tree): checks with no usable driving evidence return the unknown contract — needs-investigation, null headroom/utilization, 'cannot be modeled' wording — instead of a fabricated zero-demand sample; coverage downgrades now replace contradictory ready wording ('cannot be established', insufficient confidence) while keeping real observed headroom. Verified by `r-ts-7-coverage.test.ts` (all-missing and partial-missing cases). M2 goldens unchanged — shipped combinations have full coverage, so no finding text differs.

No screenshots and no Playwright/browser checks exist yet — component tests ran under jsdom only; comprehensive browser verification remains M4.

## Not yet verified

- **M4 browser verification**: Playwright walkthrough, screenshots, narrow-viewport check, forbidden-phrase scan (R-UI-3, R-UI-4).
