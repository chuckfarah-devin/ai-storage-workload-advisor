# M2 weekly trace summaries

Generated: 2026-10-07T13:18:51.247Z
Ruleset: 1.0.0-m2   Label: Synthetic data. Educational demonstration; not vendor sizing or production configuration guidance.

Each section summarizes `assessTrace` (multiplier 1, horizon 1) over the deterministic
10,080-minute trace starting 2026-10-05T00:00:00Z. Synthetic data; educational only.

## INF-A × WL-VM

Coverage: 10080/10080 (100.00%)

| resource | mean | P90 | P95 | max | budget | exceedance min | longest run | recurrences | notes |
|---|---|---|---|---|---|---|---|---|---|
| front-end IOPS | 41978.42 | 65000.00 | 65000.00 | 90000.00 | 120000.00 | 0 | 0 | 0 |  |
| backend ops/s | 74950.68 | 109850.00 | 113960.00 | 152100.00 | 200000.00 | 0 | 0 | 0 | unknown minutes: 0 |
| throughput B/s | 574660876.19 | 905216000.00 | 905216000.00 | 1253376000.00 | 2516582400.00 | 0 | 0 | 0 |  |

Latency (derived): P90 0.90 ms, P95 1.20 ms, max 1.40 ms.
Max used capacity: 120.3218 TiB.
Default detail day: day 0 — no budget exceedance; highest utilization ratio minute: backend operations 152100 vs budget 200000 (76.0% of budget) at 2026-10-05T10:05:00.000Z
Overall: needs-investigation; dimensions: capacity=modeled-ready, iops=modeled-ready, throughput=modeled-ready, latency=needs-investigation, protection=modeled-ready, growth=modeled-ready.

Hidden-burst check — Monday 10-minute buckets (mean never exceeds the backend budget
even where per-minute maxima do):

| bucket start | backend mean | backend max | minutes > budget |
|---|---|---|---|
| 2026-10-05T10:00:00.000Z | 130975.00 | 152100.00 | 0 |
| 2026-10-05T10:10:00.000Z | 130975.00 | 152100.00 | 0 |
| 2026-10-05T10:20:00.000Z | 109850.00 | 109850.00 | 0 |
| 2026-10-05T10:30:00.000Z | 109850.00 | 109850.00 | 0 |
| 2026-10-05T10:40:00.000Z | 109850.00 | 109850.00 | 0 |
| 2026-10-05T10:50:00.000Z | 109850.00 | 109850.00 | 0 |

