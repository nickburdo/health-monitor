<script setup lang="ts">
import type { WeightMeasurement } from '~/types/weight';
import { listWeightMeasurements } from '~/lib/db/repositories/weightRepository';
import { downloadCsv, toCsv } from '~/lib/db/csv';
import {
  formatWeightAxisValue,
  formatWeightValue,
  weightChartSeries,
} from '~/utils/health-line-chart/weight';

const { periodFilters, data, refresh } = await useMeasurementList<WeightMeasurement>(
  listWeightMeasurements,
);

function exportCsv() {
  const csvContent = toCsv(data.value, [
    'measuredAt',
    'value',
    'ignore',
    'note',
    'reason',
  ]);

  downloadCsv(`weight-${new Date().toISOString().slice(0, 10)}.csv`, csvContent);
}

useHead({ title: 'Weight · Health Monitor' });
</script>

<template>
  <HealthShell>
    <MeasurementPageShell
      eyebrow="Weight"
      title="Weight"
    >
      <template #filter>
        <PeriodFilter v-model="periodFilters" />
        <button
          type="button"
          class="health-button health-button-secondary health-button-small"
          @click="exportCsv"
        >
          Export CSV
        </button>
      </template>
      <HealthLineChart
        v-bind="{ ariaLabel: 'Weight chart' }"
        :items="data ?? []"
        :series="weightChartSeries"
        :value-formatter="formatWeightValue"
        :y-axis-formatter="formatWeightAxisValue"
      />
      <WeightTable
        :items="data ?? []"
        :on-updated="refresh"
      />
    </MeasurementPageShell>
  </HealthShell>
</template>
