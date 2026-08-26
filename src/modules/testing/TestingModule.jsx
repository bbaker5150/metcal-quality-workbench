import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Panel, PanelHeader, Badge, ComingSoon } from '../../shared/ui.jsx';
import ModulePage, { Table } from '../../shared/ModulePage.jsx';
import { moduleByRoute } from '../../app/moduleRegistry.jsx';
import { useData } from '../../data/DataProvider.jsx';

const TIER_TONE = { PASS: 'pass', EVALUATE: 'evaluate', FAIL: 'fail' };

export default function TestingModule() {
  const { data, artifactById } = useData();
  const results = data.ptResults || [];

  return (
    <ModulePage module={moduleByRoute('testing')}>
      <Panel className="mb-5">
        <PanelHeader
          title="Proficiency test results"
          subtitle="Evaluated by the QA engine — |z| ≤ 2 pass, 2 < |z| < 3 evaluate, |z| ≥ 3 fail"
        />
        <Table head={['Artifact', 'Lab', 'Runs', 'Average', 's', 'z', 'Evaluation']}>
          {results.map((row) => {
            const artifact = artifactById(row.ArtifactId);
            const digits = artifact?.Unit === 'V' || artifact?.Unit === 'in' ? 7 : 3;
            return (
              <tr key={row.Id} className="hover:bg-ink-500/[0.03]">
                <td className="px-5 py-2.5">
                  <span className="font-mono text-[0.76rem]">{artifact?.Model}</span>
                  <span className="muted ml-2 text-[0.76rem]">{artifact?.Unit}</span>
                </td>
                <td className="px-5 py-2.5 font-medium">{row.LabCode}</td>
                <td className="muted tnum px-5 py-2.5">{row.runs?.length ?? 6}</td>
                <td className="tnum px-5 py-2.5">{row.Average?.toFixed(digits)}</td>
                <td className="muted tnum px-5 py-2.5">{row.StdDev?.toPrecision(2)}</td>
                <td className="tnum px-5 py-2.5 font-medium">{row.ZScore?.toFixed(2)}</td>
                <td className="px-5 py-2.5">
                  <span className="flex items-center gap-2">
                    <Badge tone={TIER_TONE[row.EvaluationStatus]}>{row.EvaluationStatus}</Badge>
                    {row.repeatabilityWarning && (
                      <span
                        title="Sample scatter exceeds σ_pt — the lab may be near the reference value without being repeatable"
                        className="text-evaluate-600 dark:text-evaluate-400"
                      >
                        <AlertTriangle size={14} />
                      </span>
                    )}
                  </span>
                </td>
              </tr>
            );
          })}
        </Table>
      </Panel>

      <Panel>
        <PanelHeader title="Next up" subtitle="Still to build in this module" />
        <ComingSoon points={[
          'Six-run entry grid enforcing breakdown and reconnection between runs, with the environmental pre-check gating entry (67–79 °F per NA 17-35FR-06).',
          'Calibrator and divider calculator implementing the V_CAL substitution for 1 MΩ / 10 MΩ artifacts, with the 10-minute linearity countdown.',
          'Live cross-site Shewhart X̄ charts with ±2σ and ±3σ control limits, normalised bias across SDP, SDB, CPB, PRL, and JFB.',
          'Excel import so a completed PT spreadsheet can be parsed straight into the run grid.',
        ]} />
      </Panel>
    </ModulePage>
  );
}
