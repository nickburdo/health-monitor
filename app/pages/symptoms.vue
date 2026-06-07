<script setup lang="ts">
import { usePeriodFilter } from '~/composables/usePeriodFilter';

type RecordItem = {
  id: string;
  happenedAt: string;
  type: string;
  intensity: number | null;
  note: string | null;
};
const { periodFilters, query } = usePeriodFilter();

const { data } = await useAsyncData(
  'symptoms-page',
  () =>
    $fetch<RecordItem[]>('/api/symptoms', {
      query: query.value,
    }),
  {
    watch: [periodFilters],
  },
);

useHead({ title: 'Symptoms · Health Monitor' });
</script>

<template>
  <HealthShell>
    <section class="health-page-grid">
      <div class="health-panel health-page-card">
        <div class="health-page-header-with-filter">
          <div class="health-page-header-copy">
            <div class="health-eyebrow">
              Symptoms
            </div>
            <h1 class="health-page-title">
              Симптомы
            </h1>
          </div>

          <div class="health-page-header-filter">
            <PeriodFilter v-model="periodFilters" />
          </div>
        </div>
      </div>

      <SymptomTable
        :items="data ?? []"
      />
    </section>
  </HealthShell>
</template>
