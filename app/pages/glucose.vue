<script setup lang="ts">
type RecordItem = {
  id: string;
  measuredAt: string;
  fastingValue: number | null;
  afterMealValue: number | null;
  ignore: boolean;
  note: string | null;
};
const { periodFilters, data } = await useMeasurementListPage<RecordItem>({
  key: 'glucose-page',
  endpoint: '/api/glucose',
});

useHead({ title: 'Glucose · Health Monitor' });
</script>

<template>
  <HealthShell>
    <section class="health-page-grid">
      <div class="health-panel health-page-card">
        <HealthPageHeaderWithFilter
          eyebrow="Glucose"
          title="Глюкоза"
        >
          <PeriodFilter v-model="periodFilters" />
        </HealthPageHeaderWithFilter>
      </div>

      <GlucoseTable
        :items="data ?? []"
      />
    </section>
  </HealthShell>
</template>
