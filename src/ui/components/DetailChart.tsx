import { useMemo, useState } from 'react';
import type { DerivedMinute, TraceRecord } from '../../engine/index.js';
import type { TraceAssessment } from '../../engine/index.js';
import { chooseRateUnit, DAY_NAMES, formatCount, formatRate, presetWindows } from '../viewModel.js';
import { BASELINE_SCHEDULE } from '../viewModel.js';

type Y1 = 'frontendIops' | 'frontendBandwidth' | 'backendOps';

const W = 960;
const H = 270;
const LEFT = 60;
const RIGHT = 890;
const TOP = 34;
const BOTTOM = 210;

interface Props {
  assessment: TraceAssessment;
  day: TraceRecord[];
  derivedDay: DerivedMinute[];
  budgets: { frontendIops: number; backendOps: number | null; throughputBytesPerSecond: number };
  ceilings: { frontendIops: number | null; throughputBytesPerSecond: number | null; backendOps: number | null };
}

const hhmm = (minuteOfDay: number) =>
  `${String(Math.floor(minuteOfDay / 60)).padStart(2, '0')}:${String(minuteOfDay % 60).padStart(2, '0')}`;

export function DetailChart({ assessment, day, derivedDay, budgets, ceilings }: Props) {
  const [y1, setY1] = useState<Y1>('frontendIops');
  const [window, setWindowRange] = useState<[number, number]>([0, 1440]);
  const [inspect, setInspect] = useState(0); // offset within window
  const dayIndex = assessment.defaultDay.dayIndex;
  const presets = presetWindows(BASELINE_SCHEDULE, dayIndex);

  const slice = useMemo(
    () => ({
      records: day.slice(window[0], window[1]),
      derived: derivedDay.slice(window[0], window[1]),
    }),
    [day, derivedDay, window],
  );

  const demandOf = (d: DerivedMinute, r: TraceRecord): number | null => {
    if (r.missing) return null;
    if (y1 === 'frontendIops') return d.frontendIops;
    if (y1 === 'backendOps') return d.backend?.kind === 'computed' ? d.backend.combinedTotal : null;
    return d.throughputBytesPerSecond;
  };

  const budget =
    y1 === 'frontendIops' ? budgets.frontendIops : y1 === 'backendOps' ? budgets.backendOps : budgets.throughputBytesPerSecond;
  const ceiling =
    y1 === 'frontendIops' ? ceilings.frontendIops : y1 === 'backendOps' ? ceilings.backendOps : ceilings.throughputBytesPerSecond;

  const isRate = y1 === 'frontendBandwidth';
  const unit = useMemo(
    () =>
      isRate
        ? chooseRateUnit([
            ...slice.derived.map((d) => d.throughputBytesPerSecond),
            budget,
            ceiling,
          ])
        : null,
    [isRate, slice, budget, ceiling],
  );
  const fmt = (v: number | null) => (isRate ? formatRate(v, unit!) : formatCount(v));

  const demands = slice.derived.map((d, i) => demandOf(d, slice.records[i]));
  const latencies = slice.records.map((r) => (r.missing ? null : r.baselineLatencyMs));
  const maxLat = Math.max(...latencies.filter((v): v is number => v !== null), 0.1);

  const maxVal = Math.max(
    ...demands.filter((v): v is number => v !== null),
    budget ?? 0,
    ceiling ?? 0,
    1,
  );
  const top = maxVal * 1.08;
  const n = demands.length;
  const x = (i: number) => LEFT + (i / Math.max(1, n - 1)) * (RIGHT - LEFT);
  const y = (v: number) => BOTTOM - (v / top) * (BOTTOM - TOP);
  const y2 = (v: number) => BOTTOM - (v / (maxLat * 1.15)) * (BOTTOM - TOP);

  const pathFor = (values: (number | null)[], yf: (v: number) => number) => {
    let d = '';
    let pen = false;
    values.forEach((v, i) => {
      if (v === null) pen = false;
      else {
        d += `${pen ? 'L' : 'M'}${x(i).toFixed(2)},${yf(v).toFixed(2)}`;
        pen = true;
      }
    });
    return d;
  };

  const i = Math.min(inspect, n - 1);
  const rec = slice.records[i];
  const der = slice.derived[i];
  const demand = demandOf(der, rec);
  const minuteOfDay = window[0] + i;
  const over = demand !== null && budget !== null && demand > budget;
  const unknownReason =
    y1 === 'backendOps' && der.backend?.kind === 'unknown' ? der.backend.reason : null;

  const onPointer = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const frac = (e.clientX - rect.left) / rect.width;
    const idx = Math.round(((frac * W - LEFT) / (RIGHT - LEFT)) * (n - 1));
    setInspect(Math.max(0, Math.min(n - 1, idx)));
  };

  const y1Name =
    y1 === 'frontendIops'
      ? 'front-end IOPS'
      : y1 === 'frontendBandwidth'
        ? `front-end bandwidth (${unit?.unit ?? 'MB/s'})`
        : 'backend ops/s';

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>
          Detail day — {DAY_NAMES[dayIndex]} (day {dayIndex})
        </h2>
        <div className="metric-controls">
          <select aria-label="Y1 metric" value={y1} onChange={(e) => setY1(e.target.value as Y1)}>
            <option value="frontendIops">front-end IOPS</option>
            <option value="frontendBandwidth">front-end bandwidth</option>
            <option value="backendOps">Backend view (ops/s)</option>
          </select>
        </div>
      </div>
      <p className="small">Default day selection: {assessment.defaultDay.reason}</p>
      <div className="preset-buttons">
        {presets.map((p) => (
          <button
            key={p.id}
            disabled={!p.available}
            title={p.explanation ?? p.note}
            onClick={() => {
              if (p.window) {
                setWindowRange(p.window);
                setInspect(0);
              }
            }}
          >
            {p.label}
          </button>
        ))}
      </div>
      {presets.map(
        (p) =>
          (!p.available || p.note) && (
            <p key={p.id} className="small preset-note">
              {p.explanation ?? ''} {p.note ?? ''}
            </p>
          ),
      )}
      <svg
        role="img"
        aria-label={`Detail chart for ${DAY_NAMES[dayIndex]}: ${y1Name} on the left axis, baseline latency ms on the right axis. Independent scales.`}
        viewBox={`0 0 ${W} ${H}`}
        className="chart"
        onPointerMove={onPointer}
        onClick={onPointer}
      >
        {[0, 0.25, 0.5, 0.75, 1].map((f) => (
          <g key={f}>
            <line x1={LEFT} x2={RIGHT} y1={y(top * f)} y2={y(top * f)} className="grid" />
            <text x={LEFT - 8} y={y(top * f) + 4} textAnchor="end">
              {isRate ? ((top * f) / (unit?.divisor ?? 1)).toFixed(1) : `${Math.round((top * f) / 1000)}k`}
            </text>
            <text x={RIGHT + 8} y={y2(maxLat * 1.15 * f) + 4}>
              {(maxLat * 1.15 * f).toFixed(1)}
            </text>
          </g>
        ))}
        {budget !== null && (
          <line x1={LEFT} x2={RIGHT} y1={y(budget)} y2={y(budget)} className="budget-line" />
        )}
        {ceiling !== null && (
          <line x1={LEFT} x2={RIGHT} y1={y(ceiling)} y2={y(ceiling)} className="ceiling-line" />
        )}
        <path d={pathFor(demands, y)} className="line-mean" />
        <path d={pathFor(latencies, y2)} className="line-latency" />
        <line x1={x(i)} x2={x(i)} y1={TOP} y2={BOTTOM} className="guide" />
        <text x={LEFT} y={18}>{y1Name}</text>
        <text x={RIGHT} y={18} textAnchor="end">Latency (ms)</text>
        <text x={LEFT} y={228}>{hhmm(window[0])} UTC</text>
        <text x={RIGHT} y={228} textAnchor="end">{hhmm(Math.min(1439, window[1] - 1))} UTC</text>
        <text x={(LEFT + RIGHT) / 2} y={248} textAnchor="middle">Time (UTC)</text>
      </svg>
      <div className="legend">
        <span>combined demand</span>
        <span>baseline latency (Y2)</span>
        <span>operating budget</span>
        <span>declared {y1 === 'backendOps' ? 'backend' : 'front-end'} ceiling</span>
      </div>
      <input
        type="range"
        aria-label="Inspect minute"
        min={0}
        max={Math.max(0, n - 1)}
        value={i}
        onChange={(e) => setInspect(Number(e.target.value))}
      />
      <div className="readout" role="status">
        {hhmm(minuteOfDay)} UTC · 60 s ·{' '}
        {rec.missing
          ? 'missing interval'
          : `${fmt(demand)}${over ? ' — above budget' : budget !== null ? ' — within budget' : ''}`}
        {!rec.missing &&
          ` · existing ${formatCount(
            (rec.existing?.readIops ?? 0) + (rec.existing?.writeIops ?? 0),
          )} + proposed ${formatCount(
            (rec.proposed?.readIops ?? 0) + (rec.proposed?.writeIops ?? 0),
          )} IOPS`}
        {rec.baselineLatencyMs !== null &&
          ` · baseline latency ${rec.baselineLatencyMs} ms (baseline minute value; not a post-addition prediction)`}
        {budget !== null && ` · budget ${fmt(budget)}`}
        {ceiling !== null && ` · ceiling ${fmt(ceiling)}`}
        {unknownReason ? ` · unknown: ${unknownReason}` : ''}
      </div>
      <p className="small">
        Y1: {y1Name} · Y2: baseline latency (ms) · Independent scales; overlap does not establish
        causation.
      </p>
    </section>
  );
}
