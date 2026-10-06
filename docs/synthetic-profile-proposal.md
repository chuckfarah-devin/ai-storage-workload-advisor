# AI Storage Workload Advisor
## Synthetic profile proposal — draft 0.1 (for Chuck's plausibility review)

Prepared by Devin, October 6, 2026, during the review/planning milestone. Nothing here is implemented. Every number below is a **proposed educational assumption** chosen so the demonstration exercises each rule predictably. None is a vendor benchmark, a VMware or RAG measurement, or sizing guidance.

Label carried by all profiles: *Synthetic data. Educational demonstration; not vendor sizing or production configuration guidance.*

### How to read this document

| Marker | Meaning |
|---|---|
| **[S]** Sourced fact | Taken from an official/primary document cited in `devin-initial-review.md` §7. Only the classic RAID 5/6 small-write arithmetic and the "coalescing avoids read-modify-write" counterexample are sourced. |
| **[D]** Derived | Arithmetic from the proposed assumptions using the rules in `technical-spec.md`. Reproducible by hand; a test should assert each one. |
| **[A]** Synthetic assumption | Chosen by Devin for the demonstration. Needs Chuck's plausibility judgment. No provenance beyond "educational choice". |

Units: capacity in TiB (1 TiB = 2^40 bytes); block sizes in KiB (1 KiB = 1,024 bytes); throughput in MiB/s; latency in milliseconds; IOPS and backend operations per second. Canonical storage in the model remains bytes/seconds/IOPS/ms per the technical spec.

---

## 1. Infrastructure profiles

Two profiles are synthetic protection-layout variants with equal declared raw capacity, equal declared limits, and identical existing logical demand; they differ only in protection layout. This is what makes the RAID 5 versus RAID 6 comparison coherent: same raw capacity, same declared front-end and backend limits, same existing *logical* trace, different usable capacity and different *derived* backend load. "Equal raw capacity and declared limits" is an abstract comparison device; it does not establish an identical physical drive arrangement, and the profiles should not be described as "the same hardware".

| Attribute | INF-A "Midrange all-flash, RAID 5 (8+1)" | INF-B "Midrange all-flash, RAID 6 (8+2)" | Marker / note |
|---|---|---|---|
| Synthetic flag | true | true | required |
| Modeled raw capacity | 225 TiB | 225 TiB | [A] used only to derive usable; not an input to any rule |
| Protection layout | RAID 5, 8 data + 1 parity | RAID 6, 8 data + 2 parity | [A] |
| Usable capacity (after protection) | **200 TiB** (= 225 × 8/9) | **180 TiB** (= 225 × 8/10) | [D] ignores spares/metadata reserve, stated as exclusion |
| Capacity operating budget (80%) | 160 TiB | 144 TiB | [D] |
| Used capacity at trace start | 100 TiB | 100 TiB | [A] |
| Used capacity at trace end (week) | ≈ 100.27 TiB | ≈ 100.27 TiB | [D] 100 × 1.15^(7/365.25); linear within the week |
| Existing annual capacity growth | 15 % / yr | 15 % / yr | [A] |
| Sustainable front-end IOPS limit | 150,000 | 150,000 | [A] declared, not derived from drive count |
| Front-end IOPS budget (80%) | 120,000 | 120,000 | [D] |
| Sustainable throughput limit | 3,000 MiB/s | 3,000 MiB/s | [A] |
| Throughput budget (80%) | 2,400 MiB/s | 2,400 MiB/s | [D] |
| Backend sustainable operation limit | 250,000 ops/s | 250,000 ops/s | [A] equal declared limit in both variants; does not imply an identical physical drive arrangement |
| Backend operation budget (80%) | 200,000 ops/s | 200,000 ops/s | [D] |
| Modeled backend block (operation size) | 16 KiB | 16 KiB | [A] see mapping rule §4 |
| Read-cache hit fraction | 0.30 | 0.30 | [A] single infra-level value applied to all logical reads |
| Write policy | write-back; every logical write destages as one backend block; no coalescing; no full-stripe optimization | same | [A] bounded model boundary |
| Write factor per logical write | 4 (2 reads + 2 writes) | 6 (3 reads + 3 writes) | [S] classic read-modify-write; see review §7 |
| Existing backend demand basis | **derived** from the existing logical trace with the profile's layout and cache assumptions | same | proposed resolution of DECISIONS open issue; see review §2.2 |
| Declared background backend demand | 0 ops/s | 0 ops/s | [A] field exists, set to zero in V1 so it is visibly not double-counted |
| Rebuild / degraded state | not modeled | not modeled | exclusion |
| Baseline latency (synthetic observed) | per-minute trace: quiet 0.6 ms, business 0.9 ms, burst 1.4 ms, batch 1.2 ms, weekend 0.7 ms | same | [A] a label of the existing environment only; no response curve |
| Baseline latency weekly P90 / P95 / max | ≈ 1.2 / 1.2 / 1.4 ms | same | [D] nearest-rank over 10,080 minutes |
| Protection capabilities | tolerated drive failures per group: 1; snapshots: yes; encryption at rest: yes; replication: *not modeled (unknown)* | tolerated drive failures: 2; snapshots: yes; encryption at rest: yes; replication: *not modeled (unknown)* | [A] fixed vocabulary proposed in review §2.4 |
| Time window | 7 × 24 h, Monday 00:00 to Sunday 23:59 UTC, fixed 24-hour simulation days, 10,080 minute records | same | spec requirement |
| Provenance | synthetic; values chosen to exercise rules; no vendor reference | same | required field |

