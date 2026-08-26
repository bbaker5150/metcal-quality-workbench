import React from 'react';
import { Moon, Sun, Database, HardDrive } from 'lucide-react';
import { useTheme } from '../shared/ThemeContext.jsx';
import { useData } from '../data/DataProvider.jsx';
import seal from '../assets/navair-seal-384.webp';
import NavButton from '../shared/NavButton.jsx';

// Two ends and nothing between them: the seal home on the left, the data
// source and theme on the right. Module tabs used to sit in the middle, but
// every module page already carries an "All modules" control, so the tabs were
// a second way to do the same thing occupying the widest part of the bar.

export default function TopBar() {
  const { theme, toggle } = useTheme();
  const { source } = useData();
  const live = source === 'sharepoint';

  return (
    <header className="sticky top-0 z-30 border-b hairline bg-[var(--surface)]/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center px-6">
        <NavButton to="/" className="flex shrink-0 items-center gap-2.5" aria-label="Home">
          <img src={seal} alt="" width="26" height="26" className="size-[26px]" />
          <span className="hidden text-[0.82rem] font-semibold tracking-tight sm:block">
            METCAL <span className="muted font-normal">Quality</span>
          </span>
        </NavButton>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <span
            className="muted hidden items-center gap-1.5 text-[0.72rem] sm:flex"
            title={
              live
                ? 'Reading live SharePoint lists'
                : 'Reading the built-in mock dataset'
            }
          >
            {live ? <Database size={13} /> : <HardDrive size={13} />}
            {live ? 'Live' : 'Mock'}
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
