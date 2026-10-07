# AI Storage Workload Advisor
## Devin initial review and plan — milestone 1 (review/planning only)

Prepared by Devin for Chuck Farah, October 6, 2026. No application code, dependencies, remote repository, deployment or paid service was created. Baseline specifications were **not** modified; proposed edits are listed in §3 for Chuck's approval. Companion document: `docs/synthetic-profile-proposal.md`.

### 0. Files read

All seven files in the handoff package were read in full:

| File | Status |
|---|---|
| `START-HERE.md` | read |
| `AGENTS.md` | read |
| `DECISIONS.md` | read |
| `FIRST-DEVIN-ASSIGNMENT.md` | read |
| `docs/business-spec.md` (draft 0.2) | read |
| `docs/technical-spec.md` (proposed 0.1) | read |
| `docs/implementation-plan.md` (proposed 0.1) | read |

Nothing is missing relative to the START-HERE contents list. Observation: the workspace folder is not a git repository (no `.git`), consistent with DECISIONS ("no remote repository has been created").

---

### 1. Overall verdict

The specifications are coherent and unusually careful about what they do *not* claim. The direction is implementable as written with a small set of clarifications. I found **no contradiction that blocks the engine**, but five areas need a decision or a precise definition before fixtures and tests can be frozen, because each changes computed results:

1. Backend block-size mapping (what happens when workload IO sizes differ from the modeled backend block).
2. Existing-backend baseline: supplied vs. derived, and what the RAID 5/6 comparison compares.
3. Time-series details: percentile ranks, day-selection ties, coverage policy, whether the proposed workload also has a trace.
4. Readiness semantics: headroom denominator, latency baseline rule, growth default horizon, intra-dimension precedence, protection vocabulary.
5. Profile count: the plan says one infrastructure profile; the required demonstrations need two layouts.

Everything else in this report is either a small wording reconciliation or a proposal.

---

### 2. Specification review — conflicts, gaps, smallest changes

Priority order follows the assignment: block-size mapping, backend baseline, time-series evidence, readiness semantics, then the rest.

#### 2.1 Backend block-size mapping (priority 1)

**Current text.** `technical-spec.md` §Backend: "Synthetic scenarios use small random writes of one modeled backend block… Unknown write policy, cache behavior, **incompatible block sizes**, or absent backend limits produces needs investigation for the backend check." Workloads declare separate read and write block sizes; infra declares one "operation size". No rule says what "incompatible" means, and reads are not addressed at all.

**Gap.** Without a definition, an implementer will either (a) ignore sizes and apply 4/6 to everything — exactly what DECISIONS forbids — or (b) invent a scaling. Both change results.

**Proposed resolution (recommended, decision D-1).** Per minute record, the classic model applies only if *both* read block ≤ backend block and write block ≤ backend block. One logical read → one backend read × (1 − hit fraction); one logical write → one write-factor group. If either size exceeds the backend block, that minute's backend estimate is *unknown* with the reason recorded. Sub-check resolution: constraint (any computable minute over budget) > unknown (any uncomputable minute) > ready. Fixtures keep VM and RAG-query IO at 8/16 KiB so the model applies; RAG ingestion (64 KiB) deliberately triggers the unknown path so the demo shows the model's honest boundary. Alternative: ceil(size / backend block) scaling labeled as an upper bound — rejected for V1 because a 64 KiB RAID 5 write would count 16 operations, which is the "silent factor" hazard in a new shape.

Note that the rule is deliberately asymmetric from reality (large sequential writes are often full-stripe and *cheaper*); the spec already declares full-stripe behavior out of scope, so "unknown" is the honest answer rather than a pessimistic estimate.

#### 2.2 Existing-backend baseline consistency across RAID layouts (priority 2)

**Current text.** Infra profiles declare "existing backend demand"; combined = existing synthetic backend demand + proposed estimate; "Do not multiply existing physical backend telemetry again." The trace record holds "any declared background backend demand". Separately: "Provide a fixed educational RAID 5/RAID 6 comparison for identical logical demand… compares operation overhead only."

**Conflict.** If existing backend demand is *supplied* as a number, then two profiles that differ only by RAID layout but carry the same supplied existing-backend figure are inconsistent (the same existing logical writes cost 4× on one and 6× on the other). If each carries a different hand-picked figure, the comparison silently mixes two baselines of different origin. Also, the static infra fields "existing demand in IOPS and bytes/second" duplicate the per-minute existing demand in the trace — a double-counting hazard the business spec explicitly warns about.

