import React, { useState } from 'react';
import {
  MapPin, Car, BedDouble, UserRound, PlaneTakeoff,
  ShieldAlert, ShieldCheck, Shield,
} from 'lucide-react';
import { Panel, PanelHeader, Badge, Stat, EmptyState } from '../../shared/ui.jsx';
import ModulePage from '../../shared/ModulePage.jsx';
import { moduleByRoute } from '../../app/moduleRegistry.jsx';
import { useData } from '../../data/DataProvider.jsx';

// Where a course convenes and whether you are allowed to travel to it are one
// question asked twice. Somebody reading a check-in procedure is planning a
// trip, and the restriction that would stop the trip belongs on the same page
// rather than a tile away.

const TABS = [
  { key: 'locations', label: 'Locations' },
  { key: 'travel', label: 'Travel restrictions' },
];

const TRAVEL_TONE = { Open: 'pass', Restricted: 'fail', 'Approval required': 'evaluate' };
const TRAVEL_ICON = { Open: ShieldCheck, Restricted: ShieldAlert, 'Approval required': Shield };

export default function SchoolhouseModule() {
  const { data } = useData();
  const [tab, setTab] = useState('locations');

  const houses = data.schoolhouses || [];
  const courses = data.courses || [];
  const restrictions = data.travelRestrictions || [];
  const gated = restrictions.filter((r) => r.Status !== 'Open');

  return (
    <ModulePage module={moduleByRoute('schoolhouses')}>
      <nav className="hairline mb-5 inline-flex rounded-lg border p-0.5" aria-label="Schoolhouse views">
        {TABS.map((t) => {
          const active = tab === t.key;
          const badge = t.key === 'travel' ? gated.length : 0;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              aria-current={active ? 'page' : undefined}
              className={`rounded-md px-3 py-1.5 text-[0.79rem] font-medium transition-colors ${
                active ? 'bg-signal-600 text-white' : 'muted hover:text-ink-800 dark:hover:text-ink-100'
              }`}
            >
              {t.label}
              {badge > 0 && (
                <span className={`tnum ml-1.5 ${active ? 'text-white/70' : 'text-evaluate-600 dark:text-evaluate-400'}`}>
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {tab === 'locations' && (
        houses.length === 0 ? (
          <Panel><EmptyState>No schoolhouses on file.</EmptyState></Panel>
        ) : (
          <div className="space-y-5">
            {houses.map((house) => {
              const taught = courses.filter((c) => c.Schoolhouse === house.Name);
              const vendor = house.Name.startsWith('Vendor');
              return (
                <Panel key={house.Id}>
                  <PanelHeader
                    title={house.Name}
                    subtitle={`${house.City} · ${house.Building}`}
                    icon={MapPin}
                    actions={<Badge tone={vendor ? 'brass' : 'signal'}>{vendor ? 'Vendor' : 'Navy'}</Badge>}
                  />
                  <div className="px-5 py-4">
                    <h3 className="muted text-[0.78rem] font-semibold uppercase tracking-[0.1em]">Check-in</h3>
                    <p className="mt-1.5 text-[0.85rem] leading-relaxed">{house.CheckInProcedure}</p>
                  </div>
                  <div className="grid gap-px border-t hairline bg-[var(--border-subtle)] sm:grid-cols-3">
                    <div className="bg-[var(--surface-raised)] px-5 py-3">
                      <p className="muted flex items-center gap-1.5 text-[0.72rem] font-medium uppercase tracking-[0.1em]">
                        <UserRound size={12} /> Point of contact
                      </p>
                      <p className="mt-1 text-[0.82rem]">{house.PocRole}</p>
                    </div>
                    <div className="bg-[var(--surface-raised)] px-5 py-3">
                      <p className="muted flex items-center gap-1.5 text-[0.72rem] font-medium uppercase tracking-[0.1em]">
                        <Car size={12} /> Parking
                      </p>
                      <p className="mt-1 text-[0.82rem]">{house.Parking}</p>
                    </div>
                    <div className="bg-[var(--surface-raised)] px-5 py-3">
                      <p className="muted flex items-center gap-1.5 text-[0.72rem] font-medium uppercase tracking-[0.1em]">
                        <BedDouble size={12} /> Lodging
                      </p>
                      <p className="mt-1 text-[0.82rem]">{house.LodgingNote}</p>
                    </div>
                  </div>
                  {taught.length > 0 && (
                    <div className="muted border-t hairline px-5 py-2.5 text-[0.76rem]">
                      Courses here: {taught.map((c) => c.CourseCode).join(', ')}
                      {vendor && gated.length > 0 && (
                        <span className="ml-2 text-evaluate-600 dark:text-evaluate-400">
                          · vendor travel is gated — see Travel restrictions
                        </span>
                      )}
                    </div>
                  )}
                </Panel>
              );
            })}
          </div>
        )
      )}

      {tab === 'travel' && (
        <>
          <Panel className="mb-5">
            <div className="grid divide-y divide-[var(--border-subtle)] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              <Stat label="Categories" value={restrictions.length} hint="Travel types tracked" />
              <Stat
                label="Restricted or gated"
                value={gated.length}
                tone={gated.length ? 'evaluate' : 'pass'}
                hint="Need approval before a quota request"
              />
              <Stat label="Open" value={restrictions.length - gated.length} tone="pass" hint="Approved at site level" />
            </div>
          </Panel>

          <Panel>
            <PanelHeader
              title="Current restrictions"
              subtitle="What each covers, and on whose authority"
              icon={PlaneTakeoff}
            />
            {restrictions.length === 0 ? (
              <EmptyState>No restrictions on file.</EmptyState>
            ) : (
              <ul className="divide-y divide-[var(--border-subtle)]">
                {restrictions.map((row) => {
                  const Icon = TRAVEL_ICON[row.Status] || Shield;
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
                          <Badge tone={TRAVEL_TONE[row.Status]}>{row.Status}</Badge>
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
        </>
      )}
    </ModulePage>
  );
}
