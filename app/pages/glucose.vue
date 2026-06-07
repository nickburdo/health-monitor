<script setup lang="ts">
import { usePeriodFilter } from '~/composables/usePeriodFilter';

type RecordItem = {
  id: string;
  measuredAt: string;
  fastingValue: number | null;
  afterMealValue: number | null;
  ignore: boolean;
  note: string | null;
};
const { periodFilters, query } = usePeriodFilter();

const { data } = await useAsyncData(
  'glucose-page',
  () =>
    $fetch<RecordItem[]>('/api/glucose', {
      query: query.value,
    }),
  {
    watch: [periodFilters],
  },
);

useHead({ title: 'Glucose · Health Monitor' });
</script>

<template>
  <HealthShell>
    <section class="health-page-grid">
      <div class="health-panel health-page-card">
        <div class="health-page-header-with-filter">
          <div class="health-page-header-copy">
            <div class="health-eyebrow">
              Glucose
            </div>
            <h1 class="health-page-title">
              Глюкоза
            </h1>
          </div>

          <div class="health-page-header-filter">
            <PeriodFilter v-model="periodFilters" />
          </div>
        </div>
      </div>

      <GlucoseTable
        :items="data ?? []"
      />
    </section>
  </HealthShell>
</template>
