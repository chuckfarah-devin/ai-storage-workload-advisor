import type { DemandSample, InfrastructureProfile, WorkloadProfile } from '../../src/engine/index.js';
import infraA from '../../data/profiles/inf-a-raid5.json';
import infraB from '../../data/profiles/inf-b-raid6.json';
import wlVm from '../../data/profiles/wl-vm.json';
import wlRag from '../../data/profiles/wl-rag.json';
import { TIB } from '../../src/engine/units.js';

export const INF_A = infraA as InfrastructureProfile;
export const INF_B = infraB as InfrastructureProfile;
export const WL_VM = wlVm as unknown as WorkloadProfile;
export const WL_RAG = wlRag as unknown as WorkloadProfile;

export const COMBINATIONS: { infra: InfrastructureProfile; workload: WorkloadProfile }[] = [
  { infra: INF_A, workload: WL_VM },
  { infra: INF_B, workload: WL_VM },
  { infra: INF_A, workload: WL_RAG },
  { infra: INF_B, workload: WL_RAG },
];

function sample(
  id: string,
  existing: [number, number],
  proposed: [number, number],
  blocks: { proposedRead: number; proposedWrite: number },
): DemandSample {
  return {
    id,
    description: `aligned demand sample ${id}`,
    existing: {
      readIops: existing[0],
      writeIops: existing[1],
      readBlockBytes: 16384,
      writeBlockBytes: 8192,
    },
    proposed: {
      readIops: proposed[0],
      writeIops: proposed[1],
      readBlockBytes: blocks.proposedRead,
      writeBlockBytes: blocks.proposedWrite,
    },
    usedCapacityBytes: 100 * TIB,
    baselineLatency: { p95Ms: 1.2, maxMs: 1.4 },
    backgroundBackendOpsPerSecond: 0,
  };
}

const VM_BLOCKS = { proposedRead: 16384, proposedWrite: 8192 };
const RAG_QUERY_BLOCKS = { proposedRead: 8192, proposedWrite: 8192 };
const RAG_INGESTION_BLOCKS = { proposedRead: 65536, proposedWrite: 65536 };

export const VM_SAMPLES: DemandSample[] = [
  sample('vm-weekday-quiet', [14000, 6000], [2800, 1200], VM_BLOCKS),
  sample('vm-weekday-business', [35000, 15000], [10500, 4500], VM_BLOCKS),
  sample('vm-weekday-burst', [52500, 22500], [10500, 4500], VM_BLOCKS),
  sample('vm-weekday-patch', [17500, 7500], [6000, 6000], VM_BLOCKS),
  sample('vm-weekday-batch', [16000, 24000], [2800, 1200], VM_BLOCKS),
];

export const RAG_SAMPLES: DemandSample[] = [
  sample('rag-weekday-business-query', [35000, 15000], [27000, 3000], RAG_QUERY_BLOCKS),
  sample('rag-weekday-burst-query', [52500, 22500], [27000, 3000], RAG_QUERY_BLOCKS),
  sample('rag-weekday-ingestion', [14000, 6000], [6000, 14000], RAG_INGESTION_BLOCKS),
  sample('rag-weekday-batch-offhours', [16000, 24000], [7200, 800], RAG_QUERY_BLOCKS),
];

export function samplesFor(workload: WorkloadProfile): DemandSample[] {
  return workload.id === 'WL-VM' ? VM_SAMPLES : RAG_SAMPLES;
}
