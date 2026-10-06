# AI Storage Workload Advisor

Chuck Farah — an enterprise-storage/product leader — directs AI agents through a Specification-Driven Development lifecycle to build this tool. The product question it demonstrates: **"Can my current storage infrastructure support this new workload?"** Given a synthetic infrastructure profile and a proposed workload (VMware/private-cloud expansion or AI/RAG storage demand), the tool assesses readiness across six dimensions — capacity, front-end and backend IOPS, throughput, latency, protection, and growth headroom — and reports each as *modeled ready*, *modeled constraint*, or *needs investigation*, with evidence, calculations, and confidence per finding.

**Synthetic data. Educational demonstration; not vendor sizing or production configuration guidance.**

V1 has **no live arrays, no vendor integration, and no runtime AI**. All data is bundled synthetic JSON; the assessment engine is deterministic TypeScript.

## Lifecycle index (SDD)

| Stage | Document |
|---|---|
| Question | [docs/question.md](docs/question.md) |
| Research | [docs/research.md](docs/research.md) |
| Business Spec | [docs/business-spec.md](docs/business-spec.md) |
| Technical Spec | [docs/technical-spec.md](docs/technical-spec.md) |
| Build | [docs/implementation-plan.md](docs/implementation-plan.md) |
| Tests | [docs/tests.md](docs/tests.md) |
| Verification | [docs/verification.md](docs/verification.md) |
| Findings | [docs/findings.md](docs/findings.md) |

Supporting: [DECISIONS.md](DECISIONS.md) (decision record), [docs/synthetic-profile-proposal.md](docs/synthetic-profile-proposal.md) (profile rationale), [docs/devin-initial-review.md](docs/devin-initial-review.md) (first-review report, requirement IDs), [AGENTS.md](AGENTS.md) (working rules).

## Status

**Milestones M0 and M1 complete (static engine); M2–M4 not started.** M1 implements scalar assessment rules over single aligned demand samples; trace generation, weekly statistics, UI, and browser verification are not yet implemented.

## How to run

```sh
npm install
npm test            # Vitest engine suite (tests/engine)
npm run golden      # regenerate tests/golden/*.json and docs/verification/m1/golden-assessments.md
npm run typecheck   # tsc --noEmit over src, tests, scripts
npm run lint        # oxlint
npm run dev         # Vite dev server (placeholder UI only)
```

## Layout

```
data/profiles/     versioned synthetic JSON profiles (INF-A, INF-B, WL-VM, WL-RAG, existing baseline)
src/engine/        pure TypeScript assessment engine (zero DOM imports)
src/               Vite + React app shell (interface arrives in M3)
tests/engine/      Vitest suites; filenames carry requirement IDs (R-*)
tests/golden/      committed per-sample assessment fixtures
scripts/golden.ts  regenerates golden fixtures and the verification document
docs/handoff/      original handoff files (historical)
docs/verification/ verification artifacts produced by actual runs
```
