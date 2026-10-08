Proceed with M3 only, using the attached UI handoff as the visual and interaction direction.

Read START-HERE.md and ui-requirements.md in this UI package, the chart addendum and V2 study, and the current repository specifications and M2 verification artifacts. The repository engine and accepted profiles override all illustrative mockup numbers. Do not copy the mockup's calculation script into the product.

Implement the React interface over the existing engine: all four infrastructure/workload combinations, six readiness dimensions, separate front-end/backend IOPS checks, explained findings, baseline-versus-what-if results, real weekly and daily charts, metric/units behavior, dual-axis baseline latency, interval hover/tap and keyboard inspection, and inspection presets. Add expandable accepted-environment details and a separately labeled future-design section for connection/configuration previews, without adding transport or V2 performance calculations.

Preserve actual M2 statistics, incomplete-model coverage, unknown latency, and missing-data semantics. In particular, RAG's backend summaries apply only to computable minutes; 100% recorded trace coverage does not mean 100% backend modeling coverage. Backup inspection is the existing nightly batch, not a completed backup-window calculation.

Before finishing, review the zero-coverage case and evidence wording: no fake zero demand, meaningful computed headroom, or high-confidence within-budget conclusion should survive when no usable demand exists. Add or confirm a meaningful test; handle this within the documented unknown-evidence contract rather than expanding scope. Also ensure coverage downgrades do not leave contradictory confidence/implication text in findings.

Run the appropriate existing tests, typecheck/lint/build and basic interface checks. Return the milestone report with executed results, design deviations and unresolved issues. Stop for review before M4. No remote push, deployment, paid service, runtime AI, real adapters, new backup model, or calibrated V2 performance model.
