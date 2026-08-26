import React from 'react';
import { Panel, PanelHeader, Badge, ComingSoon } from '../../shared/ui.jsx';
import ModulePage, { Table } from '../../shared/ModulePage.jsx';
import { moduleByRoute } from '../../app/moduleRegistry.jsx';
import { useData } from '../../data/DataProvider.jsx';

const STATUS_TONE = { Completed: 'pass', 'In-Progress': 'signal', Scheduled: 'neutral' };

export default function AuditsModule() {
  const { data } = useData();
  const audits = [...(data.auditors || [])].sort((a, b) =>
    String(a.ScheduledDate).localeCompare(String(b.ScheduledDate)));

  return (
    <ModulePage module={moduleByRoute('audits')}>
      <Panel className="mb-5">
        <PanelHeader title="Master audit calendar" subtitle={`${audits.length} windows across five labs`} />
        <Table head={['Scheduled', 'Lab', 'Type', 'Auditor', 'Status', 'Scope competency']}>
          {audits.map((row) => (
            <tr key={row.Id} className="hover:bg-ink-500/[0.03]">
              <td className="tnum px-5 py-2.5">{row.ScheduledDate}</td>
              <td className="px-5 py-2.5 font-medium">{row.LabCode}</td>
              <td className="px-5 py-2.5">
                <Badge tone={row.AuditType === 'JNACT' ? 'brass' : 'neutral'}>{row.AuditType}</Badge>
              </td>
              <td className="muted px-5 py-2.5">{row.AuditorName}</td>
              <td className="px-5 py-2.5"><Badge tone={STATUS_TONE[row.AuditStatus]}>{row.AuditStatus}</Badge></td>
              <td className="muted px-5 py-2.5">{row.ScopeCompetencyStatus}</td>
            </tr>
          ))}
        </Table>
      </Panel>

      <Panel>
        <PanelHeader title="Next up" subtitle="Still to build in this module" />
        <ComingSoon points={[
          'Competency pre-brief dossier — a lab’s historical PT pass rate, z-score trend, logged test hours, and active measurement capabilities on one page ahead of a JNACT or NACT.',
          'Timeline view placing audit windows against the artifact rotation, so a lab is not audited the week its artifact is in transit.',
          'Auditor roster loaded from the SharePoint list rather than seeded.',
        ]} />
      </Panel>
    </ModulePage>
  );
}
