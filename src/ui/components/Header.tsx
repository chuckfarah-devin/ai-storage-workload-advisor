import { MANDATORY_LABEL } from '../../engine/index.js';

export function Header() {
  return (
    <header className="chrome">
      <span className="brand">AI Storage Workload Advisor</span>
      <span className="tag">Synthetic profiles · 7-day trace</span>
      <p className="mandatory-label">{MANDATORY_LABEL}</p>
    </header>
  );
}
