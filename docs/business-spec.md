# AI Storage Workload Advisor
## Business/Product Specification — draft 0.3

Owner: Chuck Farah  
Status: Audience, scenarios, and profile interaction selected by Chuck. Modeling resolutions from the first review (DECISIONS.md, October 6, 2026) applied as edits E-1, E-2, E-8; see docs/devin-initial-review.md §3.  
Version history: 0.2 reviewed baseline (October 6, 2026); 0.3 first-review edits applied (October 6, 2026).  
Portfolio purpose: Show an experienced enterprise-storage/product leader managing AI agents to turn specifications into working software through Specification-Driven Development (SDD).

### Question and business problem

**Can my current storage infrastructure support this new workload?**

Infrastructure teams must translate a proposed application's demands into capacity, performance, and protection implications. A chart alone does not explain whether there is sufficient headroom, which constraint matters, or what evidence is missing. V1 demonstrates a transparent assessment using realistic synthetic infrastructure and workload profiles.

### Intended user and decision

Primary user: an infrastructure/product leader evaluating one proposed workload against an existing environment. The tool helps decide whether the modeled environment appears ready, needs investigation, or has a modeled constraint. It does not authorize a production deployment.

### Small V1 scope

- One vendor-neutral modeled storage environment, with its existing aggregate workload and one proposed additional workload.
- Two curated demonstration scenarios: VMware/private cloud and AI/RAG. Other scenario types remain backlog items.
- Selectable fixed synthetic profiles; every screen and exported assessment identifies the data as synthetic. A profile-editing interface is deferred.
- Readiness across capacity, IOPS, throughput, latency, protection, and growth headroom, including an explicit unknown state when evidence is insufficient.
- A single assessment view with findings, supporting inputs/calculations, likely bottlenecks, investigation recommendations, confidence, and a baseline-versus-what-if comparison.
- Two initial what-if controls: proposed workload demand growth and capacity growth over a selected planning horizon. Replication changes, failure scenarios, and consolidation are deferred until the core assessment is credible.

### Inputs and modeling boundaries

Normalize infrastructure capacity, used capacity, capacity growth, existing performance demand, modeled sustainable IOPS/throughput limits, observed baseline latency, and protection capabilities. Normalize proposed workload capacity, IOPS, read/write ratio, block size, throughput (derived from IOPS and block sizes in V1, not an independent input), latency target, growth, availability/protection needs, and replication requirements. Each value carries a unit, synthetic provenance, and relevant assumptions.

Performance limits must be supplied by the synthetic profile; raw capacity or drive count alone cannot establish performance capability. Throughput derived from IOPS and block size is a consistency check, with mixed read/write sizes represented explicitly if needed. Avoid counting existing demand twice when utilization is also supplied.

Latency is a separate evidence problem: additive IOPS headroom does not prove a latency target will be met. Without a documented synthetic response model, report latency readiness as needing investigation. Protection requirements use capability matching; replication overhead requires explicit assumptions rather than a universal multiplier. Aggregate checks cannot establish that host paths, pools, or individual volumes have no bottlenecks.

### Assessment contract

### Two observation intervals

Use a coherent seven-day synthetic timeline at 60-second resolution internally. Expose a selected representative 24-hour window at 60-second intervals for detailed troubleshooting, and the complete seven-day view at 600-second intervals for readiness recommendations. The detailed view contains 1,440 interval records; the weekly view contains 1,008. Each record holds multiple metrics as columns rather than one row per metric. Both views describe the same simulated environment, not unrelated datasets.

The detailed window defaults to the day selected by the technical rule: the earliest day containing the longest continuous exceedance of an operating budget; if nothing exceeds, the earliest day with the highest budget-utilization ratio. Users can select another day. Identify challenging periods and explain their duration, coincident demand, and affected dimensions. The week includes declared synthetic quiet, business, batch, and burst periods; it illustrates patterns rather than establishing that a real environment's week is representative.

Recommendation evidence includes time-weighted mean, P90, P95, interval maximum, time above the 80% operating budget, and longest continuous exceedance. A mean or P90 alone cannot support a ready verdict: either can conceal short or recurring constraints. Show longer-term summary statistics together with challenging periods. Capacity/protection remain separate from averaged performance; latency retains the unknown post-addition treatment.

