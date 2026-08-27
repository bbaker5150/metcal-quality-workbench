import React, { useMemo } from 'react';
import { AlertTriangle, CalendarCheck, Wrench, Activity } from 'lucide-react';
import ModulePage from '../../shared/ModulePage.jsx';
import { moduleByRoute } from '../../app/moduleRegistry.jsx';
import { useData } from '../../data/DataProvider.jsx';
import { ptRound } from '../../data/qaEngine.js';
import { REFERENCE_LAB } from '../../data/listSchema.js';
import { daysOut } from '../../shared/dates.js';
import { MetricCard, AttentionList, Section } from './DashboardParts.jsx';

export default function QualityDashboard() {
  const { data } = useData();
  const artifacts = data.artifacts || [];
  const results = data.ptResults || [];
  const rotation = data.rotation || [];
  const labAudits = data.labAudits || [];
  const losses = (data.capabilityLoss || []).filter((l) => !l.RestoredDate);
  const pm = data.pmSchedule || [];

  // Every round, scored the same way the PT module scores it — one engine, so
  // the dashboard and the report can never disagree about who failed.
  const rounds = useMemo(() => artifacts.map((artifact) => {
    const mine = results.filter((r) => r.ArtifactId === artifact.Id);
    const expected = new Set(
      rotation.filter((l) => l.ArtifactId === artifact.Id && l.Site !== REFERENCE_LAB).map((l) => l.Site),
    ).size;
    return { artifact, round: ptRound({ artifact, results: mine, expectedParticipants: expected }) };
  }), [artifacts, results, rotation]);

  const failures = rounds.flatMap(({ artifact, round }) =>
    round.failures.map((f) => ({
      key: `${artifact.Id}:${f.LabCode}`,
      badge: 'Fail', tone: 'fail',
      label: `${f.LabCode} — ${artifact.Model}`,
      detail: `z = ${f.z.toFixed(2)} · corrective action required`,
      to: '/pt',
    })));

  const overdueAudits = labAudits.filter((l) => l.AuditStatus === 'Overdue');
  const openFindings = labAudits.reduce((sum, l) => sum + (l.OpenFindings || 0), 0);

  const pmOverdue = pm.filter((r) => (r.Basis === 'Hours'
    ? r.HoursThreshold && r.HoursRun >= r.HoursThreshold
    : daysOut(r.NextDue) !== null && daysOut(r.NextDue) < 0));

  const inFlight = rounds.filter((r) => r.round.phase === 'Interim').length;

  const attention = [
    ...failures,
    ...overdueAudits.map((l) => ({
      key: `audit:${l.Id}`, badge: 'Overdue', tone: 'fail',
      label: `${l.LabCode} — ${l.AuditType}`,
      detail: `Was due ${l.ScheduledDate} · ${l.OpenFindings} open finding${l.OpenFindings === 1 ? '' : 's'}`,
      to: '/audits',
    })),
    ...losses.map((l) => ({
      key: `loss:${l.Id}`, badge: 'Down', tone: 'evaluate',
      label: `${l.Site} — ${l.Parameter}`,
      detail: `${l.Reason} · since ${l.LossDate}`,
      to: '/capability',
    })),
    ...pmOverdue.map((r) => ({
      key: `pm:${r.Id}`, badge: 'PM due', tone: 'evaluate',
      label: `${r.Model} — ${r.Site}`,
      detail: r.Basis === 'Hours'
        ? `${r.HoursRun.toLocaleString()} h against a ${r.HoursThreshold.toLocaleString()} h limit`
        : `Was due ${r.NextDue}`,
      to: '/pm',
    })),
  ];

  return (
    <ModulePage module={moduleByRoute('quality-dashboard')}>
      <Section title="Where the program stands">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Rounds in flight" value={inFlight} tone="neutral"
            detail={`${rounds.filter((r) => r.round.phase === 'Final').length} complete and reportable`}
            to="/pt" action="PT Program"
          />
          <MetricCard
            label="PT failures" value={failures.length} tone={failures.length ? 'fail' : 'pass'}
            detail={failures.length ? 'Corrective action required' : 'No lab outside ±3σ'}
            to="/pt" action="See the reports"
          />
          <MetricCard
            label="Audits overdue" value={overdueAudits.length} tone={overdueAudits.length ? 'fail' : 'pass'}
            detail={`${openFindings} open finding${openFindings === 1 ? '' : 's'} across all labs`}
            to="/audits" action="Audit schedule"
          />
          <MetricCard
            label="Capability down" value={losses.length} tone={losses.length ? 'evaluate' : 'pass'}
            detail={losses.length ? `Oldest since ${losses.map((l) => l.LossDate).sort()[0]}` : 'Everything in service'}
            to="/capability" action="Loss of capability"
          />
        </div>
      </Section>

      <Section title="Needs somebody">
        <AttentionList
          title="Open items"
          subtitle="Everything the program is currently carrying, worst first"
          icon={AlertTriangle}
          items={attention}
          empty="Nothing outstanding across audits, proficiency testing, capability, or maintenance."
        />
      </Section>

      <Section title="Maintenance and rounds">
        <div className="grid gap-4 sm:grid-cols-3">
          <MetricCard
            label="PM overdue" value={pmOverdue.length} tone={pmOverdue.length ? 'evaluate' : 'pass'}
            detail="Calendar and running-hours both counted"
            to="/pm" action="Maintenance"
          />
          <MetricCard
            label="Artifacts circulating" value={rotation.filter((l) => l.Status === 'At-Lab' || l.Status === 'In-Transit').length}
            detail={`${rotation.filter((l) => l.Status === 'Scheduled').length} legs booked ahead`}
            to="/pt" action="Tracker"
          />
          <MetricCard
            label="Labs with a scope" value={new Set((data.scopes || []).map((s) => s.LabCode)).size}
            detail={`${(data.scopes || []).filter((s) => s.Status !== 'Current').length} parameters suspended`}
            to="/scopes" action="Scopes of competency"
          />
        </div>
      </Section>
    </ModulePage>
  );
}
