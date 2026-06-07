export type PeriodPreset = '3m' | '6m' | 'ytd' | 'custom';

export type PeriodFilterValue = {
  preset: PeriodPreset;
  dateFrom?: string | null;
  dateTo?: string | null;
};

export function startOfDayIso(date: Date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value.toISOString();
}

export function endOfDayIso(date: Date) {
  const value = new Date(date);
  value.setHours(23, 59, 59, 999);
  return value.toISOString();
}

export function createPresetPeriodFilters(
  preset: Exclude<PeriodPreset, 'custom'>,
): PeriodFilterValue {
  const now = new Date();
  const dateTo = endOfDayIso(now);
  const dateFrom = new Date(now);

  if (preset === '3m') {
    dateFrom.setMonth(dateFrom.getMonth() - 3);
  } else if (preset === '6m') {
    dateFrom.setMonth(dateFrom.getMonth() - 6);
  } else {
    dateFrom.setMonth(0, 1);
  }

  return {
    preset,
    dateFrom: startOfDayIso(dateFrom),
    dateTo,
  };
}

export function usePeriodFilter(
  preset: Exclude<PeriodPreset, 'custom'> = '3m',
) {
  const periodFilters = ref<PeriodFilterValue>(createPresetPeriodFilters(preset));
  const query = computed(() => ({
    dateFrom: periodFilters.value.dateFrom ?? undefined,
    dateTo: periodFilters.value.dateTo ?? undefined,
  }));

  return {
    periodFilters,
    query,
  };
}

export function formatPeriodShortDate(value?: string | null) {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);

  return `${day}.${month}.${year}`;
}

export function toDateInputValue(value?: string | null) {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}
