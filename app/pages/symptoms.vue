<script setup lang="ts">
type RecordItem = {
  id: string;
  happenedAt: string;
  type: string;
  intensity: number | null;
  note: string | null;
};
const { periodFilters, data } = await useMeasurementListPage<RecordItem>({
  key: 'symptoms-page',
  endpoint: '/api/symptoms',
});

useHead({ title: 'Symptoms · Health Monitor' });
</script>

<template>
  <HealthShell>
    <MeasurementPageShell
      eyebrow="Symptoms"
      title="Симптомы"
    >
      <template #filter>
        <PeriodFilter v-model="periodFilters" />
      </template>
      <SymptomTable
        :items="data ?? []"
      />
    </MeasurementPageShell>
  </HealthShell>
</template>
