import React from 'react';
import { MapPin, Car, BedDouble, UserRound } from 'lucide-react';
import { Panel, PanelHeader, Badge, EmptyState } from '../../shared/ui.jsx';
import ModulePage from '../../shared/ModulePage.jsx';
import { moduleByRoute } from '../../app/moduleRegistry.jsx';
import { useData } from '../../data/DataProvider.jsx';

export default function SchoolhouseModule() {
  const { data } = useData();
  const houses = data.schoolhouses || [];
  const courses = data.courses || [];

  return (
    <ModulePage module={moduleByRoute('schoolhouses')}>
      {houses.length === 0 ? (
        <Panel><EmptyState>No schoolhouses on file.</EmptyState></Panel>
      ) : (
        <div className="space-y-5">
          {houses.map((house) => {
            const taught = courses.filter((c) => c.Schoolhouse === house.Name);
            return (
              <Panel key={house.Id}>
                <PanelHeader
                  title={house.Name}
                  subtitle={`${house.City} · ${house.Building}`}
                  icon={MapPin}
                  actions={<Badge tone={house.Name.startsWith('Vendor') ? 'brass' : 'signal'}>
                    {house.Name.startsWith('Vendor') ? 'Vendor' : 'Navy'}
                  </Badge>}
                />
                <div className="px-5 py-4">
                  <h3 className="text-[0.78rem] font-semibold uppercase tracking-[0.1em] muted">Check-in</h3>
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
                  </div>
                )}
              </Panel>
            );
          })}
        </div>
      )}
    </ModulePage>
  );
}
