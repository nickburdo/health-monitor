import { usePeriodFilter, type PeriodPreset } from '~/composables/usePeriodFilter';

type MeasurementListPageOptions = {
  endpoint: string;
  key: string;
  preset?: Exclude<PeriodPreset, 'custom'>;
};

export async function useMeasurementListPage<T>(
  options: MeasurementListPageOptions,
) {
  const { periodFilters, query } = usePeriodFilter(options.preset);

  const { data } = await useAsyncData(
    options.key,
    () =>
      $fetch<T[]>(options.endpoint, {
        query: query.value,
      }),
    {
      watch: [periodFilters],
    },
  );

  return {
    periodFilters,
    query,
    data,
  };
}