**Proposed resolution (recommended, decision D-2a).** Existing backend demand is **derived** per minute from the existing logical read/write IOPS in the trace using the infra profile's layout and cache assumptions, exactly as for the proposed workload. The record field "declared background backend demand" stays as a separate, layout-independent, explicitly labeled additive term (0 in V1 fixtures, exercised in tests). The profile records `existingBackendBasis: "derived-from-logical-trace"`; a future adapter that supplies physical telemetry records `"supplied-physical"` and the engine must then **not** derive. Mixing bases in one assessment is a validation error.

Consequences: the RAID 5/6 comparison becomes fully coherent (same logical baseline + same proposed demand, two layouts) and can show both proposed-only overhead (19,000 vs 25,000 in the spec example) and the combined readiness outcome. Static "existing demand" fields in the infra model should be dropped or marked as derived summaries of the trace (edit E-3).

**Secondary (decision D-2b).** The spec puts the read-cache hit fraction on the infrastructure profile; cache hit rate is really a property of the workload's locality on that array. V1 simplest: keep one infra-level fraction (0.30 proposed) and state it as a limitation. Alternative: each workload declares its own expected hit fraction. Recommend infra-level for V1.

#### 2.3 Time-series evidence (priority 3)

Gaps and proposed definitions (no conflicts, just under-specification):

| Item | Current text | Proposed definition |
|---|---|---|
| Proposed workload shape | Record holds "proposed read/write IOPS" but the workload model has a single IOPS figure | Workload profiles carry their own daily/weekly schedule; the generator materializes proposed demand per minute aligned to the same timestamps. The single "IOPS" field becomes the schedule's peak and is display-only. (E-4) |
| Nearest-rank percentile | "nearest-rank… definition documented" | Sort N valid minute samples ascending; P_k = value at rank ⌈k/100 × N⌉ (1-based). For N = 10,080: P90 = rank 9,072; P95 = rank 9,576. Document in rules and test with a tiny known array. |
| Day selection tie-break and midnight | "earliest day containing the longest continuous exceedance" | Run spanning midnight: the day containing the run's **first** minute. Equal-length runs: earliest start. Second rule: ratio = demand/budget per resource per minute; the day containing the earliest minute achieving the weekly maximum ratio. Record the selection reason string. |
| Coverage policy | Missing minutes break runs, reduce coverage, never zero-filled | Add: if coverage < 100 % for a resource, that resource cannot be *ready* (becomes needs investigation unless a constraint is observed). V1 bundled trace is complete; the path is covered by test fixtures only. (D-7) |
| Exceedance test granularity | "Any observed modeled exceedance produces a modeled constraint" | Confirm: evaluated on combined demand per **minute** against the budget; ten-minute bucket statistics are display/context only. (Already implied; make explicit.) |
| Capacity baseline | "Capacity checks use maximum used capacity" vs. growth formula using "existing used capacity" | Both use the week's maximum used capacity. (E-5) |
| What-if scope | Demand factors apply to "proposed IOPS and derived throughput only" | Add "…and the proposed backend estimate derived from them"; proposed *capacity* is not scaled by the demand multiplier. (E-6) |
| Business vs. technical default-day wording | Business: "day with the highest modeled sustained resource pressure" | Align to the technical rule (longest exceedance, else highest utilization ratio). (E-1) |
| Bucket display | Means + per-metric maxima + minutes above budget | Confirm weekly chart draws both bucket mean and bucket max, with minutes-above-budget as a third series or shading; otherwise the "hidden burst" is only in tables. |

The profile proposal is built so that every one of these is exercised by the shipped data: bursts straddle bucket boundaries (bucket mean hides, bucket max shows), the batch run crosses midnight, and P90/P95 sit below budget while the max exceeds it.

#### 2.4 Readiness semantics (priority 4)

