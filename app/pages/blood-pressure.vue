<script setup lang="ts">
import { usePeriodFilter } from '~/composables/usePeriodFilter';

type RecordItem = {
  id: string;
  measuredAt: string;
  systolic: number | null;
  diastolic: number | null;
  pulse: number | null;
  ignore: boolean;
  note: string | null;
};
const { periodFilters, query } = usePeriodFilter();

const { data } = await useAsyncData(
  'blood-pressure-page',
  () =>
    $fetch<RecordItem[]>('/api/blood-pressure', {
      query: query.value,
    }),
  {
    watch: [periodFilters],
  },
);

useHead({ title: 'Blood Pressure · Health Monitor' });
</script>

<template>
  <HealthShell>
    <section class="health-page-grid">
      <div class="health-panel health-page-card">
        <div class="health-page-header-with-filter">
          <div class="health-page-header-copy">
            <div class="health-eyebrow">
              Blood pressure
            </div>
            <h1 class="health-page-title">
              Давление
            </h1>
          </div>

          <div class="health-page-header-filter">
            <PeriodFilter v-model="periodFilters" />
          </div>
        </div>
      </div>

      <BloodPressureTable
        :items="data ?? []"
      />
    </section>
  </HealthShell>
</template>
