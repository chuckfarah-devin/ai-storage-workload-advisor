# AI Storage Workload Advisor
## Technical Specification — proposed 0.2

Depends on Business/Product Specification 0.3. This is a design document; milestone M1 implements the static engine described in §Assessment rules and §Backend, and later milestones implement the rest.  
Version history: 0.1 reviewed baseline (October 6, 2026); 0.2 first-review edits E-3, E-4, E-5, E-6, E-9, E-10, E-11, E-12, E-13, E-15, E-16 applied per DECISIONS.md resolutions (October 6, 2026). Requirement/rule identifiers R-* are defined in docs/devin-initial-review.md §6.1 and docs/tests.md.

### Architecture

A small browser application with bundled, versioned synthetic data and a deterministic assessment engine. No backend, accounts, credentials, uploaded files, or external AI calls in V1. Select an infrastructure profile and either VMware/private cloud or AI/RAG demand; view baseline, proposed addition, and a what-if comparison. Keep data normalization, validation, assessment rules, and presentation separate. Choose the frontend stack during implementation planning based on maintainability; the business model must not depend on it.

### Internal model

- Profile metadata: identifier, schema version, synthetic flag, description, assumptions, provenance, time window, and demand basis.
- Infrastructure: usable capacity and used capacity in bytes; annual capacity-growth fraction; sustained front-end IOPS and throughput limits; baseline latency in milliseconds; documented synthetic protection capabilities (fixed vocabulary below); backend fields: protection layout (RAID 5 or RAID 6), data/parity width, backend sustainable operation limit, backend operation (block) size in bytes, read-cache hit fraction, write policy, declared background backend demand, and `existingBackendBasis` (`derived-from-logical-trace` or `supplied-physical`). Existing demand is carried by the minute trace (or, in M1, by an aligned demand sample); any static existing-demand figure is a derived summary, never an additional input.
- Workload: capacity bytes; annual capacity-growth fraction; daily/weekly demand schedule from which the proposed per-minute trace is generated (the scalar IOPS field is the schedule peak and is informational); read fraction; read and write block sizes in bytes; latency target milliseconds; required protection/availability properties (fixed vocabulary below); replication requirement and explicitly included overhead, if known.
- Aligned demand sample: one timestamp's existing and proposed read IOPS, write IOPS, and read/write block sizes, plus used capacity, baseline latency evidence (P95 and maximum), and declared background backend demand. The static rules operate on one sample; the time-series layer supplies one sample per minute.
- Evidence: value, unit, basis, assumption reference, and missing-data reason. Unknown is distinct from zero. Utilization percentages are derived, not additional demand.
- Assessment: ruleset version, profile identifiers, scenario inputs, six dimension results, findings, overall status, and baseline/what-if deltas.

Use usable capacity after protection overhead. All performance quantities use aligned sustained-demand windows; do not combine unrelated peaks. Canonical units are bytes, seconds, IOPS, and milliseconds; display capacity as TiB and throughput as MiB/s with explicit labels.

### Time-series model and aggregation

Generate one deterministic synthetic seven-day trace of 10,080 one-minute intervals per modeled environment, with fixed seed and declared UTC start/end. V1 days are fixed 24-hour simulation days; label timezone explicitly and avoid daylight-saving ambiguity. Store metrics in columns on timestamped interval records. A 24-hour detail window has 1,440 records; aggregate weekly display into 1,008 nonoverlapping ten-minute buckets. If both display datasets are materialized, their combined size is 2,448 records, not one million. Retain the underlying minute trace for calculations and event detection.

Each record declares interval start, duration, existing read/write IOPS, proposed read/write IOPS, applicable block sizes, modeled latency evidence, used capacity, and any declared background backend demand. Baseline and proposed demand must align in time. Calculate derived throughput and backend operations per minute before aggregation; do not apply a daily average read/write ratio to peak demand. The same timeline feeds all views and comparisons.

For each ten-minute bucket, retain duration-weighted mean rates, per-metric minute maxima, capacity at bucket end, and minute count above each operating budget. Never sum rate values as if they were rates; integrate operations as rate × duration when totals are needed. Keep actual minute timestamps for coincident constraints; maxima for different metrics may occur at different times and must not be combined into a fictional peak record.

