import React from 'react';

/** Card surface used for every panel in the app. */
export function Panel({ className = '', children, ...rest }) {
  return (
    <div
      className={`surface rounded-[var(--radius-card)] shadow-sm shadow-ink-900/[0.03] dark:shadow-black/20 ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

export function PanelHeader({ title, subtitle, icon: Icon, actions }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b hairline px-5 py-4">
      <div className="flex items-start gap-3 min-w-0">
        {Icon && (
          <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg bg-signal-500/10 text-signal-600 dark:text-signal-400">
            <Icon size={18} strokeWidth={1.75} />
          </span>
        )}
        <div className="min-w-0">
          <h2 className="truncate text-[0.95rem] font-semibold tracking-tight">{title}</h2>
          {subtitle && <p className="muted mt-0.5 truncate text-[0.8rem]">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

/**
 * Evaluation tier badge. The three tiers are the QA engine's own vocabulary —
 * |z| <= 2 PASS, 2 < |z| < 3 EVALUATE, |z| >= 3 FAIL — so the colours are
 * fixed here rather than passed in, and mean the same thing everywhere.
 */
const TONES = {
  pass: 'bg-pass-600/12 text-pass-600 ring-pass-600/25 dark:text-pass-400 dark:ring-pass-400/25',
  evaluate: 'bg-evaluate-600/12 text-evaluate-600 ring-evaluate-600/25 dark:text-evaluate-400 dark:ring-evaluate-400/25',
  fail: 'bg-fail-600/12 text-fail-600 ring-fail-600/25 dark:text-fail-400 dark:ring-fail-400/25',
  neutral: 'bg-ink-500/10 text-ink-600 ring-ink-500/20 dark:text-ink-300 dark:ring-ink-400/20',
  signal: 'bg-signal-600/12 text-signal-600 ring-signal-600/25 dark:text-signal-400 dark:ring-signal-400/25',
  brass: 'bg-brass-600/15 text-brass-600 ring-brass-600/30 dark:text-brass-400 dark:ring-brass-400/30',
};

export function Badge({ tone = 'neutral', children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[0.7rem] font-medium tracking-wide uppercase ring-1 ring-inset ${TONES[tone] || TONES.neutral} ${className}`}
    >
      {children}
    </span>
  );
}

export function Button({ variant = 'ghost', className = '', children, ...rest }) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-lg px-3 py-1.5 text-[0.8rem] font-medium transition-colors disabled:opacity-40 disabled:pointer-events-none';
  const variants = {
    primary: 'bg-signal-600 text-white hover:bg-signal-700 shadow-sm',
    ghost: 'hairline border text-ink-700 hover:bg-ink-500/[0.06] dark:text-ink-200',
    quiet: 'muted hover:text-ink-800 dark:hover:text-ink-100',
  };
  return (
    <button type="button" className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
}

/** A labelled number. The unit is separated so the figure stays the loud part. */
export function Stat({ label, value, unit, tone, hint }) {
  const toneText = tone ? (TONES[tone] || '').split(' ').find((c) => c.startsWith('text-')) : '';
  return (
    <div className="px-5 py-4">
      <p className="muted text-[0.7rem] font-medium uppercase tracking-[0.12em]">{label}</p>
      <p className={`tnum mt-1.5 text-2xl font-semibold tracking-tight ${toneText || ''}`}>
        {value}
        {unit && <span className="muted ml-1 text-sm font-normal">{unit}</span>}
      </p>
      {hint && <p className="muted mt-1 text-[0.74rem]">{hint}</p>}
    </div>
  );
}

/**
 * Single-select filter row.
 *
 * Buttons rather than a <select>: the Flank Speed sanitiser blocks native form
 * submission, and there are few enough options that showing them all is
 * friendlier than hiding them behind a control anyway.
 */
export function FilterChips({ options, value, onChange, allLabel = 'All' }) {
  const all = [{ key: '', label: allLabel }, ...options];
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {all.map((option) => {
        const active = value === option.key;
        return (
          <button
            key={option.key || '_all'}
            type="button"
            onClick={() => onChange(option.key)}
            aria-pressed={active}
            className={`rounded-full px-3 py-1 text-[0.75rem] font-medium transition-colors ${
              active
                ? 'bg-signal-600 text-white'
                : 'hairline border muted hover:bg-ink-500/[0.06]'
            }`}
          >
            {option.label}
            {option.count != null && (
              <span className={`tnum ml-1.5 ${active ? 'text-white/70' : 'opacity-60'}`}>{option.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function EmptyState({ children }) {
  return <p className="muted px-5 py-8 text-center text-[0.83rem]">{children}</p>;
}
