# M1 golden per-sample assessments

Generated: 2026-10-07T15:50:39.089Z
Ruleset: 1.0.0-m1   Commit: uncommitted (M1 pre-review)
Label: Synthetic data. Educational demonstration; not vendor sizing or production configuration guidance.

Each block is `renderAssessmentText` output of `assessSample` for one aligned demand sample.

## INF-A × WL-VM

### vm-weekday-quiet

```
Synthetic data. Educational demonstration; not vendor sizing or production configuration guidance.
Overall: needs-investigation
Ruleset: 1.0.0-m1   Budget fraction: 0.8
Infrastructure: INF-A   Workload: WL-VM   Sample: vm-weekday-quiet
Options: demand multiplier 1x, horizon 1 year(s)
Dimension capacity: modeled-ready
  Check capacity: modeled-ready
    headroom: 68 TiB
    % of operating budget: 67.9%   % of limit: 54.3%
    Finding R-CAP-1: Combined used plus proposed capacity is within the capacity operating budget.
      evidence:
        - existing used capacity: 131941395333120 bytes (basis: aligned demand sample)
        - proposed workload capacity: 26388279066624 bytes (basis: synthetic workload profile)
        - capacity operating budget: 233096465088512 bytes (basis: 0.8 × usable capacity)
        - usable capacity limit: 291370581360640 bytes (basis: synthetic infrastructure profile)
      calculation: 120 TiB used + 24 TiB proposed = 144 TiB combined vs 212 TiB budget (0.8 × 265 TiB usable); headroom 68 TiB.
      implication: Modeled capacity headroom exists for the proposed workload at the declared synthetic values.
      next investigation: Confirm real usable capacity and current consumption before relying on this result.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not measured on a real array.
      assumptions:
        - Usable capacity excludes spares and metadata reserves.
Dimension iops: modeled-ready
  Check iops.frontend: modeled-ready
    headroom: 96000 IOPS
    % of operating budget: 20.0%   % of limit: 16.0%
    Finding R-FE-1: Combined front-end IOPS demand is within the front-end operating budget.
      evidence:
        - existing front-end IOPS: 20000 IOPS (basis: aligned demand sample (reads + writes))
        - proposed front-end IOPS: 4000 IOPS (basis: aligned demand sample (reads + writes))
        - front-end IOPS operating budget: 120000 IOPS (basis: 0.8 × sustainable front-end IOPS limit)
        - sustainable front-end IOPS limit: 150000 IOPS (basis: synthetic infrastructure profile)
      calculation: 20000 existing + 4000 proposed = 24000 IOPS vs 120000 budget; headroom 96000 IOPS.
      implication: Front-end logical IOPS headroom exists for the proposed workload.
      next investigation: Confirm the declared sustainable IOPS envelope and the aligned demand peak on a real source.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not measured on a real array.
      assumptions:
        - Existing and proposed demand are aligned to the same modeled interval.
  Check iops.backend: modeled-ready
    headroom: 159440 ops/s
    % of operating budget: 20.3%   % of limit: 16.2%
    Finding R-BE-1: Combined backend operation demand is within the backend operating budget.
      evidence:
        - existing backend reads: 21800 ops/s (basis: derived from existing logical demand)
        - existing backend writes: 12000 ops/s (basis: derived from existing logical demand)
        - background backend demand: 0 ops/s (basis: declared on the demand sample; added exactly once)
        - proposed backend reads: 4360 ops/s (basis: derived: proposed reads × (1 − hit) + writes × factor)
        - proposed backend writes: 2400 ops/s (basis: derived: proposed writes × factor)
        - backend operating budget: 200000 ops/s (basis: 0.8 × backend sustainable operation limit)
        - backend sustainable operation limit: 250000 ops/s (basis: synthetic infrastructure profile)
      calculation: existing 33800 ops/s + background 0 + proposed 6760 ops/s (reads 4360 + writes 2400; RAID 5 factor 2+2 per logical write) = 40560 ops/s vs 200000 ops/s budget; headroom 159440 ops/s.
      implication: Modeled backend load is within budget under the RAID 5 read-modify-write factor.
      next investigation: Validate cache-hit fraction and write policy on the real system before relying on the estimate.
      confidence: high — Arithmetic on complete declared inputs within the explicitly bounded model; not a physical-array simulation.
      assumptions:
        - RAID 5 classic read-modify-write: each logical write costs 2 backend reads + 2 backend writes.
        - Write-back cache with no coalescing; sustained writes are not treated as zero.
        - Full-stripe writes, erasure coding, compression/dedup, metadata IO, flash write amplification, replication overhead, and rebuild load are outside this calculation.
Dimension throughput: modeled-ready
  Check throughput: modeled-ready
    headroom: 2081.25 MiB/s
    % of operating budget: 13.3%   % of limit: 10.6%
    Finding R-THR-1: Combined throughput demand is within the throughput operating budget.
      evidence:
        - existing throughput: 278528000 bytes/second (basis: derived: existing IOPS × block sizes)
        - proposed throughput: 55705600 bytes/second (basis: derived: proposed IOPS × block sizes)
        - throughput operating budget: 2516582400 bytes/second (basis: 0.8 × sustainable throughput limit)
        - sustainable throughput limit: 3145728000 bytes/second (basis: synthetic infrastructure profile)
      calculation: existing 265.63 MiB/s (272000 KiB/s) + proposed 53.13 MiB/s = 318.75 MiB/s vs 2400 MiB/s budget; headroom 2081.25 MiB/s.
      implication: Modeled sustained bandwidth headroom exists for the proposed workload.
      next investigation: Verify sustained throughput limits and the read/write block-size mix; derived throughput depends on both.
      confidence: high — Derived directly from declared IOPS and block sizes; synthetic values, not a measured limit.
      assumptions:
        - Throughput is derived from IOPS × block size, never an independent input.
Dimension latency: needs-investigation
  Check latency: needs-investigation
    headroom: n/a
    % of operating budget: n/a   % of limit: n/a
    Finding R-LAT-1: Baseline P95 latency 1.2 ms is at or below the workload target 2 ms; post-addition latency unknown: no response curve in V1.
      evidence:
        - baseline P95 latency: 1.2 ms (basis: aligned demand sample (screening indicator))
        - baseline maximum latency: 1.4 ms (basis: aligned demand sample)
        - workload latency target: 2 ms (basis: synthetic workload profile)
      calculation: baseline P95 1.2 ms vs target 2 ms; baseline max 1.4 ms shown alongside.
      implication: No baseline latency concern is indicated, but this says nothing about latency after the proposed workload is added.
      next investigation: Establish post-addition latency with a response model or measurements; V1 cannot.
      confidence: insufficient — Post-addition latency is an unknown in V1 by design.
      assumptions:
        - Baseline P95 is a screening indicator only; the maximum is shown alongside.
        - Post-addition latency unknown: no response curve in V1.
    Finding R-LAT-1: Baseline maximum latency is reported alongside P95 as context.
      evidence:
        - baseline maximum latency: 1.4 ms (basis: aligned demand sample)
        - workload latency target: 2 ms (basis: synthetic workload profile)
      calculation: baseline max 1.4 ms vs target 2 ms; the max is context, not the screening statistic.
      implication: Single-interval maxima can exceed the target even when P95 does not; both are baseline evidence only.
      next investigation: Review the distribution of minute latencies in the M2 weekly statistics.
      confidence: high — Reported value from supplied evidence; no inference made.
      assumptions:
        - Latency evidence is synthetic baseline data for the existing environment only.
Dimension protection: modeled-ready
  Check protection: modeled-ready
    headroom: n/a
    % of operating budget: n/a   % of limit: n/a
    Finding R-PRO-1: All declared workload protection requirements are satisfied by the infrastructure capabilities.
      evidence:
        - minimum tolerated drive failures required: 1 count (basis: workload protection requirement)
        - tolerated drive failures: 1 count (basis: synthetic infrastructure profile)
        - snapshots required: true flag (basis: workload protection requirement)
        - snapshots capability: true flag (basis: synthetic infrastructure profile)
        - encryptionAtRest required: true flag (basis: workload protection requirement)
        - encryptionAtRest capability: true flag (basis: synthetic infrastructure profile)
        - replication required: none mode (basis: workload protection requirement)
        - replication capability: unknown mode (basis: synthetic infrastructure profile; missing: replication capability not modeled)
      calculation: Capability matching over the fixed V1 vocabulary: toleratedDriveFailures: required 1 vs available 1 → modeled-ready; snapshots: required true vs available true → modeled-ready; encryptionAtRest: required true vs available true → modeled-ready; replication: required none vs available unknown → modeled-ready.
      implication: Declared protection capabilities meet the workload requirements within the V1 vocabulary.
      next investigation: Confirm capabilities on the real array; vocabulary coverage is selected capabilities only.
      confidence: moderate — Declared capability matching only; not a complete availability assurance.
      assumptions:
        - The V1 capability vocabulary covers selected capabilities, not complete availability assurance.
        - Replication is not equated with backup; availability is not inferred from a single feature.
Dimension growth: modeled-ready
  Check growth: modeled-ready
    headroom: 47.6 TiB
    % of operating budget: 77.5%   % of limit: 62.0%
    Finding R-GRO-1: Projected capacity at the 1-year horizon is within the capacity operating budget.
      evidence:
        - existing used capacity: 131941395333120 bytes (basis: aligned demand sample)
        - existing annual growth fraction: 0.15 fraction (basis: synthetic infrastructure profile)
        - proposed workload capacity: 26388279066624 bytes (basis: synthetic workload profile)
        - proposed annual growth fraction: 0.1 fraction (basis: synthetic workload profile)
        - planning horizon: 1 years (basis: assessment option)
        - capacity operating budget: 233096465088512 bytes (basis: 0.8 × usable capacity)
      calculation: projected = 120 TiB × (1 + 0.15)^1 + 24 TiB × (1 + 0.1)^1 = 164.4 TiB vs 212 TiB budget; headroom 47.6 TiB.
      implication: The modeled environment retains capacity headroom at the 1-year planning horizon.
      next investigation: Validate the declared growth fractions against observed consumption trends; compound growth dominates at longer horizons.
      confidence: high — Deterministic compound-growth arithmetic on declared synthetic inputs; growth rates themselves are assumptions.
      assumptions:
        - Annual growth fractions are synthetic assumptions, not observed trends.
        - Horizon is 1 year(s); horizon 0 equals the current-capacity check.
```

### vm-weekday-business

```
Synthetic data. Educational demonstration; not vendor sizing or production configuration guidance.
Overall: needs-investigation
Ruleset: 1.0.0-m1   Budget fraction: 0.8
Infrastructure: INF-A   Workload: WL-VM   Sample: vm-weekday-business
Options: demand multiplier 1x, horizon 1 year(s)
Dimension capacity: modeled-ready
  Check capacity: modeled-ready
    headroom: 68 TiB
    % of operating budget: 67.9%   % of limit: 54.3%
    Finding R-CAP-1: Combined used plus proposed capacity is within the capacity operating budget.
      evidence:
        - existing used capacity: 131941395333120 bytes (basis: aligned demand sample)
        - proposed workload capacity: 26388279066624 bytes (basis: synthetic workload profile)
        - capacity operating budget: 233096465088512 bytes (basis: 0.8 × usable capacity)
        - usable capacity limit: 291370581360640 bytes (basis: synthetic infrastructure profile)
      calculation: 120 TiB used + 24 TiB proposed = 144 TiB combined vs 212 TiB budget (0.8 × 265 TiB usable); headroom 68 TiB.
      implication: Modeled capacity headroom exists for the proposed workload at the declared synthetic values.
      next investigation: Confirm real usable capacity and current consumption before relying on this result.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not measured on a real array.
      assumptions:
        - Usable capacity excludes spares and metadata reserves.
Dimension iops: modeled-ready
  Check iops.frontend: modeled-ready
    headroom: 55000 IOPS
    % of operating budget: 54.2%   % of limit: 43.3%
    Finding R-FE-1: Combined front-end IOPS demand is within the front-end operating budget.
      evidence:
        - existing front-end IOPS: 50000 IOPS (basis: aligned demand sample (reads + writes))
        - proposed front-end IOPS: 15000 IOPS (basis: aligned demand sample (reads + writes))
        - front-end IOPS operating budget: 120000 IOPS (basis: 0.8 × sustainable front-end IOPS limit)
        - sustainable front-end IOPS limit: 150000 IOPS (basis: synthetic infrastructure profile)
      calculation: 50000 existing + 15000 proposed = 65000 IOPS vs 120000 budget; headroom 55000 IOPS.
      implication: Front-end logical IOPS headroom exists for the proposed workload.
      next investigation: Confirm the declared sustainable IOPS envelope and the aligned demand peak on a real source.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not measured on a real array.
      assumptions:
        - Existing and proposed demand are aligned to the same modeled interval.
  Check iops.backend: modeled-ready
    headroom: 90150 ops/s
    % of operating budget: 54.9%   % of limit: 43.9%
    Finding R-BE-1: Combined backend operation demand is within the backend operating budget.
      evidence:
        - existing backend reads: 54500 ops/s (basis: derived from existing logical demand)
        - existing backend writes: 30000 ops/s (basis: derived from existing logical demand)
        - background backend demand: 0 ops/s (basis: declared on the demand sample; added exactly once)
        - proposed backend reads: 16350 ops/s (basis: derived: proposed reads × (1 − hit) + writes × factor)
        - proposed backend writes: 9000 ops/s (basis: derived: proposed writes × factor)
        - backend operating budget: 200000 ops/s (basis: 0.8 × backend sustainable operation limit)
        - backend sustainable operation limit: 250000 ops/s (basis: synthetic infrastructure profile)
      calculation: existing 84500 ops/s + background 0 + proposed 25350 ops/s (reads 16350 + writes 9000; RAID 5 factor 2+2 per logical write) = 109850 ops/s vs 200000 ops/s budget; headroom 90150 ops/s.
      implication: Modeled backend load is within budget under the RAID 5 read-modify-write factor.
      next investigation: Validate cache-hit fraction and write policy on the real system before relying on the estimate.
      confidence: high — Arithmetic on complete declared inputs within the explicitly bounded model; not a physical-array simulation.
      assumptions:
        - RAID 5 classic read-modify-write: each logical write costs 2 backend reads + 2 backend writes.
        - Write-back cache with no coalescing; sustained writes are not treated as zero.
        - Full-stripe writes, erasure coding, compression/dedup, metadata IO, flash write amplification, replication overhead, and rebuild load are outside this calculation.
Dimension throughput: modeled-ready
  Check throughput: modeled-ready
    headroom: 1536.72 MiB/s
    % of operating budget: 36.0%   % of limit: 28.8%
    Finding R-THR-1: Combined throughput demand is within the throughput operating budget.
      evidence:
        - existing throughput: 696320000 bytes/second (basis: derived: existing IOPS × block sizes)
        - proposed throughput: 208896000 bytes/second (basis: derived: proposed IOPS × block sizes)
        - throughput operating budget: 2516582400 bytes/second (basis: 0.8 × sustainable throughput limit)
        - sustainable throughput limit: 3145728000 bytes/second (basis: synthetic infrastructure profile)
      calculation: existing 664.06 MiB/s (680000 KiB/s) + proposed 199.22 MiB/s = 863.28 MiB/s vs 2400 MiB/s budget; headroom 1536.72 MiB/s.
      implication: Modeled sustained bandwidth headroom exists for the proposed workload.
      next investigation: Verify sustained throughput limits and the read/write block-size mix; derived throughput depends on both.
      confidence: high — Derived directly from declared IOPS and block sizes; synthetic values, not a measured limit.
      assumptions:
        - Throughput is derived from IOPS × block size, never an independent input.
Dimension latency: needs-investigation
  Check latency: needs-investigation
    headroom: n/a
    % of operating budget: n/a   % of limit: n/a
    Finding R-LAT-1: Baseline P95 latency 1.2 ms is at or below the workload target 2 ms; post-addition latency unknown: no response curve in V1.
      evidence:
        - baseline P95 latency: 1.2 ms (basis: aligned demand sample (screening indicator))
        - baseline maximum latency: 1.4 ms (basis: aligned demand sample)
        - workload latency target: 2 ms (basis: synthetic workload profile)
      calculation: baseline P95 1.2 ms vs target 2 ms; baseline max 1.4 ms shown alongside.
      implication: No baseline latency concern is indicated, but this says nothing about latency after the proposed workload is added.
      next investigation: Establish post-addition latency with a response model or measurements; V1 cannot.
      confidence: insufficient — Post-addition latency is an unknown in V1 by design.
      assumptions:
        - Baseline P95 is a screening indicator only; the maximum is shown alongside.
        - Post-addition latency unknown: no response curve in V1.
    Finding R-LAT-1: Baseline maximum latency is reported alongside P95 as context.
      evidence:
        - baseline maximum latency: 1.4 ms (basis: aligned demand sample)
        - workload latency target: 2 ms (basis: synthetic workload profile)
      calculation: baseline max 1.4 ms vs target 2 ms; the max is context, not the screening statistic.
      implication: Single-interval maxima can exceed the target even when P95 does not; both are baseline evidence only.
      next investigation: Review the distribution of minute latencies in the M2 weekly statistics.
      confidence: high — Reported value from supplied evidence; no inference made.
      assumptions:
        - Latency evidence is synthetic baseline data for the existing environment only.
Dimension protection: modeled-ready
  Check protection: modeled-ready
    headroom: n/a
    % of operating budget: n/a   % of limit: n/a
    Finding R-PRO-1: All declared workload protection requirements are satisfied by the infrastructure capabilities.
      evidence:
        - minimum tolerated drive failures required: 1 count (basis: workload protection requirement)
        - tolerated drive failures: 1 count (basis: synthetic infrastructure profile)
        - snapshots required: true flag (basis: workload protection requirement)
        - snapshots capability: true flag (basis: synthetic infrastructure profile)
        - encryptionAtRest required: true flag (basis: workload protection requirement)
        - encryptionAtRest capability: true flag (basis: synthetic infrastructure profile)
        - replication required: none mode (basis: workload protection requirement)
        - replication capability: unknown mode (basis: synthetic infrastructure profile; missing: replication capability not modeled)
      calculation: Capability matching over the fixed V1 vocabulary: toleratedDriveFailures: required 1 vs available 1 → modeled-ready; snapshots: required true vs available true → modeled-ready; encryptionAtRest: required true vs available true → modeled-ready; replication: required none vs available unknown → modeled-ready.
      implication: Declared protection capabilities meet the workload requirements within the V1 vocabulary.
      next investigation: Confirm capabilities on the real array; vocabulary coverage is selected capabilities only.
      confidence: moderate — Declared capability matching only; not a complete availability assurance.
      assumptions:
        - The V1 capability vocabulary covers selected capabilities, not complete availability assurance.
        - Replication is not equated with backup; availability is not inferred from a single feature.
Dimension growth: modeled-ready
  Check growth: modeled-ready
    headroom: 47.6 TiB
    % of operating budget: 77.5%   % of limit: 62.0%
    Finding R-GRO-1: Projected capacity at the 1-year horizon is within the capacity operating budget.
      evidence:
        - existing used capacity: 131941395333120 bytes (basis: aligned demand sample)
        - existing annual growth fraction: 0.15 fraction (basis: synthetic infrastructure profile)
        - proposed workload capacity: 26388279066624 bytes (basis: synthetic workload profile)
        - proposed annual growth fraction: 0.1 fraction (basis: synthetic workload profile)
        - planning horizon: 1 years (basis: assessment option)
        - capacity operating budget: 233096465088512 bytes (basis: 0.8 × usable capacity)
      calculation: projected = 120 TiB × (1 + 0.15)^1 + 24 TiB × (1 + 0.1)^1 = 164.4 TiB vs 212 TiB budget; headroom 47.6 TiB.
      implication: The modeled environment retains capacity headroom at the 1-year planning horizon.
      next investigation: Validate the declared growth fractions against observed consumption trends; compound growth dominates at longer horizons.
      confidence: high — Deterministic compound-growth arithmetic on declared synthetic inputs; growth rates themselves are assumptions.
      assumptions:
        - Annual growth fractions are synthetic assumptions, not observed trends.
        - Horizon is 1 year(s); horizon 0 equals the current-capacity check.
```

### vm-weekday-burst

```
Synthetic data. Educational demonstration; not vendor sizing or production configuration guidance.
Overall: needs-investigation
Ruleset: 1.0.0-m1   Budget fraction: 0.8
Infrastructure: INF-A   Workload: WL-VM   Sample: vm-weekday-burst
Options: demand multiplier 1x, horizon 1 year(s)
Dimension capacity: modeled-ready
  Check capacity: modeled-ready
    headroom: 68 TiB
    % of operating budget: 67.9%   % of limit: 54.3%
    Finding R-CAP-1: Combined used plus proposed capacity is within the capacity operating budget.
      evidence:
        - existing used capacity: 131941395333120 bytes (basis: aligned demand sample)
        - proposed workload capacity: 26388279066624 bytes (basis: synthetic workload profile)
        - capacity operating budget: 233096465088512 bytes (basis: 0.8 × usable capacity)
        - usable capacity limit: 291370581360640 bytes (basis: synthetic infrastructure profile)
      calculation: 120 TiB used + 24 TiB proposed = 144 TiB combined vs 212 TiB budget (0.8 × 265 TiB usable); headroom 68 TiB.
      implication: Modeled capacity headroom exists for the proposed workload at the declared synthetic values.
      next investigation: Confirm real usable capacity and current consumption before relying on this result.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not measured on a real array.
      assumptions:
        - Usable capacity excludes spares and metadata reserves.
Dimension iops: modeled-ready
  Check iops.frontend: modeled-ready
    headroom: 30000 IOPS
    % of operating budget: 75.0%   % of limit: 60.0%
    Finding R-FE-1: Combined front-end IOPS demand is within the front-end operating budget.
      evidence:
        - existing front-end IOPS: 75000 IOPS (basis: aligned demand sample (reads + writes))
        - proposed front-end IOPS: 15000 IOPS (basis: aligned demand sample (reads + writes))
        - front-end IOPS operating budget: 120000 IOPS (basis: 0.8 × sustainable front-end IOPS limit)
        - sustainable front-end IOPS limit: 150000 IOPS (basis: synthetic infrastructure profile)
      calculation: 75000 existing + 15000 proposed = 90000 IOPS vs 120000 budget; headroom 30000 IOPS.
      implication: Front-end logical IOPS headroom exists for the proposed workload.
      next investigation: Confirm the declared sustainable IOPS envelope and the aligned demand peak on a real source.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not measured on a real array.
      assumptions:
        - Existing and proposed demand are aligned to the same modeled interval.
  Check iops.backend: modeled-ready
    headroom: 47900 ops/s
    % of operating budget: 76.0%   % of limit: 60.8%
    Finding R-BE-1: Combined backend operation demand is within the backend operating budget.
      evidence:
        - existing backend reads: 81750 ops/s (basis: derived from existing logical demand)
        - existing backend writes: 45000 ops/s (basis: derived from existing logical demand)
        - background backend demand: 0 ops/s (basis: declared on the demand sample; added exactly once)
        - proposed backend reads: 16350 ops/s (basis: derived: proposed reads × (1 − hit) + writes × factor)
        - proposed backend writes: 9000 ops/s (basis: derived: proposed writes × factor)
        - backend operating budget: 200000 ops/s (basis: 0.8 × backend sustainable operation limit)
        - backend sustainable operation limit: 250000 ops/s (basis: synthetic infrastructure profile)
      calculation: existing 126750 ops/s + background 0 + proposed 25350 ops/s (reads 16350 + writes 9000; RAID 5 factor 2+2 per logical write) = 152100 ops/s vs 200000 ops/s budget; headroom 47900 ops/s.
      implication: Modeled backend load is within budget under the RAID 5 read-modify-write factor.
      next investigation: Validate cache-hit fraction and write policy on the real system before relying on the estimate.
      confidence: high — Arithmetic on complete declared inputs within the explicitly bounded model; not a physical-array simulation.
      assumptions:
        - RAID 5 classic read-modify-write: each logical write costs 2 backend reads + 2 backend writes.
        - Write-back cache with no coalescing; sustained writes are not treated as zero.
        - Full-stripe writes, erasure coding, compression/dedup, metadata IO, flash write amplification, replication overhead, and rebuild load are outside this calculation.
Dimension throughput: modeled-ready
  Check throughput: modeled-ready
    headroom: 1204.69 MiB/s
    % of operating budget: 49.8%   % of limit: 39.8%
    Finding R-THR-1: Combined throughput demand is within the throughput operating budget.
      evidence:
        - existing throughput: 1044480000 bytes/second (basis: derived: existing IOPS × block sizes)
        - proposed throughput: 208896000 bytes/second (basis: derived: proposed IOPS × block sizes)
        - throughput operating budget: 2516582400 bytes/second (basis: 0.8 × sustainable throughput limit)
        - sustainable throughput limit: 3145728000 bytes/second (basis: synthetic infrastructure profile)
      calculation: existing 996.09 MiB/s (1020000 KiB/s) + proposed 199.22 MiB/s = 1195.31 MiB/s vs 2400 MiB/s budget; headroom 1204.69 MiB/s.
      implication: Modeled sustained bandwidth headroom exists for the proposed workload.
      next investigation: Verify sustained throughput limits and the read/write block-size mix; derived throughput depends on both.
      confidence: high — Derived directly from declared IOPS and block sizes; synthetic values, not a measured limit.
      assumptions:
        - Throughput is derived from IOPS × block size, never an independent input.
Dimension latency: needs-investigation
  Check latency: needs-investigation
    headroom: n/a
    % of operating budget: n/a   % of limit: n/a
    Finding R-LAT-1: Baseline P95 latency 1.2 ms is at or below the workload target 2 ms; post-addition latency unknown: no response curve in V1.
      evidence:
        - baseline P95 latency: 1.2 ms (basis: aligned demand sample (screening indicator))
        - baseline maximum latency: 1.4 ms (basis: aligned demand sample)
        - workload latency target: 2 ms (basis: synthetic workload profile)
      calculation: baseline P95 1.2 ms vs target 2 ms; baseline max 1.4 ms shown alongside.
      implication: No baseline latency concern is indicated, but this says nothing about latency after the proposed workload is added.
      next investigation: Establish post-addition latency with a response model or measurements; V1 cannot.
      confidence: insufficient — Post-addition latency is an unknown in V1 by design.
      assumptions:
        - Baseline P95 is a screening indicator only; the maximum is shown alongside.
        - Post-addition latency unknown: no response curve in V1.
    Finding R-LAT-1: Baseline maximum latency is reported alongside P95 as context.
      evidence:
        - baseline maximum latency: 1.4 ms (basis: aligned demand sample)
        - workload latency target: 2 ms (basis: synthetic workload profile)
      calculation: baseline max 1.4 ms vs target 2 ms; the max is context, not the screening statistic.
      implication: Single-interval maxima can exceed the target even when P95 does not; both are baseline evidence only.
      next investigation: Review the distribution of minute latencies in the M2 weekly statistics.
      confidence: high — Reported value from supplied evidence; no inference made.
      assumptions:
        - Latency evidence is synthetic baseline data for the existing environment only.
Dimension protection: modeled-ready
  Check protection: modeled-ready
    headroom: n/a
    % of operating budget: n/a   % of limit: n/a
    Finding R-PRO-1: All declared workload protection requirements are satisfied by the infrastructure capabilities.
      evidence:
        - minimum tolerated drive failures required: 1 count (basis: workload protection requirement)
        - tolerated drive failures: 1 count (basis: synthetic infrastructure profile)
        - snapshots required: true flag (basis: workload protection requirement)
        - snapshots capability: true flag (basis: synthetic infrastructure profile)
        - encryptionAtRest required: true flag (basis: workload protection requirement)
        - encryptionAtRest capability: true flag (basis: synthetic infrastructure profile)
        - replication required: none mode (basis: workload protection requirement)
        - replication capability: unknown mode (basis: synthetic infrastructure profile; missing: replication capability not modeled)
      calculation: Capability matching over the fixed V1 vocabulary: toleratedDriveFailures: required 1 vs available 1 → modeled-ready; snapshots: required true vs available true → modeled-ready; encryptionAtRest: required true vs available true → modeled-ready; replication: required none vs available unknown → modeled-ready.
      implication: Declared protection capabilities meet the workload requirements within the V1 vocabulary.
      next investigation: Confirm capabilities on the real array; vocabulary coverage is selected capabilities only.
      confidence: moderate — Declared capability matching only; not a complete availability assurance.
      assumptions:
        - The V1 capability vocabulary covers selected capabilities, not complete availability assurance.
        - Replication is not equated with backup; availability is not inferred from a single feature.
Dimension growth: modeled-ready
  Check growth: modeled-ready
    headroom: 47.6 TiB
    % of operating budget: 77.5%   % of limit: 62.0%
    Finding R-GRO-1: Projected capacity at the 1-year horizon is within the capacity operating budget.
      evidence:
        - existing used capacity: 131941395333120 bytes (basis: aligned demand sample)
        - existing annual growth fraction: 0.15 fraction (basis: synthetic infrastructure profile)
        - proposed workload capacity: 26388279066624 bytes (basis: synthetic workload profile)
        - proposed annual growth fraction: 0.1 fraction (basis: synthetic workload profile)
        - planning horizon: 1 years (basis: assessment option)
        - capacity operating budget: 233096465088512 bytes (basis: 0.8 × usable capacity)
      calculation: projected = 120 TiB × (1 + 0.15)^1 + 24 TiB × (1 + 0.1)^1 = 164.4 TiB vs 212 TiB budget; headroom 47.6 TiB.
      implication: The modeled environment retains capacity headroom at the 1-year planning horizon.
      next investigation: Validate the declared growth fractions against observed consumption trends; compound growth dominates at longer horizons.
      confidence: high — Deterministic compound-growth arithmetic on declared synthetic inputs; growth rates themselves are assumptions.
      assumptions:
        - Annual growth fractions are synthetic assumptions, not observed trends.
        - Horizon is 1 year(s); horizon 0 equals the current-capacity check.
```

### vm-weekday-patch

```
Synthetic data. Educational demonstration; not vendor sizing or production configuration guidance.
Overall: needs-investigation
Ruleset: 1.0.0-m1   Budget fraction: 0.8
Infrastructure: INF-A   Workload: WL-VM   Sample: vm-weekday-patch
Options: demand multiplier 1x, horizon 1 year(s)
Dimension capacity: modeled-ready
  Check capacity: modeled-ready
    headroom: 68 TiB
    % of operating budget: 67.9%   % of limit: 54.3%
    Finding R-CAP-1: Combined used plus proposed capacity is within the capacity operating budget.
      evidence:
        - existing used capacity: 131941395333120 bytes (basis: aligned demand sample)
        - proposed workload capacity: 26388279066624 bytes (basis: synthetic workload profile)
        - capacity operating budget: 233096465088512 bytes (basis: 0.8 × usable capacity)
        - usable capacity limit: 291370581360640 bytes (basis: synthetic infrastructure profile)
      calculation: 120 TiB used + 24 TiB proposed = 144 TiB combined vs 212 TiB budget (0.8 × 265 TiB usable); headroom 68 TiB.
      implication: Modeled capacity headroom exists for the proposed workload at the declared synthetic values.
      next investigation: Confirm real usable capacity and current consumption before relying on this result.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not measured on a real array.
      assumptions:
        - Usable capacity excludes spares and metadata reserves.
Dimension iops: modeled-ready
  Check iops.frontend: modeled-ready
    headroom: 83000 IOPS
    % of operating budget: 30.8%   % of limit: 24.7%
    Finding R-FE-1: Combined front-end IOPS demand is within the front-end operating budget.
      evidence:
        - existing front-end IOPS: 25000 IOPS (basis: aligned demand sample (reads + writes))
        - proposed front-end IOPS: 12000 IOPS (basis: aligned demand sample (reads + writes))
        - front-end IOPS operating budget: 120000 IOPS (basis: 0.8 × sustainable front-end IOPS limit)
        - sustainable front-end IOPS limit: 150000 IOPS (basis: synthetic infrastructure profile)
      calculation: 25000 existing + 12000 proposed = 37000 IOPS vs 120000 budget; headroom 83000 IOPS.
      implication: Front-end logical IOPS headroom exists for the proposed workload.
      next investigation: Confirm the declared sustainable IOPS envelope and the aligned demand peak on a real source.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not measured on a real array.
      assumptions:
        - Existing and proposed demand are aligned to the same modeled interval.
  Check iops.backend: modeled-ready
    headroom: 129550 ops/s
    % of operating budget: 35.2%   % of limit: 28.2%
    Finding R-BE-1: Combined backend operation demand is within the backend operating budget.
      evidence:
        - existing backend reads: 27250 ops/s (basis: derived from existing logical demand)
        - existing backend writes: 15000 ops/s (basis: derived from existing logical demand)
        - background backend demand: 0 ops/s (basis: declared on the demand sample; added exactly once)
        - proposed backend reads: 16200 ops/s (basis: derived: proposed reads × (1 − hit) + writes × factor)
        - proposed backend writes: 12000 ops/s (basis: derived: proposed writes × factor)
        - backend operating budget: 200000 ops/s (basis: 0.8 × backend sustainable operation limit)
        - backend sustainable operation limit: 250000 ops/s (basis: synthetic infrastructure profile)
      calculation: existing 42250 ops/s + background 0 + proposed 28200 ops/s (reads 16200 + writes 12000; RAID 5 factor 2+2 per logical write) = 70450 ops/s vs 200000 ops/s budget; headroom 129550 ops/s.
      implication: Modeled backend load is within budget under the RAID 5 read-modify-write factor.
      next investigation: Validate cache-hit fraction and write policy on the real system before relying on the estimate.
      confidence: high — Arithmetic on complete declared inputs within the explicitly bounded model; not a physical-array simulation.
      assumptions:
        - RAID 5 classic read-modify-write: each logical write costs 2 backend reads + 2 backend writes.
        - Write-back cache with no coalescing; sustained writes are not treated as zero.
        - Full-stripe writes, erasure coding, compression/dedup, metadata IO, flash write amplification, replication overhead, and rebuild load are outside this calculation.
Dimension throughput: modeled-ready
  Check throughput: modeled-ready
    headroom: 1927.34 MiB/s
    % of operating budget: 19.7%   % of limit: 15.8%
    Finding R-THR-1: Combined throughput demand is within the throughput operating budget.
      evidence:
        - existing throughput: 348160000 bytes/second (basis: derived: existing IOPS × block sizes)
        - proposed throughput: 147456000 bytes/second (basis: derived: proposed IOPS × block sizes)
        - throughput operating budget: 2516582400 bytes/second (basis: 0.8 × sustainable throughput limit)
        - sustainable throughput limit: 3145728000 bytes/second (basis: synthetic infrastructure profile)
      calculation: existing 332.03 MiB/s (340000 KiB/s) + proposed 140.63 MiB/s = 472.66 MiB/s vs 2400 MiB/s budget; headroom 1927.34 MiB/s.
      implication: Modeled sustained bandwidth headroom exists for the proposed workload.
      next investigation: Verify sustained throughput limits and the read/write block-size mix; derived throughput depends on both.
      confidence: high — Derived directly from declared IOPS and block sizes; synthetic values, not a measured limit.
      assumptions:
        - Throughput is derived from IOPS × block size, never an independent input.
Dimension latency: needs-investigation
  Check latency: needs-investigation
    headroom: n/a
    % of operating budget: n/a   % of limit: n/a
    Finding R-LAT-1: Baseline P95 latency 1.2 ms is at or below the workload target 2 ms; post-addition latency unknown: no response curve in V1.
      evidence:
        - baseline P95 latency: 1.2 ms (basis: aligned demand sample (screening indicator))
        - baseline maximum latency: 1.4 ms (basis: aligned demand sample)
        - workload latency target: 2 ms (basis: synthetic workload profile)
      calculation: baseline P95 1.2 ms vs target 2 ms; baseline max 1.4 ms shown alongside.
      implication: No baseline latency concern is indicated, but this says nothing about latency after the proposed workload is added.
      next investigation: Establish post-addition latency with a response model or measurements; V1 cannot.
      confidence: insufficient — Post-addition latency is an unknown in V1 by design.
      assumptions:
        - Baseline P95 is a screening indicator only; the maximum is shown alongside.
        - Post-addition latency unknown: no response curve in V1.
    Finding R-LAT-1: Baseline maximum latency is reported alongside P95 as context.
      evidence:
        - baseline maximum latency: 1.4 ms (basis: aligned demand sample)
        - workload latency target: 2 ms (basis: synthetic workload profile)
      calculation: baseline max 1.4 ms vs target 2 ms; the max is context, not the screening statistic.
      implication: Single-interval maxima can exceed the target even when P95 does not; both are baseline evidence only.
      next investigation: Review the distribution of minute latencies in the M2 weekly statistics.
      confidence: high — Reported value from supplied evidence; no inference made.
      assumptions:
        - Latency evidence is synthetic baseline data for the existing environment only.
Dimension protection: modeled-ready
  Check protection: modeled-ready
    headroom: n/a
    % of operating budget: n/a   % of limit: n/a
    Finding R-PRO-1: All declared workload protection requirements are satisfied by the infrastructure capabilities.
      evidence:
        - minimum tolerated drive failures required: 1 count (basis: workload protection requirement)
        - tolerated drive failures: 1 count (basis: synthetic infrastructure profile)
        - snapshots required: true flag (basis: workload protection requirement)
        - snapshots capability: true flag (basis: synthetic infrastructure profile)
        - encryptionAtRest required: true flag (basis: workload protection requirement)
        - encryptionAtRest capability: true flag (basis: synthetic infrastructure profile)
        - replication required: none mode (basis: workload protection requirement)
        - replication capability: unknown mode (basis: synthetic infrastructure profile; missing: replication capability not modeled)
      calculation: Capability matching over the fixed V1 vocabulary: toleratedDriveFailures: required 1 vs available 1 → modeled-ready; snapshots: required true vs available true → modeled-ready; encryptionAtRest: required true vs available true → modeled-ready; replication: required none vs available unknown → modeled-ready.
      implication: Declared protection capabilities meet the workload requirements within the V1 vocabulary.
      next investigation: Confirm capabilities on the real array; vocabulary coverage is selected capabilities only.
      confidence: moderate — Declared capability matching only; not a complete availability assurance.
      assumptions:
        - The V1 capability vocabulary covers selected capabilities, not complete availability assurance.
        - Replication is not equated with backup; availability is not inferred from a single feature.
Dimension growth: modeled-ready
  Check growth: modeled-ready
    headroom: 47.6 TiB
    % of operating budget: 77.5%   % of limit: 62.0%
    Finding R-GRO-1: Projected capacity at the 1-year horizon is within the capacity operating budget.
      evidence:
        - existing used capacity: 131941395333120 bytes (basis: aligned demand sample)
        - existing annual growth fraction: 0.15 fraction (basis: synthetic infrastructure profile)
        - proposed workload capacity: 26388279066624 bytes (basis: synthetic workload profile)
        - proposed annual growth fraction: 0.1 fraction (basis: synthetic workload profile)
        - planning horizon: 1 years (basis: assessment option)
        - capacity operating budget: 233096465088512 bytes (basis: 0.8 × usable capacity)
      calculation: projected = 120 TiB × (1 + 0.15)^1 + 24 TiB × (1 + 0.1)^1 = 164.4 TiB vs 212 TiB budget; headroom 47.6 TiB.
      implication: The modeled environment retains capacity headroom at the 1-year planning horizon.
      next investigation: Validate the declared growth fractions against observed consumption trends; compound growth dominates at longer horizons.
      confidence: high — Deterministic compound-growth arithmetic on declared synthetic inputs; growth rates themselves are assumptions.
      assumptions:
        - Annual growth fractions are synthetic assumptions, not observed trends.
        - Horizon is 1 year(s); horizon 0 equals the current-capacity check.
```

### vm-weekday-batch

```
Synthetic data. Educational demonstration; not vendor sizing or production configuration guidance.
Overall: needs-investigation
Ruleset: 1.0.0-m1   Budget fraction: 0.8
Infrastructure: INF-A   Workload: WL-VM   Sample: vm-weekday-batch
Options: demand multiplier 1x, horizon 1 year(s)
Dimension capacity: modeled-ready
  Check capacity: modeled-ready
    headroom: 68 TiB
    % of operating budget: 67.9%   % of limit: 54.3%
    Finding R-CAP-1: Combined used plus proposed capacity is within the capacity operating budget.
      evidence:
        - existing used capacity: 131941395333120 bytes (basis: aligned demand sample)
        - proposed workload capacity: 26388279066624 bytes (basis: synthetic workload profile)
        - capacity operating budget: 233096465088512 bytes (basis: 0.8 × usable capacity)
        - usable capacity limit: 291370581360640 bytes (basis: synthetic infrastructure profile)
      calculation: 120 TiB used + 24 TiB proposed = 144 TiB combined vs 212 TiB budget (0.8 × 265 TiB usable); headroom 68 TiB.
      implication: Modeled capacity headroom exists for the proposed workload at the declared synthetic values.
      next investigation: Confirm real usable capacity and current consumption before relying on this result.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not measured on a real array.
      assumptions:
        - Usable capacity excludes spares and metadata reserves.
Dimension iops: modeled-ready
  Check iops.frontend: modeled-ready
    headroom: 76000 IOPS
    % of operating budget: 36.7%   % of limit: 29.3%
    Finding R-FE-1: Combined front-end IOPS demand is within the front-end operating budget.
      evidence:
        - existing front-end IOPS: 40000 IOPS (basis: aligned demand sample (reads + writes))
        - proposed front-end IOPS: 4000 IOPS (basis: aligned demand sample (reads + writes))
        - front-end IOPS operating budget: 120000 IOPS (basis: 0.8 × sustainable front-end IOPS limit)
        - sustainable front-end IOPS limit: 150000 IOPS (basis: synthetic infrastructure profile)
      calculation: 40000 existing + 4000 proposed = 44000 IOPS vs 120000 budget; headroom 76000 IOPS.
      implication: Front-end logical IOPS headroom exists for the proposed workload.
      next investigation: Confirm the declared sustainable IOPS envelope and the aligned demand peak on a real source.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not measured on a real array.
      assumptions:
        - Existing and proposed demand are aligned to the same modeled interval.
  Check iops.backend: modeled-ready
    headroom: 86040 ops/s
    % of operating budget: 57.0%   % of limit: 45.6%
    Finding R-BE-1: Combined backend operation demand is within the backend operating budget.
      evidence:
        - existing backend reads: 59200 ops/s (basis: derived from existing logical demand)
        - existing backend writes: 48000 ops/s (basis: derived from existing logical demand)
        - background backend demand: 0 ops/s (basis: declared on the demand sample; added exactly once)
        - proposed backend reads: 4360 ops/s (basis: derived: proposed reads × (1 − hit) + writes × factor)
        - proposed backend writes: 2400 ops/s (basis: derived: proposed writes × factor)
        - backend operating budget: 200000 ops/s (basis: 0.8 × backend sustainable operation limit)
        - backend sustainable operation limit: 250000 ops/s (basis: synthetic infrastructure profile)
      calculation: existing 107200 ops/s + background 0 + proposed 6760 ops/s (reads 4360 + writes 2400; RAID 5 factor 2+2 per logical write) = 113960 ops/s vs 200000 ops/s budget; headroom 86040 ops/s.
      implication: Modeled backend load is within budget under the RAID 5 read-modify-write factor.
      next investigation: Validate cache-hit fraction and write policy on the real system before relying on the estimate.
      confidence: high — Arithmetic on complete declared inputs within the explicitly bounded model; not a physical-array simulation.
      assumptions:
        - RAID 5 classic read-modify-write: each logical write costs 2 backend reads + 2 backend writes.
        - Write-back cache with no coalescing; sustained writes are not treated as zero.
        - Full-stripe writes, erasure coding, compression/dedup, metadata IO, flash write amplification, replication overhead, and rebuild load are outside this calculation.
Dimension throughput: modeled-ready
  Check throughput: modeled-ready
    headroom: 1909.38 MiB/s
    % of operating budget: 20.4%   % of limit: 16.4%
    Finding R-THR-1: Combined throughput demand is within the throughput operating budget.
      evidence:
        - existing throughput: 458752000 bytes/second (basis: derived: existing IOPS × block sizes)
        - proposed throughput: 55705600 bytes/second (basis: derived: proposed IOPS × block sizes)
        - throughput operating budget: 2516582400 bytes/second (basis: 0.8 × sustainable throughput limit)
        - sustainable throughput limit: 3145728000 bytes/second (basis: synthetic infrastructure profile)
      calculation: existing 437.5 MiB/s (448000 KiB/s) + proposed 53.13 MiB/s = 490.63 MiB/s vs 2400 MiB/s budget; headroom 1909.38 MiB/s.
      implication: Modeled sustained bandwidth headroom exists for the proposed workload.
      next investigation: Verify sustained throughput limits and the read/write block-size mix; derived throughput depends on both.
      confidence: high — Derived directly from declared IOPS and block sizes; synthetic values, not a measured limit.
      assumptions:
        - Throughput is derived from IOPS × block size, never an independent input.
Dimension latency: needs-investigation
  Check latency: needs-investigation
    headroom: n/a
    % of operating budget: n/a   % of limit: n/a
    Finding R-LAT-1: Baseline P95 latency 1.2 ms is at or below the workload target 2 ms; post-addition latency unknown: no response curve in V1.
      evidence:
        - baseline P95 latency: 1.2 ms (basis: aligned demand sample (screening indicator))
        - baseline maximum latency: 1.4 ms (basis: aligned demand sample)
        - workload latency target: 2 ms (basis: synthetic workload profile)
      calculation: baseline P95 1.2 ms vs target 2 ms; baseline max 1.4 ms shown alongside.
      implication: No baseline latency concern is indicated, but this says nothing about latency after the proposed workload is added.
      next investigation: Establish post-addition latency with a response model or measurements; V1 cannot.
      confidence: insufficient — Post-addition latency is an unknown in V1 by design.
      assumptions:
        - Baseline P95 is a screening indicator only; the maximum is shown alongside.
        - Post-addition latency unknown: no response curve in V1.
    Finding R-LAT-1: Baseline maximum latency is reported alongside P95 as context.
      evidence:
        - baseline maximum latency: 1.4 ms (basis: aligned demand sample)
        - workload latency target: 2 ms (basis: synthetic workload profile)
      calculation: baseline max 1.4 ms vs target 2 ms; the max is context, not the screening statistic.
      implication: Single-interval maxima can exceed the target even when P95 does not; both are baseline evidence only.
      next investigation: Review the distribution of minute latencies in the M2 weekly statistics.
      confidence: high — Reported value from supplied evidence; no inference made.
      assumptions:
        - Latency evidence is synthetic baseline data for the existing environment only.
Dimension protection: modeled-ready
  Check protection: modeled-ready
    headroom: n/a
    % of operating budget: n/a   % of limit: n/a
    Finding R-PRO-1: All declared workload protection requirements are satisfied by the infrastructure capabilities.
      evidence:
        - minimum tolerated drive failures required: 1 count (basis: workload protection requirement)
        - tolerated drive failures: 1 count (basis: synthetic infrastructure profile)
        - snapshots required: true flag (basis: workload protection requirement)
        - snapshots capability: true flag (basis: synthetic infrastructure profile)
        - encryptionAtRest required: true flag (basis: workload protection requirement)
        - encryptionAtRest capability: true flag (basis: synthetic infrastructure profile)
        - replication required: none mode (basis: workload protection requirement)
        - replication capability: unknown mode (basis: synthetic infrastructure profile; missing: replication capability not modeled)
      calculation: Capability matching over the fixed V1 vocabulary: toleratedDriveFailures: required 1 vs available 1 → modeled-ready; snapshots: required true vs available true → modeled-ready; encryptionAtRest: required true vs available true → modeled-ready; replication: required none vs available unknown → modeled-ready.
      implication: Declared protection capabilities meet the workload requirements within the V1 vocabulary.
      next investigation: Confirm capabilities on the real array; vocabulary coverage is selected capabilities only.
      confidence: moderate — Declared capability matching only; not a complete availability assurance.
      assumptions:
        - The V1 capability vocabulary covers selected capabilities, not complete availability assurance.
        - Replication is not equated with backup; availability is not inferred from a single feature.
Dimension growth: modeled-ready
  Check growth: modeled-ready
    headroom: 47.6 TiB
    % of operating budget: 77.5%   % of limit: 62.0%
    Finding R-GRO-1: Projected capacity at the 1-year horizon is within the capacity operating budget.
      evidence:
        - existing used capacity: 131941395333120 bytes (basis: aligned demand sample)
        - existing annual growth fraction: 0.15 fraction (basis: synthetic infrastructure profile)
        - proposed workload capacity: 26388279066624 bytes (basis: synthetic workload profile)
        - proposed annual growth fraction: 0.1 fraction (basis: synthetic workload profile)
        - planning horizon: 1 years (basis: assessment option)
        - capacity operating budget: 233096465088512 bytes (basis: 0.8 × usable capacity)
      calculation: projected = 120 TiB × (1 + 0.15)^1 + 24 TiB × (1 + 0.1)^1 = 164.4 TiB vs 212 TiB budget; headroom 47.6 TiB.
      implication: The modeled environment retains capacity headroom at the 1-year planning horizon.
      next investigation: Validate the declared growth fractions against observed consumption trends; compound growth dominates at longer horizons.
      confidence: high — Deterministic compound-growth arithmetic on declared synthetic inputs; growth rates themselves are assumptions.
      assumptions:
        - Annual growth fractions are synthetic assumptions, not observed trends.
        - Horizon is 1 year(s); horizon 0 equals the current-capacity check.
```

### what-if: vm-weekday-burst

#### vm-weekday-burst — demand 1.5×, horizon 0y

```
Synthetic data. Educational demonstration; not vendor sizing or production configuration guidance.
Overall: needs-investigation
Ruleset: 1.0.0-m1   Budget fraction: 0.8
Infrastructure: INF-A   Workload: WL-VM   Sample: vm-weekday-burst
Options: demand multiplier 1.5x, horizon 0 year(s)
Dimension capacity: modeled-ready
  Check capacity: modeled-ready
    headroom: 68 TiB
    % of operating budget: 67.9%   % of limit: 54.3%
    Finding R-CAP-1: Combined used plus proposed capacity is within the capacity operating budget.
      evidence:
        - existing used capacity: 131941395333120 bytes (basis: aligned demand sample)
        - proposed workload capacity: 26388279066624 bytes (basis: synthetic workload profile)
        - capacity operating budget: 233096465088512 bytes (basis: 0.8 × usable capacity)
        - usable capacity limit: 291370581360640 bytes (basis: synthetic infrastructure profile)
      calculation: 120 TiB used + 24 TiB proposed = 144 TiB combined vs 212 TiB budget (0.8 × 265 TiB usable); headroom 68 TiB.
      implication: Modeled capacity headroom exists for the proposed workload at the declared synthetic values.
      next investigation: Confirm real usable capacity and current consumption before relying on this result.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not measured on a real array.
      assumptions:
        - Usable capacity excludes spares and metadata reserves.
Dimension iops: modeled-ready
  Check iops.frontend: modeled-ready
    headroom: 22500 IOPS
    % of operating budget: 81.3%   % of limit: 65.0%
    Finding R-FE-1: Combined front-end IOPS demand is within the front-end operating budget.
      evidence:
        - existing front-end IOPS: 75000 IOPS (basis: aligned demand sample (reads + writes))
        - proposed front-end IOPS: 22500 IOPS (basis: aligned demand sample (reads + writes))
        - front-end IOPS operating budget: 120000 IOPS (basis: 0.8 × sustainable front-end IOPS limit)
        - sustainable front-end IOPS limit: 150000 IOPS (basis: synthetic infrastructure profile)
      calculation: 75000 existing + 22500 proposed = 97500 IOPS vs 120000 budget; headroom 22500 IOPS.
      implication: Front-end logical IOPS headroom exists for the proposed workload.
      next investigation: Confirm the declared sustainable IOPS envelope and the aligned demand peak on a real source.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not measured on a real array.
      assumptions:
        - Existing and proposed demand are aligned to the same modeled interval.
  Check iops.backend: modeled-ready
    headroom: 35225 ops/s
    % of operating budget: 82.4%   % of limit: 65.9%
    Finding R-BE-1: Combined backend operation demand is within the backend operating budget.
      evidence:
        - existing backend reads: 81750 ops/s (basis: derived from existing logical demand)
        - existing backend writes: 45000 ops/s (basis: derived from existing logical demand)
        - background backend demand: 0 ops/s (basis: declared on the demand sample; added exactly once)
        - proposed backend reads: 24525 ops/s (basis: derived: proposed reads × (1 − hit) + writes × factor)
        - proposed backend writes: 13500 ops/s (basis: derived: proposed writes × factor)
        - backend operating budget: 200000 ops/s (basis: 0.8 × backend sustainable operation limit)
        - backend sustainable operation limit: 250000 ops/s (basis: synthetic infrastructure profile)
      calculation: existing 126750 ops/s + background 0 + proposed 38025 ops/s (reads 24525 + writes 13500; RAID 5 factor 2+2 per logical write) = 164775 ops/s vs 200000 ops/s budget; headroom 35225 ops/s.
      implication: Modeled backend load is within budget under the RAID 5 read-modify-write factor.
      next investigation: Validate cache-hit fraction and write policy on the real system before relying on the estimate.
      confidence: high — Arithmetic on complete declared inputs within the explicitly bounded model; not a physical-array simulation.
      assumptions:
        - RAID 5 classic read-modify-write: each logical write costs 2 backend reads + 2 backend writes.
        - Write-back cache with no coalescing; sustained writes are not treated as zero.
        - Full-stripe writes, erasure coding, compression/dedup, metadata IO, flash write amplification, replication overhead, and rebuild load are outside this calculation.
Dimension throughput: modeled-ready
  Check throughput: modeled-ready
    headroom: 1105.08 MiB/s
    % of operating budget: 54.0%   % of limit: 43.2%
    Finding R-THR-1: Combined throughput demand is within the throughput operating budget.
      evidence:
        - existing throughput: 1044480000 bytes/second (basis: derived: existing IOPS × block sizes)
        - proposed throughput: 313344000 bytes/second (basis: derived: proposed IOPS × block sizes)
        - throughput operating budget: 2516582400 bytes/second (basis: 0.8 × sustainable throughput limit)
        - sustainable throughput limit: 3145728000 bytes/second (basis: synthetic infrastructure profile)
      calculation: existing 996.09 MiB/s (1020000 KiB/s) + proposed 298.83 MiB/s = 1294.92 MiB/s vs 2400 MiB/s budget; headroom 1105.08 MiB/s.
      implication: Modeled sustained bandwidth headroom exists for the proposed workload.
      next investigation: Verify sustained throughput limits and the read/write block-size mix; derived throughput depends on both.
      confidence: high — Derived directly from declared IOPS and block sizes; synthetic values, not a measured limit.
      assumptions:
        - Throughput is derived from IOPS × block size, never an independent input.
Dimension latency: needs-investigation
  Check latency: needs-investigation
    headroom: n/a
    % of operating budget: n/a   % of limit: n/a
    Finding R-LAT-1: Baseline P95 latency 1.2 ms is at or below the workload target 2 ms; post-addition latency unknown: no response curve in V1.
      evidence:
        - baseline P95 latency: 1.2 ms (basis: aligned demand sample (screening indicator))
        - baseline maximum latency: 1.4 ms (basis: aligned demand sample)
        - workload latency target: 2 ms (basis: synthetic workload profile)
      calculation: baseline P95 1.2 ms vs target 2 ms; baseline max 1.4 ms shown alongside.
      implication: No baseline latency concern is indicated, but this says nothing about latency after the proposed workload is added.
      next investigation: Establish post-addition latency with a response model or measurements; V1 cannot.
      confidence: insufficient — Post-addition latency is an unknown in V1 by design.
      assumptions:
        - Baseline P95 is a screening indicator only; the maximum is shown alongside.
        - Post-addition latency unknown: no response curve in V1.
    Finding R-LAT-1: Baseline maximum latency is reported alongside P95 as context.
      evidence:
        - baseline maximum latency: 1.4 ms (basis: aligned demand sample)
        - workload latency target: 2 ms (basis: synthetic workload profile)
      calculation: baseline max 1.4 ms vs target 2 ms; the max is context, not the screening statistic.
      implication: Single-interval maxima can exceed the target even when P95 does not; both are baseline evidence only.
      next investigation: Review the distribution of minute latencies in the M2 weekly statistics.
      confidence: high — Reported value from supplied evidence; no inference made.
      assumptions:
        - Latency evidence is synthetic baseline data for the existing environment only.
Dimension protection: modeled-ready
  Check protection: modeled-ready
    headroom: n/a
    % of operating budget: n/a   % of limit: n/a
    Finding R-PRO-1: All declared workload protection requirements are satisfied by the infrastructure capabilities.
      evidence:
        - minimum tolerated drive failures required: 1 count (basis: workload protection requirement)
        - tolerated drive failures: 1 count (basis: synthetic infrastructure profile)
        - snapshots required: true flag (basis: workload protection requirement)
        - snapshots capability: true flag (basis: synthetic infrastructure profile)
        - encryptionAtRest required: true flag (basis: workload protection requirement)
        - encryptionAtRest capability: true flag (basis: synthetic infrastructure profile)
        - replication required: none mode (basis: workload protection requirement)
        - replication capability: unknown mode (basis: synthetic infrastructure profile; missing: replication capability not modeled)
      calculation: Capability matching over the fixed V1 vocabulary: toleratedDriveFailures: required 1 vs available 1 → modeled-ready; snapshots: required true vs available true → modeled-ready; encryptionAtRest: required true vs available true → modeled-ready; replication: required none vs available unknown → modeled-ready.
      implication: Declared protection capabilities meet the workload requirements within the V1 vocabulary.
      next investigation: Confirm capabilities on the real array; vocabulary coverage is selected capabilities only.
      confidence: moderate — Declared capability matching only; not a complete availability assurance.
      assumptions:
        - The V1 capability vocabulary covers selected capabilities, not complete availability assurance.
        - Replication is not equated with backup; availability is not inferred from a single feature.
Dimension growth: modeled-ready
  Check growth: modeled-ready
    headroom: 68 TiB
    % of operating budget: 67.9%   % of limit: 54.3%
    Finding R-GRO-1: Projected capacity at the 0-year horizon is within the capacity operating budget.
      evidence:
        - existing used capacity: 131941395333120 bytes (basis: aligned demand sample)
        - existing annual growth fraction: 0.15 fraction (basis: synthetic infrastructure profile)
        - proposed workload capacity: 26388279066624 bytes (basis: synthetic workload profile)
        - proposed annual growth fraction: 0.1 fraction (basis: synthetic workload profile)
        - planning horizon: 0 years (basis: assessment option)
        - capacity operating budget: 233096465088512 bytes (basis: 0.8 × usable capacity)
      calculation: projected = 120 TiB × (1 + 0.15)^0 + 24 TiB × (1 + 0.1)^0 = 144 TiB vs 212 TiB budget; headroom 68 TiB.
      implication: The modeled environment retains capacity headroom at the 0-year planning horizon.
      next investigation: Validate the declared growth fractions against observed consumption trends; compound growth dominates at longer horizons.
      confidence: high — Deterministic compound-growth arithmetic on declared synthetic inputs; growth rates themselves are assumptions.
      assumptions:
        - Annual growth fractions are synthetic assumptions, not observed trends.
        - Horizon is 0 year(s); horizon 0 equals the current-capacity check.
```

#### vm-weekday-burst — demand 1.5×, horizon 1y

```
Synthetic data. Educational demonstration; not vendor sizing or production configuration guidance.
Overall: needs-investigation
Ruleset: 1.0.0-m1   Budget fraction: 0.8
Infrastructure: INF-A   Workload: WL-VM   Sample: vm-weekday-burst
Options: demand multiplier 1.5x, horizon 1 year(s)
Dimension capacity: modeled-ready
  Check capacity: modeled-ready
    headroom: 68 TiB
    % of operating budget: 67.9%   % of limit: 54.3%
    Finding R-CAP-1: Combined used plus proposed capacity is within the capacity operating budget.
      evidence:
        - existing used capacity: 131941395333120 bytes (basis: aligned demand sample)
        - proposed workload capacity: 26388279066624 bytes (basis: synthetic workload profile)
        - capacity operating budget: 233096465088512 bytes (basis: 0.8 × usable capacity)
        - usable capacity limit: 291370581360640 bytes (basis: synthetic infrastructure profile)
      calculation: 120 TiB used + 24 TiB proposed = 144 TiB combined vs 212 TiB budget (0.8 × 265 TiB usable); headroom 68 TiB.
      implication: Modeled capacity headroom exists for the proposed workload at the declared synthetic values.
      next investigation: Confirm real usable capacity and current consumption before relying on this result.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not measured on a real array.
      assumptions:
        - Usable capacity excludes spares and metadata reserves.
Dimension iops: modeled-ready
  Check iops.frontend: modeled-ready
    headroom: 22500 IOPS
    % of operating budget: 81.3%   % of limit: 65.0%
    Finding R-FE-1: Combined front-end IOPS demand is within the front-end operating budget.
      evidence:
        - existing front-end IOPS: 75000 IOPS (basis: aligned demand sample (reads + writes))
        - proposed front-end IOPS: 22500 IOPS (basis: aligned demand sample (reads + writes))
        - front-end IOPS operating budget: 120000 IOPS (basis: 0.8 × sustainable front-end IOPS limit)
        - sustainable front-end IOPS limit: 150000 IOPS (basis: synthetic infrastructure profile)
      calculation: 75000 existing + 22500 proposed = 97500 IOPS vs 120000 budget; headroom 22500 IOPS.
      implication: Front-end logical IOPS headroom exists for the proposed workload.
      next investigation: Confirm the declared sustainable IOPS envelope and the aligned demand peak on a real source.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not measured on a real array.
      assumptions:
        - Existing and proposed demand are aligned to the same modeled interval.
  Check iops.backend: modeled-ready
    headroom: 35225 ops/s
    % of operating budget: 82.4%   % of limit: 65.9%
    Finding R-BE-1: Combined backend operation demand is within the backend operating budget.
      evidence:
        - existing backend reads: 81750 ops/s (basis: derived from existing logical demand)
        - existing backend writes: 45000 ops/s (basis: derived from existing logical demand)
        - background backend demand: 0 ops/s (basis: declared on the demand sample; added exactly once)
        - proposed backend reads: 24525 ops/s (basis: derived: proposed reads × (1 − hit) + writes × factor)
        - proposed backend writes: 13500 ops/s (basis: derived: proposed writes × factor)
        - backend operating budget: 200000 ops/s (basis: 0.8 × backend sustainable operation limit)
        - backend sustainable operation limit: 250000 ops/s (basis: synthetic infrastructure profile)
      calculation: existing 126750 ops/s + background 0 + proposed 38025 ops/s (reads 24525 + writes 13500; RAID 5 factor 2+2 per logical write) = 164775 ops/s vs 200000 ops/s budget; headroom 35225 ops/s.
      implication: Modeled backend load is within budget under the RAID 5 read-modify-write factor.
      next investigation: Validate cache-hit fraction and write policy on the real system before relying on the estimate.
      confidence: high — Arithmetic on complete declared inputs within the explicitly bounded model; not a physical-array simulation.
      assumptions:
        - RAID 5 classic read-modify-write: each logical write costs 2 backend reads + 2 backend writes.
        - Write-back cache with no coalescing; sustained writes are not treated as zero.
        - Full-stripe writes, erasure coding, compression/dedup, metadata IO, flash write amplification, replication overhead, and rebuild load are outside this calculation.
Dimension throughput: modeled-ready
  Check throughput: modeled-ready
    headroom: 1105.08 MiB/s
    % of operating budget: 54.0%   % of limit: 43.2%
    Finding R-THR-1: Combined throughput demand is within the throughput operating budget.
      evidence:
        - existing throughput: 1044480000 bytes/second (basis: derived: existing IOPS × block sizes)
        - proposed throughput: 313344000 bytes/second (basis: derived: proposed IOPS × block sizes)
        - throughput operating budget: 2516582400 bytes/second (basis: 0.8 × sustainable throughput limit)
        - sustainable throughput limit: 3145728000 bytes/second (basis: synthetic infrastructure profile)
      calculation: existing 996.09 MiB/s (1020000 KiB/s) + proposed 298.83 MiB/s = 1294.92 MiB/s vs 2400 MiB/s budget; headroom 1105.08 MiB/s.
      implication: Modeled sustained bandwidth headroom exists for the proposed workload.
      next investigation: Verify sustained throughput limits and the read/write block-size mix; derived throughput depends on both.
      confidence: high — Derived directly from declared IOPS and block sizes; synthetic values, not a measured limit.
      assumptions:
        - Throughput is derived from IOPS × block size, never an independent input.
Dimension latency: needs-investigation
  Check latency: needs-investigation
    headroom: n/a
    % of operating budget: n/a   % of limit: n/a
    Finding R-LAT-1: Baseline P95 latency 1.2 ms is at or below the workload target 2 ms; post-addition latency unknown: no response curve in V1.
      evidence:
        - baseline P95 latency: 1.2 ms (basis: aligned demand sample (screening indicator))
        - baseline maximum latency: 1.4 ms (basis: aligned demand sample)
        - workload latency target: 2 ms (basis: synthetic workload profile)
      calculation: baseline P95 1.2 ms vs target 2 ms; baseline max 1.4 ms shown alongside.
      implication: No baseline latency concern is indicated, but this says nothing about latency after the proposed workload is added.
      next investigation: Establish post-addition latency with a response model or measurements; V1 cannot.
      confidence: insufficient — Post-addition latency is an unknown in V1 by design.
      assumptions:
        - Baseline P95 is a screening indicator only; the maximum is shown alongside.
        - Post-addition latency unknown: no response curve in V1.
    Finding R-LAT-1: Baseline maximum latency is reported alongside P95 as context.
      evidence:
        - baseline maximum latency: 1.4 ms (basis: aligned demand sample)
        - workload latency target: 2 ms (basis: synthetic workload profile)
      calculation: baseline max 1.4 ms vs target 2 ms; the max is context, not the screening statistic.
      implication: Single-interval maxima can exceed the target even when P95 does not; both are baseline evidence only.
      next investigation: Review the distribution of minute latencies in the M2 weekly statistics.
      confidence: high — Reported value from supplied evidence; no inference made.
      assumptions:
        - Latency evidence is synthetic baseline data for the existing environment only.
Dimension protection: modeled-ready
  Check protection: modeled-ready
    headroom: n/a
    % of operating budget: n/a   % of limit: n/a
    Finding R-PRO-1: All declared workload protection requirements are satisfied by the infrastructure capabilities.
      evidence:
        - minimum tolerated drive failures required: 1 count (basis: workload protection requirement)
        - tolerated drive failures: 1 count (basis: synthetic infrastructure profile)
        - snapshots required: true flag (basis: workload protection requirement)
        - snapshots capability: true flag (basis: synthetic infrastructure profile)
        - encryptionAtRest required: true flag (basis: workload protection requirement)
        - encryptionAtRest capability: true flag (basis: synthetic infrastructure profile)
        - replication required: none mode (basis: workload protection requirement)
        - replication capability: unknown mode (basis: synthetic infrastructure profile; missing: replication capability not modeled)
      calculation: Capability matching over the fixed V1 vocabulary: toleratedDriveFailures: required 1 vs available 1 → modeled-ready; snapshots: required true vs available true → modeled-ready; encryptionAtRest: required true vs available true → modeled-ready; replication: required none vs available unknown → modeled-ready.
      implication: Declared protection capabilities meet the workload requirements within the V1 vocabulary.
      next investigation: Confirm capabilities on the real array; vocabulary coverage is selected capabilities only.
      confidence: moderate — Declared capability matching only; not a complete availability assurance.
      assumptions:
        - The V1 capability vocabulary covers selected capabilities, not complete availability assurance.
        - Replication is not equated with backup; availability is not inferred from a single feature.
Dimension growth: modeled-ready
  Check growth: modeled-ready
    headroom: 47.6 TiB
    % of operating budget: 77.5%   % of limit: 62.0%
    Finding R-GRO-1: Projected capacity at the 1-year horizon is within the capacity operating budget.
      evidence:
        - existing used capacity: 131941395333120 bytes (basis: aligned demand sample)
        - existing annual growth fraction: 0.15 fraction (basis: synthetic infrastructure profile)
        - proposed workload capacity: 26388279066624 bytes (basis: synthetic workload profile)
        - proposed annual growth fraction: 0.1 fraction (basis: synthetic workload profile)
        - planning horizon: 1 years (basis: assessment option)
        - capacity operating budget: 233096465088512 bytes (basis: 0.8 × usable capacity)
      calculation: projected = 120 TiB × (1 + 0.15)^1 + 24 TiB × (1 + 0.1)^1 = 164.4 TiB vs 212 TiB budget; headroom 47.6 TiB.
      implication: The modeled environment retains capacity headroom at the 1-year planning horizon.
      next investigation: Validate the declared growth fractions against observed consumption trends; compound growth dominates at longer horizons.
      confidence: high — Deterministic compound-growth arithmetic on declared synthetic inputs; growth rates themselves are assumptions.
      assumptions:
        - Annual growth fractions are synthetic assumptions, not observed trends.
        - Horizon is 1 year(s); horizon 0 equals the current-capacity check.
```

#### vm-weekday-burst — demand 1.5×, horizon 3y

```
Synthetic data. Educational demonstration; not vendor sizing or production configuration guidance.
Overall: modeled-constraint
Ruleset: 1.0.0-m1   Budget fraction: 0.8
Infrastructure: INF-A   Workload: WL-VM   Sample: vm-weekday-burst
Options: demand multiplier 1.5x, horizon 3 year(s)
Dimension capacity: modeled-ready
  Check capacity: modeled-ready
    headroom: 68 TiB
    % of operating budget: 67.9%   % of limit: 54.3%
    Finding R-CAP-1: Combined used plus proposed capacity is within the capacity operating budget.
      evidence:
        - existing used capacity: 131941395333120 bytes (basis: aligned demand sample)
        - proposed workload capacity: 26388279066624 bytes (basis: synthetic workload profile)
        - capacity operating budget: 233096465088512 bytes (basis: 0.8 × usable capacity)
        - usable capacity limit: 291370581360640 bytes (basis: synthetic infrastructure profile)
      calculation: 120 TiB used + 24 TiB proposed = 144 TiB combined vs 212 TiB budget (0.8 × 265 TiB usable); headroom 68 TiB.
      implication: Modeled capacity headroom exists for the proposed workload at the declared synthetic values.
      next investigation: Confirm real usable capacity and current consumption before relying on this result.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not measured on a real array.
      assumptions:
        - Usable capacity excludes spares and metadata reserves.
Dimension iops: modeled-ready
  Check iops.frontend: modeled-ready
    headroom: 22500 IOPS
    % of operating budget: 81.3%   % of limit: 65.0%
    Finding R-FE-1: Combined front-end IOPS demand is within the front-end operating budget.
      evidence:
        - existing front-end IOPS: 75000 IOPS (basis: aligned demand sample (reads + writes))
        - proposed front-end IOPS: 22500 IOPS (basis: aligned demand sample (reads + writes))
        - front-end IOPS operating budget: 120000 IOPS (basis: 0.8 × sustainable front-end IOPS limit)
        - sustainable front-end IOPS limit: 150000 IOPS (basis: synthetic infrastructure profile)
      calculation: 75000 existing + 22500 proposed = 97500 IOPS vs 120000 budget; headroom 22500 IOPS.
      implication: Front-end logical IOPS headroom exists for the proposed workload.
      next investigation: Confirm the declared sustainable IOPS envelope and the aligned demand peak on a real source.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not measured on a real array.
      assumptions:
        - Existing and proposed demand are aligned to the same modeled interval.
  Check iops.backend: modeled-ready
    headroom: 35225 ops/s
    % of operating budget: 82.4%   % of limit: 65.9%
    Finding R-BE-1: Combined backend operation demand is within the backend operating budget.
      evidence:
        - existing backend reads: 81750 ops/s (basis: derived from existing logical demand)
        - existing backend writes: 45000 ops/s (basis: derived from existing logical demand)
        - background backend demand: 0 ops/s (basis: declared on the demand sample; added exactly once)
        - proposed backend reads: 24525 ops/s (basis: derived: proposed reads × (1 − hit) + writes × factor)
        - proposed backend writes: 13500 ops/s (basis: derived: proposed writes × factor)
        - backend operating budget: 200000 ops/s (basis: 0.8 × backend sustainable operation limit)
        - backend sustainable operation limit: 250000 ops/s (basis: synthetic infrastructure profile)
      calculation: existing 126750 ops/s + background 0 + proposed 38025 ops/s (reads 24525 + writes 13500; RAID 5 factor 2+2 per logical write) = 164775 ops/s vs 200000 ops/s budget; headroom 35225 ops/s.
      implication: Modeled backend load is within budget under the RAID 5 read-modify-write factor.
      next investigation: Validate cache-hit fraction and write policy on the real system before relying on the estimate.
      confidence: high — Arithmetic on complete declared inputs within the explicitly bounded model; not a physical-array simulation.
      assumptions:
        - RAID 5 classic read-modify-write: each logical write costs 2 backend reads + 2 backend writes.
        - Write-back cache with no coalescing; sustained writes are not treated as zero.
        - Full-stripe writes, erasure coding, compression/dedup, metadata IO, flash write amplification, replication overhead, and rebuild load are outside this calculation.
Dimension throughput: modeled-ready
  Check throughput: modeled-ready
    headroom: 1105.08 MiB/s
    % of operating budget: 54.0%   % of limit: 43.2%
    Finding R-THR-1: Combined throughput demand is within the throughput operating budget.
      evidence:
        - existing throughput: 1044480000 bytes/second (basis: derived: existing IOPS × block sizes)
        - proposed throughput: 313344000 bytes/second (basis: derived: proposed IOPS × block sizes)
        - throughput operating budget: 2516582400 bytes/second (basis: 0.8 × sustainable throughput limit)
        - sustainable throughput limit: 3145728000 bytes/second (basis: synthetic infrastructure profile)
      calculation: existing 996.09 MiB/s (1020000 KiB/s) + proposed 298.83 MiB/s = 1294.92 MiB/s vs 2400 MiB/s budget; headroom 1105.08 MiB/s.
      implication: Modeled sustained bandwidth headroom exists for the proposed workload.
      next investigation: Verify sustained throughput limits and the read/write block-size mix; derived throughput depends on both.
      confidence: high — Derived directly from declared IOPS and block sizes; synthetic values, not a measured limit.
      assumptions:
        - Throughput is derived from IOPS × block size, never an independent input.
Dimension latency: needs-investigation
  Check latency: needs-investigation
    headroom: n/a
    % of operating budget: n/a   % of limit: n/a
    Finding R-LAT-1: Baseline P95 latency 1.2 ms is at or below the workload target 2 ms; post-addition latency unknown: no response curve in V1.
      evidence:
        - baseline P95 latency: 1.2 ms (basis: aligned demand sample (screening indicator))
        - baseline maximum latency: 1.4 ms (basis: aligned demand sample)
        - workload latency target: 2 ms (basis: synthetic workload profile)
      calculation: baseline P95 1.2 ms vs target 2 ms; baseline max 1.4 ms shown alongside.
      implication: No baseline latency concern is indicated, but this says nothing about latency after the proposed workload is added.
      next investigation: Establish post-addition latency with a response model or measurements; V1 cannot.
      confidence: insufficient — Post-addition latency is an unknown in V1 by design.
      assumptions:
        - Baseline P95 is a screening indicator only; the maximum is shown alongside.
        - Post-addition latency unknown: no response curve in V1.
    Finding R-LAT-1: Baseline maximum latency is reported alongside P95 as context.
      evidence:
        - baseline maximum latency: 1.4 ms (basis: aligned demand sample)
        - workload latency target: 2 ms (basis: synthetic workload profile)
      calculation: baseline max 1.4 ms vs target 2 ms; the max is context, not the screening statistic.
      implication: Single-interval maxima can exceed the target even when P95 does not; both are baseline evidence only.
      next investigation: Review the distribution of minute latencies in the M2 weekly statistics.
      confidence: high — Reported value from supplied evidence; no inference made.
      assumptions:
        - Latency evidence is synthetic baseline data for the existing environment only.
Dimension protection: modeled-ready
  Check protection: modeled-ready
    headroom: n/a
    % of operating budget: n/a   % of limit: n/a
    Finding R-PRO-1: All declared workload protection requirements are satisfied by the infrastructure capabilities.
      evidence:
        - minimum tolerated drive failures required: 1 count (basis: workload protection requirement)
        - tolerated drive failures: 1 count (basis: synthetic infrastructure profile)
        - snapshots required: true flag (basis: workload protection requirement)
        - snapshots capability: true flag (basis: synthetic infrastructure profile)
        - encryptionAtRest required: true flag (basis: workload protection requirement)
        - encryptionAtRest capability: true flag (basis: synthetic infrastructure profile)
        - replication required: none mode (basis: workload protection requirement)
        - replication capability: unknown mode (basis: synthetic infrastructure profile; missing: replication capability not modeled)
      calculation: Capability matching over the fixed V1 vocabulary: toleratedDriveFailures: required 1 vs available 1 → modeled-ready; snapshots: required true vs available true → modeled-ready; encryptionAtRest: required true vs available true → modeled-ready; replication: required none vs available unknown → modeled-ready.
      implication: Declared protection capabilities meet the workload requirements within the V1 vocabulary.
      next investigation: Confirm capabilities on the real array; vocabulary coverage is selected capabilities only.
      confidence: moderate — Declared capability matching only; not a complete availability assurance.
      assumptions:
        - The V1 capability vocabulary covers selected capabilities, not complete availability assurance.
        - Replication is not equated with backup; availability is not inferred from a single feature.
Dimension growth: modeled-constraint
  Check growth: modeled-constraint
    headroom: -2.45 TiB
    % of operating budget: 101.2%   % of limit: 80.9%
    Finding R-GRO-1: Projected capacity at the 3-year horizon exceeds the capacity operating budget.
      evidence:
        - existing used capacity: 131941395333120 bytes (basis: aligned demand sample)
        - existing annual growth fraction: 0.15 fraction (basis: synthetic infrastructure profile)
        - proposed workload capacity: 26388279066624 bytes (basis: synthetic workload profile)
        - proposed annual growth fraction: 0.1 fraction (basis: synthetic workload profile)
        - planning horizon: 3 years (basis: assessment option)
        - capacity operating budget: 233096465088512 bytes (basis: 0.8 × usable capacity)
      calculation: projected = 120 TiB × (1 + 0.15)^3 + 24 TiB × (1 + 0.1)^3 = 214.45 TiB vs 212 TiB budget; headroom -2.45 TiB.
      implication: Growth projection exceeds the capacity operating budget within 3 year(s); capacity expansion timing becomes a planning constraint.
      next investigation: Validate the declared growth fractions against observed consumption trends; compound growth dominates at longer horizons.
      confidence: high — Deterministic compound-growth arithmetic on declared synthetic inputs; growth rates themselves are assumptions.
      assumptions:
        - Annual growth fractions are synthetic assumptions, not observed trends.
        - Horizon is 3 year(s); horizon 0 equals the current-capacity check.
```

#### vm-weekday-burst — demand 2×, horizon 0y

```
Synthetic data. Educational demonstration; not vendor sizing or production configuration guidance.
Overall: needs-investigation
Ruleset: 1.0.0-m1   Budget fraction: 0.8
Infrastructure: INF-A   Workload: WL-VM   Sample: vm-weekday-burst
Options: demand multiplier 2x, horizon 0 year(s)
Dimension capacity: modeled-ready
  Check capacity: modeled-ready
    headroom: 68 TiB
    % of operating budget: 67.9%   % of limit: 54.3%
    Finding R-CAP-1: Combined used plus proposed capacity is within the capacity operating budget.
      evidence:
        - existing used capacity: 131941395333120 bytes (basis: aligned demand sample)
        - proposed workload capacity: 26388279066624 bytes (basis: synthetic workload profile)
        - capacity operating budget: 233096465088512 bytes (basis: 0.8 × usable capacity)
        - usable capacity limit: 291370581360640 bytes (basis: synthetic infrastructure profile)
      calculation: 120 TiB used + 24 TiB proposed = 144 TiB combined vs 212 TiB budget (0.8 × 265 TiB usable); headroom 68 TiB.
      implication: Modeled capacity headroom exists for the proposed workload at the declared synthetic values.
      next investigation: Confirm real usable capacity and current consumption before relying on this result.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not measured on a real array.
      assumptions:
        - Usable capacity excludes spares and metadata reserves.
Dimension iops: modeled-ready
  Check iops.frontend: modeled-ready
    headroom: 15000 IOPS
    % of operating budget: 87.5%   % of limit: 70.0%
    Finding R-FE-1: Combined front-end IOPS demand is within the front-end operating budget.
      evidence:
        - existing front-end IOPS: 75000 IOPS (basis: aligned demand sample (reads + writes))
        - proposed front-end IOPS: 30000 IOPS (basis: aligned demand sample (reads + writes))
        - front-end IOPS operating budget: 120000 IOPS (basis: 0.8 × sustainable front-end IOPS limit)
        - sustainable front-end IOPS limit: 150000 IOPS (basis: synthetic infrastructure profile)
      calculation: 75000 existing + 30000 proposed = 105000 IOPS vs 120000 budget; headroom 15000 IOPS.
      implication: Front-end logical IOPS headroom exists for the proposed workload.
      next investigation: Confirm the declared sustainable IOPS envelope and the aligned demand peak on a real source.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not measured on a real array.
      assumptions:
        - Existing and proposed demand are aligned to the same modeled interval.
  Check iops.backend: modeled-ready
    headroom: 22550 ops/s
    % of operating budget: 88.7%   % of limit: 71.0%
    Finding R-BE-1: Combined backend operation demand is within the backend operating budget.
      evidence:
        - existing backend reads: 81750 ops/s (basis: derived from existing logical demand)
        - existing backend writes: 45000 ops/s (basis: derived from existing logical demand)
        - background backend demand: 0 ops/s (basis: declared on the demand sample; added exactly once)
        - proposed backend reads: 32700 ops/s (basis: derived: proposed reads × (1 − hit) + writes × factor)
        - proposed backend writes: 18000 ops/s (basis: derived: proposed writes × factor)
        - backend operating budget: 200000 ops/s (basis: 0.8 × backend sustainable operation limit)
        - backend sustainable operation limit: 250000 ops/s (basis: synthetic infrastructure profile)
      calculation: existing 126750 ops/s + background 0 + proposed 50700 ops/s (reads 32700 + writes 18000; RAID 5 factor 2+2 per logical write) = 177450 ops/s vs 200000 ops/s budget; headroom 22550 ops/s.
      implication: Modeled backend load is within budget under the RAID 5 read-modify-write factor.
      next investigation: Validate cache-hit fraction and write policy on the real system before relying on the estimate.
      confidence: high — Arithmetic on complete declared inputs within the explicitly bounded model; not a physical-array simulation.
      assumptions:
        - RAID 5 classic read-modify-write: each logical write costs 2 backend reads + 2 backend writes.
        - Write-back cache with no coalescing; sustained writes are not treated as zero.
        - Full-stripe writes, erasure coding, compression/dedup, metadata IO, flash write amplification, replication overhead, and rebuild load are outside this calculation.
Dimension throughput: modeled-ready
  Check throughput: modeled-ready
    headroom: 1005.47 MiB/s
    % of operating budget: 58.1%   % of limit: 46.5%
    Finding R-THR-1: Combined throughput demand is within the throughput operating budget.
      evidence:
        - existing throughput: 1044480000 bytes/second (basis: derived: existing IOPS × block sizes)
        - proposed throughput: 417792000 bytes/second (basis: derived: proposed IOPS × block sizes)
        - throughput operating budget: 2516582400 bytes/second (basis: 0.8 × sustainable throughput limit)
        - sustainable throughput limit: 3145728000 bytes/second (basis: synthetic infrastructure profile)
      calculation: existing 996.09 MiB/s (1020000 KiB/s) + proposed 398.44 MiB/s = 1394.53 MiB/s vs 2400 MiB/s budget; headroom 1005.47 MiB/s.
      implication: Modeled sustained bandwidth headroom exists for the proposed workload.
      next investigation: Verify sustained throughput limits and the read/write block-size mix; derived throughput depends on both.
      confidence: high — Derived directly from declared IOPS and block sizes; synthetic values, not a measured limit.
      assumptions:
        - Throughput is derived from IOPS × block size, never an independent input.
Dimension latency: needs-investigation
  Check latency: needs-investigation
    headroom: n/a
    % of operating budget: n/a   % of limit: n/a
    Finding R-LAT-1: Baseline P95 latency 1.2 ms is at or below the workload target 2 ms; post-addition latency unknown: no response curve in V1.
      evidence:
        - baseline P95 latency: 1.2 ms (basis: aligned demand sample (screening indicator))
        - baseline maximum latency: 1.4 ms (basis: aligned demand sample)
        - workload latency target: 2 ms (basis: synthetic workload profile)
      calculation: baseline P95 1.2 ms vs target 2 ms; baseline max 1.4 ms shown alongside.
      implication: No baseline latency concern is indicated, but this says nothing about latency after the proposed workload is added.
      next investigation: Establish post-addition latency with a response model or measurements; V1 cannot.
      confidence: insufficient — Post-addition latency is an unknown in V1 by design.
      assumptions:
        - Baseline P95 is a screening indicator only; the maximum is shown alongside.
        - Post-addition latency unknown: no response curve in V1.
    Finding R-LAT-1: Baseline maximum latency is reported alongside P95 as context.
      evidence:
        - baseline maximum latency: 1.4 ms (basis: aligned demand sample)
        - workload latency target: 2 ms (basis: synthetic workload profile)
      calculation: baseline max 1.4 ms vs target 2 ms; the max is context, not the screening statistic.
      implication: Single-interval maxima can exceed the target even when P95 does not; both are baseline evidence only.
      next investigation: Review the distribution of minute latencies in the M2 weekly statistics.
      confidence: high — Reported value from supplied evidence; no inference made.
      assumptions:
        - Latency evidence is synthetic baseline data for the existing environment only.
Dimension protection: modeled-ready
  Check protection: modeled-ready
    headroom: n/a
    % of operating budget: n/a   % of limit: n/a
    Finding R-PRO-1: All declared workload protection requirements are satisfied by the infrastructure capabilities.
      evidence:
        - minimum tolerated drive failures required: 1 count (basis: workload protection requirement)
        - tolerated drive failures: 1 count (basis: synthetic infrastructure profile)
        - snapshots required: true flag (basis: workload protection requirement)
        - snapshots capability: true flag (basis: synthetic infrastructure profile)
        - encryptionAtRest required: true flag (basis: workload protection requirement)
        - encryptionAtRest capability: true flag (basis: synthetic infrastructure profile)
        - replication required: none mode (basis: workload protection requirement)
        - replication capability: unknown mode (basis: synthetic infrastructure profile; missing: replication capability not modeled)
      calculation: Capability matching over the fixed V1 vocabulary: toleratedDriveFailures: required 1 vs available 1 → modeled-ready; snapshots: required true vs available true → modeled-ready; encryptionAtRest: required true vs available true → modeled-ready; replication: required none vs available unknown → modeled-ready.
      implication: Declared protection capabilities meet the workload requirements within the V1 vocabulary.
      next investigation: Confirm capabilities on the real array; vocabulary coverage is selected capabilities only.
      confidence: moderate — Declared capability matching only; not a complete availability assurance.
      assumptions:
        - The V1 capability vocabulary covers selected capabilities, not complete availability assurance.
        - Replication is not equated with backup; availability is not inferred from a single feature.
Dimension growth: modeled-ready
  Check growth: modeled-ready
    headroom: 68 TiB
    % of operating budget: 67.9%   % of limit: 54.3%
    Finding R-GRO-1: Projected capacity at the 0-year horizon is within the capacity operating budget.
      evidence:
        - existing used capacity: 131941395333120 bytes (basis: aligned demand sample)
        - existing annual growth fraction: 0.15 fraction (basis: synthetic infrastructure profile)
        - proposed workload capacity: 26388279066624 bytes (basis: synthetic workload profile)
        - proposed annual growth fraction: 0.1 fraction (basis: synthetic workload profile)
        - planning horizon: 0 years (basis: assessment option)
        - capacity operating budget: 233096465088512 bytes (basis: 0.8 × usable capacity)
      calculation: projected = 120 TiB × (1 + 0.15)^0 + 24 TiB × (1 + 0.1)^0 = 144 TiB vs 212 TiB budget; headroom 68 TiB.
      implication: The modeled environment retains capacity headroom at the 0-year planning horizon.
      next investigation: Validate the declared growth fractions against observed consumption trends; compound growth dominates at longer horizons.
      confidence: high — Deterministic compound-growth arithmetic on declared synthetic inputs; growth rates themselves are assumptions.
      assumptions:
        - Annual growth fractions are synthetic assumptions, not observed trends.
        - Horizon is 0 year(s); horizon 0 equals the current-capacity check.
```

#### vm-weekday-burst — demand 2×, horizon 1y

```
Synthetic data. Educational demonstration; not vendor sizing or production configuration guidance.
Overall: needs-investigation
Ruleset: 1.0.0-m1   Budget fraction: 0.8
Infrastructure: INF-A   Workload: WL-VM   Sample: vm-weekday-burst
Options: demand multiplier 2x, horizon 1 year(s)
Dimension capacity: modeled-ready
  Check capacity: modeled-ready
    headroom: 68 TiB
    % of operating budget: 67.9%   % of limit: 54.3%
    Finding R-CAP-1: Combined used plus proposed capacity is within the capacity operating budget.
      evidence:
        - existing used capacity: 131941395333120 bytes (basis: aligned demand sample)
        - proposed workload capacity: 26388279066624 bytes (basis: synthetic workload profile)
        - capacity operating budget: 233096465088512 bytes (basis: 0.8 × usable capacity)
        - usable capacity limit: 291370581360640 bytes (basis: synthetic infrastructure profile)
      calculation: 120 TiB used + 24 TiB proposed = 144 TiB combined vs 212 TiB budget (0.8 × 265 TiB usable); headroom 68 TiB.
      implication: Modeled capacity headroom exists for the proposed workload at the declared synthetic values.
      next investigation: Confirm real usable capacity and current consumption before relying on this result.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not measured on a real array.
      assumptions:
        - Usable capacity excludes spares and metadata reserves.
Dimension iops: modeled-ready
  Check iops.frontend: modeled-ready
    headroom: 15000 IOPS
    % of operating budget: 87.5%   % of limit: 70.0%
    Finding R-FE-1: Combined front-end IOPS demand is within the front-end operating budget.
      evidence:
        - existing front-end IOPS: 75000 IOPS (basis: aligned demand sample (reads + writes))
        - proposed front-end IOPS: 30000 IOPS (basis: aligned demand sample (reads + writes))
        - front-end IOPS operating budget: 120000 IOPS (basis: 0.8 × sustainable front-end IOPS limit)
        - sustainable front-end IOPS limit: 150000 IOPS (basis: synthetic infrastructure profile)
      calculation: 75000 existing + 30000 proposed = 105000 IOPS vs 120000 budget; headroom 15000 IOPS.
      implication: Front-end logical IOPS headroom exists for the proposed workload.
      next investigation: Confirm the declared sustainable IOPS envelope and the aligned demand peak on a real source.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not measured on a real array.
      assumptions:
        - Existing and proposed demand are aligned to the same modeled interval.
  Check iops.backend: modeled-ready
    headroom: 22550 ops/s
    % of operating budget: 88.7%   % of limit: 71.0%
    Finding R-BE-1: Combined backend operation demand is within the backend operating budget.
      evidence:
        - existing backend reads: 81750 ops/s (basis: derived from existing logical demand)
        - existing backend writes: 45000 ops/s (basis: derived from existing logical demand)
        - background backend demand: 0 ops/s (basis: declared on the demand sample; added exactly once)
        - proposed backend reads: 32700 ops/s (basis: derived: proposed reads × (1 − hit) + writes × factor)
        - proposed backend writes: 18000 ops/s (basis: derived: proposed writes × factor)
        - backend operating budget: 200000 ops/s (basis: 0.8 × backend sustainable operation limit)
        - backend sustainable operation limit: 250000 ops/s (basis: synthetic infrastructure profile)
      calculation: existing 126750 ops/s + background 0 + proposed 50700 ops/s (reads 32700 + writes 18000; RAID 5 factor 2+2 per logical write) = 177450 ops/s vs 200000 ops/s budget; headroom 22550 ops/s.
      implication: Modeled backend load is within budget under the RAID 5 read-modify-write factor.
      next investigation: Validate cache-hit fraction and write policy on the real system before relying on the estimate.
      confidence: high — Arithmetic on complete declared inputs within the explicitly bounded model; not a physical-array simulation.
      assumptions:
        - RAID 5 classic read-modify-write: each logical write costs 2 backend reads + 2 backend writes.
        - Write-back cache with no coalescing; sustained writes are not treated as zero.
        - Full-stripe writes, erasure coding, compression/dedup, metadata IO, flash write amplification, replication overhead, and rebuild load are outside this calculation.
Dimension throughput: modeled-ready
  Check throughput: modeled-ready
    headroom: 1005.47 MiB/s
    % of operating budget: 58.1%   % of limit: 46.5%
    Finding R-THR-1: Combined throughput demand is within the throughput operating budget.
      evidence:
        - existing throughput: 1044480000 bytes/second (basis: derived: existing IOPS × block sizes)
        - proposed throughput: 417792000 bytes/second (basis: derived: proposed IOPS × block sizes)
        - throughput operating budget: 2516582400 bytes/second (basis: 0.8 × sustainable throughput limit)
        - sustainable throughput limit: 3145728000 bytes/second (basis: synthetic infrastructure profile)
      calculation: existing 996.09 MiB/s (1020000 KiB/s) + proposed 398.44 MiB/s = 1394.53 MiB/s vs 2400 MiB/s budget; headroom 1005.47 MiB/s.
      implication: Modeled sustained bandwidth headroom exists for the proposed workload.
      next investigation: Verify sustained throughput limits and the read/write block-size mix; derived throughput depends on both.
      confidence: high — Derived directly from declared IOPS and block sizes; synthetic values, not a measured limit.
      assumptions:
        - Throughput is derived from IOPS × block size, never an independent input.
Dimension latency: needs-investigation
  Check latency: needs-investigation
    headroom: n/a
    % of operating budget: n/a   % of limit: n/a
    Finding R-LAT-1: Baseline P95 latency 1.2 ms is at or below the workload target 2 ms; post-addition latency unknown: no response curve in V1.
      evidence:
        - baseline P95 latency: 1.2 ms (basis: aligned demand sample (screening indicator))
        - baseline maximum latency: 1.4 ms (basis: aligned demand sample)
        - workload latency target: 2 ms (basis: synthetic workload profile)
      calculation: baseline P95 1.2 ms vs target 2 ms; baseline max 1.4 ms shown alongside.
      implication: No baseline latency concern is indicated, but this says nothing about latency after the proposed workload is added.
      next investigation: Establish post-addition latency with a response model or measurements; V1 cannot.
      confidence: insufficient — Post-addition latency is an unknown in V1 by design.
      assumptions:
        - Baseline P95 is a screening indicator only; the maximum is shown alongside.
        - Post-addition latency unknown: no response curve in V1.
    Finding R-LAT-1: Baseline maximum latency is reported alongside P95 as context.
      evidence:
        - baseline maximum latency: 1.4 ms (basis: aligned demand sample)
        - workload latency target: 2 ms (basis: synthetic workload profile)
      calculation: baseline max 1.4 ms vs target 2 ms; the max is context, not the screening statistic.
      implication: Single-interval maxima can exceed the target even when P95 does not; both are baseline evidence only.
      next investigation: Review the distribution of minute latencies in the M2 weekly statistics.
      confidence: high — Reported value from supplied evidence; no inference made.
      assumptions:
        - Latency evidence is synthetic baseline data for the existing environment only.
Dimension protection: modeled-ready
  Check protection: modeled-ready
    headroom: n/a
    % of operating budget: n/a   % of limit: n/a
    Finding R-PRO-1: All declared workload protection requirements are satisfied by the infrastructure capabilities.
      evidence:
        - minimum tolerated drive failures required: 1 count (basis: workload protection requirement)
        - tolerated drive failures: 1 count (basis: synthetic infrastructure profile)
        - snapshots required: true flag (basis: workload protection requirement)
        - snapshots capability: true flag (basis: synthetic infrastructure profile)
        - encryptionAtRest required: true flag (basis: workload protection requirement)
        - encryptionAtRest capability: true flag (basis: synthetic infrastructure profile)
        - replication required: none mode (basis: workload protection requirement)
        - replication capability: unknown mode (basis: synthetic infrastructure profile; missing: replication capability not modeled)
      calculation: Capability matching over the fixed V1 vocabulary: toleratedDriveFailures: required 1 vs available 1 → modeled-ready; snapshots: required true vs available true → modeled-ready; encryptionAtRest: required true vs available true → modeled-ready; replication: required none vs available unknown → modeled-ready.
      implication: Declared protection capabilities meet the workload requirements within the V1 vocabulary.
      next investigation: Confirm capabilities on the real array; vocabulary coverage is selected capabilities only.
      confidence: moderate — Declared capability matching only; not a complete availability assurance.
      assumptions:
        - The V1 capability vocabulary covers selected capabilities, not complete availability assurance.
        - Replication is not equated with backup; availability is not inferred from a single feature.
Dimension growth: modeled-ready
  Check growth: modeled-ready
    headroom: 47.6 TiB
    % of operating budget: 77.5%   % of limit: 62.0%
    Finding R-GRO-1: Projected capacity at the 1-year horizon is within the capacity operating budget.
      evidence:
        - existing used capacity: 131941395333120 bytes (basis: aligned demand sample)
        - existing annual growth fraction: 0.15 fraction (basis: synthetic infrastructure profile)
        - proposed workload capacity: 26388279066624 bytes (basis: synthetic workload profile)
        - proposed annual growth fraction: 0.1 fraction (basis: synthetic workload profile)
        - planning horizon: 1 years (basis: assessment option)
        - capacity operating budget: 233096465088512 bytes (basis: 0.8 × usable capacity)
      calculation: projected = 120 TiB × (1 + 0.15)^1 + 24 TiB × (1 + 0.1)^1 = 164.4 TiB vs 212 TiB budget; headroom 47.6 TiB.
      implication: The modeled environment retains capacity headroom at the 1-year planning horizon.
      next investigation: Validate the declared growth fractions against observed consumption trends; compound growth dominates at longer horizons.
      confidence: high — Deterministic compound-growth arithmetic on declared synthetic inputs; growth rates themselves are assumptions.
      assumptions:
        - Annual growth fractions are synthetic assumptions, not observed trends.
        - Horizon is 1 year(s); horizon 0 equals the current-capacity check.
```

#### vm-weekday-burst — demand 2×, horizon 3y

```
Synthetic data. Educational demonstration; not vendor sizing or production configuration guidance.
Overall: modeled-constraint
Ruleset: 1.0.0-m1   Budget fraction: 0.8
Infrastructure: INF-A   Workload: WL-VM   Sample: vm-weekday-burst
Options: demand multiplier 2x, horizon 3 year(s)
Dimension capacity: modeled-ready
  Check capacity: modeled-ready
    headroom: 68 TiB
    % of operating budget: 67.9%   % of limit: 54.3%
    Finding R-CAP-1: Combined used plus proposed capacity is within the capacity operating budget.
      evidence:
        - existing used capacity: 131941395333120 bytes (basis: aligned demand sample)
        - proposed workload capacity: 26388279066624 bytes (basis: synthetic workload profile)
        - capacity operating budget: 233096465088512 bytes (basis: 0.8 × usable capacity)
        - usable capacity limit: 291370581360640 bytes (basis: synthetic infrastructure profile)
      calculation: 120 TiB used + 24 TiB proposed = 144 TiB combined vs 212 TiB budget (0.8 × 265 TiB usable); headroom 68 TiB.
      implication: Modeled capacity headroom exists for the proposed workload at the declared synthetic values.
      next investigation: Confirm real usable capacity and current consumption before relying on this result.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not measured on a real array.
      assumptions:
        - Usable capacity excludes spares and metadata reserves.
Dimension iops: modeled-ready
  Check iops.frontend: modeled-ready
    headroom: 15000 IOPS
    % of operating budget: 87.5%   % of limit: 70.0%
    Finding R-FE-1: Combined front-end IOPS demand is within the front-end operating budget.
      evidence:
        - existing front-end IOPS: 75000 IOPS (basis: aligned demand sample (reads + writes))
        - proposed front-end IOPS: 30000 IOPS (basis: aligned demand sample (reads + writes))
        - front-end IOPS operating budget: 120000 IOPS (basis: 0.8 × sustainable front-end IOPS limit)
        - sustainable front-end IOPS limit: 150000 IOPS (basis: synthetic infrastructure profile)
      calculation: 75000 existing + 30000 proposed = 105000 IOPS vs 120000 budget; headroom 15000 IOPS.
      implication: Front-end logical IOPS headroom exists for the proposed workload.
      next investigation: Confirm the declared sustainable IOPS envelope and the aligned demand peak on a real source.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not measured on a real array.
      assumptions:
        - Existing and proposed demand are aligned to the same modeled interval.
  Check iops.backend: modeled-ready
    headroom: 22550 ops/s
    % of operating budget: 88.7%   % of limit: 71.0%
    Finding R-BE-1: Combined backend operation demand is within the backend operating budget.
      evidence:
        - existing backend reads: 81750 ops/s (basis: derived from existing logical demand)
        - existing backend writes: 45000 ops/s (basis: derived from existing logical demand)
        - background backend demand: 0 ops/s (basis: declared on the demand sample; added exactly once)
        - proposed backend reads: 32700 ops/s (basis: derived: proposed reads × (1 − hit) + writes × factor)
        - proposed backend writes: 18000 ops/s (basis: derived: proposed writes × factor)
        - backend operating budget: 200000 ops/s (basis: 0.8 × backend sustainable operation limit)
        - backend sustainable operation limit: 250000 ops/s (basis: synthetic infrastructure profile)
      calculation: existing 126750 ops/s + background 0 + proposed 50700 ops/s (reads 32700 + writes 18000; RAID 5 factor 2+2 per logical write) = 177450 ops/s vs 200000 ops/s budget; headroom 22550 ops/s.
      implication: Modeled backend load is within budget under the RAID 5 read-modify-write factor.
      next investigation: Validate cache-hit fraction and write policy on the real system before relying on the estimate.
      confidence: high — Arithmetic on complete declared inputs within the explicitly bounded model; not a physical-array simulation.
      assumptions:
        - RAID 5 classic read-modify-write: each logical write costs 2 backend reads + 2 backend writes.
        - Write-back cache with no coalescing; sustained writes are not treated as zero.
        - Full-stripe writes, erasure coding, compression/dedup, metadata IO, flash write amplification, replication overhead, and rebuild load are outside this calculation.
Dimension throughput: modeled-ready
  Check throughput: modeled-ready
    headroom: 1005.47 MiB/s
    % of operating budget: 58.1%   % of limit: 46.5%
    Finding R-THR-1: Combined throughput demand is within the throughput operating budget.
      evidence:
        - existing throughput: 1044480000 bytes/second (basis: derived: existing IOPS × block sizes)
        - proposed throughput: 417792000 bytes/second (basis: derived: proposed IOPS × block sizes)
        - throughput operating budget: 2516582400 bytes/second (basis: 0.8 × sustainable throughput limit)
        - sustainable throughput limit: 3145728000 bytes/second (basis: synthetic infrastructure profile)
      calculation: existing 996.09 MiB/s (1020000 KiB/s) + proposed 398.44 MiB/s = 1394.53 MiB/s vs 2400 MiB/s budget; headroom 1005.47 MiB/s.
      implication: Modeled sustained bandwidth headroom exists for the proposed workload.
      next investigation: Verify sustained throughput limits and the read/write block-size mix; derived throughput depends on both.
      confidence: high — Derived directly from declared IOPS and block sizes; synthetic values, not a measured limit.
      assumptions:
        - Throughput is derived from IOPS × block size, never an independent input.
Dimension latency: needs-investigation
  Check latency: needs-investigation
    headroom: n/a
    % of operating budget: n/a   % of limit: n/a
    Finding R-LAT-1: Baseline P95 latency 1.2 ms is at or below the workload target 2 ms; post-addition latency unknown: no response curve in V1.
      evidence:
        - baseline P95 latency: 1.2 ms (basis: aligned demand sample (screening indicator))
        - baseline maximum latency: 1.4 ms (basis: aligned demand sample)
        - workload latency target: 2 ms (basis: synthetic workload profile)
      calculation: baseline P95 1.2 ms vs target 2 ms; baseline max 1.4 ms shown alongside.
      implication: No baseline latency concern is indicated, but this says nothing about latency after the proposed workload is added.
      next investigation: Establish post-addition latency with a response model or measurements; V1 cannot.
      confidence: insufficient — Post-addition latency is an unknown in V1 by design.
      assumptions:
        - Baseline P95 is a screening indicator only; the maximum is shown alongside.
        - Post-addition latency unknown: no response curve in V1.
    Finding R-LAT-1: Baseline maximum latency is reported alongside P95 as context.
      evidence:
        - baseline maximum latency: 1.4 ms (basis: aligned demand sample)
        - workload latency target: 2 ms (basis: synthetic workload profile)
      calculation: baseline max 1.4 ms vs target 2 ms; the max is context, not the screening statistic.
      implication: Single-interval maxima can exceed the target even when P95 does not; both are baseline evidence only.
      next investigation: Review the distribution of minute latencies in the M2 weekly statistics.
      confidence: high — Reported value from supplied evidence; no inference made.
      assumptions:
        - Latency evidence is synthetic baseline data for the existing environment only.
Dimension protection: modeled-ready
  Check protection: modeled-ready
    headroom: n/a
    % of operating budget: n/a   % of limit: n/a
    Finding R-PRO-1: All declared workload protection requirements are satisfied by the infrastructure capabilities.
      evidence:
        - minimum tolerated drive failures required: 1 count (basis: workload protection requirement)
        - tolerated drive failures: 1 count (basis: synthetic infrastructure profile)
        - snapshots required: true flag (basis: workload protection requirement)
        - snapshots capability: true flag (basis: synthetic infrastructure profile)
        - encryptionAtRest required: true flag (basis: workload protection requirement)
        - encryptionAtRest capability: true flag (basis: synthetic infrastructure profile)
        - replication required: none mode (basis: workload protection requirement)
        - replication capability: unknown mode (basis: synthetic infrastructure profile; missing: replication capability not modeled)
      calculation: Capability matching over the fixed V1 vocabulary: toleratedDriveFailures: required 1 vs available 1 → modeled-ready; snapshots: required true vs available true → modeled-ready; encryptionAtRest: required true vs available true → modeled-ready; replication: required none vs available unknown → modeled-ready.
      implication: Declared protection capabilities meet the workload requirements within the V1 vocabulary.
      next investigation: Confirm capabilities on the real array; vocabulary coverage is selected capabilities only.
      confidence: moderate — Declared capability matching only; not a complete availability assurance.
      assumptions:
        - The V1 capability vocabulary covers selected capabilities, not complete availability assurance.
        - Replication is not equated with backup; availability is not inferred from a single feature.
Dimension growth: modeled-constraint
  Check growth: modeled-constraint
    headroom: -2.45 TiB
    % of operating budget: 101.2%   % of limit: 80.9%
    Finding R-GRO-1: Projected capacity at the 3-year horizon exceeds the capacity operating budget.
      evidence:
        - existing used capacity: 131941395333120 bytes (basis: aligned demand sample)
        - existing annual growth fraction: 0.15 fraction (basis: synthetic infrastructure profile)
        - proposed workload capacity: 26388279066624 bytes (basis: synthetic workload profile)
        - proposed annual growth fraction: 0.1 fraction (basis: synthetic workload profile)
        - planning horizon: 3 years (basis: assessment option)
        - capacity operating budget: 233096465088512 bytes (basis: 0.8 × usable capacity)
      calculation: projected = 120 TiB × (1 + 0.15)^3 + 24 TiB × (1 + 0.1)^3 = 214.45 TiB vs 212 TiB budget; headroom -2.45 TiB.
      implication: Growth projection exceeds the capacity operating budget within 3 year(s); capacity expansion timing becomes a planning constraint.
      next investigation: Validate the declared growth fractions against observed consumption trends; compound growth dominates at longer horizons.
      confidence: high — Deterministic compound-growth arithmetic on declared synthetic inputs; growth rates themselves are assumptions.
      assumptions:
        - Annual growth fractions are synthetic assumptions, not observed trends.
        - Horizon is 3 year(s); horizon 0 equals the current-capacity check.
```


## INF-B × WL-VM

### vm-weekday-quiet

```
Synthetic data. Educational demonstration; not vendor sizing or production configuration guidance.
Overall: needs-investigation
Ruleset: 1.0.0-m1   Budget fraction: 0.8
Infrastructure: INF-B   Workload: WL-VM   Sample: vm-weekday-quiet
Options: demand multiplier 1x, horizon 1 year(s)
Dimension capacity: modeled-ready
  Check capacity: modeled-ready
    headroom: 25.6 TiB
    % of operating budget: 84.9%   % of limit: 67.9%
    Finding R-CAP-1: Combined used plus proposed capacity is within the capacity operating budget.
      evidence:
        - existing used capacity: 131941395333120 bytes (basis: aligned demand sample)
        - proposed workload capacity: 26388279066624 bytes (basis: synthetic workload profile)
        - capacity operating budget: 186477172070809.62 bytes (basis: 0.8 × usable capacity)
        - usable capacity limit: 233096465088512 bytes (basis: synthetic infrastructure profile)
      calculation: 120 TiB used + 24 TiB proposed = 144 TiB combined vs 169.6 TiB budget (0.8 × 212 TiB usable); headroom 25.6 TiB.
      implication: Modeled capacity headroom exists for the proposed workload at the declared synthetic values.
      next investigation: Confirm real usable capacity and current consumption before relying on this result.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not measured on a real array.
      assumptions:
        - Usable capacity excludes spares and metadata reserves.
Dimension iops: modeled-ready
  Check iops.frontend: modeled-ready
    headroom: 96000 IOPS
    % of operating budget: 20.0%   % of limit: 16.0%
    Finding R-FE-1: Combined front-end IOPS demand is within the front-end operating budget.
      evidence:
        - existing front-end IOPS: 20000 IOPS (basis: aligned demand sample (reads + writes))
        - proposed front-end IOPS: 4000 IOPS (basis: aligned demand sample (reads + writes))
        - front-end IOPS operating budget: 120000 IOPS (basis: 0.8 × sustainable front-end IOPS limit)
        - sustainable front-end IOPS limit: 150000 IOPS (basis: synthetic infrastructure profile)
      calculation: 20000 existing + 4000 proposed = 24000 IOPS vs 120000 budget; headroom 96000 IOPS.
      implication: Front-end logical IOPS headroom exists for the proposed workload.
      next investigation: Confirm the declared sustainable IOPS envelope and the aligned demand peak on a real source.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not measured on a real array.
      assumptions:
        - Existing and proposed demand are aligned to the same modeled interval.
  Check iops.backend: modeled-ready
    headroom: 145040 ops/s
    % of operating budget: 27.5%   % of limit: 22.0%
    Finding R-BE-1: Combined backend operation demand is within the backend operating budget.
      evidence:
        - existing backend reads: 27800 ops/s (basis: derived from existing logical demand)
        - existing backend writes: 18000 ops/s (basis: derived from existing logical demand)
        - background backend demand: 0 ops/s (basis: declared on the demand sample; added exactly once)
        - proposed backend reads: 5560 ops/s (basis: derived: proposed reads × (1 − hit) + writes × factor)
        - proposed backend writes: 3600 ops/s (basis: derived: proposed writes × factor)
        - backend operating budget: 200000 ops/s (basis: 0.8 × backend sustainable operation limit)
        - backend sustainable operation limit: 250000 ops/s (basis: synthetic infrastructure profile)
      calculation: existing 45800 ops/s + background 0 + proposed 9160 ops/s (reads 5560 + writes 3600; RAID 6 factor 3+3 per logical write) = 54960 ops/s vs 200000 ops/s budget; headroom 145040 ops/s.
      implication: Modeled backend load is within budget under the RAID 6 read-modify-write factor.
      next investigation: Validate cache-hit fraction and write policy on the real system before relying on the estimate.
      confidence: high — Arithmetic on complete declared inputs within the explicitly bounded model; not a physical-array simulation.
      assumptions:
        - RAID 6 classic read-modify-write: each logical write costs 3 backend reads + 3 backend writes.
        - Write-back cache with no coalescing; sustained writes are not treated as zero.
        - Full-stripe writes, erasure coding, compression/dedup, metadata IO, flash write amplification, replication overhead, and rebuild load are outside this calculation.
Dimension throughput: modeled-ready
  Check throughput: modeled-ready
    headroom: 2081.25 MiB/s
    % of operating budget: 13.3%   % of limit: 10.6%
    Finding R-THR-1: Combined throughput demand is within the throughput operating budget.
      evidence:
        - existing throughput: 278528000 bytes/second (basis: derived: existing IOPS × block sizes)
        - proposed throughput: 55705600 bytes/second (basis: derived: proposed IOPS × block sizes)
        - throughput operating budget: 2516582400 bytes/second (basis: 0.8 × sustainable throughput limit)
        - sustainable throughput limit: 3145728000 bytes/second (basis: synthetic infrastructure profile)
      calculation: existing 265.63 MiB/s (272000 KiB/s) + proposed 53.13 MiB/s = 318.75 MiB/s vs 2400 MiB/s budget; headroom 2081.25 MiB/s.
      implication: Modeled sustained bandwidth headroom exists for the proposed workload.
      next investigation: Verify sustained throughput limits and the read/write block-size mix; derived throughput depends on both.
      confidence: high — Derived directly from declared IOPS and block sizes; synthetic values, not a measured limit.
      assumptions:
        - Throughput is derived from IOPS × block size, never an independent input.
Dimension latency: needs-investigation
  Check latency: needs-investigation
    headroom: n/a
    % of operating budget: n/a   % of limit: n/a
    Finding R-LAT-1: Baseline P95 latency 1.2 ms is at or below the workload target 2 ms; post-addition latency unknown: no response curve in V1.
      evidence:
        - baseline P95 latency: 1.2 ms (basis: aligned demand sample (screening indicator))
        - baseline maximum latency: 1.4 ms (basis: aligned demand sample)
        - workload latency target: 2 ms (basis: synthetic workload profile)
      calculation: baseline P95 1.2 ms vs target 2 ms; baseline max 1.4 ms shown alongside.
      implication: No baseline latency concern is indicated, but this says nothing about latency after the proposed workload is added.
      next investigation: Establish post-addition latency with a response model or measurements; V1 cannot.
      confidence: insufficient — Post-addition latency is an unknown in V1 by design.
      assumptions:
        - Baseline P95 is a screening indicator only; the maximum is shown alongside.
        - Post-addition latency unknown: no response curve in V1.
    Finding R-LAT-1: Baseline maximum latency is reported alongside P95 as context.
      evidence:
        - baseline maximum latency: 1.4 ms (basis: aligned demand sample)
        - workload latency target: 2 ms (basis: synthetic workload profile)
      calculation: baseline max 1.4 ms vs target 2 ms; the max is context, not the screening statistic.
      implication: Single-interval maxima can exceed the target even when P95 does not; both are baseline evidence only.
      next investigation: Review the distribution of minute latencies in the M2 weekly statistics.
      confidence: high — Reported value from supplied evidence; no inference made.
      assumptions:
        - Latency evidence is synthetic baseline data for the existing environment only.
Dimension protection: modeled-ready
  Check protection: modeled-ready
    headroom: n/a
    % of operating budget: n/a   % of limit: n/a
    Finding R-PRO-1: All declared workload protection requirements are satisfied by the infrastructure capabilities.
      evidence:
        - minimum tolerated drive failures required: 1 count (basis: workload protection requirement)
        - tolerated drive failures: 2 count (basis: synthetic infrastructure profile)
        - snapshots required: true flag (basis: workload protection requirement)
        - snapshots capability: true flag (basis: synthetic infrastructure profile)
        - encryptionAtRest required: true flag (basis: workload protection requirement)
        - encryptionAtRest capability: true flag (basis: synthetic infrastructure profile)
        - replication required: none mode (basis: workload protection requirement)
        - replication capability: unknown mode (basis: synthetic infrastructure profile; missing: replication capability not modeled)
      calculation: Capability matching over the fixed V1 vocabulary: toleratedDriveFailures: required 1 vs available 2 → modeled-ready; snapshots: required true vs available true → modeled-ready; encryptionAtRest: required true vs available true → modeled-ready; replication: required none vs available unknown → modeled-ready.
      implication: Declared protection capabilities meet the workload requirements within the V1 vocabulary.
      next investigation: Confirm capabilities on the real array; vocabulary coverage is selected capabilities only.
      confidence: moderate — Declared capability matching only; not a complete availability assurance.
      assumptions:
        - The V1 capability vocabulary covers selected capabilities, not complete availability assurance.
        - Replication is not equated with backup; availability is not inferred from a single feature.
Dimension growth: modeled-ready
  Check growth: modeled-ready
    headroom: 5.2 TiB
    % of operating budget: 96.9%   % of limit: 77.5%
    Finding R-GRO-1: Projected capacity at the 1-year horizon is within the capacity operating budget.
      evidence:
        - existing used capacity: 131941395333120 bytes (basis: aligned demand sample)
        - existing annual growth fraction: 0.15 fraction (basis: synthetic infrastructure profile)
        - proposed workload capacity: 26388279066624 bytes (basis: synthetic workload profile)
        - proposed annual growth fraction: 0.1 fraction (basis: synthetic workload profile)
        - planning horizon: 1 years (basis: assessment option)
        - capacity operating budget: 186477172070809.62 bytes (basis: 0.8 × usable capacity)
      calculation: projected = 120 TiB × (1 + 0.15)^1 + 24 TiB × (1 + 0.1)^1 = 164.4 TiB vs 169.6 TiB budget; headroom 5.2 TiB.
      implication: The modeled environment retains capacity headroom at the 1-year planning horizon.
      next investigation: Validate the declared growth fractions against observed consumption trends; compound growth dominates at longer horizons.
      confidence: high — Deterministic compound-growth arithmetic on declared synthetic inputs; growth rates themselves are assumptions.
      assumptions:
        - Annual growth fractions are synthetic assumptions, not observed trends.
        - Horizon is 1 year(s); horizon 0 equals the current-capacity check.
```

### vm-weekday-business

```
Synthetic data. Educational demonstration; not vendor sizing or production configuration guidance.
Overall: needs-investigation
Ruleset: 1.0.0-m1   Budget fraction: 0.8
Infrastructure: INF-B   Workload: WL-VM   Sample: vm-weekday-business
Options: demand multiplier 1x, horizon 1 year(s)
Dimension capacity: modeled-ready
  Check capacity: modeled-ready
    headroom: 25.6 TiB
    % of operating budget: 84.9%   % of limit: 67.9%
    Finding R-CAP-1: Combined used plus proposed capacity is within the capacity operating budget.
      evidence:
        - existing used capacity: 131941395333120 bytes (basis: aligned demand sample)
        - proposed workload capacity: 26388279066624 bytes (basis: synthetic workload profile)
        - capacity operating budget: 186477172070809.62 bytes (basis: 0.8 × usable capacity)
        - usable capacity limit: 233096465088512 bytes (basis: synthetic infrastructure profile)
      calculation: 120 TiB used + 24 TiB proposed = 144 TiB combined vs 169.6 TiB budget (0.8 × 212 TiB usable); headroom 25.6 TiB.
      implication: Modeled capacity headroom exists for the proposed workload at the declared synthetic values.
      next investigation: Confirm real usable capacity and current consumption before relying on this result.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not measured on a real array.
      assumptions:
        - Usable capacity excludes spares and metadata reserves.
Dimension iops: modeled-ready
  Check iops.frontend: modeled-ready
    headroom: 55000 IOPS
    % of operating budget: 54.2%   % of limit: 43.3%
    Finding R-FE-1: Combined front-end IOPS demand is within the front-end operating budget.
      evidence:
        - existing front-end IOPS: 50000 IOPS (basis: aligned demand sample (reads + writes))
        - proposed front-end IOPS: 15000 IOPS (basis: aligned demand sample (reads + writes))
        - front-end IOPS operating budget: 120000 IOPS (basis: 0.8 × sustainable front-end IOPS limit)
        - sustainable front-end IOPS limit: 150000 IOPS (basis: synthetic infrastructure profile)
      calculation: 50000 existing + 15000 proposed = 65000 IOPS vs 120000 budget; headroom 55000 IOPS.
      implication: Front-end logical IOPS headroom exists for the proposed workload.
      next investigation: Confirm the declared sustainable IOPS envelope and the aligned demand peak on a real source.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not measured on a real array.
      assumptions:
        - Existing and proposed demand are aligned to the same modeled interval.
  Check iops.backend: modeled-ready
    headroom: 51150 ops/s
    % of operating budget: 74.4%   % of limit: 59.5%
    Finding R-BE-1: Combined backend operation demand is within the backend operating budget.
      evidence:
        - existing backend reads: 69500 ops/s (basis: derived from existing logical demand)
        - existing backend writes: 45000 ops/s (basis: derived from existing logical demand)
        - background backend demand: 0 ops/s (basis: declared on the demand sample; added exactly once)
        - proposed backend reads: 20850 ops/s (basis: derived: proposed reads × (1 − hit) + writes × factor)
        - proposed backend writes: 13500 ops/s (basis: derived: proposed writes × factor)
        - backend operating budget: 200000 ops/s (basis: 0.8 × backend sustainable operation limit)
        - backend sustainable operation limit: 250000 ops/s (basis: synthetic infrastructure profile)
      calculation: existing 114500 ops/s + background 0 + proposed 34350 ops/s (reads 20850 + writes 13500; RAID 6 factor 3+3 per logical write) = 148850 ops/s vs 200000 ops/s budget; headroom 51150 ops/s.
      implication: Modeled backend load is within budget under the RAID 6 read-modify-write factor.
      next investigation: Validate cache-hit fraction and write policy on the real system before relying on the estimate.
      confidence: high — Arithmetic on complete declared inputs within the explicitly bounded model; not a physical-array simulation.
      assumptions:
        - RAID 6 classic read-modify-write: each logical write costs 3 backend reads + 3 backend writes.
        - Write-back cache with no coalescing; sustained writes are not treated as zero.
        - Full-stripe writes, erasure coding, compression/dedup, metadata IO, flash write amplification, replication overhead, and rebuild load are outside this calculation.
Dimension throughput: modeled-ready
  Check throughput: modeled-ready
    headroom: 1536.72 MiB/s
    % of operating budget: 36.0%   % of limit: 28.8%
    Finding R-THR-1: Combined throughput demand is within the throughput operating budget.
      evidence:
        - existing throughput: 696320000 bytes/second (basis: derived: existing IOPS × block sizes)
        - proposed throughput: 208896000 bytes/second (basis: derived: proposed IOPS × block sizes)
        - throughput operating budget: 2516582400 bytes/second (basis: 0.8 × sustainable throughput limit)
        - sustainable throughput limit: 3145728000 bytes/second (basis: synthetic infrastructure profile)
      calculation: existing 664.06 MiB/s (680000 KiB/s) + proposed 199.22 MiB/s = 863.28 MiB/s vs 2400 MiB/s budget; headroom 1536.72 MiB/s.
      implication: Modeled sustained bandwidth headroom exists for the proposed workload.
      next investigation: Verify sustained throughput limits and the read/write block-size mix; derived throughput depends on both.
      confidence: high — Derived directly from declared IOPS and block sizes; synthetic values, not a measured limit.
      assumptions:
        - Throughput is derived from IOPS × block size, never an independent input.
Dimension latency: needs-investigation
  Check latency: needs-investigation
    headroom: n/a
    % of operating budget: n/a   % of limit: n/a
    Finding R-LAT-1: Baseline P95 latency 1.2 ms is at or below the workload target 2 ms; post-addition latency unknown: no response curve in V1.
      evidence:
        - baseline P95 latency: 1.2 ms (basis: aligned demand sample (screening indicator))
        - baseline maximum latency: 1.4 ms (basis: aligned demand sample)
        - workload latency target: 2 ms (basis: synthetic workload profile)
      calculation: baseline P95 1.2 ms vs target 2 ms; baseline max 1.4 ms shown alongside.
      implication: No baseline latency concern is indicated, but this says nothing about latency after the proposed workload is added.
      next investigation: Establish post-addition latency with a response model or measurements; V1 cannot.
      confidence: insufficient — Post-addition latency is an unknown in V1 by design.
      assumptions:
        - Baseline P95 is a screening indicator only; the maximum is shown alongside.
        - Post-addition latency unknown: no response curve in V1.
    Finding R-LAT-1: Baseline maximum latency is reported alongside P95 as context.
      evidence:
        - baseline maximum latency: 1.4 ms (basis: aligned demand sample)
        - workload latency target: 2 ms (basis: synthetic workload profile)
      calculation: baseline max 1.4 ms vs target 2 ms; the max is context, not the screening statistic.
      implication: Single-interval maxima can exceed the target even when P95 does not; both are baseline evidence only.
      next investigation: Review the distribution of minute latencies in the M2 weekly statistics.
      confidence: high — Reported value from supplied evidence; no inference made.
      assumptions:
        - Latency evidence is synthetic baseline data for the existing environment only.
Dimension protection: modeled-ready
  Check protection: modeled-ready
    headroom: n/a
    % of operating budget: n/a   % of limit: n/a
    Finding R-PRO-1: All declared workload protection requirements are satisfied by the infrastructure capabilities.
      evidence:
        - minimum tolerated drive failures required: 1 count (basis: workload protection requirement)
        - tolerated drive failures: 2 count (basis: synthetic infrastructure profile)
        - snapshots required: true flag (basis: workload protection requirement)
        - snapshots capability: true flag (basis: synthetic infrastructure profile)
        - encryptionAtRest required: true flag (basis: workload protection requirement)
        - encryptionAtRest capability: true flag (basis: synthetic infrastructure profile)
        - replication required: none mode (basis: workload protection requirement)
        - replication capability: unknown mode (basis: synthetic infrastructure profile; missing: replication capability not modeled)
      calculation: Capability matching over the fixed V1 vocabulary: toleratedDriveFailures: required 1 vs available 2 → modeled-ready; snapshots: required true vs available true → modeled-ready; encryptionAtRest: required true vs available true → modeled-ready; replication: required none vs available unknown → modeled-ready.
      implication: Declared protection capabilities meet the workload requirements within the V1 vocabulary.
      next investigation: Confirm capabilities on the real array; vocabulary coverage is selected capabilities only.
      confidence: moderate — Declared capability matching only; not a complete availability assurance.
      assumptions:
        - The V1 capability vocabulary covers selected capabilities, not complete availability assurance.
        - Replication is not equated with backup; availability is not inferred from a single feature.
Dimension growth: modeled-ready
  Check growth: modeled-ready
    headroom: 5.2 TiB
    % of operating budget: 96.9%   % of limit: 77.5%
    Finding R-GRO-1: Projected capacity at the 1-year horizon is within the capacity operating budget.
      evidence:
        - existing used capacity: 131941395333120 bytes (basis: aligned demand sample)
        - existing annual growth fraction: 0.15 fraction (basis: synthetic infrastructure profile)
        - proposed workload capacity: 26388279066624 bytes (basis: synthetic workload profile)
        - proposed annual growth fraction: 0.1 fraction (basis: synthetic workload profile)
        - planning horizon: 1 years (basis: assessment option)
        - capacity operating budget: 186477172070809.62 bytes (basis: 0.8 × usable capacity)
      calculation: projected = 120 TiB × (1 + 0.15)^1 + 24 TiB × (1 + 0.1)^1 = 164.4 TiB vs 169.6 TiB budget; headroom 5.2 TiB.
      implication: The modeled environment retains capacity headroom at the 1-year planning horizon.
      next investigation: Validate the declared growth fractions against observed consumption trends; compound growth dominates at longer horizons.
      confidence: high — Deterministic compound-growth arithmetic on declared synthetic inputs; growth rates themselves are assumptions.
      assumptions:
        - Annual growth fractions are synthetic assumptions, not observed trends.
        - Horizon is 1 year(s); horizon 0 equals the current-capacity check.
```

### vm-weekday-burst

```
Synthetic data. Educational demonstration; not vendor sizing or production configuration guidance.
Overall: modeled-constraint
Ruleset: 1.0.0-m1   Budget fraction: 0.8
Infrastructure: INF-B   Workload: WL-VM   Sample: vm-weekday-burst
Options: demand multiplier 1x, horizon 1 year(s)
Dimension capacity: modeled-ready
  Check capacity: modeled-ready
    headroom: 25.6 TiB
    % of operating budget: 84.9%   % of limit: 67.9%
    Finding R-CAP-1: Combined used plus proposed capacity is within the capacity operating budget.
      evidence:
        - existing used capacity: 131941395333120 bytes (basis: aligned demand sample)
        - proposed workload capacity: 26388279066624 bytes (basis: synthetic workload profile)
        - capacity operating budget: 186477172070809.62 bytes (basis: 0.8 × usable capacity)
        - usable capacity limit: 233096465088512 bytes (basis: synthetic infrastructure profile)
      calculation: 120 TiB used + 24 TiB proposed = 144 TiB combined vs 169.6 TiB budget (0.8 × 212 TiB usable); headroom 25.6 TiB.
      implication: Modeled capacity headroom exists for the proposed workload at the declared synthetic values.
      next investigation: Confirm real usable capacity and current consumption before relying on this result.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not measured on a real array.
      assumptions:
        - Usable capacity excludes spares and metadata reserves.
Dimension iops: modeled-constraint
  Check iops.frontend: modeled-ready
    headroom: 30000 IOPS
    % of operating budget: 75.0%   % of limit: 60.0%
    Finding R-FE-1: Combined front-end IOPS demand is within the front-end operating budget.
      evidence:
        - existing front-end IOPS: 75000 IOPS (basis: aligned demand sample (reads + writes))
        - proposed front-end IOPS: 15000 IOPS (basis: aligned demand sample (reads + writes))
        - front-end IOPS operating budget: 120000 IOPS (basis: 0.8 × sustainable front-end IOPS limit)
        - sustainable front-end IOPS limit: 150000 IOPS (basis: synthetic infrastructure profile)
      calculation: 75000 existing + 15000 proposed = 90000 IOPS vs 120000 budget; headroom 30000 IOPS.
      implication: Front-end logical IOPS headroom exists for the proposed workload.
      next investigation: Confirm the declared sustainable IOPS envelope and the aligned demand peak on a real source.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not measured on a real array.
      assumptions:
        - Existing and proposed demand are aligned to the same modeled interval.
  Check iops.backend: modeled-constraint
    headroom: -6100 ops/s
    % of operating budget: 103.0%   % of limit: 82.4%
    Finding R-BE-4: Combined backend operation demand exceeds the backend operating budget. Front-end headroom exists, but backend operations exceed the budget because of the RAID write factor.
      evidence:
        - existing backend reads: 104250 ops/s (basis: derived from existing logical demand)
        - existing backend writes: 67500 ops/s (basis: derived from existing logical demand)
        - background backend demand: 0 ops/s (basis: declared on the demand sample; added exactly once)
        - proposed backend reads: 20850 ops/s (basis: derived: proposed reads × (1 − hit) + writes × factor)
        - proposed backend writes: 13500 ops/s (basis: derived: proposed writes × factor)
        - backend operating budget: 200000 ops/s (basis: 0.8 × backend sustainable operation limit)
        - backend sustainable operation limit: 250000 ops/s (basis: synthetic infrastructure profile)
      calculation: existing 171750 ops/s + background 0 + proposed 34350 ops/s (reads 20850 + writes 13500; RAID 6 factor 3+3 per logical write) = 206100 ops/s vs 200000 ops/s budget; headroom -6100 ops/s.
      implication: The RAID 6 write factor pushes modeled backend operations over budget. Front-end headroom exists, but backend operations exceed the budget because of the RAID write factor.
      next investigation: Investigate whether the real array coalesces writes (outside the V1 model), or reduce proposed write demand.
      confidence: high — Arithmetic on complete declared inputs within the explicitly bounded model; not a physical-array simulation.
      assumptions:
        - RAID 6 classic read-modify-write: each logical write costs 3 backend reads + 3 backend writes.
        - Write-back cache with no coalescing; sustained writes are not treated as zero.
        - Full-stripe writes, erasure coding, compression/dedup, metadata IO, flash write amplification, replication overhead, and rebuild load are outside this calculation.
Dimension throughput: modeled-ready
  Check throughput: modeled-ready
    headroom: 1204.69 MiB/s
    % of operating budget: 49.8%   % of limit: 39.8%
    Finding R-THR-1: Combined throughput demand is within the throughput operating budget.
      evidence:
        - existing throughput: 1044480000 bytes/second (basis: derived: existing IOPS × block sizes)
        - proposed throughput: 208896000 bytes/second (basis: derived: proposed IOPS × block sizes)
        - throughput operating budget: 2516582400 bytes/second (basis: 0.8 × sustainable throughput limit)
        - sustainable throughput limit: 3145728000 bytes/second (basis: synthetic infrastructure profile)
      calculation: existing 996.09 MiB/s (1020000 KiB/s) + proposed 199.22 MiB/s = 1195.31 MiB/s vs 2400 MiB/s budget; headroom 1204.69 MiB/s.
      implication: Modeled sustained bandwidth headroom exists for the proposed workload.
      next investigation: Verify sustained throughput limits and the read/write block-size mix; derived throughput depends on both.
      confidence: high — Derived directly from declared IOPS and block sizes; synthetic values, not a measured limit.
      assumptions:
        - Throughput is derived from IOPS × block size, never an independent input.
Dimension latency: needs-investigation
  Check latency: needs-investigation
    headroom: n/a
    % of operating budget: n/a   % of limit: n/a
    Finding R-LAT-1: Baseline P95 latency 1.2 ms is at or below the workload target 2 ms; post-addition latency unknown: no response curve in V1.
      evidence:
        - baseline P95 latency: 1.2 ms (basis: aligned demand sample (screening indicator))
        - baseline maximum latency: 1.4 ms (basis: aligned demand sample)
        - workload latency target: 2 ms (basis: synthetic workload profile)
      calculation: baseline P95 1.2 ms vs target 2 ms; baseline max 1.4 ms shown alongside.
      implication: No baseline latency concern is indicated, but this says nothing about latency after the proposed workload is added.
      next investigation: Establish post-addition latency with a response model or measurements; V1 cannot.
      confidence: insufficient — Post-addition latency is an unknown in V1 by design.
      assumptions:
        - Baseline P95 is a screening indicator only; the maximum is shown alongside.
        - Post-addition latency unknown: no response curve in V1.
    Finding R-LAT-1: Baseline maximum latency is reported alongside P95 as context.
      evidence:
        - baseline maximum latency: 1.4 ms (basis: aligned demand sample)
        - workload latency target: 2 ms (basis: synthetic workload profile)
      calculation: baseline max 1.4 ms vs target 2 ms; the max is context, not the screening statistic.
      implication: Single-interval maxima can exceed the target even when P95 does not; both are baseline evidence only.
      next investigation: Review the distribution of minute latencies in the M2 weekly statistics.
      confidence: high — Reported value from supplied evidence; no inference made.
      assumptions:
        - Latency evidence is synthetic baseline data for the existing environment only.
Dimension protection: modeled-ready
  Check protection: modeled-ready
    headroom: n/a
    % of operating budget: n/a   % of limit: n/a
    Finding R-PRO-1: All declared workload protection requirements are satisfied by the infrastructure capabilities.
      evidence:
        - minimum tolerated drive failures required: 1 count (basis: workload protection requirement)
        - tolerated drive failures: 2 count (basis: synthetic infrastructure profile)
        - snapshots required: true flag (basis: workload protection requirement)
        - snapshots capability: true flag (basis: synthetic infrastructure profile)
        - encryptionAtRest required: true flag (basis: workload protection requirement)
        - encryptionAtRest capability: true flag (basis: synthetic infrastructure profile)
        - replication required: none mode (basis: workload protection requirement)
        - replication capability: unknown mode (basis: synthetic infrastructure profile; missing: replication capability not modeled)
      calculation: Capability matching over the fixed V1 vocabulary: toleratedDriveFailures: required 1 vs available 2 → modeled-ready; snapshots: required true vs available true → modeled-ready; encryptionAtRest: required true vs available true → modeled-ready; replication: required none vs available unknown → modeled-ready.
      implication: Declared protection capabilities meet the workload requirements within the V1 vocabulary.
      next investigation: Confirm capabilities on the real array; vocabulary coverage is selected capabilities only.
      confidence: moderate — Declared capability matching only; not a complete availability assurance.
      assumptions:
        - The V1 capability vocabulary covers selected capabilities, not complete availability assurance.
        - Replication is not equated with backup; availability is not inferred from a single feature.
Dimension growth: modeled-ready
  Check growth: modeled-ready
    headroom: 5.2 TiB
    % of operating budget: 96.9%   % of limit: 77.5%
    Finding R-GRO-1: Projected capacity at the 1-year horizon is within the capacity operating budget.
      evidence:
        - existing used capacity: 131941395333120 bytes (basis: aligned demand sample)
        - existing annual growth fraction: 0.15 fraction (basis: synthetic infrastructure profile)
        - proposed workload capacity: 26388279066624 bytes (basis: synthetic workload profile)
        - proposed annual growth fraction: 0.1 fraction (basis: synthetic workload profile)
        - planning horizon: 1 years (basis: assessment option)
        - capacity operating budget: 186477172070809.62 bytes (basis: 0.8 × usable capacity)
      calculation: projected = 120 TiB × (1 + 0.15)^1 + 24 TiB × (1 + 0.1)^1 = 164.4 TiB vs 169.6 TiB budget; headroom 5.2 TiB.
      implication: The modeled environment retains capacity headroom at the 1-year planning horizon.
      next investigation: Validate the declared growth fractions against observed consumption trends; compound growth dominates at longer horizons.
      confidence: high — Deterministic compound-growth arithmetic on declared synthetic inputs; growth rates themselves are assumptions.
      assumptions:
        - Annual growth fractions are synthetic assumptions, not observed trends.
        - Horizon is 1 year(s); horizon 0 equals the current-capacity check.
```

### vm-weekday-patch

```
Synthetic data. Educational demonstration; not vendor sizing or production configuration guidance.
Overall: needs-investigation
Ruleset: 1.0.0-m1   Budget fraction: 0.8
Infrastructure: INF-B   Workload: WL-VM   Sample: vm-weekday-patch
Options: demand multiplier 1x, horizon 1 year(s)
Dimension capacity: modeled-ready
  Check capacity: modeled-ready
    headroom: 25.6 TiB
    % of operating budget: 84.9%   % of limit: 67.9%
    Finding R-CAP-1: Combined used plus proposed capacity is within the capacity operating budget.
      evidence:
        - existing used capacity: 131941395333120 bytes (basis: aligned demand sample)
        - proposed workload capacity: 26388279066624 bytes (basis: synthetic workload profile)
        - capacity operating budget: 186477172070809.62 bytes (basis: 0.8 × usable capacity)
        - usable capacity limit: 233096465088512 bytes (basis: synthetic infrastructure profile)
      calculation: 120 TiB used + 24 TiB proposed = 144 TiB combined vs 169.6 TiB budget (0.8 × 212 TiB usable); headroom 25.6 TiB.
      implication: Modeled capacity headroom exists for the proposed workload at the declared synthetic values.
      next investigation: Confirm real usable capacity and current consumption before relying on this result.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not measured on a real array.
      assumptions:
        - Usable capacity excludes spares and metadata reserves.
Dimension iops: modeled-ready
  Check iops.frontend: modeled-ready
    headroom: 83000 IOPS
    % of operating budget: 30.8%   % of limit: 24.7%
    Finding R-FE-1: Combined front-end IOPS demand is within the front-end operating budget.
      evidence:
        - existing front-end IOPS: 25000 IOPS (basis: aligned demand sample (reads + writes))
        - proposed front-end IOPS: 12000 IOPS (basis: aligned demand sample (reads + writes))
        - front-end IOPS operating budget: 120000 IOPS (basis: 0.8 × sustainable front-end IOPS limit)
        - sustainable front-end IOPS limit: 150000 IOPS (basis: synthetic infrastructure profile)
      calculation: 25000 existing + 12000 proposed = 37000 IOPS vs 120000 budget; headroom 83000 IOPS.
      implication: Front-end logical IOPS headroom exists for the proposed workload.
      next investigation: Confirm the declared sustainable IOPS envelope and the aligned demand peak on a real source.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not measured on a real array.
      assumptions:
        - Existing and proposed demand are aligned to the same modeled interval.
  Check iops.backend: modeled-ready
    headroom: 102550 ops/s
    % of operating budget: 48.7%   % of limit: 39.0%
    Finding R-BE-1: Combined backend operation demand is within the backend operating budget.
      evidence:
        - existing backend reads: 34750 ops/s (basis: derived from existing logical demand)
        - existing backend writes: 22500 ops/s (basis: derived from existing logical demand)
        - background backend demand: 0 ops/s (basis: declared on the demand sample; added exactly once)
        - proposed backend reads: 22200 ops/s (basis: derived: proposed reads × (1 − hit) + writes × factor)
        - proposed backend writes: 18000 ops/s (basis: derived: proposed writes × factor)
        - backend operating budget: 200000 ops/s (basis: 0.8 × backend sustainable operation limit)
        - backend sustainable operation limit: 250000 ops/s (basis: synthetic infrastructure profile)
      calculation: existing 57250 ops/s + background 0 + proposed 40200 ops/s (reads 22200 + writes 18000; RAID 6 factor 3+3 per logical write) = 97450 ops/s vs 200000 ops/s budget; headroom 102550 ops/s.
      implication: Modeled backend load is within budget under the RAID 6 read-modify-write factor.
      next investigation: Validate cache-hit fraction and write policy on the real system before relying on the estimate.
      confidence: high — Arithmetic on complete declared inputs within the explicitly bounded model; not a physical-array simulation.
      assumptions:
        - RAID 6 classic read-modify-write: each logical write costs 3 backend reads + 3 backend writes.
        - Write-back cache with no coalescing; sustained writes are not treated as zero.
        - Full-stripe writes, erasure coding, compression/dedup, metadata IO, flash write amplification, replication overhead, and rebuild load are outside this calculation.
Dimension throughput: modeled-ready
  Check throughput: modeled-ready
    headroom: 1927.34 MiB/s
    % of operating budget: 19.7%   % of limit: 15.8%
    Finding R-THR-1: Combined throughput demand is within the throughput operating budget.
      evidence:
        - existing throughput: 348160000 bytes/second (basis: derived: existing IOPS × block sizes)
        - proposed throughput: 147456000 bytes/second (basis: derived: proposed IOPS × block sizes)
        - throughput operating budget: 2516582400 bytes/second (basis: 0.8 × sustainable throughput limit)
        - sustainable throughput limit: 3145728000 bytes/second (basis: synthetic infrastructure profile)
      calculation: existing 332.03 MiB/s (340000 KiB/s) + proposed 140.63 MiB/s = 472.66 MiB/s vs 2400 MiB/s budget; headroom 1927.34 MiB/s.
      implication: Modeled sustained bandwidth headroom exists for the proposed workload.
      next investigation: Verify sustained throughput limits and the read/write block-size mix; derived throughput depends on both.
      confidence: high — Derived directly from declared IOPS and block sizes; synthetic values, not a measured limit.
      assumptions:
        - Throughput is derived from IOPS × block size, never an independent input.
Dimension latency: needs-investigation
  Check latency: needs-investigation
    headroom: n/a
    % of operating budget: n/a   % of limit: n/a
    Finding R-LAT-1: Baseline P95 latency 1.2 ms is at or below the workload target 2 ms; post-addition latency unknown: no response curve in V1.
      evidence:
        - baseline P95 latency: 1.2 ms (basis: aligned demand sample (screening indicator))
        - baseline maximum latency: 1.4 ms (basis: aligned demand sample)
        - workload latency target: 2 ms (basis: synthetic workload profile)
      calculation: baseline P95 1.2 ms vs target 2 ms; baseline max 1.4 ms shown alongside.
      implication: No baseline latency concern is indicated, but this says nothing about latency after the proposed workload is added.
      next investigation: Establish post-addition latency with a response model or measurements; V1 cannot.
      confidence: insufficient — Post-addition latency is an unknown in V1 by design.
      assumptions:
        - Baseline P95 is a screening indicator only; the maximum is shown alongside.
        - Post-addition latency unknown: no response curve in V1.
    Finding R-LAT-1: Baseline maximum latency is reported alongside P95 as context.
      evidence:
        - baseline maximum latency: 1.4 ms (basis: aligned demand sample)
        - workload latency target: 2 ms (basis: synthetic workload profile)
      calculation: baseline max 1.4 ms vs target 2 ms; the max is context, not the screening statistic.
      implication: Single-interval maxima can exceed the target even when P95 does not; both are baseline evidence only.
      next investigation: Review the distribution of minute latencies in the M2 weekly statistics.
      confidence: high — Reported value from supplied evidence; no inference made.
      assumptions:
        - Latency evidence is synthetic baseline data for the existing environment only.
Dimension protection: modeled-ready
  Check protection: modeled-ready
    headroom: n/a
    % of operating budget: n/a   % of limit: n/a
    Finding R-PRO-1: All declared workload protection requirements are satisfied by the infrastructure capabilities.
      evidence:
        - minimum tolerated drive failures required: 1 count (basis: workload protection requirement)
        - tolerated drive failures: 2 count (basis: synthetic infrastructure profile)
        - snapshots required: true flag (basis: workload protection requirement)
        - snapshots capability: true flag (basis: synthetic infrastructure profile)
        - encryptionAtRest required: true flag (basis: workload protection requirement)
        - encryptionAtRest capability: true flag (basis: synthetic infrastructure profile)
        - replication required: none mode (basis: workload protection requirement)
        - replication capability: unknown mode (basis: synthetic infrastructure profile; missing: replication capability not modeled)
      calculation: Capability matching over the fixed V1 vocabulary: toleratedDriveFailures: required 1 vs available 2 → modeled-ready; snapshots: required true vs available true → modeled-ready; encryptionAtRest: required true vs available true → modeled-ready; replication: required none vs available unknown → modeled-ready.
      implication: Declared protection capabilities meet the workload requirements within the V1 vocabulary.
      next investigation: Confirm capabilities on the real array; vocabulary coverage is selected capabilities only.
      confidence: moderate — Declared capability matching only; not a complete availability assurance.
      assumptions:
        - The V1 capability vocabulary covers selected capabilities, not complete availability assurance.
        - Replication is not equated with backup; availability is not inferred from a single feature.
Dimension growth: modeled-ready
  Check growth: modeled-ready
    headroom: 5.2 TiB
    % of operating budget: 96.9%   % of limit: 77.5%
    Finding R-GRO-1: Projected capacity at the 1-year horizon is within the capacity operating budget.
      evidence:
        - existing used capacity: 131941395333120 bytes (basis: aligned demand sample)
        - existing annual growth fraction: 0.15 fraction (basis: synthetic infrastructure profile)
        - proposed workload capacity: 26388279066624 bytes (basis: synthetic workload profile)
        - proposed annual growth fraction: 0.1 fraction (basis: synthetic workload profile)
        - planning horizon: 1 years (basis: assessment option)
        - capacity operating budget: 186477172070809.62 bytes (basis: 0.8 × usable capacity)
      calculation: projected = 120 TiB × (1 + 0.15)^1 + 24 TiB × (1 + 0.1)^1 = 164.4 TiB vs 169.6 TiB budget; headroom 5.2 TiB.
      implication: The modeled environment retains capacity headroom at the 1-year planning horizon.
      next investigation: Validate the declared growth fractions against observed consumption trends; compound growth dominates at longer horizons.
      confidence: high — Deterministic compound-growth arithmetic on declared synthetic inputs; growth rates themselves are assumptions.
      assumptions:
        - Annual growth fractions are synthetic assumptions, not observed trends.
        - Horizon is 1 year(s); horizon 0 equals the current-capacity check.
```

### vm-weekday-batch

```
Synthetic data. Educational demonstration; not vendor sizing or production configuration guidance.
Overall: needs-investigation
Ruleset: 1.0.0-m1   Budget fraction: 0.8
Infrastructure: INF-B   Workload: WL-VM   Sample: vm-weekday-batch
Options: demand multiplier 1x, horizon 1 year(s)
Dimension capacity: modeled-ready
  Check capacity: modeled-ready
    headroom: 25.6 TiB
    % of operating budget: 84.9%   % of limit: 67.9%
    Finding R-CAP-1: Combined used plus proposed capacity is within the capacity operating budget.
      evidence:
        - existing used capacity: 131941395333120 bytes (basis: aligned demand sample)
        - proposed workload capacity: 26388279066624 bytes (basis: synthetic workload profile)
        - capacity operating budget: 186477172070809.62 bytes (basis: 0.8 × usable capacity)
        - usable capacity limit: 233096465088512 bytes (basis: synthetic infrastructure profile)
      calculation: 120 TiB used + 24 TiB proposed = 144 TiB combined vs 169.6 TiB budget (0.8 × 212 TiB usable); headroom 25.6 TiB.
      implication: Modeled capacity headroom exists for the proposed workload at the declared synthetic values.
      next investigation: Confirm real usable capacity and current consumption before relying on this result.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not measured on a real array.
      assumptions:
        - Usable capacity excludes spares and metadata reserves.
Dimension iops: modeled-ready
  Check iops.frontend: modeled-ready
    headroom: 76000 IOPS
    % of operating budget: 36.7%   % of limit: 29.3%
    Finding R-FE-1: Combined front-end IOPS demand is within the front-end operating budget.
      evidence:
        - existing front-end IOPS: 40000 IOPS (basis: aligned demand sample (reads + writes))
        - proposed front-end IOPS: 4000 IOPS (basis: aligned demand sample (reads + writes))
        - front-end IOPS operating budget: 120000 IOPS (basis: 0.8 × sustainable front-end IOPS limit)
        - sustainable front-end IOPS limit: 150000 IOPS (basis: synthetic infrastructure profile)
      calculation: 40000 existing + 4000 proposed = 44000 IOPS vs 120000 budget; headroom 76000 IOPS.
      implication: Front-end logical IOPS headroom exists for the proposed workload.
      next investigation: Confirm the declared sustainable IOPS envelope and the aligned demand peak on a real source.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not measured on a real array.
      assumptions:
        - Existing and proposed demand are aligned to the same modeled interval.
  Check iops.backend: modeled-ready
    headroom: 35640 ops/s
    % of operating budget: 82.2%   % of limit: 65.7%
    Finding R-BE-1: Combined backend operation demand is within the backend operating budget.
      evidence:
        - existing backend reads: 83200 ops/s (basis: derived from existing logical demand)
        - existing backend writes: 72000 ops/s (basis: derived from existing logical demand)
        - background backend demand: 0 ops/s (basis: declared on the demand sample; added exactly once)
        - proposed backend reads: 5560 ops/s (basis: derived: proposed reads × (1 − hit) + writes × factor)
        - proposed backend writes: 3600 ops/s (basis: derived: proposed writes × factor)
        - backend operating budget: 200000 ops/s (basis: 0.8 × backend sustainable operation limit)
        - backend sustainable operation limit: 250000 ops/s (basis: synthetic infrastructure profile)
      calculation: existing 155200 ops/s + background 0 + proposed 9160 ops/s (reads 5560 + writes 3600; RAID 6 factor 3+3 per logical write) = 164360 ops/s vs 200000 ops/s budget; headroom 35640 ops/s.
      implication: Modeled backend load is within budget under the RAID 6 read-modify-write factor.
      next investigation: Validate cache-hit fraction and write policy on the real system before relying on the estimate.
      confidence: high — Arithmetic on complete declared inputs within the explicitly bounded model; not a physical-array simulation.
      assumptions:
        - RAID 6 classic read-modify-write: each logical write costs 3 backend reads + 3 backend writes.
        - Write-back cache with no coalescing; sustained writes are not treated as zero.
        - Full-stripe writes, erasure coding, compression/dedup, metadata IO, flash write amplification, replication overhead, and rebuild load are outside this calculation.
Dimension throughput: modeled-ready
  Check throughput: modeled-ready
    headroom: 1909.38 MiB/s
    % of operating budget: 20.4%   % of limit: 16.4%
    Finding R-THR-1: Combined throughput demand is within the throughput operating budget.
      evidence:
        - existing throughput: 458752000 bytes/second (basis: derived: existing IOPS × block sizes)
        - proposed throughput: 55705600 bytes/second (basis: derived: proposed IOPS × block sizes)
        - throughput operating budget: 2516582400 bytes/second (basis: 0.8 × sustainable throughput limit)
        - sustainable throughput limit: 3145728000 bytes/second (basis: synthetic infrastructure profile)
      calculation: existing 437.5 MiB/s (448000 KiB/s) + proposed 53.13 MiB/s = 490.63 MiB/s vs 2400 MiB/s budget; headroom 1909.38 MiB/s.
      implication: Modeled sustained bandwidth headroom exists for the proposed workload.
      next investigation: Verify sustained throughput limits and the read/write block-size mix; derived throughput depends on both.
      confidence: high — Derived directly from declared IOPS and block sizes; synthetic values, not a measured limit.
      assumptions:
        - Throughput is derived from IOPS × block size, never an independent input.
Dimension latency: needs-investigation
  Check latency: needs-investigation
    headroom: n/a
    % of operating budget: n/a   % of limit: n/a
    Finding R-LAT-1: Baseline P95 latency 1.2 ms is at or below the workload target 2 ms; post-addition latency unknown: no response curve in V1.
      evidence:
        - baseline P95 latency: 1.2 ms (basis: aligned demand sample (screening indicator))
        - baseline maximum latency: 1.4 ms (basis: aligned demand sample)
        - workload latency target: 2 ms (basis: synthetic workload profile)
      calculation: baseline P95 1.2 ms vs target 2 ms; baseline max 1.4 ms shown alongside.
      implication: No baseline latency concern is indicated, but this says nothing about latency after the proposed workload is added.
      next investigation: Establish post-addition latency with a response model or measurements; V1 cannot.
      confidence: insufficient — Post-addition latency is an unknown in V1 by design.
      assumptions:
        - Baseline P95 is a screening indicator only; the maximum is shown alongside.
        - Post-addition latency unknown: no response curve in V1.
    Finding R-LAT-1: Baseline maximum latency is reported alongside P95 as context.
      evidence:
        - baseline maximum latency: 1.4 ms (basis: aligned demand sample)
        - workload latency target: 2 ms (basis: synthetic workload profile)
      calculation: baseline max 1.4 ms vs target 2 ms; the max is context, not the screening statistic.
      implication: Single-interval maxima can exceed the target even when P95 does not; both are baseline evidence only.
      next investigation: Review the distribution of minute latencies in the M2 weekly statistics.
      confidence: high — Reported value from supplied evidence; no inference made.
      assumptions:
        - Latency evidence is synthetic baseline data for the existing environment only.
Dimension protection: modeled-ready
  Check protection: modeled-ready
    headroom: n/a
    % of operating budget: n/a   % of limit: n/a
    Finding R-PRO-1: All declared workload protection requirements are satisfied by the infrastructure capabilities.
      evidence:
        - minimum tolerated drive failures required: 1 count (basis: workload protection requirement)
        - tolerated drive failures: 2 count (basis: synthetic infrastructure profile)
        - snapshots required: true flag (basis: workload protection requirement)
        - snapshots capability: true flag (basis: synthetic infrastructure profile)
        - encryptionAtRest required: true flag (basis: workload protection requirement)
        - encryptionAtRest capability: true flag (basis: synthetic infrastructure profile)
        - replication required: none mode (basis: workload protection requirement)
        - replication capability: unknown mode (basis: synthetic infrastructure profile; missing: replication capability not modeled)
      calculation: Capability matching over the fixed V1 vocabulary: toleratedDriveFailures: required 1 vs available 2 → modeled-ready; snapshots: required true vs available true → modeled-ready; encryptionAtRest: required true vs available true → modeled-ready; replication: required none vs available unknown → modeled-ready.
      implication: Declared protection capabilities meet the workload requirements within the V1 vocabulary.
      next investigation: Confirm capabilities on the real array; vocabulary coverage is selected capabilities only.
      confidence: moderate — Declared capability matching only; not a complete availability assurance.
      assumptions:
        - The V1 capability vocabulary covers selected capabilities, not complete availability assurance.
        - Replication is not equated with backup; availability is not inferred from a single feature.
Dimension growth: modeled-ready
  Check growth: modeled-ready
    headroom: 5.2 TiB
    % of operating budget: 96.9%   % of limit: 77.5%
    Finding R-GRO-1: Projected capacity at the 1-year horizon is within the capacity operating budget.
      evidence:
        - existing used capacity: 131941395333120 bytes (basis: aligned demand sample)
        - existing annual growth fraction: 0.15 fraction (basis: synthetic infrastructure profile)
        - proposed workload capacity: 26388279066624 bytes (basis: synthetic workload profile)
        - proposed annual growth fraction: 0.1 fraction (basis: synthetic workload profile)
        - planning horizon: 1 years (basis: assessment option)
        - capacity operating budget: 186477172070809.62 bytes (basis: 0.8 × usable capacity)
      calculation: projected = 120 TiB × (1 + 0.15)^1 + 24 TiB × (1 + 0.1)^1 = 164.4 TiB vs 169.6 TiB budget; headroom 5.2 TiB.
      implication: The modeled environment retains capacity headroom at the 1-year planning horizon.
      next investigation: Validate the declared growth fractions against observed consumption trends; compound growth dominates at longer horizons.
      confidence: high — Deterministic compound-growth arithmetic on declared synthetic inputs; growth rates themselves are assumptions.
      assumptions:
        - Annual growth fractions are synthetic assumptions, not observed trends.
        - Horizon is 1 year(s); horizon 0 equals the current-capacity check.
```

### what-if: vm-weekday-burst

#### vm-weekday-burst — demand 1.5×, horizon 0y

```
Synthetic data. Educational demonstration; not vendor sizing or production configuration guidance.
Overall: modeled-constraint
Ruleset: 1.0.0-m1   Budget fraction: 0.8
Infrastructure: INF-B   Workload: WL-VM   Sample: vm-weekday-burst
Options: demand multiplier 1.5x, horizon 0 year(s)
Dimension capacity: modeled-ready
  Check capacity: modeled-ready
    headroom: 25.6 TiB
    % of operating budget: 84.9%   % of limit: 67.9%
    Finding R-CAP-1: Combined used plus proposed capacity is within the capacity operating budget.
      evidence:
        - existing used capacity: 131941395333120 bytes (basis: aligned demand sample)
        - proposed workload capacity: 26388279066624 bytes (basis: synthetic workload profile)
        - capacity operating budget: 186477172070809.62 bytes (basis: 0.8 × usable capacity)
        - usable capacity limit: 233096465088512 bytes (basis: synthetic infrastructure profile)
      calculation: 120 TiB used + 24 TiB proposed = 144 TiB combined vs 169.6 TiB budget (0.8 × 212 TiB usable); headroom 25.6 TiB.
      implication: Modeled capacity headroom exists for the proposed workload at the declared synthetic values.
      next investigation: Confirm real usable capacity and current consumption before relying on this result.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not measured on a real array.
      assumptions:
        - Usable capacity excludes spares and metadata reserves.
Dimension iops: modeled-constraint
  Check iops.frontend: modeled-ready
    headroom: 22500 IOPS
    % of operating budget: 81.3%   % of limit: 65.0%
    Finding R-FE-1: Combined front-end IOPS demand is within the front-end operating budget.
      evidence:
        - existing front-end IOPS: 75000 IOPS (basis: aligned demand sample (reads + writes))
        - proposed front-end IOPS: 22500 IOPS (basis: aligned demand sample (reads + writes))
        - front-end IOPS operating budget: 120000 IOPS (basis: 0.8 × sustainable front-end IOPS limit)
        - sustainable front-end IOPS limit: 150000 IOPS (basis: synthetic infrastructure profile)
      calculation: 75000 existing + 22500 proposed = 97500 IOPS vs 120000 budget; headroom 22500 IOPS.
      implication: Front-end logical IOPS headroom exists for the proposed workload.
      next investigation: Confirm the declared sustainable IOPS envelope and the aligned demand peak on a real source.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not measured on a real array.
      assumptions:
        - Existing and proposed demand are aligned to the same modeled interval.
  Check iops.backend: modeled-constraint
    headroom: -23275 ops/s
    % of operating budget: 111.6%   % of limit: 89.3%
    Finding R-BE-4: Combined backend operation demand exceeds the backend operating budget. Front-end headroom exists, but backend operations exceed the budget because of the RAID write factor.
      evidence:
        - existing backend reads: 104250 ops/s (basis: derived from existing logical demand)
        - existing backend writes: 67500 ops/s (basis: derived from existing logical demand)
        - background backend demand: 0 ops/s (basis: declared on the demand sample; added exactly once)
        - proposed backend reads: 31275 ops/s (basis: derived: proposed reads × (1 − hit) + writes × factor)
        - proposed backend writes: 20250 ops/s (basis: derived: proposed writes × factor)
        - backend operating budget: 200000 ops/s (basis: 0.8 × backend sustainable operation limit)
        - backend sustainable operation limit: 250000 ops/s (basis: synthetic infrastructure profile)
      calculation: existing 171750 ops/s + background 0 + proposed 51525 ops/s (reads 31275 + writes 20250; RAID 6 factor 3+3 per logical write) = 223275 ops/s vs 200000 ops/s budget; headroom -23275 ops/s.
      implication: The RAID 6 write factor pushes modeled backend operations over budget. Front-end headroom exists, but backend operations exceed the budget because of the RAID write factor.
      next investigation: Investigate whether the real array coalesces writes (outside the V1 model), or reduce proposed write demand.
      confidence: high — Arithmetic on complete declared inputs within the explicitly bounded model; not a physical-array simulation.
      assumptions:
        - RAID 6 classic read-modify-write: each logical write costs 3 backend reads + 3 backend writes.
        - Write-back cache with no coalescing; sustained writes are not treated as zero.
        - Full-stripe writes, erasure coding, compression/dedup, metadata IO, flash write amplification, replication overhead, and rebuild load are outside this calculation.
Dimension throughput: modeled-ready
  Check throughput: modeled-ready
    headroom: 1105.08 MiB/s
    % of operating budget: 54.0%   % of limit: 43.2%
    Finding R-THR-1: Combined throughput demand is within the throughput operating budget.
      evidence:
        - existing throughput: 1044480000 bytes/second (basis: derived: existing IOPS × block sizes)
        - proposed throughput: 313344000 bytes/second (basis: derived: proposed IOPS × block sizes)
        - throughput operating budget: 2516582400 bytes/second (basis: 0.8 × sustainable throughput limit)
        - sustainable throughput limit: 3145728000 bytes/second (basis: synthetic infrastructure profile)
      calculation: existing 996.09 MiB/s (1020000 KiB/s) + proposed 298.83 MiB/s = 1294.92 MiB/s vs 2400 MiB/s budget; headroom 1105.08 MiB/s.
      implication: Modeled sustained bandwidth headroom exists for the proposed workload.
      next investigation: Verify sustained throughput limits and the read/write block-size mix; derived throughput depends on both.
      confidence: high — Derived directly from declared IOPS and block sizes; synthetic values, not a measured limit.
      assumptions:
        - Throughput is derived from IOPS × block size, never an independent input.
Dimension latency: needs-investigation
  Check latency: needs-investigation
    headroom: n/a
    % of operating budget: n/a   % of limit: n/a
    Finding R-LAT-1: Baseline P95 latency 1.2 ms is at or below the workload target 2 ms; post-addition latency unknown: no response curve in V1.
      evidence:
        - baseline P95 latency: 1.2 ms (basis: aligned demand sample (screening indicator))
        - baseline maximum latency: 1.4 ms (basis: aligned demand sample)
        - workload latency target: 2 ms (basis: synthetic workload profile)
      calculation: baseline P95 1.2 ms vs target 2 ms; baseline max 1.4 ms shown alongside.
      implication: No baseline latency concern is indicated, but this says nothing about latency after the proposed workload is added.
      next investigation: Establish post-addition latency with a response model or measurements; V1 cannot.
      confidence: insufficient — Post-addition latency is an unknown in V1 by design.
      assumptions:
        - Baseline P95 is a screening indicator only; the maximum is shown alongside.
        - Post-addition latency unknown: no response curve in V1.
    Finding R-LAT-1: Baseline maximum latency is reported alongside P95 as context.
      evidence:
        - baseline maximum latency: 1.4 ms (basis: aligned demand sample)
        - workload latency target: 2 ms (basis: synthetic workload profile)
      calculation: baseline max 1.4 ms vs target 2 ms; the max is context, not the screening statistic.
      implication: Single-interval maxima can exceed the target even when P95 does not; both are baseline evidence only.
      next investigation: Review the distribution of minute latencies in the M2 weekly statistics.
      confidence: high — Reported value from supplied evidence; no inference made.
      assumptions:
        - Latency evidence is synthetic baseline data for the existing environment only.
Dimension protection: modeled-ready
  Check protection: modeled-ready
    headroom: n/a
    % of operating budget: n/a   % of limit: n/a
    Finding R-PRO-1: All declared workload protection requirements are satisfied by the infrastructure capabilities.
      evidence:
        - minimum tolerated drive failures required: 1 count (basis: workload protection requirement)
        - tolerated drive failures: 2 count (basis: synthetic infrastructure profile)
        - snapshots required: true flag (basis: workload protection requirement)
        - snapshots capability: true flag (basis: synthetic infrastructure profile)
        - encryptionAtRest required: true flag (basis: workload protection requirement)
        - encryptionAtRest capability: true flag (basis: synthetic infrastructure profile)
        - replication required: none mode (basis: workload protection requirement)
        - replication capability: unknown mode (basis: synthetic infrastructure profile; missing: replication capability not modeled)
      calculation: Capability matching over the fixed V1 vocabulary: toleratedDriveFailures: required 1 vs available 2 → modeled-ready; snapshots: required true vs available true → modeled-ready; encryptionAtRest: required true vs available true → modeled-ready; replication: required none vs available unknown → modeled-ready.
      implication: Declared protection capabilities meet the workload requirements within the V1 vocabulary.
      next investigation: Confirm capabilities on the real array; vocabulary coverage is selected capabilities only.
      confidence: moderate — Declared capability matching only; not a complete availability assurance.
      assumptions:
        - The V1 capability vocabulary covers selected capabilities, not complete availability assurance.
        - Replication is not equated with backup; availability is not inferred from a single feature.
Dimension growth: modeled-ready
  Check growth: modeled-ready
    headroom: 25.6 TiB
    % of operating budget: 84.9%   % of limit: 67.9%
    Finding R-GRO-1: Projected capacity at the 0-year horizon is within the capacity operating budget.
      evidence:
        - existing used capacity: 131941395333120 bytes (basis: aligned demand sample)
        - existing annual growth fraction: 0.15 fraction (basis: synthetic infrastructure profile)
        - proposed workload capacity: 26388279066624 bytes (basis: synthetic workload profile)
        - proposed annual growth fraction: 0.1 fraction (basis: synthetic workload profile)
        - planning horizon: 0 years (basis: assessment option)
        - capacity operating budget: 186477172070809.62 bytes (basis: 0.8 × usable capacity)
      calculation: projected = 120 TiB × (1 + 0.15)^0 + 24 TiB × (1 + 0.1)^0 = 144 TiB vs 169.6 TiB budget; headroom 25.6 TiB.
      implication: The modeled environment retains capacity headroom at the 0-year planning horizon.
      next investigation: Validate the declared growth fractions against observed consumption trends; compound growth dominates at longer horizons.
      confidence: high — Deterministic compound-growth arithmetic on declared synthetic inputs; growth rates themselves are assumptions.
      assumptions:
        - Annual growth fractions are synthetic assumptions, not observed trends.
        - Horizon is 0 year(s); horizon 0 equals the current-capacity check.
```

#### vm-weekday-burst — demand 1.5×, horizon 1y

```
Synthetic data. Educational demonstration; not vendor sizing or production configuration guidance.
Overall: modeled-constraint
Ruleset: 1.0.0-m1   Budget fraction: 0.8
Infrastructure: INF-B   Workload: WL-VM   Sample: vm-weekday-burst
Options: demand multiplier 1.5x, horizon 1 year(s)
Dimension capacity: modeled-ready
  Check capacity: modeled-ready
    headroom: 25.6 TiB
    % of operating budget: 84.9%   % of limit: 67.9%
    Finding R-CAP-1: Combined used plus proposed capacity is within the capacity operating budget.
      evidence:
        - existing used capacity: 131941395333120 bytes (basis: aligned demand sample)
        - proposed workload capacity: 26388279066624 bytes (basis: synthetic workload profile)
        - capacity operating budget: 186477172070809.62 bytes (basis: 0.8 × usable capacity)
        - usable capacity limit: 233096465088512 bytes (basis: synthetic infrastructure profile)
      calculation: 120 TiB used + 24 TiB proposed = 144 TiB combined vs 169.6 TiB budget (0.8 × 212 TiB usable); headroom 25.6 TiB.
      implication: Modeled capacity headroom exists for the proposed workload at the declared synthetic values.
      next investigation: Confirm real usable capacity and current consumption before relying on this result.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not measured on a real array.
      assumptions:
        - Usable capacity excludes spares and metadata reserves.
Dimension iops: modeled-constraint
  Check iops.frontend: modeled-ready
    headroom: 22500 IOPS
    % of operating budget: 81.3%   % of limit: 65.0%
    Finding R-FE-1: Combined front-end IOPS demand is within the front-end operating budget.
      evidence:
        - existing front-end IOPS: 75000 IOPS (basis: aligned demand sample (reads + writes))
        - proposed front-end IOPS: 22500 IOPS (basis: aligned demand sample (reads + writes))
        - front-end IOPS operating budget: 120000 IOPS (basis: 0.8 × sustainable front-end IOPS limit)
        - sustainable front-end IOPS limit: 150000 IOPS (basis: synthetic infrastructure profile)
      calculation: 75000 existing + 22500 proposed = 97500 IOPS vs 120000 budget; headroom 22500 IOPS.
      implication: Front-end logical IOPS headroom exists for the proposed workload.
      next investigation: Confirm the declared sustainable IOPS envelope and the aligned demand peak on a real source.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not measured on a real array.
      assumptions:
        - Existing and proposed demand are aligned to the same modeled interval.
  Check iops.backend: modeled-constraint
    headroom: -23275 ops/s
    % of operating budget: 111.6%   % of limit: 89.3%
    Finding R-BE-4: Combined backend operation demand exceeds the backend operating budget. Front-end headroom exists, but backend operations exceed the budget because of the RAID write factor.
      evidence:
        - existing backend reads: 104250 ops/s (basis: derived from existing logical demand)
        - existing backend writes: 67500 ops/s (basis: derived from existing logical demand)
        - background backend demand: 0 ops/s (basis: declared on the demand sample; added exactly once)
        - proposed backend reads: 31275 ops/s (basis: derived: proposed reads × (1 − hit) + writes × factor)
        - proposed backend writes: 20250 ops/s (basis: derived: proposed writes × factor)
        - backend operating budget: 200000 ops/s (basis: 0.8 × backend sustainable operation limit)
        - backend sustainable operation limit: 250000 ops/s (basis: synthetic infrastructure profile)
      calculation: existing 171750 ops/s + background 0 + proposed 51525 ops/s (reads 31275 + writes 20250; RAID 6 factor 3+3 per logical write) = 223275 ops/s vs 200000 ops/s budget; headroom -23275 ops/s.
      implication: The RAID 6 write factor pushes modeled backend operations over budget. Front-end headroom exists, but backend operations exceed the budget because of the RAID write factor.
      next investigation: Investigate whether the real array coalesces writes (outside the V1 model), or reduce proposed write demand.
      confidence: high — Arithmetic on complete declared inputs within the explicitly bounded model; not a physical-array simulation.
      assumptions:
        - RAID 6 classic read-modify-write: each logical write costs 3 backend reads + 3 backend writes.
        - Write-back cache with no coalescing; sustained writes are not treated as zero.
        - Full-stripe writes, erasure coding, compression/dedup, metadata IO, flash write amplification, replication overhead, and rebuild load are outside this calculation.
Dimension throughput: modeled-ready
  Check throughput: modeled-ready
    headroom: 1105.08 MiB/s
    % of operating budget: 54.0%   % of limit: 43.2%
    Finding R-THR-1: Combined throughput demand is within the throughput operating budget.
      evidence:
        - existing throughput: 1044480000 bytes/second (basis: derived: existing IOPS × block sizes)
        - proposed throughput: 313344000 bytes/second (basis: derived: proposed IOPS × block sizes)
        - throughput operating budget: 2516582400 bytes/second (basis: 0.8 × sustainable throughput limit)
        - sustainable throughput limit: 3145728000 bytes/second (basis: synthetic infrastructure profile)
      calculation: existing 996.09 MiB/s (1020000 KiB/s) + proposed 298.83 MiB/s = 1294.92 MiB/s vs 2400 MiB/s budget; headroom 1105.08 MiB/s.
      implication: Modeled sustained bandwidth headroom exists for the proposed workload.
      next investigation: Verify sustained throughput limits and the read/write block-size mix; derived throughput depends on both.
      confidence: high — Derived directly from declared IOPS and block sizes; synthetic values, not a measured limit.
      assumptions:
        - Throughput is derived from IOPS × block size, never an independent input.
Dimension latency: needs-investigation
  Check latency: needs-investigation
    headroom: n/a
    % of operating budget: n/a   % of limit: n/a
    Finding R-LAT-1: Baseline P95 latency 1.2 ms is at or below the workload target 2 ms; post-addition latency unknown: no response curve in V1.
      evidence:
        - baseline P95 latency: 1.2 ms (basis: aligned demand sample (screening indicator))
        - baseline maximum latency: 1.4 ms (basis: aligned demand sample)
        - workload latency target: 2 ms (basis: synthetic workload profile)
      calculation: baseline P95 1.2 ms vs target 2 ms; baseline max 1.4 ms shown alongside.
      implication: No baseline latency concern is indicated, but this says nothing about latency after the proposed workload is added.
      next investigation: Establish post-addition latency with a response model or measurements; V1 cannot.
      confidence: insufficient — Post-addition latency is an unknown in V1 by design.
      assumptions:
        - Baseline P95 is a screening indicator only; the maximum is shown alongside.
        - Post-addition latency unknown: no response curve in V1.
    Finding R-LAT-1: Baseline maximum latency is reported alongside P95 as context.
      evidence:
        - baseline maximum latency: 1.4 ms (basis: aligned demand sample)
        - workload latency target: 2 ms (basis: synthetic workload profile)
      calculation: baseline max 1.4 ms vs target 2 ms; the max is context, not the screening statistic.
      implication: Single-interval maxima can exceed the target even when P95 does not; both are baseline evidence only.
      next investigation: Review the distribution of minute latencies in the M2 weekly statistics.
      confidence: high — Reported value from supplied evidence; no inference made.
      assumptions:
        - Latency evidence is synthetic baseline data for the existing environment only.
Dimension protection: modeled-ready
  Check protection: modeled-ready
    headroom: n/a
    % of operating budget: n/a   % of limit: n/a
    Finding R-PRO-1: All declared workload protection requirements are satisfied by the infrastructure capabilities.
      evidence:
        - minimum tolerated drive failures required: 1 count (basis: workload protection requirement)
        - tolerated drive failures: 2 count (basis: synthetic infrastructure profile)
        - snapshots required: true flag (basis: workload protection requirement)
        - snapshots capability: true flag (basis: synthetic infrastructure profile)
        - encryptionAtRest required: true flag (basis: workload protection requirement)
        - encryptionAtRest capability: true flag (basis: synthetic infrastructure profile)
        - replication required: none mode (basis: workload protection requirement)
        - replication capability: unknown mode (basis: synthetic infrastructure profile; missing: replication capability not modeled)
      calculation: Capability matching over the fixed V1 vocabulary: toleratedDriveFailures: required 1 vs available 2 → modeled-ready; snapshots: required true vs available true → modeled-ready; encryptionAtRest: required true vs available true → modeled-ready; replication: required none vs available unknown → modeled-ready.
      implication: Declared protection capabilities meet the workload requirements within the V1 vocabulary.
      next investigation: Confirm capabilities on the real array; vocabulary coverage is selected capabilities only.
      confidence: moderate — Declared capability matching only; not a complete availability assurance.
      assumptions:
        - The V1 capability vocabulary covers selected capabilities, not complete availability assurance.
        - Replication is not equated with backup; availability is not inferred from a single feature.
Dimension growth: modeled-ready
  Check growth: modeled-ready
    headroom: 5.2 TiB
    % of operating budget: 96.9%   % of limit: 77.5%
    Finding R-GRO-1: Projected capacity at the 1-year horizon is within the capacity operating budget.
      evidence:
        - existing used capacity: 131941395333120 bytes (basis: aligned demand sample)
        - existing annual growth fraction: 0.15 fraction (basis: synthetic infrastructure profile)
        - proposed workload capacity: 26388279066624 bytes (basis: synthetic workload profile)
        - proposed annual growth fraction: 0.1 fraction (basis: synthetic workload profile)
        - planning horizon: 1 years (basis: assessment option)
        - capacity operating budget: 186477172070809.62 bytes (basis: 0.8 × usable capacity)
      calculation: projected = 120 TiB × (1 + 0.15)^1 + 24 TiB × (1 + 0.1)^1 = 164.4 TiB vs 169.6 TiB budget; headroom 5.2 TiB.
      implication: The modeled environment retains capacity headroom at the 1-year planning horizon.
      next investigation: Validate the declared growth fractions against observed consumption trends; compound growth dominates at longer horizons.
      confidence: high — Deterministic compound-growth arithmetic on declared synthetic inputs; growth rates themselves are assumptions.
      assumptions:
        - Annual growth fractions are synthetic assumptions, not observed trends.
        - Horizon is 1 year(s); horizon 0 equals the current-capacity check.
```

#### vm-weekday-burst — demand 1.5×, horizon 3y

```
Synthetic data. Educational demonstration; not vendor sizing or production configuration guidance.
Overall: modeled-constraint
Ruleset: 1.0.0-m1   Budget fraction: 0.8
Infrastructure: INF-B   Workload: WL-VM   Sample: vm-weekday-burst
Options: demand multiplier 1.5x, horizon 3 year(s)
Dimension capacity: modeled-ready
  Check capacity: modeled-ready
    headroom: 25.6 TiB
    % of operating budget: 84.9%   % of limit: 67.9%
    Finding R-CAP-1: Combined used plus proposed capacity is within the capacity operating budget.
      evidence:
        - existing used capacity: 131941395333120 bytes (basis: aligned demand sample)
        - proposed workload capacity: 26388279066624 bytes (basis: synthetic workload profile)
        - capacity operating budget: 186477172070809.62 bytes (basis: 0.8 × usable capacity)
        - usable capacity limit: 233096465088512 bytes (basis: synthetic infrastructure profile)
      calculation: 120 TiB used + 24 TiB proposed = 144 TiB combined vs 169.6 TiB budget (0.8 × 212 TiB usable); headroom 25.6 TiB.
      implication: Modeled capacity headroom exists for the proposed workload at the declared synthetic values.
      next investigation: Confirm real usable capacity and current consumption before relying on this result.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not measured on a real array.
      assumptions:
        - Usable capacity excludes spares and metadata reserves.
Dimension iops: modeled-constraint
  Check iops.frontend: modeled-ready
    headroom: 22500 IOPS
    % of operating budget: 81.3%   % of limit: 65.0%
    Finding R-FE-1: Combined front-end IOPS demand is within the front-end operating budget.
      evidence:
        - existing front-end IOPS: 75000 IOPS (basis: aligned demand sample (reads + writes))
        - proposed front-end IOPS: 22500 IOPS (basis: aligned demand sample (reads + writes))
        - front-end IOPS operating budget: 120000 IOPS (basis: 0.8 × sustainable front-end IOPS limit)
        - sustainable front-end IOPS limit: 150000 IOPS (basis: synthetic infrastructure profile)
      calculation: 75000 existing + 22500 proposed = 97500 IOPS vs 120000 budget; headroom 22500 IOPS.
      implication: Front-end logical IOPS headroom exists for the proposed workload.
      next investigation: Confirm the declared sustainable IOPS envelope and the aligned demand peak on a real source.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not measured on a real array.
      assumptions:
        - Existing and proposed demand are aligned to the same modeled interval.
  Check iops.backend: modeled-constraint
    headroom: -23275 ops/s
    % of operating budget: 111.6%   % of limit: 89.3%
    Finding R-BE-4: Combined backend operation demand exceeds the backend operating budget. Front-end headroom exists, but backend operations exceed the budget because of the RAID write factor.
      evidence:
        - existing backend reads: 104250 ops/s (basis: derived from existing logical demand)
        - existing backend writes: 67500 ops/s (basis: derived from existing logical demand)
        - background backend demand: 0 ops/s (basis: declared on the demand sample; added exactly once)
        - proposed backend reads: 31275 ops/s (basis: derived: proposed reads × (1 − hit) + writes × factor)
        - proposed backend writes: 20250 ops/s (basis: derived: proposed writes × factor)
        - backend operating budget: 200000 ops/s (basis: 0.8 × backend sustainable operation limit)
        - backend sustainable operation limit: 250000 ops/s (basis: synthetic infrastructure profile)
      calculation: existing 171750 ops/s + background 0 + proposed 51525 ops/s (reads 31275 + writes 20250; RAID 6 factor 3+3 per logical write) = 223275 ops/s vs 200000 ops/s budget; headroom -23275 ops/s.
      implication: The RAID 6 write factor pushes modeled backend operations over budget. Front-end headroom exists, but backend operations exceed the budget because of the RAID write factor.
      next investigation: Investigate whether the real array coalesces writes (outside the V1 model), or reduce proposed write demand.
      confidence: high — Arithmetic on complete declared inputs within the explicitly bounded model; not a physical-array simulation.
      assumptions:
        - RAID 6 classic read-modify-write: each logical write costs 3 backend reads + 3 backend writes.
        - Write-back cache with no coalescing; sustained writes are not treated as zero.
        - Full-stripe writes, erasure coding, compression/dedup, metadata IO, flash write amplification, replication overhead, and rebuild load are outside this calculation.
Dimension throughput: modeled-ready
  Check throughput: modeled-ready
    headroom: 1105.08 MiB/s
    % of operating budget: 54.0%   % of limit: 43.2%
    Finding R-THR-1: Combined throughput demand is within the throughput operating budget.
      evidence:
        - existing throughput: 1044480000 bytes/second (basis: derived: existing IOPS × block sizes)
        - proposed throughput: 313344000 bytes/second (basis: derived: proposed IOPS × block sizes)
        - throughput operating budget: 2516582400 bytes/second (basis: 0.8 × sustainable throughput limit)
        - sustainable throughput limit: 3145728000 bytes/second (basis: synthetic infrastructure profile)
      calculation: existing 996.09 MiB/s (1020000 KiB/s) + proposed 298.83 MiB/s = 1294.92 MiB/s vs 2400 MiB/s budget; headroom 1105.08 MiB/s.
      implication: Modeled sustained bandwidth headroom exists for the proposed workload.
      next investigation: Verify sustained throughput limits and the read/write block-size mix; derived throughput depends on both.
      confidence: high — Derived directly from declared IOPS and block sizes; synthetic values, not a measured limit.
      assumptions:
        - Throughput is derived from IOPS × block size, never an independent input.
Dimension latency: needs-investigation
  Check latency: needs-investigation
    headroom: n/a
    % of operating budget: n/a   % of limit: n/a
    Finding R-LAT-1: Baseline P95 latency 1.2 ms is at or below the workload target 2 ms; post-addition latency unknown: no response curve in V1.
      evidence:
        - baseline P95 latency: 1.2 ms (basis: aligned demand sample (screening indicator))
        - baseline maximum latency: 1.4 ms (basis: aligned demand sample)
        - workload latency target: 2 ms (basis: synthetic workload profile)
      calculation: baseline P95 1.2 ms vs target 2 ms; baseline max 1.4 ms shown alongside.
      implication: No baseline latency concern is indicated, but this says nothing about latency after the proposed workload is added.
      next investigation: Establish post-addition latency with a response model or measurements; V1 cannot.
      confidence: insufficient — Post-addition latency is an unknown in V1 by design.
      assumptions:
        - Baseline P95 is a screening indicator only; the maximum is shown alongside.
        - Post-addition latency unknown: no response curve in V1.
    Finding R-LAT-1: Baseline maximum latency is reported alongside P95 as context.
      evidence:
        - baseline maximum latency: 1.4 ms (basis: aligned demand sample)
        - workload latency target: 2 ms (basis: synthetic workload profile)
      calculation: baseline max 1.4 ms vs target 2 ms; the max is context, not the screening statistic.
      implication: Single-interval maxima can exceed the target even when P95 does not; both are baseline evidence only.
      next investigation: Review the distribution of minute latencies in the M2 weekly statistics.
      confidence: high — Reported value from supplied evidence; no inference made.
      assumptions:
        - Latency evidence is synthetic baseline data for the existing environment only.
Dimension protection: modeled-ready
  Check protection: modeled-ready
    headroom: n/a
    % of operating budget: n/a   % of limit: n/a
    Finding R-PRO-1: All declared workload protection requirements are satisfied by the infrastructure capabilities.
      evidence:
        - minimum tolerated drive failures required: 1 count (basis: workload protection requirement)
        - tolerated drive failures: 2 count (basis: synthetic infrastructure profile)
        - snapshots required: true flag (basis: workload protection requirement)
        - snapshots capability: true flag (basis: synthetic infrastructure profile)
        - encryptionAtRest required: true flag (basis: workload protection requirement)
        - encryptionAtRest capability: true flag (basis: synthetic infrastructure profile)
        - replication required: none mode (basis: workload protection requirement)
        - replication capability: unknown mode (basis: synthetic infrastructure profile; missing: replication capability not modeled)
      calculation: Capability matching over the fixed V1 vocabulary: toleratedDriveFailures: required 1 vs available 2 → modeled-ready; snapshots: required true vs available true → modeled-ready; encryptionAtRest: required true vs available true → modeled-ready; replication: required none vs available unknown → modeled-ready.
      implication: Declared protection capabilities meet the workload requirements within the V1 vocabulary.
      next investigation: Confirm capabilities on the real array; vocabulary coverage is selected capabilities only.
      confidence: moderate — Declared capability matching only; not a complete availability assurance.
      assumptions:
        - The V1 capability vocabulary covers selected capabilities, not complete availability assurance.
        - Replication is not equated with backup; availability is not inferred from a single feature.
Dimension growth: modeled-constraint
  Check growth: modeled-constraint
    headroom: -44.85 TiB
    % of operating budget: 126.4%   % of limit: 101.2%
    Finding R-GRO-1: Projected capacity at the 3-year horizon exceeds the capacity operating budget.
      evidence:
        - existing used capacity: 131941395333120 bytes (basis: aligned demand sample)
        - existing annual growth fraction: 0.15 fraction (basis: synthetic infrastructure profile)
        - proposed workload capacity: 26388279066624 bytes (basis: synthetic workload profile)
        - proposed annual growth fraction: 0.1 fraction (basis: synthetic workload profile)
        - planning horizon: 3 years (basis: assessment option)
        - capacity operating budget: 186477172070809.62 bytes (basis: 0.8 × usable capacity)
      calculation: projected = 120 TiB × (1 + 0.15)^3 + 24 TiB × (1 + 0.1)^3 = 214.45 TiB vs 169.6 TiB budget; headroom -44.85 TiB.
      implication: Growth projection exceeds the capacity operating budget within 3 year(s); capacity expansion timing becomes a planning constraint.
      next investigation: Validate the declared growth fractions against observed consumption trends; compound growth dominates at longer horizons.
      confidence: high — Deterministic compound-growth arithmetic on declared synthetic inputs; growth rates themselves are assumptions.
      assumptions:
        - Annual growth fractions are synthetic assumptions, not observed trends.
        - Horizon is 3 year(s); horizon 0 equals the current-capacity check.
```

#### vm-weekday-burst — demand 2×, horizon 0y

```
Synthetic data. Educational demonstration; not vendor sizing or production configuration guidance.
Overall: modeled-constraint
Ruleset: 1.0.0-m1   Budget fraction: 0.8
Infrastructure: INF-B   Workload: WL-VM   Sample: vm-weekday-burst
Options: demand multiplier 2x, horizon 0 year(s)
Dimension capacity: modeled-ready
  Check capacity: modeled-ready
    headroom: 25.6 TiB
    % of operating budget: 84.9%   % of limit: 67.9%
    Finding R-CAP-1: Combined used plus proposed capacity is within the capacity operating budget.
      evidence:
        - existing used capacity: 131941395333120 bytes (basis: aligned demand sample)
        - proposed workload capacity: 26388279066624 bytes (basis: synthetic workload profile)
        - capacity operating budget: 186477172070809.62 bytes (basis: 0.8 × usable capacity)
        - usable capacity limit: 233096465088512 bytes (basis: synthetic infrastructure profile)
      calculation: 120 TiB used + 24 TiB proposed = 144 TiB combined vs 169.6 TiB budget (0.8 × 212 TiB usable); headroom 25.6 TiB.
      implication: Modeled capacity headroom exists for the proposed workload at the declared synthetic values.
      next investigation: Confirm real usable capacity and current consumption before relying on this result.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not measured on a real array.
      assumptions:
        - Usable capacity excludes spares and metadata reserves.
Dimension iops: modeled-constraint
  Check iops.frontend: modeled-ready
    headroom: 15000 IOPS
    % of operating budget: 87.5%   % of limit: 70.0%
    Finding R-FE-1: Combined front-end IOPS demand is within the front-end operating budget.
      evidence:
        - existing front-end IOPS: 75000 IOPS (basis: aligned demand sample (reads + writes))
        - proposed front-end IOPS: 30000 IOPS (basis: aligned demand sample (reads + writes))
        - front-end IOPS operating budget: 120000 IOPS (basis: 0.8 × sustainable front-end IOPS limit)
        - sustainable front-end IOPS limit: 150000 IOPS (basis: synthetic infrastructure profile)
      calculation: 75000 existing + 30000 proposed = 105000 IOPS vs 120000 budget; headroom 15000 IOPS.
      implication: Front-end logical IOPS headroom exists for the proposed workload.
      next investigation: Confirm the declared sustainable IOPS envelope and the aligned demand peak on a real source.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not measured on a real array.
      assumptions:
        - Existing and proposed demand are aligned to the same modeled interval.
  Check iops.backend: modeled-constraint
    headroom: -40450 ops/s
    % of operating budget: 120.2%   % of limit: 96.2%
    Finding R-BE-4: Combined backend operation demand exceeds the backend operating budget. Front-end headroom exists, but backend operations exceed the budget because of the RAID write factor.
      evidence:
        - existing backend reads: 104250 ops/s (basis: derived from existing logical demand)
        - existing backend writes: 67500 ops/s (basis: derived from existing logical demand)
        - background backend demand: 0 ops/s (basis: declared on the demand sample; added exactly once)
        - proposed backend reads: 41700 ops/s (basis: derived: proposed reads × (1 − hit) + writes × factor)
        - proposed backend writes: 27000 ops/s (basis: derived: proposed writes × factor)
        - backend operating budget: 200000 ops/s (basis: 0.8 × backend sustainable operation limit)
        - backend sustainable operation limit: 250000 ops/s (basis: synthetic infrastructure profile)
      calculation: existing 171750 ops/s + background 0 + proposed 68700 ops/s (reads 41700 + writes 27000; RAID 6 factor 3+3 per logical write) = 240450 ops/s vs 200000 ops/s budget; headroom -40450 ops/s.
      implication: The RAID 6 write factor pushes modeled backend operations over budget. Front-end headroom exists, but backend operations exceed the budget because of the RAID write factor.
      next investigation: Investigate whether the real array coalesces writes (outside the V1 model), or reduce proposed write demand.
      confidence: high — Arithmetic on complete declared inputs within the explicitly bounded model; not a physical-array simulation.
      assumptions:
        - RAID 6 classic read-modify-write: each logical write costs 3 backend reads + 3 backend writes.
        - Write-back cache with no coalescing; sustained writes are not treated as zero.
        - Full-stripe writes, erasure coding, compression/dedup, metadata IO, flash write amplification, replication overhead, and rebuild load are outside this calculation.
Dimension throughput: modeled-ready
  Check throughput: modeled-ready
    headroom: 1005.47 MiB/s
    % of operating budget: 58.1%   % of limit: 46.5%
    Finding R-THR-1: Combined throughput demand is within the throughput operating budget.
      evidence:
        - existing throughput: 1044480000 bytes/second (basis: derived: existing IOPS × block sizes)
        - proposed throughput: 417792000 bytes/second (basis: derived: proposed IOPS × block sizes)
        - throughput operating budget: 2516582400 bytes/second (basis: 0.8 × sustainable throughput limit)
        - sustainable throughput limit: 3145728000 bytes/second (basis: synthetic infrastructure profile)
      calculation: existing 996.09 MiB/s (1020000 KiB/s) + proposed 398.44 MiB/s = 1394.53 MiB/s vs 2400 MiB/s budget; headroom 1005.47 MiB/s.
      implication: Modeled sustained bandwidth headroom exists for the proposed workload.
      next investigation: Verify sustained throughput limits and the read/write block-size mix; derived throughput depends on both.
      confidence: high — Derived directly from declared IOPS and block sizes; synthetic values, not a measured limit.
      assumptions:
        - Throughput is derived from IOPS × block size, never an independent input.
Dimension latency: needs-investigation
  Check latency: needs-investigation
    headroom: n/a
    % of operating budget: n/a   % of limit: n/a
    Finding R-LAT-1: Baseline P95 latency 1.2 ms is at or below the workload target 2 ms; post-addition latency unknown: no response curve in V1.
      evidence:
        - baseline P95 latency: 1.2 ms (basis: aligned demand sample (screening indicator))
        - baseline maximum latency: 1.4 ms (basis: aligned demand sample)
        - workload latency target: 2 ms (basis: synthetic workload profile)
      calculation: baseline P95 1.2 ms vs target 2 ms; baseline max 1.4 ms shown alongside.
      implication: No baseline latency concern is indicated, but this says nothing about latency after the proposed workload is added.
      next investigation: Establish post-addition latency with a response model or measurements; V1 cannot.
      confidence: insufficient — Post-addition latency is an unknown in V1 by design.
      assumptions:
        - Baseline P95 is a screening indicator only; the maximum is shown alongside.
        - Post-addition latency unknown: no response curve in V1.
    Finding R-LAT-1: Baseline maximum latency is reported alongside P95 as context.
      evidence:
        - baseline maximum latency: 1.4 ms (basis: aligned demand sample)
        - workload latency target: 2 ms (basis: synthetic workload profile)
      calculation: baseline max 1.4 ms vs target 2 ms; the max is context, not the screening statistic.
      implication: Single-interval maxima can exceed the target even when P95 does not; both are baseline evidence only.
      next investigation: Review the distribution of minute latencies in the M2 weekly statistics.
      confidence: high — Reported value from supplied evidence; no inference made.
      assumptions:
        - Latency evidence is synthetic baseline data for the existing environment only.
Dimension protection: modeled-ready
  Check protection: modeled-ready
    headroom: n/a
    % of operating budget: n/a   % of limit: n/a
    Finding R-PRO-1: All declared workload protection requirements are satisfied by the infrastructure capabilities.
      evidence:
        - minimum tolerated drive failures required: 1 count (basis: workload protection requirement)
        - tolerated drive failures: 2 count (basis: synthetic infrastructure profile)
        - snapshots required: true flag (basis: workload protection requirement)
        - snapshots capability: true flag (basis: synthetic infrastructure profile)
        - encryptionAtRest required: true flag (basis: workload protection requirement)
        - encryptionAtRest capability: true flag (basis: synthetic infrastructure profile)
        - replication required: none mode (basis: workload protection requirement)
        - replication capability: unknown mode (basis: synthetic infrastructure profile; missing: replication capability not modeled)
      calculation: Capability matching over the fixed V1 vocabulary: toleratedDriveFailures: required 1 vs available 2 → modeled-ready; snapshots: required true vs available true → modeled-ready; encryptionAtRest: required true vs available true → modeled-ready; replication: required none vs available unknown → modeled-ready.
      implication: Declared protection capabilities meet the workload requirements within the V1 vocabulary.
      next investigation: Confirm capabilities on the real array; vocabulary coverage is selected capabilities only.
      confidence: moderate — Declared capability matching only; not a complete availability assurance.
      assumptions:
        - The V1 capability vocabulary covers selected capabilities, not complete availability assurance.
        - Replication is not equated with backup; availability is not inferred from a single feature.
Dimension growth: modeled-ready
  Check growth: modeled-ready
    headroom: 25.6 TiB
    % of operating budget: 84.9%   % of limit: 67.9%
    Finding R-GRO-1: Projected capacity at the 0-year horizon is within the capacity operating budget.
      evidence:
        - existing used capacity: 131941395333120 bytes (basis: aligned demand sample)
        - existing annual growth fraction: 0.15 fraction (basis: synthetic infrastructure profile)
        - proposed workload capacity: 26388279066624 bytes (basis: synthetic workload profile)
        - proposed annual growth fraction: 0.1 fraction (basis: synthetic workload profile)
        - planning horizon: 0 years (basis: assessment option)
        - capacity operating budget: 186477172070809.62 bytes (basis: 0.8 × usable capacity)
      calculation: projected = 120 TiB × (1 + 0.15)^0 + 24 TiB × (1 + 0.1)^0 = 144 TiB vs 169.6 TiB budget; headroom 25.6 TiB.
      implication: The modeled environment retains capacity headroom at the 0-year planning horizon.
      next investigation: Validate the declared growth fractions against observed consumption trends; compound growth dominates at longer horizons.
      confidence: high — Deterministic compound-growth arithmetic on declared synthetic inputs; growth rates themselves are assumptions.
      assumptions:
        - Annual growth fractions are synthetic assumptions, not observed trends.
        - Horizon is 0 year(s); horizon 0 equals the current-capacity check.
```

#### vm-weekday-burst — demand 2×, horizon 1y

```
Synthetic data. Educational demonstration; not vendor sizing or production configuration guidance.
Overall: modeled-constraint
Ruleset: 1.0.0-m1   Budget fraction: 0.8
Infrastructure: INF-B   Workload: WL-VM   Sample: vm-weekday-burst
Options: demand multiplier 2x, horizon 1 year(s)
Dimension capacity: modeled-ready
  Check capacity: modeled-ready
    headroom: 25.6 TiB
    % of operating budget: 84.9%   % of limit: 67.9%
    Finding R-CAP-1: Combined used plus proposed capacity is within the capacity operating budget.
      evidence:
        - existing used capacity: 131941395333120 bytes (basis: aligned demand sample)
        - proposed workload capacity: 26388279066624 bytes (basis: synthetic workload profile)
        - capacity operating budget: 186477172070809.62 bytes (basis: 0.8 × usable capacity)
        - usable capacity limit: 233096465088512 bytes (basis: synthetic infrastructure profile)
      calculation: 120 TiB used + 24 TiB proposed = 144 TiB combined vs 169.6 TiB budget (0.8 × 212 TiB usable); headroom 25.6 TiB.
      implication: Modeled capacity headroom exists for the proposed workload at the declared synthetic values.
      next investigation: Confirm real usable capacity and current consumption before relying on this result.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not measured on a real array.
      assumptions:
        - Usable capacity excludes spares and metadata reserves.
Dimension iops: modeled-constraint
  Check iops.frontend: modeled-ready
    headroom: 15000 IOPS
    % of operating budget: 87.5%   % of limit: 70.0%
    Finding R-FE-1: Combined front-end IOPS demand is within the front-end operating budget.
      evidence:
        - existing front-end IOPS: 75000 IOPS (basis: aligned demand sample (reads + writes))
        - proposed front-end IOPS: 30000 IOPS (basis: aligned demand sample (reads + writes))
        - front-end IOPS operating budget: 120000 IOPS (basis: 0.8 × sustainable front-end IOPS limit)
        - sustainable front-end IOPS limit: 150000 IOPS (basis: synthetic infrastructure profile)
      calculation: 75000 existing + 30000 proposed = 105000 IOPS vs 120000 budget; headroom 15000 IOPS.
      implication: Front-end logical IOPS headroom exists for the proposed workload.
      next investigation: Confirm the declared sustainable IOPS envelope and the aligned demand peak on a real source.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not measured on a real array.
      assumptions:
        - Existing and proposed demand are aligned to the same modeled interval.
  Check iops.backend: modeled-constraint
    headroom: -40450 ops/s
    % of operating budget: 120.2%   % of limit: 96.2%
    Finding R-BE-4: Combined backend operation demand exceeds the backend operating budget. Front-end headroom exists, but backend operations exceed the budget because of the RAID write factor.
      evidence:
        - existing backend reads: 104250 ops/s (basis: derived from existing logical demand)
        - existing backend writes: 67500 ops/s (basis: derived from existing logical demand)
        - background backend demand: 0 ops/s (basis: declared on the demand sample; added exactly once)
        - proposed backend reads: 41700 ops/s (basis: derived: proposed reads × (1 − hit) + writes × factor)
        - proposed backend writes: 27000 ops/s (basis: derived: proposed writes × factor)
        - backend operating budget: 200000 ops/s (basis: 0.8 × backend sustainable operation limit)
        - backend sustainable operation limit: 250000 ops/s (basis: synthetic infrastructure profile)
      calculation: existing 171750 ops/s + background 0 + proposed 68700 ops/s (reads 41700 + writes 27000; RAID 6 factor 3+3 per logical write) = 240450 ops/s vs 200000 ops/s budget; headroom -40450 ops/s.
      implication: The RAID 6 write factor pushes modeled backend operations over budget. Front-end headroom exists, but backend operations exceed the budget because of the RAID write factor.
      next investigation: Investigate whether the real array coalesces writes (outside the V1 model), or reduce proposed write demand.
      confidence: high — Arithmetic on complete declared inputs within the explicitly bounded model; not a physical-array simulation.
      assumptions:
        - RAID 6 classic read-modify-write: each logical write costs 3 backend reads + 3 backend writes.
        - Write-back cache with no coalescing; sustained writes are not treated as zero.
        - Full-stripe writes, erasure coding, compression/dedup, metadata IO, flash write amplification, replication overhead, and rebuild load are outside this calculation.
Dimension throughput: modeled-ready
  Check throughput: modeled-ready
    headroom: 1005.47 MiB/s
    % of operating budget: 58.1%   % of limit: 46.5%
    Finding R-THR-1: Combined throughput demand is within the throughput operating budget.
      evidence:
        - existing throughput: 1044480000 bytes/second (basis: derived: existing IOPS × block sizes)
        - proposed throughput: 417792000 bytes/second (basis: derived: proposed IOPS × block sizes)
        - throughput operating budget: 2516582400 bytes/second (basis: 0.8 × sustainable throughput limit)
        - sustainable throughput limit: 3145728000 bytes/second (basis: synthetic infrastructure profile)
      calculation: existing 996.09 MiB/s (1020000 KiB/s) + proposed 398.44 MiB/s = 1394.53 MiB/s vs 2400 MiB/s budget; headroom 1005.47 MiB/s.
      implication: Modeled sustained bandwidth headroom exists for the proposed workload.
      next investigation: Verify sustained throughput limits and the read/write block-size mix; derived throughput depends on both.
      confidence: high — Derived directly from declared IOPS and block sizes; synthetic values, not a measured limit.
      assumptions:
        - Throughput is derived from IOPS × block size, never an independent input.
Dimension latency: needs-investigation
  Check latency: needs-investigation
    headroom: n/a
    % of operating budget: n/a   % of limit: n/a
    Finding R-LAT-1: Baseline P95 latency 1.2 ms is at or below the workload target 2 ms; post-addition latency unknown: no response curve in V1.
      evidence:
        - baseline P95 latency: 1.2 ms (basis: aligned demand sample (screening indicator))
        - baseline maximum latency: 1.4 ms (basis: aligned demand sample)
        - workload latency target: 2 ms (basis: synthetic workload profile)
      calculation: baseline P95 1.2 ms vs target 2 ms; baseline max 1.4 ms shown alongside.
      implication: No baseline latency concern is indicated, but this says nothing about latency after the proposed workload is added.
      next investigation: Establish post-addition latency with a response model or measurements; V1 cannot.
      confidence: insufficient — Post-addition latency is an unknown in V1 by design.
      assumptions:
        - Baseline P95 is a screening indicator only; the maximum is shown alongside.
        - Post-addition latency unknown: no response curve in V1.
    Finding R-LAT-1: Baseline maximum latency is reported alongside P95 as context.
      evidence:
        - baseline maximum latency: 1.4 ms (basis: aligned demand sample)
        - workload latency target: 2 ms (basis: synthetic workload profile)
      calculation: baseline max 1.4 ms vs target 2 ms; the max is context, not the screening statistic.
      implication: Single-interval maxima can exceed the target even when P95 does not; both are baseline evidence only.
      next investigation: Review the distribution of minute latencies in the M2 weekly statistics.
      confidence: high — Reported value from supplied evidence; no inference made.
      assumptions:
        - Latency evidence is synthetic baseline data for the existing environment only.
Dimension protection: modeled-ready
  Check protection: modeled-ready
    headroom: n/a
    % of operating budget: n/a   % of limit: n/a
    Finding R-PRO-1: All declared workload protection requirements are satisfied by the infrastructure capabilities.
      evidence:
        - minimum tolerated drive failures required: 1 count (basis: workload protection requirement)
        - tolerated drive failures: 2 count (basis: synthetic infrastructure profile)
        - snapshots required: true flag (basis: workload protection requirement)
        - snapshots capability: true flag (basis: synthetic infrastructure profile)
        - encryptionAtRest required: true flag (basis: workload protection requirement)
        - encryptionAtRest capability: true flag (basis: synthetic infrastructure profile)
        - replication required: none mode (basis: workload protection requirement)
        - replication capability: unknown mode (basis: synthetic infrastructure profile; missing: replication capability not modeled)
      calculation: Capability matching over the fixed V1 vocabulary: toleratedDriveFailures: required 1 vs available 2 → modeled-ready; snapshots: required true vs available true → modeled-ready; encryptionAtRest: required true vs available true → modeled-ready; replication: required none vs available unknown → modeled-ready.
      implication: Declared protection capabilities meet the workload requirements within the V1 vocabulary.
      next investigation: Confirm capabilities on the real array; vocabulary coverage is selected capabilities only.
      confidence: moderate — Declared capability matching only; not a complete availability assurance.
      assumptions:
        - The V1 capability vocabulary covers selected capabilities, not complete availability assurance.
        - Replication is not equated with backup; availability is not inferred from a single feature.
Dimension growth: modeled-ready
  Check growth: modeled-ready
    headroom: 5.2 TiB
    % of operating budget: 96.9%   % of limit: 77.5%
    Finding R-GRO-1: Projected capacity at the 1-year horizon is within the capacity operating budget.
      evidence:
        - existing used capacity: 131941395333120 bytes (basis: aligned demand sample)
        - existing annual growth fraction: 0.15 fraction (basis: synthetic infrastructure profile)
        - proposed workload capacity: 26388279066624 bytes (basis: synthetic workload profile)
        - proposed annual growth fraction: 0.1 fraction (basis: synthetic workload profile)
        - planning horizon: 1 years (basis: assessment option)
        - capacity operating budget: 186477172070809.62 bytes (basis: 0.8 × usable capacity)
      calculation: projected = 120 TiB × (1 + 0.15)^1 + 24 TiB × (1 + 0.1)^1 = 164.4 TiB vs 169.6 TiB budget; headroom 5.2 TiB.
      implication: The modeled environment retains capacity headroom at the 1-year planning horizon.
      next investigation: Validate the declared growth fractions against observed consumption trends; compound growth dominates at longer horizons.
      confidence: high — Deterministic compound-growth arithmetic on declared synthetic inputs; growth rates themselves are assumptions.
      assumptions:
        - Annual growth fractions are synthetic assumptions, not observed trends.
        - Horizon is 1 year(s); horizon 0 equals the current-capacity check.
```

#### vm-weekday-burst — demand 2×, horizon 3y

```
Synthetic data. Educational demonstration; not vendor sizing or production configuration guidance.
Overall: modeled-constraint
Ruleset: 1.0.0-m1   Budget fraction: 0.8
Infrastructure: INF-B   Workload: WL-VM   Sample: vm-weekday-burst
Options: demand multiplier 2x, horizon 3 year(s)
Dimension capacity: modeled-ready
  Check capacity: modeled-ready
    headroom: 25.6 TiB
    % of operating budget: 84.9%   % of limit: 67.9%
    Finding R-CAP-1: Combined used plus proposed capacity is within the capacity operating budget.
      evidence:
        - existing used capacity: 131941395333120 bytes (basis: aligned demand sample)
        - proposed workload capacity: 26388279066624 bytes (basis: synthetic workload profile)
        - capacity operating budget: 186477172070809.62 bytes (basis: 0.8 × usable capacity)
        - usable capacity limit: 233096465088512 bytes (basis: synthetic infrastructure profile)
      calculation: 120 TiB used + 24 TiB proposed = 144 TiB combined vs 169.6 TiB budget (0.8 × 212 TiB usable); headroom 25.6 TiB.
      implication: Modeled capacity headroom exists for the proposed workload at the declared synthetic values.
      next investigation: Confirm real usable capacity and current consumption before relying on this result.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not measured on a real array.
      assumptions:
        - Usable capacity excludes spares and metadata reserves.
Dimension iops: modeled-constraint
  Check iops.frontend: modeled-ready
    headroom: 15000 IOPS
    % of operating budget: 87.5%   % of limit: 70.0%
    Finding R-FE-1: Combined front-end IOPS demand is within the front-end operating budget.
      evidence:
        - existing front-end IOPS: 75000 IOPS (basis: aligned demand sample (reads + writes))
        - proposed front-end IOPS: 30000 IOPS (basis: aligned demand sample (reads + writes))
        - front-end IOPS operating budget: 120000 IOPS (basis: 0.8 × sustainable front-end IOPS limit)
        - sustainable front-end IOPS limit: 150000 IOPS (basis: synthetic infrastructure profile)
      calculation: 75000 existing + 30000 proposed = 105000 IOPS vs 120000 budget; headroom 15000 IOPS.
      implication: Front-end logical IOPS headroom exists for the proposed workload.
      next investigation: Confirm the declared sustainable IOPS envelope and the aligned demand peak on a real source.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not measured on a real array.
      assumptions:
        - Existing and proposed demand are aligned to the same modeled interval.
  Check iops.backend: modeled-constraint
    headroom: -40450 ops/s
    % of operating budget: 120.2%   % of limit: 96.2%
    Finding R-BE-4: Combined backend operation demand exceeds the backend operating budget. Front-end headroom exists, but backend operations exceed the budget because of the RAID write factor.
      evidence:
        - existing backend reads: 104250 ops/s (basis: derived from existing logical demand)
        - existing backend writes: 67500 ops/s (basis: derived from existing logical demand)
        - background backend demand: 0 ops/s (basis: declared on the demand sample; added exactly once)
        - proposed backend reads: 41700 ops/s (basis: derived: proposed reads × (1 − hit) + writes × factor)
        - proposed backend writes: 27000 ops/s (basis: derived: proposed writes × factor)
        - backend operating budget: 200000 ops/s (basis: 0.8 × backend sustainable operation limit)
        - backend sustainable operation limit: 250000 ops/s (basis: synthetic infrastructure profile)
      calculation: existing 171750 ops/s + background 0 + proposed 68700 ops/s (reads 41700 + writes 27000; RAID 6 factor 3+3 per logical write) = 240450 ops/s vs 200000 ops/s budget; headroom -40450 ops/s.
      implication: The RAID 6 write factor pushes modeled backend operations over budget. Front-end headroom exists, but backend operations exceed the budget because of the RAID write factor.
      next investigation: Investigate whether the real array coalesces writes (outside the V1 model), or reduce proposed write demand.
      confidence: high — Arithmetic on complete declared inputs within the explicitly bounded model; not a physical-array simulation.
      assumptions:
        - RAID 6 classic read-modify-write: each logical write costs 3 backend reads + 3 backend writes.
        - Write-back cache with no coalescing; sustained writes are not treated as zero.
        - Full-stripe writes, erasure coding, compression/dedup, metadata IO, flash write amplification, replication overhead, and rebuild load are outside this calculation.
Dimension throughput: modeled-ready
  Check throughput: modeled-ready
    headroom: 1005.47 MiB/s
    % of operating budget: 58.1%   % of limit: 46.5%
    Finding R-THR-1: Combined throughput demand is within the throughput operating budget.
      evidence:
        - existing throughput: 1044480000 bytes/second (basis: derived: existing IOPS × block sizes)
        - proposed throughput: 417792000 bytes/second (basis: derived: proposed IOPS × block sizes)
        - throughput operating budget: 2516582400 bytes/second (basis: 0.8 × sustainable throughput limit)
        - sustainable throughput limit: 3145728000 bytes/second (basis: synthetic infrastructure profile)
      calculation: existing 996.09 MiB/s (1020000 KiB/s) + proposed 398.44 MiB/s = 1394.53 MiB/s vs 2400 MiB/s budget; headroom 1005.47 MiB/s.
      implication: Modeled sustained bandwidth headroom exists for the proposed workload.
      next investigation: Verify sustained throughput limits and the read/write block-size mix; derived throughput depends on both.
      confidence: high — Derived directly from declared IOPS and block sizes; synthetic values, not a measured limit.
      assumptions:
        - Throughput is derived from IOPS × block size, never an independent input.
Dimension latency: needs-investigation
  Check latency: needs-investigation
    headroom: n/a
    % of operating budget: n/a   % of limit: n/a
    Finding R-LAT-1: Baseline P95 latency 1.2 ms is at or below the workload target 2 ms; post-addition latency unknown: no response curve in V1.
      evidence:
        - baseline P95 latency: 1.2 ms (basis: aligned demand sample (screening indicator))
        - baseline maximum latency: 1.4 ms (basis: aligned demand sample)
        - workload latency target: 2 ms (basis: synthetic workload profile)
      calculation: baseline P95 1.2 ms vs target 2 ms; baseline max 1.4 ms shown alongside.
      implication: No baseline latency concern is indicated, but this says nothing about latency after the proposed workload is added.
      next investigation: Establish post-addition latency with a response model or measurements; V1 cannot.
      confidence: insufficient — Post-addition latency is an unknown in V1 by design.
      assumptions:
        - Baseline P95 is a screening indicator only; the maximum is shown alongside.
        - Post-addition latency unknown: no response curve in V1.
    Finding R-LAT-1: Baseline maximum latency is reported alongside P95 as context.
      evidence:
        - baseline maximum latency: 1.4 ms (basis: aligned demand sample)
        - workload latency target: 2 ms (basis: synthetic workload profile)
      calculation: baseline max 1.4 ms vs target 2 ms; the max is context, not the screening statistic.
      implication: Single-interval maxima can exceed the target even when P95 does not; both are baseline evidence only.
      next investigation: Review the distribution of minute latencies in the M2 weekly statistics.
      confidence: high — Reported value from supplied evidence; no inference made.
      assumptions:
        - Latency evidence is synthetic baseline data for the existing environment only.
Dimension protection: modeled-ready
  Check protection: modeled-ready
    headroom: n/a
    % of operating budget: n/a   % of limit: n/a
    Finding R-PRO-1: All declared workload protection requirements are satisfied by the infrastructure capabilities.
      evidence:
        - minimum tolerated drive failures required: 1 count (basis: workload protection requirement)
        - tolerated drive failures: 2 count (basis: synthetic infrastructure profile)
        - snapshots required: true flag (basis: workload protection requirement)
        - snapshots capability: true flag (basis: synthetic infrastructure profile)
        - encryptionAtRest required: true flag (basis: workload protection requirement)
        - encryptionAtRest capability: true flag (basis: synthetic infrastructure profile)
        - replication required: none mode (basis: workload protection requirement)
        - replication capability: unknown mode (basis: synthetic infrastructure profile; missing: replication capability not modeled)
      calculation: Capability matching over the fixed V1 vocabulary: toleratedDriveFailures: required 1 vs available 2 → modeled-ready; snapshots: required true vs available true → modeled-ready; encryptionAtRest: required true vs available true → modeled-ready; replication: required none vs available unknown → modeled-ready.
      implication: Declared protection capabilities meet the workload requirements within the V1 vocabulary.
      next investigation: Confirm capabilities on the real array; vocabulary coverage is selected capabilities only.
      confidence: moderate — Declared capability matching only; not a complete availability assurance.
      assumptions:
        - The V1 capability vocabulary covers selected capabilities, not complete availability assurance.
        - Replication is not equated with backup; availability is not inferred from a single feature.
Dimension growth: modeled-constraint
  Check growth: modeled-constraint
    headroom: -44.85 TiB
    % of operating budget: 126.4%   % of limit: 101.2%
    Finding R-GRO-1: Projected capacity at the 3-year horizon exceeds the capacity operating budget.
      evidence:
        - existing used capacity: 131941395333120 bytes (basis: aligned demand sample)
        - existing annual growth fraction: 0.15 fraction (basis: synthetic infrastructure profile)
        - proposed workload capacity: 26388279066624 bytes (basis: synthetic workload profile)
        - proposed annual growth fraction: 0.1 fraction (basis: synthetic workload profile)
        - planning horizon: 3 years (basis: assessment option)
        - capacity operating budget: 186477172070809.62 bytes (basis: 0.8 × usable capacity)
      calculation: projected = 120 TiB × (1 + 0.15)^3 + 24 TiB × (1 + 0.1)^3 = 214.45 TiB vs 169.6 TiB budget; headroom -44.85 TiB.
      implication: Growth projection exceeds the capacity operating budget within 3 year(s); capacity expansion timing becomes a planning constraint.
      next investigation: Validate the declared growth fractions against observed consumption trends; compound growth dominates at longer horizons.
      confidence: high — Deterministic compound-growth arithmetic on declared synthetic inputs; growth rates themselves are assumptions.
      assumptions:
        - Annual growth fractions are synthetic assumptions, not observed trends.
        - Horizon is 3 year(s); horizon 0 equals the current-capacity check.
```


## INF-A × WL-RAG

### rag-weekday-business-query

```
Synthetic data. Educational demonstration; not vendor sizing or production configuration guidance.
Overall: needs-investigation
Ruleset: 1.0.0-m1   Budget fraction: 0.8
Infrastructure: INF-A   Workload: WL-RAG   Sample: rag-weekday-business-query
Options: demand multiplier 1x, horizon 1 year(s)
Dimension capacity: modeled-ready
  Check capacity: modeled-ready
    headroom: 62 TiB
    % of operating budget: 70.8%   % of limit: 56.6%
    Finding R-CAP-1: Combined used plus proposed capacity is within the capacity operating budget.
      evidence:
        - existing used capacity: 131941395333120 bytes (basis: aligned demand sample)
        - proposed workload capacity: 32985348833280 bytes (basis: synthetic workload profile)
        - capacity operating budget: 233096465088512 bytes (basis: 0.8 × usable capacity)
        - usable capacity limit: 291370581360640 bytes (basis: synthetic infrastructure profile)
      calculation: 120 TiB used + 30 TiB proposed = 150 TiB combined vs 212 TiB budget (0.8 × 265 TiB usable); headroom 62 TiB.
      implication: Modeled capacity headroom exists for the proposed workload at the declared synthetic values.
      next investigation: Confirm real usable capacity and current consumption before relying on this result.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not measured on a real array.
      assumptions:
        - Usable capacity excludes spares and metadata reserves.
Dimension iops: modeled-ready
  Check iops.frontend: modeled-ready
    headroom: 40000 IOPS
    % of operating budget: 66.7%   % of limit: 53.3%
    Finding R-FE-1: Combined front-end IOPS demand is within the front-end operating budget.
      evidence:
        - existing front-end IOPS: 50000 IOPS (basis: aligned demand sample (reads + writes))
        - proposed front-end IOPS: 30000 IOPS (basis: aligned demand sample (reads + writes))
        - front-end IOPS operating budget: 120000 IOPS (basis: 0.8 × sustainable front-end IOPS limit)
        - sustainable front-end IOPS limit: 150000 IOPS (basis: synthetic infrastructure profile)
      calculation: 50000 existing + 30000 proposed = 80000 IOPS vs 120000 budget; headroom 40000 IOPS.
      implication: Front-end logical IOPS headroom exists for the proposed workload.
      next investigation: Confirm the declared sustainable IOPS envelope and the aligned demand peak on a real source.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not measured on a real array.
      assumptions:
        - Existing and proposed demand are aligned to the same modeled interval.
  Check iops.backend: modeled-ready
    headroom: 84600 ops/s
    % of operating budget: 57.7%   % of limit: 46.2%
    Finding R-BE-1: Combined backend operation demand is within the backend operating budget.
      evidence:
        - existing backend reads: 54500 ops/s (basis: derived from existing logical demand)
        - existing backend writes: 30000 ops/s (basis: derived from existing logical demand)
        - background backend demand: 0 ops/s (basis: declared on the demand sample; added exactly once)
        - proposed backend reads: 24900 ops/s (basis: derived: proposed reads × (1 − hit) + writes × factor)
        - proposed backend writes: 6000 ops/s (basis: derived: proposed writes × factor)
        - backend operating budget: 200000 ops/s (basis: 0.8 × backend sustainable operation limit)
        - backend sustainable operation limit: 250000 ops/s (basis: synthetic infrastructure profile)
      calculation: existing 84500 ops/s + background 0 + proposed 30900 ops/s (reads 24900 + writes 6000; RAID 5 factor 2+2 per logical write) = 115400 ops/s vs 200000 ops/s budget; headroom 84600 ops/s.
      implication: Modeled backend load is within budget under the RAID 5 read-modify-write factor.
      next investigation: Validate cache-hit fraction and write policy on the real system before relying on the estimate.
      confidence: high — Arithmetic on complete declared inputs within the explicitly bounded model; not a physical-array simulation.
      assumptions:
        - RAID 5 classic read-modify-write: each logical write costs 2 backend reads + 2 backend writes.
        - Write-back cache with no coalescing; sustained writes are not treated as zero.
        - Full-stripe writes, erasure coding, compression/dedup, metadata IO, flash write amplification, replication overhead, and rebuild load are outside this calculation.
Dimension throughput: modeled-ready
  Check throughput: modeled-ready
    headroom: 1501.56 MiB/s
    % of operating budget: 37.4%   % of limit: 29.9%
    Finding R-THR-1: Combined throughput demand is within the throughput operating budget.
      evidence:
        - existing throughput: 696320000 bytes/second (basis: derived: existing IOPS × block sizes)
        - proposed throughput: 245760000 bytes/second (basis: derived: proposed IOPS × block sizes)
        - throughput operating budget: 2516582400 bytes/second (basis: 0.8 × sustainable throughput limit)
        - sustainable throughput limit: 3145728000 bytes/second (basis: synthetic infrastructure profile)
      calculation: existing 664.06 MiB/s (680000 KiB/s) + proposed 234.38 MiB/s = 898.44 MiB/s vs 2400 MiB/s budget; headroom 1501.56 MiB/s.
      implication: Modeled sustained bandwidth headroom exists for the proposed workload.
      next investigation: Verify sustained throughput limits and the read/write block-size mix; derived throughput depends on both.
      confidence: high — Derived directly from declared IOPS and block sizes; synthetic values, not a measured limit.
      assumptions:
        - Throughput is derived from IOPS × block size, never an independent input.
Dimension latency: needs-investigation
  Check latency: needs-investigation
    headroom: n/a
    % of operating budget: n/a   % of limit: n/a
    Finding R-LAT-1: Baseline P95 latency 1.2 ms is at or below the workload target 1.5 ms; post-addition latency unknown: no response curve in V1.
      evidence:
        - baseline P95 latency: 1.2 ms (basis: aligned demand sample (screening indicator))
        - baseline maximum latency: 1.4 ms (basis: aligned demand sample)
        - workload latency target: 1.5 ms (basis: synthetic workload profile)
      calculation: baseline P95 1.2 ms vs target 1.5 ms; baseline max 1.4 ms shown alongside.
      implication: No baseline latency concern is indicated, but this says nothing about latency after the proposed workload is added.
      next investigation: Establish post-addition latency with a response model or measurements; V1 cannot.
      confidence: insufficient — Post-addition latency is an unknown in V1 by design.
      assumptions:
        - Baseline P95 is a screening indicator only; the maximum is shown alongside.
        - Post-addition latency unknown: no response curve in V1.
    Finding R-LAT-1: Baseline maximum latency is reported alongside P95 as context.
      evidence:
        - baseline maximum latency: 1.4 ms (basis: aligned demand sample)
        - workload latency target: 1.5 ms (basis: synthetic workload profile)
      calculation: baseline max 1.4 ms vs target 1.5 ms; the max is context, not the screening statistic.
      implication: Single-interval maxima can exceed the target even when P95 does not; both are baseline evidence only.
      next investigation: Review the distribution of minute latencies in the M2 weekly statistics.
      confidence: high — Reported value from supplied evidence; no inference made.
      assumptions:
        - Latency evidence is synthetic baseline data for the existing environment only.
Dimension protection: modeled-ready
  Check protection: modeled-ready
    headroom: n/a
    % of operating budget: n/a   % of limit: n/a
    Finding R-PRO-1: All declared workload protection requirements are satisfied by the infrastructure capabilities.
      evidence:
        - minimum tolerated drive failures required: 1 count (basis: workload protection requirement)
        - tolerated drive failures: 1 count (basis: synthetic infrastructure profile)
        - snapshots required: true flag (basis: workload protection requirement)
        - snapshots capability: true flag (basis: synthetic infrastructure profile)
        - encryptionAtRest required: true flag (basis: workload protection requirement)
        - encryptionAtRest capability: true flag (basis: synthetic infrastructure profile)
        - replication required: none mode (basis: workload protection requirement)
        - replication capability: unknown mode (basis: synthetic infrastructure profile; missing: replication capability not modeled)
      calculation: Capability matching over the fixed V1 vocabulary: toleratedDriveFailures: required 1 vs available 1 → modeled-ready; snapshots: required true vs available true → modeled-ready; encryptionAtRest: required true vs available true → modeled-ready; replication: required none vs available unknown → modeled-ready.
      implication: Declared protection capabilities meet the workload requirements within the V1 vocabulary.
      next investigation: Confirm capabilities on the real array; vocabulary coverage is selected capabilities only.
      confidence: moderate — Declared capability matching only; not a complete availability assurance.
      assumptions:
        - The V1 capability vocabulary covers selected capabilities, not complete availability assurance.
        - Replication is not equated with backup; availability is not inferred from a single feature.
Dimension growth: modeled-ready
  Check growth: modeled-ready
    headroom: 32 TiB
    % of operating budget: 84.9%   % of limit: 67.9%
    Finding R-GRO-1: Projected capacity at the 1-year horizon is within the capacity operating budget.
      evidence:
        - existing used capacity: 131941395333120 bytes (basis: aligned demand sample)
        - existing annual growth fraction: 0.15 fraction (basis: synthetic infrastructure profile)
        - proposed workload capacity: 32985348833280 bytes (basis: synthetic workload profile)
        - proposed annual growth fraction: 0.4 fraction (basis: synthetic workload profile)
        - planning horizon: 1 years (basis: assessment option)
        - capacity operating budget: 233096465088512 bytes (basis: 0.8 × usable capacity)
      calculation: projected = 120 TiB × (1 + 0.15)^1 + 30 TiB × (1 + 0.4)^1 = 180 TiB vs 212 TiB budget; headroom 32 TiB.
      implication: The modeled environment retains capacity headroom at the 1-year planning horizon.
      next investigation: Validate the declared growth fractions against observed consumption trends; compound growth dominates at longer horizons.
      confidence: high — Deterministic compound-growth arithmetic on declared synthetic inputs; growth rates themselves are assumptions.
      assumptions:
        - Annual growth fractions are synthetic assumptions, not observed trends.
        - Horizon is 1 year(s); horizon 0 equals the current-capacity check.
```

### rag-weekday-burst-query

```
Synthetic data. Educational demonstration; not vendor sizing or production configuration guidance.
Overall: needs-investigation
Ruleset: 1.0.0-m1   Budget fraction: 0.8
Infrastructure: INF-A   Workload: WL-RAG   Sample: rag-weekday-burst-query
Options: demand multiplier 1x, horizon 1 year(s)
Dimension capacity: modeled-ready
  Check capacity: modeled-ready
    headroom: 62 TiB
    % of operating budget: 70.8%   % of limit: 56.6%
    Finding R-CAP-1: Combined used plus proposed capacity is within the capacity operating budget.
      evidence:
        - existing used capacity: 131941395333120 bytes (basis: aligned demand sample)
        - proposed workload capacity: 32985348833280 bytes (basis: synthetic workload profile)
        - capacity operating budget: 233096465088512 bytes (basis: 0.8 × usable capacity)
        - usable capacity limit: 291370581360640 bytes (basis: synthetic infrastructure profile)
      calculation: 120 TiB used + 30 TiB proposed = 150 TiB combined vs 212 TiB budget (0.8 × 265 TiB usable); headroom 62 TiB.
      implication: Modeled capacity headroom exists for the proposed workload at the declared synthetic values.
      next investigation: Confirm real usable capacity and current consumption before relying on this result.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not measured on a real array.
      assumptions:
        - Usable capacity excludes spares and metadata reserves.
Dimension iops: modeled-ready
  Check iops.frontend: modeled-ready
    headroom: 15000 IOPS
    % of operating budget: 87.5%   % of limit: 70.0%
    Finding R-FE-1: Combined front-end IOPS demand is within the front-end operating budget.
      evidence:
        - existing front-end IOPS: 75000 IOPS (basis: aligned demand sample (reads + writes))
        - proposed front-end IOPS: 30000 IOPS (basis: aligned demand sample (reads + writes))
        - front-end IOPS operating budget: 120000 IOPS (basis: 0.8 × sustainable front-end IOPS limit)
        - sustainable front-end IOPS limit: 150000 IOPS (basis: synthetic infrastructure profile)
      calculation: 75000 existing + 30000 proposed = 105000 IOPS vs 120000 budget; headroom 15000 IOPS.
      implication: Front-end logical IOPS headroom exists for the proposed workload.
      next investigation: Confirm the declared sustainable IOPS envelope and the aligned demand peak on a real source.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not measured on a real array.
      assumptions:
        - Existing and proposed demand are aligned to the same modeled interval.
  Check iops.backend: modeled-ready
    headroom: 42350 ops/s
    % of operating budget: 78.8%   % of limit: 63.1%
    Finding R-BE-1: Combined backend operation demand is within the backend operating budget.
      evidence:
        - existing backend reads: 81750 ops/s (basis: derived from existing logical demand)
        - existing backend writes: 45000 ops/s (basis: derived from existing logical demand)
        - background backend demand: 0 ops/s (basis: declared on the demand sample; added exactly once)
        - proposed backend reads: 24900 ops/s (basis: derived: proposed reads × (1 − hit) + writes × factor)
        - proposed backend writes: 6000 ops/s (basis: derived: proposed writes × factor)
        - backend operating budget: 200000 ops/s (basis: 0.8 × backend sustainable operation limit)
        - backend sustainable operation limit: 250000 ops/s (basis: synthetic infrastructure profile)
      calculation: existing 126750 ops/s + background 0 + proposed 30900 ops/s (reads 24900 + writes 6000; RAID 5 factor 2+2 per logical write) = 157650 ops/s vs 200000 ops/s budget; headroom 42350 ops/s.
      implication: Modeled backend load is within budget under the RAID 5 read-modify-write factor.
      next investigation: Validate cache-hit fraction and write policy on the real system before relying on the estimate.
      confidence: high — Arithmetic on complete declared inputs within the explicitly bounded model; not a physical-array simulation.
      assumptions:
        - RAID 5 classic read-modify-write: each logical write costs 2 backend reads + 2 backend writes.
        - Write-back cache with no coalescing; sustained writes are not treated as zero.
        - Full-stripe writes, erasure coding, compression/dedup, metadata IO, flash write amplification, replication overhead, and rebuild load are outside this calculation.
Dimension throughput: modeled-ready
  Check throughput: modeled-ready
    headroom: 1169.53 MiB/s
    % of operating budget: 51.3%   % of limit: 41.0%
    Finding R-THR-1: Combined throughput demand is within the throughput operating budget.
      evidence:
        - existing throughput: 1044480000 bytes/second (basis: derived: existing IOPS × block sizes)
        - proposed throughput: 245760000 bytes/second (basis: derived: proposed IOPS × block sizes)
        - throughput operating budget: 2516582400 bytes/second (basis: 0.8 × sustainable throughput limit)
        - sustainable throughput limit: 3145728000 bytes/second (basis: synthetic infrastructure profile)
      calculation: existing 996.09 MiB/s (1020000 KiB/s) + proposed 234.38 MiB/s = 1230.47 MiB/s vs 2400 MiB/s budget; headroom 1169.53 MiB/s.
      implication: Modeled sustained bandwidth headroom exists for the proposed workload.
      next investigation: Verify sustained throughput limits and the read/write block-size mix; derived throughput depends on both.
      confidence: high — Derived directly from declared IOPS and block sizes; synthetic values, not a measured limit.
      assumptions:
        - Throughput is derived from IOPS × block size, never an independent input.
Dimension latency: needs-investigation
  Check latency: needs-investigation
    headroom: n/a
    % of operating budget: n/a   % of limit: n/a
    Finding R-LAT-1: Baseline P95 latency 1.2 ms is at or below the workload target 1.5 ms; post-addition latency unknown: no response curve in V1.
      evidence:
        - baseline P95 latency: 1.2 ms (basis: aligned demand sample (screening indicator))
        - baseline maximum latency: 1.4 ms (basis: aligned demand sample)
        - workload latency target: 1.5 ms (basis: synthetic workload profile)
      calculation: baseline P95 1.2 ms vs target 1.5 ms; baseline max 1.4 ms shown alongside.
      implication: No baseline latency concern is indicated, but this says nothing about latency after the proposed workload is added.
      next investigation: Establish post-addition latency with a response model or measurements; V1 cannot.
      confidence: insufficient — Post-addition latency is an unknown in V1 by design.
      assumptions:
        - Baseline P95 is a screening indicator only; the maximum is shown alongside.
        - Post-addition latency unknown: no response curve in V1.
    Finding R-LAT-1: Baseline maximum latency is reported alongside P95 as context.
      evidence:
        - baseline maximum latency: 1.4 ms (basis: aligned demand sample)
        - workload latency target: 1.5 ms (basis: synthetic workload profile)
      calculation: baseline max 1.4 ms vs target 1.5 ms; the max is context, not the screening statistic.
      implication: Single-interval maxima can exceed the target even when P95 does not; both are baseline evidence only.
      next investigation: Review the distribution of minute latencies in the M2 weekly statistics.
      confidence: high — Reported value from supplied evidence; no inference made.
      assumptions:
        - Latency evidence is synthetic baseline data for the existing environment only.
Dimension protection: modeled-ready
  Check protection: modeled-ready
    headroom: n/a
    % of operating budget: n/a   % of limit: n/a
    Finding R-PRO-1: All declared workload protection requirements are satisfied by the infrastructure capabilities.
      evidence:
        - minimum tolerated drive failures required: 1 count (basis: workload protection requirement)
        - tolerated drive failures: 1 count (basis: synthetic infrastructure profile)
        - snapshots required: true flag (basis: workload protection requirement)
        - snapshots capability: true flag (basis: synthetic infrastructure profile)
        - encryptionAtRest required: true flag (basis: workload protection requirement)
        - encryptionAtRest capability: true flag (basis: synthetic infrastructure profile)
        - replication required: none mode (basis: workload protection requirement)
        - replication capability: unknown mode (basis: synthetic infrastructure profile; missing: replication capability not modeled)
      calculation: Capability matching over the fixed V1 vocabulary: toleratedDriveFailures: required 1 vs available 1 → modeled-ready; snapshots: required true vs available true → modeled-ready; encryptionAtRest: required true vs available true → modeled-ready; replication: required none vs available unknown → modeled-ready.
      implication: Declared protection capabilities meet the workload requirements within the V1 vocabulary.
      next investigation: Confirm capabilities on the real array; vocabulary coverage is selected capabilities only.
      confidence: moderate — Declared capability matching only; not a complete availability assurance.
      assumptions:
        - The V1 capability vocabulary covers selected capabilities, not complete availability assurance.
        - Replication is not equated with backup; availability is not inferred from a single feature.
Dimension growth: modeled-ready
  Check growth: modeled-ready
    headroom: 32 TiB
    % of operating budget: 84.9%   % of limit: 67.9%
    Finding R-GRO-1: Projected capacity at the 1-year horizon is within the capacity operating budget.
      evidence:
        - existing used capacity: 131941395333120 bytes (basis: aligned demand sample)
        - existing annual growth fraction: 0.15 fraction (basis: synthetic infrastructure profile)
        - proposed workload capacity: 32985348833280 bytes (basis: synthetic workload profile)
        - proposed annual growth fraction: 0.4 fraction (basis: synthetic workload profile)
        - planning horizon: 1 years (basis: assessment option)
        - capacity operating budget: 233096465088512 bytes (basis: 0.8 × usable capacity)
      calculation: projected = 120 TiB × (1 + 0.15)^1 + 30 TiB × (1 + 0.4)^1 = 180 TiB vs 212 TiB budget; headroom 32 TiB.
      implication: The modeled environment retains capacity headroom at the 1-year planning horizon.
      next investigation: Validate the declared growth fractions against observed consumption trends; compound growth dominates at longer horizons.
      confidence: high — Deterministic compound-growth arithmetic on declared synthetic inputs; growth rates themselves are assumptions.
      assumptions:
        - Annual growth fractions are synthetic assumptions, not observed trends.
        - Horizon is 1 year(s); horizon 0 equals the current-capacity check.
```

### rag-weekday-ingestion

```
Synthetic data. Educational demonstration; not vendor sizing or production configuration guidance.
Overall: needs-investigation
Ruleset: 1.0.0-m1   Budget fraction: 0.8
Infrastructure: INF-A   Workload: WL-RAG   Sample: rag-weekday-ingestion
Options: demand multiplier 1x, horizon 1 year(s)
Dimension capacity: modeled-ready
  Check capacity: modeled-ready
    headroom: 62 TiB
    % of operating budget: 70.8%   % of limit: 56.6%
    Finding R-CAP-1: Combined used plus proposed capacity is within the capacity operating budget.
      evidence:
        - existing used capacity: 131941395333120 bytes (basis: aligned demand sample)
        - proposed workload capacity: 32985348833280 bytes (basis: synthetic workload profile)
        - capacity operating budget: 233096465088512 bytes (basis: 0.8 × usable capacity)
        - usable capacity limit: 291370581360640 bytes (basis: synthetic infrastructure profile)
      calculation: 120 TiB used + 30 TiB proposed = 150 TiB combined vs 212 TiB budget (0.8 × 265 TiB usable); headroom 62 TiB.
      implication: Modeled capacity headroom exists for the proposed workload at the declared synthetic values.
      next investigation: Confirm real usable capacity and current consumption before relying on this result.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not measured on a real array.
      assumptions:
        - Usable capacity excludes spares and metadata reserves.
Dimension iops: needs-investigation
  Check iops.frontend: modeled-ready
    headroom: 80000 IOPS
    % of operating budget: 33.3%   % of limit: 26.7%
    Finding R-FE-1: Combined front-end IOPS demand is within the front-end operating budget.
      evidence:
        - existing front-end IOPS: 20000 IOPS (basis: aligned demand sample (reads + writes))
        - proposed front-end IOPS: 20000 IOPS (basis: aligned demand sample (reads + writes))
        - front-end IOPS operating budget: 120000 IOPS (basis: 0.8 × sustainable front-end IOPS limit)
        - sustainable front-end IOPS limit: 150000 IOPS (basis: synthetic infrastructure profile)
      calculation: 20000 existing + 20000 proposed = 40000 IOPS vs 120000 budget; headroom 80000 IOPS.
      implication: Front-end logical IOPS headroom exists for the proposed workload.
      next investigation: Confirm the declared sustainable IOPS envelope and the aligned demand peak on a real source.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not measured on a real array.
      assumptions:
        - Existing and proposed demand are aligned to the same modeled interval.
  Check iops.backend: needs-investigation
    headroom: n/a
    % of operating budget: n/a   % of limit: n/a
    Finding R-BE-3: Backend operation demand cannot be estimated for this sample.
      evidence:
        - backend estimate: unknown ops/s (basis: backend model; missing: proposed IO size exceeds the modeled backend block (read 65536 bytes, write 65536 bytes, backend block 16384 bytes); the classic read-modify-write factor does not apply; full-stripe or multi-block behavior is outside V1 scope.)
        - existing read block: 16384 bytes (basis: aligned demand sample)
        - existing write block: 8192 bytes (basis: aligned demand sample)
        - proposed read block: 65536 bytes (basis: aligned demand sample)
        - proposed write block: 65536 bytes (basis: aligned demand sample)
        - modeled backend block: 16384 bytes (basis: synthetic infrastructure profile)
      calculation: No backend estimate produced: proposed IO size exceeds the modeled backend block (read 65536 bytes, write 65536 bytes, backend block 16384 bytes); the classic read-modify-write factor does not apply; full-stripe or multi-block behavior is outside V1 scope.
      implication: The backend load for this demand sample is unknown; the IOPS dimension cannot be unconditionally ready.
      next investigation: Determine the real backend behavior for this IO profile (full-stripe or multi-block handling is outside V1) or bound the demand to the modeled block size.
      confidence: insufficient — An unknown participates: the model deliberately refuses to extrapolate.
      assumptions:
        - The classic read-modify-write model applies only when read and write block sizes are at or below the modeled backend block.
Dimension throughput: modeled-ready
  Check throughput: modeled-ready
    headroom: 884.38 MiB/s
    % of operating budget: 63.2%   % of limit: 50.5%
    Finding R-THR-1: Combined throughput demand is within the throughput operating budget.
      evidence:
        - existing throughput: 278528000 bytes/second (basis: derived: existing IOPS × block sizes)
        - proposed throughput: 1310720000 bytes/second (basis: derived: proposed IOPS × block sizes)
        - throughput operating budget: 2516582400 bytes/second (basis: 0.8 × sustainable throughput limit)
        - sustainable throughput limit: 3145728000 bytes/second (basis: synthetic infrastructure profile)
      calculation: existing 265.63 MiB/s (272000 KiB/s) + proposed 1250 MiB/s = 1515.63 MiB/s vs 2400 MiB/s budget; headroom 884.38 MiB/s.
      implication: Modeled sustained bandwidth headroom exists for the proposed workload.
      next investigation: Verify sustained throughput limits and the read/write block-size mix; derived throughput depends on both.
      confidence: high — Derived directly from declared IOPS and block sizes; synthetic values, not a measured limit.
      assumptions:
        - Throughput is derived from IOPS × block size, never an independent input.
Dimension latency: needs-investigation
  Check latency: needs-investigation
    headroom: n/a
    % of operating budget: n/a   % of limit: n/a
    Finding R-LAT-1: Baseline P95 latency 1.2 ms is at or below the workload target 1.5 ms; post-addition latency unknown: no response curve in V1.
      evidence:
        - baseline P95 latency: 1.2 ms (basis: aligned demand sample (screening indicator))
        - baseline maximum latency: 1.4 ms (basis: aligned demand sample)
        - workload latency target: 1.5 ms (basis: synthetic workload profile)
      calculation: baseline P95 1.2 ms vs target 1.5 ms; baseline max 1.4 ms shown alongside.
      implication: No baseline latency concern is indicated, but this says nothing about latency after the proposed workload is added.
      next investigation: Establish post-addition latency with a response model or measurements; V1 cannot.
      confidence: insufficient — Post-addition latency is an unknown in V1 by design.
      assumptions:
        - Baseline P95 is a screening indicator only; the maximum is shown alongside.
        - Post-addition latency unknown: no response curve in V1.
    Finding R-LAT-1: Baseline maximum latency is reported alongside P95 as context.
      evidence:
        - baseline maximum latency: 1.4 ms (basis: aligned demand sample)
        - workload latency target: 1.5 ms (basis: synthetic workload profile)
      calculation: baseline max 1.4 ms vs target 1.5 ms; the max is context, not the screening statistic.
      implication: Single-interval maxima can exceed the target even when P95 does not; both are baseline evidence only.
      next investigation: Review the distribution of minute latencies in the M2 weekly statistics.
      confidence: high — Reported value from supplied evidence; no inference made.
      assumptions:
        - Latency evidence is synthetic baseline data for the existing environment only.
Dimension protection: modeled-ready
  Check protection: modeled-ready
    headroom: n/a
    % of operating budget: n/a   % of limit: n/a
    Finding R-PRO-1: All declared workload protection requirements are satisfied by the infrastructure capabilities.
      evidence:
        - minimum tolerated drive failures required: 1 count (basis: workload protection requirement)
        - tolerated drive failures: 1 count (basis: synthetic infrastructure profile)
        - snapshots required: true flag (basis: workload protection requirement)
        - snapshots capability: true flag (basis: synthetic infrastructure profile)
        - encryptionAtRest required: true flag (basis: workload protection requirement)
        - encryptionAtRest capability: true flag (basis: synthetic infrastructure profile)
        - replication required: none mode (basis: workload protection requirement)
        - replication capability: unknown mode (basis: synthetic infrastructure profile; missing: replication capability not modeled)
      calculation: Capability matching over the fixed V1 vocabulary: toleratedDriveFailures: required 1 vs available 1 → modeled-ready; snapshots: required true vs available true → modeled-ready; encryptionAtRest: required true vs available true → modeled-ready; replication: required none vs available unknown → modeled-ready.
      implication: Declared protection capabilities meet the workload requirements within the V1 vocabulary.
      next investigation: Confirm capabilities on the real array; vocabulary coverage is selected capabilities only.
      confidence: moderate — Declared capability matching only; not a complete availability assurance.
      assumptions:
        - The V1 capability vocabulary covers selected capabilities, not complete availability assurance.
        - Replication is not equated with backup; availability is not inferred from a single feature.
Dimension growth: modeled-ready
  Check growth: modeled-ready
    headroom: 32 TiB
    % of operating budget: 84.9%   % of limit: 67.9%
    Finding R-GRO-1: Projected capacity at the 1-year horizon is within the capacity operating budget.
      evidence:
        - existing used capacity: 131941395333120 bytes (basis: aligned demand sample)
        - existing annual growth fraction: 0.15 fraction (basis: synthetic infrastructure profile)
        - proposed workload capacity: 32985348833280 bytes (basis: synthetic workload profile)
        - proposed annual growth fraction: 0.4 fraction (basis: synthetic workload profile)
        - planning horizon: 1 years (basis: assessment option)
        - capacity operating budget: 233096465088512 bytes (basis: 0.8 × usable capacity)
      calculation: projected = 120 TiB × (1 + 0.15)^1 + 30 TiB × (1 + 0.4)^1 = 180 TiB vs 212 TiB budget; headroom 32 TiB.
      implication: The modeled environment retains capacity headroom at the 1-year planning horizon.
      next investigation: Validate the declared growth fractions against observed consumption trends; compound growth dominates at longer horizons.
      confidence: high — Deterministic compound-growth arithmetic on declared synthetic inputs; growth rates themselves are assumptions.
      assumptions:
        - Annual growth fractions are synthetic assumptions, not observed trends.
        - Horizon is 1 year(s); horizon 0 equals the current-capacity check.
```

### rag-weekday-batch-offhours

```
Synthetic data. Educational demonstration; not vendor sizing or production configuration guidance.
Overall: needs-investigation
Ruleset: 1.0.0-m1   Budget fraction: 0.8
Infrastructure: INF-A   Workload: WL-RAG   Sample: rag-weekday-batch-offhours
Options: demand multiplier 1x, horizon 1 year(s)
Dimension capacity: modeled-ready
  Check capacity: modeled-ready
    headroom: 62 TiB
    % of operating budget: 70.8%   % of limit: 56.6%
    Finding R-CAP-1: Combined used plus proposed capacity is within the capacity operating budget.
      evidence:
        - existing used capacity: 131941395333120 bytes (basis: aligned demand sample)
        - proposed workload capacity: 32985348833280 bytes (basis: synthetic workload profile)
        - capacity operating budget: 233096465088512 bytes (basis: 0.8 × usable capacity)
        - usable capacity limit: 291370581360640 bytes (basis: synthetic infrastructure profile)
      calculation: 120 TiB used + 30 TiB proposed = 150 TiB combined vs 212 TiB budget (0.8 × 265 TiB usable); headroom 62 TiB.
      implication: Modeled capacity headroom exists for the proposed workload at the declared synthetic values.
      next investigation: Confirm real usable capacity and current consumption before relying on this result.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not measured on a real array.
      assumptions:
        - Usable capacity excludes spares and metadata reserves.
Dimension iops: modeled-ready
  Check iops.frontend: modeled-ready
    headroom: 72000 IOPS
    % of operating budget: 40.0%   % of limit: 32.0%
    Finding R-FE-1: Combined front-end IOPS demand is within the front-end operating budget.
      evidence:
        - existing front-end IOPS: 40000 IOPS (basis: aligned demand sample (reads + writes))
        - proposed front-end IOPS: 8000 IOPS (basis: aligned demand sample (reads + writes))
        - front-end IOPS operating budget: 120000 IOPS (basis: 0.8 × sustainable front-end IOPS limit)
        - sustainable front-end IOPS limit: 150000 IOPS (basis: synthetic infrastructure profile)
      calculation: 40000 existing + 8000 proposed = 48000 IOPS vs 120000 budget; headroom 72000 IOPS.
      implication: Front-end logical IOPS headroom exists for the proposed workload.
      next investigation: Confirm the declared sustainable IOPS envelope and the aligned demand peak on a real source.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not measured on a real array.
      assumptions:
        - Existing and proposed demand are aligned to the same modeled interval.
  Check iops.backend: modeled-ready
    headroom: 84560 ops/s
    % of operating budget: 57.7%   % of limit: 46.2%
    Finding R-BE-1: Combined backend operation demand is within the backend operating budget.
      evidence:
        - existing backend reads: 59200 ops/s (basis: derived from existing logical demand)
        - existing backend writes: 48000 ops/s (basis: derived from existing logical demand)
        - background backend demand: 0 ops/s (basis: declared on the demand sample; added exactly once)
        - proposed backend reads: 6640 ops/s (basis: derived: proposed reads × (1 − hit) + writes × factor)
        - proposed backend writes: 1600 ops/s (basis: derived: proposed writes × factor)
        - backend operating budget: 200000 ops/s (basis: 0.8 × backend sustainable operation limit)
        - backend sustainable operation limit: 250000 ops/s (basis: synthetic infrastructure profile)
      calculation: existing 107200 ops/s + background 0 + proposed 8240 ops/s (reads 6640 + writes 1600; RAID 5 factor 2+2 per logical write) = 115440 ops/s vs 200000 ops/s budget; headroom 84560 ops/s.
      implication: Modeled backend load is within budget under the RAID 5 read-modify-write factor.
      next investigation: Validate cache-hit fraction and write policy on the real system before relying on the estimate.
      confidence: high — Arithmetic on complete declared inputs within the explicitly bounded model; not a physical-array simulation.
      assumptions:
        - RAID 5 classic read-modify-write: each logical write costs 2 backend reads + 2 backend writes.
        - Write-back cache with no coalescing; sustained writes are not treated as zero.
        - Full-stripe writes, erasure coding, compression/dedup, metadata IO, flash write amplification, replication overhead, and rebuild load are outside this calculation.
Dimension throughput: modeled-ready
  Check throughput: modeled-ready
    headroom: 1900 MiB/s
    % of operating budget: 20.8%   % of limit: 16.7%
    Finding R-THR-1: Combined throughput demand is within the throughput operating budget.
      evidence:
        - existing throughput: 458752000 bytes/second (basis: derived: existing IOPS × block sizes)
        - proposed throughput: 65536000 bytes/second (basis: derived: proposed IOPS × block sizes)
        - throughput operating budget: 2516582400 bytes/second (basis: 0.8 × sustainable throughput limit)
        - sustainable throughput limit: 3145728000 bytes/second (basis: synthetic infrastructure profile)
      calculation: existing 437.5 MiB/s (448000 KiB/s) + proposed 62.5 MiB/s = 500 MiB/s vs 2400 MiB/s budget; headroom 1900 MiB/s.
      implication: Modeled sustained bandwidth headroom exists for the proposed workload.
      next investigation: Verify sustained throughput limits and the read/write block-size mix; derived throughput depends on both.
      confidence: high — Derived directly from declared IOPS and block sizes; synthetic values, not a measured limit.
      assumptions:
        - Throughput is derived from IOPS × block size, never an independent input.
Dimension latency: needs-investigation
  Check latency: needs-investigation
    headroom: n/a
    % of operating budget: n/a   % of limit: n/a
    Finding R-LAT-1: Baseline P95 latency 1.2 ms is at or below the workload target 1.5 ms; post-addition latency unknown: no response curve in V1.
      evidence:
        - baseline P95 latency: 1.2 ms (basis: aligned demand sample (screening indicator))
        - baseline maximum latency: 1.4 ms (basis: aligned demand sample)
        - workload latency target: 1.5 ms (basis: synthetic workload profile)
      calculation: baseline P95 1.2 ms vs target 1.5 ms; baseline max 1.4 ms shown alongside.
      implication: No baseline latency concern is indicated, but this says nothing about latency after the proposed workload is added.
      next investigation: Establish post-addition latency with a response model or measurements; V1 cannot.
      confidence: insufficient — Post-addition latency is an unknown in V1 by design.
      assumptions:
        - Baseline P95 is a screening indicator only; the maximum is shown alongside.
        - Post-addition latency unknown: no response curve in V1.
    Finding R-LAT-1: Baseline maximum latency is reported alongside P95 as context.
      evidence:
        - baseline maximum latency: 1.4 ms (basis: aligned demand sample)
        - workload latency target: 1.5 ms (basis: synthetic workload profile)
      calculation: baseline max 1.4 ms vs target 1.5 ms; the max is context, not the screening statistic.
      implication: Single-interval maxima can exceed the target even when P95 does not; both are baseline evidence only.
      next investigation: Review the distribution of minute latencies in the M2 weekly statistics.
      confidence: high — Reported value from supplied evidence; no inference made.
      assumptions:
        - Latency evidence is synthetic baseline data for the existing environment only.
Dimension protection: modeled-ready
  Check protection: modeled-ready
    headroom: n/a
    % of operating budget: n/a   % of limit: n/a
    Finding R-PRO-1: All declared workload protection requirements are satisfied by the infrastructure capabilities.
      evidence:
        - minimum tolerated drive failures required: 1 count (basis: workload protection requirement)
        - tolerated drive failures: 1 count (basis: synthetic infrastructure profile)
        - snapshots required: true flag (basis: workload protection requirement)
        - snapshots capability: true flag (basis: synthetic infrastructure profile)
        - encryptionAtRest required: true flag (basis: workload protection requirement)
        - encryptionAtRest capability: true flag (basis: synthetic infrastructure profile)
        - replication required: none mode (basis: workload protection requirement)
        - replication capability: unknown mode (basis: synthetic infrastructure profile; missing: replication capability not modeled)
      calculation: Capability matching over the fixed V1 vocabulary: toleratedDriveFailures: required 1 vs available 1 → modeled-ready; snapshots: required true vs available true → modeled-ready; encryptionAtRest: required true vs available true → modeled-ready; replication: required none vs available unknown → modeled-ready.
      implication: Declared protection capabilities meet the workload requirements within the V1 vocabulary.
      next investigation: Confirm capabilities on the real array; vocabulary coverage is selected capabilities only.
      confidence: moderate — Declared capability matching only; not a complete availability assurance.
      assumptions:
        - The V1 capability vocabulary covers selected capabilities, not complete availability assurance.
        - Replication is not equated with backup; availability is not inferred from a single feature.
Dimension growth: modeled-ready
  Check growth: modeled-ready
    headroom: 32 TiB
    % of operating budget: 84.9%   % of limit: 67.9%
    Finding R-GRO-1: Projected capacity at the 1-year horizon is within the capacity operating budget.
      evidence:
        - existing used capacity: 131941395333120 bytes (basis: aligned demand sample)
        - existing annual growth fraction: 0.15 fraction (basis: synthetic infrastructure profile)
        - proposed workload capacity: 32985348833280 bytes (basis: synthetic workload profile)
        - proposed annual growth fraction: 0.4 fraction (basis: synthetic workload profile)
        - planning horizon: 1 years (basis: assessment option)
        - capacity operating budget: 233096465088512 bytes (basis: 0.8 × usable capacity)
      calculation: projected = 120 TiB × (1 + 0.15)^1 + 30 TiB × (1 + 0.4)^1 = 180 TiB vs 212 TiB budget; headroom 32 TiB.
      implication: The modeled environment retains capacity headroom at the 1-year planning horizon.
      next investigation: Validate the declared growth fractions against observed consumption trends; compound growth dominates at longer horizons.
      confidence: high — Deterministic compound-growth arithmetic on declared synthetic inputs; growth rates themselves are assumptions.
      assumptions:
        - Annual growth fractions are synthetic assumptions, not observed trends.
        - Horizon is 1 year(s); horizon 0 equals the current-capacity check.
```

### what-if: rag-weekday-burst-query

#### rag-weekday-burst-query — demand 1.5×, horizon 0y

```
Synthetic data. Educational demonstration; not vendor sizing or production configuration guidance.
Overall: needs-investigation
Ruleset: 1.0.0-m1   Budget fraction: 0.8
Infrastructure: INF-A   Workload: WL-RAG   Sample: rag-weekday-burst-query
Options: demand multiplier 1.5x, horizon 0 year(s)
Dimension capacity: modeled-ready
  Check capacity: modeled-ready
    headroom: 62 TiB
    % of operating budget: 70.8%   % of limit: 56.6%
    Finding R-CAP-1: Combined used plus proposed capacity is within the capacity operating budget.
      evidence:
        - existing used capacity: 131941395333120 bytes (basis: aligned demand sample)
        - proposed workload capacity: 32985348833280 bytes (basis: synthetic workload profile)
        - capacity operating budget: 233096465088512 bytes (basis: 0.8 × usable capacity)
        - usable capacity limit: 291370581360640 bytes (basis: synthetic infrastructure profile)
      calculation: 120 TiB used + 30 TiB proposed = 150 TiB combined vs 212 TiB budget (0.8 × 265 TiB usable); headroom 62 TiB.
      implication: Modeled capacity headroom exists for the proposed workload at the declared synthetic values.
      next investigation: Confirm real usable capacity and current consumption before relying on this result.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not measured on a real array.
      assumptions:
        - Usable capacity excludes spares and metadata reserves.
Dimension iops: modeled-ready
  Check iops.frontend: modeled-ready
    headroom: 0 IOPS
    % of operating budget: 100.0%   % of limit: 80.0%
    Finding R-FE-1: Combined front-end IOPS demand is within the front-end operating budget.
      evidence:
        - existing front-end IOPS: 75000 IOPS (basis: aligned demand sample (reads + writes))
        - proposed front-end IOPS: 45000 IOPS (basis: aligned demand sample (reads + writes))
        - front-end IOPS operating budget: 120000 IOPS (basis: 0.8 × sustainable front-end IOPS limit)
        - sustainable front-end IOPS limit: 150000 IOPS (basis: synthetic infrastructure profile)
      calculation: 75000 existing + 45000 proposed = 120000 IOPS vs 120000 budget; headroom 0 IOPS.
      implication: Front-end logical IOPS headroom exists for the proposed workload.
      next investigation: Confirm the declared sustainable IOPS envelope and the aligned demand peak on a real source.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not measured on a real array.
      assumptions:
        - Existing and proposed demand are aligned to the same modeled interval.
  Check iops.backend: modeled-ready
    headroom: 26900 ops/s
    % of operating budget: 86.6%   % of limit: 69.2%
    Finding R-BE-1: Combined backend operation demand is within the backend operating budget.
      evidence:
        - existing backend reads: 81750 ops/s (basis: derived from existing logical demand)
        - existing backend writes: 45000 ops/s (basis: derived from existing logical demand)
        - background backend demand: 0 ops/s (basis: declared on the demand sample; added exactly once)
        - proposed backend reads: 37350 ops/s (basis: derived: proposed reads × (1 − hit) + writes × factor)
        - proposed backend writes: 9000 ops/s (basis: derived: proposed writes × factor)
        - backend operating budget: 200000 ops/s (basis: 0.8 × backend sustainable operation limit)
        - backend sustainable operation limit: 250000 ops/s (basis: synthetic infrastructure profile)
      calculation: existing 126750 ops/s + background 0 + proposed 46350 ops/s (reads 37350 + writes 9000; RAID 5 factor 2+2 per logical write) = 173100 ops/s vs 200000 ops/s budget; headroom 26900 ops/s.
      implication: Modeled backend load is within budget under the RAID 5 read-modify-write factor.
      next investigation: Validate cache-hit fraction and write policy on the real system before relying on the estimate.
      confidence: high — Arithmetic on complete declared inputs within the explicitly bounded model; not a physical-array simulation.
      assumptions:
        - RAID 5 classic read-modify-write: each logical write costs 2 backend reads + 2 backend writes.
        - Write-back cache with no coalescing; sustained writes are not treated as zero.
        - Full-stripe writes, erasure coding, compression/dedup, metadata IO, flash write amplification, replication overhead, and rebuild load are outside this calculation.
Dimension throughput: modeled-ready
  Check throughput: modeled-ready
    headroom: 1052.34 MiB/s
    % of operating budget: 56.2%   % of limit: 44.9%
    Finding R-THR-1: Combined throughput demand is within the throughput operating budget.
      evidence:
        - existing throughput: 1044480000 bytes/second (basis: derived: existing IOPS × block sizes)
        - proposed throughput: 368640000 bytes/second (basis: derived: proposed IOPS × block sizes)
        - throughput operating budget: 2516582400 bytes/second (basis: 0.8 × sustainable throughput limit)
        - sustainable throughput limit: 3145728000 bytes/second (basis: synthetic infrastructure profile)
      calculation: existing 996.09 MiB/s (1020000 KiB/s) + proposed 351.56 MiB/s = 1347.66 MiB/s vs 2400 MiB/s budget; headroom 1052.34 MiB/s.
      implication: Modeled sustained bandwidth headroom exists for the proposed workload.
      next investigation: Verify sustained throughput limits and the read/write block-size mix; derived throughput depends on both.
      confidence: high — Derived directly from declared IOPS and block sizes; synthetic values, not a measured limit.
      assumptions:
        - Throughput is derived from IOPS × block size, never an independent input.
Dimension latency: needs-investigation
  Check latency: needs-investigation
    headroom: n/a
    % of operating budget: n/a   % of limit: n/a
    Finding R-LAT-1: Baseline P95 latency 1.2 ms is at or below the workload target 1.5 ms; post-addition latency unknown: no response curve in V1.
      evidence:
        - baseline P95 latency: 1.2 ms (basis: aligned demand sample (screening indicator))
        - baseline maximum latency: 1.4 ms (basis: aligned demand sample)
        - workload latency target: 1.5 ms (basis: synthetic workload profile)
      calculation: baseline P95 1.2 ms vs target 1.5 ms; baseline max 1.4 ms shown alongside.
      implication: No baseline latency concern is indicated, but this says nothing about latency after the proposed workload is added.
      next investigation: Establish post-addition latency with a response model or measurements; V1 cannot.
      confidence: insufficient — Post-addition latency is an unknown in V1 by design.
      assumptions:
        - Baseline P95 is a screening indicator only; the maximum is shown alongside.
        - Post-addition latency unknown: no response curve in V1.
    Finding R-LAT-1: Baseline maximum latency is reported alongside P95 as context.
      evidence:
        - baseline maximum latency: 1.4 ms (basis: aligned demand sample)
        - workload latency target: 1.5 ms (basis: synthetic workload profile)
      calculation: baseline max 1.4 ms vs target 1.5 ms; the max is context, not the screening statistic.
      implication: Single-interval maxima can exceed the target even when P95 does not; both are baseline evidence only.
      next investigation: Review the distribution of minute latencies in the M2 weekly statistics.
      confidence: high — Reported value from supplied evidence; no inference made.
      assumptions:
        - Latency evidence is synthetic baseline data for the existing environment only.
Dimension protection: modeled-ready
  Check protection: modeled-ready
    headroom: n/a
    % of operating budget: n/a   % of limit: n/a
    Finding R-PRO-1: All declared workload protection requirements are satisfied by the infrastructure capabilities.
      evidence:
        - minimum tolerated drive failures required: 1 count (basis: workload protection requirement)
        - tolerated drive failures: 1 count (basis: synthetic infrastructure profile)
        - snapshots required: true flag (basis: workload protection requirement)
        - snapshots capability: true flag (basis: synthetic infrastructure profile)
        - encryptionAtRest required: true flag (basis: workload protection requirement)
        - encryptionAtRest capability: true flag (basis: synthetic infrastructure profile)
        - replication required: none mode (basis: workload protection requirement)
        - replication capability: unknown mode (basis: synthetic infrastructure profile; missing: replication capability not modeled)
      calculation: Capability matching over the fixed V1 vocabulary: toleratedDriveFailures: required 1 vs available 1 → modeled-ready; snapshots: required true vs available true → modeled-ready; encryptionAtRest: required true vs available true → modeled-ready; replication: required none vs available unknown → modeled-ready.
      implication: Declared protection capabilities meet the workload requirements within the V1 vocabulary.
      next investigation: Confirm capabilities on the real array; vocabulary coverage is selected capabilities only.
      confidence: moderate — Declared capability matching only; not a complete availability assurance.
      assumptions:
        - The V1 capability vocabulary covers selected capabilities, not complete availability assurance.
        - Replication is not equated with backup; availability is not inferred from a single feature.
Dimension growth: modeled-ready
  Check growth: modeled-ready
    headroom: 62 TiB
    % of operating budget: 70.8%   % of limit: 56.6%
    Finding R-GRO-1: Projected capacity at the 0-year horizon is within the capacity operating budget.
      evidence:
        - existing used capacity: 131941395333120 bytes (basis: aligned demand sample)
        - existing annual growth fraction: 0.15 fraction (basis: synthetic infrastructure profile)
        - proposed workload capacity: 32985348833280 bytes (basis: synthetic workload profile)
        - proposed annual growth fraction: 0.4 fraction (basis: synthetic workload profile)
        - planning horizon: 0 years (basis: assessment option)
        - capacity operating budget: 233096465088512 bytes (basis: 0.8 × usable capacity)
      calculation: projected = 120 TiB × (1 + 0.15)^0 + 30 TiB × (1 + 0.4)^0 = 150 TiB vs 212 TiB budget; headroom 62 TiB.
      implication: The modeled environment retains capacity headroom at the 0-year planning horizon.
      next investigation: Validate the declared growth fractions against observed consumption trends; compound growth dominates at longer horizons.
      confidence: high — Deterministic compound-growth arithmetic on declared synthetic inputs; growth rates themselves are assumptions.
      assumptions:
        - Annual growth fractions are synthetic assumptions, not observed trends.
        - Horizon is 0 year(s); horizon 0 equals the current-capacity check.
```

#### rag-weekday-burst-query — demand 1.5×, horizon 1y

```
Synthetic data. Educational demonstration; not vendor sizing or production configuration guidance.
Overall: needs-investigation
Ruleset: 1.0.0-m1   Budget fraction: 0.8
Infrastructure: INF-A   Workload: WL-RAG   Sample: rag-weekday-burst-query
Options: demand multiplier 1.5x, horizon 1 year(s)
Dimension capacity: modeled-ready
  Check capacity: modeled-ready
    headroom: 62 TiB
    % of operating budget: 70.8%   % of limit: 56.6%
    Finding R-CAP-1: Combined used plus proposed capacity is within the capacity operating budget.
      evidence:
        - existing used capacity: 131941395333120 bytes (basis: aligned demand sample)
        - proposed workload capacity: 32985348833280 bytes (basis: synthetic workload profile)
        - capacity operating budget: 233096465088512 bytes (basis: 0.8 × usable capacity)
        - usable capacity limit: 291370581360640 bytes (basis: synthetic infrastructure profile)
      calculation: 120 TiB used + 30 TiB proposed = 150 TiB combined vs 212 TiB budget (0.8 × 265 TiB usable); headroom 62 TiB.
      implication: Modeled capacity headroom exists for the proposed workload at the declared synthetic values.
      next investigation: Confirm real usable capacity and current consumption before relying on this result.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not measured on a real array.
      assumptions:
        - Usable capacity excludes spares and metadata reserves.
Dimension iops: modeled-ready
  Check iops.frontend: modeled-ready
    headroom: 0 IOPS
    % of operating budget: 100.0%   % of limit: 80.0%
    Finding R-FE-1: Combined front-end IOPS demand is within the front-end operating budget.
      evidence:
        - existing front-end IOPS: 75000 IOPS (basis: aligned demand sample (reads + writes))
        - proposed front-end IOPS: 45000 IOPS (basis: aligned demand sample (reads + writes))
        - front-end IOPS operating budget: 120000 IOPS (basis: 0.8 × sustainable front-end IOPS limit)
        - sustainable front-end IOPS limit: 150000 IOPS (basis: synthetic infrastructure profile)
      calculation: 75000 existing + 45000 proposed = 120000 IOPS vs 120000 budget; headroom 0 IOPS.
      implication: Front-end logical IOPS headroom exists for the proposed workload.
      next investigation: Confirm the declared sustainable IOPS envelope and the aligned demand peak on a real source.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not measured on a real array.
      assumptions:
        - Existing and proposed demand are aligned to the same modeled interval.
  Check iops.backend: modeled-ready
    headroom: 26900 ops/s
    % of operating budget: 86.6%   % of limit: 69.2%
    Finding R-BE-1: Combined backend operation demand is within the backend operating budget.
      evidence:
        - existing backend reads: 81750 ops/s (basis: derived from existing logical demand)
        - existing backend writes: 45000 ops/s (basis: derived from existing logical demand)
        - background backend demand: 0 ops/s (basis: declared on the demand sample; added exactly once)
        - proposed backend reads: 37350 ops/s (basis: derived: proposed reads × (1 − hit) + writes × factor)
        - proposed backend writes: 9000 ops/s (basis: derived: proposed writes × factor)
        - backend operating budget: 200000 ops/s (basis: 0.8 × backend sustainable operation limit)
        - backend sustainable operation limit: 250000 ops/s (basis: synthetic infrastructure profile)
      calculation: existing 126750 ops/s + background 0 + proposed 46350 ops/s (reads 37350 + writes 9000; RAID 5 factor 2+2 per logical write) = 173100 ops/s vs 200000 ops/s budget; headroom 26900 ops/s.
      implication: Modeled backend load is within budget under the RAID 5 read-modify-write factor.
      next investigation: Validate cache-hit fraction and write policy on the real system before relying on the estimate.
      confidence: high — Arithmetic on complete declared inputs within the explicitly bounded model; not a physical-array simulation.
      assumptions:
        - RAID 5 classic read-modify-write: each logical write costs 2 backend reads + 2 backend writes.
        - Write-back cache with no coalescing; sustained writes are not treated as zero.
        - Full-stripe writes, erasure coding, compression/dedup, metadata IO, flash write amplification, replication overhead, and rebuild load are outside this calculation.
Dimension throughput: modeled-ready
  Check throughput: modeled-ready
    headroom: 1052.34 MiB/s
    % of operating budget: 56.2%   % of limit: 44.9%
    Finding R-THR-1: Combined throughput demand is within the throughput operating budget.
      evidence:
        - existing throughput: 1044480000 bytes/second (basis: derived: existing IOPS × block sizes)
        - proposed throughput: 368640000 bytes/second (basis: derived: proposed IOPS × block sizes)
        - throughput operating budget: 2516582400 bytes/second (basis: 0.8 × sustainable throughput limit)
        - sustainable throughput limit: 3145728000 bytes/second (basis: synthetic infrastructure profile)
      calculation: existing 996.09 MiB/s (1020000 KiB/s) + proposed 351.56 MiB/s = 1347.66 MiB/s vs 2400 MiB/s budget; headroom 1052.34 MiB/s.
      implication: Modeled sustained bandwidth headroom exists for the proposed workload.
      next investigation: Verify sustained throughput limits and the read/write block-size mix; derived throughput depends on both.
      confidence: high — Derived directly from declared IOPS and block sizes; synthetic values, not a measured limit.
      assumptions:
        - Throughput is derived from IOPS × block size, never an independent input.
Dimension latency: needs-investigation
  Check latency: needs-investigation
    headroom: n/a
    % of operating budget: n/a   % of limit: n/a
    Finding R-LAT-1: Baseline P95 latency 1.2 ms is at or below the workload target 1.5 ms; post-addition latency unknown: no response curve in V1.
      evidence:
        - baseline P95 latency: 1.2 ms (basis: aligned demand sample (screening indicator))
        - baseline maximum latency: 1.4 ms (basis: aligned demand sample)
        - workload latency target: 1.5 ms (basis: synthetic workload profile)
      calculation: baseline P95 1.2 ms vs target 1.5 ms; baseline max 1.4 ms shown alongside.
      implication: No baseline latency concern is indicated, but this says nothing about latency after the proposed workload is added.
      next investigation: Establish post-addition latency with a response model or measurements; V1 cannot.
      confidence: insufficient — Post-addition latency is an unknown in V1 by design.
      assumptions:
        - Baseline P95 is a screening indicator only; the maximum is shown alongside.
        - Post-addition latency unknown: no response curve in V1.
    Finding R-LAT-1: Baseline maximum latency is reported alongside P95 as context.
      evidence:
        - baseline maximum latency: 1.4 ms (basis: aligned demand sample)
        - workload latency target: 1.5 ms (basis: synthetic workload profile)
      calculation: baseline max 1.4 ms vs target 1.5 ms; the max is context, not the screening statistic.
      implication: Single-interval maxima can exceed the target even when P95 does not; both are baseline evidence only.
      next investigation: Review the distribution of minute latencies in the M2 weekly statistics.
      confidence: high — Reported value from supplied evidence; no inference made.
      assumptions:
        - Latency evidence is synthetic baseline data for the existing environment only.
Dimension protection: modeled-ready
  Check protection: modeled-ready
    headroom: n/a
    % of operating budget: n/a   % of limit: n/a
    Finding R-PRO-1: All declared workload protection requirements are satisfied by the infrastructure capabilities.
      evidence:
        - minimum tolerated drive failures required: 1 count (basis: workload protection requirement)
        - tolerated drive failures: 1 count (basis: synthetic infrastructure profile)
        - snapshots required: true flag (basis: workload protection requirement)
        - snapshots capability: true flag (basis: synthetic infrastructure profile)
        - encryptionAtRest required: true flag (basis: workload protection requirement)
        - encryptionAtRest capability: true flag (basis: synthetic infrastructure profile)
        - replication required: none mode (basis: workload protection requirement)
        - replication capability: unknown mode (basis: synthetic infrastructure profile; missing: replication capability not modeled)
      calculation: Capability matching over the fixed V1 vocabulary: toleratedDriveFailures: required 1 vs available 1 → modeled-ready; snapshots: required true vs available true → modeled-ready; encryptionAtRest: required true vs available true → modeled-ready; replication: required none vs available unknown → modeled-ready.
      implication: Declared protection capabilities meet the workload requirements within the V1 vocabulary.
      next investigation: Confirm capabilities on the real array; vocabulary coverage is selected capabilities only.
      confidence: moderate — Declared capability matching only; not a complete availability assurance.
      assumptions:
        - The V1 capability vocabulary covers selected capabilities, not complete availability assurance.
        - Replication is not equated with backup; availability is not inferred from a single feature.
Dimension growth: modeled-ready
  Check growth: modeled-ready
    headroom: 32 TiB
    % of operating budget: 84.9%   % of limit: 67.9%
    Finding R-GRO-1: Projected capacity at the 1-year horizon is within the capacity operating budget.
      evidence:
        - existing used capacity: 131941395333120 bytes (basis: aligned demand sample)
        - existing annual growth fraction: 0.15 fraction (basis: synthetic infrastructure profile)
        - proposed workload capacity: 32985348833280 bytes (basis: synthetic workload profile)
        - proposed annual growth fraction: 0.4 fraction (basis: synthetic workload profile)
        - planning horizon: 1 years (basis: assessment option)
        - capacity operating budget: 233096465088512 bytes (basis: 0.8 × usable capacity)
      calculation: projected = 120 TiB × (1 + 0.15)^1 + 30 TiB × (1 + 0.4)^1 = 180 TiB vs 212 TiB budget; headroom 32 TiB.
      implication: The modeled environment retains capacity headroom at the 1-year planning horizon.
      next investigation: Validate the declared growth fractions against observed consumption trends; compound growth dominates at longer horizons.
      confidence: high — Deterministic compound-growth arithmetic on declared synthetic inputs; growth rates themselves are assumptions.
      assumptions:
        - Annual growth fractions are synthetic assumptions, not observed trends.
        - Horizon is 1 year(s); horizon 0 equals the current-capacity check.
```

#### rag-weekday-burst-query — demand 1.5×, horizon 3y

```
Synthetic data. Educational demonstration; not vendor sizing or production configuration guidance.
Overall: modeled-constraint
Ruleset: 1.0.0-m1   Budget fraction: 0.8
Infrastructure: INF-A   Workload: WL-RAG   Sample: rag-weekday-burst-query
Options: demand multiplier 1.5x, horizon 3 year(s)
Dimension capacity: modeled-ready
  Check capacity: modeled-ready
    headroom: 62 TiB
    % of operating budget: 70.8%   % of limit: 56.6%
    Finding R-CAP-1: Combined used plus proposed capacity is within the capacity operating budget.
      evidence:
        - existing used capacity: 131941395333120 bytes (basis: aligned demand sample)
        - proposed workload capacity: 32985348833280 bytes (basis: synthetic workload profile)
        - capacity operating budget: 233096465088512 bytes (basis: 0.8 × usable capacity)
        - usable capacity limit: 291370581360640 bytes (basis: synthetic infrastructure profile)
      calculation: 120 TiB used + 30 TiB proposed = 150 TiB combined vs 212 TiB budget (0.8 × 265 TiB usable); headroom 62 TiB.
      implication: Modeled capacity headroom exists for the proposed workload at the declared synthetic values.
      next investigation: Confirm real usable capacity and current consumption before relying on this result.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not measured on a real array.
      assumptions:
        - Usable capacity excludes spares and metadata reserves.
Dimension iops: modeled-ready
  Check iops.frontend: modeled-ready
    headroom: 0 IOPS
    % of operating budget: 100.0%   % of limit: 80.0%
    Finding R-FE-1: Combined front-end IOPS demand is within the front-end operating budget.
      evidence:
        - existing front-end IOPS: 75000 IOPS (basis: aligned demand sample (reads + writes))
        - proposed front-end IOPS: 45000 IOPS (basis: aligned demand sample (reads + writes))
        - front-end IOPS operating budget: 120000 IOPS (basis: 0.8 × sustainable front-end IOPS limit)
        - sustainable front-end IOPS limit: 150000 IOPS (basis: synthetic infrastructure profile)
      calculation: 75000 existing + 45000 proposed = 120000 IOPS vs 120000 budget; headroom 0 IOPS.
      implication: Front-end logical IOPS headroom exists for the proposed workload.
      next investigation: Confirm the declared sustainable IOPS envelope and the aligned demand peak on a real source.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not measured on a real array.
      assumptions:
        - Existing and proposed demand are aligned to the same modeled interval.
  Check iops.backend: modeled-ready
    headroom: 26900 ops/s
    % of operating budget: 86.6%   % of limit: 69.2%
    Finding R-BE-1: Combined backend operation demand is within the backend operating budget.
      evidence:
        - existing backend reads: 81750 ops/s (basis: derived from existing logical demand)
        - existing backend writes: 45000 ops/s (basis: derived from existing logical demand)
        - background backend demand: 0 ops/s (basis: declared on the demand sample; added exactly once)
        - proposed backend reads: 37350 ops/s (basis: derived: proposed reads × (1 − hit) + writes × factor)
        - proposed backend writes: 9000 ops/s (basis: derived: proposed writes × factor)
        - backend operating budget: 200000 ops/s (basis: 0.8 × backend sustainable operation limit)
        - backend sustainable operation limit: 250000 ops/s (basis: synthetic infrastructure profile)
      calculation: existing 126750 ops/s + background 0 + proposed 46350 ops/s (reads 37350 + writes 9000; RAID 5 factor 2+2 per logical write) = 173100 ops/s vs 200000 ops/s budget; headroom 26900 ops/s.
      implication: Modeled backend load is within budget under the RAID 5 read-modify-write factor.
      next investigation: Validate cache-hit fraction and write policy on the real system before relying on the estimate.
      confidence: high — Arithmetic on complete declared inputs within the explicitly bounded model; not a physical-array simulation.
      assumptions:
        - RAID 5 classic read-modify-write: each logical write costs 2 backend reads + 2 backend writes.
        - Write-back cache with no coalescing; sustained writes are not treated as zero.
        - Full-stripe writes, erasure coding, compression/dedup, metadata IO, flash write amplification, replication overhead, and rebuild load are outside this calculation.
Dimension throughput: modeled-ready
  Check throughput: modeled-ready
    headroom: 1052.34 MiB/s
    % of operating budget: 56.2%   % of limit: 44.9%
    Finding R-THR-1: Combined throughput demand is within the throughput operating budget.
      evidence:
        - existing throughput: 1044480000 bytes/second (basis: derived: existing IOPS × block sizes)
        - proposed throughput: 368640000 bytes/second (basis: derived: proposed IOPS × block sizes)
        - throughput operating budget: 2516582400 bytes/second (basis: 0.8 × sustainable throughput limit)
        - sustainable throughput limit: 3145728000 bytes/second (basis: synthetic infrastructure profile)
      calculation: existing 996.09 MiB/s (1020000 KiB/s) + proposed 351.56 MiB/s = 1347.66 MiB/s vs 2400 MiB/s budget; headroom 1052.34 MiB/s.
      implication: Modeled sustained bandwidth headroom exists for the proposed workload.
      next investigation: Verify sustained throughput limits and the read/write block-size mix; derived throughput depends on both.
      confidence: high — Derived directly from declared IOPS and block sizes; synthetic values, not a measured limit.
      assumptions:
        - Throughput is derived from IOPS × block size, never an independent input.
Dimension latency: needs-investigation
  Check latency: needs-investigation
    headroom: n/a
    % of operating budget: n/a   % of limit: n/a
    Finding R-LAT-1: Baseline P95 latency 1.2 ms is at or below the workload target 1.5 ms; post-addition latency unknown: no response curve in V1.
      evidence:
        - baseline P95 latency: 1.2 ms (basis: aligned demand sample (screening indicator))
        - baseline maximum latency: 1.4 ms (basis: aligned demand sample)
        - workload latency target: 1.5 ms (basis: synthetic workload profile)
      calculation: baseline P95 1.2 ms vs target 1.5 ms; baseline max 1.4 ms shown alongside.
      implication: No baseline latency concern is indicated, but this says nothing about latency after the proposed workload is added.
      next investigation: Establish post-addition latency with a response model or measurements; V1 cannot.
      confidence: insufficient — Post-addition latency is an unknown in V1 by design.
      assumptions:
        - Baseline P95 is a screening indicator only; the maximum is shown alongside.
        - Post-addition latency unknown: no response curve in V1.
    Finding R-LAT-1: Baseline maximum latency is reported alongside P95 as context.
      evidence:
        - baseline maximum latency: 1.4 ms (basis: aligned demand sample)
        - workload latency target: 1.5 ms (basis: synthetic workload profile)
      calculation: baseline max 1.4 ms vs target 1.5 ms; the max is context, not the screening statistic.
      implication: Single-interval maxima can exceed the target even when P95 does not; both are baseline evidence only.
      next investigation: Review the distribution of minute latencies in the M2 weekly statistics.
      confidence: high — Reported value from supplied evidence; no inference made.
      assumptions:
        - Latency evidence is synthetic baseline data for the existing environment only.
Dimension protection: modeled-ready
  Check protection: modeled-ready
    headroom: n/a
    % of operating budget: n/a   % of limit: n/a
    Finding R-PRO-1: All declared workload protection requirements are satisfied by the infrastructure capabilities.
      evidence:
        - minimum tolerated drive failures required: 1 count (basis: workload protection requirement)
        - tolerated drive failures: 1 count (basis: synthetic infrastructure profile)
        - snapshots required: true flag (basis: workload protection requirement)
        - snapshots capability: true flag (basis: synthetic infrastructure profile)
        - encryptionAtRest required: true flag (basis: workload protection requirement)
        - encryptionAtRest capability: true flag (basis: synthetic infrastructure profile)
        - replication required: none mode (basis: workload protection requirement)
        - replication capability: unknown mode (basis: synthetic infrastructure profile; missing: replication capability not modeled)
      calculation: Capability matching over the fixed V1 vocabulary: toleratedDriveFailures: required 1 vs available 1 → modeled-ready; snapshots: required true vs available true → modeled-ready; encryptionAtRest: required true vs available true → modeled-ready; replication: required none vs available unknown → modeled-ready.
      implication: Declared protection capabilities meet the workload requirements within the V1 vocabulary.
      next investigation: Confirm capabilities on the real array; vocabulary coverage is selected capabilities only.
      confidence: moderate — Declared capability matching only; not a complete availability assurance.
      assumptions:
        - The V1 capability vocabulary covers selected capabilities, not complete availability assurance.
        - Replication is not equated with backup; availability is not inferred from a single feature.
Dimension growth: modeled-constraint
  Check growth: modeled-constraint
    headroom: -52.82 TiB
    % of operating budget: 124.9%   % of limit: 99.9%
    Finding R-GRO-1: Projected capacity at the 3-year horizon exceeds the capacity operating budget.
      evidence:
        - existing used capacity: 131941395333120 bytes (basis: aligned demand sample)
        - existing annual growth fraction: 0.15 fraction (basis: synthetic infrastructure profile)
        - proposed workload capacity: 32985348833280 bytes (basis: synthetic workload profile)
        - proposed annual growth fraction: 0.4 fraction (basis: synthetic workload profile)
        - planning horizon: 3 years (basis: assessment option)
        - capacity operating budget: 233096465088512 bytes (basis: 0.8 × usable capacity)
      calculation: projected = 120 TiB × (1 + 0.15)^3 + 30 TiB × (1 + 0.4)^3 = 264.82 TiB vs 212 TiB budget; headroom -52.82 TiB.
      implication: Growth projection exceeds the capacity operating budget within 3 year(s); capacity expansion timing becomes a planning constraint.
      next investigation: Validate the declared growth fractions against observed consumption trends; compound growth dominates at longer horizons.
      confidence: high — Deterministic compound-growth arithmetic on declared synthetic inputs; growth rates themselves are assumptions.
      assumptions:
        - Annual growth fractions are synthetic assumptions, not observed trends.
        - Horizon is 3 year(s); horizon 0 equals the current-capacity check.
```

#### rag-weekday-burst-query — demand 2×, horizon 0y

```
Synthetic data. Educational demonstration; not vendor sizing or production configuration guidance.
Overall: modeled-constraint
Ruleset: 1.0.0-m1   Budget fraction: 0.8
Infrastructure: INF-A   Workload: WL-RAG   Sample: rag-weekday-burst-query
Options: demand multiplier 2x, horizon 0 year(s)
Dimension capacity: modeled-ready
  Check capacity: modeled-ready
    headroom: 62 TiB
    % of operating budget: 70.8%   % of limit: 56.6%
    Finding R-CAP-1: Combined used plus proposed capacity is within the capacity operating budget.
      evidence:
        - existing used capacity: 131941395333120 bytes (basis: aligned demand sample)
        - proposed workload capacity: 32985348833280 bytes (basis: synthetic workload profile)
        - capacity operating budget: 233096465088512 bytes (basis: 0.8 × usable capacity)
        - usable capacity limit: 291370581360640 bytes (basis: synthetic infrastructure profile)
      calculation: 120 TiB used + 30 TiB proposed = 150 TiB combined vs 212 TiB budget (0.8 × 265 TiB usable); headroom 62 TiB.
      implication: Modeled capacity headroom exists for the proposed workload at the declared synthetic values.
      next investigation: Confirm real usable capacity and current consumption before relying on this result.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not measured on a real array.
      assumptions:
        - Usable capacity excludes spares and metadata reserves.
Dimension iops: modeled-constraint
  Check iops.frontend: modeled-constraint
    headroom: -15000 IOPS
    % of operating budget: 112.5%   % of limit: 90.0%
    Finding R-FE-1: Combined front-end IOPS demand exceeds the front-end operating budget.
      evidence:
        - existing front-end IOPS: 75000 IOPS (basis: aligned demand sample (reads + writes))
        - proposed front-end IOPS: 60000 IOPS (basis: aligned demand sample (reads + writes))
        - front-end IOPS operating budget: 120000 IOPS (basis: 0.8 × sustainable front-end IOPS limit)
        - sustainable front-end IOPS limit: 150000 IOPS (basis: synthetic infrastructure profile)
      calculation: 75000 existing + 60000 proposed = 135000 IOPS vs 120000 budget; headroom -15000 IOPS.
      implication: Front-end logical IOPS demand exceeds the operating budget; the array front end is a candidate bottleneck.
      next investigation: Confirm the declared sustainable IOPS envelope and the aligned demand peak on a real source.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not measured on a real array.
      assumptions:
        - Existing and proposed demand are aligned to the same modeled interval.
  Check iops.backend: modeled-ready
    headroom: 11450 ops/s
    % of operating budget: 94.3%   % of limit: 75.4%
    Finding R-BE-1: Combined backend operation demand is within the backend operating budget.
      evidence:
        - existing backend reads: 81750 ops/s (basis: derived from existing logical demand)
        - existing backend writes: 45000 ops/s (basis: derived from existing logical demand)
        - background backend demand: 0 ops/s (basis: declared on the demand sample; added exactly once)
        - proposed backend reads: 49800 ops/s (basis: derived: proposed reads × (1 − hit) + writes × factor)
        - proposed backend writes: 12000 ops/s (basis: derived: proposed writes × factor)
        - backend operating budget: 200000 ops/s (basis: 0.8 × backend sustainable operation limit)
        - backend sustainable operation limit: 250000 ops/s (basis: synthetic infrastructure profile)
      calculation: existing 126750 ops/s + background 0 + proposed 61800 ops/s (reads 49800 + writes 12000; RAID 5 factor 2+2 per logical write) = 188550 ops/s vs 200000 ops/s budget; headroom 11450 ops/s.
      implication: Modeled backend load is within budget under the RAID 5 read-modify-write factor.
      next investigation: Validate cache-hit fraction and write policy on the real system before relying on the estimate.
      confidence: high — Arithmetic on complete declared inputs within the explicitly bounded model; not a physical-array simulation.
      assumptions:
        - RAID 5 classic read-modify-write: each logical write costs 2 backend reads + 2 backend writes.
        - Write-back cache with no coalescing; sustained writes are not treated as zero.
        - Full-stripe writes, erasure coding, compression/dedup, metadata IO, flash write amplification, replication overhead, and rebuild load are outside this calculation.
Dimension throughput: modeled-ready
  Check throughput: modeled-ready
    headroom: 935.16 MiB/s
    % of operating budget: 61.0%   % of limit: 48.8%
    Finding R-THR-1: Combined throughput demand is within the throughput operating budget.
      evidence:
        - existing throughput: 1044480000 bytes/second (basis: derived: existing IOPS × block sizes)
        - proposed throughput: 491520000 bytes/second (basis: derived: proposed IOPS × block sizes)
        - throughput operating budget: 2516582400 bytes/second (basis: 0.8 × sustainable throughput limit)
        - sustainable throughput limit: 3145728000 bytes/second (basis: synthetic infrastructure profile)
      calculation: existing 996.09 MiB/s (1020000 KiB/s) + proposed 468.75 MiB/s = 1464.84 MiB/s vs 2400 MiB/s budget; headroom 935.16 MiB/s.
      implication: Modeled sustained bandwidth headroom exists for the proposed workload.
      next investigation: Verify sustained throughput limits and the read/write block-size mix; derived throughput depends on both.
      confidence: high — Derived directly from declared IOPS and block sizes; synthetic values, not a measured limit.
      assumptions:
        - Throughput is derived from IOPS × block size, never an independent input.
Dimension latency: needs-investigation
  Check latency: needs-investigation
    headroom: n/a
    % of operating budget: n/a   % of limit: n/a
    Finding R-LAT-1: Baseline P95 latency 1.2 ms is at or below the workload target 1.5 ms; post-addition latency unknown: no response curve in V1.
      evidence:
        - baseline P95 latency: 1.2 ms (basis: aligned demand sample (screening indicator))
        - baseline maximum latency: 1.4 ms (basis: aligned demand sample)
        - workload latency target: 1.5 ms (basis: synthetic workload profile)
      calculation: baseline P95 1.2 ms vs target 1.5 ms; baseline max 1.4 ms shown alongside.
      implication: No baseline latency concern is indicated, but this says nothing about latency after the proposed workload is added.
      next investigation: Establish post-addition latency with a response model or measurements; V1 cannot.
      confidence: insufficient — Post-addition latency is an unknown in V1 by design.
      assumptions:
        - Baseline P95 is a screening indicator only; the maximum is shown alongside.
        - Post-addition latency unknown: no response curve in V1.
    Finding R-LAT-1: Baseline maximum latency is reported alongside P95 as context.
      evidence:
        - baseline maximum latency: 1.4 ms (basis: aligned demand sample)
        - workload latency target: 1.5 ms (basis: synthetic workload profile)
      calculation: baseline max 1.4 ms vs target 1.5 ms; the max is context, not the screening statistic.
      implication: Single-interval maxima can exceed the target even when P95 does not; both are baseline evidence only.
      next investigation: Review the distribution of minute latencies in the M2 weekly statistics.
      confidence: high — Reported value from supplied evidence; no inference made.
      assumptions:
        - Latency evidence is synthetic baseline data for the existing environment only.
Dimension protection: modeled-ready
  Check protection: modeled-ready
    headroom: n/a
    % of operating budget: n/a   % of limit: n/a
    Finding R-PRO-1: All declared workload protection requirements are satisfied by the infrastructure capabilities.
      evidence:
        - minimum tolerated drive failures required: 1 count (basis: workload protection requirement)
        - tolerated drive failures: 1 count (basis: synthetic infrastructure profile)
        - snapshots required: true flag (basis: workload protection requirement)
        - snapshots capability: true flag (basis: synthetic infrastructure profile)
        - encryptionAtRest required: true flag (basis: workload protection requirement)
        - encryptionAtRest capability: true flag (basis: synthetic infrastructure profile)
        - replication required: none mode (basis: workload protection requirement)
        - replication capability: unknown mode (basis: synthetic infrastructure profile; missing: replication capability not modeled)
      calculation: Capability matching over the fixed V1 vocabulary: toleratedDriveFailures: required 1 vs available 1 → modeled-ready; snapshots: required true vs available true → modeled-ready; encryptionAtRest: required true vs available true → modeled-ready; replication: required none vs available unknown → modeled-ready.
      implication: Declared protection capabilities meet the workload requirements within the V1 vocabulary.
      next investigation: Confirm capabilities on the real array; vocabulary coverage is selected capabilities only.
      confidence: moderate — Declared capability matching only; not a complete availability assurance.
      assumptions:
        - The V1 capability vocabulary covers selected capabilities, not complete availability assurance.
        - Replication is not equated with backup; availability is not inferred from a single feature.
Dimension growth: modeled-ready
  Check growth: modeled-ready
    headroom: 62 TiB
    % of operating budget: 70.8%   % of limit: 56.6%
    Finding R-GRO-1: Projected capacity at the 0-year horizon is within the capacity operating budget.
      evidence:
        - existing used capacity: 131941395333120 bytes (basis: aligned demand sample)
        - existing annual growth fraction: 0.15 fraction (basis: synthetic infrastructure profile)
        - proposed workload capacity: 32985348833280 bytes (basis: synthetic workload profile)
        - proposed annual growth fraction: 0.4 fraction (basis: synthetic workload profile)
        - planning horizon: 0 years (basis: assessment option)
        - capacity operating budget: 233096465088512 bytes (basis: 0.8 × usable capacity)
      calculation: projected = 120 TiB × (1 + 0.15)^0 + 30 TiB × (1 + 0.4)^0 = 150 TiB vs 212 TiB budget; headroom 62 TiB.
      implication: The modeled environment retains capacity headroom at the 0-year planning horizon.
      next investigation: Validate the declared growth fractions against observed consumption trends; compound growth dominates at longer horizons.
      confidence: high — Deterministic compound-growth arithmetic on declared synthetic inputs; growth rates themselves are assumptions.
      assumptions:
        - Annual growth fractions are synthetic assumptions, not observed trends.
        - Horizon is 0 year(s); horizon 0 equals the current-capacity check.
```

#### rag-weekday-burst-query — demand 2×, horizon 1y

```
Synthetic data. Educational demonstration; not vendor sizing or production configuration guidance.
Overall: modeled-constraint
Ruleset: 1.0.0-m1   Budget fraction: 0.8
Infrastructure: INF-A   Workload: WL-RAG   Sample: rag-weekday-burst-query
Options: demand multiplier 2x, horizon 1 year(s)
Dimension capacity: modeled-ready
  Check capacity: modeled-ready
    headroom: 62 TiB
    % of operating budget: 70.8%   % of limit: 56.6%
    Finding R-CAP-1: Combined used plus proposed capacity is within the capacity operating budget.
      evidence:
        - existing used capacity: 131941395333120 bytes (basis: aligned demand sample)
        - proposed workload capacity: 32985348833280 bytes (basis: synthetic workload profile)
        - capacity operating budget: 233096465088512 bytes (basis: 0.8 × usable capacity)
        - usable capacity limit: 291370581360640 bytes (basis: synthetic infrastructure profile)
      calculation: 120 TiB used + 30 TiB proposed = 150 TiB combined vs 212 TiB budget (0.8 × 265 TiB usable); headroom 62 TiB.
      implication: Modeled capacity headroom exists for the proposed workload at the declared synthetic values.
      next investigation: Confirm real usable capacity and current consumption before relying on this result.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not measured on a real array.
      assumptions:
        - Usable capacity excludes spares and metadata reserves.
Dimension iops: modeled-constraint
  Check iops.frontend: modeled-constraint
    headroom: -15000 IOPS
    % of operating budget: 112.5%   % of limit: 90.0%
    Finding R-FE-1: Combined front-end IOPS demand exceeds the front-end operating budget.
      evidence:
        - existing front-end IOPS: 75000 IOPS (basis: aligned demand sample (reads + writes))
        - proposed front-end IOPS: 60000 IOPS (basis: aligned demand sample (reads + writes))
        - front-end IOPS operating budget: 120000 IOPS (basis: 0.8 × sustainable front-end IOPS limit)
        - sustainable front-end IOPS limit: 150000 IOPS (basis: synthetic infrastructure profile)
      calculation: 75000 existing + 60000 proposed = 135000 IOPS vs 120000 budget; headroom -15000 IOPS.
      implication: Front-end logical IOPS demand exceeds the operating budget; the array front end is a candidate bottleneck.
      next investigation: Confirm the declared sustainable IOPS envelope and the aligned demand peak on a real source.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not measured on a real array.
      assumptions:
        - Existing and proposed demand are aligned to the same modeled interval.
  Check iops.backend: modeled-ready
    headroom: 11450 ops/s
    % of operating budget: 94.3%   % of limit: 75.4%
    Finding R-BE-1: Combined backend operation demand is within the backend operating budget.
      evidence:
        - existing backend reads: 81750 ops/s (basis: derived from existing logical demand)
        - existing backend writes: 45000 ops/s (basis: derived from existing logical demand)
        - background backend demand: 0 ops/s (basis: declared on the demand sample; added exactly once)
        - proposed backend reads: 49800 ops/s (basis: derived: proposed reads × (1 − hit) + writes × factor)
        - proposed backend writes: 12000 ops/s (basis: derived: proposed writes × factor)
        - backend operating budget: 200000 ops/s (basis: 0.8 × backend sustainable operation limit)
        - backend sustainable operation limit: 250000 ops/s (basis: synthetic infrastructure profile)
      calculation: existing 126750 ops/s + background 0 + proposed 61800 ops/s (reads 49800 + writes 12000; RAID 5 factor 2+2 per logical write) = 188550 ops/s vs 200000 ops/s budget; headroom 11450 ops/s.
      implication: Modeled backend load is within budget under the RAID 5 read-modify-write factor.
      next investigation: Validate cache-hit fraction and write policy on the real system before relying on the estimate.
      confidence: high — Arithmetic on complete declared inputs within the explicitly bounded model; not a physical-array simulation.
      assumptions:
        - RAID 5 classic read-modify-write: each logical write costs 2 backend reads + 2 backend writes.
        - Write-back cache with no coalescing; sustained writes are not treated as zero.
        - Full-stripe writes, erasure coding, compression/dedup, metadata IO, flash write amplification, replication overhead, and rebuild load are outside this calculation.
Dimension throughput: modeled-ready
  Check throughput: modeled-ready
    headroom: 935.16 MiB/s
    % of operating budget: 61.0%   % of limit: 48.8%
    Finding R-THR-1: Combined throughput demand is within the throughput operating budget.
      evidence:
        - existing throughput: 1044480000 bytes/second (basis: derived: existing IOPS × block sizes)
        - proposed throughput: 491520000 bytes/second (basis: derived: proposed IOPS × block sizes)
        - throughput operating budget: 2516582400 bytes/second (basis: 0.8 × sustainable throughput limit)
        - sustainable throughput limit: 3145728000 bytes/second (basis: synthetic infrastructure profile)
      calculation: existing 996.09 MiB/s (1020000 KiB/s) + proposed 468.75 MiB/s = 1464.84 MiB/s vs 2400 MiB/s budget; headroom 935.16 MiB/s.
      implication: Modeled sustained bandwidth headroom exists for the proposed workload.
      next investigation: Verify sustained throughput limits and the read/write block-size mix; derived throughput depends on both.
      confidence: high — Derived directly from declared IOPS and block sizes; synthetic values, not a measured limit.
      assumptions:
        - Throughput is derived from IOPS × block size, never an independent input.
Dimension latency: needs-investigation
  Check latency: needs-investigation
    headroom: n/a
    % of operating budget: n/a   % of limit: n/a
    Finding R-LAT-1: Baseline P95 latency 1.2 ms is at or below the workload target 1.5 ms; post-addition latency unknown: no response curve in V1.
      evidence:
        - baseline P95 latency: 1.2 ms (basis: aligned demand sample (screening indicator))
        - baseline maximum latency: 1.4 ms (basis: aligned demand sample)
        - workload latency target: 1.5 ms (basis: synthetic workload profile)
      calculation: baseline P95 1.2 ms vs target 1.5 ms; baseline max 1.4 ms shown alongside.
      implication: No baseline latency concern is indicated, but this says nothing about latency after the proposed workload is added.
      next investigation: Establish post-addition latency with a response model or measurements; V1 cannot.
      confidence: insufficient — Post-addition latency is an unknown in V1 by design.
      assumptions:
        - Baseline P95 is a screening indicator only; the maximum is shown alongside.
        - Post-addition latency unknown: no response curve in V1.
    Finding R-LAT-1: Baseline maximum latency is reported alongside P95 as context.
      evidence:
        - baseline maximum latency: 1.4 ms (basis: aligned demand sample)
        - workload latency target: 1.5 ms (basis: synthetic workload profile)
      calculation: baseline max 1.4 ms vs target 1.5 ms; the max is context, not the screening statistic.
      implication: Single-interval maxima can exceed the target even when P95 does not; both are baseline evidence only.
      next investigation: Review the distribution of minute latencies in the M2 weekly statistics.
      confidence: high — Reported value from supplied evidence; no inference made.
      assumptions:
        - Latency evidence is synthetic baseline data for the existing environment only.
Dimension protection: modeled-ready
  Check protection: modeled-ready
    headroom: n/a
    % of operating budget: n/a   % of limit: n/a
    Finding R-PRO-1: All declared workload protection requirements are satisfied by the infrastructure capabilities.
      evidence:
        - minimum tolerated drive failures required: 1 count (basis: workload protection requirement)
        - tolerated drive failures: 1 count (basis: synthetic infrastructure profile)
        - snapshots required: true flag (basis: workload protection requirement)
        - snapshots capability: true flag (basis: synthetic infrastructure profile)
        - encryptionAtRest required: true flag (basis: workload protection requirement)
        - encryptionAtRest capability: true flag (basis: synthetic infrastructure profile)
        - replication required: none mode (basis: workload protection requirement)
        - replication capability: unknown mode (basis: synthetic infrastructure profile; missing: replication capability not modeled)
      calculation: Capability matching over the fixed V1 vocabulary: toleratedDriveFailures: required 1 vs available 1 → modeled-ready; snapshots: required true vs available true → modeled-ready; encryptionAtRest: required true vs available true → modeled-ready; replication: required none vs available unknown → modeled-ready.
      implication: Declared protection capabilities meet the workload requirements within the V1 vocabulary.
      next investigation: Confirm capabilities on the real array; vocabulary coverage is selected capabilities only.
      confidence: moderate — Declared capability matching only; not a complete availability assurance.
      assumptions:
        - The V1 capability vocabulary covers selected capabilities, not complete availability assurance.
        - Replication is not equated with backup; availability is not inferred from a single feature.
Dimension growth: modeled-ready
  Check growth: modeled-ready
    headroom: 32 TiB
    % of operating budget: 84.9%   % of limit: 67.9%
    Finding R-GRO-1: Projected capacity at the 1-year horizon is within the capacity operating budget.
      evidence:
        - existing used capacity: 131941395333120 bytes (basis: aligned demand sample)
        - existing annual growth fraction: 0.15 fraction (basis: synthetic infrastructure profile)
        - proposed workload capacity: 32985348833280 bytes (basis: synthetic workload profile)
        - proposed annual growth fraction: 0.4 fraction (basis: synthetic workload profile)
        - planning horizon: 1 years (basis: assessment option)
        - capacity operating budget: 233096465088512 bytes (basis: 0.8 × usable capacity)
      calculation: projected = 120 TiB × (1 + 0.15)^1 + 30 TiB × (1 + 0.4)^1 = 180 TiB vs 212 TiB budget; headroom 32 TiB.
      implication: The modeled environment retains capacity headroom at the 1-year planning horizon.
      next investigation: Validate the declared growth fractions against observed consumption trends; compound growth dominates at longer horizons.
      confidence: high — Deterministic compound-growth arithmetic on declared synthetic inputs; growth rates themselves are assumptions.
      assumptions:
        - Annual growth fractions are synthetic assumptions, not observed trends.
        - Horizon is 1 year(s); horizon 0 equals the current-capacity check.
```

#### rag-weekday-burst-query — demand 2×, horizon 3y

```
Synthetic data. Educational demonstration; not vendor sizing or production configuration guidance.
Overall: modeled-constraint
Ruleset: 1.0.0-m1   Budget fraction: 0.8
Infrastructure: INF-A   Workload: WL-RAG   Sample: rag-weekday-burst-query
Options: demand multiplier 2x, horizon 3 year(s)
Dimension capacity: modeled-ready
  Check capacity: modeled-ready
    headroom: 62 TiB
    % of operating budget: 70.8%   % of limit: 56.6%
    Finding R-CAP-1: Combined used plus proposed capacity is within the capacity operating budget.
      evidence:
        - existing used capacity: 131941395333120 bytes (basis: aligned demand sample)
        - proposed workload capacity: 32985348833280 bytes (basis: synthetic workload profile)
        - capacity operating budget: 233096465088512 bytes (basis: 0.8 × usable capacity)
        - usable capacity limit: 291370581360640 bytes (basis: synthetic infrastructure profile)
      calculation: 120 TiB used + 30 TiB proposed = 150 TiB combined vs 212 TiB budget (0.8 × 265 TiB usable); headroom 62 TiB.
      implication: Modeled capacity headroom exists for the proposed workload at the declared synthetic values.
      next investigation: Confirm real usable capacity and current consumption before relying on this result.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not measured on a real array.
      assumptions:
        - Usable capacity excludes spares and metadata reserves.
Dimension iops: modeled-constraint
  Check iops.frontend: modeled-constraint
    headroom: -15000 IOPS
    % of operating budget: 112.5%   % of limit: 90.0%
    Finding R-FE-1: Combined front-end IOPS demand exceeds the front-end operating budget.
      evidence:
        - existing front-end IOPS: 75000 IOPS (basis: aligned demand sample (reads + writes))
        - proposed front-end IOPS: 60000 IOPS (basis: aligned demand sample (reads + writes))
        - front-end IOPS operating budget: 120000 IOPS (basis: 0.8 × sustainable front-end IOPS limit)
        - sustainable front-end IOPS limit: 150000 IOPS (basis: synthetic infrastructure profile)
      calculation: 75000 existing + 60000 proposed = 135000 IOPS vs 120000 budget; headroom -15000 IOPS.
      implication: Front-end logical IOPS demand exceeds the operating budget; the array front end is a candidate bottleneck.
      next investigation: Confirm the declared sustainable IOPS envelope and the aligned demand peak on a real source.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not measured on a real array.
      assumptions:
        - Existing and proposed demand are aligned to the same modeled interval.
  Check iops.backend: modeled-ready
    headroom: 11450 ops/s
    % of operating budget: 94.3%   % of limit: 75.4%
    Finding R-BE-1: Combined backend operation demand is within the backend operating budget.
      evidence:
        - existing backend reads: 81750 ops/s (basis: derived from existing logical demand)
        - existing backend writes: 45000 ops/s (basis: derived from existing logical demand)
        - background backend demand: 0 ops/s (basis: declared on the demand sample; added exactly once)
        - proposed backend reads: 49800 ops/s (basis: derived: proposed reads × (1 − hit) + writes × factor)
        - proposed backend writes: 12000 ops/s (basis: derived: proposed writes × factor)
        - backend operating budget: 200000 ops/s (basis: 0.8 × backend sustainable operation limit)
        - backend sustainable operation limit: 250000 ops/s (basis: synthetic infrastructure profile)
      calculation: existing 126750 ops/s + background 0 + proposed 61800 ops/s (reads 49800 + writes 12000; RAID 5 factor 2+2 per logical write) = 188550 ops/s vs 200000 ops/s budget; headroom 11450 ops/s.
      implication: Modeled backend load is within budget under the RAID 5 read-modify-write factor.
      next investigation: Validate cache-hit fraction and write policy on the real system before relying on the estimate.
      confidence: high — Arithmetic on complete declared inputs within the explicitly bounded model; not a physical-array simulation.
      assumptions:
        - RAID 5 classic read-modify-write: each logical write costs 2 backend reads + 2 backend writes.
        - Write-back cache with no coalescing; sustained writes are not treated as zero.
        - Full-stripe writes, erasure coding, compression/dedup, metadata IO, flash write amplification, replication overhead, and rebuild load are outside this calculation.
Dimension throughput: modeled-ready
  Check throughput: modeled-ready
    headroom: 935.16 MiB/s
    % of operating budget: 61.0%   % of limit: 48.8%
    Finding R-THR-1: Combined throughput demand is within the throughput operating budget.
      evidence:
        - existing throughput: 1044480000 bytes/second (basis: derived: existing IOPS × block sizes)
        - proposed throughput: 491520000 bytes/second (basis: derived: proposed IOPS × block sizes)
        - throughput operating budget: 2516582400 bytes/second (basis: 0.8 × sustainable throughput limit)
        - sustainable throughput limit: 3145728000 bytes/second (basis: synthetic infrastructure profile)
      calculation: existing 996.09 MiB/s (1020000 KiB/s) + proposed 468.75 MiB/s = 1464.84 MiB/s vs 2400 MiB/s budget; headroom 935.16 MiB/s.
      implication: Modeled sustained bandwidth headroom exists for the proposed workload.
      next investigation: Verify sustained throughput limits and the read/write block-size mix; derived throughput depends on both.
      confidence: high — Derived directly from declared IOPS and block sizes; synthetic values, not a measured limit.
      assumptions:
        - Throughput is derived from IOPS × block size, never an independent input.
Dimension latency: needs-investigation
  Check latency: needs-investigation
    headroom: n/a
    % of operating budget: n/a   % of limit: n/a
    Finding R-LAT-1: Baseline P95 latency 1.2 ms is at or below the workload target 1.5 ms; post-addition latency unknown: no response curve in V1.
      evidence:
        - baseline P95 latency: 1.2 ms (basis: aligned demand sample (screening indicator))
        - baseline maximum latency: 1.4 ms (basis: aligned demand sample)
        - workload latency target: 1.5 ms (basis: synthetic workload profile)
      calculation: baseline P95 1.2 ms vs target 1.5 ms; baseline max 1.4 ms shown alongside.
      implication: No baseline latency concern is indicated, but this says nothing about latency after the proposed workload is added.
      next investigation: Establish post-addition latency with a response model or measurements; V1 cannot.
      confidence: insufficient — Post-addition latency is an unknown in V1 by design.
      assumptions:
        - Baseline P95 is a screening indicator only; the maximum is shown alongside.
        - Post-addition latency unknown: no response curve in V1.
    Finding R-LAT-1: Baseline maximum latency is reported alongside P95 as context.
      evidence:
        - baseline maximum latency: 1.4 ms (basis: aligned demand sample)
        - workload latency target: 1.5 ms (basis: synthetic workload profile)
      calculation: baseline max 1.4 ms vs target 1.5 ms; the max is context, not the screening statistic.
      implication: Single-interval maxima can exceed the target even when P95 does not; both are baseline evidence only.
      next investigation: Review the distribution of minute latencies in the M2 weekly statistics.
      confidence: high — Reported value from supplied evidence; no inference made.
      assumptions:
        - Latency evidence is synthetic baseline data for the existing environment only.
Dimension protection: modeled-ready
  Check protection: modeled-ready
    headroom: n/a
    % of operating budget: n/a   % of limit: n/a
    Finding R-PRO-1: All declared workload protection requirements are satisfied by the infrastructure capabilities.
      evidence:
        - minimum tolerated drive failures required: 1 count (basis: workload protection requirement)
        - tolerated drive failures: 1 count (basis: synthetic infrastructure profile)
        - snapshots required: true flag (basis: workload protection requirement)
        - snapshots capability: true flag (basis: synthetic infrastructure profile)
        - encryptionAtRest required: true flag (basis: workload protection requirement)
        - encryptionAtRest capability: true flag (basis: synthetic infrastructure profile)
        - replication required: none mode (basis: workload protection requirement)
        - replication capability: unknown mode (basis: synthetic infrastructure profile; missing: replication capability not modeled)
      calculation: Capability matching over the fixed V1 vocabulary: toleratedDriveFailures: required 1 vs available 1 → modeled-ready; snapshots: required true vs available true → modeled-ready; encryptionAtRest: required true vs available true → modeled-ready; replication: required none vs available unknown → modeled-ready.
      implication: Declared protection capabilities meet the workload requirements within the V1 vocabulary.
      next investigation: Confirm capabilities on the real array; vocabulary coverage is selected capabilities only.
      confidence: moderate — Declared capability matching only; not a complete availability assurance.
      assumptions:
        - The V1 capability vocabulary covers selected capabilities, not complete availability assurance.
        - Replication is not equated with backup; availability is not inferred from a single feature.
Dimension growth: modeled-constraint
  Check growth: modeled-constraint
    headroom: -52.82 TiB
    % of operating budget: 124.9%   % of limit: 99.9%
    Finding R-GRO-1: Projected capacity at the 3-year horizon exceeds the capacity operating budget.
      evidence:
        - existing used capacity: 131941395333120 bytes (basis: aligned demand sample)
        - existing annual growth fraction: 0.15 fraction (basis: synthetic infrastructure profile)
        - proposed workload capacity: 32985348833280 bytes (basis: synthetic workload profile)
        - proposed annual growth fraction: 0.4 fraction (basis: synthetic workload profile)
        - planning horizon: 3 years (basis: assessment option)
        - capacity operating budget: 233096465088512 bytes (basis: 0.8 × usable capacity)
      calculation: projected = 120 TiB × (1 + 0.15)^3 + 30 TiB × (1 + 0.4)^3 = 264.82 TiB vs 212 TiB budget; headroom -52.82 TiB.
      implication: Growth projection exceeds the capacity operating budget within 3 year(s); capacity expansion timing becomes a planning constraint.
      next investigation: Validate the declared growth fractions against observed consumption trends; compound growth dominates at longer horizons.
      confidence: high — Deterministic compound-growth arithmetic on declared synthetic inputs; growth rates themselves are assumptions.
      assumptions:
        - Annual growth fractions are synthetic assumptions, not observed trends.
        - Horizon is 3 year(s); horizon 0 equals the current-capacity check.
```


## INF-B × WL-RAG

### rag-weekday-business-query

```
Synthetic data. Educational demonstration; not vendor sizing or production configuration guidance.
Overall: modeled-constraint
Ruleset: 1.0.0-m1   Budget fraction: 0.8
Infrastructure: INF-B   Workload: WL-RAG   Sample: rag-weekday-business-query
Options: demand multiplier 1x, horizon 1 year(s)
Dimension capacity: modeled-ready
  Check capacity: modeled-ready
    headroom: 19.6 TiB
    % of operating budget: 88.4%   % of limit: 70.8%
    Finding R-CAP-1: Combined used plus proposed capacity is within the capacity operating budget.
      evidence:
        - existing used capacity: 131941395333120 bytes (basis: aligned demand sample)
        - proposed workload capacity: 32985348833280 bytes (basis: synthetic workload profile)
        - capacity operating budget: 186477172070809.62 bytes (basis: 0.8 × usable capacity)
        - usable capacity limit: 233096465088512 bytes (basis: synthetic infrastructure profile)
      calculation: 120 TiB used + 30 TiB proposed = 150 TiB combined vs 169.6 TiB budget (0.8 × 212 TiB usable); headroom 19.6 TiB.
      implication: Modeled capacity headroom exists for the proposed workload at the declared synthetic values.
      next investigation: Confirm real usable capacity and current consumption before relying on this result.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not measured on a real array.
      assumptions:
        - Usable capacity excludes spares and metadata reserves.
Dimension iops: modeled-ready
  Check iops.frontend: modeled-ready
    headroom: 40000 IOPS
    % of operating budget: 66.7%   % of limit: 53.3%
    Finding R-FE-1: Combined front-end IOPS demand is within the front-end operating budget.
      evidence:
        - existing front-end IOPS: 50000 IOPS (basis: aligned demand sample (reads + writes))
        - proposed front-end IOPS: 30000 IOPS (basis: aligned demand sample (reads + writes))
        - front-end IOPS operating budget: 120000 IOPS (basis: 0.8 × sustainable front-end IOPS limit)
        - sustainable front-end IOPS limit: 150000 IOPS (basis: synthetic infrastructure profile)
      calculation: 50000 existing + 30000 proposed = 80000 IOPS vs 120000 budget; headroom 40000 IOPS.
      implication: Front-end logical IOPS headroom exists for the proposed workload.
      next investigation: Confirm the declared sustainable IOPS envelope and the aligned demand peak on a real source.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not measured on a real array.
      assumptions:
        - Existing and proposed demand are aligned to the same modeled interval.
  Check iops.backend: modeled-ready
    headroom: 48600 ops/s
    % of operating budget: 75.7%   % of limit: 60.6%
    Finding R-BE-1: Combined backend operation demand is within the backend operating budget.
      evidence:
        - existing backend reads: 69500 ops/s (basis: derived from existing logical demand)
        - existing backend writes: 45000 ops/s (basis: derived from existing logical demand)
        - background backend demand: 0 ops/s (basis: declared on the demand sample; added exactly once)
        - proposed backend reads: 27900 ops/s (basis: derived: proposed reads × (1 − hit) + writes × factor)
        - proposed backend writes: 9000 ops/s (basis: derived: proposed writes × factor)
        - backend operating budget: 200000 ops/s (basis: 0.8 × backend sustainable operation limit)
        - backend sustainable operation limit: 250000 ops/s (basis: synthetic infrastructure profile)
      calculation: existing 114500 ops/s + background 0 + proposed 36900 ops/s (reads 27900 + writes 9000; RAID 6 factor 3+3 per logical write) = 151400 ops/s vs 200000 ops/s budget; headroom 48600 ops/s.
      implication: Modeled backend load is within budget under the RAID 6 read-modify-write factor.
      next investigation: Validate cache-hit fraction and write policy on the real system before relying on the estimate.
      confidence: high — Arithmetic on complete declared inputs within the explicitly bounded model; not a physical-array simulation.
      assumptions:
        - RAID 6 classic read-modify-write: each logical write costs 3 backend reads + 3 backend writes.
        - Write-back cache with no coalescing; sustained writes are not treated as zero.
        - Full-stripe writes, erasure coding, compression/dedup, metadata IO, flash write amplification, replication overhead, and rebuild load are outside this calculation.
Dimension throughput: modeled-ready
  Check throughput: modeled-ready
    headroom: 1501.56 MiB/s
    % of operating budget: 37.4%   % of limit: 29.9%
    Finding R-THR-1: Combined throughput demand is within the throughput operating budget.
      evidence:
        - existing throughput: 696320000 bytes/second (basis: derived: existing IOPS × block sizes)
        - proposed throughput: 245760000 bytes/second (basis: derived: proposed IOPS × block sizes)
        - throughput operating budget: 2516582400 bytes/second (basis: 0.8 × sustainable throughput limit)
        - sustainable throughput limit: 3145728000 bytes/second (basis: synthetic infrastructure profile)
      calculation: existing 664.06 MiB/s (680000 KiB/s) + proposed 234.38 MiB/s = 898.44 MiB/s vs 2400 MiB/s budget; headroom 1501.56 MiB/s.
      implication: Modeled sustained bandwidth headroom exists for the proposed workload.
      next investigation: Verify sustained throughput limits and the read/write block-size mix; derived throughput depends on both.
      confidence: high — Derived directly from declared IOPS and block sizes; synthetic values, not a measured limit.
      assumptions:
        - Throughput is derived from IOPS × block size, never an independent input.
Dimension latency: needs-investigation
  Check latency: needs-investigation
    headroom: n/a
    % of operating budget: n/a   % of limit: n/a
    Finding R-LAT-1: Baseline P95 latency 1.2 ms is at or below the workload target 1.5 ms; post-addition latency unknown: no response curve in V1.
      evidence:
        - baseline P95 latency: 1.2 ms (basis: aligned demand sample (screening indicator))
        - baseline maximum latency: 1.4 ms (basis: aligned demand sample)
        - workload latency target: 1.5 ms (basis: synthetic workload profile)
      calculation: baseline P95 1.2 ms vs target 1.5 ms; baseline max 1.4 ms shown alongside.
      implication: No baseline latency concern is indicated, but this says nothing about latency after the proposed workload is added.
      next investigation: Establish post-addition latency with a response model or measurements; V1 cannot.
      confidence: insufficient — Post-addition latency is an unknown in V1 by design.
      assumptions:
        - Baseline P95 is a screening indicator only; the maximum is shown alongside.
        - Post-addition latency unknown: no response curve in V1.
    Finding R-LAT-1: Baseline maximum latency is reported alongside P95 as context.
      evidence:
        - baseline maximum latency: 1.4 ms (basis: aligned demand sample)
        - workload latency target: 1.5 ms (basis: synthetic workload profile)
      calculation: baseline max 1.4 ms vs target 1.5 ms; the max is context, not the screening statistic.
      implication: Single-interval maxima can exceed the target even when P95 does not; both are baseline evidence only.
      next investigation: Review the distribution of minute latencies in the M2 weekly statistics.
      confidence: high — Reported value from supplied evidence; no inference made.
      assumptions:
        - Latency evidence is synthetic baseline data for the existing environment only.
Dimension protection: modeled-ready
  Check protection: modeled-ready
    headroom: n/a
    % of operating budget: n/a   % of limit: n/a
    Finding R-PRO-1: All declared workload protection requirements are satisfied by the infrastructure capabilities.
      evidence:
        - minimum tolerated drive failures required: 1 count (basis: workload protection requirement)
        - tolerated drive failures: 2 count (basis: synthetic infrastructure profile)
        - snapshots required: true flag (basis: workload protection requirement)
        - snapshots capability: true flag (basis: synthetic infrastructure profile)
        - encryptionAtRest required: true flag (basis: workload protection requirement)
        - encryptionAtRest capability: true flag (basis: synthetic infrastructure profile)
        - replication required: none mode (basis: workload protection requirement)
        - replication capability: unknown mode (basis: synthetic infrastructure profile; missing: replication capability not modeled)
      calculation: Capability matching over the fixed V1 vocabulary: toleratedDriveFailures: required 1 vs available 2 → modeled-ready; snapshots: required true vs available true → modeled-ready; encryptionAtRest: required true vs available true → modeled-ready; replication: required none vs available unknown → modeled-ready.
      implication: Declared protection capabilities meet the workload requirements within the V1 vocabulary.
      next investigation: Confirm capabilities on the real array; vocabulary coverage is selected capabilities only.
      confidence: moderate — Declared capability matching only; not a complete availability assurance.
      assumptions:
        - The V1 capability vocabulary covers selected capabilities, not complete availability assurance.
        - Replication is not equated with backup; availability is not inferred from a single feature.
Dimension growth: modeled-constraint
  Check growth: modeled-constraint
    headroom: -10.4 TiB
    % of operating budget: 106.1%   % of limit: 84.9%
    Finding R-GRO-1: Projected capacity at the 1-year horizon exceeds the capacity operating budget.
      evidence:
        - existing used capacity: 131941395333120 bytes (basis: aligned demand sample)
        - existing annual growth fraction: 0.15 fraction (basis: synthetic infrastructure profile)
        - proposed workload capacity: 32985348833280 bytes (basis: synthetic workload profile)
        - proposed annual growth fraction: 0.4 fraction (basis: synthetic workload profile)
        - planning horizon: 1 years (basis: assessment option)
        - capacity operating budget: 186477172070809.62 bytes (basis: 0.8 × usable capacity)
      calculation: projected = 120 TiB × (1 + 0.15)^1 + 30 TiB × (1 + 0.4)^1 = 180 TiB vs 169.6 TiB budget; headroom -10.4 TiB.
      implication: Growth projection exceeds the capacity operating budget within 1 year(s); capacity expansion timing becomes a planning constraint.
      next investigation: Validate the declared growth fractions against observed consumption trends; compound growth dominates at longer horizons.
      confidence: high — Deterministic compound-growth arithmetic on declared synthetic inputs; growth rates themselves are assumptions.
      assumptions:
        - Annual growth fractions are synthetic assumptions, not observed trends.
        - Horizon is 1 year(s); horizon 0 equals the current-capacity check.
```

### rag-weekday-burst-query

```
Synthetic data. Educational demonstration; not vendor sizing or production configuration guidance.
Overall: modeled-constraint
Ruleset: 1.0.0-m1   Budget fraction: 0.8
Infrastructure: INF-B   Workload: WL-RAG   Sample: rag-weekday-burst-query
Options: demand multiplier 1x, horizon 1 year(s)
Dimension capacity: modeled-ready
  Check capacity: modeled-ready
    headroom: 19.6 TiB
    % of operating budget: 88.4%   % of limit: 70.8%
    Finding R-CAP-1: Combined used plus proposed capacity is within the capacity operating budget.
      evidence:
        - existing used capacity: 131941395333120 bytes (basis: aligned demand sample)
        - proposed workload capacity: 32985348833280 bytes (basis: synthetic workload profile)
        - capacity operating budget: 186477172070809.62 bytes (basis: 0.8 × usable capacity)
        - usable capacity limit: 233096465088512 bytes (basis: synthetic infrastructure profile)
      calculation: 120 TiB used + 30 TiB proposed = 150 TiB combined vs 169.6 TiB budget (0.8 × 212 TiB usable); headroom 19.6 TiB.
      implication: Modeled capacity headroom exists for the proposed workload at the declared synthetic values.
      next investigation: Confirm real usable capacity and current consumption before relying on this result.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not measured on a real array.
      assumptions:
        - Usable capacity excludes spares and metadata reserves.
Dimension iops: modeled-constraint
  Check iops.frontend: modeled-ready
    headroom: 15000 IOPS
    % of operating budget: 87.5%   % of limit: 70.0%
    Finding R-FE-1: Combined front-end IOPS demand is within the front-end operating budget.
      evidence:
        - existing front-end IOPS: 75000 IOPS (basis: aligned demand sample (reads + writes))
        - proposed front-end IOPS: 30000 IOPS (basis: aligned demand sample (reads + writes))
        - front-end IOPS operating budget: 120000 IOPS (basis: 0.8 × sustainable front-end IOPS limit)
        - sustainable front-end IOPS limit: 150000 IOPS (basis: synthetic infrastructure profile)
      calculation: 75000 existing + 30000 proposed = 105000 IOPS vs 120000 budget; headroom 15000 IOPS.
      implication: Front-end logical IOPS headroom exists for the proposed workload.
      next investigation: Confirm the declared sustainable IOPS envelope and the aligned demand peak on a real source.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not measured on a real array.
      assumptions:
        - Existing and proposed demand are aligned to the same modeled interval.
  Check iops.backend: modeled-constraint
    headroom: -8650 ops/s
    % of operating budget: 104.3%   % of limit: 83.5%
    Finding R-BE-4: Combined backend operation demand exceeds the backend operating budget. Front-end headroom exists, but backend operations exceed the budget because of the RAID write factor.
      evidence:
        - existing backend reads: 104250 ops/s (basis: derived from existing logical demand)
        - existing backend writes: 67500 ops/s (basis: derived from existing logical demand)
        - background backend demand: 0 ops/s (basis: declared on the demand sample; added exactly once)
        - proposed backend reads: 27900 ops/s (basis: derived: proposed reads × (1 − hit) + writes × factor)
        - proposed backend writes: 9000 ops/s (basis: derived: proposed writes × factor)
        - backend operating budget: 200000 ops/s (basis: 0.8 × backend sustainable operation limit)
        - backend sustainable operation limit: 250000 ops/s (basis: synthetic infrastructure profile)
      calculation: existing 171750 ops/s + background 0 + proposed 36900 ops/s (reads 27900 + writes 9000; RAID 6 factor 3+3 per logical write) = 208650 ops/s vs 200000 ops/s budget; headroom -8650 ops/s.
      implication: The RAID 6 write factor pushes modeled backend operations over budget. Front-end headroom exists, but backend operations exceed the budget because of the RAID write factor.
      next investigation: Investigate whether the real array coalesces writes (outside the V1 model), or reduce proposed write demand.
      confidence: high — Arithmetic on complete declared inputs within the explicitly bounded model; not a physical-array simulation.
      assumptions:
        - RAID 6 classic read-modify-write: each logical write costs 3 backend reads + 3 backend writes.
        - Write-back cache with no coalescing; sustained writes are not treated as zero.
        - Full-stripe writes, erasure coding, compression/dedup, metadata IO, flash write amplification, replication overhead, and rebuild load are outside this calculation.
Dimension throughput: modeled-ready
  Check throughput: modeled-ready
    headroom: 1169.53 MiB/s
    % of operating budget: 51.3%   % of limit: 41.0%
    Finding R-THR-1: Combined throughput demand is within the throughput operating budget.
      evidence:
        - existing throughput: 1044480000 bytes/second (basis: derived: existing IOPS × block sizes)
        - proposed throughput: 245760000 bytes/second (basis: derived: proposed IOPS × block sizes)
        - throughput operating budget: 2516582400 bytes/second (basis: 0.8 × sustainable throughput limit)
        - sustainable throughput limit: 3145728000 bytes/second (basis: synthetic infrastructure profile)
      calculation: existing 996.09 MiB/s (1020000 KiB/s) + proposed 234.38 MiB/s = 1230.47 MiB/s vs 2400 MiB/s budget; headroom 1169.53 MiB/s.
      implication: Modeled sustained bandwidth headroom exists for the proposed workload.
      next investigation: Verify sustained throughput limits and the read/write block-size mix; derived throughput depends on both.
      confidence: high — Derived directly from declared IOPS and block sizes; synthetic values, not a measured limit.
      assumptions:
        - Throughput is derived from IOPS × block size, never an independent input.
Dimension latency: needs-investigation
  Check latency: needs-investigation
    headroom: n/a
    % of operating budget: n/a   % of limit: n/a
    Finding R-LAT-1: Baseline P95 latency 1.2 ms is at or below the workload target 1.5 ms; post-addition latency unknown: no response curve in V1.
      evidence:
        - baseline P95 latency: 1.2 ms (basis: aligned demand sample (screening indicator))
        - baseline maximum latency: 1.4 ms (basis: aligned demand sample)
        - workload latency target: 1.5 ms (basis: synthetic workload profile)
      calculation: baseline P95 1.2 ms vs target 1.5 ms; baseline max 1.4 ms shown alongside.
      implication: No baseline latency concern is indicated, but this says nothing about latency after the proposed workload is added.
      next investigation: Establish post-addition latency with a response model or measurements; V1 cannot.
      confidence: insufficient — Post-addition latency is an unknown in V1 by design.
      assumptions:
        - Baseline P95 is a screening indicator only; the maximum is shown alongside.
        - Post-addition latency unknown: no response curve in V1.
    Finding R-LAT-1: Baseline maximum latency is reported alongside P95 as context.
      evidence:
        - baseline maximum latency: 1.4 ms (basis: aligned demand sample)
        - workload latency target: 1.5 ms (basis: synthetic workload profile)
      calculation: baseline max 1.4 ms vs target 1.5 ms; the max is context, not the screening statistic.
      implication: Single-interval maxima can exceed the target even when P95 does not; both are baseline evidence only.
      next investigation: Review the distribution of minute latencies in the M2 weekly statistics.
      confidence: high — Reported value from supplied evidence; no inference made.
      assumptions:
        - Latency evidence is synthetic baseline data for the existing environment only.
Dimension protection: modeled-ready
  Check protection: modeled-ready
    headroom: n/a
    % of operating budget: n/a   % of limit: n/a
    Finding R-PRO-1: All declared workload protection requirements are satisfied by the infrastructure capabilities.
      evidence:
        - minimum tolerated drive failures required: 1 count (basis: workload protection requirement)
        - tolerated drive failures: 2 count (basis: synthetic infrastructure profile)
        - snapshots required: true flag (basis: workload protection requirement)
        - snapshots capability: true flag (basis: synthetic infrastructure profile)
        - encryptionAtRest required: true flag (basis: workload protection requirement)
        - encryptionAtRest capability: true flag (basis: synthetic infrastructure profile)
        - replication required: none mode (basis: workload protection requirement)
        - replication capability: unknown mode (basis: synthetic infrastructure profile; missing: replication capability not modeled)
      calculation: Capability matching over the fixed V1 vocabulary: toleratedDriveFailures: required 1 vs available 2 → modeled-ready; snapshots: required true vs available true → modeled-ready; encryptionAtRest: required true vs available true → modeled-ready; replication: required none vs available unknown → modeled-ready.
      implication: Declared protection capabilities meet the workload requirements within the V1 vocabulary.
      next investigation: Confirm capabilities on the real array; vocabulary coverage is selected capabilities only.
      confidence: moderate — Declared capability matching only; not a complete availability assurance.
      assumptions:
        - The V1 capability vocabulary covers selected capabilities, not complete availability assurance.
        - Replication is not equated with backup; availability is not inferred from a single feature.
Dimension growth: modeled-constraint
  Check growth: modeled-constraint
    headroom: -10.4 TiB
    % of operating budget: 106.1%   % of limit: 84.9%
    Finding R-GRO-1: Projected capacity at the 1-year horizon exceeds the capacity operating budget.
      evidence:
        - existing used capacity: 131941395333120 bytes (basis: aligned demand sample)
        - existing annual growth fraction: 0.15 fraction (basis: synthetic infrastructure profile)
        - proposed workload capacity: 32985348833280 bytes (basis: synthetic workload profile)
        - proposed annual growth fraction: 0.4 fraction (basis: synthetic workload profile)
        - planning horizon: 1 years (basis: assessment option)
        - capacity operating budget: 186477172070809.62 bytes (basis: 0.8 × usable capacity)
      calculation: projected = 120 TiB × (1 + 0.15)^1 + 30 TiB × (1 + 0.4)^1 = 180 TiB vs 169.6 TiB budget; headroom -10.4 TiB.
      implication: Growth projection exceeds the capacity operating budget within 1 year(s); capacity expansion timing becomes a planning constraint.
      next investigation: Validate the declared growth fractions against observed consumption trends; compound growth dominates at longer horizons.
      confidence: high — Deterministic compound-growth arithmetic on declared synthetic inputs; growth rates themselves are assumptions.
      assumptions:
        - Annual growth fractions are synthetic assumptions, not observed trends.
        - Horizon is 1 year(s); horizon 0 equals the current-capacity check.
```

### rag-weekday-ingestion

```
Synthetic data. Educational demonstration; not vendor sizing or production configuration guidance.
Overall: modeled-constraint
Ruleset: 1.0.0-m1   Budget fraction: 0.8
Infrastructure: INF-B   Workload: WL-RAG   Sample: rag-weekday-ingestion
Options: demand multiplier 1x, horizon 1 year(s)
Dimension capacity: modeled-ready
  Check capacity: modeled-ready
    headroom: 19.6 TiB
    % of operating budget: 88.4%   % of limit: 70.8%
    Finding R-CAP-1: Combined used plus proposed capacity is within the capacity operating budget.
      evidence:
        - existing used capacity: 131941395333120 bytes (basis: aligned demand sample)
        - proposed workload capacity: 32985348833280 bytes (basis: synthetic workload profile)
        - capacity operating budget: 186477172070809.62 bytes (basis: 0.8 × usable capacity)
        - usable capacity limit: 233096465088512 bytes (basis: synthetic infrastructure profile)
      calculation: 120 TiB used + 30 TiB proposed = 150 TiB combined vs 169.6 TiB budget (0.8 × 212 TiB usable); headroom 19.6 TiB.
      implication: Modeled capacity headroom exists for the proposed workload at the declared synthetic values.
      next investigation: Confirm real usable capacity and current consumption before relying on this result.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not measured on a real array.
      assumptions:
        - Usable capacity excludes spares and metadata reserves.
Dimension iops: needs-investigation
  Check iops.frontend: modeled-ready
    headroom: 80000 IOPS
    % of operating budget: 33.3%   % of limit: 26.7%
    Finding R-FE-1: Combined front-end IOPS demand is within the front-end operating budget.
      evidence:
        - existing front-end IOPS: 20000 IOPS (basis: aligned demand sample (reads + writes))
        - proposed front-end IOPS: 20000 IOPS (basis: aligned demand sample (reads + writes))
        - front-end IOPS operating budget: 120000 IOPS (basis: 0.8 × sustainable front-end IOPS limit)
        - sustainable front-end IOPS limit: 150000 IOPS (basis: synthetic infrastructure profile)
      calculation: 20000 existing + 20000 proposed = 40000 IOPS vs 120000 budget; headroom 80000 IOPS.
      implication: Front-end logical IOPS headroom exists for the proposed workload.
      next investigation: Confirm the declared sustainable IOPS envelope and the aligned demand peak on a real source.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not measured on a real array.
      assumptions:
        - Existing and proposed demand are aligned to the same modeled interval.
  Check iops.backend: needs-investigation
    headroom: n/a
    % of operating budget: n/a   % of limit: n/a
    Finding R-BE-3: Backend operation demand cannot be estimated for this sample.
      evidence:
        - backend estimate: unknown ops/s (basis: backend model; missing: proposed IO size exceeds the modeled backend block (read 65536 bytes, write 65536 bytes, backend block 16384 bytes); the classic read-modify-write factor does not apply; full-stripe or multi-block behavior is outside V1 scope.)
        - existing read block: 16384 bytes (basis: aligned demand sample)
        - existing write block: 8192 bytes (basis: aligned demand sample)
        - proposed read block: 65536 bytes (basis: aligned demand sample)
        - proposed write block: 65536 bytes (basis: aligned demand sample)
        - modeled backend block: 16384 bytes (basis: synthetic infrastructure profile)
      calculation: No backend estimate produced: proposed IO size exceeds the modeled backend block (read 65536 bytes, write 65536 bytes, backend block 16384 bytes); the classic read-modify-write factor does not apply; full-stripe or multi-block behavior is outside V1 scope.
      implication: The backend load for this demand sample is unknown; the IOPS dimension cannot be unconditionally ready.
      next investigation: Determine the real backend behavior for this IO profile (full-stripe or multi-block handling is outside V1) or bound the demand to the modeled block size.
      confidence: insufficient — An unknown participates: the model deliberately refuses to extrapolate.
      assumptions:
        - The classic read-modify-write model applies only when read and write block sizes are at or below the modeled backend block.
Dimension throughput: modeled-ready
  Check throughput: modeled-ready
    headroom: 884.38 MiB/s
    % of operating budget: 63.2%   % of limit: 50.5%
    Finding R-THR-1: Combined throughput demand is within the throughput operating budget.
      evidence:
        - existing throughput: 278528000 bytes/second (basis: derived: existing IOPS × block sizes)
        - proposed throughput: 1310720000 bytes/second (basis: derived: proposed IOPS × block sizes)
        - throughput operating budget: 2516582400 bytes/second (basis: 0.8 × sustainable throughput limit)
        - sustainable throughput limit: 3145728000 bytes/second (basis: synthetic infrastructure profile)
      calculation: existing 265.63 MiB/s (272000 KiB/s) + proposed 1250 MiB/s = 1515.63 MiB/s vs 2400 MiB/s budget; headroom 884.38 MiB/s.
      implication: Modeled sustained bandwidth headroom exists for the proposed workload.
      next investigation: Verify sustained throughput limits and the read/write block-size mix; derived throughput depends on both.
      confidence: high — Derived directly from declared IOPS and block sizes; synthetic values, not a measured limit.
      assumptions:
        - Throughput is derived from IOPS × block size, never an independent input.
Dimension latency: needs-investigation
  Check latency: needs-investigation
    headroom: n/a
    % of operating budget: n/a   % of limit: n/a
    Finding R-LAT-1: Baseline P95 latency 1.2 ms is at or below the workload target 1.5 ms; post-addition latency unknown: no response curve in V1.
      evidence:
        - baseline P95 latency: 1.2 ms (basis: aligned demand sample (screening indicator))
        - baseline maximum latency: 1.4 ms (basis: aligned demand sample)
        - workload latency target: 1.5 ms (basis: synthetic workload profile)
      calculation: baseline P95 1.2 ms vs target 1.5 ms; baseline max 1.4 ms shown alongside.
      implication: No baseline latency concern is indicated, but this says nothing about latency after the proposed workload is added.
      next investigation: Establish post-addition latency with a response model or measurements; V1 cannot.
      confidence: insufficient — Post-addition latency is an unknown in V1 by design.
      assumptions:
        - Baseline P95 is a screening indicator only; the maximum is shown alongside.
        - Post-addition latency unknown: no response curve in V1.
    Finding R-LAT-1: Baseline maximum latency is reported alongside P95 as context.
      evidence:
        - baseline maximum latency: 1.4 ms (basis: aligned demand sample)
        - workload latency target: 1.5 ms (basis: synthetic workload profile)
      calculation: baseline max 1.4 ms vs target 1.5 ms; the max is context, not the screening statistic.
      implication: Single-interval maxima can exceed the target even when P95 does not; both are baseline evidence only.
      next investigation: Review the distribution of minute latencies in the M2 weekly statistics.
      confidence: high — Reported value from supplied evidence; no inference made.
      assumptions:
        - Latency evidence is synthetic baseline data for the existing environment only.
Dimension protection: modeled-ready
  Check protection: modeled-ready
    headroom: n/a
    % of operating budget: n/a   % of limit: n/a
    Finding R-PRO-1: All declared workload protection requirements are satisfied by the infrastructure capabilities.
      evidence:
        - minimum tolerated drive failures required: 1 count (basis: workload protection requirement)
        - tolerated drive failures: 2 count (basis: synthetic infrastructure profile)
        - snapshots required: true flag (basis: workload protection requirement)
        - snapshots capability: true flag (basis: synthetic infrastructure profile)
        - encryptionAtRest required: true flag (basis: workload protection requirement)
        - encryptionAtRest capability: true flag (basis: synthetic infrastructure profile)
        - replication required: none mode (basis: workload protection requirement)
        - replication capability: unknown mode (basis: synthetic infrastructure profile; missing: replication capability not modeled)
      calculation: Capability matching over the fixed V1 vocabulary: toleratedDriveFailures: required 1 vs available 2 → modeled-ready; snapshots: required true vs available true → modeled-ready; encryptionAtRest: required true vs available true → modeled-ready; replication: required none vs available unknown → modeled-ready.
      implication: Declared protection capabilities meet the workload requirements within the V1 vocabulary.
      next investigation: Confirm capabilities on the real array; vocabulary coverage is selected capabilities only.
      confidence: moderate — Declared capability matching only; not a complete availability assurance.
      assumptions:
        - The V1 capability vocabulary covers selected capabilities, not complete availability assurance.
        - Replication is not equated with backup; availability is not inferred from a single feature.
Dimension growth: modeled-constraint
  Check growth: modeled-constraint
    headroom: -10.4 TiB
    % of operating budget: 106.1%   % of limit: 84.9%
    Finding R-GRO-1: Projected capacity at the 1-year horizon exceeds the capacity operating budget.
      evidence:
        - existing used capacity: 131941395333120 bytes (basis: aligned demand sample)
        - existing annual growth fraction: 0.15 fraction (basis: synthetic infrastructure profile)
        - proposed workload capacity: 32985348833280 bytes (basis: synthetic workload profile)
        - proposed annual growth fraction: 0.4 fraction (basis: synthetic workload profile)
        - planning horizon: 1 years (basis: assessment option)
        - capacity operating budget: 186477172070809.62 bytes (basis: 0.8 × usable capacity)
      calculation: projected = 120 TiB × (1 + 0.15)^1 + 30 TiB × (1 + 0.4)^1 = 180 TiB vs 169.6 TiB budget; headroom -10.4 TiB.
      implication: Growth projection exceeds the capacity operating budget within 1 year(s); capacity expansion timing becomes a planning constraint.
      next investigation: Validate the declared growth fractions against observed consumption trends; compound growth dominates at longer horizons.
      confidence: high — Deterministic compound-growth arithmetic on declared synthetic inputs; growth rates themselves are assumptions.
      assumptions:
        - Annual growth fractions are synthetic assumptions, not observed trends.
        - Horizon is 1 year(s); horizon 0 equals the current-capacity check.
```

### rag-weekday-batch-offhours

```
Synthetic data. Educational demonstration; not vendor sizing or production configuration guidance.
Overall: modeled-constraint
Ruleset: 1.0.0-m1   Budget fraction: 0.8
Infrastructure: INF-B   Workload: WL-RAG   Sample: rag-weekday-batch-offhours
Options: demand multiplier 1x, horizon 1 year(s)
Dimension capacity: modeled-ready
  Check capacity: modeled-ready
    headroom: 19.6 TiB
    % of operating budget: 88.4%   % of limit: 70.8%
    Finding R-CAP-1: Combined used plus proposed capacity is within the capacity operating budget.
      evidence:
        - existing used capacity: 131941395333120 bytes (basis: aligned demand sample)
        - proposed workload capacity: 32985348833280 bytes (basis: synthetic workload profile)
        - capacity operating budget: 186477172070809.62 bytes (basis: 0.8 × usable capacity)
        - usable capacity limit: 233096465088512 bytes (basis: synthetic infrastructure profile)
      calculation: 120 TiB used + 30 TiB proposed = 150 TiB combined vs 169.6 TiB budget (0.8 × 212 TiB usable); headroom 19.6 TiB.
      implication: Modeled capacity headroom exists for the proposed workload at the declared synthetic values.
      next investigation: Confirm real usable capacity and current consumption before relying on this result.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not measured on a real array.
      assumptions:
        - Usable capacity excludes spares and metadata reserves.
Dimension iops: modeled-ready
  Check iops.frontend: modeled-ready
    headroom: 72000 IOPS
    % of operating budget: 40.0%   % of limit: 32.0%
    Finding R-FE-1: Combined front-end IOPS demand is within the front-end operating budget.
      evidence:
        - existing front-end IOPS: 40000 IOPS (basis: aligned demand sample (reads + writes))
        - proposed front-end IOPS: 8000 IOPS (basis: aligned demand sample (reads + writes))
        - front-end IOPS operating budget: 120000 IOPS (basis: 0.8 × sustainable front-end IOPS limit)
        - sustainable front-end IOPS limit: 150000 IOPS (basis: synthetic infrastructure profile)
      calculation: 40000 existing + 8000 proposed = 48000 IOPS vs 120000 budget; headroom 72000 IOPS.
      implication: Front-end logical IOPS headroom exists for the proposed workload.
      next investigation: Confirm the declared sustainable IOPS envelope and the aligned demand peak on a real source.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not measured on a real array.
      assumptions:
        - Existing and proposed demand are aligned to the same modeled interval.
  Check iops.backend: modeled-ready
    headroom: 34960 ops/s
    % of operating budget: 82.5%   % of limit: 66.0%
    Finding R-BE-1: Combined backend operation demand is within the backend operating budget.
      evidence:
        - existing backend reads: 83200 ops/s (basis: derived from existing logical demand)
        - existing backend writes: 72000 ops/s (basis: derived from existing logical demand)
        - background backend demand: 0 ops/s (basis: declared on the demand sample; added exactly once)
        - proposed backend reads: 7440 ops/s (basis: derived: proposed reads × (1 − hit) + writes × factor)
        - proposed backend writes: 2400 ops/s (basis: derived: proposed writes × factor)
        - backend operating budget: 200000 ops/s (basis: 0.8 × backend sustainable operation limit)
        - backend sustainable operation limit: 250000 ops/s (basis: synthetic infrastructure profile)
      calculation: existing 155200 ops/s + background 0 + proposed 9840 ops/s (reads 7440 + writes 2400; RAID 6 factor 3+3 per logical write) = 165040 ops/s vs 200000 ops/s budget; headroom 34960 ops/s.
      implication: Modeled backend load is within budget under the RAID 6 read-modify-write factor.
      next investigation: Validate cache-hit fraction and write policy on the real system before relying on the estimate.
      confidence: high — Arithmetic on complete declared inputs within the explicitly bounded model; not a physical-array simulation.
      assumptions:
        - RAID 6 classic read-modify-write: each logical write costs 3 backend reads + 3 backend writes.
        - Write-back cache with no coalescing; sustained writes are not treated as zero.
        - Full-stripe writes, erasure coding, compression/dedup, metadata IO, flash write amplification, replication overhead, and rebuild load are outside this calculation.
Dimension throughput: modeled-ready
  Check throughput: modeled-ready
    headroom: 1900 MiB/s
    % of operating budget: 20.8%   % of limit: 16.7%
    Finding R-THR-1: Combined throughput demand is within the throughput operating budget.
      evidence:
        - existing throughput: 458752000 bytes/second (basis: derived: existing IOPS × block sizes)
        - proposed throughput: 65536000 bytes/second (basis: derived: proposed IOPS × block sizes)
        - throughput operating budget: 2516582400 bytes/second (basis: 0.8 × sustainable throughput limit)
        - sustainable throughput limit: 3145728000 bytes/second (basis: synthetic infrastructure profile)
      calculation: existing 437.5 MiB/s (448000 KiB/s) + proposed 62.5 MiB/s = 500 MiB/s vs 2400 MiB/s budget; headroom 1900 MiB/s.
      implication: Modeled sustained bandwidth headroom exists for the proposed workload.
      next investigation: Verify sustained throughput limits and the read/write block-size mix; derived throughput depends on both.
      confidence: high — Derived directly from declared IOPS and block sizes; synthetic values, not a measured limit.
      assumptions:
        - Throughput is derived from IOPS × block size, never an independent input.
Dimension latency: needs-investigation
  Check latency: needs-investigation
    headroom: n/a
    % of operating budget: n/a   % of limit: n/a
    Finding R-LAT-1: Baseline P95 latency 1.2 ms is at or below the workload target 1.5 ms; post-addition latency unknown: no response curve in V1.
      evidence:
        - baseline P95 latency: 1.2 ms (basis: aligned demand sample (screening indicator))
        - baseline maximum latency: 1.4 ms (basis: aligned demand sample)
        - workload latency target: 1.5 ms (basis: synthetic workload profile)
      calculation: baseline P95 1.2 ms vs target 1.5 ms; baseline max 1.4 ms shown alongside.
      implication: No baseline latency concern is indicated, but this says nothing about latency after the proposed workload is added.
      next investigation: Establish post-addition latency with a response model or measurements; V1 cannot.
      confidence: insufficient — Post-addition latency is an unknown in V1 by design.
      assumptions:
        - Baseline P95 is a screening indicator only; the maximum is shown alongside.
        - Post-addition latency unknown: no response curve in V1.
    Finding R-LAT-1: Baseline maximum latency is reported alongside P95 as context.
      evidence:
        - baseline maximum latency: 1.4 ms (basis: aligned demand sample)
        - workload latency target: 1.5 ms (basis: synthetic workload profile)
      calculation: baseline max 1.4 ms vs target 1.5 ms; the max is context, not the screening statistic.
      implication: Single-interval maxima can exceed the target even when P95 does not; both are baseline evidence only.
      next investigation: Review the distribution of minute latencies in the M2 weekly statistics.
      confidence: high — Reported value from supplied evidence; no inference made.
      assumptions:
        - Latency evidence is synthetic baseline data for the existing environment only.
Dimension protection: modeled-ready
  Check protection: modeled-ready
    headroom: n/a
    % of operating budget: n/a   % of limit: n/a
    Finding R-PRO-1: All declared workload protection requirements are satisfied by the infrastructure capabilities.
      evidence:
        - minimum tolerated drive failures required: 1 count (basis: workload protection requirement)
        - tolerated drive failures: 2 count (basis: synthetic infrastructure profile)
        - snapshots required: true flag (basis: workload protection requirement)
        - snapshots capability: true flag (basis: synthetic infrastructure profile)
        - encryptionAtRest required: true flag (basis: workload protection requirement)
        - encryptionAtRest capability: true flag (basis: synthetic infrastructure profile)
        - replication required: none mode (basis: workload protection requirement)
        - replication capability: unknown mode (basis: synthetic infrastructure profile; missing: replication capability not modeled)
      calculation: Capability matching over the fixed V1 vocabulary: toleratedDriveFailures: required 1 vs available 2 → modeled-ready; snapshots: required true vs available true → modeled-ready; encryptionAtRest: required true vs available true → modeled-ready; replication: required none vs available unknown → modeled-ready.
      implication: Declared protection capabilities meet the workload requirements within the V1 vocabulary.
      next investigation: Confirm capabilities on the real array; vocabulary coverage is selected capabilities only.
      confidence: moderate — Declared capability matching only; not a complete availability assurance.
      assumptions:
        - The V1 capability vocabulary covers selected capabilities, not complete availability assurance.
        - Replication is not equated with backup; availability is not inferred from a single feature.
Dimension growth: modeled-constraint
  Check growth: modeled-constraint
    headroom: -10.4 TiB
    % of operating budget: 106.1%   % of limit: 84.9%
    Finding R-GRO-1: Projected capacity at the 1-year horizon exceeds the capacity operating budget.
      evidence:
        - existing used capacity: 131941395333120 bytes (basis: aligned demand sample)
        - existing annual growth fraction: 0.15 fraction (basis: synthetic infrastructure profile)
        - proposed workload capacity: 32985348833280 bytes (basis: synthetic workload profile)
        - proposed annual growth fraction: 0.4 fraction (basis: synthetic workload profile)
        - planning horizon: 1 years (basis: assessment option)
        - capacity operating budget: 186477172070809.62 bytes (basis: 0.8 × usable capacity)
      calculation: projected = 120 TiB × (1 + 0.15)^1 + 30 TiB × (1 + 0.4)^1 = 180 TiB vs 169.6 TiB budget; headroom -10.4 TiB.
      implication: Growth projection exceeds the capacity operating budget within 1 year(s); capacity expansion timing becomes a planning constraint.
      next investigation: Validate the declared growth fractions against observed consumption trends; compound growth dominates at longer horizons.
      confidence: high — Deterministic compound-growth arithmetic on declared synthetic inputs; growth rates themselves are assumptions.
      assumptions:
        - Annual growth fractions are synthetic assumptions, not observed trends.
        - Horizon is 1 year(s); horizon 0 equals the current-capacity check.
```

### what-if: rag-weekday-burst-query

#### rag-weekday-burst-query — demand 1.5×, horizon 0y

```
Synthetic data. Educational demonstration; not vendor sizing or production configuration guidance.
Overall: modeled-constraint
Ruleset: 1.0.0-m1   Budget fraction: 0.8
Infrastructure: INF-B   Workload: WL-RAG   Sample: rag-weekday-burst-query
Options: demand multiplier 1.5x, horizon 0 year(s)
Dimension capacity: modeled-ready
  Check capacity: modeled-ready
    headroom: 19.6 TiB
    % of operating budget: 88.4%   % of limit: 70.8%
    Finding R-CAP-1: Combined used plus proposed capacity is within the capacity operating budget.
      evidence:
        - existing used capacity: 131941395333120 bytes (basis: aligned demand sample)
        - proposed workload capacity: 32985348833280 bytes (basis: synthetic workload profile)
        - capacity operating budget: 186477172070809.62 bytes (basis: 0.8 × usable capacity)
        - usable capacity limit: 233096465088512 bytes (basis: synthetic infrastructure profile)
      calculation: 120 TiB used + 30 TiB proposed = 150 TiB combined vs 169.6 TiB budget (0.8 × 212 TiB usable); headroom 19.6 TiB.
      implication: Modeled capacity headroom exists for the proposed workload at the declared synthetic values.
      next investigation: Confirm real usable capacity and current consumption before relying on this result.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not measured on a real array.
      assumptions:
        - Usable capacity excludes spares and metadata reserves.
Dimension iops: modeled-constraint
  Check iops.frontend: modeled-ready
    headroom: 0 IOPS
    % of operating budget: 100.0%   % of limit: 80.0%
    Finding R-FE-1: Combined front-end IOPS demand is within the front-end operating budget.
      evidence:
        - existing front-end IOPS: 75000 IOPS (basis: aligned demand sample (reads + writes))
        - proposed front-end IOPS: 45000 IOPS (basis: aligned demand sample (reads + writes))
        - front-end IOPS operating budget: 120000 IOPS (basis: 0.8 × sustainable front-end IOPS limit)
        - sustainable front-end IOPS limit: 150000 IOPS (basis: synthetic infrastructure profile)
      calculation: 75000 existing + 45000 proposed = 120000 IOPS vs 120000 budget; headroom 0 IOPS.
      implication: Front-end logical IOPS headroom exists for the proposed workload.
      next investigation: Confirm the declared sustainable IOPS envelope and the aligned demand peak on a real source.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not measured on a real array.
      assumptions:
        - Existing and proposed demand are aligned to the same modeled interval.
  Check iops.backend: modeled-constraint
    headroom: -27100 ops/s
    % of operating budget: 113.5%   % of limit: 90.8%
    Finding R-BE-4: Combined backend operation demand exceeds the backend operating budget. Front-end headroom exists, but backend operations exceed the budget because of the RAID write factor.
      evidence:
        - existing backend reads: 104250 ops/s (basis: derived from existing logical demand)
        - existing backend writes: 67500 ops/s (basis: derived from existing logical demand)
        - background backend demand: 0 ops/s (basis: declared on the demand sample; added exactly once)
        - proposed backend reads: 41850 ops/s (basis: derived: proposed reads × (1 − hit) + writes × factor)
        - proposed backend writes: 13500 ops/s (basis: derived: proposed writes × factor)
        - backend operating budget: 200000 ops/s (basis: 0.8 × backend sustainable operation limit)
        - backend sustainable operation limit: 250000 ops/s (basis: synthetic infrastructure profile)
      calculation: existing 171750 ops/s + background 0 + proposed 55350 ops/s (reads 41850 + writes 13500; RAID 6 factor 3+3 per logical write) = 227100 ops/s vs 200000 ops/s budget; headroom -27100 ops/s.
      implication: The RAID 6 write factor pushes modeled backend operations over budget. Front-end headroom exists, but backend operations exceed the budget because of the RAID write factor.
      next investigation: Investigate whether the real array coalesces writes (outside the V1 model), or reduce proposed write demand.
      confidence: high — Arithmetic on complete declared inputs within the explicitly bounded model; not a physical-array simulation.
      assumptions:
        - RAID 6 classic read-modify-write: each logical write costs 3 backend reads + 3 backend writes.
        - Write-back cache with no coalescing; sustained writes are not treated as zero.
        - Full-stripe writes, erasure coding, compression/dedup, metadata IO, flash write amplification, replication overhead, and rebuild load are outside this calculation.
Dimension throughput: modeled-ready
  Check throughput: modeled-ready
    headroom: 1052.34 MiB/s
    % of operating budget: 56.2%   % of limit: 44.9%
    Finding R-THR-1: Combined throughput demand is within the throughput operating budget.
      evidence:
        - existing throughput: 1044480000 bytes/second (basis: derived: existing IOPS × block sizes)
        - proposed throughput: 368640000 bytes/second (basis: derived: proposed IOPS × block sizes)
        - throughput operating budget: 2516582400 bytes/second (basis: 0.8 × sustainable throughput limit)
        - sustainable throughput limit: 3145728000 bytes/second (basis: synthetic infrastructure profile)
      calculation: existing 996.09 MiB/s (1020000 KiB/s) + proposed 351.56 MiB/s = 1347.66 MiB/s vs 2400 MiB/s budget; headroom 1052.34 MiB/s.
      implication: Modeled sustained bandwidth headroom exists for the proposed workload.
      next investigation: Verify sustained throughput limits and the read/write block-size mix; derived throughput depends on both.
      confidence: high — Derived directly from declared IOPS and block sizes; synthetic values, not a measured limit.
      assumptions:
        - Throughput is derived from IOPS × block size, never an independent input.
Dimension latency: needs-investigation
  Check latency: needs-investigation
    headroom: n/a
    % of operating budget: n/a   % of limit: n/a
    Finding R-LAT-1: Baseline P95 latency 1.2 ms is at or below the workload target 1.5 ms; post-addition latency unknown: no response curve in V1.
      evidence:
        - baseline P95 latency: 1.2 ms (basis: aligned demand sample (screening indicator))
        - baseline maximum latency: 1.4 ms (basis: aligned demand sample)
        - workload latency target: 1.5 ms (basis: synthetic workload profile)
      calculation: baseline P95 1.2 ms vs target 1.5 ms; baseline max 1.4 ms shown alongside.
      implication: No baseline latency concern is indicated, but this says nothing about latency after the proposed workload is added.
      next investigation: Establish post-addition latency with a response model or measurements; V1 cannot.
      confidence: insufficient — Post-addition latency is an unknown in V1 by design.
      assumptions:
        - Baseline P95 is a screening indicator only; the maximum is shown alongside.
        - Post-addition latency unknown: no response curve in V1.
    Finding R-LAT-1: Baseline maximum latency is reported alongside P95 as context.
      evidence:
        - baseline maximum latency: 1.4 ms (basis: aligned demand sample)
        - workload latency target: 1.5 ms (basis: synthetic workload profile)
      calculation: baseline max 1.4 ms vs target 1.5 ms; the max is context, not the screening statistic.
      implication: Single-interval maxima can exceed the target even when P95 does not; both are baseline evidence only.
      next investigation: Review the distribution of minute latencies in the M2 weekly statistics.
      confidence: high — Reported value from supplied evidence; no inference made.
      assumptions:
        - Latency evidence is synthetic baseline data for the existing environment only.
Dimension protection: modeled-ready
  Check protection: modeled-ready
    headroom: n/a
    % of operating budget: n/a   % of limit: n/a
    Finding R-PRO-1: All declared workload protection requirements are satisfied by the infrastructure capabilities.
      evidence:
        - minimum tolerated drive failures required: 1 count (basis: workload protection requirement)
        - tolerated drive failures: 2 count (basis: synthetic infrastructure profile)
        - snapshots required: true flag (basis: workload protection requirement)
        - snapshots capability: true flag (basis: synthetic infrastructure profile)
        - encryptionAtRest required: true flag (basis: workload protection requirement)
        - encryptionAtRest capability: true flag (basis: synthetic infrastructure profile)
        - replication required: none mode (basis: workload protection requirement)
        - replication capability: unknown mode (basis: synthetic infrastructure profile; missing: replication capability not modeled)
      calculation: Capability matching over the fixed V1 vocabulary: toleratedDriveFailures: required 1 vs available 2 → modeled-ready; snapshots: required true vs available true → modeled-ready; encryptionAtRest: required true vs available true → modeled-ready; replication: required none vs available unknown → modeled-ready.
      implication: Declared protection capabilities meet the workload requirements within the V1 vocabulary.
      next investigation: Confirm capabilities on the real array; vocabulary coverage is selected capabilities only.
      confidence: moderate — Declared capability matching only; not a complete availability assurance.
      assumptions:
        - The V1 capability vocabulary covers selected capabilities, not complete availability assurance.
        - Replication is not equated with backup; availability is not inferred from a single feature.
Dimension growth: modeled-ready
  Check growth: modeled-ready
    headroom: 19.6 TiB
    % of operating budget: 88.4%   % of limit: 70.8%
    Finding R-GRO-1: Projected capacity at the 0-year horizon is within the capacity operating budget.
      evidence:
        - existing used capacity: 131941395333120 bytes (basis: aligned demand sample)
        - existing annual growth fraction: 0.15 fraction (basis: synthetic infrastructure profile)
        - proposed workload capacity: 32985348833280 bytes (basis: synthetic workload profile)
        - proposed annual growth fraction: 0.4 fraction (basis: synthetic workload profile)
        - planning horizon: 0 years (basis: assessment option)
        - capacity operating budget: 186477172070809.62 bytes (basis: 0.8 × usable capacity)
      calculation: projected = 120 TiB × (1 + 0.15)^0 + 30 TiB × (1 + 0.4)^0 = 150 TiB vs 169.6 TiB budget; headroom 19.6 TiB.
      implication: The modeled environment retains capacity headroom at the 0-year planning horizon.
      next investigation: Validate the declared growth fractions against observed consumption trends; compound growth dominates at longer horizons.
      confidence: high — Deterministic compound-growth arithmetic on declared synthetic inputs; growth rates themselves are assumptions.
      assumptions:
        - Annual growth fractions are synthetic assumptions, not observed trends.
        - Horizon is 0 year(s); horizon 0 equals the current-capacity check.
```

#### rag-weekday-burst-query — demand 1.5×, horizon 1y

```
Synthetic data. Educational demonstration; not vendor sizing or production configuration guidance.
Overall: modeled-constraint
Ruleset: 1.0.0-m1   Budget fraction: 0.8
Infrastructure: INF-B   Workload: WL-RAG   Sample: rag-weekday-burst-query
Options: demand multiplier 1.5x, horizon 1 year(s)
Dimension capacity: modeled-ready
  Check capacity: modeled-ready
    headroom: 19.6 TiB
    % of operating budget: 88.4%   % of limit: 70.8%
    Finding R-CAP-1: Combined used plus proposed capacity is within the capacity operating budget.
      evidence:
        - existing used capacity: 131941395333120 bytes (basis: aligned demand sample)
        - proposed workload capacity: 32985348833280 bytes (basis: synthetic workload profile)
        - capacity operating budget: 186477172070809.62 bytes (basis: 0.8 × usable capacity)
        - usable capacity limit: 233096465088512 bytes (basis: synthetic infrastructure profile)
      calculation: 120 TiB used + 30 TiB proposed = 150 TiB combined vs 169.6 TiB budget (0.8 × 212 TiB usable); headroom 19.6 TiB.
      implication: Modeled capacity headroom exists for the proposed workload at the declared synthetic values.
      next investigation: Confirm real usable capacity and current consumption before relying on this result.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not measured on a real array.
      assumptions:
        - Usable capacity excludes spares and metadata reserves.
Dimension iops: modeled-constraint
  Check iops.frontend: modeled-ready
    headroom: 0 IOPS
    % of operating budget: 100.0%   % of limit: 80.0%
    Finding R-FE-1: Combined front-end IOPS demand is within the front-end operating budget.
      evidence:
        - existing front-end IOPS: 75000 IOPS (basis: aligned demand sample (reads + writes))
        - proposed front-end IOPS: 45000 IOPS (basis: aligned demand sample (reads + writes))
        - front-end IOPS operating budget: 120000 IOPS (basis: 0.8 × sustainable front-end IOPS limit)
        - sustainable front-end IOPS limit: 150000 IOPS (basis: synthetic infrastructure profile)
      calculation: 75000 existing + 45000 proposed = 120000 IOPS vs 120000 budget; headroom 0 IOPS.
      implication: Front-end logical IOPS headroom exists for the proposed workload.
      next investigation: Confirm the declared sustainable IOPS envelope and the aligned demand peak on a real source.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not measured on a real array.
      assumptions:
        - Existing and proposed demand are aligned to the same modeled interval.
  Check iops.backend: modeled-constraint
    headroom: -27100 ops/s
    % of operating budget: 113.5%   % of limit: 90.8%
    Finding R-BE-4: Combined backend operation demand exceeds the backend operating budget. Front-end headroom exists, but backend operations exceed the budget because of the RAID write factor.
      evidence:
        - existing backend reads: 104250 ops/s (basis: derived from existing logical demand)
        - existing backend writes: 67500 ops/s (basis: derived from existing logical demand)
        - background backend demand: 0 ops/s (basis: declared on the demand sample; added exactly once)
        - proposed backend reads: 41850 ops/s (basis: derived: proposed reads × (1 − hit) + writes × factor)
        - proposed backend writes: 13500 ops/s (basis: derived: proposed writes × factor)
        - backend operating budget: 200000 ops/s (basis: 0.8 × backend sustainable operation limit)
        - backend sustainable operation limit: 250000 ops/s (basis: synthetic infrastructure profile)
      calculation: existing 171750 ops/s + background 0 + proposed 55350 ops/s (reads 41850 + writes 13500; RAID 6 factor 3+3 per logical write) = 227100 ops/s vs 200000 ops/s budget; headroom -27100 ops/s.
      implication: The RAID 6 write factor pushes modeled backend operations over budget. Front-end headroom exists, but backend operations exceed the budget because of the RAID write factor.
      next investigation: Investigate whether the real array coalesces writes (outside the V1 model), or reduce proposed write demand.
      confidence: high — Arithmetic on complete declared inputs within the explicitly bounded model; not a physical-array simulation.
      assumptions:
        - RAID 6 classic read-modify-write: each logical write costs 3 backend reads + 3 backend writes.
        - Write-back cache with no coalescing; sustained writes are not treated as zero.
        - Full-stripe writes, erasure coding, compression/dedup, metadata IO, flash write amplification, replication overhead, and rebuild load are outside this calculation.
Dimension throughput: modeled-ready
  Check throughput: modeled-ready
    headroom: 1052.34 MiB/s
    % of operating budget: 56.2%   % of limit: 44.9%
    Finding R-THR-1: Combined throughput demand is within the throughput operating budget.
      evidence:
        - existing throughput: 1044480000 bytes/second (basis: derived: existing IOPS × block sizes)
        - proposed throughput: 368640000 bytes/second (basis: derived: proposed IOPS × block sizes)
        - throughput operating budget: 2516582400 bytes/second (basis: 0.8 × sustainable throughput limit)
        - sustainable throughput limit: 3145728000 bytes/second (basis: synthetic infrastructure profile)
      calculation: existing 996.09 MiB/s (1020000 KiB/s) + proposed 351.56 MiB/s = 1347.66 MiB/s vs 2400 MiB/s budget; headroom 1052.34 MiB/s.
      implication: Modeled sustained bandwidth headroom exists for the proposed workload.
      next investigation: Verify sustained throughput limits and the read/write block-size mix; derived throughput depends on both.
      confidence: high — Derived directly from declared IOPS and block sizes; synthetic values, not a measured limit.
      assumptions:
        - Throughput is derived from IOPS × block size, never an independent input.
Dimension latency: needs-investigation
  Check latency: needs-investigation
    headroom: n/a
    % of operating budget: n/a   % of limit: n/a
    Finding R-LAT-1: Baseline P95 latency 1.2 ms is at or below the workload target 1.5 ms; post-addition latency unknown: no response curve in V1.
      evidence:
        - baseline P95 latency: 1.2 ms (basis: aligned demand sample (screening indicator))
        - baseline maximum latency: 1.4 ms (basis: aligned demand sample)
        - workload latency target: 1.5 ms (basis: synthetic workload profile)
      calculation: baseline P95 1.2 ms vs target 1.5 ms; baseline max 1.4 ms shown alongside.
      implication: No baseline latency concern is indicated, but this says nothing about latency after the proposed workload is added.
      next investigation: Establish post-addition latency with a response model or measurements; V1 cannot.
      confidence: insufficient — Post-addition latency is an unknown in V1 by design.
      assumptions:
        - Baseline P95 is a screening indicator only; the maximum is shown alongside.
        - Post-addition latency unknown: no response curve in V1.
    Finding R-LAT-1: Baseline maximum latency is reported alongside P95 as context.
      evidence:
        - baseline maximum latency: 1.4 ms (basis: aligned demand sample)
        - workload latency target: 1.5 ms (basis: synthetic workload profile)
      calculation: baseline max 1.4 ms vs target 1.5 ms; the max is context, not the screening statistic.
      implication: Single-interval maxima can exceed the target even when P95 does not; both are baseline evidence only.
      next investigation: Review the distribution of minute latencies in the M2 weekly statistics.
      confidence: high — Reported value from supplied evidence; no inference made.
      assumptions:
        - Latency evidence is synthetic baseline data for the existing environment only.
Dimension protection: modeled-ready
  Check protection: modeled-ready
    headroom: n/a
    % of operating budget: n/a   % of limit: n/a
    Finding R-PRO-1: All declared workload protection requirements are satisfied by the infrastructure capabilities.
      evidence:
        - minimum tolerated drive failures required: 1 count (basis: workload protection requirement)
        - tolerated drive failures: 2 count (basis: synthetic infrastructure profile)
        - snapshots required: true flag (basis: workload protection requirement)
        - snapshots capability: true flag (basis: synthetic infrastructure profile)
        - encryptionAtRest required: true flag (basis: workload protection requirement)
        - encryptionAtRest capability: true flag (basis: synthetic infrastructure profile)
        - replication required: none mode (basis: workload protection requirement)
        - replication capability: unknown mode (basis: synthetic infrastructure profile; missing: replication capability not modeled)
      calculation: Capability matching over the fixed V1 vocabulary: toleratedDriveFailures: required 1 vs available 2 → modeled-ready; snapshots: required true vs available true → modeled-ready; encryptionAtRest: required true vs available true → modeled-ready; replication: required none vs available unknown → modeled-ready.
      implication: Declared protection capabilities meet the workload requirements within the V1 vocabulary.
      next investigation: Confirm capabilities on the real array; vocabulary coverage is selected capabilities only.
      confidence: moderate — Declared capability matching only; not a complete availability assurance.
      assumptions:
        - The V1 capability vocabulary covers selected capabilities, not complete availability assurance.
        - Replication is not equated with backup; availability is not inferred from a single feature.
Dimension growth: modeled-constraint
  Check growth: modeled-constraint
    headroom: -10.4 TiB
    % of operating budget: 106.1%   % of limit: 84.9%
    Finding R-GRO-1: Projected capacity at the 1-year horizon exceeds the capacity operating budget.
      evidence:
        - existing used capacity: 131941395333120 bytes (basis: aligned demand sample)
        - existing annual growth fraction: 0.15 fraction (basis: synthetic infrastructure profile)
        - proposed workload capacity: 32985348833280 bytes (basis: synthetic workload profile)
        - proposed annual growth fraction: 0.4 fraction (basis: synthetic workload profile)
        - planning horizon: 1 years (basis: assessment option)
        - capacity operating budget: 186477172070809.62 bytes (basis: 0.8 × usable capacity)
      calculation: projected = 120 TiB × (1 + 0.15)^1 + 30 TiB × (1 + 0.4)^1 = 180 TiB vs 169.6 TiB budget; headroom -10.4 TiB.
      implication: Growth projection exceeds the capacity operating budget within 1 year(s); capacity expansion timing becomes a planning constraint.
      next investigation: Validate the declared growth fractions against observed consumption trends; compound growth dominates at longer horizons.
      confidence: high — Deterministic compound-growth arithmetic on declared synthetic inputs; growth rates themselves are assumptions.
      assumptions:
        - Annual growth fractions are synthetic assumptions, not observed trends.
        - Horizon is 1 year(s); horizon 0 equals the current-capacity check.
```

#### rag-weekday-burst-query — demand 1.5×, horizon 3y

```
Synthetic data. Educational demonstration; not vendor sizing or production configuration guidance.
Overall: modeled-constraint
Ruleset: 1.0.0-m1   Budget fraction: 0.8
Infrastructure: INF-B   Workload: WL-RAG   Sample: rag-weekday-burst-query
Options: demand multiplier 1.5x, horizon 3 year(s)
Dimension capacity: modeled-ready
  Check capacity: modeled-ready
    headroom: 19.6 TiB
    % of operating budget: 88.4%   % of limit: 70.8%
    Finding R-CAP-1: Combined used plus proposed capacity is within the capacity operating budget.
      evidence:
        - existing used capacity: 131941395333120 bytes (basis: aligned demand sample)
        - proposed workload capacity: 32985348833280 bytes (basis: synthetic workload profile)
        - capacity operating budget: 186477172070809.62 bytes (basis: 0.8 × usable capacity)
        - usable capacity limit: 233096465088512 bytes (basis: synthetic infrastructure profile)
      calculation: 120 TiB used + 30 TiB proposed = 150 TiB combined vs 169.6 TiB budget (0.8 × 212 TiB usable); headroom 19.6 TiB.
      implication: Modeled capacity headroom exists for the proposed workload at the declared synthetic values.
      next investigation: Confirm real usable capacity and current consumption before relying on this result.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not measured on a real array.
      assumptions:
        - Usable capacity excludes spares and metadata reserves.
Dimension iops: modeled-constraint
  Check iops.frontend: modeled-ready
    headroom: 0 IOPS
    % of operating budget: 100.0%   % of limit: 80.0%
    Finding R-FE-1: Combined front-end IOPS demand is within the front-end operating budget.
      evidence:
        - existing front-end IOPS: 75000 IOPS (basis: aligned demand sample (reads + writes))
        - proposed front-end IOPS: 45000 IOPS (basis: aligned demand sample (reads + writes))
        - front-end IOPS operating budget: 120000 IOPS (basis: 0.8 × sustainable front-end IOPS limit)
        - sustainable front-end IOPS limit: 150000 IOPS (basis: synthetic infrastructure profile)
      calculation: 75000 existing + 45000 proposed = 120000 IOPS vs 120000 budget; headroom 0 IOPS.
      implication: Front-end logical IOPS headroom exists for the proposed workload.
      next investigation: Confirm the declared sustainable IOPS envelope and the aligned demand peak on a real source.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not measured on a real array.
      assumptions:
        - Existing and proposed demand are aligned to the same modeled interval.
  Check iops.backend: modeled-constraint
    headroom: -27100 ops/s
    % of operating budget: 113.5%   % of limit: 90.8%
    Finding R-BE-4: Combined backend operation demand exceeds the backend operating budget. Front-end headroom exists, but backend operations exceed the budget because of the RAID write factor.
      evidence:
        - existing backend reads: 104250 ops/s (basis: derived from existing logical demand)
        - existing backend writes: 67500 ops/s (basis: derived from existing logical demand)
        - background backend demand: 0 ops/s (basis: declared on the demand sample; added exactly once)
        - proposed backend reads: 41850 ops/s (basis: derived: proposed reads × (1 − hit) + writes × factor)
        - proposed backend writes: 13500 ops/s (basis: derived: proposed writes × factor)
        - backend operating budget: 200000 ops/s (basis: 0.8 × backend sustainable operation limit)
        - backend sustainable operation limit: 250000 ops/s (basis: synthetic infrastructure profile)
      calculation: existing 171750 ops/s + background 0 + proposed 55350 ops/s (reads 41850 + writes 13500; RAID 6 factor 3+3 per logical write) = 227100 ops/s vs 200000 ops/s budget; headroom -27100 ops/s.
      implication: The RAID 6 write factor pushes modeled backend operations over budget. Front-end headroom exists, but backend operations exceed the budget because of the RAID write factor.
      next investigation: Investigate whether the real array coalesces writes (outside the V1 model), or reduce proposed write demand.
      confidence: high — Arithmetic on complete declared inputs within the explicitly bounded model; not a physical-array simulation.
      assumptions:
        - RAID 6 classic read-modify-write: each logical write costs 3 backend reads + 3 backend writes.
        - Write-back cache with no coalescing; sustained writes are not treated as zero.
        - Full-stripe writes, erasure coding, compression/dedup, metadata IO, flash write amplification, replication overhead, and rebuild load are outside this calculation.
Dimension throughput: modeled-ready
  Check throughput: modeled-ready
    headroom: 1052.34 MiB/s
    % of operating budget: 56.2%   % of limit: 44.9%
    Finding R-THR-1: Combined throughput demand is within the throughput operating budget.
      evidence:
        - existing throughput: 1044480000 bytes/second (basis: derived: existing IOPS × block sizes)
        - proposed throughput: 368640000 bytes/second (basis: derived: proposed IOPS × block sizes)
        - throughput operating budget: 2516582400 bytes/second (basis: 0.8 × sustainable throughput limit)
        - sustainable throughput limit: 3145728000 bytes/second (basis: synthetic infrastructure profile)
      calculation: existing 996.09 MiB/s (1020000 KiB/s) + proposed 351.56 MiB/s = 1347.66 MiB/s vs 2400 MiB/s budget; headroom 1052.34 MiB/s.
      implication: Modeled sustained bandwidth headroom exists for the proposed workload.
      next investigation: Verify sustained throughput limits and the read/write block-size mix; derived throughput depends on both.
      confidence: high — Derived directly from declared IOPS and block sizes; synthetic values, not a measured limit.
      assumptions:
        - Throughput is derived from IOPS × block size, never an independent input.
Dimension latency: needs-investigation
  Check latency: needs-investigation
    headroom: n/a
    % of operating budget: n/a   % of limit: n/a
    Finding R-LAT-1: Baseline P95 latency 1.2 ms is at or below the workload target 1.5 ms; post-addition latency unknown: no response curve in V1.
      evidence:
        - baseline P95 latency: 1.2 ms (basis: aligned demand sample (screening indicator))
        - baseline maximum latency: 1.4 ms (basis: aligned demand sample)
        - workload latency target: 1.5 ms (basis: synthetic workload profile)
      calculation: baseline P95 1.2 ms vs target 1.5 ms; baseline max 1.4 ms shown alongside.
      implication: No baseline latency concern is indicated, but this says nothing about latency after the proposed workload is added.
      next investigation: Establish post-addition latency with a response model or measurements; V1 cannot.
      confidence: insufficient — Post-addition latency is an unknown in V1 by design.
      assumptions:
        - Baseline P95 is a screening indicator only; the maximum is shown alongside.
        - Post-addition latency unknown: no response curve in V1.
    Finding R-LAT-1: Baseline maximum latency is reported alongside P95 as context.
      evidence:
        - baseline maximum latency: 1.4 ms (basis: aligned demand sample)
        - workload latency target: 1.5 ms (basis: synthetic workload profile)
      calculation: baseline max 1.4 ms vs target 1.5 ms; the max is context, not the screening statistic.
      implication: Single-interval maxima can exceed the target even when P95 does not; both are baseline evidence only.
      next investigation: Review the distribution of minute latencies in the M2 weekly statistics.
      confidence: high — Reported value from supplied evidence; no inference made.
      assumptions:
        - Latency evidence is synthetic baseline data for the existing environment only.
Dimension protection: modeled-ready
  Check protection: modeled-ready
    headroom: n/a
    % of operating budget: n/a   % of limit: n/a
    Finding R-PRO-1: All declared workload protection requirements are satisfied by the infrastructure capabilities.
      evidence:
        - minimum tolerated drive failures required: 1 count (basis: workload protection requirement)
        - tolerated drive failures: 2 count (basis: synthetic infrastructure profile)
        - snapshots required: true flag (basis: workload protection requirement)
        - snapshots capability: true flag (basis: synthetic infrastructure profile)
        - encryptionAtRest required: true flag (basis: workload protection requirement)
        - encryptionAtRest capability: true flag (basis: synthetic infrastructure profile)
        - replication required: none mode (basis: workload protection requirement)
        - replication capability: unknown mode (basis: synthetic infrastructure profile; missing: replication capability not modeled)
      calculation: Capability matching over the fixed V1 vocabulary: toleratedDriveFailures: required 1 vs available 2 → modeled-ready; snapshots: required true vs available true → modeled-ready; encryptionAtRest: required true vs available true → modeled-ready; replication: required none vs available unknown → modeled-ready.
      implication: Declared protection capabilities meet the workload requirements within the V1 vocabulary.
      next investigation: Confirm capabilities on the real array; vocabulary coverage is selected capabilities only.
      confidence: moderate — Declared capability matching only; not a complete availability assurance.
      assumptions:
        - The V1 capability vocabulary covers selected capabilities, not complete availability assurance.
        - Replication is not equated with backup; availability is not inferred from a single feature.
Dimension growth: modeled-constraint
  Check growth: modeled-constraint
    headroom: -95.22 TiB
    % of operating budget: 156.1%   % of limit: 124.9%
    Finding R-GRO-1: Projected capacity at the 3-year horizon exceeds the capacity operating budget.
      evidence:
        - existing used capacity: 131941395333120 bytes (basis: aligned demand sample)
        - existing annual growth fraction: 0.15 fraction (basis: synthetic infrastructure profile)
        - proposed workload capacity: 32985348833280 bytes (basis: synthetic workload profile)
        - proposed annual growth fraction: 0.4 fraction (basis: synthetic workload profile)
        - planning horizon: 3 years (basis: assessment option)
        - capacity operating budget: 186477172070809.62 bytes (basis: 0.8 × usable capacity)
      calculation: projected = 120 TiB × (1 + 0.15)^3 + 30 TiB × (1 + 0.4)^3 = 264.82 TiB vs 169.6 TiB budget; headroom -95.22 TiB.
      implication: Growth projection exceeds the capacity operating budget within 3 year(s); capacity expansion timing becomes a planning constraint.
      next investigation: Validate the declared growth fractions against observed consumption trends; compound growth dominates at longer horizons.
      confidence: high — Deterministic compound-growth arithmetic on declared synthetic inputs; growth rates themselves are assumptions.
      assumptions:
        - Annual growth fractions are synthetic assumptions, not observed trends.
        - Horizon is 3 year(s); horizon 0 equals the current-capacity check.
```

#### rag-weekday-burst-query — demand 2×, horizon 0y

```
Synthetic data. Educational demonstration; not vendor sizing or production configuration guidance.
Overall: modeled-constraint
Ruleset: 1.0.0-m1   Budget fraction: 0.8
Infrastructure: INF-B   Workload: WL-RAG   Sample: rag-weekday-burst-query
Options: demand multiplier 2x, horizon 0 year(s)
Dimension capacity: modeled-ready
  Check capacity: modeled-ready
    headroom: 19.6 TiB
    % of operating budget: 88.4%   % of limit: 70.8%
    Finding R-CAP-1: Combined used plus proposed capacity is within the capacity operating budget.
      evidence:
        - existing used capacity: 131941395333120 bytes (basis: aligned demand sample)
        - proposed workload capacity: 32985348833280 bytes (basis: synthetic workload profile)
        - capacity operating budget: 186477172070809.62 bytes (basis: 0.8 × usable capacity)
        - usable capacity limit: 233096465088512 bytes (basis: synthetic infrastructure profile)
      calculation: 120 TiB used + 30 TiB proposed = 150 TiB combined vs 169.6 TiB budget (0.8 × 212 TiB usable); headroom 19.6 TiB.
      implication: Modeled capacity headroom exists for the proposed workload at the declared synthetic values.
      next investigation: Confirm real usable capacity and current consumption before relying on this result.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not measured on a real array.
      assumptions:
        - Usable capacity excludes spares and metadata reserves.
Dimension iops: modeled-constraint
  Check iops.frontend: modeled-constraint
    headroom: -15000 IOPS
    % of operating budget: 112.5%   % of limit: 90.0%
    Finding R-FE-1: Combined front-end IOPS demand exceeds the front-end operating budget.
      evidence:
        - existing front-end IOPS: 75000 IOPS (basis: aligned demand sample (reads + writes))
        - proposed front-end IOPS: 60000 IOPS (basis: aligned demand sample (reads + writes))
        - front-end IOPS operating budget: 120000 IOPS (basis: 0.8 × sustainable front-end IOPS limit)
        - sustainable front-end IOPS limit: 150000 IOPS (basis: synthetic infrastructure profile)
      calculation: 75000 existing + 60000 proposed = 135000 IOPS vs 120000 budget; headroom -15000 IOPS.
      implication: Front-end logical IOPS demand exceeds the operating budget; the array front end is a candidate bottleneck.
      next investigation: Confirm the declared sustainable IOPS envelope and the aligned demand peak on a real source.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not measured on a real array.
      assumptions:
        - Existing and proposed demand are aligned to the same modeled interval.
  Check iops.backend: modeled-constraint
    headroom: -45550 ops/s
    % of operating budget: 122.8%   % of limit: 98.2%
    Finding R-BE-1: Combined backend operation demand exceeds the backend operating budget.
      evidence:
        - existing backend reads: 104250 ops/s (basis: derived from existing logical demand)
        - existing backend writes: 67500 ops/s (basis: derived from existing logical demand)
        - background backend demand: 0 ops/s (basis: declared on the demand sample; added exactly once)
        - proposed backend reads: 55800 ops/s (basis: derived: proposed reads × (1 − hit) + writes × factor)
        - proposed backend writes: 18000 ops/s (basis: derived: proposed writes × factor)
        - backend operating budget: 200000 ops/s (basis: 0.8 × backend sustainable operation limit)
        - backend sustainable operation limit: 250000 ops/s (basis: synthetic infrastructure profile)
      calculation: existing 171750 ops/s + background 0 + proposed 73800 ops/s (reads 55800 + writes 18000; RAID 6 factor 3+3 per logical write) = 245550 ops/s vs 200000 ops/s budget; headroom -45550 ops/s.
      implication: The RAID 6 write factor pushes modeled backend operations over budget.
      next investigation: Investigate whether the real array coalesces writes (outside the V1 model), or reduce proposed write demand.
      confidence: high — Arithmetic on complete declared inputs within the explicitly bounded model; not a physical-array simulation.
      assumptions:
        - RAID 6 classic read-modify-write: each logical write costs 3 backend reads + 3 backend writes.
        - Write-back cache with no coalescing; sustained writes are not treated as zero.
        - Full-stripe writes, erasure coding, compression/dedup, metadata IO, flash write amplification, replication overhead, and rebuild load are outside this calculation.
Dimension throughput: modeled-ready
  Check throughput: modeled-ready
    headroom: 935.16 MiB/s
    % of operating budget: 61.0%   % of limit: 48.8%
    Finding R-THR-1: Combined throughput demand is within the throughput operating budget.
      evidence:
        - existing throughput: 1044480000 bytes/second (basis: derived: existing IOPS × block sizes)
        - proposed throughput: 491520000 bytes/second (basis: derived: proposed IOPS × block sizes)
        - throughput operating budget: 2516582400 bytes/second (basis: 0.8 × sustainable throughput limit)
        - sustainable throughput limit: 3145728000 bytes/second (basis: synthetic infrastructure profile)
      calculation: existing 996.09 MiB/s (1020000 KiB/s) + proposed 468.75 MiB/s = 1464.84 MiB/s vs 2400 MiB/s budget; headroom 935.16 MiB/s.
      implication: Modeled sustained bandwidth headroom exists for the proposed workload.
      next investigation: Verify sustained throughput limits and the read/write block-size mix; derived throughput depends on both.
      confidence: high — Derived directly from declared IOPS and block sizes; synthetic values, not a measured limit.
      assumptions:
        - Throughput is derived from IOPS × block size, never an independent input.
Dimension latency: needs-investigation
  Check latency: needs-investigation
    headroom: n/a
    % of operating budget: n/a   % of limit: n/a
    Finding R-LAT-1: Baseline P95 latency 1.2 ms is at or below the workload target 1.5 ms; post-addition latency unknown: no response curve in V1.
      evidence:
        - baseline P95 latency: 1.2 ms (basis: aligned demand sample (screening indicator))
        - baseline maximum latency: 1.4 ms (basis: aligned demand sample)
        - workload latency target: 1.5 ms (basis: synthetic workload profile)
      calculation: baseline P95 1.2 ms vs target 1.5 ms; baseline max 1.4 ms shown alongside.
      implication: No baseline latency concern is indicated, but this says nothing about latency after the proposed workload is added.
      next investigation: Establish post-addition latency with a response model or measurements; V1 cannot.
      confidence: insufficient — Post-addition latency is an unknown in V1 by design.
      assumptions:
        - Baseline P95 is a screening indicator only; the maximum is shown alongside.
        - Post-addition latency unknown: no response curve in V1.
    Finding R-LAT-1: Baseline maximum latency is reported alongside P95 as context.
      evidence:
        - baseline maximum latency: 1.4 ms (basis: aligned demand sample)
        - workload latency target: 1.5 ms (basis: synthetic workload profile)
      calculation: baseline max 1.4 ms vs target 1.5 ms; the max is context, not the screening statistic.
      implication: Single-interval maxima can exceed the target even when P95 does not; both are baseline evidence only.
      next investigation: Review the distribution of minute latencies in the M2 weekly statistics.
      confidence: high — Reported value from supplied evidence; no inference made.
      assumptions:
        - Latency evidence is synthetic baseline data for the existing environment only.
Dimension protection: modeled-ready
  Check protection: modeled-ready
    headroom: n/a
    % of operating budget: n/a   % of limit: n/a
    Finding R-PRO-1: All declared workload protection requirements are satisfied by the infrastructure capabilities.
      evidence:
        - minimum tolerated drive failures required: 1 count (basis: workload protection requirement)
        - tolerated drive failures: 2 count (basis: synthetic infrastructure profile)
        - snapshots required: true flag (basis: workload protection requirement)
        - snapshots capability: true flag (basis: synthetic infrastructure profile)
        - encryptionAtRest required: true flag (basis: workload protection requirement)
        - encryptionAtRest capability: true flag (basis: synthetic infrastructure profile)
        - replication required: none mode (basis: workload protection requirement)
        - replication capability: unknown mode (basis: synthetic infrastructure profile; missing: replication capability not modeled)
      calculation: Capability matching over the fixed V1 vocabulary: toleratedDriveFailures: required 1 vs available 2 → modeled-ready; snapshots: required true vs available true → modeled-ready; encryptionAtRest: required true vs available true → modeled-ready; replication: required none vs available unknown → modeled-ready.
      implication: Declared protection capabilities meet the workload requirements within the V1 vocabulary.
      next investigation: Confirm capabilities on the real array; vocabulary coverage is selected capabilities only.
      confidence: moderate — Declared capability matching only; not a complete availability assurance.
      assumptions:
        - The V1 capability vocabulary covers selected capabilities, not complete availability assurance.
        - Replication is not equated with backup; availability is not inferred from a single feature.
Dimension growth: modeled-ready
  Check growth: modeled-ready
    headroom: 19.6 TiB
    % of operating budget: 88.4%   % of limit: 70.8%
    Finding R-GRO-1: Projected capacity at the 0-year horizon is within the capacity operating budget.
      evidence:
        - existing used capacity: 131941395333120 bytes (basis: aligned demand sample)
        - existing annual growth fraction: 0.15 fraction (basis: synthetic infrastructure profile)
        - proposed workload capacity: 32985348833280 bytes (basis: synthetic workload profile)
        - proposed annual growth fraction: 0.4 fraction (basis: synthetic workload profile)
        - planning horizon: 0 years (basis: assessment option)
        - capacity operating budget: 186477172070809.62 bytes (basis: 0.8 × usable capacity)
      calculation: projected = 120 TiB × (1 + 0.15)^0 + 30 TiB × (1 + 0.4)^0 = 150 TiB vs 169.6 TiB budget; headroom 19.6 TiB.
      implication: The modeled environment retains capacity headroom at the 0-year planning horizon.
      next investigation: Validate the declared growth fractions against observed consumption trends; compound growth dominates at longer horizons.
      confidence: high — Deterministic compound-growth arithmetic on declared synthetic inputs; growth rates themselves are assumptions.
      assumptions:
        - Annual growth fractions are synthetic assumptions, not observed trends.
        - Horizon is 0 year(s); horizon 0 equals the current-capacity check.
```

#### rag-weekday-burst-query — demand 2×, horizon 1y

```
Synthetic data. Educational demonstration; not vendor sizing or production configuration guidance.
Overall: modeled-constraint
Ruleset: 1.0.0-m1   Budget fraction: 0.8
Infrastructure: INF-B   Workload: WL-RAG   Sample: rag-weekday-burst-query
Options: demand multiplier 2x, horizon 1 year(s)
Dimension capacity: modeled-ready
  Check capacity: modeled-ready
    headroom: 19.6 TiB
    % of operating budget: 88.4%   % of limit: 70.8%
    Finding R-CAP-1: Combined used plus proposed capacity is within the capacity operating budget.
      evidence:
        - existing used capacity: 131941395333120 bytes (basis: aligned demand sample)
        - proposed workload capacity: 32985348833280 bytes (basis: synthetic workload profile)
        - capacity operating budget: 186477172070809.62 bytes (basis: 0.8 × usable capacity)
        - usable capacity limit: 233096465088512 bytes (basis: synthetic infrastructure profile)
      calculation: 120 TiB used + 30 TiB proposed = 150 TiB combined vs 169.6 TiB budget (0.8 × 212 TiB usable); headroom 19.6 TiB.
      implication: Modeled capacity headroom exists for the proposed workload at the declared synthetic values.
      next investigation: Confirm real usable capacity and current consumption before relying on this result.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not measured on a real array.
      assumptions:
        - Usable capacity excludes spares and metadata reserves.
Dimension iops: modeled-constraint
  Check iops.frontend: modeled-constraint
    headroom: -15000 IOPS
    % of operating budget: 112.5%   % of limit: 90.0%
    Finding R-FE-1: Combined front-end IOPS demand exceeds the front-end operating budget.
      evidence:
        - existing front-end IOPS: 75000 IOPS (basis: aligned demand sample (reads + writes))
        - proposed front-end IOPS: 60000 IOPS (basis: aligned demand sample (reads + writes))
        - front-end IOPS operating budget: 120000 IOPS (basis: 0.8 × sustainable front-end IOPS limit)
        - sustainable front-end IOPS limit: 150000 IOPS (basis: synthetic infrastructure profile)
      calculation: 75000 existing + 60000 proposed = 135000 IOPS vs 120000 budget; headroom -15000 IOPS.
      implication: Front-end logical IOPS demand exceeds the operating budget; the array front end is a candidate bottleneck.
      next investigation: Confirm the declared sustainable IOPS envelope and the aligned demand peak on a real source.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not measured on a real array.
      assumptions:
        - Existing and proposed demand are aligned to the same modeled interval.
  Check iops.backend: modeled-constraint
    headroom: -45550 ops/s
    % of operating budget: 122.8%   % of limit: 98.2%
    Finding R-BE-1: Combined backend operation demand exceeds the backend operating budget.
      evidence:
        - existing backend reads: 104250 ops/s (basis: derived from existing logical demand)
        - existing backend writes: 67500 ops/s (basis: derived from existing logical demand)
        - background backend demand: 0 ops/s (basis: declared on the demand sample; added exactly once)
        - proposed backend reads: 55800 ops/s (basis: derived: proposed reads × (1 − hit) + writes × factor)
        - proposed backend writes: 18000 ops/s (basis: derived: proposed writes × factor)
        - backend operating budget: 200000 ops/s (basis: 0.8 × backend sustainable operation limit)
        - backend sustainable operation limit: 250000 ops/s (basis: synthetic infrastructure profile)
      calculation: existing 171750 ops/s + background 0 + proposed 73800 ops/s (reads 55800 + writes 18000; RAID 6 factor 3+3 per logical write) = 245550 ops/s vs 200000 ops/s budget; headroom -45550 ops/s.
      implication: The RAID 6 write factor pushes modeled backend operations over budget.
      next investigation: Investigate whether the real array coalesces writes (outside the V1 model), or reduce proposed write demand.
      confidence: high — Arithmetic on complete declared inputs within the explicitly bounded model; not a physical-array simulation.
      assumptions:
        - RAID 6 classic read-modify-write: each logical write costs 3 backend reads + 3 backend writes.
        - Write-back cache with no coalescing; sustained writes are not treated as zero.
        - Full-stripe writes, erasure coding, compression/dedup, metadata IO, flash write amplification, replication overhead, and rebuild load are outside this calculation.
Dimension throughput: modeled-ready
  Check throughput: modeled-ready
    headroom: 935.16 MiB/s
    % of operating budget: 61.0%   % of limit: 48.8%
    Finding R-THR-1: Combined throughput demand is within the throughput operating budget.
      evidence:
        - existing throughput: 1044480000 bytes/second (basis: derived: existing IOPS × block sizes)
        - proposed throughput: 491520000 bytes/second (basis: derived: proposed IOPS × block sizes)
        - throughput operating budget: 2516582400 bytes/second (basis: 0.8 × sustainable throughput limit)
        - sustainable throughput limit: 3145728000 bytes/second (basis: synthetic infrastructure profile)
      calculation: existing 996.09 MiB/s (1020000 KiB/s) + proposed 468.75 MiB/s = 1464.84 MiB/s vs 2400 MiB/s budget; headroom 935.16 MiB/s.
      implication: Modeled sustained bandwidth headroom exists for the proposed workload.
      next investigation: Verify sustained throughput limits and the read/write block-size mix; derived throughput depends on both.
      confidence: high — Derived directly from declared IOPS and block sizes; synthetic values, not a measured limit.
      assumptions:
        - Throughput is derived from IOPS × block size, never an independent input.
Dimension latency: needs-investigation
  Check latency: needs-investigation
    headroom: n/a
    % of operating budget: n/a   % of limit: n/a
    Finding R-LAT-1: Baseline P95 latency 1.2 ms is at or below the workload target 1.5 ms; post-addition latency unknown: no response curve in V1.
      evidence:
        - baseline P95 latency: 1.2 ms (basis: aligned demand sample (screening indicator))
        - baseline maximum latency: 1.4 ms (basis: aligned demand sample)
        - workload latency target: 1.5 ms (basis: synthetic workload profile)
      calculation: baseline P95 1.2 ms vs target 1.5 ms; baseline max 1.4 ms shown alongside.
      implication: No baseline latency concern is indicated, but this says nothing about latency after the proposed workload is added.
      next investigation: Establish post-addition latency with a response model or measurements; V1 cannot.
      confidence: insufficient — Post-addition latency is an unknown in V1 by design.
      assumptions:
        - Baseline P95 is a screening indicator only; the maximum is shown alongside.
        - Post-addition latency unknown: no response curve in V1.
    Finding R-LAT-1: Baseline maximum latency is reported alongside P95 as context.
      evidence:
        - baseline maximum latency: 1.4 ms (basis: aligned demand sample)
        - workload latency target: 1.5 ms (basis: synthetic workload profile)
      calculation: baseline max 1.4 ms vs target 1.5 ms; the max is context, not the screening statistic.
      implication: Single-interval maxima can exceed the target even when P95 does not; both are baseline evidence only.
      next investigation: Review the distribution of minute latencies in the M2 weekly statistics.
      confidence: high — Reported value from supplied evidence; no inference made.
      assumptions:
        - Latency evidence is synthetic baseline data for the existing environment only.
Dimension protection: modeled-ready
  Check protection: modeled-ready
    headroom: n/a
    % of operating budget: n/a   % of limit: n/a
    Finding R-PRO-1: All declared workload protection requirements are satisfied by the infrastructure capabilities.
      evidence:
        - minimum tolerated drive failures required: 1 count (basis: workload protection requirement)
        - tolerated drive failures: 2 count (basis: synthetic infrastructure profile)
        - snapshots required: true flag (basis: workload protection requirement)
        - snapshots capability: true flag (basis: synthetic infrastructure profile)
        - encryptionAtRest required: true flag (basis: workload protection requirement)
        - encryptionAtRest capability: true flag (basis: synthetic infrastructure profile)
        - replication required: none mode (basis: workload protection requirement)
        - replication capability: unknown mode (basis: synthetic infrastructure profile; missing: replication capability not modeled)
      calculation: Capability matching over the fixed V1 vocabulary: toleratedDriveFailures: required 1 vs available 2 → modeled-ready; snapshots: required true vs available true → modeled-ready; encryptionAtRest: required true vs available true → modeled-ready; replication: required none vs available unknown → modeled-ready.
      implication: Declared protection capabilities meet the workload requirements within the V1 vocabulary.
      next investigation: Confirm capabilities on the real array; vocabulary coverage is selected capabilities only.
      confidence: moderate — Declared capability matching only; not a complete availability assurance.
      assumptions:
        - The V1 capability vocabulary covers selected capabilities, not complete availability assurance.
        - Replication is not equated with backup; availability is not inferred from a single feature.
Dimension growth: modeled-constraint
  Check growth: modeled-constraint
    headroom: -10.4 TiB
    % of operating budget: 106.1%   % of limit: 84.9%
    Finding R-GRO-1: Projected capacity at the 1-year horizon exceeds the capacity operating budget.
      evidence:
        - existing used capacity: 131941395333120 bytes (basis: aligned demand sample)
        - existing annual growth fraction: 0.15 fraction (basis: synthetic infrastructure profile)
        - proposed workload capacity: 32985348833280 bytes (basis: synthetic workload profile)
        - proposed annual growth fraction: 0.4 fraction (basis: synthetic workload profile)
        - planning horizon: 1 years (basis: assessment option)
        - capacity operating budget: 186477172070809.62 bytes (basis: 0.8 × usable capacity)
      calculation: projected = 120 TiB × (1 + 0.15)^1 + 30 TiB × (1 + 0.4)^1 = 180 TiB vs 169.6 TiB budget; headroom -10.4 TiB.
      implication: Growth projection exceeds the capacity operating budget within 1 year(s); capacity expansion timing becomes a planning constraint.
      next investigation: Validate the declared growth fractions against observed consumption trends; compound growth dominates at longer horizons.
      confidence: high — Deterministic compound-growth arithmetic on declared synthetic inputs; growth rates themselves are assumptions.
      assumptions:
        - Annual growth fractions are synthetic assumptions, not observed trends.
        - Horizon is 1 year(s); horizon 0 equals the current-capacity check.
```

#### rag-weekday-burst-query — demand 2×, horizon 3y

```
Synthetic data. Educational demonstration; not vendor sizing or production configuration guidance.
Overall: modeled-constraint
Ruleset: 1.0.0-m1   Budget fraction: 0.8
Infrastructure: INF-B   Workload: WL-RAG   Sample: rag-weekday-burst-query
Options: demand multiplier 2x, horizon 3 year(s)
Dimension capacity: modeled-ready
  Check capacity: modeled-ready
    headroom: 19.6 TiB
    % of operating budget: 88.4%   % of limit: 70.8%
    Finding R-CAP-1: Combined used plus proposed capacity is within the capacity operating budget.
      evidence:
        - existing used capacity: 131941395333120 bytes (basis: aligned demand sample)
        - proposed workload capacity: 32985348833280 bytes (basis: synthetic workload profile)
        - capacity operating budget: 186477172070809.62 bytes (basis: 0.8 × usable capacity)
        - usable capacity limit: 233096465088512 bytes (basis: synthetic infrastructure profile)
      calculation: 120 TiB used + 30 TiB proposed = 150 TiB combined vs 169.6 TiB budget (0.8 × 212 TiB usable); headroom 19.6 TiB.
      implication: Modeled capacity headroom exists for the proposed workload at the declared synthetic values.
      next investigation: Confirm real usable capacity and current consumption before relying on this result.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not measured on a real array.
      assumptions:
        - Usable capacity excludes spares and metadata reserves.
Dimension iops: modeled-constraint
  Check iops.frontend: modeled-constraint
    headroom: -15000 IOPS
    % of operating budget: 112.5%   % of limit: 90.0%
    Finding R-FE-1: Combined front-end IOPS demand exceeds the front-end operating budget.
      evidence:
        - existing front-end IOPS: 75000 IOPS (basis: aligned demand sample (reads + writes))
        - proposed front-end IOPS: 60000 IOPS (basis: aligned demand sample (reads + writes))
        - front-end IOPS operating budget: 120000 IOPS (basis: 0.8 × sustainable front-end IOPS limit)
        - sustainable front-end IOPS limit: 150000 IOPS (basis: synthetic infrastructure profile)
      calculation: 75000 existing + 60000 proposed = 135000 IOPS vs 120000 budget; headroom -15000 IOPS.
      implication: Front-end logical IOPS demand exceeds the operating budget; the array front end is a candidate bottleneck.
      next investigation: Confirm the declared sustainable IOPS envelope and the aligned demand peak on a real source.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not measured on a real array.
      assumptions:
        - Existing and proposed demand are aligned to the same modeled interval.
  Check iops.backend: modeled-constraint
    headroom: -45550 ops/s
    % of operating budget: 122.8%   % of limit: 98.2%
    Finding R-BE-1: Combined backend operation demand exceeds the backend operating budget.
      evidence:
        - existing backend reads: 104250 ops/s (basis: derived from existing logical demand)
        - existing backend writes: 67500 ops/s (basis: derived from existing logical demand)
        - background backend demand: 0 ops/s (basis: declared on the demand sample; added exactly once)
        - proposed backend reads: 55800 ops/s (basis: derived: proposed reads × (1 − hit) + writes × factor)
        - proposed backend writes: 18000 ops/s (basis: derived: proposed writes × factor)
        - backend operating budget: 200000 ops/s (basis: 0.8 × backend sustainable operation limit)
        - backend sustainable operation limit: 250000 ops/s (basis: synthetic infrastructure profile)
      calculation: existing 171750 ops/s + background 0 + proposed 73800 ops/s (reads 55800 + writes 18000; RAID 6 factor 3+3 per logical write) = 245550 ops/s vs 200000 ops/s budget; headroom -45550 ops/s.
      implication: The RAID 6 write factor pushes modeled backend operations over budget.
      next investigation: Investigate whether the real array coalesces writes (outside the V1 model), or reduce proposed write demand.
      confidence: high — Arithmetic on complete declared inputs within the explicitly bounded model; not a physical-array simulation.
      assumptions:
        - RAID 6 classic read-modify-write: each logical write costs 3 backend reads + 3 backend writes.
        - Write-back cache with no coalescing; sustained writes are not treated as zero.
        - Full-stripe writes, erasure coding, compression/dedup, metadata IO, flash write amplification, replication overhead, and rebuild load are outside this calculation.
Dimension throughput: modeled-ready
  Check throughput: modeled-ready
    headroom: 935.16 MiB/s
    % of operating budget: 61.0%   % of limit: 48.8%
    Finding R-THR-1: Combined throughput demand is within the throughput operating budget.
      evidence:
        - existing throughput: 1044480000 bytes/second (basis: derived: existing IOPS × block sizes)
        - proposed throughput: 491520000 bytes/second (basis: derived: proposed IOPS × block sizes)
        - throughput operating budget: 2516582400 bytes/second (basis: 0.8 × sustainable throughput limit)
        - sustainable throughput limit: 3145728000 bytes/second (basis: synthetic infrastructure profile)
      calculation: existing 996.09 MiB/s (1020000 KiB/s) + proposed 468.75 MiB/s = 1464.84 MiB/s vs 2400 MiB/s budget; headroom 935.16 MiB/s.
      implication: Modeled sustained bandwidth headroom exists for the proposed workload.
      next investigation: Verify sustained throughput limits and the read/write block-size mix; derived throughput depends on both.
      confidence: high — Derived directly from declared IOPS and block sizes; synthetic values, not a measured limit.
      assumptions:
        - Throughput is derived from IOPS × block size, never an independent input.
Dimension latency: needs-investigation
  Check latency: needs-investigation
    headroom: n/a
    % of operating budget: n/a   % of limit: n/a
    Finding R-LAT-1: Baseline P95 latency 1.2 ms is at or below the workload target 1.5 ms; post-addition latency unknown: no response curve in V1.
      evidence:
        - baseline P95 latency: 1.2 ms (basis: aligned demand sample (screening indicator))
        - baseline maximum latency: 1.4 ms (basis: aligned demand sample)
        - workload latency target: 1.5 ms (basis: synthetic workload profile)
      calculation: baseline P95 1.2 ms vs target 1.5 ms; baseline max 1.4 ms shown alongside.
      implication: No baseline latency concern is indicated, but this says nothing about latency after the proposed workload is added.
      next investigation: Establish post-addition latency with a response model or measurements; V1 cannot.
      confidence: insufficient — Post-addition latency is an unknown in V1 by design.
      assumptions:
        - Baseline P95 is a screening indicator only; the maximum is shown alongside.
        - Post-addition latency unknown: no response curve in V1.
    Finding R-LAT-1: Baseline maximum latency is reported alongside P95 as context.
      evidence:
        - baseline maximum latency: 1.4 ms (basis: aligned demand sample)
        - workload latency target: 1.5 ms (basis: synthetic workload profile)
      calculation: baseline max 1.4 ms vs target 1.5 ms; the max is context, not the screening statistic.
      implication: Single-interval maxima can exceed the target even when P95 does not; both are baseline evidence only.
      next investigation: Review the distribution of minute latencies in the M2 weekly statistics.
      confidence: high — Reported value from supplied evidence; no inference made.
      assumptions:
        - Latency evidence is synthetic baseline data for the existing environment only.
Dimension protection: modeled-ready
  Check protection: modeled-ready
    headroom: n/a
    % of operating budget: n/a   % of limit: n/a
    Finding R-PRO-1: All declared workload protection requirements are satisfied by the infrastructure capabilities.
      evidence:
        - minimum tolerated drive failures required: 1 count (basis: workload protection requirement)
        - tolerated drive failures: 2 count (basis: synthetic infrastructure profile)
        - snapshots required: true flag (basis: workload protection requirement)
        - snapshots capability: true flag (basis: synthetic infrastructure profile)
        - encryptionAtRest required: true flag (basis: workload protection requirement)
        - encryptionAtRest capability: true flag (basis: synthetic infrastructure profile)
        - replication required: none mode (basis: workload protection requirement)
        - replication capability: unknown mode (basis: synthetic infrastructure profile; missing: replication capability not modeled)
      calculation: Capability matching over the fixed V1 vocabulary: toleratedDriveFailures: required 1 vs available 2 → modeled-ready; snapshots: required true vs available true → modeled-ready; encryptionAtRest: required true vs available true → modeled-ready; replication: required none vs available unknown → modeled-ready.
      implication: Declared protection capabilities meet the workload requirements within the V1 vocabulary.
      next investigation: Confirm capabilities on the real array; vocabulary coverage is selected capabilities only.
      confidence: moderate — Declared capability matching only; not a complete availability assurance.
      assumptions:
        - The V1 capability vocabulary covers selected capabilities, not complete availability assurance.
        - Replication is not equated with backup; availability is not inferred from a single feature.
Dimension growth: modeled-constraint
  Check growth: modeled-constraint
    headroom: -95.22 TiB
    % of operating budget: 156.1%   % of limit: 124.9%
    Finding R-GRO-1: Projected capacity at the 3-year horizon exceeds the capacity operating budget.
      evidence:
        - existing used capacity: 131941395333120 bytes (basis: aligned demand sample)
        - existing annual growth fraction: 0.15 fraction (basis: synthetic infrastructure profile)
        - proposed workload capacity: 32985348833280 bytes (basis: synthetic workload profile)
        - proposed annual growth fraction: 0.4 fraction (basis: synthetic workload profile)
        - planning horizon: 3 years (basis: assessment option)
        - capacity operating budget: 186477172070809.62 bytes (basis: 0.8 × usable capacity)
      calculation: projected = 120 TiB × (1 + 0.15)^3 + 30 TiB × (1 + 0.4)^3 = 264.82 TiB vs 169.6 TiB budget; headroom -95.22 TiB.
      implication: Growth projection exceeds the capacity operating budget within 3 year(s); capacity expansion timing becomes a planning constraint.
      next investigation: Validate the declared growth fractions against observed consumption trends; compound growth dominates at longer horizons.
      confidence: high — Deterministic compound-growth arithmetic on declared synthetic inputs; growth rates themselves are assumptions.
      assumptions:
        - Annual growth fractions are synthetic assumptions, not observed trends.
        - Horizon is 3 year(s); horizon 0 equals the current-capacity check.
```
