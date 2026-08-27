import React from 'react';
import { FileSignature, CheckCircle2, CircleDashed } from 'lucide-react';
import { Panel, PanelHeader, Badge, Stat, EmptyState } from '../../shared/ui.jsx';
import ModulePage from '../../shared/ModulePage.jsx';
import { moduleByRoute } from '../../app/moduleRegistry.jsx';
import { useData } from '../../data/DataProvider.jsx';
import { SITES } from '../../data/listSchema.js';

const STATUS_TONE = { Signed: 'pass', 'In routing': 'evaluate', Superseded: 'neutral' };

export default function AnnualLtrModule() {
  const { data } = useData();
  const letters = [...(data.annualLtr || [])].sort((a, b) => b.FiscalYear.localeCompare(a.FiscalYear));
  const current = letters.find((l) => l.Status === 'Signed');

  const acknowledged = new Set((current?.AcknowledgedSites || '').split(',').map((s) => s.trim()).filter(Boolean));
  const outstanding = SITES.filter((s) => !acknowledged.has(s));

  return (
    <ModulePage module={moduleByRoute('annual-ltr')}>
      {current && (
        <Panel className="mb-5">
          <div className="grid divide-y divide-[var(--border-subtle)] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            <Stat label="In effect" value={current.FiscalYear} hint={current.Serial} />
            <Stat label="Sites acknowledged" value={`${acknowledged.size}/${SITES.length}`} tone={outstanding.length ? 'evaluate' : 'pass'} hint={outstanding.length ? `Outstanding: ${outstanding.join(', ')}` : 'All sites in'} />
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
              const ack = new Set((letter.AcknowledgedSites || '').split(',').map((s) => s.trim()).filter(Boolean));
              return (
                <li key={letter.Id} className="px-5 py-4">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h3 className="text-[0.9rem] font-semibold">{letter.FiscalYear}</h3>
                    <Badge tone={STATUS_TONE[letter.Status]}>{letter.Status}</Badge>
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
    </ModulePage>
  );
}
