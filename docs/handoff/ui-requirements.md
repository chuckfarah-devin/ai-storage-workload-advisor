# M3 UI requirements and scope

## Decision flow

Lead with “Can this environment support the proposed workload?” and the engine's modeled constraint / needs-investigation outcome. Surface limiting resources and next investigations, rather than a composite score or a reassuring overall green badge.

Show infrastructure and workload selections, demand multiplier (1/1.5/2), and growth horizon (0/1/3 years; default one). Ship both VMware/private cloud and AI/RAG and both accepted protection variants. Six dimension cards show capacity, IOPS, throughput, latency, protection, and growth headroom. IOPS retains separate front-end and backend subchecks. Show absolute headroom, primary budget utilization, and separately labeled physical-limit utilization where useful.

## Environment

Use expandable Environment details containing architecture, drive count/type/capacity, RAID groups/parity/spares, raw-to-usable capacity and reserves, ports, and declared performance assumptions. Use accepted environment fields rather than the legacy mockup fiction. Explain that group-level fault tolerance and selected capabilities do not establish whole-system availability.

## Charts and investigation

- Weekly: real 1,008 ten-minute buckets, mean plus minute maximum, operating budget, exceedance shading/count, and model/observation coverage. Make the hidden-burst example visible.
- Detailed: real 1,440 minute records for selected day; ability to zoom/select a challenging period. Selected day comes from the engine, with the reason shown. X axis time (UTC); Y1 selectable front-end IOPS/bandwidth; Y2 baseline latency ms with dashed styling and clearly independent scale. Backend evidence is a distinct series/view using ops/s, not host IOPS.
- Hover/tap interval detail: timestamp/start-end/duration, displayed demand, applicable mean/max for buckets, latency statistic definition, budgets/ceiling, exceedance minutes, and unknown/missing evidence. Means, maxima and per-metric peaks do not imply coincidence.
- Provide keyboard-accessible interval inspection and visible essential details without hover. Use accessible labels and sufficient touch targets.
- Inspection presets: morning burst, afternoon burst, nightly batch/backup candidate. Resolve timestamps from actual data/preset metadata, not magic hardcoded chart coordinates. Missing event/day evidence must be explained.
- Nightly preset examines the existing batch. Do not create a backup workload or claim window completion; show “backup completion/window compliance not modeled” unless actual scoped inputs exist.

## Potential and connectivity

Draw the supplied front-end sustainable ceiling separately from its 80% operating budget. Label it **declared front-end ceiling**, not end-to-end I/O potential. Backend ceilings belong on backend axes. Demand may cross a ceiling; never force the ceiling to stay above demand. Future workload-specific limiter modeling is deferred.

Expandable host connection previews: NVMe/FC 64G, NVMe/TCP 100 GbE, NVMe/TCP 25 GbE, iSCSI 25 GbE, FC 32G. These preview choices do not change V1 assessments or imply validated transport support. Keep them subordinate to the actual accepted environment's descriptive connectivity.

Entry/Medium/High conceptual configurations can appear in a separate “Future configurations” section, visibly V2/unmodeled. Use descriptions in the study, not computed performance gains. Do not mix them into the operative V1 infrastructure selector. CPU/cache/device accounting remains unresolved.

## Evidence, export, and presentation

Findings show condition, evidence, rule, calculation, implication, confidence rationale, assumptions and next investigation. What-if comparison updates from the engine and preserves independent capacity/performance assumptions. Assessment export carries profile IDs, ruleset/options, coverage and educational limits.

Synthetic-data/educational label remains visible throughout. Confidence is confidence in the declared model evidence, not deployment certainty. Missing and unknown values are never plotted as zero or connected through as if known. For RAG, label backend summaries “computable minutes only” and show 900 unknown minutes for the baseline scenario using actual engine output.

Decimal bandwidth display follows the chart addendum, converting bytes rather than relabeling MiB. All quantities on one chart use one unit, selected consistently from demand plus references. Preserve separate axis labels on narrow screens; stack panels rather than crowding them.

## Acceptance

All four combinations render the current engine results; what-ifs refresh every relevant result once; chart and export labels match canonical data; hovering/selecting a hidden burst exposes it; no invented backup completion, host-transport benefit, V2 ceiling, or post-addition latency appears. Verify the agreed weekly statistics and resource-specific model coverage. No mocked numbers enter production.

M3 may run meaningful component/browser smoke checks. Comprehensive Playwright verification and screenshots/findings remain M4. Report actual checks and any incomplete coverage. Deployment, remote push and new paid services remain excluded.
