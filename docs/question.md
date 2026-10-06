# Question

**Can my current storage infrastructure support this new workload?**

Infrastructure teams must translate a proposed application's demands into capacity, performance, and protection implications. A chart alone does not explain whether there is sufficient headroom, which constraint matters, or what evidence is missing.

## Primary user

An infrastructure/product leader evaluating one proposed workload against an existing environment.

## Decision supported

The tool reports each of six dimensions — capacity, IOPS (front-end and backend), throughput, latency, protection, and growth headroom — as **modeled ready**, **modeled constraint**, or **needs investigation**, plus an overall result that surfaces constraints and unknowns rather than hiding them in a score. It supports a decision about where to look next; it **never authorizes a production deployment**.

## Scenarios

Two curated demonstration scenarios on a vendor-neutral modeled storage environment with an existing aggregate workload:

- **VMware / private cloud** — cluster expansion profile (WL-VM)
- **AI / RAG** — retrieval-augmented generation service, storage demand only (WL-RAG)

Two synthetic infrastructure protection-layout variants — RAID 5 (8+1) and RAID 6 (8+2) with equal declared raw capacity and limits — expose the backend write-overhead difference.

## V1 exclusions

No real arrays, live telemetry, credentials, vendor sizing, production configuration recommendations, procurement recommendations, autonomous changes, or generative AI runtime. No profile editing, replication what-ifs, failure/degraded-state models, or consolidation. Post-addition latency is always *needs investigation* in V1.

*Synthetic data. Educational demonstration; not vendor sizing or production configuration guidance.*
