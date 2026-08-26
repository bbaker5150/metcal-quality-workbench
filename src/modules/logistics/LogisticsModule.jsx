import React from 'react';
import { Panel, PanelHeader, Badge, ComingSoon } from '../../shared/ui.jsx';
import ModulePage, { Table } from '../../shared/ModulePage.jsx';
import { moduleByRoute } from '../../app/moduleRegistry.jsx';
import { useData } from '../../data/DataProvider.jsx';

const STATUS_TONE = {
  'At-Lab': 'pass', 'In-Transit': 'signal', 'QA-Review': 'evaluate', Scheduled: 'neutral',
};

export default function LogisticsModule() {
  const { data, artifactById } = useData();
  const custody = data.custody || [];

  return (
    <ModulePage module={moduleByRoute('logistics')}>
      <Panel className="mb-5">
        <PanelHeader title="Custody matrix" subtitle={`${custody.length} artifacts in the rotation`} />
        <Table head={['Artifact', 'Model', 'Current', 'Destination', 'Status', 'Arrival', 'AIIS']}>
          {custody.map((row) => {
            const artifact = artifactById(row.ArtifactId);
            return (
              <tr key={row.Id} className="hover:bg-ink-500/[0.03]">
                <td className="px-5 py-2.5">{artifact?.Title || `#${row.ArtifactId}`}</td>
                <td className="muted px-5 py-2.5 font-mono text-[0.76rem]">{artifact?.Model}</td>
                <td className="px-5 py-2.5 font-medium">{row.CurrentSite}</td>
                <td className="muted px-5 py-2.5">{row.DestinationSite}</td>
                <td className="px-5 py-2.5"><Badge tone={STATUS_TONE[row.Status]}>{row.Status}</Badge></td>
                <td className="muted tnum px-5 py-2.5">{row.ScheduledArrival}</td>
                <td className="px-5 py-2.5">
                  {row.AIIS_Completed
                    ? <span className="text-pass-600 dark:text-pass-400">✓</span>
                    : <span className="muted">—</span>}
                </td>
              </tr>
            );
          })}
        </Table>
      </Panel>

      <Panel>
        <PanelHeader title="Next up" subtitle="Still to build in this module" />
        <ComingSoon points={[
          'Digital AIIS intake modal — as-found condition, transit case integrity, and the handling safeguards (732B rear battery switch to 0, gage block preservative).',
          'Shipping dispatch manager generating handoff tickets and transit labels.',
          'Rotation queue view showing each site’s inbound and outbound windows on one timeline.',
        ]} />
      </Panel>
    </ModulePage>
  );
}
