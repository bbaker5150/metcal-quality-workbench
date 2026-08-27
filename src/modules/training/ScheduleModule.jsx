import React, { useMemo, useState } from 'react';
import { CalendarDays, Send, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Panel, PanelHeader, Badge, Button, Stat, EmptyState } from '../../shared/ui.jsx';
import ModulePage, { Table } from '../../shared/ModulePage.jsx';
import { moduleByRoute } from '../../app/moduleRegistry.jsx';
import { useData } from '../../data/DataProvider.jsx';
import { relative, daysOut } from '../../shared/dates.js';

// Two automations the outline asks for, shown as the state they produce rather
// than as buttons that claim to do something the mock data cannot.
//
//   Auto-schedule    builds candidate seats from the billet matrix and the
//                    prerequisite chain, so a name is only proposed for a
//                    course it can actually sit.
//   Auto-notify      tells the schoolhouse instructor once a seat is confirmed.
//                    What matters on screen is the gap: confirmed seats whose
//                    instructor has not been told yet.

const TABS = [
  { key: 'calendar', label: 'Convening calendar' },
  { key: 'notify', label: 'Instructor notice' },
  { key: 'auto', label: 'Auto-schedule' },
];

export default function ScheduleModule() {
  const { data } = useData();
  const [tab, setTab] = useState('calendar');

  const enrollments = data.enrollments || [];
  const courses = useMemo(() => new Map((data.courses || []).map((c) => [c.CourseCode, c])), [data.courses]);

  // One row per course convening, not per person: that is what a calendar is.
  const convenings = useMemo(() => {
    const byKey = new Map();
    for (const row of enrollments) {
      const key = `${row.CourseCode}:${row.StartDate}`;
      if (!byKey.has(key)) {
        byKey.set(key, {
          key, CourseCode: row.CourseCode, StartDate: row.StartDate, EndDate: row.EndDate, seats: [],
        });
      }
      byKey.get(key).seats.push(row);
    }
    return [...byKey.values()].sort((a, b) => a.StartDate.localeCompare(b.StartDate));
  }, [enrollments]);

  const awaitingNotice = enrollments.filter((r) => r.Confirmed && !r.InstructorNotified);
  const upcoming = convenings.filter((c) => daysOut(c.StartDate) >= 0);

  return (
    <ModulePage module={moduleByRoute('training-schedule')}>
      <nav className="hairline mb-5 inline-flex rounded-lg border p-0.5" aria-label="Schedule views">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            aria-current={tab === t.key ? 'page' : undefined}
            className={`rounded-md px-3 py-1.5 text-[0.79rem] font-medium transition-colors ${
              tab === t.key ? 'bg-signal-600 text-white' : 'muted hover:text-ink-800 dark:hover:text-ink-100'
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <Panel className="mb-5">
        <div className="grid divide-y divide-[var(--border-subtle)] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <Stat label="Convenings ahead" value={upcoming.length} hint={upcoming[0] ? `Next ${relative(upcoming[0].StartDate)}` : '—'} />
          <Stat label="Seats filled" value={enrollments.length} hint={`${enrollments.filter((r) => r.Confirmed).length} confirmed`} />
          <Stat
            label="Instructor not yet told"
            value={awaitingNotice.length}
            tone={awaitingNotice.length ? 'evaluate' : 'pass'}
            hint={awaitingNotice.length ? 'Confirmed seats with no notice sent' : 'All notices out'}
          />
        </div>
      </Panel>

      {tab === 'calendar' && (
        <Panel>
          <PanelHeader title="Convening calendar" subtitle="One row per course convening, with its seats" icon={CalendarDays} />
          {convenings.length === 0 ? (
            <EmptyState>Nothing scheduled.</EmptyState>
          ) : (
            <Table head={['Convenes', 'Course', 'Title', 'Schoolhouse', 'Days', 'Seats', 'Confirmed']}>
              {convenings.map((c) => {
                const course = courses.get(c.CourseCode);
                const confirmed = c.seats.filter((s) => s.Confirmed).length;
                return (
                  <tr key={c.key} className="hover:bg-ink-500/[0.03]">
                    <td className="px-5 py-2.5 whitespace-nowrap">
                      <span className="tnum font-medium">{c.StartDate}</span>
                      <span className="muted ml-2 text-[0.73rem]">{relative(c.StartDate)}</span>
                    </td>
                    <td className="px-5 py-2.5 font-mono text-[0.75rem]">{c.CourseCode}</td>
                    <td className="px-5 py-2.5">{course?.Title || '—'}</td>
                    <td className="muted px-5 py-2.5">{course?.Schoolhouse || '—'}</td>
                    <td className="muted tnum px-5 py-2.5">{course?.LengthDays ?? '—'}</td>
                    <td className="tnum px-5 py-2.5">{c.seats.length}</td>
                    <td className="px-5 py-2.5">
                      <Badge tone={confirmed === c.seats.length ? 'pass' : 'evaluate'}>
                        {confirmed} of {c.seats.length}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </Table>
          )}
        </Panel>
      )}

      {tab === 'notify' && (
        <Panel>
          <PanelHeader
            title="Schoolhouse instructor notice"
            subtitle="Sent once a seat is confirmed — what matters is the gap between the two"
            icon={Send}
            actions={
              <Button variant="primary" disabled title="Sends through the site's mail connector on the live site">
                Send {awaitingNotice.length} notice{awaitingNotice.length === 1 ? '' : 's'}
              </Button>
            }
          />
          {awaitingNotice.length === 0 ? (
            <EmptyState>Every confirmed seat has had its notice sent.</EmptyState>
          ) : (
            <Table head={['Name', 'Site', 'Course', 'Schoolhouse', 'Convenes', 'Confirmed', 'Notice']}>
              {awaitingNotice.map((row) => {
                const course = courses.get(row.CourseCode);
                return (
                  <tr key={row.Id} className="hover:bg-ink-500/[0.03]">
                    <td className="px-5 py-2.5 font-medium">{row.Person}</td>
                    <td className="px-5 py-2.5">{row.Site}</td>
                    <td className="px-5 py-2.5 font-mono text-[0.75rem]">{row.CourseCode}</td>
                    <td className="muted px-5 py-2.5">{course?.Schoolhouse || '—'}</td>
                    <td className="tnum px-5 py-2.5 whitespace-nowrap">{row.StartDate}</td>
                    <td className="muted tnum px-5 py-2.5">{row.ConfirmedOn}</td>
                    <td className="px-5 py-2.5">
                      <Badge tone="evaluate"><AlertTriangle size={11} /> Not sent</Badge>
                    </td>
                  </tr>
                );
              })}
            </Table>
          )}
          <p className="muted border-t hairline px-5 py-3 text-[0.74rem] leading-relaxed">
            Sent notices stay on the record with their date, so a schoolhouse asking
            “when were we told?” has an answer that is not somebody’s sent folder.
          </p>
        </Panel>
      )}

      {tab === 'auto' && (
        <Panel>
          <PanelHeader
            title="Auto-schedule"
            subtitle="Candidate seats built from the billet matrix and the prerequisite chain"
            icon={Sparkles}
          />
          <div className="px-5 py-5">
            <div className="hairline rounded-xl border border-dashed px-5 py-8 text-center">
              <Sparkles size={20} className="muted mx-auto" />
              <p className="mt-2 text-[0.85rem] font-medium">Propose seats for the next fiscal year</p>
              <p className="muted mx-auto mt-1 max-w-lg text-[0.78rem] leading-relaxed">
                Reads the billet training matrix, subtracts what each member has already completed,
                checks the prerequisite chain, and proposes a seat only where the member could
                actually sit the course. Proposals are reviewed before any quota is requested — the
                point is to remove the transcription, not the judgement.
              </p>
              <div className="mt-4 flex items-center justify-center gap-2">
                <Button variant="primary" disabled title="Runs against the live billet matrix">Propose seats</Button>
                <Button variant="ghost" disabled title="Runs against the live billet matrix">Review last run</Button>
              </div>
            </div>
          </div>
          <Table head={['Course', 'Prerequisite', 'Schoolhouse', 'Days', 'Seats scheduled']}>
            {[...courses.values()].map((course) => (
              <tr key={course.Id} className="hover:bg-ink-500/[0.03]">
                <td className="px-5 py-2.5">
                  <span className="font-mono text-[0.75rem]">{course.CourseCode}</span>
                  <span className="ml-2">{course.Title}</span>
                </td>
                <td className="muted px-5 py-2.5 font-mono text-[0.74rem]">{course.Prerequisite || '—'}</td>
                <td className="muted px-5 py-2.5">{course.Schoolhouse}</td>
                <td className="muted tnum px-5 py-2.5">{course.LengthDays}</td>
                <td className="tnum px-5 py-2.5">
                  {enrollments.filter((e) => e.CourseCode === course.CourseCode).length || <span className="muted">—</span>}
                </td>
              </tr>
            ))}
          </Table>
        </Panel>
      )}
    </ModulePage>
  );
}
