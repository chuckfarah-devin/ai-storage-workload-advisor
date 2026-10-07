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

Executed October 7, 2026, on the uncommitted M2 working tree (ruleset 1.0.0-m2):

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

## M3 corrections executed checks

Executed October 7, 2026, on the uncommitted M3-corrections working tree:

| Check | Command | Outcome |
|---|---|---|
| Test suite | `npm test` (`vitest run`) | 32 test files, 183 tests, all passed |
| Type-check | `npm run typecheck` | 0 errors |
| Lint | `npm run lint` (oxlint) | 0 warnings, 0 errors (77 files) |
| Production build | `npm run build` | success — `dist/assets/index-*.js` 311.38 kB (92.75 kB gzip), CSS 6.07 kB |

Defects fixed:

1. **Weekly bucket labels** used minute-index arithmetic (`index / 144`). `bucketLabel(timestampUtc)` in `src/ui/viewModel.ts` now derives the label from the bucket's UTC timestamp (Monday-first `getUTCDay` mapping + `HH:MM UTC`). Verified: bucket 60 → 'Mon 10:00', bucket 1007 → 'Sun 23:50' on the real INF-B × WL-VM series and synthetic timestamps.
2. **Detail-chart readout** printed 'within budget' when demand was null. `minuteReadout(...)` now returns a discriminated result — `missing` → 'missing interval', `unknown` → 'unknown — \<reason\>' (RAG ingestion reason cites 65,536 vs 16,384 bytes), `value` → formatted breakdown with budget state only when a budget exists.
3. **Scaled breakdown**: `minuteReadout` returns existing / proposed (multiplier applied) / combined with explicit units (IOPS, ops/s, or the chart's decimal rate unit — never 'IOPS' for bandwidth), and asserts `existing + proposed (+ background) ≈ combined` within 1e-6 relative — a mismatch throws rather than silently rendering. Verified at Monday 10:05: 1× FE 75,000 + 15,000 = 90,000 IOPS; 2× FE 75,000 + 30,000 = 105,000; 2× backend 171,750 + 68,700 = 240,450 ops/s.
4. **Detail day selector**: `aria-label="Detail day"` select (Monday–Sunday) defaults to the engine-selected day; changing it re-extracts the 1,440-minute day, the derived-minute slice, and the preset windows for that day. Non-default days show 'Engine default: \<day\> — \<reason\>'; Saturday disables Morning burst with a 'Saturday' explanation.
5. **Forbidden-phrase fix**: finding text saying 'not validated against a real array' / 'no validated response curve' tripped the R-UI-4 'validated' scan. Engine wording changed to 'not measured on a real array' / 'no response curve in V1'; M1 and M2 goldens regenerated — the diff is wording-only (verified by inspection).

## M4 browser verification executed checks

Executed October 7, 2026, Chromium (`@playwright/test`), dev server on http://localhost:5173/:

| Check | Command | Outcome |
|---|---|---|
| Playwright e2e | `npm run e2e` | **15 passed, 3 skipped** — desktop project: 7 passed, 2 skipped (mobile-only tests); mobile project: 8 passed, 1 skipped (desktop screenshot test) |

Coverage (`tests/e2e/advisor.spec.ts`): all four infrastructure × workload combinations render the engine statuses (INF-B × WL-VM constraint on iops.backend; INF-A × WL-VM needs-investigation; INF-A × WL-RAG needs-investigation with 'computable minutes only' and 900 unknown minutes; INF-B × WL-RAG constraint); what-if multiplier/horizon controls update cards (2× → FE 87.5%, h=3 → growth constraint) and the delta table; weekly chart metric toggles, slider/hover/click/keyboard inspection, bucket-60 readout 'Mon 10:00 · 177,475 / 206,100', bucket-1007 'Sun 23:50'; detail chart presets (10:00 / 14:00 / 21:55), nightly 'not modeled' note, bandwidth unit rendering (GB/s, no 'IOPS'), backend-unknown readout with '65536' at Monday 02:00, Saturday morning-burst explanation, 'Engine default' line, distinct Y1/'Latency (ms)' axis labels; JSON and text downloads parsed and asserted (infrastructureId, workloadId, rulesetVersion, coverage, label, `weekly.backendOps.summary.max === 206100`, 'Weekly (10,080-minute trace'); forbidden-phrase scan (R-UI-4) across all four combinations; mobile 375 px checks (R-UI-3): no horizontal overflow (`scrollWidth` 375), panels stack to one grid column, SVG axis texts present, Y1/Y2 axis labels do not overlap, no element wider than the viewport.

### Screenshot index (docs/verification/m4/screenshots/)

| File | Caption |
|---|---|
| desktop-overview.png | Default INF-B × WL-VM: banner 'Modeled constraint' on iops.backend, six dimension cards |
| desktop-weekly-hidden-burst.png | Weekly backend ops/s at Mon 10:00 bucket — mean 177,475 below budget, minute max 206,100 above |
| desktop-detail-morning.png | Monday 10:05 minute: 75,000 existing + 15,000 proposed = 90,000 IOPS, baseline latency 1.4 ms |
| desktop-detail-bandwidth.png | Detail Y1 in GB/s — decimal rate unit on axis and readout |
| desktop-rag-unknown-ingestion.png | INF-A × WL-RAG backend view at 02:00 — 'unknown' citing 65,536 vs 16,384 block bytes |
| desktop-whatif-2x.png | 2× proposed demand: FE 87.5% of budget, backend 120.2% — constraint |
| desktop-environment-expanded.png | Environment details expanded: drive/layout arithmetic plus V2 descriptive previews |
| mobile-overview.png | 375 px: stacked header, controls, banner — no horizontal overflow |
| mobile-weekly.png | 375 px: weekly chart with wrapped legend and readout |
| mobile-detail.png | 375 px: detail chart, day selector, presets, dual-axis readout |

### Layout issues found and fixed during M4 (first pass)

- Mobile horizontal overflow (scrollWidth 515 → 375): workload `<select>` min-content exceeded the viewport; fixed with `select { max-width: 100% }`, full-width control labels ≤700 px, and `.columns > * { min-width: 0 }` so grid items can shrink. Evidence/delta tables became horizontally scrollable blocks at ≤700 px; `.env-grid` stacks to one column.
- Weekly readout lacked a unit for non-rate metrics; it appends 'ops/s', 'IOPS', or the rate unit.
- Pointer inspection during tests required scrolling the SVG into view first — a test fix, not a UI defect.

### Issues found in screenshot review and fixed (second pass)

1. **Dimension cards showed raw canonical units** ('headroom 27,793,649,922,512 bytes', '1,263,206,400 bytes/second'). New `formatHeadroom(value, unit)` in viewModel renders binary display units — '25.28 TiB', '1,204.7 MiB/s', '30,000 IOPS'. Card title 'Iops' → 'IOPS'.
2. **Latency and protection cards used budget vocabulary** they don't have ('unknown of operating budget', 'Within operating budget'). The latency card now shows 'Baseline P95 1.2 ms · max 1.4 ms · target 2 ms' plus 'Post-addition latency: unknown (no response curve in V1)'; the protection card shows 'Requirements met (declared)' with the four required-vs-declared capability rows and 'Selected capabilities, not whole-system availability.' Values come from the finding evidence via `latencyCard(check, weekly)` / `protectionCard(check)` in viewModel.
3. **Default-day reason had float noise** ('206100.00000000003', '2026-10-05T10:05:00.000Z'). `daySelect.ts` now rounds to 2 dp and trims '.000Z'. Goldens regenerated — diff is reason-string-only (verified) plus the earlier 'validated' wording change.
4. **The nightly 'not modeled' note displayed under every preset**; it now shows only when the nightly preset is selected (unavailable-preset explanations still always show).
5. **Mobile SVG text was unreadable** (~5 px at 375 px because the fixed 960-wide viewBox scaled down). Both charts now measure their container (`useChartWidth` + ResizeObserver, 640 px fallback in jsdom) and set the viewBox width to the measured CSS width, so text renders at its CSS font size everywhere. New Playwright check: every SVG `<text>` ≥ 9 px box height and axis titles don't overlap.
6. **Readout unit placement**: the unit now follows each value — '90,000 IOPS — within budget · existing 75,000 + proposed 15,000 IOPS'.

All 10 screenshots were re-generated and re-inspected after these fixes; the remaining images show correct values, readable text, and no overlap.

### Remaining unverified items

- Hover inspection is exercised in-browser via Playwright `mouse.move`; touch-specific gestures are untested.
- Screenshots are viewport captures at fixed widths; no print or high-DPI rendering was checked.
- Keyboard tab-order beyond the sliders and controls was not exhaustively audited.

## Not yet verified

- Nothing outstanding within M0–M4 scope; V2 modeling, real adapters, and live validation remain deferred scope.
