<script setup lang="ts">
import type { GlucoseMeasurement } from '~/types/glucose';
import { listGlucoseMeasurements } from '~/lib/db/repositories/glucoseRepository';
import { downloadCsv, toCsv } from '~/lib/db/csv';
import {
  formatGlucoseAxisValue,
  formatGlucoseValue,
  glucoseChartSeries,
} from '~/utils/health-line-chart/glucose';

const { periodFilters, data, refresh } = await useMeasurementList<GlucoseMeasurement>(
  listGlucoseMeasurements,
);

function exportCsv() {
  const csvContent = toCsv(data.value, [
    'measuredAt',
    'fastingValue',
    'afterMealValue',
    'ignore',
    'note',
    'reason',
  ]);

  downloadCsv(`glucose-${new Date().toISOString().slice(0, 10)}.csv`, csvContent);
}

useHead({ title: 'Glucose · Health Monitor' });
</script>

<template>
  <HealthShell>
    <MeasurementPageShell
      eyebrow="Glucose"
      title="Glucose"
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
        v-bind="{ ariaLabel: 'Glucose chart with fasting and after meal lines' }"
        :items="data ?? []"
        :series="glucoseChartSeries"
        :value-formatter="formatGlucoseValue"
        :y-axis-formatter="formatGlucoseAxisValue"
      />
      <GlucoseTable
        :items="data ?? []"
        :on-updated="refresh"
      />
    </MeasurementPageShell>
  </HealthShell>
</template>
