import React from 'react';
import { GraduationCap, ExternalLink, AlertTriangle } from 'lucide-react';
import { Panel, PanelHeader, Badge, Stat, EmptyState } from '../../shared/ui.jsx';
import ModulePage, { Table } from '../../shared/ModulePage.jsx';
import { moduleByRoute } from '../../app/moduleRegistry.jsx';
import { useData } from '../../data/DataProvider.jsx';

// Vendor training sits outside CANTRAC, which is exactly why it gets its own
// tile: there is no course identification number to look up, no quota to
// request through the usual channel, and — per the current travel policy — an
// endorsement is needed before either happens.

export default function WptModule() {
  const { data } = useData();
  const external = (data.courses || []).filter((c) => c.External);
  const enrollments = data.enrollments || [];
  const restriction = (data.travelRestrictions || []).find((r) => /vendor|wpt/i.test(r.Scope));

  const seats = enrollments.filter((e) => external.some((c) => c.CourseCode === e.CourseCode));
  const needEndorsement = seats.filter((e) => e.Status === 'Endorsement required');

  return (
    <ModulePage module={moduleByRoute('wpt')}>
      <Panel className="mb-5">
        <div className="grid divide-y divide-[var(--border-subtle)] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <Stat label="Vendor courses" value={external.length} hint="Outside CANTRAC" />
          <Stat label="Seats requested" value={seats.length} hint={`${seats.filter((s) => s.Confirmed).length} confirmed`} />
          <Stat label="Awaiting endorsement" value={needEndorsement.length} tone={needEndorsement.length ? 'evaluate' : 'pass'} hint={needEndorsement.length ? needEndorsement.map((s) => s.Person).join(', ') : 'None held up'} />
        </div>
      </Panel>

      {restriction && (
        <Panel className="mb-5">
          <div className="flex gap-3 px-5 py-4">
            <span className="mt-0.5 shrink-0 text-evaluate-600 dark:text-evaluate-400"><AlertTriangle size={16} /></span>
            <div>
              <p className="text-[0.84rem] font-medium">{restriction.Status}: {restriction.Scope}</p>
              <p className="muted mt-1 text-[0.82rem] leading-relaxed">{restriction.Detail}</p>
            </div>
          </div>
        </Panel>
      )}

      <Panel className="mb-5">
        <PanelHeader title="Vendor and workplace courses" subtitle="What each needs before a seat can be requested" icon={GraduationCap} />
        {external.length === 0 ? (
          <EmptyState>No external courses on file.</EmptyState>
        ) : (
          <Table head={['Course', 'Title', 'Provider', 'Days', 'Discipline', 'Prerequisite']}>
            {external.map((course) => (
              <tr key={course.Id} className="hover:bg-ink-500/[0.03]">
                <td className="px-5 py-2.5 font-mono text-[0.75rem]">{course.CourseCode}</td>
                <td className="px-5 py-2.5 font-medium">{course.Title}</td>
                <td className="muted px-5 py-2.5">{course.Schoolhouse.replace(/^Vendor — /, '')}</td>
                <td className="muted tnum px-5 py-2.5">{course.LengthDays}</td>
                <td className="muted px-5 py-2.5">{course.Discipline}</td>
                <td className="muted px-5 py-2.5 font-mono text-[0.74rem]">{course.Prerequisite || '—'}</td>
              </tr>
            ))}
          </Table>
        )}
      </Panel>

      <Panel>
        <PanelHeader title="Requested seats" subtitle="Who has asked for what" />
        {seats.length === 0 ? (
          <EmptyState>No vendor seats requested.</EmptyState>
        ) : (
          <Table head={['Name', 'Site', 'Course', 'Convenes', 'Quota', 'Status']}>
            {seats.map((row) => (
              <tr key={row.Id} className="hover:bg-ink-500/[0.03]">
                <td className="px-5 py-2.5 font-medium">{row.Person}</td>
                <td className="px-5 py-2.5">{row.Site}</td>
                <td className="px-5 py-2.5 font-mono text-[0.75rem]">{row.CourseCode}</td>
                <td className="tnum px-5 py-2.5 whitespace-nowrap">{row.StartDate}</td>
                <td className="muted px-5 py-2.5">{row.QuotaStatus}</td>
                <td className="px-5 py-2.5">
                  <Badge tone={row.Status === 'Confirmed' ? 'pass' : row.Status === 'Endorsement required' ? 'fail' : 'evaluate'}>
                    {row.Status}
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
