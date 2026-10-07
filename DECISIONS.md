# Decision record

Recorded from Chuck's review through October 6, 2026.

## Agreed direction

- Product owner: Chuck Farah, experienced enterprise-storage/product leader directing AI agents through SDD.
- Core question: Can my current storage infrastructure support this new workload?
- Audience: infrastructure/product leaders.
- Workloads: VMware/private cloud and AI/RAG (retrieval-augmented generation).
- Vendor-neutral V1, fixed realistic synthetic profiles only. Profile editing later.
- Six dimensions: capacity, IOPS (front-end and backend), throughput, latency, protection, growth headroom.
- Approved operating budget: 80% of supplied usable-capacity and sustainable performance limits. Latency/protection use separate rules.
- Bounded classic RAID 5/6 backend-write model with visible assumptions; not a universal erasure-coding model.
- Shared seven-day minute trace: 10,080 records. Detail view: 24 hours/60 seconds, 1,440 records. Weekly display: seven days/600 seconds, 1,008 buckets.
- Weekly mean/P90/P95/max and exceedance duration; aggregation must not hide constraints.
- Initial what-ifs: preset proposed-demand multipliers and capacity-growth planning horizons. Replication changes, failure simulations, and consolidation deferred.
- Unknown post-addition latency prevents an unconditional overall ready claim.
- No runtime AI requirement or actual vendor integration. Future source-adapter contracts only.
- Visible lifecycle: Question → Research → Business Spec → Technical Spec → Build → Tests → Verification → Findings.

## Open issues for first review

- Recommend the simplest maintainable frontend/test stack; no stack is selected yet.
- Define concrete synthetic limits, demand patterns, capacity, cache assumptions, protection capabilities, and growth values; obtain Chuck's plausibility review.
- Resolve whether existing backend demand is supplied directly or derived, especially when comparing RAID layouts. Never count the same work twice or label incompatible baselines as equivalent.
- Define handling of varied workload block sizes under the one-backend-block write assumption: bounded fixtures or an explicit supported mapping. Do not silently apply factors 4/6 to arbitrary IO sizes.
- Specify headroom units and whether displayed percentages use physical limit or operating budget as denominator; label both clearly if shown.
- Clarify deterministic day selection for runs spanning midnight and missing-data coverage policy.
- Verify source support for the classic RAID arithmetic and distinguish researched facts from educational assumptions.
- Agree on repository location/remote and publication workflow. No remote repository has been created by this chat.

Specs are a reviewed baseline, not permission to invent answers to unresolved modeling questions. Recommend resolutions and identify material decisions for Chuck.

## Resolutions from first review (Chuck, October 6, 2026)

Source: `docs/devin-initial-review.md` §5 and §5.1; profiles in `docs/synthetic-profile-proposal.md`. Specification text is still to be updated in milestone M0 (edits E-1…E-16).

- Backend block-size applicability: report unknown outside the explicitly supported small-write model (read and write sizes ≤ modeled backend block); no automatic scaling.
- Existing backend load: derived from the existing logical trace, separately for each RAID layout; `existingBackendBasis` field prevents re-multiplying a future supplied-telemetry source.
- Backend read/write split (correction): backend reads = logical reads × (1 − hit) + logical writes × 2 (RAID 5) or × 3 (RAID 6); backend writes = logical writes × 2 or × 3. Totals remain factor 4 / 6.
- Read-cache hit fraction: one declared synthetic value per infrastructure profile in V1, identified as a simplification.
- Headroom percentages: operating budget is the primary denominator; physical-limit utilization labeled separately.
- Latency: baseline P95 as a screening indicator (constraint if above target, otherwise needs investigation); maximum shown too. Post-addition latency remains needs investigation.
- Growth headroom: default horizon one year; 0 and 3 years as what-ifs.
- Protection: fixed vocabulary (tolerated drive failures, snapshots, encryption at rest, replication). Both shipped workloads are satisfied by both arrays; mismatches exercised in tests. The vocabulary covers selected capabilities, not complete availability assurance.
- Trace: stylized piecewise schedule with no jitter initially; incomplete coverage prevents a ready result.
- Infrastructure profiles: two synthetic protection-layout variants (RAID 5 8+1, RAID 6 8+2) with equal declared raw capacity and limits — not "identical hardware".
- Proposed profile numbers accepted as teaching assumptions; Chuck retains judgment on cache-hit value, performance envelope, capacity additions and growth rates until M1 fixtures are frozen.
- Stack: React, TypeScript, Vitest, Playwright.
- Repository: the extracted handoff folder becomes the local repository; GitHub remote decided later.
- Milestone scoping: M1 verifies individual aligned demand samples only; weekly statistics, exceedance duration, day selection and the full four-combination assessment belong to M2.

## Environment profile resolutions (Chuck, October 7, 2026)

Source: `docs/environment-profile-proposal.md` §8 (accepted 0.2). Applied in milestone M2.

- ENV-1 accepted: fictional vendor-neutral midrange all-flash array; 7.68 TB (decimal) NVMe drives = 6.985 TiB; 48-slot enclosure declared as an assumption, not a researched physical design; 2 global spares; 5 % metadata/reserve; Variant A RAID 5 = 5 × (8+1), 47 populated drives; Variant B RAID 6 = 4 × (8+2), 42 populated drives. The variants are distinct drive populations, not identical hardware.
- ENV-2 accepted: declared usable 265 TiB (A) / 212 TiB (B), rounded down from 265.43 / 212.34; used 120 TiB at trace start; 80 % budgets 212.0 / 169.6 TiB.
- ENV-3 decided against the recommendation: both variants keep 250,000 backend ops/s as independently declared synthetic limits. Drive count alone does not establish sustainable array performance; scaling by 40/45 would have introduced an unvalidated performance relationship. The draft's "equal limits are physically incoherent" assertion is withdrawn.
- ENV-4 accepted: front-end limits 150,000 IOPS / 3,000 MiB/s for both variants (controller-bound, declared).
- ENV-5 accepted: descriptive `environment` block in each infrastructure profile, with validation of group counts, data/parity/spare totals, slot limits, decimal/binary conversion, reserve arithmetic and declared usable capacity. No environment field participates in a performance rule.
- Expected outputs are recalculated from the new values; historical M1 numbers are not preserved.
