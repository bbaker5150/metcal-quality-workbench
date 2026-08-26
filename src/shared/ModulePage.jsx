import React from 'react';
import { Link } from 'react-router';
import { ChevronLeft } from 'lucide-react';

export default function ModulePage({ module, children }) {
  const { icon: Icon, title, subtitle } = module;
  return (
    <div className="mx-auto w-full max-w-6xl px-6 pb-20 pt-8">
      <Link to="/" className="muted mb-5 inline-flex items-center gap-1 text-[0.78rem] hover:text-ink-800 dark:hover:text-ink-100">
        <ChevronLeft size={14} /> All modules
      </Link>
      <div className="mb-6 flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-xl bg-signal-500/10 text-signal-600 dark:text-signal-400">
          <Icon size={21} strokeWidth={1.75} />
        </span>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
          <p className="muted text-[0.82rem]">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

export function Table({ head, children }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[0.82rem]">
        <thead>
          <tr className="border-b hairline text-left">
            {head.map((h) => (
              <th key={h} className="muted px-5 py-2.5 font-medium whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border-subtle)]">{children}</tbody>
      </table>
    </div>
  );
}
