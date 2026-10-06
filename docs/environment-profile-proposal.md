# AI Storage Workload Advisor
## Environment profile proposal — draft 0.1 (for Chuck's review; not yet applied)

Prepared by Devin, October 6, 2026, between M1 and M2. This proposes a physically coherent **fictional** storage environment to anchor the synthetic profiles. Nothing here has been applied to `data/profiles/*.json`, the golden fixtures, or the specifications; §6 shows what would change if Chuck accepts it.

Label carried by all profiles: *Synthetic data. Educational demonstration; not vendor sizing or production configuration guidance.*

Markers as in `synthetic-profile-proposal.md`: **[S]** sourced fact, **[D]** derived arithmetic, **[A]** synthetic assumption. Nothing in this document is a vendor benchmark; the only sourced facts in the project remain the RAID read-modify-write arithmetic (docs/research.md).

---

## 1. Architecture (common to both variants) [A]

| Element | Proposed value | Notes |
|---|---|---|
| Array class | Vendor-neutral midrange all-flash block array, dual controller, active-active, single 48-slot 2U NVMe enclosure | fictional; no vendor implied |
| Media | NVMe TLC SSD, 7.68 TB nominal (manufacturer-style decimal) | endurance, over-provisioning internals and flash write amplification not modeled |
| Drive nominal capacity | 7.68 TB = 7,680,000,000,000 bytes = **6.985 TiB** [D] | decimal-to-binary conversion shown in §4 |
| Controllers | 2, each with mirrored write-back cache (NVRAM-protected) | cache size not an input to any rule; destage modeled as 1:1 with no coalescing |
| Host connectivity | 2 controllers × 4 × 32 Gb/s Fibre Channel = 8 host ports; hosts dual-pathed across both controllers | port count is descriptive only; see §5 |
| Management / replication ports | 2 × 25 GbE per controller | replication not modeled in V1 |
| Attached hosts (existing baseline) | 16 virtualization hosts, dual-pathed | descriptive; per-host path limits are explicitly out of scope ("aggregate checks cannot establish that host paths… have no bottlenecks", business spec) |

## 2. Protection variants [A]

The two variants populate the same enclosure differently. They are **not** identical hardware; they share the controller pair, enclosure, media type and front-end limits, and differ in drive count, RAID layout, usable capacity, tolerated failures and (recommended) backend limit.

| Attribute | Variant A — RAID 5 (8+1) | Variant B — RAID 6 (8+2) |
|---|---|---|
| RAID groups | 5 groups × (8 data + 1 parity) = 45 drives | 4 groups × (8 data + 2 parity) = 40 drives |
| Global hot spares | 2 | 2 |
| Populated drives | **47** (1 empty slot) | **42** (6 empty slots) |
| Data drives | 40 | 32 |
| Parity drives | 5 | 8 |
| Tolerated drive failures per group | 1 | 2 |
| Rebuild / degraded behavior | not modeled | not modeled |

Why different drive counts: forcing equal drive counts onto 9-wide and 10-wide groups leaves orphan drives in one layout. Declaring the real populated count per variant is more honest than pretending to "the same 48 drives". The comparison the tool makes is still coherent: the *proposed-only* backend overhead comparison (e.g., 25,350 vs 34,350 ops/s for the VM burst sample) isolates the layout factor alone, while the readiness comparison reflects each variant as it would actually be built.

## 3. Spare, metadata and reserve assumptions [A]

| Item | Assumption | Effect on arithmetic |
|---|---|---|
| Hot spares | 2 global spares per variant, outside all RAID groups | excluded from raw-to-usable; shown in the raw figure |
| Parity | per layout | 1/9 of group capacity (A), 2/10 (B) |
| System metadata and controller reserve | **5 % of post-parity data capacity** (metadata, snapshot reserve pool, garbage-collection headroom) | subtracted before declaring usable |
| Compression / deduplication | not modeled; usable is declared without data reduction | states the assumption; no effective-capacity ratio is applied |
| Rounding | declared usable rounded **down** to whole TiB | keeps the JSON value conservative and readable |

## 4. Raw-to-usable arithmetic and operating budget [D]

Conversion: 1 TiB = 2^40 bytes = 1,099,511,627,776 bytes. 7.68 TB ÷ 1.099511627776 TB/TiB = 6.98492 TiB per drive.