Compute weekly mean, P90, P95, and observed interval maximum from underlying minute rates. Use nearest-rank percentiles: sort the N valid minute samples ascending and take the value at 1-based rank ⌈k/100 × N⌉; for N = 10,080, P90 is rank 9,072 and P95 is rank 9,576. Fixed-duration complete traces make samples equally weighted. Separately label percentiles of ten-minute means if displayed; they are not interchangeable with percentiles of minute samples. Report exceedance minutes, percentage of valid observed time, and longest consecutive exceedance. Missing intervals remain unknown, break confirmed continuous runs, and reduce reported coverage; never fill them with zero. If coverage for a resource is below 100%, that resource cannot be *modeled ready*: it is *needs investigation* unless an exceedance was observed, in which case the constraint stands.

Performance checks use the aligned minute demands against the approved budgets; the exceedance test is evaluated per minute on combined demand, and ten-minute bucket statistics are display and context only. Any observed modeled exceedance produces a modeled constraint for that resource, with severity context provided by duration and recurrence; averages/percentiles provide recommendation context rather than override the constraint. No claim is made about sub-minute spikes or actual production latency. Capacity checks use maximum used capacity and the separate growth projection. Protection checks use capabilities, not time-series averages.

Default detail day: the earliest day containing the longest continuous exceedance across modeled performance resources; a run that crosses midnight belongs to the day containing its first minute, and equal-length runs resolve to the earliest start. If none exceed, the day containing the earliest minute that achieves the week's highest budget-utilization ratio (demand ÷ budget, per resource, per minute). State the selection reason and allow another fixed day to be selected. This targets troubleshooting and is not an unbiased sample of the whole week.

Additional verification: exact record counts, aligned timestamps, rate aggregation, percentile definition, a short burst hidden by a ten-minute mean, noncoincident peaks, missing coverage, and reproducible day selection. Validate frontend response with the small trace before considering storage or downsampling changes.

### Assessment rules

These are educational assumptions, not vendor thresholds. Chuck approved the 80% operating budget on October 6, 2026. Apply it to each supplied usable-capacity, sustainable front-end IOPS, throughput, and backend-operation limit, reserving 20% headroom. Show and document that policy; exceeding the budget means a modeled constraint even before the full limit is reached. Do not apply this percentage to latency targets or protection capabilities.

