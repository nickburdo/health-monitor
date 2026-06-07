<script setup lang="ts">
import type { BloodPressureMeasurement } from '~/types/blood-pressure';

const bloodPressureChartSeries = [
  {
    key: 'systolic',
    label: 'Систолическое',
    color: '#3b82f6',
    valueFormatter: (value: number) => `${Math.round(value)} мм рт. ст.`,
  },
  {
    key: 'diastolic',
    label: 'Диастолическое',
    color: '#1d4ed8',
    valueFormatter: (value: number) => `${Math.round(value)} мм рт. ст.`,
  },
] as const;

function formatBloodPressureValue(value: number) {
  return `${Math.round(value)} мм рт. ст.`;
}

function formatBloodPressureAxisValue(value: number) {
  return String(Math.round(value));
}

const { periodFilters, data } = await useMeasurementListPage<BloodPressureMeasurement>({
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
      <HealthLineChart
        v-bind="{ ariaLabel: 'График давления с линиями систолического и диастолического значения' }"
        :items="data ?? []"
        :series="bloodPressureChartSeries"
        :value-formatter="formatBloodPressureValue"
        :y-axis-formatter="formatBloodPressureAxisValue"
      />
      <BloodPressureTable
        :items="data ?? []"
      />
    </MeasurementPageShell>
  </HealthShell>
</template>
