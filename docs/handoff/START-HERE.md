# AI Storage Workload Advisor — Devin handoff

Prepared October 6, 2026 for Chuck Farah. This package contains specifications and handoff instructions, not application code or a configured repository.

## How to use

Extract the ZIP into a dedicated project folder and open that folder in Devin Desktop, or attach its Markdown files to a new Devin chat. Paste FIRST-DEVIN-ASSIGNMENT.md as the initial message. Ensure Devin can read the three documents in docs/. The first task is specification review and planning only.

Use one implementation owner at a time. Chuck owns product/domain decisions; Devin performs milestone work; this originating chat can independently review returned artifacts. There is no automatic communication or orchestration connection between chats. Bring the first review report back here for review if desired.

## Contents

- docs/business-spec.md: audience, scope, decision outputs, and educational boundaries.
- docs/technical-spec.md: model, calculations, intervals, evidence, and verification requirements.
- docs/implementation-plan.md: ordered milestones and completion criteria.
- DECISIONS.md: recorded decisions and open issues.
- FIRST-DEVIN-ASSIGNMENT.md: paste-ready initial assignment.
- AGENTS.md: project agent working rules.

## Milestone handoffs

1. Review specs and propose stack/profiles; return a report and revised implementation plan. No application code.
2. After Chuck authorizes implementation: build the normalized model, deterministic synthetic trace, assessment engine, and meaningful tests. Return calculation evidence before interface work.
3. Build the interface and browser verification after engine acceptance. Keep explanations and evidence central.
4. Finish independent verification, findings, walkthrough, and portfolio presentation.

Each implementation milestone should have a separate reviewable branch/PR when a remote repository is available. Include requirement references, changed behavior, executed checks, results, limitations, and a concise next-step recommendation. Never claim a check passed unless executed.

Suggested repository documentation: docs/question.md, docs/research.md, docs/business-spec.md, docs/technical-spec.md, docs/implementation-plan.md, docs/decisions.md, docs/verification.md, docs/findings.md. Do not create fictitious research or completed verification evidence to fill these paths.
