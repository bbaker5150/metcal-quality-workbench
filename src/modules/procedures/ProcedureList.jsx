import React from 'react';
import { ExternalLink, FileText, Info } from 'lucide-react';
import { Panel, PanelHeader, Badge, EmptyState } from '../../shared/ui.jsx';
import ModulePage from '../../shared/ModulePage.jsx';
import { moduleByRoute } from '../../app/moduleRegistry.jsx';
import { useData } from '../../data/DataProvider.jsx';

// Three tiles read one list, separated by Category. They differ in what they
// say around the list, not in how they render it, so the rendering lives here.

export default function ProcedureList({ route, category, intro, note }) {
  const { data } = useData();
  const items = (data.procedures || []).filter((p) => p.Category === category);

  return (
    <ModulePage module={moduleByRoute(route)}>
      {intro && (
        <Panel className="mb-5">
          <div className="px-5 py-4">
            <p className="muted text-[0.84rem] leading-relaxed">{intro}</p>
          </div>
        </Panel>
      )}

      <Panel>
        <PanelHeader title={category === 'Service Providers' ? 'Authorized list' : 'Procedures'} icon={FileText} />
        {items.length === 0 ? (
          <EmptyState>Nothing filed under this category yet.</EmptyState>
        ) : (
          <ul className="divide-y divide-[var(--border-subtle)]">
            {items.map((item, index) => (
              <li key={item.Id} className="flex gap-4 px-5 py-4 transition-colors hover:bg-ink-500/[0.03]">
                <span className="muted mt-0.5 shrink-0"><FileText size={16} strokeWidth={1.75} /></span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                    <h3 className="text-[0.87rem] font-medium">
                      {item.Title}
                      {items.length > 1 && !item.DocNumber && (
                        <span className="muted ml-2 font-normal">({index + 1} of {items.length})</span>
                      )}
                    </h3>
                    {item.DocNumber && <Badge tone="neutral">{item.DocNumber}</Badge>}
                  </div>
                  {item.Summary && (
                    <p className="muted mt-1 text-[0.8rem] leading-relaxed">{item.Summary}</p>
                  )}
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
                    // Deliberately not a dead link — a link that resolves to
                    // nothing is worse than a visible gap.
                    <span className="muted text-[0.74rem]">Not linked</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      {note && (
        <Panel className="mt-5">
          <div className="flex gap-3 px-5 py-4">
            <span className="mt-0.5 shrink-0 text-brass-600 dark:text-brass-400"><Info size={16} /></span>
            <p className="muted text-[0.82rem] leading-relaxed">{note}</p>
          </div>
        </Panel>
      )}
    </ModulePage>
  );
}
