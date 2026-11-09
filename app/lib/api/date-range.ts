import { toDateInputValue } from '~/composables/usePeriodFilter';
import type { DateRangeQuery } from '~/types/date-range';

// Local calendar date (YYYY-MM-DD) of an ISO timestamp, shifted by whole days.
function shiftedLocalDate(value: string | undefined, days: number) {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  date.setDate(date.getDate() + days);
  return toDateInputValue(date.toISOString()) || undefined;
}

// The API filters by calendar dates read as UTC days (date_to inclusive). Ask for one extra
// day on each side so every time zone is covered; listInRange then trims to the exact period.
export function toDateRangeParams(range: DateRangeQuery) {
  return {
    date_from: shiftedLocalDate(range.dateFrom, -1),
    date_to: shiftedLocalDate(range.dateTo, 1),
  };
}

// Keeps records inside the exact period bounds and lists the newest first
// (the API returns the widened range, oldest first).
export function listInRange<T>(items: T[], range: DateRangeQuery, dateOf: (item: T) => string): T[] {
  const from = range.dateFrom ? Date.parse(range.dateFrom) : Number.NEGATIVE_INFINITY;
  const to = range.dateTo ? Date.parse(range.dateTo) : Number.POSITIVE_INFINITY;

  return items
    .filter((item) => {
      const time = Date.parse(dateOf(item));
      return time >= from && time <= to;
    })
    .sort((a, b) => Date.parse(dateOf(b)) - Date.parse(dateOf(a)));
}

// Strict bodies reject unknown keys and nulls: drop empty values before sending.
export function compactBody(body: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(body).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  );
}