Why two infra profiles and not one: the implementation plan says "one infrastructure profile", but the required RAID 5/6 comparison and the "front-end headroom but backend constraint" case need two declared layouts. Keeping everything except the layout identical is the smallest change (review §2.2, proposed edit E-7).

---

## 2. Existing aggregate workload (the baseline trace shared by both infra profiles)

Mixed enterprise baseline (the business spec allows a mixed existing baseline without a consolidation planner). Logical demand is a piecewise schedule; no random jitter in V1 (see review §5, decision D-6).

| Period | When (UTC) | Existing IOPS | Read fraction | Read / write block | Notes |
|---|---|---|---|---|---|
| Quiet | Weekdays 01:00–06:00; Mon 00:00–01:00 | 20,000 | 0.70 | 16 KiB / 8 KiB | [A] |
| Morning ramp | Weekdays 06:00–08:00 | linear 20,000 → 50,000 | 0.70 | 16 / 8 | [A] |
| Business | Weekdays 08:00–18:00 | 50,000 | 0.70 | 16 / 8 | [A] |
| Burst 1 | Weekdays 10:05–10:15 (10 min) | 75,000 (step) | 0.70 | 16 / 8 | [A] deliberately straddles two ten-minute buckets |
| Burst 2 | Weekdays 14:05–14:15 (10 min) | 75,000 (step) | 0.70 | 16 / 8 | [A] |
| Evening ramp | Weekdays 18:00–20:00 | linear 50,000 → 25,000 | 0.70 | 16 / 8 | [A] |
| Evening | Weekdays 20:00–22:00 | 25,000 | 0.70 | 16 / 8 | [A] |
| Batch | Mon–Fri 22:00–24:00 and Tue–Sat 00:00–01:00 | 40,000 | 0.40 | 16 / 8 | [A] write-heavy nightly batch |
| Weekend | Sat 01:00 – Sun 24:00 | 12,000 flat (00:00–08:00, 20:00–24:00), 30,000 (08:00–20:00) | 0.70 | 16 / 8 | [A] no bursts, no batch |

Derived existing demand at the four plateau states (hit fraction 0.30). Read/write split follows the classic read-modify-write path: each logical write causes **2 backend reads + 2 backend writes** (RAID 5) or **3 + 3** (RAID 6), so the parity-related reads are counted as backend *reads*, not as part of a "write" bucket:

- backend reads = logical reads × (1 − 0.30) + logical writes × 2 (RAID 5) or × 3 (RAID 6)
- backend writes = logical writes × 2 (RAID 5) or × 3 (RAID 6)
- total = backend reads + backend writes = logical reads × 0.70 + logical writes × 4 (or × 6)

