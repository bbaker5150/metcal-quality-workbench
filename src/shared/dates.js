import { TODAY } from '../data/seedData.js';

// Dates in this app are plain ISO days with no time and no zone, because that
// is what a schedule actually is — an audit is "on the 15th", not at an
// instant. Parsing them as UTC keeps a viewer west of Greenwich from seeing
// everything shift a day earlier than the sheet says.

const day = (iso) => Date.parse(`${iso}T00:00:00Z`);

/** Whole days from today; negative is in the past. Null for a missing date. */
export function daysOut(iso, today = TODAY) {
  if (!iso) return null;
  const t = day(iso);
  return Number.isNaN(t) ? null : Math.round((t - day(today)) / 86400000);
}

/** "in 14 days", "today", "22 days ago". */
export function relative(iso, today = TODAY) {
  const d = daysOut(iso, today);
  if (d === null) return '';
  if (d === 0) return 'today';
  const n = Math.abs(d);
  return d > 0 ? `in ${n} day${n === 1 ? '' : 's'}` : `${n} day${n === 1 ? '' : 's'} ago`;
}

export const isOverdue = (iso, today = TODAY) => {
  const d = daysOut(iso, today);
  return d !== null && d < 0;
};

export const isSoon = (iso, within = 30, today = TODAY) => {
  const d = daysOut(iso, today);
  return d !== null && d >= 0 && d <= within;
};
