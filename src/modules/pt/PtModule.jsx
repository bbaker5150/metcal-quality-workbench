import React, { useMemo, useState } from 'react';
import {
  Activity, AlertTriangle, MapPin, Truck, CalendarClock, CheckCircle2,
  FileText, Upload, Download, ArrowRight, Boxes, FileBarChart, BookOpen,
  ExternalLink, Bell, FlaskConical,
} from 'lucide-react';
import { Panel, PanelHeader, Badge, Button, Stat, FilterChips, EmptyState } from '../../shared/ui.jsx';
import ModulePage, { Table } from '../../shared/ModulePage.jsx';
import { moduleByRoute } from '../../app/moduleRegistry.jsx';
import { useData } from '../../data/DataProvider.jsx';
import { MEASUREMENT_AREAS, SITES, REFERENCE_LAB } from '../../data/listSchema.js';
import { ptRound } from '../../data/qaEngine.js';
import SpcChart from './SpcChart.jsx';

const TIER_TONE = { PASS: 'pass', EVALUATE: 'evaluate', FAIL: 'fail' };

const LEG_TONE = {
  'At-Lab': 'signal',
  'In-Transit': 'brass',
  Scheduled: 'neutral',
  Completed: 'neutral',
};

const LEG_ICON = {
  'At-Lab': MapPin,
  'In-Transit': Truck,
  Scheduled: CalendarClock,
  Completed: CheckCircle2,
};

/** Significant figures worth showing depend on the artifact, not the column. */
const digitsFor = (unit) => (unit === 'V' || unit === 'in' ? 7 : unit === '°C' || unit === 'dB' ? 4 : 3);

const TABS = [
  { key: 'tracker', label: 'Tracker' },
  { key: 'inventory', label: 'Inventory' },
  { key: 'submit', label: 'Instructions & data sheets' },
  { key: 'results', label: 'Results' },
  { key: 'reports', label: 'Reports' },
  { key: 'manual', label: 'Process manual' },
];

export default function PtModule() {
  const { data } = useData();
  const [tab, setTab] = useState('tracker');
  const [area, setArea] = useState('');

  const artifacts = data.artifacts || [];
  const rotation = data.rotation || [];
  const results = data.ptResults || [];

  const artifactById = useMemo(
    () => new Map(artifacts.map((a) => [a.Id, a])),
    [artifacts],
  );

  const inArea = (artifactId) => !area || artifactById.get(artifactId)?.MeasurementArea === area;

  const areaOptions = MEASUREMENT_AREAS.map((name) => ({
    key: name,
    label: name,
    count: artifacts.filter((a) => a.MeasurementArea === name).length,
  })).filter((o) => o.count > 0);

  const held = rotation.filter((r) => r.Status === 'At-Lab' && inArea(r.ArtifactId));
  const moving = rotation.filter((r) => r.Status === 'In-Transit' && inArea(r.ArtifactId));
  const upcoming = rotation.filter((r) => r.Status === 'Scheduled' && inArea(r.ArtifactId));

  return (
    <ModulePage module={moduleByRoute('pt')}>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <nav className="hairline inline-flex rounded-lg border p-0.5" aria-label="RRPT views">
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
        <FilterChips options={areaOptions} value={area} onChange={setArea} allLabel="All areas" />
      </div>

      <Panel className="mb-5">
        <div className="grid divide-y divide-[var(--border-subtle)] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <Stat label="At a lab now" value={held.length} hint="Artifacts under test" />
          <Stat label="In transit" value={moving.length} hint="Between sites" />
          <Stat label="Scheduled legs" value={upcoming.length} hint="Bookings ahead" />
        </div>
      </Panel>

      {tab === 'tracker' && (
        <Tracker
          rotation={rotation.filter((r) => inArea(r.ArtifactId))}
          artifactById={artifactById}
        />
      )}
      {tab === 'inventory' && <Inventory artifacts={artifacts.filter((a) => !area || a.MeasurementArea === area)} rotation={rotation} results={results} />}
      {tab === 'reports' && (
        <Reports
          artifacts={artifacts.filter((a) => !area || a.MeasurementArea === area)}
          results={results}
          rotation={rotation}
        />
      )}
      {tab === 'manual' && <Manual procedures={data.procedures || []} />}
      {tab === 'results' && (
        <>
          <Spc artifacts={artifacts.filter((a) => !area || a.MeasurementArea === area)} results={results} />
          <div className="mt-5">
            <Results results={results.filter((r) => inArea(r.ArtifactId))} artifactById={artifactById} />
          </div>
        </>
      )}
      {tab === 'submit' && (
        <Submission
          artifacts={artifacts.filter((a) => !area || a.MeasurementArea === area)}
          results={results}
        />
      )}
    </ModulePage>
  );
}