| Item | Current text | Issue | Proposed resolution |
|---|---|---|---|
| Headroom units/denominator | "headroom where calculable" | Open issue in DECISIONS | Headroom in absolute units relative to the **budget** (TiB, IOPS, ops/s, MiB/s; negative = constraint). Percentage shown as "% of operating budget" (primary); "% of physical limit" shown secondarily and labeled. Never mix in one chart axis. (D-3) |
| Latency baseline rule | "baseline latency above the workload target flags a baseline concern" | Not a status. Which statistic? | Compare baseline weekly **P95** minute latency to the target; show max alongside. P95 > target → *modeled constraint* (labeled "baseline, before addition"); otherwise → *needs investigation* (post-addition unknown). Both fixtures sit below target so the shipped demos show the investigation path; the constraint path is test-fixture only. (D-4a) |
| Growth default horizon | Horizons 0/1/3 years; no default | Horizon 0 duplicates capacity dimension | Default horizon 1 year; 0 and 3 are what-ifs. Growth dimension always states its horizon. (D-4b) |
| Intra-dimension precedence | IOPS has two sub-checks | Not stated | Dimension status = constraint if any sub-check constraint, else needs investigation if any unknown, else ready; same precedence as overall. Findings keep both sub-check results visible. |
| Protection vocabulary | "explicit required and available capabilities" | Undefined set → tests cannot be written | Fixed V1 vocabulary: `toleratedDriveFailures` (int, from layout), `snapshots` (bool), `encryptionAtRest` (bool), `replication` (`none`/`async`/`sync`/`unknown`). Workload requires: `minToleratedDriveFailures`, `snapshots`, `encryptionAtRest`, `replicationRequired`. Any infra value `unknown` against a requirement → needs investigation; definite shortfall → constraint. (D-5) |
| Equality | "Equality is within budget" | Fine | Keep; add test at exact budget (RAG 1.5× lands exactly on 120,000 FE IOPS, see profile proposal). |
| Overall status with unknown latency | Business spec "appears ready" wording | Not a conflict, but visitors may expect a green overall result | Add one sentence to the business spec's success criteria: "In V1 the overall result is never an unconditional *modeled ready*; the strongest V1 outcome is *needs investigation* with all arithmetic dimensions ready." (E-2) |
| Confidence vocabulary | high / moderate / insufficient | Fine | Map: arithmetic with complete inputs → high; capability matching → moderate; any unknown → insufficient. |

#### 2.5 Other reconciliations

- **Profile count (E-7).** `implementation-plan.md` step 4 says "one infrastructure profile and two workload profiles." The RAID 5/6 comparison and the required "front-end headroom but backend constraint" case need two infra layouts. Smallest change: two synthetic protection-layout variants with equal declared raw capacity and limits, differing in layout (and therefore usable capacity and derived backend load). 2 × 2 = 4 curated combinations.
- **Throughput as input (E-8).** Business spec lists proposed "throughput" among normalized inputs; technical spec says fixture throughput is derived. Make the business spec say "throughput (derived from IOPS and block sizes in V1)".
- **Internal model completeness (E-3).** Technical spec §Internal model omits the backend fields that §Backend requires (layout, width, backend limit, operation size, hit fraction, write policy, background demand, basis). Add them to the infrastructure model list.
- **Usable capacity across layouts.** Technical spec says the comparison "does not imply identical usable capacity." The profile proposal makes this concrete: same raw 225 TiB → 200 TiB (RAID 5 8+1) vs 180 TiB (RAID 6 8+2), spares/metadata excluded. Worth a sentence so visitors see the trade-off both ways.
- **Research link accuracy.** The spec cites SG24-7808 as "IBM performance guidance". It is *End to End Performance Management on IBM i* (2009) and does contain the explicit 4/6 statement (Appendix A, pp. 249–250). A second, more directly relevant IBM Redpaper (REDP-4484, p. 3) walks through the read-modify-write steps. Both verified; see §7. Suggest citing both with page numbers (E-9).

---

### 3. Proposed edits to the baseline documents (not applied)

