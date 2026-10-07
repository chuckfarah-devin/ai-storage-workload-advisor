# Findings

Business question: **"Can my current storage infrastructure support this new workload?"**

All numbers below are engine outputs of the deterministic V1 model over the bundled synthetic 7-day, 10,080-minute trace — not measurements. Evidence artifacts: [verification/m2/weekly-summaries.md](verification/m2/weekly-summaries.md) (weekly statistics per combination), [verification/m1/golden-assessments.md](verification/m1/golden-assessments.md) (rendered per-sample findings), [verification/m4/screenshots/](verification/m4/screenshots/) (browser captures), `tests/golden/` + `tests/golden/m2/` (committed fixtures).

**Synthetic data. Educational demonstration; not vendor sizing or production configuration guidance.**

## The answer, per combination (1× proposed demand, 1-year horizon)

| Combination | Overall | Limiting checks | Key engine numbers |
|---|---|---|---|
| INF-A (RAID 5) × WL-VM | Needs investigation | latency | FE max 90,000 of 120,000 (75%); backend max 152,100 of 200,000; no exceedance minutes; capacity 85.1% of budget |
| INF-B (RAID 6) × WL-VM | **Modeled constraint** | iops.backend, latency | Backend max 206,100 vs 200,000 budget; 100 exceedance minutes in 10 runs of 10 (weekdays 10:05–10:14 and 14:05–14:14); FE has 30,000 IOPS headroom |
| INF-A (RAID 5) × WL-RAG | Needs investigation | iops.backend, latency | 900 backend minutes unknown (weekday 02:00–05:00 ingestion); computable max 157,650; FE max 105,000 (87.5%) |
| INF-B (RAID 6) × WL-RAG | **Modeled constraint** | iops.backend, latency | Backend max 208,650 vs 200,000 budget; 100 exceedance minutes; the same 900 unknown ingestion minutes |

No combination returns an unconditional *modeled ready*: post-addition latency is never modeled in V1 (see below).

## Lessons the trace makes visible

**The hidden-burst lesson.** For INF-B × WL-VM, no ten-minute bucket *mean* exceeds the backend budget — the Monday 10:00 and 10:10 buckets average 177,475 ops/s — yet the per-minute maxima inside those buckets reach 206,100 with 5 above-budget minutes each (20 such buckets per week: 2 bursts × 2 straddled buckets × 5 weekdays). Aggregation alone would have concealed the constraint; the UI therefore shows both the bucket mean and the bucket minute-max ([desktop-weekly-hidden-burst.png](verification/m4/screenshots/desktop-weekly-hidden-burst.png)).

**The RAG block-size unknown.** During ingestion, proposed 65,536-byte blocks exceed the modeled 16,384-byte backend block, so the classic read-modify-write factor does not apply and the backend demand is reported as *unknown* — never zero, never within budget ([desktop-rag-unknown-ingestion.png](verification/m4/screenshots/desktop-rag-unknown-ingestion.png)). The weekly backend row is labeled 'computable minutes only · unknown minutes: 900'.

**The zero-coverage contract.** If no valid minute carries demand evidence for a check, the check reports needs-investigation with null headroom/utilization and 'cannot be modeled' wording — a missing interval could contain demand above budget, so nothing is fabricated. With partial coverage the observed headroom is kept but the implication is rewritten: readiness 'cannot be established' over the unobserved interval.

**What-ifs change the constraint, not just the margin.** INF-B × WL-VM at 2× demand: FE 105,000 (87.5% of budget — still inside), backend 240,450 (120.2% — a deeper constraint); capacity is unchanged, and at horizon 3 growth alone becomes a constraint (97.2% → 126.7% of budget).

## What the model does not establish

- **Post-addition latency** — V1 has no latency response model; baseline latency is shown for context and is explicitly not a prediction. Latency is always at least needs-investigation.
- **Whole-system availability** — group-level fault tolerance and the selected protection capabilities do not establish availability.
- **Real arrays** — every input is a declared synthetic figure; nothing is measured against live infrastructure, and the backend model excludes full-stripe writes, rebuild load, deduplication/compression, metadata IO, flash write amplification, and replication overhead.

## Presentation verification

R-UI-3/R-UI-4 browser checks pass on desktop and mobile (Playwright, Chromium): no horizontal overflow at 375 px, stacked panels, non-overlapping axis labels, wrapped legends, and no vendor or sizing claims. See [verification.md](verification.md) §M4 and the screenshot index.
