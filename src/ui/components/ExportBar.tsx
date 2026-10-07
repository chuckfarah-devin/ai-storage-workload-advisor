import type { AssessmentBundle } from '../viewModel.js';
import { exportAssessment, exportText } from '../viewModel.js';

function download(name: string, text: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export function ExportBar({ bundle }: { bundle: AssessmentBundle }) {
  const a = bundle.assessment;
  const base = `assessment-${a.infrastructureId}-${a.workloadId}`;
  return (
    <div className="export-bar">
      <button onClick={() => download(`${base}.json`, JSON.stringify(exportAssessment(bundle), null, 2), 'application/json')}>
        Download assessment JSON
      </button>
      <button onClick={() => download(`${base}.txt`, exportText(bundle), 'text/plain')}>
        Download text report
      </button>
    </div>
  );
}