| ID | Document / section | Proposed change |
|---|---|---|
| E-1 | business-spec §Two observation intervals | Replace "day with the highest modeled sustained resource pressure" with "day selected by the technical rule: earliest day containing the longest continuous exceedance; otherwise highest budget-utilization ratio". |
| E-2 | business-spec §Demonstration and success criteria | Add: "In V1 the overall result is never an unconditional modeled ready; the strongest outcome is needs investigation with all arithmetic dimensions ready." |
| E-3 | technical-spec §Internal model, Infrastructure | Add backend fields: layout, data/parity width, backend operation limit, backend operation size, read-cache hit fraction, write policy, background backend demand, `existingBackendBasis`. Replace static "existing demand in IOPS and bytes/second" with "existing demand is carried by the minute trace; static summaries are derived". |
| E-4 | technical-spec §Internal model, Workload | Add: "daily/weekly demand schedule from which the proposed per-minute trace is generated; the scalar IOPS field is the schedule peak and is informational". |
| E-5 | technical-spec §Assessment rules | "Current capacity = **maximum observed** existing used capacity + proposed capacity"; the projection uses the same base. |
| E-6 | technical-spec §Assessment rules, what-ifs | "…apply to proposed IOPS, derived throughput, **and the derived proposed backend estimate**; proposed capacity is unaffected by the demand factor." |
| E-7 | implementation-plan step 4 | "two synthetic infrastructure profiles (protection-layout variants, RAID 5 vs RAID 6, with equal declared raw capacity and limits) and two workload profiles". |
| E-15 | technical-spec §Backend | Make the read/write split explicit: backend reads = logical reads × (1 − hit) + logical writes × 2 (RAID 5) or × 3 (RAID 6); backend writes = logical writes × 2 or × 3. Extend the verification example: 19,000 = 13,000 reads + 6,000 writes; 25,000 = 16,000 + 9,000. |
| E-16 | technical-spec §Rules, Protection | Add: "The V1 capability vocabulary covers selected capabilities, not complete availability assurance." |
| E-8 | business-spec §Inputs | "throughput (derived from IOPS and block sizes in V1)". |
| E-9 | technical-spec §Backend, Research basis | Cite REDP-4484 p. 3 and SG24-7808 pp. 249–250 with titles; keep the Dell OneFS coalescing counterexample. |
| E-10 | technical-spec §Backend | Insert the block-size applicability rule from §2.1 (pending D-1). |
| E-11 | technical-spec §Backend | Insert the derived-baseline rule and `existingBackendBasis` semantics from §2.2 (pending D-2a). |
| E-12 | technical-spec §Time-series | Insert percentile rank formula, tie-break rules, coverage policy from §2.3. |
| E-13 | technical-spec §Assessment rules | Insert headroom denominator, latency P95 rule, default horizon, intra-dimension precedence, protection vocabulary from §2.4 (pending D-3..D-5). |
| E-14 | DECISIONS.md | Record outcomes of D-1..D-11 (done October 6, 2026 — see DECISIONS.md "Resolutions from first review"). |

---

### 4. Recommended frontend/test stack

**Recommendation: Vite + TypeScript + React, Vitest, Playwright; engine as a DOM-free module.**

| Layer | Choice | Rationale |
|---|---|---|
| Engine (`src/engine`) | Plain TypeScript, zero DOM/browser imports, pure functions | The business model must not depend on the UI (technical spec §Architecture). Pure functions make determinism and the requirement-to-test map trivial; Vitest runs them in Node in milliseconds. |
| Unit/engine tests | Vitest | Same config and TypeScript pipeline as Vite; fast; snapshot support for the fixed trace summaries. |
| UI | React + TypeScript via Vite | Most widely understood; component model fits six dimension cards + findings list; static build deploys anywhere later (GitHub Pages is a later decision, not now). |
| Charts | Hand-rolled SVG components first; adopt a small library (uPlot or Chart.js) only if interaction needs exceed what SVG gives | 1,440 and 1,008 points are tiny. SVG keeps dependencies near zero and makes the bucket-mean / bucket-max / minutes-above-budget series fully controllable. Decide at the UI milestone with the trace already rendering. |
| Browser verification | Playwright (Chromium only) | Scripted walkthrough of both scenarios, what-if toggles, label presence, narrow-viewport screenshot; produces the screenshots the verification doc requires without fabricating them. |
| Lint/format | ESLint + Prettier defaults | Low ceremony. |
| Data | Profiles as versioned JSON (`data/profiles/*.json`) validated at load; trace generated at build/startup from the schedule, not checked in as 10,080 rows | Keeps the repository readable and the generator testable; a checked-in CSV export of the trace can be an optional verification artifact. |

**Simpler alternative:** Vite + vanilla TypeScript (no React), Vitest, and *manual* browser verification recorded as a checklist with screenshots taken by hand. Saves React and Playwright. Cost: UI state handling (profile selection × what-if × day selection × two charts) gets procedural quickly, and verification evidence is harder to reproduce. I would take this route only if Chuck wants the portfolio to emphasize "minimal dependency surface" over "repeatable verification".

Not recommended: Next.js or any server framework (no backend exists), Python/Streamlit (two runtimes for a one-page tool), any charting stack that pulls in D3 wholesale.

---

### 5. Decisions — resolved by Chuck, October 6, 2026