| Step | Variant A (RAID 5) | Variant B (RAID 6) |
|---|---|---|
| Raw, manufacturer decimal | 47 × 7.68 TB = **360.96 TB** | 42 × 7.68 TB = **322.56 TB** |
| Raw, binary | 47 × 6.98492 = **328.29 TiB** | 42 × 6.98492 = **293.37 TiB** |
| − spares (2 drives) | 13.97 TiB | 13.97 TiB |
| − parity (5 / 8 drives) | 34.92 TiB | 55.88 TiB |
| = post-parity data capacity (40 / 32 drives) | 279.40 TiB | 223.52 TiB |
| − 5 % metadata/reserve | 13.97 TiB | 11.18 TiB |
| = usable (exact) | 265.43 TiB | 212.34 TiB |
| **Declared usable (rounded down)** | **265 TiB** = 291,370,581,360,640 bytes | **212 TiB** = 233,096,465,088,512 bytes |
| **80 % operating budget** | **212.0 TiB** | **169.6 TiB** |
| Usable ÷ raw (binary) | 80.7 % | 72.3 % |

Decimal-vs-binary note for the UI and docs: a "7.68 TB" drive is 6.985 TiB; the array's "360.96 TB raw" is 328.29 TiB. The model's canonical unit is bytes; display uses TiB. Any profile field that quotes a manufacturer-style figure must carry the unit `TB (decimal)` so it is never compared with a TiB value.

### Existing used capacity

Proposed **120 TiB** at trace start (45.3 % of A's usable, 56.6 % of B's), replacing 100 TiB. Rationale: the smaller usable figures on the old 225 TiB fiction (200/180 TiB) made 100 TiB a 50–56 % fill; 120 TiB keeps a similar fill against the new, larger usable capacities and — as §6 shows — preserves the readiness story (VM ready at 1 year on both variants, RAG growth constraint at 1 year only on B, everything constrained at 3 years). Existing growth stays 15 %/yr. With the M2 trace this becomes ≈120.32 TiB at week end [D: 120 × 1.15^(7/365.25)].

## 5. Performance limits — declared separately, not derived [A]

The performance limits are **declared synthetic sustained figures** for the controller pair and drive set under a mixed random workload. They are deliberately *not* computed as drive count × per-drive IOPS, and port count × line rate is *not* used as a throughput limit; both of those derivations are explicitly rejected by the business spec ("raw capacity or drive count alone cannot establish performance capability").

| Limit | Variant A | Variant B | Basis |
|---|---|---|---|
| Sustainable front-end IOPS | 150,000 | 150,000 | [A] controller-bound; same controller pair → same declared figure |
| Front-end IOPS budget (80 %) | 120,000 | 120,000 | [D] |
| Sustainable throughput | 3,000 MiB/s | 3,000 MiB/s | [A] controller-bound sustained mixed-workload figure |
| Throughput budget | 2,400 MiB/s | 2,400 MiB/s | [D] |
| Host connectivity | 8 × 32 Gb/s FC | 8 × 32 Gb/s FC | descriptive; aggregate nominal line rate is far above the declared throughput limit, so connectivity is *not* the modeled constraint and is not used in any rule |
| Backend sustainable operations (16 KiB) | **250,000 ops/s** (45 group drives) | **222,000 ops/s** (40 group drives) — recommended; alternative: keep 250,000 | [A] see below |
| Backend budget | 200,000 | 177,600 (alt. 200,000) | [D] |
| Modeled backend block | 16 KiB | 16 KiB | unchanged |
| Read-cache hit fraction | 0.30 | 0.30 | unchanged simplification |
| Write policy | write-back, 1:1 destage, no coalescing | same | unchanged |

Backend limit for Variant B: with 40 group drives instead of 45, keeping 250,000 would be incoherent with the physical story. The recommended 222,000 is 250,000 scaled by 40/45 and rounded — a *declared* figure that is proportional to the drive set but still not "drive IOPS × count" (no per-drive IOPS is declared anywhere). Chuck may prefer the alternative (equal 250,000) if he wants the readiness comparison to isolate the layout factor alone; the proposed-only overhead comparison already does that in both options.

Baseline latency (0.6/0.9/1.4/1.2/0.7 ms by period; weekly P95 1.2 ms, max 1.4 ms) is unchanged.

## 6. Impact analysis — what changes in the M1 per-sample assessments [D]

Workloads unchanged: WL-VM 24 TiB, 10 %/yr; WL-RAG 30 TiB, 40 %/yr. Percentages are % of operating budget.

### Capacity and growth

