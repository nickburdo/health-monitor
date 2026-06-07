<script setup lang="ts">
import type { GlucoseMeasurement } from '~/types/glucose';

const glucoseChartSeries = [
  {
    key: 'fastingValue',
    label: 'Натощак',
    color: '#fb923c',
    valueFormatter: (value: number) => `${(value / 18).toFixed(1)} ммоль/л`,
  },
  {
    key: 'afterMealValue',
    label: 'После еды',
    color: '#ea580c',
    valueFormatter: (value: number) => `${(value / 18).toFixed(1)} ммоль/л`,
  },
] as const;

function formatGlucoseValue(value: number) {
  return `${(value / 18).toFixed(1)} ммоль/л`;
}

function formatGlucoseAxisValue(value: number) {
  return value.toFixed(1);
}

const { periodFilters, data } = await useMeasurementListPage<GlucoseMeasurement>({
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
      <HealthLineChart
        v-bind="{ ariaLabel: 'График глюкозы с линиями натощак и после еды' }"
        :items="data ?? []"
        :series="glucoseChartSeries"
        :value-formatter="formatGlucoseValue"
        :y-axis-formatter="formatGlucoseAxisValue"
      />
      <GlucoseTable
        :items="data ?? []"
      />
    </MeasurementPageShell>
  </HealthShell>
</template>
