import type { CheckResult, TraceAssessment } from '../../engine/index.js';

const WORD: Record<string, string> = {
  'modeled-constraint': 'Modeled constraint',
  'needs-investigation': 'Needs investigation',
  'modeled-ready': 'Within modeled budgets',
};

export function DecisionBanner({ assessment }: { assessment: TraceAssessment }) {
  const checks: CheckResult[] = assessment.dimensions.flatMap((d) => d.checks);
  const constraints = checks.filter((c) => c.status === 'modeled-constraint');
  const unknowns = checks.filter((c) => c.status === 'needs-investigation');
  return (
    <section className="decision" aria-label="Decision summary">
      <div className="small">WORKLOAD READINESS</div>
      <h1>Can this environment support the proposed workload?</h1>
      <p className="status-word">{WORD[assessment.overall] ?? assessment.overall}</p>
      {constraints.length > 0 && (
        <p>
          Modeled constraints:{' '}
          {constraints.map((c) => (
            <strong key={c.id}>{c.id} </strong>
          ))}
        </p>
      )}
      {unknowns.length > 0 && (
        <p>
          Needs investigation:{' '}
          {unknowns.map((c) => (
            <span key={c.id}>{c.id} </span>
          ))}
        </p>
      )}
      <p className="small">
        Decision support, not deployment approval · post-addition latency needs investigation
      </p>
    </section>
  );
}