| ID | Decision | Resolution |
|---|---|---|
| D-1 | Backend block-size rule | **Unknown** outside the explicitly supported small-write model; no automatic scaling. |
| D-2a | Existing backend demand | **Derived** from the existing logical trace, separately for each RAID layout; `existingBackendBasis` field retained so a future supplied-telemetry source is never re-multiplied. |
| D-2b | Read-cache hit fraction | One declared synthetic value on the infra profile for V1, identified as a simplification. |
| D-3 | Headroom percentages | Operating budget is the primary denominator; physical-limit utilization labeled separately. |
| D-4a | Latency baseline rule | Baseline **P95 as a screening indicator** (constraint if above target, else needs investigation); maximum shown alongside. |
| D-4b | Default growth horizon | **1 year**; 0 and 3 years as what-ifs. |
| D-5 | Protection | Vocabulary `toleratedDriveFailures`, `snapshots`, `encryptionAtRest`, `replication`. Both shipped workloads are satisfied by both arrays; mismatches exercised in tests only. **This vocabulary covers selected capabilities, not complete availability assurance** — state this in the UI and findings. |
| D-6 | Trace realism | **No jitter** initially. |
| D-7 | Coverage policy | Incomplete coverage prevents a *ready* result for that resource. |
| D-8 | Infrastructure profiles | **Two synthetic protection-layout variants** with equal raw capacity and declared limits. Not to be described as "identical hardware". |
| D-9 | Plausibility of proposed numbers | Accepted as teaching assumptions. Chuck still owns the domain judgment on whether the 30 % cache-hit value, the performance envelope, the capacity additions and the growth rates tell a believable storage story; he can revise them before M1 fixtures are frozen. |
| D-10 | Stack | **React, TypeScript, Vitest, Playwright.** |
| D-11 | Repository | The existing extracted handoff folder becomes the local repository; GitHub remote decided later. |

#### 5.1 Corrections from Chuck's review (applied to this report and the profile proposal)

1. **Backend read/write split.** In the classic read-modify-write path the parity-related reads are backend *reads*: backend reads = logical reads × (1 − hit) + logical writes × 2 (RAID 5) or × 3 (RAID 6); backend writes = logical writes × 2 or × 3. Totals in the original draft were correct; the per-direction breakdown was not. Example, RAID 6 burst baseline: reads 104,250, writes 67,500, total 171,750. Test R-BE-1 must assert this split.
2. **"Identical hardware" wording** replaced with "synthetic protection-layout variants with equal raw capacity and declared limits"; equal raw capacity and limits do not establish an identical physical drive arrangement.
3. **M1 cannot verify weekly statistics.** M1 golden outputs verify individual aligned demand samples (plateau minutes). Weekly P95, exceedance duration, day selection and the complete four-combination assessment move to M2 (reflected in §6 and §9 below).

---

### 6. Bounded milestone plan

Engine correctness (M1, M2) is separated from UI (M3) and browser verification (M4). Each milestone ends with a report listing requirement references, executed checks and results, limitations, and next-step recommendation. No milestone claims a check that was not run.

#### M0 — Repository foundation and spec freeze (small)

Scope: apply approved edits E-1…E-16 and the D-1…D-11 resolutions to the specs; create the documentation skeleton (§8); write `docs/question.md` and `docs/research.md` (only the sources in §7 plus any Chuck adds); initialize local git; scaffold Vite + TypeScript with no application code beyond "hello"; record stack choice in DECISIONS.
Acceptance: all docs present with the lifecycle index in README; `npm test` runs an empty suite; no remote until D-11.

#### M1 — Static engine: model, validation, scalar rules

