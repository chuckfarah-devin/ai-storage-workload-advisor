import { useMemo, useState } from 'react';
import { Header } from './ui/components/Header.tsx';
import { Controls, type Selection } from './ui/components/Controls.tsx';
import { DecisionBanner } from './ui/components/DecisionBanner.tsx';
import { DimensionCards } from './ui/components/DimensionCards.tsx';
import { EnvironmentDetails } from './ui/components/EnvironmentDetails.tsx';
import { WeeklyChart } from './ui/components/WeeklyChart.tsx';
import { DetailChart } from './ui/components/DetailChart.tsx';
import { WhatIfPanel } from './ui/components/WhatIfPanel.tsx';
import { Findings } from './ui/components/Findings.tsx';
import { ExportBar } from './ui/components/ExportBar.tsx';
import { Footer } from './ui/components/Footer.tsx';
import { baselineAndWhatIf, loadScenario } from './ui/viewModel.ts';
import infraA from '../data/profiles/inf-a-raid5.json';
import infraB from '../data/profiles/inf-b-raid6.json';
import wlVm from '../data/profiles/wl-vm.json';
import wlRag from '../data/profiles/wl-rag.json';
import type { InfrastructureProfile, WorkloadProfile } from './engine/index.js';

const INFRAS = [infraA, infraB] as InfrastructureProfile[];
const WORKLOADS = [wlVm, wlRag] as unknown as WorkloadProfile[];

function App() {
  const [selection, setSelection] = useState<Selection>({
    infraId: 'INF-B',
    workloadId: 'WL-VM',
    options: { demandMultiplier: 1, horizonYears: 1 },
  });

  const { scenario, selected, deltas } = useMemo(() => {
    const s = loadScenario(selection.infraId, selection.workloadId);
    const b = baselineAndWhatIf(s, selection.options);
    return { scenario: s, ...b };
  }, [selection]);

  const a = selected.assessment;

  return (
    <>
      <Header />
      <main>
        <Controls
          selection={selection}
          infrastructures={INFRAS}
          workloads={WORKLOADS}
          onChange={setSelection}
        />
        <DecisionBanner assessment={a} />
        <DimensionCards dimensions={a.dimensions} />
        <EnvironmentDetails infra={scenario.infra} />
        <div className="columns">
          <div>
            <WeeklyChart
              buckets={selected.buckets}
              assessment={a}
              budgets={selected.budgets}
            />
            <DetailChart
              assessment={a}
              day={selected.day}
              derivedDay={selected.derivedDay}
              budgets={selected.budgets}
              ceilings={selected.ceilings}
            />
          </div>
          <aside>
            <WhatIfPanel deltas={deltas} multiplier={selection.options.demandMultiplier} />
            <ExportBar bundle={selected} />
            <Findings dimensions={a.dimensions} />
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default App;
