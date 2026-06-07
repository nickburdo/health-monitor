<script setup lang="ts">
type RecordItem = {
  id: string;
  measuredAt: string;
  fastingValue: number | null;
  afterMealValue: number | null;
  ignore: boolean;
  note: string | null;
  reason: string | null;
};
const { periodFilters, data } = await useMeasurementListPage<RecordItem>({
  key: 'glucose-page',
  endpoint: '/api/glucose',
});

useHead({ title: 'Glucose · Health Monitor' });
</script>

<template>
  <HealthShell>
    <MeasurementPageShell
      eyebrow="Glucose"
      title="Глюкоза"
    >
      <template #filter>
        <PeriodFilter v-model="periodFilters" />
      </template>
      <GlucoseTable
        :items="data ?? []"
      />
    </MeasurementPageShell>
  </HealthShell>
</template>
