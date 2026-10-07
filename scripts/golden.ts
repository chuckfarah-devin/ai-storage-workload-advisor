// Regenerates tests/golden/*.json and docs/verification/m1/golden-assessments.md.
// Run: npm run golden
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assessSample, MANDATORY_LABEL, RULESET_VERSION } from '../src/engine/index.js';
import { renderAssessmentText, renderTraceAssessmentText } from '../src/engine/render/text.js';
import { assessTrace, traceBuckets } from '../src/engine/trace/assessTrace.js';
import { COMBINATIONS, samplesFor } from '../tests/fixtures/samples.js';
import { traceFor } from '../tests/fixtures/trace.js';

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

// ---- M2 weekly trace goldens ----
const m2Dir = join(goldenDir, 'm2');
const m2OutDir = join(root, 'docs', 'verification', 'm2');
mkdirSync(m2Dir, { recursive: true });
mkdirSync(m2OutDir, { recursive: true });

const fmt = (v: number | null, d = 2) => (v === null ? 'n/a' : v.toFixed(d));
const m2md: string[] = [
  '# M2 weekly trace summaries',
  '',
  `Generated: ${new Date().toISOString()}`,
  `Ruleset: ${RULESET_VERSION.replace('-m1', '-m2')}   Label: ${MANDATORY_LABEL}`,
  '',
  'Each section summarizes `assessTrace` (multiplier 1, horizon 1) over the deterministic',
  '10,080-minute trace starting 2026-10-05T00:00:00Z. Synthetic data; educational only.',
];

for (const { infra, workload } of COMBINATIONS) {
  const trace = traceFor(infra, workload);
  const a = assessTrace(infra, workload, trace, OPTS);
  const buckets = traceBuckets(trace, infra, OPTS);

  // Compact what-if block (weekly summaries + statuses only) for the
  // combination whose burst scales past both budgets: INF-B × WL-VM.
  const whatIfs: Record<string, { weekly: unknown; overall: string; dimensions: { dimension: string; status: string }[] }> = {};
  if (infra.id === 'INF-B' && workload.id === 'WL-VM') {
    for (const m of [1.5, 2] as const) {
      const aw = assessTrace(infra, workload, trace, { demandMultiplier: m, horizonYears: 1 });
      whatIfs[`${m}x`] = {
        weekly: aw.weekly,
        overall: aw.overall,
        dimensions: aw.dimensions.map((d) => ({ dimension: d.dimension, status: d.status })),
      };
    }
  }

  // Golden JSON: assessment without trace records, plus the 4 buckets covering
  // Monday 10:00–10:39 (indexes 600–639).
  const golden = {
    assessment: a,
    ...(Object.keys(whatIfs).length > 0 ? { whatIfs } : {}),
    bucketsMonday1000: buckets.slice(60, 64),
  };
  writeFileSync(
    join(m2Dir, `${infra.id}-${workload.id}.json`),
    JSON.stringify(golden, null, 2) + '\n',
  );

  const w = a.weekly;
  const row = (name: string, r: { summary: { mean: number | null; p90: number | null; p95: number | null; max: number | null }; budget: number | null; exceedance: { minutes: number; fractionOfValidMinutes: number; longestRunMinutes: number; runCount: number } }, extra = '') =>
    `| ${name} | ${fmt(r.summary.mean)} | ${fmt(r.summary.p90)} | ${fmt(r.summary.p95)} | ${fmt(r.summary.max)} | ${fmt(r.budget)} | ${r.exceedance.minutes} | ${r.exceedance.longestRunMinutes} | ${r.exceedance.runCount} | ${extra} |`;
  m2md.push(
    '',
    `## ${infra.id} × ${workload.id}`,
    '',
    `Coverage: ${w.coverage.valid}/${w.coverage.total} (${(w.coverage.fraction * 100).toFixed(2)}%)`,
    '',
    '| resource | mean | P90 | P95 | max | budget | exceedance min | longest run | recurrences | notes |',
    '|---|---|---|---|---|---|---|---|---|---|',
    row('front-end IOPS', w.frontendIops),
    row('backend ops/s', w.backendOps, `unknown minutes: ${w.backendOps.unknownMinutes}`),
    row('throughput B/s', w.throughput),
    '',
    `Latency (derived): P90 ${fmt(w.latencyMs.p90, 2)} ms, P95 ${fmt(w.latencyMs.p95, 2)} ms, max ${fmt(w.latencyMs.max, 2)} ms.`,
    `Max used capacity: ${fmt(w.maxUsedCapacityBytes! / 2 ** 40, 4)} TiB.`,
    `Default detail day: day ${a.defaultDay.dayIndex} — ${a.defaultDay.reason}`,
    `Overall: ${a.overall}; dimensions: ${a.dimensions.map((d) => `${d.dimension}=${d.status}`).join(', ')}.`,
    '',
    'Hidden-burst check — Monday 10-minute buckets (mean never exceeds the backend budget',
    'even where per-minute maxima do):',
    '',
    '| bucket start | backend mean | backend max | minutes > budget |',
    '|---|---|---|---|',
    ...buckets
      .filter((b) => b.minutesAboveBudget.backendOps > 0 || (b.startIndex >= 600 && b.startIndex < 660))
      .slice(0, 30)
      .map(
        (b) =>
          `| ${b.timestampUtc} | ${fmt(b.mean.backendOps)} | ${fmt(b.max.backendOps)} | ${b.minutesAboveBudget.backendOps} |`,
      ),
    '',
    '```',
    renderTraceAssessmentText(a),
    '```',
    '',
  );

  for (const [m, wi] of Object.entries(whatIfs)) {
    const ww = wi.weekly as typeof w;
    m2md.push(
      `### What-if: demand ${m.replace('x', '×')}, horizon 1`,
      '',
      '| resource | mean | P90 | P95 | max | budget | exceedance min | longest run | recurrences |',
      '|---|---|---|---|---|---|---|---|---|',
      row('front-end IOPS', ww.frontendIops),
      row('backend ops/s', ww.backendOps),
      row('throughput B/s', ww.throughput),
      '',
      `Overall: ${wi.overall}; dimensions: ${wi.dimensions.map((d) => `${d.dimension}=${d.status}`).join(', ')}.`,
      `Coverage: ${ww.coverage.valid}/${ww.coverage.total}; backend unknown minutes: ${ww.backendOps.unknownMinutes}.`,
      '',
    );
  }
  m2md.push('');
}

writeFileSync(join(m2OutDir, 'weekly-summaries.md'), m2md.join('\n'));
console.log('M2 goldens written to tests/golden/m2/ and docs/verification/m2/weekly-summaries.md');
