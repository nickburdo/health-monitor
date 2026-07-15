import { usePeriodFilter, type PeriodPreset } from '~/composables/usePeriodFilter';
import type { DateRangeQuery } from '~/lib/db/repositories/glucoseRepository';

export async function useMeasurementList<T>(
  loader: (range: DateRangeQuery) => Promise<T[]>,
  preset?: Exclude<PeriodPreset, 'custom'>,
) {
  const { periodFilters, query } = usePeriodFilter(preset);
  const data = ref<T[]>([]) as Ref<T[]>;
  const pending = ref(false);

  async function refresh() {
    pending.value = true;

    try {
      data.value = await loader(query.value);
    } finally {
      pending.value = false;
    }
  }

  watch(query, refresh);
  await refresh();

  return {
    periodFilters,
    query,
    data,
    pending,
    refresh,
  };
}
