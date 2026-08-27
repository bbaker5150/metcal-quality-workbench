import React from 'react';
import { ArrowRight } from 'lucide-react';
import { CATEGORIES, modulesInCategory } from './moduleRegistry.jsx';
import seal from '../assets/navair-seal-384.webp';
import NavButton from '../shared/NavButton.jsx';

/**
 * The launcher is the whole product to anyone opening it for the first time,
 * so it gets the space: one seal, then the two sides of the house.
 *
 * Each side leads with its dashboard, laid out wide and horizontally rather
 * than as a stretched card — a rollup is a different kind of thing from the
 * modules under it, and making it look like an oversized tile with dead space
 * on the right said the opposite.
 */
export default function HomeLauncher() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 pb-24 pt-12 sm:pt-16">
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
      </header>

      {CATEGORIES.map((category) => {
        const items = modulesInCategory(category.key);
        const lead = items.find((m) => m.dashboard);
        const rest = items.filter((m) => !m.dashboard);

        return (
          <section key={category.key} className="mt-14 first:mt-16">
            <div className="flex items-baseline gap-3 border-b hairline pb-3">
              <h2 className="text-[0.76rem] font-semibold uppercase tracking-[0.18em]">{category.key}</h2>
              <p className="muted text-[0.78rem]">{category.blurb}</p>
            </div>

            {lead && <LeadCard module={lead} />}

            <nav aria-label={`${category.key} modules`} className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((module, index) => (
                <ModuleCard key={module.id} module={module} index={index} />
              ))}
            </nav>
          </section>
        );
      })}
    </div>
  );
}

const accentOf = (accent) => ({
  text: accent === 'brass' ? 'text-brass-600 dark:text-brass-400' : 'text-signal-600 dark:text-signal-400',
  bg: accent === 'brass' ? 'bg-brass-500/10' : 'bg-signal-500/10',
});

function LeadCard({ module }) {
  const { icon: Icon, accent } = module;
  const a = accentOf(accent);
  return (
    <NavButton
      to={`/${module.route}`}
      className="group surface mt-4 flex w-full items-center gap-4 rounded-[var(--radius-card)] px-5 py-4 text-left transition-colors duration-200 hover:bg-ink-500/[0.03]"
    >
      <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${a.bg} ${a.text}`}>
        <Icon size={19} strokeWidth={1.75} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[0.92rem] font-semibold tracking-tight">{module.title}</span>
        <span className="muted mt-0.5 block text-[0.81rem] leading-relaxed">{module.blurb}</span>
      </span>
      <ArrowRight
        size={16}
        className="muted shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
      />
    </NavButton>
  );
}

function ModuleCard({ module, index }) {
  const { icon: Icon, accent } = module;
  const a = accentOf(accent);

  return (
    <NavButton
      to={`/${module.route}`}
      className="group surface flex h-full flex-col rounded-[var(--radius-card)] p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-ink-900/[0.06] dark:hover:shadow-black/30"
      style={{ animation: `rise 380ms cubic-bezier(.2,.7,.3,1) ${Math.min(index, 6) * 40}ms both` }}
    >
      <span className={`grid size-9 place-items-center rounded-lg ${a.bg} ${a.text}`}>
        <Icon size={17} strokeWidth={1.75} />
      </span>

      <h3 className="mt-3.5 text-[0.89rem] font-semibold tracking-tight">{module.title}</h3>
      <p className={`mt-0.5 text-[0.74rem] font-medium ${a.text}`}>{module.subtitle}</p>

      {/* Clamped so a long blurb cannot make one card twice the height of its
          neighbours. The full text is still the accessible name of the tile. */}
      <p className="muted mt-2.5 line-clamp-3 text-[0.8rem] leading-relaxed">{module.blurb}</p>
    </NavButton>
  );
}
