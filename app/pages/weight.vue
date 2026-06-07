<script setup lang="ts">
type RecordItem = {
  id: string;
  measuredAt: string;
  value: number | null;
  ignore: boolean;
  note: string | null;
};
const { periodFilters, data } = await useMeasurementListPage<RecordItem>({
  key: 'weight-page',
  endpoint: '/api/weight',
});

useHead({ title: 'Weight · Health Monitor' });
</script>

<template>
  <HealthShell>
    <section class="health-page-grid">
      <div class="health-panel health-page-card">
        <HealthPageHeaderWithFilter
          eyebrow="Weight"
          title="Вес"
        >
          <PeriodFilter v-model="periodFilters" />
        </HealthPageHeaderWithFilter>
      </div>

      <WeightTable
        :items="data ?? []"
      />
    </section>
  </HealthShell>
</template>
