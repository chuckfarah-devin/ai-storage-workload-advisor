import type { CheckResult, DimensionResult, TraceAssessment } from '../../engine/index.js';
import { formatHeadroom, latencyCard, protectionCard } from '../viewModel.js';

function statusWord(c: CheckResult): string {
  if (c.status === 'modeled-constraint') return 'Modeled constraint';
  if (c.status === 'needs-investigation') return 'Needs investigation';
  return 'Within operating budget';
}

function pct(v: number | null): string {
  return v === null ? 'unknown' : `${(v * 100).toFixed(1)}%`;
}

const CARD_TITLES: Record<string, string> = {
  iops: 'IOPS',
  growth: 'growth headroom',
};

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
        headroom {c.headroom === null ? 'unknown' : formatHeadroom(c.headroom.value, c.headroom.unit)}
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

function LatencyRow({ c, weekly }: { c: CheckResult; weekly: TraceAssessment['weekly'] }) {
  const card = latencyCard(c, weekly);
  const ms = (v: number | null) => (v === null ? 'unknown' : `${v} ms`);
  return (
    <div className="check-row">
      <div className="check-head">
        <span className="check-id">{c.id}</span>
        <span className={c.status === 'modeled-ready' ? 'ready' : 'status-warn'}>
          {c.status === 'modeled-constraint' ? 'Modeled constraint' : 'Needs investigation'}
        </span>
      </div>
      <div className="small">
        Baseline P95 {ms(card.baselineP95Ms)} · max {ms(card.baselineMaxMs)} · target{' '}
        {ms(card.targetMs)}
      </div>
      <div className="small">Post-addition latency: unknown (no response curve in V1)</div>
    </div>
  );
}

function ProtectionRow({ c }: { c: CheckResult }) {
  const rows = protectionCard(c);
  const chip =
    c.status === 'modeled-constraint'
      ? 'Modeled constraint'
      : c.status === 'needs-investigation'
        ? 'Needs investigation'
        : 'Requirements met (declared)';
  return (
    <div className="check-row">
      <div className="check-head">
        <span className="check-id">{c.id}</span>
        <span className={c.status === 'modeled-ready' ? 'ready' : 'status-warn'}>{chip}</span>
      </div>
      <ul className="small capability-list">
        {rows.map((r) => (
          <li key={r.name}>
            {r.name}: required {r.required} · declared {r.declared}
          </li>
        ))}
      </ul>
      <div className="small">Selected capabilities, not whole-system availability.</div>
    </div>
  );
}

export function DimensionCards({
  dimensions,
  weekly,
}: {
  dimensions: DimensionResult[];
  weekly: TraceAssessment['weekly'];
}) {
  return (
    <div className="grid" aria-label="Readiness dimensions">
      {dimensions.map((d) => (
        <div className="card" key={d.dimension}>
          <h3>{CARD_TITLES[d.dimension] ?? d.dimension}</h3>
          {d.checks.map((c) =>
            d.dimension === 'latency' ? (
              <LatencyRow key={c.id} c={c} weekly={weekly} />
            ) : d.dimension === 'protection' ? (
              <ProtectionRow key={c.id} c={c} />
            ) : (
              <CheckRow key={c.id} c={c} />
            ),
          )}
        </div>
      ))}
    </div>
  );
}