```
Synthetic data. Educational demonstration; not vendor sizing or production configuration guidance.
Overall: needs-investigation
Ruleset: 1.0.0-m2   Budget fraction: 0.8
Infrastructure: INF-A   Workload: WL-VM   Trace: trace:2026-10-05T00:00:00Z
Options: demand multiplier 1x, horizon 1 year(s)
Weekly (10,080-minute trace; coverage 10080/10080 = 100.0%):
  front-end IOPS: mean 41978.42 IOPS  P90 65000 IOPS  P95 65000 IOPS  max 90000 IOPS  |  budget 120000 IOPS  |  exceedance 0 min (0.00% of valid), longest run 0 min, 0 runs
  backend ops: mean 74950.68 ops/s  P90 109850 ops/s  P95 113960 ops/s  max 152100 ops/s  |  budget 200000 ops/s  |  exceedance 0 min (0.00% of valid), longest run 0 min, 0 runs  |  unknown minutes 0
  throughput: mean 548.04 MiB/s  P90 863.28 MiB/s  P95 863.28 MiB/s  max 1195.31 MiB/s  |  budget 2400 MiB/s  |  exceedance 0 min (0.00% of valid), longest run 0 min, 0 runs
  latency: P90 0.9 ms  P95 1.2 ms  max 1.4 ms
  max used capacity: 120.32 TiB
Default detail day: day 0 (Monday) — no budget exceedance; highest utilization ratio minute: backend operations 152100 vs budget 200000 (76.0% of budget) at 2026-10-05T10:05:00.000Z
Dimension capacity: modeled-ready
  Check capacity: modeled-ready
    driving minute: 10079
    headroom: 67.68 TiB
    % of operating budget: 68.1%   % of limit: 54.5%
    Finding R-CAP-1: Combined used plus proposed capacity is within the capacity operating budget.
      evidence:
        - existing used capacity: 132295243081673.61 bytes (basis: aligned demand sample)
        - proposed workload capacity: 26388279066624 bytes (basis: synthetic workload profile)
        - capacity operating budget: 233096465088512 bytes (basis: 0.8 × usable capacity)
        - usable capacity limit: 291370581360640 bytes (basis: synthetic infrastructure profile)
        - maximum used capacity over trace: 132295243081673.61 bytes (basis: maximum usedCapacityBytes over valid trace minutes (E-5))
      calculation: 120.32 TiB used + 24 TiB proposed = 144.32 TiB combined vs 212 TiB budget (0.8 × 265 TiB usable); headroom 67.68 TiB.
      implication: Modeled capacity headroom exists for the proposed workload at the declared synthetic values.
      next investigation: Confirm real usable capacity and current consumption before relying on this result.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not validated against a real array.
      assumptions:
        - Usable capacity excludes spares and metadata reserves.
Dimension iops: modeled-ready
  Check iops.frontend: modeled-ready
    driving minute: 605
    headroom: 30000 IOPS
    % of operating budget: 75.0%   % of limit: 60.0%
    Finding R-FE-1: Combined front-end IOPS demand is within the front-end operating budget.
      evidence:
        - existing front-end IOPS: 75000 IOPS (basis: aligned demand sample (reads + writes))
        - proposed front-end IOPS: 15000 IOPS (basis: aligned demand sample (reads + writes))
        - front-end IOPS operating budget: 120000 IOPS (basis: 0.8 × sustainable front-end IOPS limit)
        - sustainable front-end IOPS limit: 150000 IOPS (basis: synthetic infrastructure profile)
        - front-end IOPS weekly mean: 41978.42261904762 IOPS (basis: duration-weighted mean over valid minutes)
        - front-end IOPS weekly P90: 65000 IOPS (basis: nearest-rank over valid minute samples)
        - front-end IOPS weekly P95: 65000 IOPS (basis: nearest-rank over valid minute samples)
        - front-end IOPS weekly max: 90000 IOPS (basis: observed interval maximum)
        - front-end IOPS exceedance minutes: 0 minutes (basis: minutes above operating budget)
        - front-end IOPS longest exceedance run: 0 minutes (basis: longest continuous run above budget)
        - front-end IOPS exceedance recurrences: 0 count (basis: number of runs above budget)
        - weekly coverage: 1 fraction (basis: 10080/10080 observed minutes)
      calculation: 75000 existing + 15000 proposed = 90000 IOPS vs 120000 budget; headroom 30000 IOPS.
      implication: Front-end logical IOPS headroom exists for the proposed workload.
      next investigation: Confirm the declared sustainable IOPS envelope and the aligned demand peak on a real source.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not validated against a real array.
      assumptions:
        - Existing and proposed demand are aligned to the same modeled interval.
  Check iops.backend: modeled-ready
    driving minute: 605
    headroom: 47900 ops/s
    % of operating budget: 76.0%   % of limit: 60.8%
    Finding R-BE-1: Combined backend operation demand is within the backend operating budget.
      evidence:
        - existing backend reads: 81750 ops/s (basis: derived from existing logical demand)
        - existing backend writes: 45000.00000000001 ops/s (basis: derived from existing logical demand)
        - background backend demand: 0 ops/s (basis: declared on the demand sample; added exactly once)
        - proposed backend reads: 16350 ops/s (basis: derived: proposed reads × (1 − hit) + writes × factor)
        - proposed backend writes: 9000.000000000002 ops/s (basis: derived: proposed writes × factor)
        - backend operating budget: 200000 ops/s (basis: 0.8 × backend sustainable operation limit)
        - backend sustainable operation limit: 250000 ops/s (basis: synthetic infrastructure profile)
        - backend operations weekly mean: 74950.67708333333 ops/s (basis: duration-weighted mean over valid minutes)
        - backend operations weekly P90: 109850 ops/s (basis: nearest-rank over valid minute samples)
        - backend operations weekly P95: 113960 ops/s (basis: nearest-rank over valid minute samples)
        - backend operations weekly max: 152100 ops/s (basis: observed interval maximum)
        - backend operations exceedance minutes: 0 minutes (basis: minutes above operating budget)
        - backend operations longest exceedance run: 0 minutes (basis: longest continuous run above budget)
        - backend operations exceedance recurrences: 0 count (basis: number of runs above budget)
        - weekly coverage: 1 fraction (basis: 10080/10080 observed minutes)
        - backend unknown minutes: 0 minutes (basis: minutes where the backend estimate is unknown)
      calculation: existing 126750 ops/s + background 0 + proposed 25350 ops/s (reads 16350 + writes 9000.000000000002; RAID 5 factor 2+2 per logical write) = 152100 ops/s vs 200000 ops/s budget; headroom 47900 ops/s.
      implication: Modeled backend load is within budget under the RAID 5 read-modify-write factor.
      next investigation: Validate cache-hit fraction and write policy on the real system before relying on the estimate.
      confidence: high — Arithmetic on complete declared inputs within the explicitly bounded model; not a physical-array simulation.
      assumptions:
        - RAID 5 classic read-modify-write: each logical write costs 2 backend reads + 2 backend writes.
        - Write-back cache with no coalescing; sustained writes are not treated as zero.
        - Full-stripe writes, erasure coding, compression/dedup, metadata IO, flash write amplification, replication overhead, and rebuild load are outside this calculation.
Dimension throughput: modeled-ready
  Check throughput: modeled-ready
    driving minute: 605
    headroom: 1204.69 MiB/s
    % of operating budget: 49.8%   % of limit: 39.8%
    Finding R-THR-1: Combined throughput demand is within the throughput operating budget.
      evidence:
        - existing throughput: 1044480000 bytes/second (basis: derived: existing IOPS × block sizes)
        - proposed throughput: 208896000 bytes/second (basis: derived: proposed IOPS × block sizes)
        - throughput operating budget: 2516582400 bytes/second (basis: 0.8 × sustainable throughput limit)
        - sustainable throughput limit: 3145728000 bytes/second (basis: synthetic infrastructure profile)
        - throughput weekly mean: 574660876.1904762 bytes/second (basis: duration-weighted mean over valid minutes)
        - throughput weekly P90: 905216000 bytes/second (basis: nearest-rank over valid minute samples)
        - throughput weekly P95: 905216000 bytes/second (basis: nearest-rank over valid minute samples)
        - throughput weekly max: 1253376000 bytes/second (basis: observed interval maximum)
        - throughput exceedance minutes: 0 minutes (basis: minutes above operating budget)
        - throughput longest exceedance run: 0 minutes (basis: longest continuous run above budget)
        - throughput exceedance recurrences: 0 count (basis: number of runs above budget)
        - weekly coverage: 1 fraction (basis: 10080/10080 observed minutes)
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
    Finding R-LAT-1: Baseline P95 latency 1.2 ms is at or below the workload target 2 ms; post-addition latency unknown: no validated response curve in V1.
      evidence:
        - baseline P95 latency: 1.2 ms (basis: aligned demand sample (screening indicator))
        - baseline maximum latency: 1.4 ms (basis: aligned demand sample)
        - workload latency target: 2 ms (basis: synthetic workload profile)
      calculation: baseline P95 1.2 ms vs target 2 ms; baseline max 1.4 ms shown alongside.
      implication: No baseline latency concern is indicated, but this says nothing about latency after the proposed workload is added.
      next investigation: Establish post-addition latency with a validated response model or measurements; V1 cannot.
      confidence: insufficient — Post-addition latency is an unknown in V1 by design.
      assumptions:
        - Baseline P95 is a screening indicator only; the maximum is shown alongside.
        - Post-addition latency unknown: no validated response curve in V1.
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
    driving minute: 10079
    headroom: 47.23 TiB
    % of operating budget: 77.7%   % of limit: 62.2%
    Finding R-GRO-1: Projected capacity at the 1-year horizon is within the capacity operating budget.
      evidence:
        - existing used capacity: 132295243081673.61 bytes (basis: aligned demand sample)
        - existing annual growth fraction: 0.15 fraction (basis: synthetic infrastructure profile)
        - proposed workload capacity: 26388279066624 bytes (basis: synthetic workload profile)
        - proposed annual growth fraction: 0.1 fraction (basis: synthetic workload profile)
        - planning horizon: 1 years (basis: assessment option)
        - capacity operating budget: 233096465088512 bytes (basis: 0.8 × usable capacity)
        - maximum used capacity over trace: 132295243081673.61 bytes (basis: maximum usedCapacityBytes over valid trace minutes (E-5))
      calculation: projected = 120.32 TiB × (1 + 0.15)^1 + 24 TiB × (1 + 0.1)^1 = 164.77 TiB vs 212 TiB budget; headroom 47.23 TiB.
      implication: The modeled environment retains capacity headroom at the 1-year planning horizon.
      next investigation: Validate the declared growth fractions against observed consumption trends; compound growth dominates at longer horizons.
      confidence: high — Deterministic compound-growth arithmetic on declared synthetic inputs; growth rates themselves are assumptions.
      assumptions:
        - Annual growth fractions are synthetic assumptions, not observed trends.
        - Horizon is 1 year(s); horizon 0 equals the current-capacity check.
```



## INF-B × WL-VM

Coverage: 10080/10080 (100.00%)

| resource | mean | P90 | P95 | max | budget | exceedance min | longest run | recurrences | notes |
|---|---|---|---|---|---|---|---|---|---|
| front-end IOPS | 41978.42 | 65000.00 | 65000.00 | 90000.00 | 120000.00 | 0 | 0 | 0 |  |
| backend ops/s | 102566.30 | 148850.00 | 164360.00 | 206100.00 | 200000.00 | 100 | 10 | 10 | unknown minutes: 0 |
| throughput B/s | 574660876.19 | 905216000.00 | 905216000.00 | 1253376000.00 | 2516582400.00 | 0 | 0 | 0 |  |

