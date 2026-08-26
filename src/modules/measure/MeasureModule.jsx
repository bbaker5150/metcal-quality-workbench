import React from 'react';
import { Panel, PanelHeader, ComingSoon } from '../../shared/ui.jsx';
import ModulePage from '../../shared/ModulePage.jsx';
import { moduleByRoute } from '../../app/moduleRegistry.jsx';
import { useData } from '../../data/DataProvider.jsx';

// The constant blocks of a METER card for this program. They never vary
// between cards, which is exactly why they are worth automating — they are
// the fields most likely to be typed wrong at the end of a long job.
const FIXED = [
  ['Customer Code', 'NARRPTR'],
  ['Sub-Custodian', 'RRPT'],
  ['Servicing Label (Block 59)', 'NCR'],
  ['Next Due Date', 'Suppressed'],
];

export default function MeasureModule() {
  const { data, artifactById } = useData();
  const results = (data.ptResults || []).filter((r) => Number.isFinite(r.MeasureCardHours));
  const totalHours = results.reduce((sum, r) => sum + r.MeasureCardHours, 0);

  return (
    <ModulePage module={moduleByRoute('measure')}>
      <div className="mb-5 grid gap-5 lg:grid-cols-[1fr_20rem]">
        <Panel>
          <PanelHeader title="Cards ready to generate" subtitle={`${results.length} completed tests · ${totalHours.toFixed(1)} logged hours`} />
          <ul className="divide-y divide-[var(--border-subtle)]">
            {results.map((row) => {
              const artifact = artifactById(row.ArtifactId);
              return (
                <li key={row.Id} className="flex items-center gap-4 px-5 py-3 hover:bg-ink-500/[0.03]">
                  <div className="min-w-0 flex-1">
                    <p className="text-[0.85rem] font-medium">{artifact?.Title}</p>
                    <p className="muted mt-0.5 text-[0.76rem]">
                      <span className="font-mono">{artifact?.SerialNumber}</span> · {row.LabCode} · {row.StopDate}
                    </p>
                  </div>
                  <span className="tnum text-[0.82rem]">
                    {row.MeasureCardHours.toFixed(1)} <span className="muted">hrs</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </Panel>

        <Panel className="h-fit">
          <PanelHeader title="Fixed blocks" subtitle="Same on every card" />
          <dl className="px-5 py-4 text-[0.8rem]">
            {FIXED.map(([label, value]) => (
              <div key={label} className="flex items-baseline justify-between gap-4 py-1.5">
                <dt className="muted">{label}</dt>
                <dd className="font-mono font-medium">{value}</dd>
              </div>
            ))}
          </dl>
        </Panel>
      </div>

      <Panel>
        <PanelHeader title="Next up" subtitle="Still to build in this module" />
        <ComingSoon points={[
          'One-click card generator pre-populating the fixed blocks and dropping logged hours into Block 40.',
          'Printable card layout matching the Navy MEASURE METER form.',
          'Batch generation for every completed test in a rotation cycle.',
        ]} />
      </Panel>
    </ModulePage>
  );
}
