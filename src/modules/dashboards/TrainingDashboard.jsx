import React from 'react';
import { Send } from 'lucide-react';
import ModulePage from '../../shared/ModulePage.jsx';
import { moduleByRoute } from '../../app/moduleRegistry.jsx';
import { useData } from '../../data/DataProvider.jsx';
import { SITES } from '../../data/listSchema.js';
import { daysOut, relative } from '../../shared/dates.js';
import { MetricCard, AttentionList, Section } from './DashboardParts.jsx';

export default function TrainingDashboard() {
  const { data } = useData();
  const enrollments = data.enrollments || [];
  const courses = new Map((data.courses || []).map((c) => [c.CourseCode, c]));
  const letters = data.annualLtr || [];

  const current = letters.find((l) => l.Status === 'Signed');
  const acknowledged = new Set((current?.AcknowledgedSites || '').split(',').map((s) => s.trim()).filter(Boolean));
  const outstandingSites = SITES.filter((s) => !acknowledged.has(s));

  const unconfirmed = enrollments.filter((e) => !e.Confirmed);
  const awaitingNotice = enrollments.filter((e) => e.Confirmed && !e.InstructorNotified);
  const ordersOut = enrollments.filter((e) => e.OrdersStatus !== 'Issued');
  const convenesSoon = enrollments.filter((e) => {
    const d = daysOut(e.StartDate);
    return d !== null && d >= 0 && d <= 45;
  });

  const attention = [
    ...awaitingNotice.map((e) => ({
      key: `notify:${e.Id}`, badge: 'Notify', tone: 'evaluate',
      label: `${e.Person} — ${e.CourseCode}`,
      detail: `Confirmed ${e.ConfirmedOn} · ${courses.get(e.CourseCode)?.Schoolhouse || ''} not yet told`,
      to: '/annual-ltr',
    })),
    ...unconfirmed.map((e) => ({
      key: `confirm:${e.Id}`, badge: e.Status === 'Endorsement required' ? 'Endorse' : 'Confirm',
      tone: e.Status === 'Endorsement required' ? 'fail' : 'evaluate',
      label: `${e.Person} — ${e.CourseCode}`,
      detail: `Convenes ${e.StartDate}, ${relative(e.StartDate)} · ${e.QuotaStatus}`,
      to: e.Status === 'Endorsement required' ? '/wpt' : '/annual-ltr',
    })),
    ...outstandingSites.map((site) => ({
      key: `ltr:${site}`, badge: 'LTR', tone: 'evaluate',
      label: `${site} has not acknowledged ${current?.FiscalYear || 'the letter'}`,
      detail: current?.Serial || '',
      to: '/annual-ltr',
    })),
  ];

  return (
    <ModulePage module={moduleByRoute('training-dashboard')}>
      <Section title="Where the pipeline stands">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Seats scheduled" value={enrollments.length}
            detail={`${enrollments.filter((e) => e.Confirmed).length} confirmed, ${unconfirmed.length} pending`}
            to="/confirmation" action="Confirmation sheet"
          />
          <MetricCard
            label="Convening in 45 days" value={convenesSoon.length} tone={convenesSoon.length ? 'evaluate' : 'neutral'}
            detail={convenesSoon.length ? `Next ${relative(convenesSoon.map((e) => e.StartDate).sort()[0])}` : 'Nothing imminent'}
            to="/training-schedule" action="Calendar"
          />
          <MetricCard
            label="Instructor not told" value={awaitingNotice.length} tone={awaitingNotice.length ? 'evaluate' : 'pass'}
            detail={awaitingNotice.length ? 'Confirmed seats with no notice sent' : 'All notices out'}
            to="/training-schedule" action="Send notices"
          />
          <MetricCard
            label="Orders outstanding" value={ordersOut.length} tone={ordersOut.length ? 'evaluate' : 'pass'}
            detail="Drafted or not started"
            to="/confirmation" action="Confirmation sheet"
          />
        </div>
      </Section>

      <Section title="Needs somebody">
        <AttentionList
          title="Open items"
          subtitle="Confirmations, notices, and acknowledgements still owed"
          icon={Send}
          items={attention}
          empty="Every seat is confirmed, every schoolhouse notified, and every site has acknowledged the letter."
        />
      </Section>

      <Section title="The year">
        <div className="grid gap-4 sm:grid-cols-3">
          <MetricCard
            label="Letter in effect" value={current?.FiscalYear || '—'} tone={current ? 'neutral' : 'evaluate'}
            detail={current ? `${acknowledged.size} of ${SITES.length} sites acknowledged` : 'No signed letter'}
            to="/annual-ltr" action="Annual LTR"
          />
          <MetricCard
            label="Vendor seats" value={enrollments.filter((e) => courses.get(e.CourseCode)?.External).length} tone="neutral"
            detail="Outside CANTRAC, endorsement required"
            to="/wpt" action="External training"
          />
          <MetricCard
            label="Schoolhouses" value={(data.schoolhouses || []).length} tone="neutral"
            detail="Check-in procedures and lodging notes"
            to="/schoolhouses" action="Locations"
          />
        </div>
      </Section>
    </ModulePage>
  );
}
