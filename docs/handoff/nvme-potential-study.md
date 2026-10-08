# NVMe performance potential — initial study and UI direction

Prepared October 7, 2026. Research-backed design direction, not validated sizing or a completed performance model. All portfolio environments remain synthetic. This addendum does not authorize expanding Devin's current milestone.

## Recommendation

Keep Chuck's potential line, but label it **workload-specific modeled ceiling**. Show the supplied sustainable array limit and its separate 80% operating budget in V1. In V2, explain the ceiling with media, controller/software, PCIe/internal fabric, front-end transport, cache/destage, and required protection constraints. Unknown constraints prevent claiming a fully established ceiling. Do not present summed NVMe device maxima as usable host IOPS.

## Evidence

- [SNIA solid-state test methodology](https://www.snia.org/sites/default/files/UnderstandingSSDPerformance.Jan12.web_.pdf) explains why preconditioning, steady state, read/write/block-size stimulus, and outstanding IO affect performance. This is older methodology guidance, not a current device benchmark. [Current SNIA PTS landing page](https://www.snia.org/tech_activities/standards/curr_standards/pts) supplies the standards references.
- [Samsung's PM1743 announcement](https://news.samsung.com/us/samsung-develops-high-performance-pcie-5-ssd-enterprise-servers/) reports up to 2.5 million random-read IOPS and 250,000 random-write IOPS, plus 13,000/6,600 MB/s sequential read/write. These are announcement-era device ceilings from one product, not a generic NVMe or mixed array rating. The later whitepaper has different figures; do not combine revisions or capacities into a fabricated benchmark. This initial study uses the accessible announcement only as evidence of the read/write asymmetry and scale.
- [NVM Express NVMe/TCP Q&A](https://nvmexpress.org/answering-your-questions-nvme-tcp-what-you-need-to-know-about-the-specification-webcast-qa/) explains dependence on CPU resources, networking-stack efficiency, and offload implementation. It does not establish universal performance ordering for the proposed SAN choices.
- [SPDK performance test setup](https://github.com/spdk/spdk/blob/master/test/nvme/perf/README.md) makes CPU placement, NUMA locality, device/core allocation, workload and queue depth explicit. [SPDK reports](https://spdk.io/doc/performance_reports.html) are candidate calibration sources, not direct mappings to a protected dual-controller enterprise array. No report numbers have been imported into the model.

## What replaces a drive-count multiplier?

At a specified workload shape, find the largest host-demand rate satisfying each modeled resource's constraints. A simplified envelope is the minimum of compatible host-equivalent ceilings: media, controller/software, internal bandwidth, host transport, sustained destage, and any latency-qualified operating point. This is a modeling proposal, not a validated universal equation. Include only explicitly supported conversions; report unresolved components rather than silently treating them as unlimited.

For simple protected small-block V1 demand, backend demand coefficient per host IO = read fraction × (1 − read-hit fraction) + write fraction × write factor. The implied backend-limited host ceiling is declared backend ops/s limit divided by that coefficient. This holds only for the existing classic read-modify-write assumptions, equal applicable operation size, no coalescing, and sustained load. The coefficient changes with workload shape; a mixed workload requires resource accounting per component, not one average ratio imposed on all periods.

Chuck's HDD example illustrates the distinction: if 10 drives each supply 180 physical random operations/s, aggregate media potential is 1,800 backend operations/s. With zero read hits, a 70/30 logical mix under classic RAID 6 consumes 0.7 + 0.3×6 = 2.5 backend operations per host IO, implying 720 host IOPS before other limits. Do not apply this again if the original 180 rating already included protected host-workload overhead. The 180 value is Chuck's illustrative assumption, not a researched drive rating.

For NVMe, store a benchmark surface indexed by read/write mix, read/write sizes, random/sequential pattern, outstanding IO, data-reduction state, protection, fullness and steady-state condition. Separate device/backend rates from logical host rates. Read-only and write-only endpoints do not establish a mixed-workload surface; do not linearly interpolate them without explicit assumptions and calibration. Sum independent device capabilities only as a conditional media reference, with aggregation assumptions visible.

Controller type alone is insufficient. Record cores allocated to storage, clocks, NUMA, PCIe generation/lane topology, software path/version, compression/encryption/parity work, network offload, and benchmark provenance. Prefer measured or explicitly synthetic envelope tables over guessed cycles-per-IO. No numeric Skylake-to-modern-CPU multiplier is proposed.

For bandwidth constraints, use directional payload demand and effective payload budgets by path. Convert bandwidth to IOPS only using the corresponding read/write block sizes. Separate reads and writes because link direction and CPU/backend cost differ. Nominal Gbit/s ÷ 8 is a raw arithmetic reference, not usable application bandwidth. FC generation labels are not interchangeable with Ethernet payload rates; require transport-specific evidence/assumptions. Multipathing does not automatically double throughput, and standby paths do not count as active capacity. A faster link can leave an array CPU limit unchanged.

## Cache and backup

Cache may absorb bursts or serve read hits, but sustained write potential must account for destage. NVMe cache drives are not automatically NVRAM: define power-loss protection, mirroring, recovery behavior, cache capacity, dirty-data threshold, and sustained flush rate. Do not count cache drives as capacity/media-pool drives. A cache-SSD count does not establish performance improvement.

Add an inspection preset labeled nightly batch/backup candidate, but keep the existing batch schedule distinct from a simulated backup job. Establishing backup-window compliance needs backup bytes, deadline, source/target paths, effective sustained transfer rate, foreground contention, protection/data-reduction assumptions, and completion accounting. A low IOPS period alone cannot prove the job meets its window. V1 can inspect the period; a modeled completion forecast belongs in V2 unless separately scoped.

## Proposed V2 configurations — descriptive candidates only

| Tier | Architecture direction | Media/cache | Default connection | Unresolved details |
|---|---|---|---|---|
| Entry | Dual controller; Skylake-era reference CPU | Capacity-drive count TBD; declared protected cache | NVMe/TCP over 25 GbE | Exact CPU/cores, PCIe topology, drive model/count, measured envelope |
| Medium | Dual controller; newer/faster CPU | 25 NVMe SSDs total; possible 24 group members + 1 spare; protected NVMe write-cache/log concept | NVMe/TCP over 100 GbE | Protection layout, separate cache device accounting, cache semantics, exact CPU |
| High | Dual controller; newer/faster CPU | 48 capacity NVMe SSDs plus ~8 dedicated cache SSDs, provisionally 56 devices | NVMe/TCP over 100 GbE; optional NVMe/FC 64G | Clarify whether cache is inside or additional to 48; enclosure/PCIe topology; exact protection/cache arrangement |

These are Chuck's conceptual tiers with tentative accounting, not approved fixtures or equivalent vendor products. Do not derive speed from the tier names. The medium 25 count can support two 10+2 RAID 6 groups and a spare as one candidate, not a finalized requirement. High requires a physical envelope that actually accommodates its chosen device count. CPU generation and cache design remain choices for a later scoped study.

## UI and V1 scope

- Add interval hover/tap details: timestamp, sample/bucket duration, demand, baseline latency, limits, and exceedance. Provide keyboard access as well.
- Inspection presets: morning burst, afternoon burst, and nightly batch/backup candidate. State when backup completion evidence is unavailable.
- Connection selector: NVMe/FC 64G; NVMe/TCP 100 GbE; NVMe/TCP 25 GbE; iSCSI 25 GbE; FC 32G. V1 design previews are descriptive only and must not change engine findings without a scoped connection model.
- Potential line: supplied sustainable array ceiling, distinct from 80% budget. Add provenance and future limiter details. Never force the line to sit above actual demand; crossing it is useful evidence. Unknown ceilings show unknown, not a reassuring invented line.
- V2 configuration previews can live in Environment details without recomputing V1 assessments. Changing the selected concept should update its description/default transport only; show that it is unmodeled.
- Preserve the current engine and trace work. First ship the credible V1; use this study and UI addendum as the V2 research backlog.

## Later validation

Calibrate against appropriately licensed official device data and complete system benchmark reports with workload conditions. Verify per-direction network accounting, nonuniform IO sizes, protected mixed-write overhead, CPU/fabric binding limits, burst cache depletion, sustained destage, failover and backup completion. Test that changing only a nonbinding component cannot create performance gain. Explicitly record whether findings are sourced, derived, synthetic or unverified.
