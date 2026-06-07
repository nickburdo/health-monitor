<script setup lang="ts">
import type { GlucoseMeasurement } from '~/types/glucose';
import {
  formatGlucoseAxisValue,
  formatGlucoseValue,
  glucoseChartSeries,
} from '~/utils/health-line-chart/glucose';

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