Latency (derived): P90 0.90 ms, P95 1.20 ms, max 1.40 ms.
Max used capacity: 120.3218 TiB.
Default detail day: day 0 — longest exceedance run: backend operations 206100.00000000003 vs budget 200000 at 2026-10-05T10:05:00.000Z (run length 10 min)
Overall: modeled-constraint; dimensions: capacity=modeled-ready, iops=modeled-constraint, throughput=modeled-ready, latency=needs-investigation, protection=modeled-ready, growth=modeled-ready.

Hidden-burst check — Monday 10-minute buckets (mean never exceeds the backend budget
even where per-minute maxima do):

| bucket start | backend mean | backend max | minutes > budget |
|---|---|---|---|
| 2026-10-05T10:00:00.000Z | 177475.00 | 206100.00 | 5 |
| 2026-10-05T10:10:00.000Z | 177475.00 | 206100.00 | 5 |
| 2026-10-05T10:20:00.000Z | 148850.00 | 148850.00 | 0 |
| 2026-10-05T10:30:00.000Z | 148850.00 | 148850.00 | 0 |
| 2026-10-05T10:40:00.000Z | 148850.00 | 148850.00 | 0 |
| 2026-10-05T10:50:00.000Z | 148850.00 | 148850.00 | 0 |
| 2026-10-05T14:00:00.000Z | 177475.00 | 206100.00 | 5 |
| 2026-10-05T14:10:00.000Z | 177475.00 | 206100.00 | 5 |
| 2026-10-06T10:00:00.000Z | 177475.00 | 206100.00 | 5 |
| 2026-10-06T10:10:00.000Z | 177475.00 | 206100.00 | 5 |
| 2026-10-06T14:00:00.000Z | 177475.00 | 206100.00 | 5 |
| 2026-10-06T14:10:00.000Z | 177475.00 | 206100.00 | 5 |
| 2026-10-07T10:00:00.000Z | 177475.00 | 206100.00 | 5 |
| 2026-10-07T10:10:00.000Z | 177475.00 | 206100.00 | 5 |
| 2026-10-07T14:00:00.000Z | 177475.00 | 206100.00 | 5 |
| 2026-10-07T14:10:00.000Z | 177475.00 | 206100.00 | 5 |
| 2026-10-08T10:00:00.000Z | 177475.00 | 206100.00 | 5 |
| 2026-10-08T10:10:00.000Z | 177475.00 | 206100.00 | 5 |
| 2026-10-08T14:00:00.000Z | 177475.00 | 206100.00 | 5 |
| 2026-10-08T14:10:00.000Z | 177475.00 | 206100.00 | 5 |
| 2026-10-09T10:00:00.000Z | 177475.00 | 206100.00 | 5 |
| 2026-10-09T10:10:00.000Z | 177475.00 | 206100.00 | 5 |
| 2026-10-09T14:00:00.000Z | 177475.00 | 206100.00 | 5 |
| 2026-10-09T14:10:00.000Z | 177475.00 | 206100.00 | 5 |

