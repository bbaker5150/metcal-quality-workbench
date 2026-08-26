import React, { useMemo, useState } from 'react';
import { FileText, Search } from 'lucide-react';
import { Panel, PanelHeader, Badge, ComingSoon, Button } from '../../shared/ui.jsx';
import ModulePage from '../../shared/ModulePage.jsx';
import { moduleByRoute } from '../../app/moduleRegistry.jsx';
import { MEASUREMENT_AREAS } from '../../data/listSchema.js';
import { useData } from '../../data/DataProvider.jsx';

export default function TrainingModule() {
  const { data } = useData();
  const [area, setArea] = useState('All');
  const [query, setQuery] = useState('');

  const docs = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return (data.trainingDocs || []).filter((doc) => {
      if (area !== 'All' && doc.MeasurementArea !== area) return false;
      if (!needle) return true;
      return `${doc.Title} ${doc.DocNumber} ${doc.Category}`.toLowerCase().includes(needle);
    });
  }, [data.trainingDocs, area, query]);

  return (
    <ModulePage module={moduleByRoute('training')}>
      <Panel className="mb-5">
        <PanelHeader
          title="Discipline hub"
          subtitle={`${docs.length} of ${(data.trainingDocs || []).length} documents`}
          actions={
            <div className="relative">
              <Search size={14} className="muted pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search…"
                aria-label="Search the library"
                className="hairline w-44 rounded-lg border bg-transparent py-1.5 pl-8 pr-3 text-[0.8rem] outline-none placeholder:text-[var(--text-muted)]"
              />
            </div>
          }
        />
        <div className="flex flex-wrap gap-1.5 border-b hairline px-5 py-3">
          {['All', ...MEASUREMENT_AREAS].map((option) => (
            <Button
              key={option}
              variant={area === option ? 'primary' : 'ghost'}
              onClick={() => setArea(option)}
              className="!py-1 !text-[0.75rem]"
            >
              {option}
            </Button>
          ))}
        </div>
        <ul className="divide-y divide-[var(--border-subtle)]">
          {docs.map((doc) => (
            <li key={doc.Id} className="flex items-start gap-3 px-5 py-3 hover:bg-ink-500/[0.03]">
              <span className="muted mt-0.5"><FileText size={16} /></span>
              <div className="min-w-0 flex-1">
                <p className="text-[0.85rem] font-medium">{doc.Title}</p>
                <p className="muted mt-0.5 text-[0.76rem]">
                  <span className="font-mono">{doc.DocNumber}</span> · {doc.Version} · {doc.MeasurementArea}
                </p>
              </div>
              <Badge tone="neutral">{doc.Category}</Badge>
            </li>
          ))}
          {!docs.length && <li className="muted px-5 py-8 text-center text-[0.83rem]">No documents match.</li>}
        </ul>
      </Panel>

      <Panel>
        <PanelHeader title="Next up" subtitle="Still to build in this module" />
        <ComingSoon points={[
          'Resource links resolving to the document library, so each entry opens the actual PDF or Excel template.',
          'Per-discipline landing pages with the procedure set a new metrologist works through in order.',
          'METCAL advisory feed alongside the static library.',
        ]} />
      </Panel>
    </ModulePage>
  );
}
