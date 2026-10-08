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
| Walkthrough | [docs/walkthrough.md](docs/walkthrough.md) |
| Demo | [docs/demo.md](docs/demo.md) — three-lesson script |

Supporting: [DECISIONS.md](DECISIONS.md) (decision record), [docs/synthetic-profile-proposal.md](docs/synthetic-profile-proposal.md) (profile rationale), [docs/devin-initial-review.md](docs/devin-initial-review.md) (first-review report, requirement IDs), [AGENTS.md](AGENTS.md) (working rules).

## Status

**M0–M4 complete pending Chuck's review.** M1 implements scalar assessment rules over single aligned demand samples; M2 adds the deterministic 10,080-minute weekly trace, aggregation, weekly statistics, default-day selection, and trace assessment (ruleset 1.0.0-m2); M3 adds the React interface (view-model layer, charts, findings, exports) reading engine output only; M4 adds Playwright browser verification — **Chromium only** — across desktop (1280×900) and mobile (375×812) viewport projects, with screenshots under [docs/verification/m4/](docs/verification/m4/screenshots/). See [docs/findings.md](docs/findings.md) for the business answer, [docs/walkthrough.md](docs/walkthrough.md) for a five-minute demo script, and [docs/demo.md](docs/demo.md) for a shorter three-lesson demo.

**Deferred:** V2 — the NVMe potential model sketched in [docs/handoff/nvme-potential-study.md](docs/handoff/nvme-potential-study.md). V1 is presented first; no V2 modeling exists.

## How to run

```sh
npm install
npm run dev       # UI at http://localhost:5173/
npm run build     # production build into dist/
```

## Engine checks

```sh
npm test            # Vitest suite (tests/engine + tests/ui)
npm run golden      # regenerate tests/golden/*.json, tests/golden/m2/, docs/verification outputs
npm run typecheck   # tsc --noEmit over src, tests, scripts
npm run lint        # oxlint
npm run e2e         # Playwright browser checks (Chromium; desktop + mobile viewports); reuses a dev server on :5173
```

## Layout

```
data/profiles/     versioned synthetic JSON profiles (INF-A, INF-B, WL-VM, WL-RAG, existing baseline)
src/engine/        pure TypeScript assessment engine (zero DOM imports)
src/ui/            React view-model (src/ui/viewModel.ts) and components — render engine output only
tests/engine/      Vitest engine suites; filenames carry requirement IDs (R-*)
tests/ui/          Vitest view-model and component smoke tests
tests/golden/      committed per-sample and trace assessment fixtures
scripts/golden.ts  regenerates golden fixtures and the verification document
docs/handoff/      original handoff files (historical)
docs/verification/ verification artifacts produced by actual runs
```
