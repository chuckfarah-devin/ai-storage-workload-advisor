# UI design handoff — M3 proposal

Prepared October 7, 2026 for Chuck Farah and Devin. This package communicates the reviewed UI direction; it does not execute or authorize work in another chat.

## Authority and files

The repository's current specifications, accepted profiles, M2 engine, and executed verification artifacts are the source of truth for behavior and numbers. The mockup is a visual/interaction reference only. Its script is disposable illustration, not application logic, and its old capacity/P95 figures must not be copied into the product.

- ui-reference.html: inline mockup fragment with locally scoped styling and illustrative interactions. Inspect its source as a design reference; it is not a standalone deployed page or the React application. It includes host-provided preview helpers that should not enter the product.
- ui-requirements.md: implementable scope and acceptance criteria.
- chart-design-addendum.md: units, dual-axis semantics, and metric behavior.
- nvme-potential-study.md: researched V2 direction and deferred modeling.
- FIRST-M3-ASSIGNMENT.md: suggested paste-ready assignment for Chuck to use when ready.

Do not implement the demonstration arithmetic from the mockup. Use assessTrace, traceBuckets, the day extractor, and normalized engine values; keep numerical assessment out of React components. Adding metric selectors or unit formatting must not change the underlying result.

## Numerical updates to the visual reference

- Accepted capacities: RAID 5 usable 265 TiB; RAID 6 usable 212 TiB; initial used 120 TiB. Weekly maximum used: approximately 120.3218 TiB.
- Operating budgets: capacity 212 / 169.6 TiB; front-end 120,000 IOPS; backend 200,000 ops/s; throughput 2,400 MiB/s.
- RAID 6 + VMware at 1× / one year: backend mean/P90/P95 from actual M2 output; P90 148,850, P95 164,360, maximum 206,100 ops/s. Front-end maximum 90,000 IOPS.
- Ten runs × ten minutes = 100 exceedance minutes. Twenty ten-minute buckets contain above-budget maxima, but no bucket mean exceeds budget.
- Hidden-burst bucket: mean 177,475, maximum 206,100, five minutes above budget.
- Baseline latency: P90 0.9, P95 1.2, maximum 1.4 ms. Do not forecast post-addition latency.
- RAG backend estimates exclude 900 ingestion minutes. Its percentiles/maxima are over computable minutes only; display that qualification and coverage explicitly. Physical trace coverage can be 100% while model coverage is incomplete.

These are M2 artifact observations, not independently rerun tests in this originating chat. Read the current repository output rather than hardcoding these values.
