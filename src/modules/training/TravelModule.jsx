import React from 'react';
import { PlaneTakeoff, ShieldAlert, ShieldCheck, Shield } from 'lucide-react';
import { Panel, PanelHeader, Badge, Stat, EmptyState } from '../../shared/ui.jsx';
import ModulePage from '../../shared/ModulePage.jsx';
import { moduleByRoute } from '../../app/moduleRegistry.jsx';
import { useData } from '../../data/DataProvider.jsx';

const TONE = { Open: 'pass', Restricted: 'fail', 'Approval required': 'evaluate' };
const ICON = { Open: ShieldCheck, Restricted: ShieldAlert, 'Approval required': Shield };

export default function TravelModule() {
  const { data } = useData();
  const rows = data.travelRestrictions || [];
  const restricted = rows.filter((r) => r.Status !== 'Open');

  return (
    <ModulePage module={moduleByRoute('travel')}>
      <Panel className="mb-5">
        <div className="grid divide-y divide-[var(--border-subtle)] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <Stat label="Categories" value={rows.length} hint="Travel types tracked" />
          <Stat label="Restricted or gated" value={restricted.length} tone={restricted.length ? 'evaluate' : 'pass'} hint="Need approval before a quota request" />
          <Stat label="Open" value={rows.length - restricted.length} tone="pass" hint="Approved at site level" />
        </div>
      </Panel>

      <Panel>
        <PanelHeader title="Current restrictions" subtitle="What each covers, and on whose authority" icon={PlaneTakeoff} />
        {rows.length === 0 ? (
          <EmptyState>No restrictions on file.</EmptyState>
        ) : (
          <ul className="divide-y divide-[var(--border-subtle)]">
            {rows.map((row) => {
              const Icon = ICON[row.Status] || Shield;
              return (
                <li key={row.Id} className="flex gap-4 px-5 py-4">
                  <span className={`mt-0.5 shrink-0 ${
                    row.Status === 'Open' ? 'text-pass-600 dark:text-pass-400'
                      : row.Status === 'Restricted' ? 'text-fail-600 dark:text-fail-400'
                      : 'text-evaluate-600 dark:text-evaluate-400'}`}
                  >
                    <Icon size={17} strokeWidth={1.75} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                      <h3 className="text-[0.88rem] font-medium">{row.Scope}</h3>
                      <Badge tone={TONE[row.Status]}>{row.Status}</Badge>
                    </div>
                    <p className="muted mt-1 text-[0.82rem] leading-relaxed">{row.Detail}</p>
                    <p className="muted mt-1.5 text-[0.74rem]">
                      <span className="tnum">Effective {row.EffectiveFrom}</span> · {row.Authority}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </ModulePage>
  );
}