| State | IOPS | Throughput [D] | RAID 5 backend reads / writes / total [D] | RAID 6 backend reads / writes / total [D] |
|---|---|---|---|---|
| Quiet 20,000 @ 0.70 | 20,000 | 20,000 × 13.6 KiB = 266 MiB/s | 9,800 + 12,000 = 21,800 / 12,000 / **33,800** | 9,800 + 18,000 = 27,800 / 18,000 / **45,800** |
| Business 50,000 @ 0.70 | 50,000 | 664 MiB/s | 24,500 + 30,000 = 54,500 / 30,000 / **84,500** | 24,500 + 45,000 = 69,500 / 45,000 / **114,500** |
| Burst 75,000 @ 0.70 | 75,000 | 996 MiB/s | 36,750 + 45,000 = 81,750 / 45,000 / **126,750** | 36,750 + 67,500 = 104,250 / 67,500 / **171,750** |
| Batch 40,000 @ 0.40 | 40,000 | 40,000 × 11.2 KiB = 438 MiB/s | 11,200 + 48,000 = 59,200 / 48,000 / **107,200** | 11,200 + 72,000 = 83,200 / 72,000 / **155,200** |

Weighted block size: 0.7×16 + 0.3×8 = 13.6 KiB; batch 0.4×16 + 0.6×8 = 11.2 KiB.

Baseline alone never exceeds any budget on either layout (RAID 6 burst backend = 171,750 = 85.9 % of the 200,000 budget). That is intentional: the existing environment "looks fine" until the proposed workload is added.

---

## 3. Proposed workload profiles

| Attribute | WL-VM "VMware / private-cloud cluster expansion" | WL-RAG "AI retrieval-augmented generation service" | Marker |
|---|---|---|---|
| Synthetic flag | true | true | required |
| Capacity | 24 TiB | 30 TiB (corpus, chunks, embeddings, vector index) | [A] |
| Annual capacity growth | 10 % / yr | 40 % / yr | [A] RAG corpora grow faster is the illustrative story, not a measured fact |
| Read fraction | 0.70 (business), 0.50 (patch window) | 0.90 (query hours), 0.30 (ingestion) | [A] |
| Read / write block size | 16 KiB / 8 KiB | Query: 8 KiB / 8 KiB. Ingestion: 64 KiB / 64 KiB | [A] ingestion sizes deliberately exceed the 16 KiB backend block |
| Throughput | derived per minute = IOPS × weighted block | derived | [D] never an independent input |
| Latency target | 2.0 ms | 1.5 ms | [A] |
| Protection required | tolerate ≥ 1 drive failure; snapshots: required; encryption at rest: required; replication: none required | same | [A] both infra profiles satisfy; mismatch cases live in test fixtures (review D-5) |
| Replication overhead | none (no requirement) | none | bounded |
| Provenance | synthetic; shape = daytime business load plus evening patch window | synthetic; shape = daytime query load plus nightly ingestion/re-embedding | required field |

Daily / weekly schedules:

| Workload | Period | When (UTC) | IOPS | Read fraction | Blocks |
|---|---|---|---|---|---|
| WL-VM | Quiet | Weekdays 00:00–07:00, 22:00–24:00 | 4,000 | 0.70 | 16/8 |
| WL-VM | Ramp | Weekdays 07:00–08:00 | 4,000 → 15,000 | 0.70 | 16/8 |
| WL-VM | Business | Weekdays 08:00–18:00 | 15,000 | 0.70 | 16/8 |
| WL-VM | Ramp down | Weekdays 18:00–19:00 | 15,000 → 6,000 | 0.70 | 16/8 |
| WL-VM | Evening | Weekdays 19:00–20:00 | 6,000 | 0.70 | 16/8 |
| WL-VM | Patch window | Weekdays 20:00–22:00 | 12,000 | 0.50 | 16/8 |
| WL-VM | Weekend | Sat–Sun | 5,000 flat | 0.70 | 16/8 |
| WL-RAG | Query hours | Every day 08:00–20:00 | 30,000 weekdays / 12,000 weekend | 0.90 | 8/8 |
| WL-RAG | Off hours | 20:00–02:00, 05:00–08:00 | 8,000 | 0.90 | 8/8 |
| WL-RAG | Ingestion | Weekdays 02:00–05:00 | 20,000 | 0.30 | 64/64 |
| WL-RAG | Weekend nights | Sat–Sun 02:00–05:00 | 8,000 | 0.90 | 8/8 (no ingestion) |

