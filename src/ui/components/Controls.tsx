import type { AssessmentOptions } from '../../engine/index.js';
import { TIB } from '../../engine/units.js';
import type { InfrastructureProfile, WorkloadProfile } from '../../engine/index.js';

export interface Selection {
  infraId: string;
  workloadId: string;
  options: AssessmentOptions;
}

interface Props {
  selection: Selection;
  infrastructures: InfrastructureProfile[];
  workloads: WorkloadProfile[];
  onChange: (s: Selection) => void;
}

function infraLabel(i: InfrastructureProfile): string {
  const layout = i.backend.layout === 'raid5' ? 'RAID 5' : 'RAID 6';
  return `${i.id} · ${layout} · ${Math.round(i.capacity.usableBytes / TIB)} TiB usable`;
}

export function Controls({ selection, infrastructures, workloads, onChange }: Props) {
  return (
    <div className="controls">
      <label>
        Infrastructure
        <select
          aria-label="Infrastructure"
          value={selection.infraId}
          onChange={(e) => onChange({ ...selection, infraId: e.target.value })}
        >
          {infrastructures.map((i) => (
            <option key={i.id} value={i.id}>
              {infraLabel(i)}
            </option>
          ))}
        </select>
      </label>
      <label>
        Proposed workload
        <select
          aria-label="Proposed workload"
          value={selection.workloadId}
          onChange={(e) => onChange({ ...selection, workloadId: e.target.value })}
        >
          {workloads.map((w) => (
            <option key={w.id} value={w.id}>
              {w.id} · {w.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        What-if: proposed demand
        <select
          aria-label="Demand multiplier"
          value={String(selection.options.demandMultiplier)}
          onChange={(e) =>
            onChange({
              ...selection,
              options: {
                ...selection.options,
                demandMultiplier: Number(e.target.value) as 1 | 1.5 | 2,
              },
            })
          }
        >
          <option value="1">1× · proposed baseline</option>
          <option value="1.5">1.5× · higher demand</option>
          <option value="2">2× · higher demand</option>
        </select>
      </label>
      <label>
        Growth horizon
        <select
          aria-label="Growth horizon"
          value={String(selection.options.horizonYears)}
          onChange={(e) =>
            onChange({
              ...selection,
              options: {
                ...selection.options,
                horizonYears: Number(e.target.value) as 0 | 1 | 3,
              },
            })
          }
        >
          <option value="0">0 years</option>
          <option value="1">1 year</option>
          <option value="3">3 years</option>
        </select>
      </label>
    </div>
  );
}
