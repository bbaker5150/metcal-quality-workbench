import React, { useMemo, useState } from 'react';
import {
  FileSignature, CheckCircle2, CircleDashed, Printer, UserCheck,
  CalendarDays, Send, Sparkles, AlertTriangle,
} from 'lucide-react';
import { Panel, PanelHeader, Badge, Button, Stat, FilterChips, EmptyState } from '../../shared/ui.jsx';
import { Table } from '../../shared/ModulePage.jsx';
import { useData } from '../../data/DataProvider.jsx';
import { SITES } from '../../data/listSchema.js';
import { relative, daysOut } from '../../shared/dates.js';

// The five views that make up Annual Training LTR. They are panels rather than
// modules because they are one workflow read at different depths: the letter
// sets the requirement, the by-name sheet says who is going, and the schedule
// says when — with the same enrollment rows behind all three. Keeping one list
// underneath is what stops a name being confirmed in one view and pending in
// another.

const LETTER_TONE = { Signed: 'pass', 'In routing': 'evaluate', Superseded: 'neutral' };

const STATUS_TONE = {
  Confirmed: 'pass',
  'Pending confirmation': 'evaluate',
  'Endorsement required': 'fail',
};

const splitSites = (csv) =>
  new Set(String(csv || '').split(',').map((s) => s.trim()).filter(Boolean));

// ---------------------------------------------------------------------------

export function LetterPanel() {
  const { data } = useData();
  const letters = [...(data.annualLtr || [])].sort((a, b) => b.FiscalYear.localeCompare(a.FiscalYear));
  const current = letters.find((l) => l.Status === 'Signed');
  const acknowledged = splitSites(current?.AcknowledgedSites);
  const outstanding = SITES.filter((s) => !acknowledged.has(s));

  return (
    <>
      {current && (
        <Panel className="mb-5">
          <div className="grid divide-y divide-[var(--border-subtle)] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            <Stat label="In effect" value={current.FiscalYear} hint={current.Serial} />
            <Stat
              label="Sites acknowledged"
              value={`${acknowledged.size}/${SITES.length}`}
              tone={outstanding.length ? 'evaluate' : 'pass'}
              hint={outstanding.length ? `Outstanding: ${outstanding.join(', ')}` : 'All sites in'}
            />
            <Stat label="Issued" value={current.IssuedOn} hint={`Signed by ${current.SignedBy}`} />
          </div>
        </Panel>
      )}

      <Panel>
        <PanelHeader title="Annual training letters" subtitle="By fiscal year, newest first" icon={FileSignature} />
        {letters.length === 0 ? (
          <EmptyState>No letters on file.</EmptyState>
        ) : (
          <ul className="divide-y divide-[var(--border-subtle)]">
            {letters.map((letter) => {
              const ack = splitSites(letter.AcknowledgedSites);
              return (
                <li key={letter.Id} className="px-5 py-4">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h3 className="text-[0.9rem] font-semibold">{letter.FiscalYear}</h3>
                    <Badge tone={LETTER_TONE[letter.Status]}>{letter.Status}</Badge>
                    <span className="muted font-mono text-[0.74rem]">{letter.Serial}</span>
                  </div>
                  <p className="mt-1 text-[0.85rem]">{letter.Title}</p>
                  <p className="muted mt-1 text-[0.8rem] leading-relaxed">{letter.Summary}</p>
                  {letter.Status !== 'In routing' && (
                    <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                      {SITES.map((site) => (
                        <span
                          key={site}
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.7rem] font-medium ${
                            ack.has(site)
                              ? 'bg-pass-600/12 text-pass-600 dark:text-pass-400'
                              : 'bg-ink-500/10 muted'
                          }`}
                        >
                          {ack.has(site) ? <CheckCircle2 size={10} /> : <CircleDashed size={10} />}
                          {site}
                        </span>
                      ))}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </>
  );
}

// ---------------------------------------------------------------------------

export function ConfirmationPanel() {
  const { data } = useData();
  const [site, setSite] = useState('');

  const rows = data.enrollments || [];
  const courses = useMemo(() => new Map((data.courses || []).map((c) => [c.CourseCode, c])), [data.courses]);

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
    <>
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
    </>
  );
}

// ---------------------------------------------------------------------------

function useConvenings() {
  const { data } = useData();
  const enrollments = data.enrollments || [];
  const courses = useMemo(() => new Map((data.courses || []).map((c) => [c.CourseCode, c])), [data.courses]);

  // One row per course convening, not per person: that is what a calendar is.
  const convenings = useMemo(() => {
    const byKey = new Map();
    for (const row of enrollments) {
      const key = `${row.CourseCode}:${row.StartDate}`;
      if (!byKey.has(key)) {
        byKey.set(key, { key, CourseCode: row.CourseCode, StartDate: row.StartDate, EndDate: row.EndDate, seats: [] });
      }
      byKey.get(key).seats.push(row);
    }
    return [...byKey.values()].sort((a, b) => a.StartDate.localeCompare(b.StartDate));
  }, [enrollments]);

  return { enrollments, courses, convenings };
}

export function CalendarPanel() {
  const { courses, convenings } = useConvenings();

  return (
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
  );
}

export function NoticePanel() {
  const { enrollments, courses } = useConvenings();
  const awaiting = enrollments.filter((r) => r.Confirmed && !r.InstructorNotified);

  return (
    <Panel>
      <PanelHeader
        title="Schoolhouse instructor notice"
        subtitle="Sent once a seat is confirmed — what matters is the gap between the two"
        icon={Send}
        actions={
          <Button variant="primary" disabled title="Sends through the site's mail connector on the live site">
            Send {awaiting.length} notice{awaiting.length === 1 ? '' : 's'}
          </Button>
        }
      />
      {awaiting.length === 0 ? (
        <EmptyState>Every confirmed seat has had its notice sent.</EmptyState>
      ) : (
        <Table head={['Name', 'Site', 'Course', 'Schoolhouse', 'Convenes', 'Confirmed', 'Notice']}>
          {awaiting.map((row) => {
            const course = courses.get(row.CourseCode);
            return (
              <tr key={row.Id} className="hover:bg-ink-500/[0.03]">
                <td className="px-5 py-2.5 font-medium">{row.Person}</td>
                <td className="px-5 py-2.5">{row.Site}</td>
                <td className="px-5 py-2.5 font-mono text-[0.75rem]">{row.CourseCode}</td>
                <td className="muted px-5 py-2.5">{course?.Schoolhouse || '—'}</td>
                <td className="tnum px-5 py-2.5 whitespace-nowrap">{row.StartDate}</td>
                <td className="muted tnum px-5 py-2.5">{row.ConfirmedOn}</td>
                <td className="px-5 py-2.5"><Badge tone="evaluate"><AlertTriangle size={11} /> Not sent</Badge></td>
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
  );
}

export function AutoSchedulePanel() {
  const { enrollments, courses } = useConvenings();

  return (
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
            checks the prerequisite chain, and proposes a seat only where the member could actually
            sit the course. Proposals are reviewed before any quota is requested — the point is to
            remove the transcription, not the judgement.
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
  );
}

/** Counts the tabs need for their badges, without duplicating the filtering. */
export function useTrainingCounts() {
  const { data } = useData();
  const enrollments = data.enrollments || [];
  return {
    unconfirmed: enrollments.filter((e) => !e.Confirmed).length,
    awaitingNotice: enrollments.filter((e) => e.Confirmed && !e.InstructorNotified).length,
    upcoming: enrollments.filter((e) => {
      const d = daysOut(e.StartDate);
      return d !== null && d >= 0;
    }).length,
  };
}
