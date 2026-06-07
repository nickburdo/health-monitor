<script setup lang="ts">
import type { BloodPressureMeasurement } from '~/types/blood-pressure';
import {
  bloodPressureChartSeries,
  formatBloodPressureAxisValue,
  formatBloodPressureValue,
} from '~/utils/health-line-chart/blood-pressure';

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
