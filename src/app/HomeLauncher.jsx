import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import modules, { CATEGORIES, modulesInCategory } from './moduleRegistry.jsx';
import seal from '../assets/navair-seal-384.webp';
import { useData } from '../data/DataProvider.jsx';
import NavButton from '../shared/NavButton.jsx';

/**
 * The launcher is the whole product to anyone opening it for the first time,
 * so it gets the space. One seal, then the two sides of the house.
 */
export default function HomeLauncher() {
  const { source, counts } = useData();

  return (
    <div className="mx-auto w-full max-w-6xl px-6 pb-20 pt-10 sm:pt-14">
      <header className="flex flex-col items-center text-center">
        <div className="relative">
          {/* A soft halo rather than a hard border — the seal has its own
              edge and a ring around it reads as a second, competing one. */}
          <div
            aria-hidden
            className="absolute inset-0 -z-10 scale-[1.6] rounded-full blur-2xl"
            style={{ background: 'var(--halo)' }}
          />
          <img src={seal} alt="" width="112" height="112" className="size-24 sm:size-28 drop-shadow-sm" />
        </div>

        <p className="mt-6 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-brass-600 dark:text-brass-400">
          NAVAIR&nbsp;&middot;&nbsp;METCAL
        </p>
        <h1 className="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          Quality &amp; Training Portal
        </h1>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[0.75rem]">
          <span className="flex items-center gap-1.5">
            <span className={`size-1.5 rounded-full ${source === 'sharepoint' ? 'bg-pass-600' : 'bg-brass-500'}`} />
            <span className="muted">{source === 'sharepoint' ? 'SharePoint lists' : 'Mock data'}</span>
          </span>
          <span className="muted tnum">{modules.length} modules</span>
          <span className="muted tnum">{counts.artifacts} artifacts</span>
          <span className="muted tnum">{counts.sites} sites</span>
        </div>
      </header>

      <div
        aria-hidden
        className="mx-auto mt-10 h-px max-w-xs bg-gradient-to-r from-transparent via-brass-500/40 to-transparent"
      />

      {CATEGORIES.map((category, section) => {
        const items = modulesInCategory(category.key);
        return (
          <section key={category.key} className="mt-11">
            <div className="mb-4 flex items-baseline gap-3">
              <h2 className="text-[0.78rem] font-semibold uppercase tracking-[0.18em]">{category.key}</h2>
              <p className="muted text-[0.78rem]">{category.blurb}</p>
            </div>
            <nav aria-label={`${category.key} modules`} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((module, index) => (
                <ModuleCard key={module.id} module={module} index={section * 4 + index} />
              ))}
            </nav>
          </section>
        );
      })}
    </div>
  );
}

function ModuleCard({ module, index }) {
  const { icon: Icon, accent, dashboard } = module;
  const accentText = accent === 'brass' ? 'text-brass-600 dark:text-brass-400' : 'text-signal-600 dark:text-signal-400';
  const accentBg = accent === 'brass' ? 'bg-brass-500/10' : 'bg-signal-500/10';
  const accentRule = accent === 'brass' ? 'via-brass-500/50' : 'via-signal-500/50';

  return (
    <NavButton
      to={`/${module.route}`}
      className={`group surface relative flex flex-col overflow-hidden rounded-[var(--radius-card)] p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-ink-900/[0.06] dark:hover:shadow-black/30 ${
        // The rollup is where you start, so it gets the full width of the row
        // on wide screens rather than being one tile among many.
        dashboard ? 'sm:col-span-2 lg:col-span-3' : ''
      }`}
      style={{ animation: `rise 420ms cubic-bezier(.2,.7,.3,1) ${Math.min(index, 8) * 45}ms both` }}
    >
      {/* The accent only appears on hover, so the grid reads as one calm
          surface at rest rather than a wall of competing tiles. */}
      <span
        aria-hidden
        className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent ${accentRule} to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100`}
      />

      <div className="flex items-start justify-between gap-3">
        <span className={`grid size-10 place-items-center rounded-xl ${accentBg} ${accentText}`}>
          <Icon size={19} strokeWidth={1.75} />
        </span>
        <ArrowUpRight
          size={16}
          className="muted -translate-x-1 translate-y-1 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100"
        />
      </div>

      <h3 className="mt-4 text-[0.95rem] font-semibold tracking-tight">{module.title}</h3>
      <p className={`mt-0.5 text-[0.76rem] font-medium ${accentText}`}>{module.subtitle}</p>
      <p className="muted mt-3 text-[0.82rem] leading-relaxed">{module.blurb}</p>
    </NavButton>
  );
}
