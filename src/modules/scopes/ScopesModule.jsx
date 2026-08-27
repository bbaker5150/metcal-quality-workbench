import React, { useMemo, useState } from 'react';
import { ClipboardCheck, Printer, ShieldCheck, ShieldAlert } from 'lucide-react';
import { Panel, PanelHeader, Badge, Button, Stat, FilterChips, EmptyState } from '../../shared/ui.jsx';
import ModulePage, { Table } from '../../shared/ModulePage.jsx';
import { moduleByRoute } from '../../app/moduleRegistry.jsx';
import { useData } from '../../data/DataProvider.jsx';
import { DISCIPLINES } from '../../data/listSchema.js';

// A scope of competency is assembled, not authored: the rows already exist,
// one per declared parameter, and the document is those rows grouped by
// discipline in the order ISO/IEC 17025 scopes are written — parameter, range,
// CMC, comments. Generating it from the same rows the program queries means
// the published scope and the live capability picture cannot drift apart.

const STATUS_TONE = { Current: 'pass', Suspended: 'fail', Provisional: 'evaluate' };

export default function ScopesModule() {
  const { data } = useData();
  const rows = data.scopes || [];
  const losses = data.capabilityLoss || [];

  const labs = useMemo(() => {
    const seen = new Map();
    for (const r of rows) {
      if (!seen.has(r.LabCode)) seen.set(r.LabCode, { LabCode: r.LabCode, Site: r.Site, count: 0 });
      seen.get(r.LabCode).count += 1;
    }
    return [...seen.values()].sort((a, b) => a.LabCode.localeCompare(b.LabCode));
  }, [rows]);

  const [lab, setLab] = useState(labs[0]?.LabCode || '');
  const selected = labs.find((l) => l.LabCode === lab) || labs[0];
  const labRows = rows.filter((r) => r.LabCode === selected?.LabCode);

  // Grouped in the declared discipline order, so two labs' scopes read the
  // same way even when they declare different things.
  const grouped = DISCIPLINES
    .map((d) => [d, labRows.filter((r) => r.Discipline === d)])
    .filter(([, items]) => items.length > 0);

  const suspended = labRows.filter((r) => r.Status !== 'Current');
  const openLosses = losses.filter((l) => l.LabCode === selected?.LabCode && !l.RestoredDate);

  const labName = (labs.find((l) => l.LabCode === lab) || {}).LabCode;

  return (
    <ModulePage module={moduleByRoute('scopes')}>
      <div className="mb-5">
        <FilterChips
          options={labs.map((l) => ({ key: l.LabCode, label: l.LabCode, count: l.count }))}
          value={lab}
          onChange={setLab}
          allLabel="Every lab"
        />
      </div>

      {!selected ? (
        <Panel><EmptyState>No capability declared yet.</EmptyState></Panel>
      ) : (
        <>
          <Panel className="mb-5">
            <div className="grid divide-y divide-[var(--border-subtle)] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              <Stat label="Parameters declared" value={labRows.length} hint={`${grouped.length} disciplines`} />
              <Stat
                label="Suspended"
                value={suspended.length}
                tone={suspended.length ? 'fail' : 'pass'}
                hint={suspended.length ? suspended.map((s) => s.Parameter).join(', ') : 'All current'}
              />
              <Stat
                label="Open capability losses"
                value={openLosses.length}
                tone={openLosses.length ? 'evaluate' : 'pass'}
                hint={openLosses.length ? 'Reported and not yet restored' : 'Nothing outstanding'}
              />
            </div>
          </Panel>

          <Panel>
            <PanelHeader
              title={`Scope of competency — ${selected.LabCode}`}
              subtitle={`${selected.Site} · generated from ${labRows.length} declared parameters`}
              icon={ClipboardCheck}
              actions={
                <Button variant="ghost" disabled title="Renders the scope to PDF on the live site">
                  <Printer size={13} /> Generate
                </Button>
              }
            />

            {grouped.map(([discipline, items]) => (
              <div key={discipline}>
                <div className="muted border-b hairline bg-[var(--surface-sunken)] px-5 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.12em]">
                  {discipline}
                </div>
                <Table head={['Parameter / Equipment', 'Range', 'CMC (±)', 'Comments', 'Status']}>
                  {items.map((row) => (
                    <tr key={row.Id} className="hover:bg-ink-500/[0.03]">
                      <td className="px-5 py-2.5 font-medium">{row.Parameter}</td>
                      <td className="tnum px-5 py-2.5">{row.RangeText}</td>
                      <td className="tnum px-5 py-2.5">{row.CMC}</td>
                      <td className="muted px-5 py-2.5">{row.Comments || '—'}</td>
                      <td className="px-5 py-2.5">
                        <Badge tone={STATUS_TONE[row.Status]}>
                          {row.Status === 'Current'
                            ? <ShieldCheck size={11} />
                            : <ShieldAlert size={11} />}
                          {row.Status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </Table>
              </div>
            ))}

            <p className="muted border-t hairline px-5 py-3 text-[0.74rem] leading-relaxed">
              A suspended parameter stays on the scope rather than disappearing from it. A scope that
              silently loses a row cannot be told apart from one that never had it, and the
              corresponding entry under Loss of Capability is what carries the reason and the date.
            </p>
          </Panel>
        </>
      )}
    </ModulePage>
  );
}
