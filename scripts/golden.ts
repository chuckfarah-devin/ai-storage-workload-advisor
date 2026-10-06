// Regenerates tests/golden/*.json and docs/verification/m1/golden-assessments.md.
// Run: npm run golden
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assessSample, MANDATORY_LABEL, RULESET_VERSION } from '../src/engine/index.js';
import { renderAssessmentText } from '../src/engine/render/text.js';
import { COMBINATIONS, samplesFor } from '../tests/fixtures/samples.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const goldenDir = join(root, 'tests', 'golden');
const outDir = join(root, 'docs', 'verification', 'm1');
mkdirSync(goldenDir, { recursive: true });
mkdirSync(outDir, { recursive: true });

const OPTS = { demandMultiplier: 1 as const, horizonYears: 1 as const };

const md: string[] = [
  '# M1 golden per-sample assessments',
  '',
  `Generated: ${new Date().toISOString()}`,
  `Ruleset: ${RULESET_VERSION}   Commit: uncommitted (M1 pre-review)`,
  `Label: ${MANDATORY_LABEL}`,
  '',
  'Each block is `renderAssessmentText` output of `assessSample` for one aligned demand sample.',
];

for (const { infra, workload } of COMBINATIONS) {
  md.push('', `## ${infra.id} × ${workload.id}`, '');
  for (const s of samplesFor(workload)) {
    const a = assessSample(infra, workload, s, OPTS);
    const file = join(goldenDir, `${a.infrastructureId}-${a.workloadId}-${a.sampleId}.json`);
    writeFileSync(file, JSON.stringify(a, null, 2) + '\n');
    md.push(`### ${s.id}`, '', '```', renderAssessmentText(a), '```', '');
  }
  // What-if section for the burst samples: multipliers 1.5×/2×, horizons 0/1/3.
  const bursts = samplesFor(workload).filter((s) => s.id.includes('burst'));
  for (const s of bursts) {
    md.push(`### what-if: ${s.id}`, '');
    for (const m of [1.5, 2] as const) {
      for (const h of [0, 1, 3] as const) {
        const a = assessSample(infra, workload, s, { demandMultiplier: m, horizonYears: h });
        md.push(`#### ${s.id} — demand ${m}×, horizon ${h}y`, '', '```', renderAssessmentText(a), '```', '');
      }
    }
  }
}

writeFileSync(join(outDir, 'golden-assessments.md'), md.join('\n'));
console.log('golden fixtures written to tests/golden/');
console.log('verification document written to docs/verification/m1/golden-assessments.md');