V1 also explains modeled backend IOPS under explicitly declared RAID 5 or RAID 6 small random read-modify-write assumptions. Front-end and backend demand are separate checks within the IOPS dimension. This is an educational backend-load estimate, not a full physical-array simulation. Fixed synthetic profiles declare protection layout, cache assumptions, operation size, and backend budget; a comparison exposes the write-overhead difference. Modern erasure-coded systems may coalesce writes or use other layouts, so RAID level alone cannot determine their load.

Each dimension returns **modeled ready**, **modeled constraint**, or **needs investigation**, plus headroom where calculable. An overall result must surface constraints and unknowns; it must not hide them inside a weighted score.

Each finding contains: the condition, evidence, calculation or rule, implication, next investigation, confidence rationale, and assumptions. Confidence describes strength of the model's evidence, not a statistical probability or a guarantee. What-if results identify which inputs changed and show the resulting dimensional differences.

Example: “Modeled throughput demand exceeds the profile's sustainable limit after adding the workload. Investigate the host connectivity and front-end bandwidth assumptions. Confidence is high for this arithmetic comparison; actual array behavior has not been validated.”

### Explicit exclusions and future direction

V1 requires no real array, live telemetry, credentials, vendor sizing, production configuration recommendations, procurement recommendations, autonomous changes, or generative AI runtime. AI agents assist product development; explainable assessment logic can be deterministic.

The technical specification will define a normalized internal model and future source-adapter interfaces. Dell PowerMax REST and NetApp ONTAP REST are candidate future sources only. V1 will not claim implemented, tested, certified, or supported integration with either. Vendor mappings require later source research and verification.

Backlog: profile editing, transactional database, AI training/checkpointing, backup/recovery, mixed-workload scenario packs, replication what-ifs, failure/degraded-state models, consolidation, and real-source adapters. A mixed existing baseline is allowed in V1 without implementing a general consolidation planner.

### Demonstration and success criteria

- A visitor can select a scenario, inspect the assumptions, add the proposed workload, and understand the assessment in a five-minute walkthrough.
- Curated examples show dimension-level readiness, a clear capacity or performance constraint, and a case requiring investigation. Unknown post-addition latency prevents an unconditional overall ready result in V1: the overall result is never an unconditional *modeled ready*; the strongest V1 outcome is *needs investigation* with all arithmetic dimensions ready.
- Every finding traces to inputs and a documented rule; changing a relevant input changes the assessment predictably.
- Missing or inconsistent evidence is visible and cannot produce an unconditional ready result.
- All demonstrations and exports state: “Synthetic data. Educational demonstration; not vendor sizing or production configuration guidance.”
- The public repository tells a clear product story and credits Chuck's enterprise-storage judgment and leadership of AI-assisted development.

### Visible SDD lifecycle and gates

**Question → Research → Business Spec → Technical Spec → Build → Tests → Verification → Findings**

Keep the question, research sources and uncertainties, versioned specifications, implementation plan, meaningful tests, scenario verification, and resulting findings visible in repository documentation. Research must distinguish vendor-documented facts from demonstration assumptions.

Gate 1: Chuck agrees on user, scenarios, assessment meaning, and V1 exclusions.  
Gate 2: Write the technical specification covering normalized data, rules, adapter contracts, UI, validation, and test strategy. Resolve modeling uncertainties before build.  
Gate 3: Write a bounded implementation plan with a demonstrable milestone and completion criteria.  
Gate 4: Implement, test, verify curated scenarios, and publish findings and limitations.

### Decisions recorded

Chuck selected infrastructure/product leaders, VMware/private cloud and AI/RAG, and fixed synthetic profiles for V1. Profile editing is valuable later. RAG means retrieval-augmented generation: retrieving relevant content to inform an AI answer. This scenario models explicit storage demand, not end-to-end AI application performance.

Chuck reviewed the documents and approved the 80% operating budget on October 6, 2026. Capacity, front-end IOPS, throughput, and backend IOPS assessments use 80% of the applicable supplied limit, reserving 20% headroom. This is the demonstration's operating policy, not a vendor sizing threshold. Latency and protection retain their separate evidence-based rules.
