import type { CheckResult, DimensionResult, Finding } from '../../engine/index.js';
import { formatCount } from '../viewModel.js';

const RANK: Record<string, number> = {
  'modeled-constraint': 0,
  'needs-investigation': 1,
  'modeled-ready': 2,
};

function FindingBlock({ f }: { f: Finding }) {
  return (
    <div className="finding">
      <h3>
        {f.ruleId} — {f.condition}
      </h3>
      <table className="evidence-table">
        <thead>
          <tr>
            <th>Evidence</th>
            <th>Value</th>
            <th>Unit</th>
            <th>Basis</th>
            <th>Missing reason</th>
          </tr>
        </thead>
        <tbody>
          {f.evidence.map((e, i) => (
            <tr key={i}>
              <td>{e.label}</td>
              <td>{e.value === null ? 'unknown' : typeof e.value === 'number' ? formatCount(e.value) : String(e.value)}</td>
              <td>{e.unit}</td>
              <td>{e.basis}</td>
              <td>{e.missingReason ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p><strong>Calculation:</strong> {f.calculation}</p>
      <p><strong>Implication:</strong> {f.implication}</p>
      <p>
        <strong>Confidence:</strong> {f.confidence} — {f.confidenceRationale}
      </p>
      {f.assumptions.length > 0 && (
        <p><strong>Assumptions:</strong> {f.assumptions.join('; ')}</p>
      )}
      <p><strong>Next investigation:</strong> {f.nextInvestigation}</p>
    </div>
  );
}

export function Findings({ dimensions }: { dimensions: DimensionResult[] }) {
  const entries: { dimension: string; check: CheckResult; finding: Finding }[] = [];
  for (const d of dimensions) {
    for (const c of d.checks) {
      for (const f of c.findings) entries.push({ dimension: d.dimension, check: c, finding: f });
    }
  }
  entries.sort(
    (a, b) => RANK[a.check.status] - RANK[b.check.status] || a.check.id.localeCompare(b.check.id),
  );
  return (
    <section className="panel">
      <h2>Findings &amp; next investigations</h2>
      {entries.map((e, i) => (
        <div key={i}>
          <p className="small">
            {e.dimension} · {e.check.id} · {e.check.status}
          </p>
          <FindingBlock f={e.finding} />
        </div>
      ))}
    </section>
  );
}
