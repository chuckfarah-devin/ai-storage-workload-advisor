import type { CheckDelta } from '../../engine/index.js';
import { formatCount } from '../viewModel.js';

export function WhatIfPanel({ deltas, multiplier }: { deltas: CheckDelta[]; multiplier: number }) {
  return (
    <section className="panel">
      <h2>Baseline vs what-if ({multiplier}× proposed demand)</h2>
      {deltas.length === 0 ? (
        <p className="small">No check status or headroom changes vs the 1× baseline.</p>
      ) : (
        <table className="delta-table">
          <thead>
            <tr>
              <th>Check</th>
              <th>Baseline (1×)</th>
              <th>Selected</th>
              <th>Headroom Δ</th>
            </tr>
          </thead>
          <tbody>
            {deltas.map((d) => (
              <tr key={d.checkId}>
                <td>{d.checkId}</td>
                <td>{d.before}</td>
                <td>{d.after}</td>
                <td>{d.headroomDelta === null ? '—' : formatCount(d.headroomDelta)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <p className="small">Capacity grows independently of demand multiplier.</p>
    </section>
  );
}