Derived proposed demand at plateaus:

| Workload state | Throughput [D] | RAID 5 backend reads / writes / total [D] | RAID 6 backend reads / writes / total [D] |
|---|---|---|---|
| WL-VM business 15,000 @ 0.70 | 15,000 × 13.6 KiB = 199 MiB/s | 7,350 + 9,000 = 16,350 / 9,000 / **25,350** | 7,350 + 13,500 = 20,850 / 13,500 / **34,350** |
| WL-VM patch 12,000 @ 0.50 | 12,000 × 12 KiB = 141 MiB/s | 4,200 + 12,000 = 16,200 / 12,000 / 28,200 | 4,200 + 18,000 = 22,200 / 18,000 / 40,200 |
| WL-RAG query 30,000 @ 0.90 | 30,000 × 8 KiB = 234 MiB/s | 18,900 + 6,000 = 24,900 / 6,000 / 30,900 | 18,900 + 9,000 = 27,900 / 9,000 / 36,900 |
| WL-RAG ingestion 20,000 @ 0.30, 64 KiB | 20,000 × 64 KiB = 1,250 MiB/s | **not computable** (64 KiB > 16 KiB backend block) | not computable |

Spec verification example check [D]: 10,000 IOPS, 70 % reads, hit 0 → RAID 5: backend reads 7,000 + 3,000×2 = 13,000, backend writes 3,000×2 = 6,000, total 19,000; RAID 6: reads 7,000 + 3,000×3 = 16,000, writes 9,000, total 25,000. Totals match `technical-spec.md` §Backend IOPS; the spec's "calculate backend reads and writes separately" requirement must use this split (tests R-BE-1).

Combined burst breakdown for the showcase case (WL-VM on INF-B): backend reads 104,250 + 20,850 = 125,100; backend writes 67,500 + 13,500 = 81,000; total **206,100**.

---

## 4. Backend block-size mapping rule (proposed, needs decision D-1)

For each minute record, the classic model applies only if **both** the applicable read block size and write block size are ≤ the infrastructure's modeled backend block (16 KiB). Then one logical read = one backend read (× (1 − hit fraction)) and one logical write = one write-factor group of backend operations.

If either size exceeds the backend block, the backend estimate for that minute is **unknown** (reason: "IO size exceeds the modeled backend block; classic read-modify-write factor does not apply; full-stripe or multi-block behavior is out of V1 scope"). The backend sub-check then resolves with precedence constraint > unknown > ready: if any *computable* minute exceeds the budget it is a constraint; otherwise if any minute is unknown it is needs investigation; otherwise ready.

Alternative (not recommended for V1): scale as ceil(size / backend block) blocks per logical operation, each with the full factor, labeled as an upper bound. This overestimates heavily for large writes (a 64 KiB RAID 5 write would count 16 backend operations) and risks exactly the "silently apply 4/6 to arbitrary sizes" problem DECISIONS warns about.

---

## 5. Expected assessment matrix [D]

Budget denominators: percentages below are **% of operating budget** (review D-3). Horizon for the growth dimension is 1 year by default (review D-4). Latency post-addition is always needs investigation in V1.