```
Synthetic data. Educational demonstration; not vendor sizing or production configuration guidance.
Overall: modeled-constraint
Ruleset: 1.0.0-m2   Budget fraction: 0.8
Infrastructure: INF-B   Workload: WL-VM   Trace: trace:2026-10-05T00:00:00Z
Options: demand multiplier 1x, horizon 1 year(s)
Weekly (10,080-minute trace; coverage 10080/10080 = 100.0%):
  front-end IOPS: mean 41978.42 IOPS  P90 65000 IOPS  P95 65000 IOPS  max 90000 IOPS  |  budget 120000 IOPS  |  exceedance 0 min (0.00% of valid), longest run 0 min, 0 runs
  backend ops: mean 102566.3 ops/s  P90 148850 ops/s  P95 164360 ops/s  max 206100 ops/s  |  budget 200000 ops/s  |  exceedance 100 min (0.99% of valid), longest run 10 min, 10 runs  |  unknown minutes 0
  throughput: mean 548.04 MiB/s  P90 863.28 MiB/s  P95 863.28 MiB/s  max 1195.31 MiB/s  |  budget 2400 MiB/s  |  exceedance 0 min (0.00% of valid), longest run 0 min, 0 runs
  latency: P90 0.9 ms  P95 1.2 ms  max 1.4 ms
  max used capacity: 120.32 TiB
Default detail day: day 0 (Monday) — longest exceedance run: backend operations 206100.00000000003 vs budget 200000 at 2026-10-05T10:05:00.000Z (run length 10 min)
Dimension capacity: modeled-ready
  Check capacity: modeled-ready
    driving minute: 10079
    headroom: 25.28 TiB
    % of operating budget: 85.1%   % of limit: 68.1%
    Finding R-CAP-1: Combined used plus proposed capacity is within the capacity operating budget.
      evidence:
        - existing used capacity: 132295243081673.61 bytes (basis: aligned demand sample)
        - proposed workload capacity: 26388279066624 bytes (basis: synthetic workload profile)
        - capacity operating budget: 186477172070809.62 bytes (basis: 0.8 × usable capacity)
        - usable capacity limit: 233096465088512 bytes (basis: synthetic infrastructure profile)
        - maximum used capacity over trace: 132295243081673.61 bytes (basis: maximum usedCapacityBytes over valid trace minutes (E-5))
      calculation: 120.32 TiB used + 24 TiB proposed = 144.32 TiB combined vs 169.6 TiB budget (0.8 × 212 TiB usable); headroom 25.28 TiB.
      implication: Modeled capacity headroom exists for the proposed workload at the declared synthetic values.
      next investigation: Confirm real usable capacity and current consumption before relying on this result.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not validated against a real array.
      assumptions:
        - Usable capacity excludes spares and metadata reserves.
Dimension iops: modeled-constraint
  Check iops.frontend: modeled-ready
    driving minute: 605
    headroom: 30000 IOPS
    % of operating budget: 75.0%   % of limit: 60.0%
    Finding R-FE-1: Combined front-end IOPS demand is within the front-end operating budget.
      evidence:
        - existing front-end IOPS: 75000 IOPS (basis: aligned demand sample (reads + writes))
        - proposed front-end IOPS: 15000 IOPS (basis: aligned demand sample (reads + writes))
        - front-end IOPS operating budget: 120000 IOPS (basis: 0.8 × sustainable front-end IOPS limit)
        - sustainable front-end IOPS limit: 150000 IOPS (basis: synthetic infrastructure profile)
        - front-end IOPS weekly mean: 41978.42261904762 IOPS (basis: duration-weighted mean over valid minutes)
        - front-end IOPS weekly P90: 65000 IOPS (basis: nearest-rank over valid minute samples)
        - front-end IOPS weekly P95: 65000 IOPS (basis: nearest-rank over valid minute samples)
        - front-end IOPS weekly max: 90000 IOPS (basis: observed interval maximum)
        - front-end IOPS exceedance minutes: 0 minutes (basis: minutes above operating budget)
        - front-end IOPS longest exceedance run: 0 minutes (basis: longest continuous run above budget)
        - front-end IOPS exceedance recurrences: 0 count (basis: number of runs above budget)
        - weekly coverage: 1 fraction (basis: 10080/10080 observed minutes)
      calculation: 75000 existing + 15000 proposed = 90000 IOPS vs 120000 budget; headroom 30000 IOPS.
      implication: Front-end logical IOPS headroom exists for the proposed workload.
      next investigation: Confirm the declared sustainable IOPS envelope and the aligned demand peak on a real source.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not validated against a real array.
      assumptions:
        - Existing and proposed demand are aligned to the same modeled interval.
  Check iops.backend: modeled-constraint
    driving minute: 605
    headroom: -6100 ops/s
    % of operating budget: 103.1%   % of limit: 82.4%
    Finding R-BE-4: Combined backend operation demand exceeds the backend operating budget. Front-end headroom exists, but backend operations exceed the budget because of the RAID write factor.
      evidence:
        - existing backend reads: 104250.00000000001 ops/s (basis: derived from existing logical demand)
        - existing backend writes: 67500.00000000001 ops/s (basis: derived from existing logical demand)
        - background backend demand: 0 ops/s (basis: declared on the demand sample; added exactly once)
        - proposed backend reads: 20850.000000000004 ops/s (basis: derived: proposed reads × (1 − hit) + writes × factor)
        - proposed backend writes: 13500.000000000004 ops/s (basis: derived: proposed writes × factor)
        - backend operating budget: 200000 ops/s (basis: 0.8 × backend sustainable operation limit)
        - backend sustainable operation limit: 250000 ops/s (basis: synthetic infrastructure profile)
        - backend operations weekly mean: 102566.30208333333 ops/s (basis: duration-weighted mean over valid minutes)
        - backend operations weekly P90: 148850 ops/s (basis: nearest-rank over valid minute samples)
        - backend operations weekly P95: 164360 ops/s (basis: nearest-rank over valid minute samples)
        - backend operations weekly max: 206100.00000000003 ops/s (basis: observed interval maximum)
        - backend operations exceedance minutes: 100 minutes (basis: minutes above operating budget)
        - backend operations longest exceedance run: 10 minutes (basis: longest continuous run above budget)
        - backend operations exceedance recurrences: 10 count (basis: number of runs above budget)
        - weekly coverage: 1 fraction (basis: 10080/10080 observed minutes)
        - backend unknown minutes: 0 minutes (basis: minutes where the backend estimate is unknown)
      calculation: existing 171750.00000000003 ops/s + background 0 + proposed 34350.00000000001 ops/s (reads 20850.000000000004 + writes 13500.000000000004; RAID 6 factor 3+3 per logical write) = 206100.00000000003 ops/s vs 200000 ops/s budget; headroom -6100 ops/s.
      implication: The RAID 6 write factor pushes modeled backend operations over budget. Front-end headroom exists, but backend operations exceed the budget because of the RAID write factor.
      next investigation: Investigate whether the real array coalesces writes (outside the V1 model), or reduce proposed write demand.
      confidence: high — Arithmetic on complete declared inputs within the explicitly bounded model; not a physical-array simulation.
      assumptions:
        - RAID 6 classic read-modify-write: each logical write costs 3 backend reads + 3 backend writes.
        - Write-back cache with no coalescing; sustained writes are not treated as zero.
        - Full-stripe writes, erasure coding, compression/dedup, metadata IO, flash write amplification, replication overhead, and rebuild load are outside this calculation.
Dimension throughput: modeled-ready
  Check throughput: modeled-ready
    driving minute: 605
    headroom: 1204.69 MiB/s
    % of operating budget: 49.8%   % of limit: 39.8%
    Finding R-THR-1: Combined throughput demand is within the throughput operating budget.
      evidence:
        - existing throughput: 1044480000 bytes/second (basis: derived: existing IOPS × block sizes)
        - proposed throughput: 208896000 bytes/second (basis: derived: proposed IOPS × block sizes)
        - throughput operating budget: 2516582400 bytes/second (basis: 0.8 × sustainable throughput limit)
        - sustainable throughput limit: 3145728000 bytes/second (basis: synthetic infrastructure profile)
        - throughput weekly mean: 574660876.1904762 bytes/second (basis: duration-weighted mean over valid minutes)
        - throughput weekly P90: 905216000 bytes/second (basis: nearest-rank over valid minute samples)
        - throughput weekly P95: 905216000 bytes/second (basis: nearest-rank over valid minute samples)
        - throughput weekly max: 1253376000 bytes/second (basis: observed interval maximum)
        - throughput exceedance minutes: 0 minutes (basis: minutes above operating budget)
        - throughput longest exceedance run: 0 minutes (basis: longest continuous run above budget)
        - throughput exceedance recurrences: 0 count (basis: number of runs above budget)
        - weekly coverage: 1 fraction (basis: 10080/10080 observed minutes)
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
    Finding R-LAT-1: Baseline P95 latency 1.2 ms is at or below the workload target 2 ms; post-addition latency unknown: no validated response curve in V1.
      evidence:
        - baseline P95 latency: 1.2 ms (basis: aligned demand sample (screening indicator))
        - baseline maximum latency: 1.4 ms (basis: aligned demand sample)
        - workload latency target: 2 ms (basis: synthetic workload profile)
      calculation: baseline P95 1.2 ms vs target 2 ms; baseline max 1.4 ms shown alongside.
      implication: No baseline latency concern is indicated, but this says nothing about latency after the proposed workload is added.
      next investigation: Establish post-addition latency with a validated response model or measurements; V1 cannot.
      confidence: insufficient — Post-addition latency is an unknown in V1 by design.
      assumptions:
        - Baseline P95 is a screening indicator only; the maximum is shown alongside.
        - Post-addition latency unknown: no validated response curve in V1.
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
    driving minute: 10079
    headroom: 4.83 TiB
    % of operating budget: 97.2%   % of limit: 77.7%
    Finding R-GRO-1: Projected capacity at the 1-year horizon is within the capacity operating budget.
      evidence:
        - existing used capacity: 132295243081673.61 bytes (basis: aligned demand sample)
        - existing annual growth fraction: 0.15 fraction (basis: synthetic infrastructure profile)
        - proposed workload capacity: 26388279066624 bytes (basis: synthetic workload profile)
        - proposed annual growth fraction: 0.1 fraction (basis: synthetic workload profile)
        - planning horizon: 1 years (basis: assessment option)
        - capacity operating budget: 186477172070809.62 bytes (basis: 0.8 × usable capacity)
        - maximum used capacity over trace: 132295243081673.61 bytes (basis: maximum usedCapacityBytes over valid trace minutes (E-5))
      calculation: projected = 120.32 TiB × (1 + 0.15)^1 + 24 TiB × (1 + 0.1)^1 = 164.77 TiB vs 169.6 TiB budget; headroom 4.83 TiB.
      implication: The modeled environment retains capacity headroom at the 1-year planning horizon.
      next investigation: Validate the declared growth fractions against observed consumption trends; compound growth dominates at longer horizons.
      confidence: high — Deterministic compound-growth arithmetic on declared synthetic inputs; growth rates themselves are assumptions.
      assumptions:
        - Annual growth fractions are synthetic assumptions, not observed trends.
        - Horizon is 1 year(s); horizon 0 equals the current-capacity check.
```

### What-if: demand 1.5×, horizon 1

