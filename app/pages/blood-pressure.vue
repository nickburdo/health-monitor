<script setup lang="ts">
type RecordItem = {
  id: string;
  measuredAt: string;
  systolic: number | null;
  diastolic: number | null;
  pulse: number | null;
  ignore: boolean;
  note: string | null;
};
const { periodFilters, data } = await useMeasurementListPage<RecordItem>({
  key: 'blood-pressure-page',
  endpoint: '/api/blood-pressure',
});

useHead({ title: 'Blood Pressure · Health Monitor' });
</script>

<template>
  <HealthShell>
    <MeasurementPageShell
      eyebrow="Blood pressure"
      title="Давление"
    >
      <template #filter>
        <PeriodFilter v-model="periodFilters" />
      </template>
      <BloodPressureTable
        :items="data ?? []"
      />
    </MeasurementPageShell>
  </HealthShell>
</template>
