import React, { useMemo, useState } from 'react';
import { UserCheck, CheckCircle2, CircleDashed, Printer } from 'lucide-react';
import { Panel, PanelHeader, Badge, Button, Stat, FilterChips, EmptyState } from '../../shared/ui.jsx';
import ModulePage, { Table } from '../../shared/ModulePage.jsx';
import { moduleByRoute } from '../../app/moduleRegistry.jsx';
import { useData } from '../../data/DataProvider.jsx';
import { SITES } from '../../data/listSchema.js';

// The confirmation sheet and the schedule are the same rows read two ways. This
// one asks "who is confirmed"; Schedule (02) asks "what is happening when".
// Keeping one list behind both is what stops a name being confirmed in one
// place and pending in the other.

const STATUS_TONE = {
  Confirmed: 'pass',
  'Pending confirmation': 'evaluate',
  'Endorsement required': 'fail',
};

export default function ConfirmationModule() {
  const { data } = useData();
  const [site, setSite] = useState('');

  const rows = data.enrollments || [];
  const courses = useMemo(
    () => new Map((data.courses || []).map((c) => [c.CourseCode, c])),
    [data.courses],
  );

  const visible = useMemo(
    () => rows
      .filter((r) => !site || r.Site === site)
      .sort((a, b) => a.StartDate.localeCompare(b.StartDate) || a.Person.localeCompare(b.Person)),
    [rows, site],
  );

  const confirmed = visible.filter((r) => r.Confirmed);
  const ordersOut = visible.filter((r) => r.OrdersStatus !== 'Issued');

  const siteOptions = SITES
    .map((code) => ({ key: code, label: code, count: rows.filter((r) => r.Site === code).length }))
    .filter((o) => o.count > 0);

  return (
    <ModulePage module={moduleByRoute('confirmation')}>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="muted text-[0.8rem]">{visible.length} names on the sheet</p>
        <FilterChips options={siteOptions} value={site} onChange={setSite} allLabel="All sites" />
      </div>

      <Panel className="mb-5">
        <div className="grid divide-y divide-[var(--border-subtle)] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <Stat label="Confirmed" value={`${confirmed.length}/${visible.length}`} tone={confirmed.length === visible.length ? 'pass' : 'evaluate'} hint="Seat accepted by the member" />
          <Stat label="Orders outstanding" value={ordersOut.length} tone={ordersOut.length ? 'evaluate' : 'pass'} hint="Drafted or not started" />
          <Stat label="Sites represented" value={new Set(visible.map((r) => r.Site)).size} hint={`of ${SITES.length}`} />
        </div>
      </Panel>

      <Panel>
        <PanelHeader
          title="By-name confirmation sheet"
          subtitle="One row per member per course, in convening order"
          icon={UserCheck}
          actions={
            <Button variant="ghost" disabled title="Renders the sheet to PDF on the live site">
              <Printer size={13} /> Generate sheet
            </Button>
          }
        />
        {visible.length === 0 ? (
          <EmptyState>Nobody scheduled at this site.</EmptyState>
        ) : (
          <Table head={['Name', 'Site', 'Course', 'Title', 'Convenes', 'Quota', 'Confirmed', 'Orders', 'Status']}>
            {visible.map((row) => {
              const course = courses.get(row.CourseCode);
              return (
                <tr key={row.Id} className="hover:bg-ink-500/[0.03]">
                  <td className="px-5 py-2.5 font-medium whitespace-nowrap">{row.Person}</td>
                  <td className="px-5 py-2.5">{row.Site}</td>
                  <td className="px-5 py-2.5 font-mono text-[0.75rem]">{row.CourseCode}</td>
                  <td className="muted px-5 py-2.5">{course?.Title || '—'}</td>
                  <td className="tnum px-5 py-2.5 whitespace-nowrap">{row.StartDate}</td>
                  <td className="muted px-5 py-2.5">{row.QuotaStatus}</td>
                  <td className="px-5 py-2.5">
                    {row.Confirmed ? (
                      <span className="inline-flex items-center gap-1.5 text-[0.76rem] text-pass-600 dark:text-pass-400">
                        <CheckCircle2 size={13} /> {row.ConfirmedOn}
                      </span>
                    ) : (
                      <span className="muted inline-flex items-center gap-1.5 text-[0.76rem]">
                        <CircleDashed size={13} /> pending
                      </span>
                    )}
                  </td>
                  <td className="muted px-5 py-2.5">{row.OrdersStatus}</td>
                  <td className="px-5 py-2.5"><Badge tone={STATUS_TONE[row.Status]}>{row.Status}</Badge></td>
                </tr>
              );
            })}
          </Table>
        )}
      </Panel>
    </ModulePage>
  );
}