| resource | mean | P90 | P95 | max | budget | exceedance min | longest run | recurrences |
|---|---|---|---|---|---|---|---|---|
| front-end IOPS | 46204.37 | 72500.00 | 72500.00 | 97500.00 | 120000.00 | 0 | 0 | 0 |  |
| backend ops/s | 112622.28 | 166025.00 | 168940.00 | 223275.00 | 200000.00 | 100 | 10 | 10 |  |
| throughput B/s | 632927898.41 | 1009664000.00 | 1009664000.00 | 1357824000.00 | 2516582400.00 | 0 | 0 | 0 |  |

Overall: modeled-constraint; dimensions: capacity=modeled-ready, iops=modeled-constraint, throughput=modeled-ready, latency=needs-investigation, protection=modeled-ready, growth=modeled-ready.
Coverage: 10080/10080; backend unknown minutes: 0.

### What-if: demand 2×, horizon 1

| resource | mean | P90 | P95 | max | budget | exceedance min | longest run | recurrences |
|---|---|---|---|---|---|---|---|---|
| front-end IOPS | 50430.31 | 80000.00 | 80000.00 | 105000.00 | 120000.00 | 0 | 0 | 0 |  |
| backend ops/s | 122678.26 | 183200.00 | 183200.00 | 240450.00 | 200000.00 | 100 | 10 | 10 |  |
| throughput B/s | 691194920.63 | 1114112000.00 | 1114112000.00 | 1462272000.00 | 2516582400.00 | 0 | 0 | 0 |  |

Overall: modeled-constraint; dimensions: capacity=modeled-ready, iops=modeled-constraint, throughput=modeled-ready, latency=needs-investigation, protection=modeled-ready, growth=modeled-ready.
Coverage: 10080/10080; backend unknown minutes: 0.



## INF-A × WL-RAG

Coverage: 10080/10080 (100.00%)

| resource | mean | P90 | P95 | max | budget | exceedance min | longest run | recurrences | notes |
|---|---|---|---|---|---|---|---|---|---|
| front-end IOPS | 51026.54 | 80000.00 | 80000.00 | 105000.00 | 120000.00 | 0 | 0 | 0 |  |
| backend ops/s | 80555.91 | 115440.00 | 115440.00 | 157650.00 | 200000.00 | 0 | 0 | 0 | unknown minutes: 900 |
| throughput B/s | 703886831.75 | 942080000.00 | 1589248000.00 | 1589248000.00 | 2516582400.00 | 0 | 0 | 0 |  |

Latency (derived): P90 0.90 ms, P95 1.20 ms, max 1.40 ms.
Max used capacity: 120.3218 TiB.
Default detail day: day 0 — no budget exceedance; highest utilization ratio minute: front-end IOPS 105000 vs budget 120000 (87.5% of budget) at 2026-10-05T10:05:00.000Z
Overall: needs-investigation; dimensions: capacity=modeled-ready, iops=needs-investigation, throughput=modeled-ready, latency=needs-investigation, protection=modeled-ready, growth=modeled-ready.

Hidden-burst check — Monday 10-minute buckets (mean never exceeds the backend budget
even where per-minute maxima do):

| bucket start | backend mean | backend max | minutes > budget |
|---|---|---|---|
| 2026-10-05T10:00:00.000Z | 136525.00 | 157650.00 | 0 |
| 2026-10-05T10:10:00.000Z | 136525.00 | 157650.00 | 0 |
| 2026-10-05T10:20:00.000Z | 115400.00 | 115400.00 | 0 |
| 2026-10-05T10:30:00.000Z | 115400.00 | 115400.00 | 0 |
| 2026-10-05T10:40:00.000Z | 115400.00 | 115400.00 | 0 |
| 2026-10-05T10:50:00.000Z | 115400.00 | 115400.00 | 0 |

