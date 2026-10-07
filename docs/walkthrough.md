# Five-minute walkthrough

Audience: infrastructure and product leaders. Goal: show how the tool answers *"Can my current storage infrastructure support this new workload?"* with transparent, checkable arithmetic over synthetic data.

Start the app with `npm run dev` and open http://localhost:5173/. All screenshots referenced are in [verification/m4/screenshots/](verification/m4/screenshots/).

1. **Frame the demo (30 s).** Point at the header: synthetic profiles, a deterministic 7-day trace, and the mandatory label — *"Synthetic data. Educational demonstration; not vendor sizing or production configuration guidance."* ([desktop-overview.png](verification/m4/screenshots/desktop-overview.png))
2. **Read the verdict (45 s).** Default scenario INF-B (RAID 6) × WL-VM. The banner answers *Modeled constraint* and names the limiting check — `iops.backend` — plus `latency` under investigation. Notice there is no green score: decision support, not approval.
3. **Scan the dimension cards (30 s).** Capacity 85.1% of budget, front-end IOPS at 75% with headroom, backend at 103.1% — over the operating budget while the front-end still has room. That asymmetry is the story.
4. **Open Environment details (30 s).** Show the declared drive/layout arithmetic and the *Future design previews (V2 · unmodeled)* selects — descriptive only; changing them does not touch the assessment. ([desktop-environment-expanded.png](verification/m4/screenshots/desktop-environment-expanded.png))
5. **Weekly chart — the hidden burst (60 s).** The weekly backend view: bucket means stay under the dashed budget line, but the thinner minute-max line and shading expose five-minute exceedances inside the Monday 10:00 bucket (mean 177,475, max 206,100). Drag the inspect slider or click the chart; keyboard arrows work too. ([desktop-weekly-hidden-burst.png](verification/m4/screenshots/desktop-weekly-hidden-burst.png))
6. **Detail day (45 s).** The Monday detail chart overlays demand on the left axis and *baseline* latency on the right — independent scales; the caption says overlap does not establish causation. The 10:05 readout shows the full split: 75,000 existing + 15,000 proposed = 90,000 IOPS, baseline latency 1.4 ms. Try the day selector — Saturday disables the Morning burst preset with an explanation. ([desktop-detail-morning.png](verification/m4/screenshots/desktop-detail-morning.png))
7. **Switch metrics (20 s).** Flip Y1 to front-end bandwidth: the axis and readout move to GB/s — decimal units on charts, binary units on cards. ([desktop-detail-bandwidth.png](verification/m4/screenshots/desktop-detail-bandwidth.png))
8. **RAG and the honest unknown (45 s).** Switch the workload to WL-RAG on INF-A. The backend row reports *computable minutes only · unknown minutes: 900*; at 02:00 the readout says *unknown* with the reason — proposed 65,536-byte blocks exceed the modeled backend block. Unknown is never plotted as zero or called within budget. ([desktop-rag-unknown-ingestion.png](verification/m4/screenshots/desktop-rag-unknown-ingestion.png))
9. **What-if (30 s).** Set proposed demand to 2×: front-end rises to 87.5% of budget while backend hits 120.2% — the what-if table lists the deltas. Set horizon to 3 years: growth alone becomes a constraint. ([desktop-whatif-2x.png](verification/m4/screenshots/desktop-whatif-2x.png))
10. **Findings and exports (30 s).** Every finding carries its rule ID, evidence table, calculation, implication, confidence, and next investigation. Download the JSON or text report — the same engine output, labels, and ruleset version.
11. **Mobile (15 s).** At 375 px the panels stack, legends wrap, and axis labels stay separate — verified in the browser suite. ([mobile-overview.png](verification/m4/screenshots/mobile-overview.png), [mobile-weekly.png](verification/m4/screenshots/mobile-weekly.png), [mobile-detail.png](verification/m4/screenshots/mobile-detail.png))

## Close — limitations and where this came from

What the model does **not** establish: post-addition latency (always needs investigation — no response model in V1), whole-system availability, and anything about real arrays — all inputs are declared synthetic figures.

This demo is the output of a Specification-Driven Development lifecycle — each stage is a committed document:

Question → [docs/question.md](question.md) · Research → [docs/research.md](research.md) · Business Spec → [docs/business-spec.md](business-spec.md) · Technical Spec → [docs/technical-spec.md](technical-spec.md) · Build → [docs/implementation-plan.md](implementation-plan.md) · Tests → [docs/tests.md](tests.md) · Verification → [docs/verification.md](verification.md) · Findings → [docs/findings.md](findings.md)
