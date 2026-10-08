# Three-lesson demo (~7 minutes)

A shorter alternative to the [five-minute walkthrough](walkthrough.md): three lessons this V1 was built to teach, each anchored to real engine output. Run `npm run dev`, open http://localhost:5173/, and keep the mandatory label in frame: *Synthetic data. Educational demonstration; not vendor sizing or production configuration guidance.*

---

## Lesson 1 — Front-end headroom can hide backend pressure (~2 min)

**Show:** the default scenario, INF-B (RAID 6) × WL-VM, no interaction needed.

- The banner reads *Modeled constraint* and names `iops.backend`.
- The IOPS card tells the asymmetry in two rows: **front-end 75.0%** of the 120,000 IOPS operating budget — comfortably ready — while **backend peaks at 206,100 ops/s against a 200,000 budget** (103.1%), a modeled constraint with −6,100 ops/s headroom.
- The reason: RAID 6 write overhead. A front-end IOPS check alone would green-light a workload whose parity writes quietly exhaust the backend.

**Point to:** [desktop-overview.png](verification/m4/screenshots/desktop-overview.png)

## Lesson 2 — Weekly averages can hide recurring bursts (~2.5 min)

**Show:** the weekly chart (backend ops/s view, the default).

- Every bucket *mean* sits below the dashed budget line — a weekly-average report would look clean.
- Drag the inspect slider (or click the chart, or use arrow keys) to bucket 60, **Mon 10:00**: `mean 177,475 / max 206,100 · 5 minutes above budget`. The caption quantifies it: 20 buckets contain above-budget minutes; **0 bucket means exceed**.
- The stats row makes the recurrence concrete: 100 exceedance minutes across 10 runs of 10 minutes — the same hidden burst twice a day, every weekday.

**Point to:** [desktop-weekly-hidden-burst.png](verification/m4/screenshots/desktop-weekly-hidden-burst.png)

## Lesson 3 — Unknown evidence should trigger investigation, not a confident answer (~2.5 min)

**Show:** switch workload to **WL-RAG** (keep either infrastructure).

- The backend line is annotated *computable minutes only · unknown minutes: 900* — trace coverage is 100%, backend *model* coverage is 91.1%. Those are deliberately separate numbers.
- Open the detail chart (Full day), switch Y1 to the backend view, inspect **Monday 02:00**: the readout says *unknown* with the reason — the 65,536-byte ingestion block exceeds the modeled 16,384-byte backend block. It is never plotted as zero and never labeled "within budget."
- The same contract holds in the extreme: if *no* usable demand exists, the check returns needs-investigation with null headroom rather than reporting full headroom on fabricated zeros. Averages, scores, and missing data cannot launder uncertainty into confidence.

**Point to:** [desktop-rag-unknown-ingestion.png](verification/m4/screenshots/desktop-rag-unknown-ingestion.png)

---

## Close (~30 s)

Every claim traces to a committed artifact: rule IDs, evidence tables, golden fixtures, and the SDD chain Question → Research → Specs → Build → Tests → Verification → Findings. V1 deliberately defers post-addition latency (no response curve), whole-system availability, and anything claiming real-array measurement.

**Next chapter:** the [NVMe potential study](handoff/nvme-potential-study.md) — the seed for a V2 that asks what the same infrastructure could deliver under a different media/protocol envelope. V2 modeling is not started; present V1 first.
