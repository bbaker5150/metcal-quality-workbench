import React, { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Clock, Link2 } from 'lucide-react';
import { Panel, PanelHeader, Badge, Stat, FilterChips, EmptyState } from '../../shared/ui.jsx';
import ModulePage, { Table } from '../../shared/ModulePage.jsx';
import { moduleByRoute } from '../../app/moduleRegistry.jsx';
import { useData } from '../../data/DataProvider.jsx';
import { SITES } from '../../data/listSchema.js';
import { daysOut, relative } from '../../shared/dates.js';

// A capability is down until it is declared restored, and an empty restored
// date is the whole query. Sorting the open ones by how long they have been
// down puts the oldest gap first, which is the one the programme office is
// least likely to already know about.

export default function CapabilityModule() {
  const { data } = useData();
  const [site, setSite] = useState('');

  const rows = data.capabilityLoss || [];
  const visible = useMemo(() => rows.filter((r) => !site || r.Site === site), [rows, site]);

  const open = visible
    .filter((r) => !r.RestoredDate)
    .sort((a, b) => a.LossDate.localeCompare(b.LossDate));
  const restored = visible
    .filter((r) => r.RestoredDate)
    .sort((a, b) => b.RestoredDate.localeCompare(a.RestoredDate));

  const longest = open.length ? Math.abs(daysOut(open[0].LossDate)) : 0;
  const impacted = open.filter((r) => r.ImpactedArtifacts);

  const siteOptions = SITES
    .map((code) => ({ key: code, label: code, count: rows.filter((r) => r.Site === code).length }))
    .filter((o) => o.count > 0);

  return (
    <ModulePage module={moduleByRoute('capability')}>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="muted text-[0.8rem]">
          {open.length} open · {restored.length} restored
        </p>
        <FilterChips options={siteOptions} value={site} onChange={setSite} allLabel="All sites" />
      </div>

      <Panel className="mb-5">
        <div className="grid divide-y divide-[var(--border-subtle)] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <Stat label="Capabilities down" value={open.length} tone={open.length ? 'fail' : 'pass'} hint="Declared and not restored" />
          <Stat label="Longest outstanding" value={longest} unit="days" tone={longest > 60 ? 'fail' : longest ? 'evaluate' : 'pass'} hint={open[0] ? `${open[0].Site} · ${open[0].Parameter}` : 'Nothing outstanding'} />
          <Stat label="Blocking a PT artifact" value={impacted.length} tone={impacted.length ? 'evaluate' : 'pass'} hint={impacted.length ? impacted.map((r) => r.ImpactedArtifacts).join(', ') : 'No round affected'} />
        </div>
      </Panel>

      <Panel className="mb-5">
        <PanelHeader
          title="Currently down"
          subtitle="Declared out of service, awaiting restoration"
          icon={AlertTriangle}
        />
        {open.length === 0 ? (
          <EmptyState>Nothing down at this site.</EmptyState>
        ) : (
          <Table head={['Site', 'Lab code', 'Parameter', 'Range', 'Reason', 'Down since', 'Impact']}>
            {open.map((row) => (
              <tr key={row.Id} className="hover:bg-ink-500/[0.03]">
                <td className="px-5 py-2.5 font-semibold">{row.Site}</td>
                <td className="px-5 py-2.5 font-mono text-[0.76rem]">{row.LabCode}</td>
                <td className="px-5 py-2.5">
                  {row.Parameter}
                  <span className="muted ml-2 text-[0.74rem]">{row.Discipline}</span>
                </td>
                <td className="tnum px-5 py-2.5">{row.RangeText}</td>
                <td className="muted px-5 py-2.5">{row.Reason}</td>
                <td className="px-5 py-2.5 whitespace-nowrap">
                  <span className="tnum">{row.LossDate}</span>
                  <span className="muted ml-2 inline-flex items-center gap-1 text-[0.73rem]">
                    <Clock size={11} /> {relative(row.LossDate)}
                  </span>
                </td>
                <td className="px-5 py-2.5">
                  {row.ImpactedArtifacts ? (
                    <span className="inline-flex items-center gap-1.5 text-[0.76rem] text-evaluate-600 dark:text-evaluate-400">
                      <Link2 size={12} /> {row.ImpactedArtifacts}
                    </span>
                  ) : (
                    <span className="muted text-[0.76rem]">—</span>
                  )}
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Panel>

      <Panel>
        <PanelHeader title="Restored" subtitle="Closed out, kept for the record" icon={CheckCircle2} />
        {restored.length === 0 ? (
          <EmptyState>Nothing restored at this site yet.</EmptyState>
        ) : (
          <Table head={['Site', 'Parameter', 'Reason', 'Down', 'Restored', 'Out for']}>
            {restored.map((row) => {
              const days = Math.round(
                (Date.parse(`${row.RestoredDate}T00:00:00Z`) - Date.parse(`${row.LossDate}T00:00:00Z`)) / 86400000,
              );
              return (
                <tr key={row.Id} className="hover:bg-ink-500/[0.03]">
                  <td className="px-5 py-2.5 font-semibold">{row.Site}</td>
                  <td className="px-5 py-2.5">{row.Parameter}</td>
                  <td className="muted px-5 py-2.5">{row.Reason}</td>
                  <td className="muted tnum px-5 py-2.5">{row.LossDate}</td>
                  <td className="tnum px-5 py-2.5">{row.RestoredDate}</td>
                  <td className="tnum px-5 py-2.5">
                    <Badge tone={days > 60 ? 'evaluate' : 'pass'}>{days} days</Badge>
                  </td>
                </tr>
              );
            })}
          </Table>
        )}
      </Panel>
    </ModulePage>
  );
}
