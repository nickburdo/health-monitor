import { usePeriodFilter, type PeriodPreset } from '~/composables/usePeriodFilter';
import { apiErrorDescription } from '~/lib/api/client';
import type { DateRangeQuery } from '~/types/date-range';

export async function useMeasurementList<T>(
  loader: (range: DateRangeQuery) => Promise<T[]>,
  preset?: Exclude<PeriodPreset, 'custom'>,
) {
  const { periodFilters, query } = usePeriodFilter(preset);
  const data = ref<T[]>([]) as Ref<T[]>;
  const pending = ref(false);
  const toast = useToast();

  async function refresh() {
    pending.value = true;

    try {
      data.value = await loader(query.value);
    } catch (error) {
      data.value = [];

      const message = apiErrorDescription(error, 'Request failed');
      if (message !== null) {
        toast.add({ title: 'Could not load data', description: message, color: 'error' });
      }
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
