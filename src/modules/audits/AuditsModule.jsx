import React, { useMemo, useState } from 'react';
import { Users, Building2, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { Panel, PanelHeader, Badge, Stat, FilterChips, EmptyState } from '../../shared/ui.jsx';
import ModulePage, { Table } from '../../shared/ModulePage.jsx';
import { moduleByRoute } from '../../app/moduleRegistry.jsx';
import { useData } from '../../data/DataProvider.jsx';
import { SITES } from '../../data/listSchema.js';
import { TODAY } from '../../data/seedData.js';

const AUDIT_TONE = {
  Scheduled: 'signal',
  'In-Progress': 'brass',
  Completed: 'pass',
  Overdue: 'fail',
};

const COMPETENCY_TONE = {
  Current: 'pass',
  'Renewal due': 'evaluate',
  Expiring: 'fail',
};

/** Whole days from today; negative is in the past. */
const daysOut = (iso) => Math.round((Date.parse(`${iso}T00:00:00Z`) - Date.parse(`${TODAY}T00:00:00Z`)) / 86400000);

function relative(iso) {
  const d = daysOut(iso);
  if (d === 0) return 'today';
  if (d > 0) return `in ${d} day${d === 1 ? '' : 's'}`;
  return `${-d} day${d === -1 ? '' : 's'} ago`;
}

export default function AuditsModule() {
  const { data } = useData();
  const [site, setSite] = useState('');

  const auditors = data.auditors || [];
  const labAudits = data.labAudits || [];

  const visible = useMemo(
    () => labAudits.filter((l) => !site || l.Site === site),
    [labAudits, site],
  );

  const siteOptions = SITES
    .map((code) => ({ key: code, label: code, count: labAudits.filter((l) => l.Site === code).length }))
    .filter((o) => o.count > 0);

  const overdue = visible.filter((l) => l.AuditStatus === 'Overdue');
  const findings = visible.reduce((sum, l) => sum + (l.OpenFindings || 0), 0);
  const lapsing = auditors.filter((a) => a.ScopeCompetencyStatus !== 'Current');

  const calendar = [...visible].sort((a, b) => a.ScheduledDate.localeCompare(b.ScheduledDate));

  return (
    <ModulePage module={moduleByRoute('audits')}>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="muted text-[0.8rem]">
          {visible.length} lab{visible.length === 1 ? '' : 's'} · {auditors.length} auditors on the roster
        </p>
        <FilterChips options={siteOptions} value={site} onChange={setSite} allLabel="All sites" />
      </div>

      <Panel className="mb-5">
        <div className="grid divide-y divide-[var(--border-subtle)] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <Stat
            label="Overdue audits"
            value={overdue.length}
            tone={overdue.length ? 'fail' : 'pass'}
            hint={overdue.length ? overdue.map((l) => l.LabCode).join(', ') : 'Nothing past its date'}
          />
          <Stat label="Open findings" value={findings} tone={findings ? 'evaluate' : 'pass'} hint="Across all listed labs" />
          <Stat
            label="Competency lapsing"
            value={lapsing.length}
            tone={lapsing.length ? 'evaluate' : 'pass'}
            hint="Auditors due for renewal"
          />
        </div>
      </Panel>

      <Panel className="mb-5">
        <PanelHeader
          title="Lab audit calendar"
          subtitle="Every lab code and its scheduled audit date"
          icon={Building2}
        />
        {calendar.length === 0 ? (
          <EmptyState>No labs listed for this site.</EmptyState>
        ) : (
          <Table head={['Scheduled', 'Lab code', 'Lab', 'Site', 'Type', 'Auditor', 'Findings', 'Status']}>
            {calendar.map((lab) => (
              <tr key={lab.Id} className="hover:bg-ink-500/[0.03]">
                <td className="px-5 py-2.5 whitespace-nowrap">
                  <span className="tnum font-medium">{lab.ScheduledDate}</span>
                  <span className="muted ml-2 text-[0.73rem]">{relative(lab.ScheduledDate)}</span>
                </td>
                <td className="px-5 py-2.5 font-mono text-[0.76rem] font-medium">{lab.LabCode}</td>
                <td className="muted px-5 py-2.5">{lab.LabName}</td>
                <td className="px-5 py-2.5">{lab.Site}</td>
                <td className="muted px-5 py-2.5 whitespace-nowrap">{lab.AuditType}</td>
                <td className="px-5 py-2.5 whitespace-nowrap">{lab.AssignedAuditor}</td>
                <td className="tnum px-5 py-2.5">
                  {lab.OpenFindings > 0
                    ? <span className="font-medium text-evaluate-600 dark:text-evaluate-400">{lab.OpenFindings}</span>
                    : <span className="muted">—</span>}
                </td>
                <td className="px-5 py-2.5">
                  <Badge tone={AUDIT_TONE[lab.AuditStatus]}>{lab.AuditStatus}</Badge>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Panel>

      <Panel>
        <PanelHeader
          title="NAVAIR auditors"
          subtitle="Scope competency and certification currency"
          icon={Users}
          actions={
            lapsing.length > 0 ? (
              <Badge tone="evaluate">
                <AlertTriangle size={11} /> {lapsing.length} to renew
              </Badge>
            ) : (
              <Badge tone="pass"><CheckCircle2 size={11} /> All current</Badge>
            )
          }
        />
        <Table head={['Auditor', 'Home site', 'Qualified areas', 'Certification expires', 'Assigned', 'Scope competency']}>
          {auditors.map((auditor) => {
            const assigned = labAudits.filter((l) => l.AssignedAuditor === auditor.AuditorName);
            const expiry = daysOut(auditor.CertificationExpires);
            return (
              <tr key={auditor.Id} className="hover:bg-ink-500/[0.03]">
                <td className="px-5 py-2.5 font-medium whitespace-nowrap">{auditor.AuditorName}</td>
                <td className="px-5 py-2.5">{auditor.HomeSite}</td>
                <td className="muted px-5 py-2.5">{auditor.QualifiedAreas}</td>
                <td className="px-5 py-2.5 whitespace-nowrap">
                  <span className="tnum">{auditor.CertificationExpires}</span>
                  {expiry < 90 && (
                    <span className="ml-2 inline-flex items-center gap-1 text-[0.73rem] text-evaluate-600 dark:text-evaluate-400">
                      <Clock size={11} /> {relative(auditor.CertificationExpires)}
                    </span>
                  )}
                </td>
                <td className="tnum px-5 py-2.5">
                  {assigned.length || <span className="muted">—</span>}
                </td>
                <td className="px-5 py-2.5">
                  <Badge tone={COMPETENCY_TONE[auditor.ScopeCompetencyStatus]}>
                    {auditor.ScopeCompetencyStatus}
                  </Badge>
                </td>
              </tr>
            );
          })}
        </Table>
      </Panel>
    </ModulePage>
  );
}
