import React from 'react';
import { useLocation } from 'react-router';
import { Moon, Sun, Database, HardDrive } from 'lucide-react';
import modules from './moduleRegistry.jsx';
import { useTheme } from '../shared/ThemeContext.jsx';
import { useData } from '../data/DataProvider.jsx';
import seal from '../assets/navair-seal-384.webp';
import NavButton, { useIsActive } from '../shared/NavButton.jsx';

export default function TopBar() {
  const { theme, toggle } = useTheme();
  const { source } = useData();
  const onHome = useLocation().pathname === '/';

  return (
    <header className="sticky top-0 z-30 border-b hairline bg-[var(--surface)]/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-4 px-6">
        <NavButton to="/" className="flex shrink-0 items-center gap-2.5" aria-label="Home">
          <img src={seal} alt="" width="26" height="26" className="size-[26px]" />
          <span className="hidden text-[0.82rem] font-semibold tracking-tight sm:block">
            METCAL <span className="muted font-normal">Quality</span>
          </span>
        </NavButton>

        {/* The module tabs are only useful once you are inside one; on the
            launcher the cards already are the navigation. */}
        {!onHome && (
          <nav className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto" aria-label="Modules">
            {modules.map((module) => (
              <ModuleTab key={module.id} module={module} />
            ))}
          </nav>
        )}

        <div className={`flex items-center gap-2 ${onHome ? 'ml-auto' : ''}`}>
          <span
            className="muted hidden items-center gap-1.5 text-[0.72rem] sm:flex"
            title={
              source === 'sharepoint'
                ? 'Reading live SharePoint lists'
                : 'Reading the built-in sample dataset'
            }
          >
            {source === 'sharepoint' ? <Database size={13} /> : <HardDrive size={13} />}
            {source === 'sharepoint' ? 'Live' : 'Sample'}
          </span>
          <button
            type="button"
            onClick={toggle}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="grid size-8 place-items-center rounded-lg border hairline transition-colors hover:bg-ink-500/[0.06]"
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </div>
    </header>
  );
}

function ModuleTab({ module }) {
  const route = `/${module.route}`;
  const active = useIsActive(route);
  return (
    <NavButton
      to={route}
      aria-current={active ? 'page' : undefined}
      className={`shrink-0 rounded-lg px-2.5 py-1.5 text-[0.78rem] font-medium transition-colors ${
        active
          ? 'bg-signal-500/10 text-signal-700 dark:text-signal-300'
          : 'muted hover:text-ink-800 dark:hover:text-ink-100'
      }`}
    >
      {module.title}
    </NavButton>
  );
}
