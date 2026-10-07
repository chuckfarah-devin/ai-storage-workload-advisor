import { useMemo, useState } from 'react';
import type { Bucket, TraceAssessment } from '../../engine/index.js';
import { bucketLabel, formatCount, formatRate, chooseRateUnit } from '../viewModel.js';
import { useChartWidth } from '../useChartWidth.js';

type Metric = 'backendOps' | 'frontendIops' | 'throughputBytesPerSecond';

const H = 250;
const LEFT = 60;
const RIGHT_PAD = 10;
const TOP = 30;
const BOTTOM = 200;

interface Props {
  buckets: Bucket[];
  assessment: TraceAssessment;
  budgets: { frontendIops: number; backendOps: number | null; throughputBytesPerSecond: number };
}



export function WeeklyChart({ buckets, assessment, budgets }: Props) {
  const [metric, setMetric] = useState<Metric>('backendOps');
  const [inspect, setInspect] = useState(0);
  const { ref: chartRef, width: W } = useChartWidth();
  const RIGHT = W - RIGHT_PAD;

  const series = (b: Bucket) =>
    metric === 'backendOps'
      ? { mean: b.mean.backendOps, max: b.max.backendOps, above: b.minutesAboveBudget.backendOps }
      : metric === 'frontendIops'
        ? { mean: b.mean.frontendIops, max: b.max.frontendIops, above: b.minutesAboveBudget.frontendIops }
        : {
            mean: b.mean.throughputBytesPerSecond,
            max: b.max.throughputBytesPerSecond,
            above: b.minutesAboveBudget.throughput,
          };

  const budget =
    metric === 'backendOps'
      ? budgets.backendOps
      : metric === 'frontendIops'
        ? budgets.frontendIops
        : budgets.throughputBytesPerSecond;

  const isRate = metric === 'throughputBytesPerSecond';
  const unit = useMemo(
    () =>
      isRate
        ? chooseRateUnit([
            ...buckets.flatMap((b) => [b.mean.throughputBytesPerSecond, b.max.throughputBytesPerSecond]),
            budget,
          ])
        : null,
    [isRate, buckets, budget],
  );
  const fmt = (v: number | null) => (isRate ? formatRate(v, unit!) : formatCount(v));

  const plotted = buckets.map((b) => series(b));
  const maxVal = Math.max(
    ...plotted.flatMap((p) => [p.max ?? 0, p.mean ?? 0]),
    budget ?? 0,
    1,
  );
  const top = maxVal * 1.08;
  const x = (i: number) => LEFT + (i / (buckets.length - 1)) * (RIGHT - LEFT);
  const y = (v: number) => BOTTOM - (v / top) * (BOTTOM - TOP);

  const pathFor = (key: 'mean' | 'max') => {
    let d = '';
    let pen = false;
    plotted.forEach((p, i) => {
      const v = p[key];
      if (v === null) {
        pen = false;
      } else {
        d += `${pen ? 'L' : 'M'}${x(i).toFixed(2)},${y(v).toFixed(2)}`;
        pen = true;
      }
    });
    return d;
  };

  const aboveBuckets = plotted.filter((p) => p.above > 0).length;
  const meanAbove = plotted.filter((p) => p.mean !== null && budget !== null && p.mean > budget).length;
  const unknownBuckets = plotted.filter((p) => p.mean === null && p.max === null).length;

  const w = assessment.weekly;
  const wk =
    metric === 'backendOps' ? w.backendOps : metric === 'frontendIops' ? w.frontendIops : w.throughput;
  const selected = buckets[Math.min(inspect, buckets.length - 1)];
  const sel = series(selected);

  const onPointer = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const frac = (e.clientX - rect.left) / rect.width;
    const i = Math.round(((frac * W - LEFT) / (RIGHT - LEFT)) * (buckets.length - 1));
    setInspect(Math.max(0, Math.min(buckets.length - 1, i)));
  };

  const metricName =
    metric === 'backendOps' ? 'backend ops/s' : metric === 'frontendIops' ? 'front-end IOPS' : `throughput (${unit?.unit ?? 'MB/s'})`;

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>Weekly trace — 1,008 ten-minute buckets</h2>
        <select aria-label="Weekly chart metric" value={metric} onChange={(e) => setMetric(e.target.value as Metric)}>
          <option value="backendOps">backend ops/s</option>
          <option value="frontendIops">front-end IOPS</option>
          <option value="throughputBytesPerSecond">throughput</option>
        </select>
      </div>
      <div ref={chartRef}>
      <svg
        role="img"
        aria-label={`Weekly ${metricName} by ten-minute bucket. Operating budget ${fmt(budget)}.`}
        viewBox={`0 0 ${W} ${H}`}
        className="chart"
        onPointerMove={onPointer}
        onClick={onPointer}
      >
        {[0, 0.25, 0.5, 0.75, 1].map((f) => {
          const v = top * f;
          return (
            <g key={f}>
              <line x1={LEFT} x2={RIGHT} y1={y(v)} y2={y(v)} className="grid" />
              <text x={LEFT - 8} y={y(v) + 4} textAnchor="end">
                {isRate ? (v / (unit?.divisor ?? 1)).toFixed(1) : `${Math.round(v / 1000)}k`}
              </text>
            </g>
          );
        })}
        {plotted.map((p, i) =>
          p.above > 0 ? (
            <rect key={i} x={x(i) - (RIGHT - LEFT) / (buckets.length - 1) / 2} y={TOP}
              width={(RIGHT - LEFT) / (buckets.length - 1)} height={BOTTOM - TOP} className="exceed-shade" />
          ) : null,
        )}
        {budget !== null && (
          <line x1={LEFT} x2={RIGHT} y1={y(budget)} y2={y(budget)} className="budget-line" />
        )}
        <path d={pathFor('mean')} className="line-mean" />
        <path d={pathFor('max')} className="line-max" />
        <line x1={x(Math.min(inspect, buckets.length - 1))} x2={x(Math.min(inspect, buckets.length - 1))}
          y1={TOP} y2={BOTTOM} className="guide" />
        <text x={LEFT} y={16}>{metricName}</text>
        {['Mon', 'Wed', 'Fri', 'Sun'].map((d, i) => (
          <text key={d} x={LEFT + [0, 288, 576, 1007][i] / (buckets.length - 1) * (RIGHT - LEFT)} y={222}
            textAnchor={i === 0 ? 'start' : i === 3 ? 'end' : 'middle'}>
            {d}
          </text>
        ))}
        <text x={(LEFT + RIGHT) / 2} y={243} textAnchor="middle">Time (UTC)</text>
      </svg>
      </div>
      <div className="legend">
        <span>bucket mean</span>
        <span>minute max</span>
        <span>operating budget</span>
        <span>above-budget minutes</span>
        <span>unknown (not plotted as zero)</span>
      </div>
      <input
        type="range"
        aria-label="Inspect bucket"
        min={0}
        max={buckets.length - 1}
        value={inspect}
        onChange={(e) => setInspect(Number(e.target.value))}
      />
      <div className="readout" role="status">
        {bucketLabel(selected.timestampUtc)} UTC · 10 min ·{' '}
        {sel.mean === null && sel.max === null
          ? `unknown (${selected.unknownMinutes} unknown minutes — not plotted as zero)`
          : `mean ${fmt(sel.mean)} / max ${fmt(sel.max)} ${metric === 'backendOps' ? 'ops/s' : metric === 'frontendIops' ? 'IOPS' : unit!.unit} · ${sel.above} minutes above budget`}
        {metric === 'backendOps' && selected.unknownMinutes > 0 && sel.mean !== null
          ? ` · ${selected.unknownMinutes} unknown`
          : ''}
      </div>
      <div className="stats">
        <span><b>{fmt(wk.summary.mean)}</b>mean</span>
        <span><b>{fmt(wk.summary.p90)}</b>P90</span>
        <span><b>{fmt(wk.summary.p95)}</b>P95</span>
        <span><b>{fmt(wk.summary.max)}</b>max</span>
        <span><b>{wk.exceedance.minutes}</b>exceedance minutes</span>
        <span><b>{wk.exceedance.runCount}</b>runs</span>
      </div>
      <p className="small">
        {aboveBuckets} buckets contain above-budget minutes; {meanAbove} bucket means exceed.
        {metric === 'backendOps' &&
          ` Computable minutes only · unknown minutes: ${w.backendOps.unknownMinutes} · trace coverage ${(w.coverage.fraction * 100).toFixed(1)}% · backend model coverage ${(w.coverage.valid === 0 ? 0 : ((w.coverage.valid - w.backendOps.unknownMinutes) / w.coverage.valid) * 100).toFixed(1)}%`}
        {unknownBuckets > 0 && ` · ${unknownBuckets} buckets unknown (gaps)`}
      </p>
    </section>
  );
}