Current capacity = maximum observed existing used capacity + proposed workload capacity. (With a single aligned sample, the sample's used capacity is the maximum.)

Projected capacity at horizon h years = maximum observed existing used capacity × (1 + existing annual growth)^h + proposed capacity × (1 + proposed annual growth)^h. The growth-headroom dimension evaluates the selected horizon, default 1 year; 0 and 3 years are what-ifs, and the dimension always states its horizon.

Proposed throughput = proposed IOPS × [read fraction × read block size + (1 − read fraction) × write block size]. V1 fixture throughput is derived this way to avoid conflicting independent inputs.

Combined IOPS/throughput = existing demand + proposed demand. Workload-demand what-if factors apply to proposed IOPS, derived throughput, and the derived proposed backend estimate; proposed capacity is unaffected by the demand factor. Capacity-growth what-ifs use the projection separately. Controls are preset multipliers (1×, 1.5×, 2×) and horizons (0, 1, 3 years), without a general profile editor.

Capacity, IOPS, and throughput compare combined demand to their operating budgets. Equality is within budget; negative remaining headroom is a constraint. Growth headroom compares projected capacity to the capacity budget at the chosen horizon, rather than inventing a performance-growth forecast.

Headroom is reported in absolute units relative to the operating budget (bytes, IOPS, operations/second, bytes/second; negative means constraint). Percentages use the operating budget as the primary denominator ("% of operating budget"); utilization of the physical limit may be shown secondarily and must be labeled "% of limit". The two denominators are never mixed on one axis.

Latency: compare the baseline weekly P95 of minute latency (a screening indicator, with the maximum shown alongside) to the workload target. P95 above target is a modeled constraint labeled as a baseline condition, before addition; P95 at or below target does not establish post-addition readiness and yields needs investigation. Missing P95 or missing target yields needs investigation. V1 always returns needs investigation for post-addition latency because it has no validated response curve.

Protection: compare explicit required and available capabilities using the fixed V1 vocabulary. Infrastructure capabilities: `toleratedDriveFailures` (integer, from layout), `snapshots` (boolean), `encryptionAtRest` (boolean), `replication` (`none`, `async`, `sync`, or `unknown`). Workload requirements: `minToleratedDriveFailures`, `snapshots`, `encryptionAtRest`, `replicationRequired` (`none`, `async`, `sync`). A definite shortfall is a constraint; an `unknown` or missing capability against a requirement is needs investigation; a `none` replication requirement is satisfied regardless of the array's replication capability. The V1 capability vocabulary covers selected capabilities, not complete availability assurance. Do not equate replication with backup or infer availability from a single feature. Unknown replication overhead makes affected performance evidence incomplete. Fixtures may specify no replication requirement to keep a comparison bounded.

Status precedence applies at every level: a sub-check, a dimension, and the overall result are modeled constraint if any component is a constraint; otherwise needs investigation if any component is unknown; otherwise modeled ready. Overall status: any constraint → modeled constraint; otherwise any unknown → needs investigation; otherwise modeled ready. V1's unknown post-addition latency therefore prevents an unconditional overall ready verdict. Dimension-level ready results remain useful; the business acceptance examples reflect this. Confidence: high for arithmetic with complete inputs; moderate for declared capability matching; insufficient wherever an unknown participates.

### Backend IOPS extension — bounded V1 model

Distinguish logical front-end IOPS from physical backend operations. Each fixed synthetic infrastructure profile declares RAID 5 or RAID 6, data/parity width, backend sustainable operation limit and operation (block) size, read-cache hit fraction (one declared synthetic value per profile in V1, a stated simplification), write policy, declared background backend demand, `existingBackendBasis`, and exclusions. Synthetic scenarios use small random writes of one modeled backend block, no write coalescing, and no rebuild/degraded-state activity. Do not infer a real array's policy from its RAID label.

For this classic read-modify-write model, each logical write consumes two backend reads plus two backend writes on RAID 5 (factor 4) and three reads plus three writes on RAID 6 (factor 6). The parity-related reads are counted as backend reads:

- backend reads/second = logical read IOPS × (1 − read-cache hit fraction) + logical write IOPS × 2 (RAID 5) or × 3 (RAID 6)
- backend writes/second = logical write IOPS × 2 (RAID 5) or × 3 (RAID 6)
- total backend operations/second = backend reads + backend writes = logical reads × (1 − hit fraction) + logical writes × 4 (or × 6)

Write-back cache can delay destaging; it does not justify treating sustained writes as zero. Always report backend reads, backend writes, and their sum separately.

Block-size applicability: the classic model applies to a demand sample only if both the applicable read block size and the write block size are less than or equal to the profile's modeled backend block. If either exceeds it, the backend estimate for that sample is unknown, with the recorded reason "IO size exceeds the modeled backend block; the classic read-modify-write factor does not apply; full-stripe or multi-block behavior is outside V1 scope." No automatic scaling by size is performed. Over a set of samples the backend sub-check resolves with precedence constraint (any computable sample over budget) > unknown (any uncomputable sample) > ready.

Existing backend demand is derived from the existing logical demand using the same layout, factor, and hit-fraction assumptions as the proposed estimate, separately for each layout (`existingBackendBasis: derived-from-logical-trace`). A declared background backend demand (scrub, metadata, and similar) is a separate, layout-independent, additive term that is added exactly once. If a future source supplies physical backend telemetry (`existingBackendBasis: supplied-physical`), the engine must use the supplied reads and writes and must not derive or multiply them; mixing both bases in one assessment is a validation error.

Combined backend demand = existing backend demand + background backend demand + proposed backend estimate. Compare against the synthetic backend budget using the same operating-headroom policy. If front-end headroom exists but backend demand exceeds its budget, mark the IOPS dimension constrained and explain the distinction. Unknown write policy, cache behavior, inapplicable block sizes, or absent backend limits produces needs investigation for the backend check; it cannot yield unconditional IOPS readiness.

Provide a fixed educational RAID 5/RAID 6 comparison for identical logical demand, using two synthetic protection-layout variants with equal declared raw capacity and declared limits. Equal raw capacity and limits are a comparison device; they do not establish an identical physical drive arrangement. The comparison exposes operation overhead and the usable-capacity difference; it does not imply real-system performance. Full-stripe writes, modern distributed erasure coding, compression/deduplication, metadata IO, flash internal write amplification, replication overhead, and rebuild load are outside this calculation. Full-stripe physical-byte amplification can depend on (data + parity)/data, but that is not interchangeable with an IOPS multiplier.

Verification example: 10,000 logical IOPS, 70% reads, 30% writes, zero read-cache hits. RAID 5: backend reads 7,000 + 3,000 × 2 = 13,000; backend writes 3,000 × 2 = 6,000; total 19,000 operations/second. RAID 6: backend reads 7,000 + 3,000 × 3 = 16,000; backend writes 9,000; total 25,000. This excludes existing load and background activity. Tests must cover all-read/all-write cases, cache-hit boundaries, separate read/write totals, unknown assumptions, block-size applicability, and prevention of double-counting.

Research basis (pages verified October 6, 2026; see docs/research.md): IBM Redpaper REDP-4484, *Considerations for RAID-6 Availability and Format/Rebuild Performance on the DS5000*, [PDF](https://www.redbooks.ibm.com/redpapers/pdfs/redp4484.pdf), printed page 3 ("a total of four I/O operations"; "RAID-6 requires six operations in total"); IBM Redbook SG24-7808, *End to End Performance Management on IBM i*, [PDF](https://www.redbooks.ibm.com/redbooks/pdfs/sg247808.pdf), printed pages 249–250 ("four disk accesses… RAID 5… six disk accesses for RAID 6"); [Dell OneFS Writes](https://infohub.delltechnologies.com/en-us/p/onefs-writes/) describes write coalescing that avoids read-modify-write. These justify explicit model boundaries, not a universal array sizing rule.

### Findings and interface

Lead with the decision and limiting dimensions; show six dimension cards, evidence and assumptions, prioritized investigation steps, and baseline/what-if differences. Avoid a composite numeric readiness score. State that a limiting modeled dimension identifies a candidate bottleneck, not a proven root cause.

Every finding includes rule ID, input references, calculation, implication, next investigation, and confidence rationale. Confidence can be high for complete arithmetic evidence, moderate for declared capability matching, or insufficient for unknowns; it never represents production certainty.

The synthetic-data and educational-use label remains visible. Profile selection and what-if controls are the only data interactions. An optional plain-text assessment download carries the same labels and ruleset version.

### Future adapter boundary

Define a source adapter contract: obtain source observations; normalize them into the internal model; return validation diagnostics, timestamps, provenance, and unsupported fields. Missing fields remain unknown; adapters cannot supply invented defaults. Keep acquisition separate from assessment.

V1 implements only the bundled synthetic source. PowerMax REST and ONTAP REST are future candidate adapters with no endpoint mapping, connectivity, or support claim. Later implementation requires official API research, authentication design, unit/semantic mapping, and contract tests against verified samples.

### Validation and verification

Reject negative values, invalid fractions, nonpositive limits, used capacity above usable capacity, incompatible demand windows, and non-synthetic V1 input. Show incomplete evidence explicitly.

Test unit normalization, operating-budget boundaries, compounded growth, weighted throughput, missing evidence, protection mismatches, status precedence, and reproducibility. Verify both workload scenarios manually: explain each result from the fixture and rule; exercise growth controls; confirm readable narrow-screen layout and labels. No live-array validation is claimed.

### Open design choices

Chuck reviewed the documents and approved the 80% operating budget. The cautious latency treatment remains specified. Concrete synthetic profiles (docs/synthetic-profile-proposal.md) were accepted on October 6, 2026 as educational demonstration values, not as validation against real infrastructure; they must not be presented as VMware or RAG benchmark results, and Chuck may revise the cache-hit fraction, performance envelope, capacity additions, and growth rates before M2 fixtures are frozen. Stack: Vite, TypeScript, React, Vitest, Playwright. No vendor API research has yet been performed.