// ---------------------------------------------------------------------------
// Tracker — who has what now, and who is scheduled to
// ---------------------------------------------------------------------------

function Tracker({ rotation, artifactById }) {
  const now = rotation.filter((r) => r.Status === 'At-Lab' || r.Status === 'In-Transit');
  const next = rotation
    .filter((r) => r.Status === 'Scheduled')
    .sort((a, b) => a.ArrivalDate.localeCompare(b.ArrivalDate));

  return (
    <>
      <Panel className="mb-5">
        <PanelHeader
          title="Current custody"
          subtitle="Which site holds which model right now"
          icon={MapPin}
        />
        {now.length === 0 ? (
          <EmptyState>Nothing in circulation for this measurement area.</EmptyState>
        ) : (
          <Table head={['Site', 'Model', 'S/N', 'Area', 'Status', 'Window', 'AIIS']}>
            {now.map((leg) => {
              const artifact = artifactById.get(leg.ArtifactId);
              const Icon = LEG_ICON[leg.Status];
              return (
                <tr key={leg.Id} className="hover:bg-ink-500/[0.03]">
                  <td className="px-5 py-2.5 font-semibold">{leg.Site}</td>
                  <td className="px-5 py-2.5 font-mono text-[0.76rem]">{artifact?.Model}</td>
                  <td className="muted px-5 py-2.5 font-mono text-[0.74rem]">{artifact?.SerialNumber}</td>
                  <td className="muted px-5 py-2.5">{artifact?.MeasurementArea}</td>
                  <td className="px-5 py-2.5">
                    <Badge tone={LEG_TONE[leg.Status]}>
                      <Icon size={11} /> {leg.Status}
                    </Badge>
                  </td>
                  <td className="muted tnum px-5 py-2.5 whitespace-nowrap">
                    {leg.ArrivalDate} <ArrowRight size={11} className="inline" /> {leg.DepartureDate}
                  </td>
                  <td className="px-5 py-2.5">
                    {leg.AIIS_Completed
                      ? <CheckCircle2 size={15} className="text-pass-600 dark:text-pass-400" />
                      : <span className="muted text-[0.76rem]">pending</span>}
                  </td>
                </tr>
              );
            })}
          </Table>
        )}
      </Panel>

      <Panel>
        <PanelHeader
          title="Scheduled to receive"
          subtitle="Which site is booked to have which model, and when"
          icon={CalendarClock}
        />
        {next.length === 0 ? (
          <EmptyState>No forward bookings for this measurement area.</EmptyState>
        ) : (
          <Table head={['Arrival', 'Site', 'Model', 'S/N', 'Leg', 'Departure']}>
            {next.map((leg) => {
              const artifact = artifactById.get(leg.ArtifactId);
              return (
                <tr key={leg.Id} className="hover:bg-ink-500/[0.03]">
                  <td className="tnum px-5 py-2.5 font-medium whitespace-nowrap">{leg.ArrivalDate}</td>
                  <td className="px-5 py-2.5 font-semibold">{leg.Site}</td>
                  <td className="px-5 py-2.5 font-mono text-[0.76rem]">{artifact?.Model}</td>
                  <td className="muted px-5 py-2.5 font-mono text-[0.74rem]">{artifact?.SerialNumber}</td>
                  <td className="muted tnum px-5 py-2.5">#{leg.Leg}</td>
                  <td className="muted tnum px-5 py-2.5 whitespace-nowrap">{leg.DepartureDate}</td>
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
// Live SPC across all sites
// ---------------------------------------------------------------------------

function Spc({ artifacts, results }) {
  // Only artifacts with enough cross-site history to be worth a chart.
  const series = artifacts
    .map((artifact) => {
      const points = results
        .filter((r) => r.ArtifactId === artifact.Id)
        .sort((a, b) => a.StartDate.localeCompare(b.StartDate))
        .map((r) => ({
          site: r.LabCode,
          // Signed, so a lab reading consistently high is visibly different
          // from one reading low. The tiers themselves are set on |z|.
          z: (r.Average - artifact.ReferenceValue) / (artifact.RequiredAccuracy / 2),
          status: r.EvaluationStatus,
          average: r.Average.toFixed(digitsFor(artifact.Unit)),
          unit: artifact.Unit,
          date: r.StartDate,
        }));
      return { artifact, points };
    })
    .filter((s) => s.points.length >= 3);

  if (series.length === 0) {
    return (
      <Panel>
        <EmptyState>
          No artifact in this area has been measured at three or more sites yet — a control chart
          needs the history before it says anything.
        </EmptyState>
      </Panel>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {series.map(({ artifact, points }) => {
        const covered = new Set(points.map((p) => p.site));
        return (
          <Panel key={artifact.Id}>
            <PanelHeader
              title={`${artifact.Model} · ${artifact.SerialNumber}`}
              subtitle={`${artifact.MeasurementArea} · ${artifact.NominalValue} ${artifact.Unit} · ${points.length} of ${SITES.length} sites`}
              icon={Activity}
              actions={
                <Badge tone={points.some((p) => p.status === 'FAIL') ? 'fail' : points.some((p) => p.status === 'EVALUATE') ? 'evaluate' : 'pass'}>
                  {points.some((p) => p.status === 'FAIL') ? 'Action' : points.some((p) => p.status === 'EVALUATE') ? 'Watch' : 'In control'}
                </Badge>
              }
            />
            <SpcChart points={points} unit={artifact.Unit} />
            <div className="muted border-t hairline px-5 py-2.5 text-[0.74rem]">
              Awaiting: {SITES.filter((s) => !covered.has(s)).join(', ') || '—'}
            </div>
          </Panel>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Results table
// ---------------------------------------------------------------------------

function Results({ results, artifactById }) {
  const sorted = [...results].sort((a, b) => b.StartDate.localeCompare(a.StartDate));

  return (
    <Panel>
      <PanelHeader
        title="Proficiency test results"
        subtitle="Evaluated by the QA engine — |z| ≤ 2 pass, 2 < |z| < 3 evaluate, |z| ≥ 3 fail"
      />
      {sorted.length === 0 ? (
        <EmptyState>No results recorded for this measurement area.</EmptyState>
      ) : (
        <Table head={['Date', 'Artifact', 'Lab', 'Average', 's', 'z', 'Evaluation', 'Source']}>
          {sorted.map((row) => {
            const artifact = artifactById.get(row.ArtifactId);
            const digits = digitsFor(artifact?.Unit);
            return (
              <tr key={row.Id} className="hover:bg-ink-500/[0.03]">
                <td className="muted tnum px-5 py-2.5 whitespace-nowrap">{row.StartDate}</td>
                <td className="px-5 py-2.5">
                  <span className="font-mono text-[0.76rem]">{artifact?.Model}</span>
                  <span className="muted ml-2 text-[0.74rem]">{artifact?.Unit}</span>
                </td>
                <td className="px-5 py-2.5 font-medium">{row.LabCode}</td>
                <td className="tnum px-5 py-2.5">{row.Average?.toFixed(digits)}</td>
                <td className="muted tnum px-5 py-2.5">{row.StdDev?.toPrecision(2)}</td>
                <td className="tnum px-5 py-2.5 font-medium">{row.ZScore?.toFixed(2)}</td>
                <td className="px-5 py-2.5">
                  <span className="flex items-center gap-2">
                    <Badge tone={TIER_TONE[row.EvaluationStatus]}>{row.EvaluationStatus}</Badge>
                    {row.repeatabilityWarning && (
                      <span
                        title="Sample scatter exceeds σ_pt — the lab may be near the reference value without being repeatable"
                        className="text-evaluate-600 dark:text-evaluate-400"
                      >
                        <AlertTriangle size={14} />
                      </span>
                    )}
                  </span>
                </td>
                <td className="muted px-5 py-2.5 text-[0.76rem]">{row.SubmittedVia}</td>
              </tr>
            );
          })}
        </Table>
      )}
    </Panel>
  );
}

// ---------------------------------------------------------------------------
// PT instructions, templates, and result submission
// ---------------------------------------------------------------------------

function Submission({ artifacts, results }) {
  const submitted = new Set(results.map((r) => `${r.ArtifactId}:${r.LabCode}`));

  return (
    <>
      <Panel className="mb-5">
        <PanelHeader
          title="PT instructions and templates"
          subtitle="Served with the artifact, so the lab never hunts for the right revision"
          icon={FileText}
        />
        {artifacts.length === 0 ? (
          <EmptyState>No artifacts in this measurement area.</EmptyState>
        ) : (
          <Table head={['Model', 'Area', 'Nominal', 'Instruction', 'Template', '']}>
            {artifacts.map((artifact) => (
              <tr key={artifact.Id} className="hover:bg-ink-500/[0.03]">
                <td className="px-5 py-2.5 font-mono text-[0.76rem]">{artifact.Model}</td>
                <td className="muted px-5 py-2.5">{artifact.MeasurementArea}</td>
                <td className="tnum px-5 py-2.5">
                  {artifact.NominalValue} <span className="muted">{artifact.Unit}</span>
                </td>
                <td className="px-5 py-2.5 font-mono text-[0.74rem]">{artifact.PtInstructionDoc}</td>
                <td className="px-5 py-2.5 font-mono text-[0.74rem]">{artifact.PtTemplateDoc}</td>
                <td className="px-5 py-2.5 text-right">
                  <Button variant="ghost" disabled title="Wired to the document library on the live site">
                    <Download size={13} /> Template
                  </Button>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Panel>

      <Panel>
        <PanelHeader
          title="Submit results"
          subtitle="Import a completed workbook, or key the six runs in directly"
          icon={Upload}
        />
        <div className="border-b hairline px-5 py-5">
          <div className="hairline rounded-xl border border-dashed px-5 py-8 text-center">
            <Upload size={20} className="muted mx-auto" />
            <p className="mt-2 text-[0.85rem] font-medium">Drop a completed PT workbook</p>
            <p className="muted mt-1 text-[0.78rem]">
              The six runs, environmentals, and metrologist are read from the template and
              evaluated on arrival — the z-score is never typed in by hand.
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <Button variant="primary" disabled title="Enabled against the live document library">
                Choose file
              </Button>
              <Button variant="ghost" disabled title="Enabled against the live document library">
                Enter runs manually
              </Button>
            </div>
          </div>
        </div>
        <div className="px-5 py-4">
          <p className="muted text-[0.78rem]">
            <span className="font-medium text-ink-700 dark:text-ink-200">Outstanding submissions.</span>{' '}
            Every lab currently holding an artifact, and whether its result is in.
          </p>
        </div>
        <Table head={['Lab', 'Model', 'Result']}>
          {artifacts.flatMap((artifact) =>
            SITES.map((site) => ({ artifact, site }))
              .filter(({ artifact: a, site }) => submitted.has(`${a.Id}:${site}`))
              .map(({ artifact: a, site }) => (
                <tr key={`${a.Id}:${site}`} className="hover:bg-ink-500/[0.03]">
                  <td className="px-5 py-2.5 font-medium">{site}</td>
                  <td className="px-5 py-2.5 font-mono text-[0.76rem]">{a.Model}</td>
                  <td className="px-5 py-2.5">
                    <Badge tone="pass"><CheckCircle2 size={11} /> Received</Badge>
                  </td>
                </tr>
              )),
          )}
        </Table>
      </Panel>
    </>
  );
}

// ---------------------------------------------------------------------------
// Artifact inventory
// ---------------------------------------------------------------------------

function Inventory({ artifacts, rotation, results }) {
  return (
    <Panel>
      <PanelHeader
        title="PT artifact inventory"
        subtitle="Every artifact in the programme, with where it is and how far its round has got"
        icon={Boxes}
      />
      {artifacts.length === 0 ? (
        <EmptyState>No artifacts in this measurement area.</EmptyState>
      ) : (
        <Table head={['Model', 'S/N', 'Area', 'Nominal', 'Required accuracy', 'Reference value', 'Held by', 'Results in']}>
          {artifacts.map((a) => {
            const here = rotation.find((l) => l.ArtifactId === a.Id && (l.Status === 'At-Lab' || l.Status === 'In-Transit'));
            const count = results.filter((r) => r.ArtifactId === a.Id && r.MeasurementRole === 'Participant').length;
            const digits = digitsFor(a.Unit);
            return (
              <tr key={a.Id} className="hover:bg-ink-500/[0.03]">
                <td className="px-5 py-2.5 font-mono text-[0.76rem] font-medium">{a.Model}</td>
                <td className="muted px-5 py-2.5 font-mono text-[0.74rem]">{a.SerialNumber}</td>
                <td className="muted px-5 py-2.5">{a.MeasurementArea}</td>
                <td className="tnum px-5 py-2.5">{a.NominalValue} <span className="muted">{a.Unit}</span></td>
                <td className="tnum px-5 py-2.5">{a.RequiredAccuracy} <span className="muted">{a.Unit}</span></td>
                <td className="tnum px-5 py-2.5">{a.ReferenceValue?.toFixed(digits)}</td>
                <td className="px-5 py-2.5">
                  {here ? (
                    <Badge tone={LEG_TONE[here.Status]}>{here.Site}</Badge>
                  ) : (
                    <span className="muted text-[0.76rem]">not dispatched</span>
                  )}
                </td>
                <td className="tnum px-5 py-2.5">{count || <span className="muted">—</span>}</td>
              </tr>
            );
          })}
        </Table>
      )}
    </Panel>
  );
}

// ---------------------------------------------------------------------------
// Interim and final reports
// ---------------------------------------------------------------------------
// The reference lab measures the artifact before it leaves and again when it
// returns. Participants are scored against the *opening* measurement, not a
// value written into the artifact record once — a reference value has a date,
// and the one that matters is the one taken immediately before this round.
//
// The closing measurement is what makes a final report worth more than an
// interim: it says whether the artifact was the same instrument at the end as
// at the start. Drift is reported, never silently corrected, because a round
// measured against a moving reference needs judgement rather than arithmetic.

const PHASE_TONE = { Final: 'pass', Interim: 'signal', Open: 'neutral', 'Not started': 'neutral' };

function Reports({ artifacts, results, rotation }) {
  const rounds = artifacts.map((artifact) => {
    const mine = results.filter((r) => r.ArtifactId === artifact.Id);
    const expected = new Set(
      rotation.filter((l) => l.ArtifactId === artifact.Id && l.Site !== REFERENCE_LAB).map((l) => l.Site),
    ).size;
    return { artifact, round: ptRound({ artifact, results: mine, expectedParticipants: expected }) };
  }).filter(({ round }) => round.phase === 'Interim' || round.phase === 'Final');

  if (rounds.length === 0) {
    return (
      <Panel>
        <EmptyState>
          No round in this area has an opening measurement and at least one participant yet, which is
          the least a report can be built from.
        </EmptyState>
      </Panel>
    );
  }

  const allFailures = rounds.flatMap(({ artifact, round }) =>
    round.failures.map((f) => ({ artifact, f, referenceValue: round.referenceValue })));

  return (
    <>
      {allFailures.length > 0 && (
        <Panel className="mb-5">
          <PanelHeader
            title="Corrective action required"
            subtitle="A failed result is notified as soon as it is evaluated, not when the round closes"
            icon={Bell}
            actions={<Badge tone="fail">{allFailures.length} to notify</Badge>}
          />
          <Table head={['Lab', 'Artifact', 'z', 'Measured', 'Reference', 'Action']}>
            {allFailures.map(({ artifact, f, referenceValue }) => {
              const digits = digitsFor(artifact.Unit);
              return (
                <tr key={`${artifact.Id}:${f.LabCode}`} className="hover:bg-ink-500/[0.03]">
                  <td className="px-5 py-2.5 font-semibold">{f.LabCode}</td>
                  <td className="px-5 py-2.5 font-mono text-[0.76rem]">{artifact.Model}</td>
                  <td className="tnum px-5 py-2.5 font-medium text-fail-600 dark:text-fail-400">{f.z.toFixed(2)}</td>
                  <td className="tnum px-5 py-2.5">{f.average?.toFixed(digits)}</td>
                  <td className="muted tnum px-5 py-2.5">{referenceValue?.toFixed(digits)}</td>
                  <td className="px-5 py-2.5">
                    <Button variant="ghost" disabled title="Notifies the lab through the site's mail connector">
                      Notify lab
                    </Button>
                  </td>
                </tr>
              );
            })}
          </Table>
        </Panel>
      )}

      <div className="space-y-5">
        {rounds.map(({ artifact, round }) => {
          const digits = digitsFor(artifact.Unit);
          return (
            <Panel key={artifact.Id}>
              <PanelHeader
                title={`${round.phase} report — ${artifact.Model} · ${artifact.SerialNumber}`}
                subtitle={
                  round.phase === 'Final'
                    ? `All ${round.expectedParticipants} laboratories reported, closing measurement taken`
                    : `${round.completed} of ${round.expectedParticipants} laboratories reported · ${round.remaining} outstanding`
                }
                icon={FileBarChart}
                actions={<Badge tone={PHASE_TONE[round.phase]}>{round.phase}</Badge>}
              />

              <div className="grid gap-px border-b hairline bg-[var(--border-subtle)] sm:grid-cols-3">
                <div className="bg-[var(--surface-raised)] px-5 py-3">
                  <p className="muted text-[0.7rem] font-medium uppercase tracking-[0.1em]">Reference value</p>
                  <p className="tnum mt-1 text-[0.95rem] font-semibold">
                    {round.referenceValue?.toFixed(digits)} <span className="muted text-[0.8rem] font-normal">{artifact.Unit}</span>
                  </p>
                  <p className="muted mt-0.5 text-[0.73rem]">
                    From the {round.referenceFrom}{round.opening ? ` · ${round.opening.StartDate}` : ''}
                  </p>
                </div>
                <div className="bg-[var(--surface-raised)] px-5 py-3">
                  <p className="muted text-[0.7rem] font-medium uppercase tracking-[0.1em]">Closing measurement</p>
                  {round.closing ? (
                    <>
                      <p className="tnum mt-1 text-[0.95rem] font-semibold">{round.closingAverage?.toFixed(digits)}</p>
                      <p className="muted mt-0.5 text-[0.73rem]">{round.closing.StartDate} · {REFERENCE_LAB}</p>
                    </>
                  ) : (
                    <p className="muted mt-1 text-[0.85rem]">Not yet taken</p>
                  )}
                </div>
                <div className="bg-[var(--surface-raised)] px-5 py-3">
                  <p className="muted text-[0.7rem] font-medium uppercase tracking-[0.1em]">Artifact drift</p>
                  {round.drift != null ? (
                    <>
                      <p className={`tnum mt-1 text-[0.95rem] font-semibold ${round.driftExceeded ? 'text-fail-600 dark:text-fail-400' : ''}`}>
                        {round.drift > 0 ? '+' : ''}{round.drift.toFixed(digits)}
                      </p>
                      <p className="muted mt-0.5 text-[0.73rem]">
                        {round.driftRatio?.toFixed(2)} σ<sub>pt</sub> — {round.driftExceeded ? 'results are advisory' : 'within tolerance'}
                      </p>
                    </>
                  ) : (
                    <p className="muted mt-1 text-[0.85rem]">Pending the closing measurement</p>
                  )}
                </div>
              </div>

              <Table head={['Lab', 'Measured', 's', 'z', 'Evaluation', 'Date']}>
                {round.participants.map((p) => (
                  <tr key={p.Id} className="hover:bg-ink-500/[0.03]">
                    <td className="px-5 py-2.5 font-semibold">{p.LabCode}</td>
                    <td className="tnum px-5 py-2.5">{p.average?.toFixed(digits)}</td>
                    <td className="muted tnum px-5 py-2.5">{p.stdDev?.toPrecision(2)}</td>
                    <td className="tnum px-5 py-2.5 font-medium">{p.z?.toFixed(2)}</td>
                    <td className="px-5 py-2.5"><Badge tone={TIER_TONE[p.status]}>{p.status}</Badge></td>
                    <td className="muted tnum px-5 py-2.5">{p.StartDate}</td>
                  </tr>
                ))}
              </Table>

              {round.phase === 'Interim' && (
                <p className="muted border-t hairline px-5 py-3 text-[0.74rem] leading-relaxed">
                  Interim: scored against the opening measurement while the artifact is still
                  circulating. These verdicts can change if the closing measurement shows the
                  artifact drifted, which is exactly what the final report is for.
                </p>
              )}
            </Panel>
          );
        })}
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Process manual
// ---------------------------------------------------------------------------

function Manual({ procedures }) {
  const items = procedures.filter((p) => p.Category === 'PT Manual');
  return (
    <Panel>
      <PanelHeader
        title="PT programme process manual"
        subtitle="The quality manual governing the round-robin, and the standard it is written against"
        icon={BookOpen}
      />
      {items.length === 0 ? (
        <EmptyState>No manual filed.</EmptyState>
      ) : (
        <ul className="divide-y divide-[var(--border-subtle)]">
          {items.map((item) => (
            <li key={item.Id} className="flex gap-4 px-5 py-4">
              <span className="muted mt-0.5 shrink-0"><FlaskConical size={16} strokeWidth={1.75} /></span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                  <h3 className="text-[0.87rem] font-medium">{item.Title}</h3>
                  {item.DocNumber && <Badge tone="neutral">{item.DocNumber}</Badge>}
                </div>
                <p className="muted mt-1 text-[0.8rem] leading-relaxed">{item.Summary}</p>
              </div>
              <span className="shrink-0 self-center">
                {item.Url ? (
                  <a
                    href={item.Url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-[0.78rem] font-medium text-signal-600 hover:underline dark:text-signal-400"
                  >
                    Open <ExternalLink size={12} />
                  </a>
                ) : (
                  <span className="muted text-[0.74rem]">Not linked</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
