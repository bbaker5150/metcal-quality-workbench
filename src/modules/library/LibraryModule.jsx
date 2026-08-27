import React, { useMemo, useState } from 'react';
import { Library, Search, ExternalLink, FileText, Link2 } from 'lucide-react';
import { Panel, PanelHeader, Badge, FilterChips, EmptyState } from '../../shared/ui.jsx';
import ModulePage from '../../shared/ModulePage.jsx';
import { moduleByRoute } from '../../app/moduleRegistry.jsx';
import { useData } from '../../data/DataProvider.jsx';
import { MEASUREMENT_AREAS } from '../../data/listSchema.js';

const CATEGORY_TONE = {
  Instruction: 'signal',
  SOP: 'brass',
  Template: 'neutral',
  Guide: 'neutral',
  Training: 'pass',
};

export default function LibraryModule() {
  const { data } = useData();
  const [area, setArea] = useState('');
  const [category, setCategory] = useState('');
  const [query, setQuery] = useState('');

  const docs = data.trainingDocs || [];

  const categories = useMemo(
    () => [...new Set(docs.map((d) => d.Category))].sort(),
    [docs],
  );

  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return docs.filter((doc) => {
      if (area && doc.MeasurementArea !== area) return false;
      if (category && doc.Category !== category) return false;
      if (!needle) return true;
      return [doc.Title, doc.DocNumber, doc.Summary, doc.MeasurementArea]
        .some((field) => String(field || '').toLowerCase().includes(needle));
    });
  }, [docs, area, category, query]);

  // Grouped by measurement area, because that is how the document asks for it
  // and how a lab actually looks: mine first, everyone else's never.
  const grouped = useMemo(() => {
    const order = [...MEASUREMENT_AREAS, 'Other'];
    const buckets = new Map(order.map((name) => [name, []]));
    for (const doc of matches) {
      const key = buckets.has(doc.MeasurementArea) ? doc.MeasurementArea : 'Other';
      buckets.get(key).push(doc);
    }
    return order
      .map((name) => [name, buckets.get(name)])
      .filter(([, items]) => items.length > 0);
  }, [matches]);

  const areaOptions = MEASUREMENT_AREAS
    .map((name) => ({ key: name, label: name, count: docs.filter((d) => d.MeasurementArea === name).length }))
    .filter((o) => o.count > 0);

  const categoryOptions = categories.map((name) => ({
    key: name,
    label: name,
    count: docs.filter((d) => d.Category === name).length,
  }));

  return (
    <ModulePage module={moduleByRoute('library')}>
      <Panel className="mb-5">
        <div className="space-y-3 px-5 py-4">
          <label className="hairline flex items-center gap-2 rounded-lg border px-3 py-2">
            <Search size={15} className="muted shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search titles, document numbers, and summaries"
              className="w-full bg-transparent text-[0.84rem] outline-none placeholder:text-[var(--text-muted)]"
              aria-label="Search the library"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="muted shrink-0 text-[0.75rem] hover:text-ink-800 dark:hover:text-ink-100"
              >
                Clear
              </button>
            )}
          </label>
          <FilterChips options={areaOptions} value={area} onChange={setArea} allLabel="All areas" />
          <FilterChips options={categoryOptions} value={category} onChange={setCategory} allLabel="All types" />
        </div>
      </Panel>

      <Refs items={data.trainingRefs || []} />

      <p className="muted mb-4 text-[0.8rem]">
        {matches.length} of {docs.length} document{docs.length === 1 ? '' : 's'}
      </p>

      {grouped.length === 0 ? (
        <Panel>
          <EmptyState>Nothing matches those filters.</EmptyState>
        </Panel>
      ) : (
        grouped.map(([areaName, items]) => (
          <Panel key={areaName} className="mb-5">
            <PanelHeader
              title={areaName}
              subtitle={`${items.length} document${items.length === 1 ? '' : 's'}`}
              icon={Library}
            />
            <ul className="divide-y divide-[var(--border-subtle)]">
              {items.map((doc) => (
                <li key={doc.Id} className="flex gap-4 px-5 py-3.5 transition-colors hover:bg-ink-500/[0.03]">
                  <span className="muted mt-0.5 shrink-0">
                    <FileText size={16} strokeWidth={1.75} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                      <h3 className="text-[0.87rem] font-medium">{doc.Title}</h3>
                      <Badge tone={CATEGORY_TONE[doc.Category]}>{doc.Category}</Badge>
                    </div>
                    {doc.Summary && (
                      <p className="muted mt-1 text-[0.8rem] leading-relaxed">{doc.Summary}</p>
                    )}
                    <p className="muted mt-1.5 flex flex-wrap items-center gap-x-3 text-[0.74rem]">
                      <span className="font-mono">{doc.DocNumber}</span>
                      <span>{doc.Version}</span>
                      <span className="tnum">Updated {doc.UpdatedOn}</span>
                    </p>
                  </div>
                  <span className="shrink-0 self-center">
                    {doc.ResourceUrl ? (
                      <a
                        href={doc.ResourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-[0.78rem] font-medium text-signal-600 hover:underline dark:text-signal-400"
                      >
                        Open <ExternalLink size={12} />
                      </a>
                    ) : (
                      // Deliberately not a dead link. On the live site these
                      // resolve into the document library; showing a link that
                      // goes nowhere is worse than showing none.
                      <span className="muted text-[0.74rem]">Not linked</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </Panel>
        ))
      )}
    </ModulePage>
  );
}

// CANTRAC and the program references sit above the document library rather
// than inside it: they are where you go to find out what exists, not documents
// filed by measurement area.
function Refs({ items }) {
  if (items.length === 0) return null;
  const links = items.filter((i) => i.Category === 'Link');
  const refs = items.filter((i) => i.Category !== 'Link');
  return (
    <Panel className="mb-5">
      <PanelHeader title="Links and references" subtitle="CANTRAC, MEASURE, and the program references" icon={Link2} />
      <ul className="divide-y divide-[var(--border-subtle)]">
        {[...links, ...refs].map((item) => (
          <li key={item.Id} className="flex items-center gap-4 px-5 py-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-2.5">
                <h3 className="text-[0.85rem] font-medium">{item.Title}</h3>
                <Badge tone={item.Category === 'Link' ? 'signal' : 'neutral'}>{item.Category}</Badge>
              </div>
              <p className="muted mt-0.5 text-[0.79rem] leading-relaxed">{item.Summary}</p>
            </div>
            <span className="shrink-0">
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
    </Panel>
  );
}
