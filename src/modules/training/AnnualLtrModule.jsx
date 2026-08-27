import React, { useState } from 'react';
import ModulePage from '../../shared/ModulePage.jsx';
import { moduleByRoute } from '../../app/moduleRegistry.jsx';
import {
  LetterPanel, ConfirmationPanel, CalendarPanel, NoticePanel, AutoSchedulePanel,
  useTrainingCounts,
} from './panels.jsx';

// The annual scheduling letter and everything it sets in motion, in one module.
//
// They were three tiles and are now three views, because they are one workflow
// read at different depths: the letter sets the requirement and the quotas, the
// by-name sheet says who is going, and the schedule says when. The same
// enrollment rows sit behind all of them — which is what stops a name being
// confirmed on the sheet and pending on the calendar.

const TABS = [
  { key: 'letter', label: 'Letter' },
  { key: 'confirmation', label: 'By-name confirmation', count: (c) => c.unconfirmed },
  { key: 'schedule', label: 'Schedule' },
  { key: 'notice', label: 'Instructor notice', count: (c) => c.awaitingNotice },
  { key: 'auto', label: 'Auto-schedule' },
];

export default function AnnualLtrModule() {
  const [tab, setTab] = useState('letter');
  const counts = useTrainingCounts();

  return (
    <ModulePage module={moduleByRoute('annual-ltr')}>
      <nav className="hairline mb-5 inline-flex flex-wrap rounded-lg border p-0.5" aria-label="Training views">
        {TABS.map((t) => {
          const badge = t.count ? t.count(counts) : 0;
          const active = tab === t.key;
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

      {tab === 'letter' && <LetterPanel />}
      {tab === 'confirmation' && <ConfirmationPanel />}
      {tab === 'schedule' && <CalendarPanel />}
      {tab === 'notice' && <NoticePanel />}
      {tab === 'auto' && <AutoSchedulePanel />}
    </ModulePage>
  );
}
