import { describe, expect, it } from 'vitest';
import type { InfrastructureProfile, WorkloadProfile } from '../../src/engine/model.js';
import { checkProtection } from '../../src/engine/rules/protection.js';
import { INF_A, INF_B, WL_RAG, WL_VM } from '../fixtures/samples.js';

function infra(p: Partial<InfrastructureProfile['protection']>): InfrastructureProfile {
  const i = structuredClone(INF_A);
  Object.assign(i.protection, p);
  return i;
}

function wl(p: Partial<WorkloadProfile['protectionRequired']>): WorkloadProfile {
  const w = structuredClone(WL_VM);
  Object.assign(w.protectionRequired, p);
  return w;
}

describe('R-PRO-1 protection capability matching', () => {
  it('shipped combos are all ready', () => {
    expect(checkProtection(INF_A, WL_VM).status).toBe('modeled-ready');
    expect(checkProtection(INF_B, WL_VM).status).toBe('modeled-ready');
    expect(checkProtection(INF_A, WL_RAG).status).toBe('modeled-ready');
    expect(checkProtection(INF_B, WL_RAG).status).toBe('modeled-ready');
  });

  it('min 2 tolerated failures vs RAID 5 (tolerated 1) → constraint', () => {
    expect(checkProtection(INF_A, wl({ minToleratedDriveFailures: 2 })).status).toBe('modeled-constraint');
    expect(checkProtection(INF_B, wl({ minToleratedDriveFailures: 2 })).status).toBe('modeled-ready');
  });

  it('snapshots required vs capability false → constraint', () => {
    expect(checkProtection(infra({ snapshots: false }), WL_VM).status).toBe('modeled-constraint');
  });

  it('replication required async vs unknown → needs-investigation', () => {
    expect(checkProtection(INF_A, wl({ replicationRequired: 'async' })).status).toBe('needs-investigation');
  });

  it('replication required sync vs async → constraint', () => {
    expect(checkProtection(infra({ replication: 'async' }), wl({ replicationRequired: 'sync' })).status).toBe('modeled-constraint');
  });

  it('replication required async vs sync → ready (sync satisfies async)', () => {
    expect(checkProtection(infra({ replication: 'sync' }), wl({ replicationRequired: 'async' })).status).toBe('modeled-ready');
  });

  it('replication required none vs unknown → ready', () => {
    const r = checkProtection(INF_A, WL_VM); // required none, capability unknown
    expect(r.status).toBe('modeled-ready');
    const repl = r.findings[0].evidence.find((e) => e.label === 'replication capability');
    expect(repl?.value).toBe('unknown');
  });

  it('findings carry the vocabulary caveat', () => {
    const r = checkProtection(INF_A, WL_VM);
    expect(r.findings[0].assumptions).toContain(
      'The V1 capability vocabulary covers selected capabilities, not complete availability assurance.',
    );
  });
});
