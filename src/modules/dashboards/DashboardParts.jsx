import React from 'react';
import { useNavigate } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { Panel, PanelHeader, Badge } from '../../shared/ui.jsx';

// A dashboard tile is a number plus the reason it matters plus a way to act on
// it. Without the third part it is decoration — every count here routes into
// the module that can do something about it.

export function MetricCard({ label, value, unit, tone = 'neutral', detail, to, action }) {
  const navigate = useNavigate();
  const toneText = {
    pass: 'text-pass-600 dark:text-pass-400',
    evaluate: 'text-evaluate-600 dark:text-evaluate-400',
    fail: 'text-fail-600 dark:text-fail-400',
    neutral: '',
  }[tone];

  return (
    <button
      type="button"
      onClick={() => navigate(to)}
      className="group surface flex flex-col rounded-[var(--radius-card)] p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-ink-900/[0.06] dark:hover:shadow-black/30"
    >
      <p className="muted text-[0.7rem] font-medium uppercase tracking-[0.12em]">{label}</p>
      <p className={`tnum mt-1.5 text-3xl font-semibold tracking-tight ${toneText}`}>
        {value}
        {unit && <span className="muted ml-1 text-sm font-normal">{unit}</span>}
      </p>
      {detail && <p className="muted mt-1.5 flex-1 text-[0.76rem] leading-relaxed">{detail}</p>}
      <span className="muted mt-3 inline-flex items-center gap-1 text-[0.74rem] font-medium transition-colors group-hover:text-signal-600 dark:group-hover:text-signal-400">
        {action} <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
      </span>
    </button>
  );
}

export function AttentionList({ title, subtitle, icon, items, empty }) {
  const navigate = useNavigate();
  return (
    <Panel>
      <PanelHeader title={title} subtitle={subtitle} icon={icon} />
      {items.length === 0 ? (
        <p className="muted px-5 py-6 text-center text-[0.83rem]">{empty}</p>
      ) : (
        <ul className="divide-y divide-[var(--border-subtle)]">
          {items.map((item) => (
            <li key={item.key}>
              <button
                type="button"
                onClick={() => navigate(item.to)}
                className="flex w-full items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-ink-500/[0.03]"
              >
                <Badge tone={item.tone}>{item.badge}</Badge>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[0.84rem]">{item.label}</span>
                  {item.detail && <span className="muted block truncate text-[0.76rem]">{item.detail}</span>}
                </span>
                <ArrowRight size={13} className="muted shrink-0" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

export function Section({ title, children }) {
  return (
    <section className="mb-7">
      <h2 className="muted mb-3 text-[0.72rem] font-semibold uppercase tracking-[0.16em]">{title}</h2>
      {children}
    </section>
  );
}
