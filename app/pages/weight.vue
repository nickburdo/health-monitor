<script setup lang="ts">
import type { WeightMeasurement } from '~/types/weight';
import {
  formatWeightAxisValue,
  formatWeightValue,
  weightChartSeries,
} from '~/utils/health-line-chart/weight';

const { periodFilters, data } = await useMeasurementListPage<WeightMeasurement>({
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
      <HealthLineChart
        v-bind="{ ariaLabel: 'График веса' }"
        :items="data ?? []"
        :series="weightChartSeries"
        :value-formatter="formatWeightValue"
        :y-axis-formatter="formatWeightAxisValue"
      />
      <WeightTable
        :items="data ?? []"
      />
    </MeasurementPageShell>
  </HealthShell>
</template>