```
Synthetic data. Educational demonstration; not vendor sizing or production configuration guidance.
Overall: needs-investigation
Ruleset: 1.0.0-m2   Budget fraction: 0.8
Infrastructure: INF-A   Workload: WL-RAG   Trace: trace:2026-10-05T00:00:00Z
Options: demand multiplier 1x, horizon 1 year(s)
Weekly (10,080-minute trace; coverage 10080/10080 = 100.0%):
  front-end IOPS: mean 51026.54 IOPS  P90 80000 IOPS  P95 80000 IOPS  max 105000 IOPS  |  budget 120000 IOPS  |  exceedance 0 min (0.00% of valid), longest run 0 min, 0 runs
  backend ops: mean 80555.91 ops/s  P90 115440 ops/s  P95 115440 ops/s  max 157650 ops/s  |  budget 200000 ops/s  |  exceedance 0 min (0.00% of valid), longest run 0 min, 0 runs  |  unknown minutes 900
  throughput: mean 671.28 MiB/s  P90 898.44 MiB/s  P95 1515.63 MiB/s  max 1515.63 MiB/s  |  budget 2400 MiB/s  |  exceedance 0 min (0.00% of valid), longest run 0 min, 0 runs
  latency: P90 0.9 ms  P95 1.2 ms  max 1.4 ms
  max used capacity: 120.32 TiB
Default detail day: day 0 (Monday) — no budget exceedance; highest utilization ratio minute: front-end IOPS 105000 vs budget 120000 (87.5% of budget) at 2026-10-05T10:05:00.000Z
Dimension capacity: modeled-ready
  Check capacity: modeled-ready
    driving minute: 10079
    headroom: 61.68 TiB
    % of operating budget: 70.9%   % of limit: 56.7%
    Finding R-CAP-1: Combined used plus proposed capacity is within the capacity operating budget.
      evidence:
        - existing used capacity: 132295243081673.61 bytes (basis: aligned demand sample)
        - proposed workload capacity: 32985348833280 bytes (basis: synthetic workload profile)
        - capacity operating budget: 233096465088512 bytes (basis: 0.8 × usable capacity)
        - usable capacity limit: 291370581360640 bytes (basis: synthetic infrastructure profile)
        - maximum used capacity over trace: 132295243081673.61 bytes (basis: maximum usedCapacityBytes over valid trace minutes (E-5))
      calculation: 120.32 TiB used + 30 TiB proposed = 150.32 TiB combined vs 212 TiB budget (0.8 × 265 TiB usable); headroom 61.68 TiB.
      implication: Modeled capacity headroom exists for the proposed workload at the declared synthetic values.
      next investigation: Confirm real usable capacity and current consumption before relying on this result.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not validated against a real array.
      assumptions:
        - Usable capacity excludes spares and metadata reserves.
Dimension iops: needs-investigation
  Check iops.frontend: modeled-ready
    driving minute: 605
    headroom: 15000 IOPS
    % of operating budget: 87.5%   % of limit: 70.0%
    Finding R-FE-1: Combined front-end IOPS demand is within the front-end operating budget.
      evidence:
        - existing front-end IOPS: 75000 IOPS (basis: aligned demand sample (reads + writes))
        - proposed front-end IOPS: 30000 IOPS (basis: aligned demand sample (reads + writes))
        - front-end IOPS operating budget: 120000 IOPS (basis: 0.8 × sustainable front-end IOPS limit)
        - sustainable front-end IOPS limit: 150000 IOPS (basis: synthetic infrastructure profile)
        - front-end IOPS weekly mean: 51026.5376984127 IOPS (basis: duration-weighted mean over valid minutes)
        - front-end IOPS weekly P90: 80000 IOPS (basis: nearest-rank over valid minute samples)
        - front-end IOPS weekly P95: 80000 IOPS (basis: nearest-rank over valid minute samples)
        - front-end IOPS weekly max: 105000 IOPS (basis: observed interval maximum)
        - front-end IOPS exceedance minutes: 0 minutes (basis: minutes above operating budget)
        - front-end IOPS longest exceedance run: 0 minutes (basis: longest continuous run above budget)
        - front-end IOPS exceedance recurrences: 0 count (basis: number of runs above budget)
        - weekly coverage: 1 fraction (basis: 10080/10080 observed minutes)
      calculation: 75000 existing + 30000 proposed = 105000 IOPS vs 120000 budget; headroom 15000 IOPS.
      implication: Front-end logical IOPS headroom exists for the proposed workload.
      next investigation: Confirm the declared sustainable IOPS envelope and the aligned demand peak on a real source.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not validated against a real array.
      assumptions:
        - Existing and proposed demand are aligned to the same modeled interval.
  Check iops.backend: needs-investigation
    driving minute: 120
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
        - backend operations weekly mean: 80555.91230936818 ops/s (basis: duration-weighted mean over valid minutes)
        - backend operations weekly P90: 115440 ops/s (basis: nearest-rank over valid minute samples)
        - backend operations weekly P95: 115440 ops/s (basis: nearest-rank over valid minute samples)
        - backend operations weekly max: 157650 ops/s (basis: observed interval maximum)
        - backend operations exceedance minutes: 0 minutes (basis: minutes above operating budget)
        - backend operations longest exceedance run: 0 minutes (basis: longest continuous run above budget)
        - backend operations exceedance recurrences: 0 count (basis: number of runs above budget)
        - weekly coverage: 1 fraction (basis: 10080/10080 observed minutes)
        - backend unknown minutes: 900 minutes (basis: minutes where the backend estimate is unknown)
      calculation: No backend estimate produced: proposed IO size exceeds the modeled backend block (read 65536 bytes, write 65536 bytes, backend block 16384 bytes); the classic read-modify-write factor does not apply; full-stripe or multi-block behavior is outside V1 scope.
      implication: The backend load for this demand sample is unknown; the IOPS dimension cannot be unconditionally ready.
      next investigation: Determine the real backend behavior for this IO profile (full-stripe or multi-block handling is outside V1) or bound the demand to the modeled block size.
      confidence: insufficient — An unknown participates: the model deliberately refuses to extrapolate.
      assumptions:
        - The classic read-modify-write model applies only when read and write block sizes are at or below the modeled backend block.
Dimension throughput: modeled-ready
  Check throughput: modeled-ready
    driving minute: 120
    headroom: 884.38 MiB/s
    % of operating budget: 63.2%   % of limit: 50.5%
    Finding R-THR-1: Combined throughput demand is within the throughput operating budget.
      evidence:
        - existing throughput: 278528000 bytes/second (basis: derived: existing IOPS × block sizes)
        - proposed throughput: 1310720000 bytes/second (basis: derived: proposed IOPS × block sizes)
        - throughput operating budget: 2516582400 bytes/second (basis: 0.8 × sustainable throughput limit)
        - sustainable throughput limit: 3145728000 bytes/second (basis: synthetic infrastructure profile)
        - throughput weekly mean: 703886831.7460318 bytes/second (basis: duration-weighted mean over valid minutes)
        - throughput weekly P90: 942080000 bytes/second (basis: nearest-rank over valid minute samples)
        - throughput weekly P95: 1589248000 bytes/second (basis: nearest-rank over valid minute samples)
        - throughput weekly max: 1589248000 bytes/second (basis: observed interval maximum)
        - throughput exceedance minutes: 0 minutes (basis: minutes above operating budget)
        - throughput longest exceedance run: 0 minutes (basis: longest continuous run above budget)
        - throughput exceedance recurrences: 0 count (basis: number of runs above budget)
        - weekly coverage: 1 fraction (basis: 10080/10080 observed minutes)
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
    Finding R-LAT-1: Baseline P95 latency 1.2 ms is at or below the workload target 1.5 ms; post-addition latency unknown: no validated response curve in V1.
      evidence:
        - baseline P95 latency: 1.2 ms (basis: aligned demand sample (screening indicator))
        - baseline maximum latency: 1.4 ms (basis: aligned demand sample)
        - workload latency target: 1.5 ms (basis: synthetic workload profile)
      calculation: baseline P95 1.2 ms vs target 1.5 ms; baseline max 1.4 ms shown alongside.
      implication: No baseline latency concern is indicated, but this says nothing about latency after the proposed workload is added.
      next investigation: Establish post-addition latency with a validated response model or measurements; V1 cannot.
      confidence: insufficient — Post-addition latency is an unknown in V1 by design.
      assumptions:
        - Baseline P95 is a screening indicator only; the maximum is shown alongside.
        - Post-addition latency unknown: no validated response curve in V1.
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
    driving minute: 10079
    headroom: 31.63 TiB
    % of operating budget: 85.1%   % of limit: 68.1%
    Finding R-GRO-1: Projected capacity at the 1-year horizon is within the capacity operating budget.
      evidence:
        - existing used capacity: 132295243081673.61 bytes (basis: aligned demand sample)
        - existing annual growth fraction: 0.15 fraction (basis: synthetic infrastructure profile)
        - proposed workload capacity: 32985348833280 bytes (basis: synthetic workload profile)
        - proposed annual growth fraction: 0.4 fraction (basis: synthetic workload profile)
        - planning horizon: 1 years (basis: assessment option)
        - capacity operating budget: 233096465088512 bytes (basis: 0.8 × usable capacity)
        - maximum used capacity over trace: 132295243081673.61 bytes (basis: maximum usedCapacityBytes over valid trace minutes (E-5))
      calculation: projected = 120.32 TiB × (1 + 0.15)^1 + 30 TiB × (1 + 0.4)^1 = 180.37 TiB vs 212 TiB budget; headroom 31.63 TiB.
      implication: The modeled environment retains capacity headroom at the 1-year planning horizon.
      next investigation: Validate the declared growth fractions against observed consumption trends; compound growth dominates at longer horizons.
      confidence: high — Deterministic compound-growth arithmetic on declared synthetic inputs; growth rates themselves are assumptions.
      assumptions:
        - Annual growth fractions are synthetic assumptions, not observed trends.
        - Horizon is 1 year(s); horizon 0 equals the current-capacity check.
```



## INF-B × WL-RAG

Coverage: 10080/10080 (100.00%)

| resource | mean | P90 | P95 | max | budget | exceedance min | longest run | recurrences | notes |
|---|---|---|---|---|---|---|---|---|---|
| front-end IOPS | 51026.54 | 80000.00 | 80000.00 | 105000.00 | 120000.00 | 0 | 0 | 0 |  |
| backend ops/s | 107271.44 | 165040.00 | 165040.00 | 208650.00 | 200000.00 | 100 | 10 | 10 | unknown minutes: 900 |
| throughput B/s | 703886831.75 | 942080000.00 | 1589248000.00 | 1589248000.00 | 2516582400.00 | 0 | 0 | 0 |  |

