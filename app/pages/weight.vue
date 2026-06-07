<script setup lang="ts">
import { usePeriodFilter } from '~/composables/usePeriodFilter';

type RecordItem = {
  id: string;
  measuredAt: string;
  value: number | null;
  ignore: boolean;
  note: string | null;
};
const { periodFilters, query } = usePeriodFilter();

const { data } = await useAsyncData(
  'weight-page',
  () =>
    $fetch<RecordItem[]>('/api/weight', {
      query: query.value,
    }),
  {
    watch: [periodFilters],
  },
);

useHead({ title: 'Weight · Health Monitor' });
</script>

<template>
  <HealthShell>
    <section class="health-page-grid">
      <div class="health-panel health-page-card">
        <div class="health-weight-header">
          <div class="health-weight-header-copy">
            <div class="health-eyebrow">
              Weight
            </div>
            <h1 class="health-page-title">
              Вес
            </h1>
          </div>

          <div class="health-weight-header-filter">
            <PeriodFilter v-model="periodFilters" />
          </div>
        </div>
      </div>

      <WeightTable
        :items="data ?? []"
      />
    </section>
  </HealthShell>
</template>
