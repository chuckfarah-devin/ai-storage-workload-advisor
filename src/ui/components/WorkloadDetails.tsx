import type { WorkloadProfile } from '../../engine/index.js';
import { chooseRateUnit, formatRate, phaseRows } from '../viewModel.js';

const kib = (b: number) => `${(b / 1024).toLocaleString('en-US')} KiB`;
const hours = (minutes: number) =>
  `${(minutes / 60).toLocaleString('en-US', { maximumFractionDigits: 1 })} h`;

function bandwidth(range: [number, number]): string {
  const unit = chooseRateUnit([range[0], range[1]]);
  return range[0] === range[1]
    ? formatRate(range[0], unit)
    : `${formatRate(range[0], unit)} → ${formatRate(range[1], unit)}`;
}

/** Expandable description of the proposed workload: declared description,
 *  schedule phases with derived bandwidth, and declared assumptions.
 *  Display only — nothing here feeds the assessment. */
export function WorkloadDetails({ workload }: { workload: WorkloadProfile }) {
  const rows = phaseRows(workload);
  return (
    <details className="env">
      <summary>
        Workload details — {workload.id} · {workload.name}
      </summary>
      <p className="small">{workload.description}</p>
      <table className="evidence-table phase-table">
        <thead>
          <tr>
            <th>Schedule phase</th>
            <th>Days</th>
            <th>Window (UTC)</th>
            <th>Duration</th>
            <th>IOPS</th>
            <th>Blocks R / W · read share</th>
            <th>Derived bandwidth</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={`${r.name}|${r.days}|${r.windowUtc}`}>
              <td>
                {r.name}
                {r.note && <div className="small">{r.note}</div>}
              </td>
              <td>{r.days}</td>
              <td>{r.windowUtc}</td>
              <td>{hours(r.durationMinutes)}</td>
              <td>
                {r.iopsStart === r.iopsEnd
                  ? r.iopsStart.toLocaleString('en-US')
                  : `${r.iopsStart.toLocaleString('en-US')} → ${r.iopsEnd.toLocaleString('en-US')}`}
              </td>
              <td>
                {kib(r.readBlockBytes)} / {kib(r.writeBlockBytes)} ·{' '}
                {(r.readFraction * 100).toFixed(0)}% reads
              </td>
              <td>{bandwidth([r.bandwidthStartBps, r.bandwidthEndBps])}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <ul className="small">
        {(workload.assumptions ?? []).map((a) => (
          <li key={a}>{a}</li>
        ))}
      </ul>
    </details>
  );
}
