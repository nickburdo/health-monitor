<script setup lang="ts">
import type { BloodPressureMeasurement } from '~/types/blood-pressure';
import { listBloodPressureMeasurements } from '~/lib/db/repositories/bloodPressureRepository';
import { downloadCsv, toCsv } from '~/lib/db/csv';
import {
  formatBloodPressureAxisValue,
  formatBloodPressureValue,
  bloodPressureChartSeries,
} from '~/utils/health-line-chart/blood-pressure';

const { periodFilters, data, refresh }
  = await useMeasurementList<BloodPressureMeasurement>(
    listBloodPressureMeasurements,
  );

function exportCsv() {
  const csvContent = toCsv(data.value, [
    'measuredAt',
    'systolic',
    'diastolic',
    'pulse',
    'ignore',
    'note',
    'reason',
  ]);

  downloadCsv(
    `blood-pressure-${new Date().toISOString().slice(0, 10)}.csv`,
    csvContent,
  );
}

useHead({ title: 'Blood pressure · Health Monitor' });
</script>

<template>
  <HealthShell>
    <MeasurementPageShell
      eyebrow="Blood pressure"
      title="Blood pressure"
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
        v-bind="{ ariaLabel: 'Blood pressure chart with systolic and diastolic lines' }"
        :items="data ?? []"
        :series="bloodPressureChartSeries"
        :value-formatter="formatBloodPressureValue"
        :y-axis-formatter="formatBloodPressureAxisValue"
      />
      <BloodPressureTable
        :items="data ?? []"
        :on-updated="refresh"
      />
    </MeasurementPageShell>
  </HealthShell>
</template>