| Check | Combination | M1 today (used 100; usable 200/180) | Proposed (used 120; usable 265/212) | Status change |
|---|---|---|---|---|
| Capacity | VM on A | 124 / 160 = 77.5 % ready | 144 / 212 = 67.9 % ready | none |
| Capacity | VM on B | 124 / 144 = 86.1 % ready | 144 / 169.6 = 84.9 % ready | none |
| Capacity | RAG on A | 130 / 160 = 81.3 % ready | 150 / 212 = 70.8 % ready | none |
| Capacity | RAG on B | 130 / 144 = 90.3 % ready | 150 / 169.6 = 88.4 % ready | none |
| Growth 1 yr | VM on A | 141.4 / 160 = 88.4 % ready | 138 + 26.4 = 164.4 / 212 = 77.5 % ready | none |
| Growth 1 yr | VM on B | 141.4 / 144 = 98.2 % ready | 164.4 / 169.6 = 96.9 % ready | none |
| Growth 1 yr | RAG on A | 157 / 160 = 98.1 % ready | 138 + 42 = 180 / 212 = 84.9 % ready | none |
| Growth 1 yr | RAG on B | 157 / 144 = 109.0 % **constraint** | 180 / 169.6 = 106.1 % **constraint** | none |
| Growth 3 yr | VM on A | 184.0 / 160 constraint | 182.5 + 31.9 = 214.4 / 212 = 101.2 % **constraint** (narrow) | none |
| Growth 3 yr | VM on B | constraint | 214.4 / 169.6 = 126.4 % constraint | none |
| Growth 3 yr | RAG on A / B | constraint | 182.5 + 82.3 = 264.8 → constraint both | none |
| Growth 0 yr | all | equals capacity | equals capacity | none |

Every capacity/growth status is preserved. The 3-year VM-on-A case becomes a narrow constraint (101 %), which is a useful teaching point: a small change in growth assumptions would flip it, and the finding should say so.

### Backend IOPS (only if Variant B's limit is scaled to 222,000)

| Sample on Variant B | Combined backend ops | Today (budget 200,000) | Proposed (budget 177,600) | Status change |
|---|---|---|---|---|
| vm-weekday-quiet | 54,960 | 27.5 % | 30.9 % | none |
| vm-weekday-business | 148,850 | 74.4 % | 83.8 % | none |
| vm-weekday-burst | 206,100 | 103.1 % constraint, headroom −6,100 | **116.0 % constraint, headroom −28,500** | none (stronger) |
| vm-weekday-patch | 97,450 | 48.7 % | 54.9 % | none |
| vm-weekday-batch | 164,360 | 82.2 % | 92.5 % | none |
| rag-weekday-business-query | 151,400 | 75.7 % | 85.2 % | none |
| rag-weekday-burst-query | 208,650 | 104.3 % constraint | 117.5 % constraint | none |
| rag-weekday-batch-offhours | 165,040 | 82.5 % | 92.9 % | none |
| existing baseline alone, burst | 171,750 | 85.9 % | 96.7 % (still within budget) | none |

Variant A backend, all front-end IOPS and throughput checks are unchanged. The "front-end headroom (75 %) but backend constraint" demonstration is preserved in both backend-limit options; the scaled option makes the exceedance larger and the batch windows tighter (≈93 %), which is realistic for a smaller RAID 6 drive set but leaves less visual slack in the M2 weekly chart. If Chuck wants the demonstration to hinge on the layout factor alone, choose the equal-limit alternative.

### Overall statuses

Unchanged in every combination: INF-A samples → needs investigation (latency); INF-B vm-burst, rag-burst → modeled constraint (backend); all INF-B RAG samples → modeled constraint (growth at 1 year); INF-B vm-quiet/business/patch/batch → needs investigation.

## 7. Profile field additions (proposed, for M2 fixtures once approved)

Add a descriptive `environment` block to each infrastructure profile so the physical story is visible in the UI and exports — none of these fields participates in any rule:

```
"environment": {
  "architecture": "vendor-neutral midrange all-flash, dual controller, 48-slot NVMe enclosure",
  "driveCount": 47, "spareDrives": 2, "groupCount": 5, "groupWidth": "8+1",
  "driveNominalTB_decimal": 7.68, "driveNominalBytes": 7680000000000,
  "rawBytes": <47 × 7.68e12>, "metadataReserveFraction": 0.05,
  "hostPorts": "8 × 32 Gb/s FC (4 per controller)",
  "note": "Performance limits are declared synthetic sustained figures; not derived from drive count or port line rate."
}
```

Validation should assert internal coherence of the descriptive block (declared usable ≤ (driveCount − spares − parityDrives) × driveNominalBytes × (1 − reserve)) so a future edit cannot quietly declare more usable capacity than the fiction allows.

## 8. Decisions for Chuck

| ID | Decision | Recommendation |
|---|---|---|
| ENV-1 | Accept the drive/enclosure fiction (7.68 TB NVMe, 47 vs 42 populated drives, 5 % reserve, 2 spares) | accept |
| ENV-2 | Declared usable 265 / 212 TiB and used 120 TiB | accept |
| ENV-3 | Variant B backend limit: scaled 222,000 (physically coherent) vs equal 250,000 (isolates layout factor) | **scaled 222,000** |
| ENV-4 | Keep front-end limits 150,000 IOPS / 3,000 MiB/s for both variants (controller-bound) | accept |
| ENV-5 | Add the descriptive `environment` block and coherence validation in M2 | accept |

Once decided, M2 applies the values to `data/profiles`, regenerates the M1 golden fixtures (expected diffs are exactly the rows in §6), and updates `synthetic-profile-proposal.md` §1 to reference this document.
