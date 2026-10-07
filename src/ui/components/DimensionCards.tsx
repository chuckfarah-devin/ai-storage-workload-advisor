import type { CheckResult, DimensionResult } from '../../engine/index.js';
import { formatCount } from '../viewModel.js';

function statusWord(c: CheckResult): string {
  if (c.status === 'modeled-constraint') return 'Modeled constraint';
  if (c.status === 'needs-investigation') return 'Needs investigation';
  return 'Within operating budget';
}

function pct(v: number | null): string {
  return v === null ? 'unknown' : `${(v * 100).toFixed(1)}%`;
}

function CheckRow({ c }: { c: CheckResult }) {
  const ratio = c.budgetUtilization;
  return (
    <div className="check-row">
      <div className="check-head">
        <span className="check-id">{c.id}</span>
        <span className={c.status === 'modeled-ready' ? 'ready' : 'status-warn'}>{statusWord(c)}</span>
      </div>
      <div className="value">
        {c.budgetUtilization === null ? 'unknown' : pct(c.budgetUtilization)}
        <span className="small"> of operating budget</span>
      </div>
      <div className="small">
        headroom {c.headroom === null ? 'unknown' : `${formatCount(c.headroom.value)} ${c.headroom.unit}`}
        {' · '}
        {c.limitUtilization === null
          ? 'declared-limit utilization unknown'
          : `${pct(c.limitUtilization)} of declared limit`}
      </div>
      {ratio !== null && (
        <div className="bar" aria-hidden="true">
          <span style={{ width: `${Math.min(100, ratio * 100)}%` }} />
        </div>
      )}
    </div>
  );
}

export function DimensionCards({ dimensions }: { dimensions: DimensionResult[] }) {
  return (
    <div className="grid" aria-label="Readiness dimensions">
      {dimensions.map((d) => (
        <div className="card" key={d.dimension}>
          <h3>{d.dimension === 'growth' ? 'growth headroom' : d.dimension}</h3>
          {d.checks.map((c) => (
            <CheckRow key={c.id} c={c} />
          ))}
        </div>
      ))}
    </div>
  );
}