Latency (derived): P90 0.90 ms, P95 1.20 ms, max 1.40 ms.
Max used capacity: 120.3218 TiB.
Default detail day: day 0 — longest exceedance run: backend operations 208650.00000000003 vs budget 200000 at 2026-10-05T10:05:00.000Z (run length 10 min)
Overall: modeled-constraint; dimensions: capacity=modeled-ready, iops=modeled-constraint, throughput=modeled-ready, latency=needs-investigation, protection=modeled-ready, growth=modeled-constraint.

Hidden-burst check — Monday 10-minute buckets (mean never exceeds the backend budget
even where per-minute maxima do):

| bucket start | backend mean | backend max | minutes > budget |
|---|---|---|---|
| 2026-10-05T10:00:00.000Z | 180025.00 | 208650.00 | 5 |
| 2026-10-05T10:10:00.000Z | 180025.00 | 208650.00 | 5 |
| 2026-10-05T10:20:00.000Z | 151400.00 | 151400.00 | 0 |
| 2026-10-05T10:30:00.000Z | 151400.00 | 151400.00 | 0 |
| 2026-10-05T10:40:00.000Z | 151400.00 | 151400.00 | 0 |
| 2026-10-05T10:50:00.000Z | 151400.00 | 151400.00 | 0 |
| 2026-10-05T14:00:00.000Z | 180025.00 | 208650.00 | 5 |
| 2026-10-05T14:10:00.000Z | 180025.00 | 208650.00 | 5 |
| 2026-10-06T10:00:00.000Z | 180025.00 | 208650.00 | 5 |
| 2026-10-06T10:10:00.000Z | 180025.00 | 208650.00 | 5 |
| 2026-10-06T14:00:00.000Z | 180025.00 | 208650.00 | 5 |
| 2026-10-06T14:10:00.000Z | 180025.00 | 208650.00 | 5 |
| 2026-10-07T10:00:00.000Z | 180025.00 | 208650.00 | 5 |
| 2026-10-07T10:10:00.000Z | 180025.00 | 208650.00 | 5 |
| 2026-10-07T14:00:00.000Z | 180025.00 | 208650.00 | 5 |
| 2026-10-07T14:10:00.000Z | 180025.00 | 208650.00 | 5 |
| 2026-10-08T10:00:00.000Z | 180025.00 | 208650.00 | 5 |
| 2026-10-08T10:10:00.000Z | 180025.00 | 208650.00 | 5 |
| 2026-10-08T14:00:00.000Z | 180025.00 | 208650.00 | 5 |
| 2026-10-08T14:10:00.000Z | 180025.00 | 208650.00 | 5 |
| 2026-10-09T10:00:00.000Z | 180025.00 | 208650.00 | 5 |
| 2026-10-09T10:10:00.000Z | 180025.00 | 208650.00 | 5 |
| 2026-10-09T14:00:00.000Z | 180025.00 | 208650.00 | 5 |
| 2026-10-09T14:10:00.000Z | 180025.00 | 208650.00 | 5 |