Scope: normalized model types; JSON profile loading and validation; unit conversions; capacity, growth, throughput, front-end and backend IOPS scalar rules (with separate backend read/write totals); protection matching; latency rule taking a supplied baseline P95/max as input; status precedence; findings objects with rule IDs; what-if multipliers. No trace yet — rules take one **aligned demand sample** (a single minute's existing + proposed values) as input.
Acceptance: all tests in the M1 rows of §6.1 pass; the 19,000 / 25,000 example passes with the read/write split 13,000 / 6,000 and 16,000 / 9,000; running the scalar rules on the plateau samples from the profile proposal (business, burst, batch, patch, query, ingestion) for each of the four profile combinations reproduces the per-sample numbers in the proposal's §2, §3 and §5 (e.g., burst sample WL-VM/INF-B backend 206,100 > 200,000; RAG 2× FE 135,000 > 120,000) as a committed golden fixture; Chuck reviews a plain-text per-sample rule output. **Not** in M1: weekly P90/P95/max, exceedance duration, day selection, or an overall four-combination verdict — those require the trace and belong to M2.

#### M2 — Deterministic trace, aggregation, time-series rules

Scope: schedule → 10,080-minute generator (UTC, fixed days, declared seed even if unused); per-minute derived throughput and backend ops (with the block-size applicability rule); 1,440-record day extraction; 1,008 ten-minute buckets (mean, per-metric max, capacity at bucket end, minutes above budget); weekly nearest-rank P90/P95/max; exceedance minutes, % of valid time, longest run, recurrence; default-day selection with reason; coverage handling with missing-minute fixtures; assessment over the trace.
Acceptance: all M2 rows of §6.1 pass; the WL-VM/INF-B case shows 100 exceedance minutes, longest run 10, no bucket mean above budget, bucket max above budget; the complete four-combination assessment reproduces the profile proposal's §5 matrix (dimension statuses, overall statuses, weekly P90/P95/max, exceedance durations, default day) as a committed golden fixture; CSV/JSON export of the trace summary committed as verification evidence; Chuck reviews the summary tables and the four plain-text assessments.

#### M3 — Interface

Scope: profile and scenario selection; six dimension cards with sub-checks; findings with rule IDs, evidence, calculation, implication, next investigation, confidence, assumptions; baseline vs what-if comparison; detail-day chart and weekly chart (mean + max + minutes above budget); day selector with reason; persistent synthetic/educational label; plain-text download.
Acceptance: renders all four combinations from engine output only (no UI-side arithmetic); every displayed number traces to an engine field; label visible on every view and in the download; narrow-viewport layout readable; no live-integration or vendor-support wording anywhere in the UI.

#### M4 — Browser verification, findings, walkthrough

Scope: Playwright script covering both scenarios, what-if toggles, day selection, label presence, download content; screenshots stored under `docs/verification/`; `docs/verification.md` listing executed checks with results; `docs/findings.md` (what the model establishes, what remains unknown, what V2 needs); five-minute walkthrough script; README product story.
Acceptance: every claim in verification.md links to an artifact produced in that run; findings explicitly include the unknown post-addition latency and the block-size boundary; Chuck signs off.

Deferred (unchanged): profile editing, replication what-ifs, failure/rebuild simulation, consolidation, additional scenario packs, adapters, deployment.

#### 6.1 Requirement-to-test mapping

Requirement IDs are proposed here so tests can reference them; they should be copied into the specs during M0.

| Req ID | Requirement (source) | Milestone | Test(s) |
|---|---|---|---|
| R-UNIT-1 | Canonical bytes/seconds/IOPS/ms; display TiB, MiB/s (tech §Internal model) | M1 | unit round-trips; 1 TiB = 2^40; 16 KiB = 16,384 B |
| R-VAL-1 | Reject negatives, invalid fractions, nonpositive limits, used > usable, non-synthetic input, mixed backend bases (tech §Validation, §2.2) | M1 | one failing fixture per rule |
| R-BUD-1 | 80 % budget on capacity, FE IOPS, throughput, backend; not on latency/protection (business §Decisions) | M1 | budget = 0.8 × limit for four resources; latency/protection rules ignore it |
| R-CAP-1 | Capacity = max used + proposed vs budget; equality within budget (tech §Rules, E-5) | M1 | below / equal / above budget |
| R-GRO-1 | Compounded projection, default horizon 1 yr, horizons 0/1/3 (tech §Rules, D-4b) | M1 | hand-computed 141.71 TiB and 184.43 TiB cases from profile proposal |
| R-THR-1 | Throughput = IOPS × weighted block; derived, not input (tech §Rules) | M1 | 15,000 × 13.6 KiB = 199 MiB/s; all-read and all-write cases |
| R-FE-1 | Combined FE IOPS vs budget (tech §Rules) | M1 | 90,000 / 105,000 / 120,000 (equality) / 135,000 cases |
| R-BE-1 | RAID 5 factor 4, RAID 6 factor 6; backend reads = logical reads × (1 − hit) + writes × 2 or 3; backend writes = writes × 2 or 3 (tech §Backend, §5.1) | M1 | 19,000 = 13,000 R + 6,000 W; 25,000 = 16,000 R + 9,000 W; RAID 6 burst baseline 104,250 R + 67,500 W; all-read; all-write; hit 0 and 1 boundaries |
| R-BE-2 | No double counting: existing backend derived once; background demand added once; supplied-physical basis never re-multiplied (§2.2) | M1 | fixture with basis = supplied asserts factor not applied; derived fixture asserts it is |
| R-BE-3 | Block-size applicability → unknown (D-1) | M1 | 64 KiB write → unknown with reason; 16 KiB → computable |
| R-BE-4 | FE headroom but backend constraint → IOPS dimension constraint with distinct explanation (tech §Backend) | M1/M2 | WL-VM on INF-B plateau case; then trace case |
| R-LAT-1 | Baseline P95 vs target; post-addition always needs investigation (tech §Rules, D-4a) | M1 | fixtures with P95 above/below target; post-addition never ready |
| R-PRO-1 | Capability matching; unknown → investigation; shortfall → constraint (tech §Rules, D-5) | M1 | 2-failure requirement vs RAID 5; replication unknown vs none-required; snapshots missing |
| R-STAT-1 | Precedence constraint > unknown > ready at sub-check, dimension and overall level (tech §Rules) | M1 | truth-table test |
| R-SET-1 | Sample-set selection: precedence tiers, highest budget utilization within numeric tiers, earliest-at-status for non-numeric/unknown, aligned evidence retained | M1 | r-set-1-sample-set-selection.test.ts |
| R-ENV-1 | Environment block coherence validation: drive arithmetic, slot bound, parity-width match, raw-bytes and usable-capacity bounds, reserve range | M2 | r-env-1-environment.test.ts |
| R-WHAT-1 | Multipliers 1/1.5/2 apply to proposed IOPS, throughput, backend; not capacity (E-6) | M1 | RAG 2× FE constraint; capacity unchanged |
| R-FIND-1 | Every finding has rule ID, inputs, calculation, implication, next investigation, confidence, assumptions (tech §Findings) | M1 | schema test over all findings from the four combinations |
| R-TS-1 | Exactly 10,080 minute records, aligned UTC timestamps, fixed days (tech §Time-series) | M2 | count and timestamp monotonicity |
| R-TS-2 | 1,440-record detail day; 1,008 nonoverlapping buckets (tech §Time-series) | M2 | counts; bucket boundaries |
| R-TS-3 | Bucket mean, per-metric max, capacity at end, minutes above budget; rates never summed as rates (tech §Time-series) | M2 | hidden-burst bucket: mean 177,475, max 206,100, minutes above = 5 |
| R-TS-4 | Nearest-rank P90/P95 from minute samples; ranks 9,072 / 9,576 (§2.3) | M2 | small known array; weekly values below budget while max exceeds |
| R-TS-5 | Exceedance minutes, % of valid time, longest run, recurrence; run crossing midnight stays one run (tech §Time-series) | M2 | 100 minutes, 0.99 %, longest 10, 10 occurrences; synthetic fixture with a run across midnight |
| R-TS-6 | Noncoincident peaks are never merged into one record (tech §Time-series) | M2 | fixture where FE max and BE max occur at different minutes |
| R-TS-7 | Missing minutes: unknown, break runs, reduce coverage, never zero; coverage < 100 % prevents ready (D-7) | M2 | fixture with a gap |
| R-DAY-1 | Default day rule, tie-breaks, reason string, deterministic (tech §Time-series, §2.3) | M2 | WL-VM/INF-B → Monday (earliest 10-min run); no-exceedance case → highest-ratio day |
| R-REP-1 | Same inputs → identical outputs (tech §Validation) | M2 | hash of two generator runs equal |
| R-UI-1 | Six cards, findings, what-if comparison, label on every view and download (tech §Findings) | M3/M4 | Playwright: elements present per route/state |
| R-UI-2 | Charts show bucket mean and max and minutes above budget (§2.3) | M3/M4 | Playwright: series present; screenshot |
| R-UI-3 | Narrow-screen readability (tech §Validation) | M4 | Playwright viewport 375 px screenshot, manual check recorded |
| R-UI-4 | No live-integration, vendor-support or sizing claims (AGENTS) | M4 | text grep over built bundle and docs for forbidden phrases |

---

### 7. Research basis — sourced facts vs. derived vs. assumptions

**Sourced facts** (official/primary documents; pages verified by downloading the PDFs and extracting text on October 6, 2026):

1. IBM Redpaper **REDP-4484**, *Considerations for RAID-6 Availability and Format/Rebuild Performance on the DS5000* (2009, updated 2010), https://www.redbooks.ibm.com/redpapers/pdfs/redp4484.pdf, **printed page 3**, section "Writing one strip": "This results in a total of four I/O operations to the HDDs. Read and write the data and read and write the parity." and "Reading and writing two parity disks instead of one requires four operations. RAID-6 requires six operations in total (read and write two parity disks plus the data)." The same page notes that for sequential operations full strips are often already in cache and the arithmetic changes — which is why the spec confines the model to small random writes.
2. IBM Redbook **SG24-7808**, *End to End Performance Management on IBM i* (November 2009), https://www.redbooks.ibm.com/redbooks/pdfs/sg247808.pdf, Appendix A "Understanding disk performance metrics", **printed pages 249–250**: "It takes four disk accesses to perform a write to a RAID 5 protected disk device. It takes six disk accesses for RAID 6. But with a write cache, an application does not care about all these disk accesses." This is the document the current spec links; the title should be corrected (E-9). Its write-cache remark also supports the spec's statement that write-back cache changes *latency* perception, not sustained backend operation count.
3. Dell Technologies Info Hub, *OneFS Writes*, https://infohub.delltechnologies.com/en-us/p/onefs-writes/: "Failure-safe buffering using a write coalescer is used to ensure that writes are efficient and read-modify-write operations are avoided." Supports the spec's boundary that RAID level alone cannot determine load on coalescing/erasure-coded systems. (Page fetched via search excerpt; the Info Hub returned HTTP 403 to direct fetch, so the quote should be re-confirmed in a browser during M0.)

Both IBM documents are marked "for reference only; product withdrawn or replaced" — they are used for the general read-modify-write arithmetic, not for any product claim.

**Derived calculations:** everything marked [D] in the profile proposal (usable capacity from raw and layout, budgets, weighted block sizes, throughput, backend operations, projections, percentiles, bucket means). Each is reproducible by hand and is mapped to a test above.

**Synthetic assumptions:** all limits, demand schedules, growth rates, latency values, cache fraction, block sizes and protection capabilities in the profile proposal. No vendor benchmark, VMware or RAG measurement, or industry survey was consulted or is implied. No vendor API research was performed (consistent with the spec's "future adapters only").

---

### 8. Proposed repository documentation structure

```
README.md                      Product story; lifecycle index linking the eight stages below; synthetic/educational label
AGENTS.md                      Agent working rules (from handoff)
DECISIONS.md                   Decision record (from handoff; D-1..D-11 outcomes appended)
docs/
  01-question.md               Question → the business question, audience, decision the tool supports, non-goals
  02-research.md               Research → sourced facts with page citations (this report §7); uncertainties; what was NOT researched
  03-business-spec.md          Business Spec → current business-spec.md with approved edits; version history
  04-technical-spec.md         Technical Spec → current technical-spec.md with approved edits; rule IDs (R-*)
  05-implementation-plan.md    Build → milestones M0–M4, acceptance criteria; per-milestone build reports appended
  06-tests.md                  Tests → requirement-to-test map (§6.1), how to run, last executed results summary
  07-verification.md           Verification → executed scenario checks, Playwright run summary, screenshots index
  08-findings.md               Findings → what the model establishes, what remains unknown, limitations, next version
  synthetic-profile-proposal.md  Profile rationale and plausibility review (this proposal, then marked approved)
  devin-initial-review.md      This report (historical record of milestone 1)
  verification/                Screenshots and exported trace summaries produced by actual runs only
data/
  profiles/                    Versioned JSON: INF-A, INF-B, WL-VM, WL-RAG, schema version, synthetic flag
src/
  engine/                      Pure TypeScript: model, validation, rules, trace generator, aggregation, findings
  ui/                          React components; reads engine output only
tests/
  engine/                      Vitest; file names carry R-* IDs
  e2e/                         Playwright
```

Numbering the docs keeps the lifecycle order visible in any file listing. The handoff files (`START-HERE.md`, `FIRST-DEVIN-ASSIGNMENT.md`) can move to `docs/handoff/` as historical artifacts.

---

### 9. Recommended next assignment

Decisions D-1…D-11 are resolved (§5). The next assignment should be **M0 + M1 together**: apply edits E-1…E-16 to the specifications with the §5 resolutions and §5.1 corrections; initialize the handoff folder as the local git repository and establish the documentation structure in §8; scaffold Vite + TypeScript + React + Vitest (Playwright deferred to M3/M4); implement the static engine (model, validation, scalar rules with separate backend read/write totals, findings) with the §6.1 M1 tests; commit the per-sample golden fixture and a plain-text per-sample rule output for Chuck's review. No trace generator, no weekly statistics, no UI, no remote push. Return the build report with executed test output before M2 is authorized.
