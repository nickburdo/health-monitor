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
    <MeasurementPageShell
      eyebrow="Weight"
      title="Вес"
    >
      <template #filter>
        <PeriodFilter v-model="periodFilters" />
      </template>
      <WeightTable
        :items="data ?? []"
      />
    </MeasurementPageShell>
  </HealthShell>
</template>
