import { useState } from 'react';
import type { InfrastructureProfile } from '../../engine/index.js';
import { budgetOf } from '../../engine/index.js';
import { TIB } from '../../engine/units.js';

const HOST_OPTIONS = [
  { id: 'fc32', label: 'FC 32G (current accepted)', transport: 'Fibre Channel 32 Gb/s' },
  { id: 'nvmefc64', label: 'NVMe/FC 64G', transport: 'NVMe over Fibre Channel 64G' },
  { id: 'tcp100', label: 'NVMe/TCP 100 GbE', transport: 'NVMe over TCP on 100 GbE' },
  { id: 'tcp25', label: 'NVMe/TCP 25 GbE', transport: 'NVMe over TCP on 25 GbE' },
  { id: 'iscsi25', label: 'iSCSI 25 GbE', transport: 'iSCSI on 25 GbE' },
];

// Descriptive text only, from docs/nvme-potential-study.md §Proposed V2
// configurations — no performance arithmetic is attached to these tiers.
const CONFIG_OPTIONS = [
  {
    id: 'v1',
    label: 'V1 accepted reference',
    text: 'The accepted synthetic profile on this page: declared sustained limits with the described drive population and host connectivity.',
  },
  {
    id: 'entry',
    label: 'V2 Entry',
    text: 'Dual controller; Skylake-era reference CPU; capacity-drive count TBD; declared protected cache; default NVMe/TCP over 25 GbE. Unresolved: exact CPU/cores, PCIe topology, drive model/count, measured envelope.',
  },
  {
    id: 'medium',
    label: 'V2 Medium',
    text: 'Dual controller; newer/faster CPU; 25 NVMe SSDs total (possible 24 group members + 1 spare); protected NVMe write-cache/log concept; default NVMe/TCP over 100 GbE. Unresolved: protection layout, separate cache device accounting, cache semantics, exact CPU.',
  },
  {
    id: 'high',
    label: 'V2 High',
    text: 'Dual controller; newer/faster CPU; 48 capacity NVMe SSDs plus ~8 dedicated cache SSDs (provisionally 56 devices); default NVMe/TCP over 100 GbE, optional NVMe/FC 64G. Unresolved: whether cache is inside or additional to 48; enclosure/PCIe topology; exact protection/cache arrangement.',
  },
];

export function EnvironmentDetails({ infra }: { infra: InfrastructureProfile }) {
  const [host, setHost] = useState('fc32');
  const [tier, setTier] = useState('v1');
  const env = infra.environment;
  if (!env) return null;
  const usableBudget = budgetOf(infra.capacity.usableBytes);
  const hostOpt = HOST_OPTIONS.find((h) => h.id === host)!;
  const tierOpt = CONFIG_OPTIONS.find((t) => t.id === tier)!;
  return (
    <details className="env">
      <summary>Environment details</summary>
      <dl className="env-grid">
        <dt>Architecture</dt>
        <dd>{env.architecture}</dd>
        <dt>Drives</dt>
        <dd>
          {env.driveCount} × {env.mediaType} · {env.driveNominalTBDecimal} TB (
          {(env.driveNominalBytesDecimal / TIB).toFixed(2)} TiB) nominal each
        </dd>
        <dt>Protection layout</dt>
        <dd>
          {env.groupCount} groups × {env.dataWidth}+{env.parityWidth} · {env.spareDrives} spare
          drives · {env.enclosureSlots} enclosure slots
        </dd>
        <dt>Raw capacity</dt>
        <dd>
          {(env.rawBytesDecimal / 1e12).toFixed(1)} TB decimal (
          {(env.rawBytesDecimal / TIB).toFixed(1)} TiB)
        </dd>
        <dt>Metadata reserve</dt>
        <dd>{(env.metadataReserveFraction * 100).toFixed(0)}%</dd>
        <dt>Usable capacity</dt>
        <dd>
          {(infra.capacity.usableBytes / TIB).toFixed(0)} TiB · 80% operating budget{' '}
          {(usableBudget / TIB).toFixed(1)} TiB
        </dd>
        <dt>Host ports</dt>
        <dd>{env.hostPorts}</dd>
        <dt>Declared assumption</dt>
        <dd>{env.note}</dd>
      </dl>
      <p className="small">
        Group-level fault tolerance and the selected protection capabilities do not establish
        whole-system availability.
      </p>

      <section className="v2-preview" aria-label="Future design previews">
        <h3>Future design previews (V2 · unmodeled)</h3>
        <div className="controls">
          <label>
            Host connection preview
            <select
              aria-label="Host connection preview"
              value={host}
              onChange={(e) => setHost(e.target.value)}
            >
              {HOST_OPTIONS.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Configuration preview
            <select
              aria-label="Configuration preview"
              value={tier}
              onChange={(e) => setTier(e.target.value)}
            >
              {CONFIG_OPTIONS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="small">
          Selected transport: {hostOpt.transport}. Effective payload, active paths, contention and
          CPU/offload effects are not modeled.
        </p>
        <p className="small">{tierOpt.text}</p>
        <p className="small">
          <em>Descriptive preview only; V1 assessment unchanged.</em>
        </p>
      </section>
    </details>
  );
}