| Dimension | WL-VM on INF-A (RAID 5) | WL-VM on INF-B (RAID 6) | WL-RAG on INF-A (RAID 5) | WL-RAG on INF-B (RAID 6) |
|---|---|---|---|---|
| Capacity (max used + proposed vs budget) | 124.27 / 160 TiB = 77.7 % → **ready** | 124.27 / 144 = 86.3 % → **ready** | 130.27 / 160 = 81.4 % → **ready** | 130.27 / 144 = 90.5 % → **ready** |
| IOPS front-end (peak aligned minute) | 75,000 + 15,000 = 90,000 / 120,000 = 75 % → **ready** | same → **ready** | 75,000 + 30,000 = 105,000 / 120,000 = 87.5 % → **ready** | same → **ready** |
| IOPS backend (peak aligned minute) | 126,750 + 25,350 = 152,100 / 200,000 = 76 % → **ready** | 171,750 + 34,350 = **206,100 / 200,000 = 103 %** → **constraint**; 100 exceedance minutes/week (0.99 % of time), longest run 10 min, recurs 10×; weekly mean/P90/P95 all below budget (P95 ≈ 148,850) | ingestion minutes not computable → **needs investigation**; computable minutes peak 126,750 + 30,900 = 157,650 = 78.8 % | same → **needs investigation**; computable peak 171,750 + 36,900 = 208,650 = 104.3 % → **constraint** (constraint precedence over unknown) |
| Throughput (peak aligned minute) | 996 + 199 = 1,195 / 2,400 MiB/s = 49.8 % → **ready** | same → **ready** | 266 + 1,250 = 1,516 / 2,400 = 63.2 % (ingestion vs quiet) → **ready** | same → **ready** |
| Latency | baseline P95 1.2 ms < 2.0 ms target: no baseline concern; post-addition → **needs investigation** | same | baseline P95 1.2 ms < 1.5 ms; → **needs investigation** | same |
| Protection | all required capabilities present → **ready** | **ready** | **ready** | **ready** |
| Growth headroom (1 yr) | 100.27×1.15 + 24×1.10 = 115.31 + 26.40 = 141.71 / 160 = 88.6 % → **ready** | 141.71 / 144 = 98.4 % → **ready** | 115.31 + 30×1.40 = 157.31 / 160 = 98.3 % → **ready** | 157.31 / 144 = 109.2 % → **constraint** |
| Growth headroom (3 yr what-if) | 152.49 + 31.94 = 184.43 / 160 → **constraint** | 184.43 / 144 → **constraint** | 152.49 + 82.32 = 234.81 / 160 → **constraint** | **constraint** |
| **Overall (baseline what-if 1×, 1 yr)** | **needs investigation** (latency only) | **modeled constraint** (backend IOPS) | **needs investigation** (latency, backend block size) | **modeled constraint** (growth; backend) |
| Demand what-if 1.5× | FE 97,500; BE RAID 5 164,775 → unchanged | BE 223,275 → still constraint | FE 75,000 + 45,000 = **120,000 = budget → ready (equality is within budget)** | unchanged |
| Demand what-if 2× | FE 105,000; BE 177,450 → unchanged | unchanged | FE 75,000 + 60,000 = **135,000 > 120,000 → front-end constraint** | front-end constraint |

Story the matrix tells in a five-minute walkthrough:

1. WL-VM on INF-A: everything arithmetic is ready, yet the overall result is *needs investigation* because post-addition latency cannot be established. This is the "case requiring investigation" the business spec requires.
2. WL-VM on INF-B: identical logical demand, identical front-end headroom (75 % of budget), but the RAID 6 write factor pushes the backend 3 % over budget during two ten-minute bursts a day. Weekly mean, P90 and P95 all look fine; only the minute maxima, exceedance minutes and per-bucket maxima expose it. This is the required "front-end headroom but backend constraint" case and the aggregation-cannot-hide-constraints demonstration (each burst straddles two ten-minute buckets, so no ten-minute **mean** exceeds the budget: 5 min × 206,100 + 5 min × 148,850 → 177,475).
3. WL-RAG: the backend model honestly refuses to estimate 64 KiB ingestion writes; growth headroom is the real constraint on the smaller RAID 6 usable capacity; the 2× demand what-if flips front-end IOPS to a constraint.

Ten-minute bucket arithmetic for the hidden-burst test: business-hour RAID 6 combined = 114,500 + 34,350 = 148,850; burst = 206,100; bucket 10:00–10:10 mean = (5 × 148,850 + 5 × 206,100) / 10 = 177,475 < 200,000 while bucket max = 206,100 and minutes-above-budget = 5.

---

## 6. Things Chuck should sanity-check specifically

- Is a 30 % read-cache hit fraction a reasonable single educational value, or should the workload (not the array) declare it? (review D-2)
- Are 16 KiB backend block, 8/16 KiB logical blocks and 64 KiB ingestion plausible enough as teaching values?
- Is the 150,000 IOPS / 3,000 MiB/s / 250,000 backend-ops midrange all-flash envelope believable as "vendor-neutral midrange", or should the numbers be scaled up/down together?
- Are 15 % / 10 % / 40 % annual growth and the 24 / 30 TiB additions plausible?
- Are 2.0 ms and 1.5 ms latency targets plausible for the two workloads?
- Is a stylized (no-jitter) trace acceptable for V1? (review D-6)