```
Synthetic data. Educational demonstration; not vendor sizing or production configuration guidance.
Overall: modeled-constraint
Ruleset: 1.0.0-m2   Budget fraction: 0.8
Infrastructure: INF-B   Workload: WL-RAG   Trace: trace:2026-10-05T00:00:00Z
Options: demand multiplier 1x, horizon 1 year(s)
Weekly (10,080-minute trace; coverage 10080/10080 = 100.0%):
  front-end IOPS: mean 51026.54 IOPS  P90 80000 IOPS  P95 80000 IOPS  max 105000 IOPS  |  budget 120000 IOPS  |  exceedance 0 min (0.00% of valid), longest run 0 min, 0 runs
  backend ops: mean 107271.44 ops/s  P90 165040 ops/s  P95 165040 ops/s  max 208650 ops/s  |  budget 200000 ops/s  |  exceedance 100 min (1.09% of valid), longest run 10 min, 10 runs  |  unknown minutes 900
  throughput: mean 671.28 MiB/s  P90 898.44 MiB/s  P95 1515.63 MiB/s  max 1515.63 MiB/s  |  budget 2400 MiB/s  |  exceedance 0 min (0.00% of valid), longest run 0 min, 0 runs
  latency: P90 0.9 ms  P95 1.2 ms  max 1.4 ms
  max used capacity: 120.32 TiB
Default detail day: day 0 (Monday) — longest exceedance run: backend operations 208650.00000000003 vs budget 200000 at 2026-10-05T10:05:00.000Z (run length 10 min)
Dimension capacity: modeled-ready
  Check capacity: modeled-ready
    driving minute: 10079
    headroom: 19.28 TiB
    % of operating budget: 88.6%   % of limit: 70.9%
    Finding R-CAP-1: Combined used plus proposed capacity is within the capacity operating budget.
      evidence:
        - existing used capacity: 132295243081673.61 bytes (basis: aligned demand sample)
        - proposed workload capacity: 32985348833280 bytes (basis: synthetic workload profile)
        - capacity operating budget: 186477172070809.62 bytes (basis: 0.8 × usable capacity)
        - usable capacity limit: 233096465088512 bytes (basis: synthetic infrastructure profile)
        - maximum used capacity over trace: 132295243081673.61 bytes (basis: maximum usedCapacityBytes over valid trace minutes (E-5))
      calculation: 120.32 TiB used + 30 TiB proposed = 150.32 TiB combined vs 169.6 TiB budget (0.8 × 212 TiB usable); headroom 19.28 TiB.
      implication: Modeled capacity headroom exists for the proposed workload at the declared synthetic values.
      next investigation: Confirm real usable capacity and current consumption before relying on this result.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not validated against a real array.
      assumptions:
        - Usable capacity excludes spares and metadata reserves.
Dimension iops: modeled-constraint
  Check iops.frontend: modeled-ready
    driving minute: 605
    headroom: 15000 IOPS
    % of operating budget: 87.5%   % of limit: 70.0%
    Finding R-FE-1: Combined front-end IOPS demand is within the front-end operating budget.
      evidence:
        - existing front-end IOPS: 75000 IOPS (basis: aligned demand sample (reads + writes))
        - proposed front-end IOPS: 30000 IOPS (basis: aligned demand sample (reads + writes))
        - front-end IOPS operating budget: 120000 IOPS (basis: 0.8 × sustainable front-end IOPS limit)
        - sustainable front-end IOPS limit: 150000 IOPS (basis: synthetic infrastructure profile)
        - front-end IOPS weekly mean: 51026.5376984127 IOPS (basis: duration-weighted mean over valid minutes)
        - front-end IOPS weekly P90: 80000 IOPS (basis: nearest-rank over valid minute samples)
        - front-end IOPS weekly P95: 80000 IOPS (basis: nearest-rank over valid minute samples)
        - front-end IOPS weekly max: 105000 IOPS (basis: observed interval maximum)
        - front-end IOPS exceedance minutes: 0 minutes (basis: minutes above operating budget)
        - front-end IOPS longest exceedance run: 0 minutes (basis: longest continuous run above budget)
        - front-end IOPS exceedance recurrences: 0 count (basis: number of runs above budget)
        - weekly coverage: 1 fraction (basis: 10080/10080 observed minutes)
      calculation: 75000 existing + 30000 proposed = 105000 IOPS vs 120000 budget; headroom 15000 IOPS.
      implication: Front-end logical IOPS headroom exists for the proposed workload.
      next investigation: Confirm the declared sustainable IOPS envelope and the aligned demand peak on a real source.
      confidence: high — Arithmetic comparison on complete declared inputs; synthetic values are not validated against a real array.
      assumptions:
        - Existing and proposed demand are aligned to the same modeled interval.
  Check iops.backend: modeled-constraint
    driving minute: 605
    headroom: -8650 ops/s
    % of operating budget: 104.3%   % of limit: 83.5%
    Finding R-BE-4: Combined backend operation demand exceeds the backend operating budget. Front-end headroom exists, but backend operations exceed the budget because of the RAID write factor.
      evidence:
        - existing backend reads: 104250.00000000001 ops/s (basis: derived from existing logical demand)
        - existing backend writes: 67500.00000000001 ops/s (basis: derived from existing logical demand)
        - background backend demand: 0 ops/s (basis: declared on the demand sample; added exactly once)
        - proposed backend reads: 27900 ops/s (basis: derived: proposed reads × (1 − hit) + writes × factor)
        - proposed backend writes: 8999.999999999998 ops/s (basis: derived: proposed writes × factor)
        - backend operating budget: 200000 ops/s (basis: 0.8 × backend sustainable operation limit)
        - backend sustainable operation limit: 250000 ops/s (basis: synthetic infrastructure profile)
        - backend operations weekly mean: 107271.43518518518 ops/s (basis: duration-weighted mean over valid minutes)
        - backend operations weekly P90: 165040 ops/s (basis: nearest-rank over valid minute samples)
        - backend operations weekly P95: 165040 ops/s (basis: nearest-rank over valid minute samples)
        - backend operations weekly max: 208650.00000000003 ops/s (basis: observed interval maximum)
        - backend operations exceedance minutes: 100 minutes (basis: minutes above operating budget)
        - backend operations longest exceedance run: 10 minutes (basis: longest continuous run above budget)
        - backend operations exceedance recurrences: 10 count (basis: number of runs above budget)
        - weekly coverage: 1 fraction (basis: 10080/10080 observed minutes)
        - backend unknown minutes: 900 minutes (basis: minutes where the backend estimate is unknown)
      calculation: existing 171750.00000000003 ops/s + background 0 + proposed 36900 ops/s (reads 27900 + writes 8999.999999999998; RAID 6 factor 3+3 per logical write) = 208650.00000000003 ops/s vs 200000 ops/s budget; headroom -8650 ops/s.
      implication: The RAID 6 write factor pushes modeled backend operations over budget. Front-end headroom exists, but backend operations exceed the budget because of the RAID write factor.
      next investigation: Investigate whether the real array coalesces writes (outside the V1 model), or reduce proposed write demand.
      confidence: high — Arithmetic on complete declared inputs within the explicitly bounded model; not a physical-array simulation.
      assumptions:
        - RAID 6 classic read-modify-write: each logical write costs 3 backend reads + 3 backend writes.
        - Write-back cache with no coalescing; sustained writes are not treated as zero.
        - Full-stripe writes, erasure coding, compression/dedup, metadata IO, flash write amplification, replication overhead, and rebuild load are outside this calculation.
Dimension throughput: modeled-ready
  Check throughput: modeled-ready
    driving minute: 120
    headroom: 884.38 MiB/s
    % of operating budget: 63.2%   % of limit: 50.5%
    Finding R-THR-1: Combined throughput demand is within the throughput operating budget.
      evidence:
        - existing throughput: 278528000 bytes/second (basis: derived: existing IOPS × block sizes)
        - proposed throughput: 1310720000 bytes/second (basis: derived: proposed IOPS × block sizes)
        - throughput operating budget: 2516582400 bytes/second (basis: 0.8 × sustainable throughput limit)
        - sustainable throughput limit: 3145728000 bytes/second (basis: synthetic infrastructure profile)
        - throughput weekly mean: 703886831.7460318 bytes/second (basis: duration-weighted mean over valid minutes)
        - throughput weekly P90: 942080000 bytes/second (basis: nearest-rank over valid minute samples)
        - throughput weekly P95: 1589248000 bytes/second (basis: nearest-rank over valid minute samples)
        - throughput weekly max: 1589248000 bytes/second (basis: observed interval maximum)
        - throughput exceedance minutes: 0 minutes (basis: minutes above operating budget)
        - throughput longest exceedance run: 0 minutes (basis: longest continuous run above budget)
        - throughput exceedance recurrences: 0 count (basis: number of runs above budget)
        - weekly coverage: 1 fraction (basis: 10080/10080 observed minutes)
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
    Finding R-LAT-1: Baseline P95 latency 1.2 ms is at or below the workload target 1.5 ms; post-addition latency unknown: no validated response curve in V1.
      evidence:
        - baseline P95 latency: 1.2 ms (basis: aligned demand sample (screening indicator))
        - baseline maximum latency: 1.4 ms (basis: aligned demand sample)
        - workload latency target: 1.5 ms (basis: synthetic workload profile)
      calculation: baseline P95 1.2 ms vs target 1.5 ms; baseline max 1.4 ms shown alongside.
      implication: No baseline latency concern is indicated, but this says nothing about latency after the proposed workload is added.
      next investigation: Establish post-addition latency with a validated response model or measurements; V1 cannot.
      confidence: insufficient — Post-addition latency is an unknown in V1 by design.
      assumptions:
        - Baseline P95 is a screening indicator only; the maximum is shown alongside.
        - Post-addition latency unknown: no validated response curve in V1.
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
    driving minute: 10079
    headroom: -10.77 TiB
    % of operating budget: 106.4%   % of limit: 85.1%
    Finding R-GRO-1: Projected capacity at the 1-year horizon exceeds the capacity operating budget.
      evidence:
        - existing used capacity: 132295243081673.61 bytes (basis: aligned demand sample)
        - existing annual growth fraction: 0.15 fraction (basis: synthetic infrastructure profile)
        - proposed workload capacity: 32985348833280 bytes (basis: synthetic workload profile)
        - proposed annual growth fraction: 0.4 fraction (basis: synthetic workload profile)
        - planning horizon: 1 years (basis: assessment option)
        - capacity operating budget: 186477172070809.62 bytes (basis: 0.8 × usable capacity)
        - maximum used capacity over trace: 132295243081673.61 bytes (basis: maximum usedCapacityBytes over valid trace minutes (E-5))
      calculation: projected = 120.32 TiB × (1 + 0.15)^1 + 30 TiB × (1 + 0.4)^1 = 180.37 TiB vs 169.6 TiB budget; headroom -10.77 TiB.
      implication: Growth projection exceeds the capacity operating budget within 1 year(s); capacity expansion timing becomes a planning constraint.
      next investigation: Validate the declared growth fractions against observed consumption trends; compound growth dominates at longer horizons.
      confidence: high — Deterministic compound-growth arithmetic on declared synthetic inputs; growth rates themselves are assumptions.
      assumptions:
        - Annual growth fractions are synthetic assumptions, not observed trends.
        - Horizon is 1 year(s); horizon 0 equals the current-capacity check.
```

