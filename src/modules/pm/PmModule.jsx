import React, { useMemo, useState } from 'react';
import { Wrench, Clock, Gauge, CheckCircle2 } from 'lucide-react';
import { Panel, PanelHeader, Badge, Stat, FilterChips, EmptyState } from '../../shared/ui.jsx';
import ModulePage, { Table } from '../../shared/ModulePage.jsx';
import { moduleByRoute } from '../../app/moduleRegistry.jsx';
import { useData } from '../../data/DataProvider.jsx';
import { SITES } from '../../data/listSchema.js';
import { daysOut, relative } from '../../shared/dates.js';

// Two kinds of interval that do not reduce to one number: an air filter is due
// monthly, a compressor is due at 10 000 running hours whenever that arrives.
// Rather than force both into a date, each row is scored in its own terms and
// the results are ranked on one common axis — how far past due, as a fraction
// of the interval. That is what lets a calendar item and an hours item sit in
// the same sorted list without one of them lying.

function status(row) {
  if (row.Basis === 'Hours') {
    const { HoursRun: run, HoursThreshold: limit } = row;
    if (!limit) return { state: 'Unknown', tone: 'neutral', detail: '', overBy: 0 };
    const fraction = run / limit;
    if (run >= limit) {
      return {
        state: 'Overdue', tone: 'fail',
        detail: `${(run - limit).toLocaleString()} h past ${limit.toLocaleString()} h`,
        overBy: fraction - 1,
      };
    }
    if (fraction >= 0.9) {
      return { state: 'Due soon', tone: 'evaluate', detail: `${(limit - run).toLocaleString()} h remaining`, overBy: fraction - 1 };
    }
    return { state: 'In service', tone: 'pass', detail: `${(limit - run).toLocaleString()} h remaining`, overBy: fraction - 1 };
  }

  const d = daysOut(row.NextDue);
  if (d === null) return { state: 'Unknown', tone: 'neutral', detail: '', overBy: 0 };
  const span = (row.IntervalMonths || 1) * 30;
  if (d < 0) return { state: 'Overdue', tone: 'fail', detail: relative(row.NextDue), overBy: -d / span };
  if (d <= 30) return { state: 'Due soon', tone: 'evaluate', detail: relative(row.NextDue), overBy: -d / span };
  return { state: 'In service', tone: 'pass', detail: relative(row.NextDue), overBy: -d / span };
}

export default function PmModule() {
  const { data } = useData();
  const [site, setSite] = useState('');

  const rows = data.pmSchedule || [];
  const scored = useMemo(
    () => rows
      .filter((r) => !site || r.Site === site)
      .map((r) => ({ ...r, ...status(r) }))
      .sort((a, b) => b.overBy - a.overBy),
    [rows, site],
  );

  const overdue = scored.filter((r) => r.state === 'Overdue');
  const soon = scored.filter((r) => r.state === 'Due soon');

  const siteOptions = SITES
    .map((code) => ({ key: code, label: code, count: rows.filter((r) => r.Site === code).length }))
    .filter((o) => o.count > 0);

  return (
    <ModulePage module={moduleByRoute('pm')}>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="muted text-[0.8rem]">{scored.length} items on the maintenance schedule</p>
        <FilterChips options={siteOptions} value={site} onChange={setSite} allLabel="All sites" />
      </div>

      <Panel className="mb-5">
        <div className="grid divide-y divide-[var(--border-subtle)] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <Stat label="Overdue" value={overdue.length} tone={overdue.length ? 'fail' : 'pass'} hint={overdue.length ? overdue.map((r) => `${r.Model} (${r.Site})`).join(', ') : 'Nothing past due'} />
          <Stat label="Due within 30 days" value={soon.length} tone={soon.length ? 'evaluate' : 'pass'} hint="Calendar and hours both counted" />
          <Stat label="In service" value={scored.length - overdue.length - soon.length} tone="pass" hint="Nothing needed yet" />
        </div>
      </Panel>

      <Panel>
        <PanelHeader
          title="Maintenance schedule"
          subtitle="Ranked by how far past due, so a calendar item and an hours item can share one list"
          icon={Wrench}
        />
        {scored.length === 0 ? (
          <EmptyState>Nothing on the schedule for this site.</EmptyState>
        ) : (
          <Table head={['Model', 'Site', 'What it needs', 'Basis', 'Interval', 'Last done', 'Due', 'Status']}>
            {scored.map((row) => (
              <tr key={row.Id} className="hover:bg-ink-500/[0.03]">
                <td className="px-5 py-2.5">
                  <span className="font-medium">{row.Model}</span>
                  <span className="muted ml-2 text-[0.74rem]">{row.Maker}</span>
                </td>
                <td className="px-5 py-2.5 font-semibold">{row.Site}</td>
                <td className="muted max-w-md px-5 py-2.5 text-[0.79rem] leading-relaxed">{row.Task}</td>
                <td className="px-5 py-2.5">
                  <span className="muted inline-flex items-center gap-1.5 text-[0.76rem]">
                    {row.Basis === 'Hours' ? <Gauge size={12} /> : <Clock size={12} />}
                    {row.Basis}
                  </span>
                </td>
                <td className="muted px-5 py-2.5 whitespace-nowrap">{row.IntervalText}</td>
                <td className="muted tnum px-5 py-2.5 whitespace-nowrap">{row.LastDone || '—'}</td>
                <td className="px-5 py-2.5 whitespace-nowrap">
                  {row.Basis === 'Hours' ? (
                    <span className="tnum">{row.HoursRun?.toLocaleString()} h</span>
                  ) : (
                    <span className="tnum">{row.NextDue}</span>
                  )}
                  <span className="muted ml-2 text-[0.73rem]">{row.detail}</span>
                </td>
                <td className="px-5 py-2.5">
                  <Badge tone={row.tone}>
                    {row.state === 'In service' && <CheckCircle2 size={11} />}
                    {row.state}
                  </Badge>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Panel>
    </ModulePage>
  );
}
