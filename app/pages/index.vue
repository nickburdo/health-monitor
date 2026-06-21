<script setup lang="ts">
import DashboardLatestEntries from '~/components/DashboardLatestEntries.vue';
import DashboardMetricsGrid from '~/components/DashboardMetricsGrid.vue';
import DashboardSummaryPanel from '~/components/DashboardSummaryPanel.vue';
import DashboardSymptomsPanel from '~/components/DashboardSymptomsPanel.vue';
import type { BloodPressureMeasurement } from '~/types/blood-pressure';
import type { DashboardData } from '~/types/dashboard';
import type { GlucoseMeasurement } from '~/types/glucose';
import type { SymptomMeasurement } from '~/types/symptom';
import type { WeightMeasurement } from '~/types/weight';
import {
  formatBloodPressureAxisValue,
  formatBloodPressureValue,
  bloodPressureChartSeries,
} from '~/utils/health-line-chart/blood-pressure';
import {
  formatGlucoseAxisValue,
  formatGlucoseValue,
  glucoseChartSeries,
} from '~/utils/health-line-chart/glucose';
import {
  formatWeightAxisValue,
  formatWeightValue,
  weightChartSeries,
} from '~/utils/health-line-chart/weight';
import { usePeriodFilter } from '~/composables/usePeriodFilter';

const { periodFilters, query } = usePeriodFilter();
const requestFetch = useRequestFetch();
const emptyDashboardData: DashboardData = {
  bloodPressure: [],
  glucose: [],
  symptoms: [],
  weight: [],
};

const dashboardKey = computed(() => `dashboard-data-${query.value.dateFrom}-${query.value.dateTo}`);
const { data, refresh } = await useAsyncData(dashboardKey, async () => {
  const [glucose, bloodPressure, weight, symptoms] = await Promise.all([
    requestFetch<GlucoseMeasurement[]>('/api/glucose', { query: query.value }),
    requestFetch<BloodPressureMeasurement[]>('/api/blood-pressure', { query: query.value }),
    requestFetch<WeightMeasurement[]>('/api/weight', { query: query.value }),
    requestFetch<SymptomMeasurement[]>('/api/symptoms', { query: query.value }),
  ]);

  return { bloodPressure, glucose, symptoms, weight };
});

watch(query, () => {
  refresh();
});

const dashboardData = computed(() => data.value ?? emptyDashboardData);

const periodHeadlineSuffix = computed(() => {
  const value = periodFilters.value;

  if (value.preset === 'custom') {
    const from = value.dateFrom ? new Date(value.dateFrom) : null;
    const to = value.dateTo ? new Date(value.dateTo) : null;

    if (from && to && !Number.isNaN(from.getTime()) && !Number.isNaN(to.getTime())) {
      const format = (date: Date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = String(date.getFullYear()).slice(-2);
        return `${day}.${month}.${year}`;
      };

      return `from ${format(from)} to ${format(to)}`;
    }

    return 'for a custom period';
  }

  if (value.preset === '3m') {
    return 'for the last 3 months';
  }

  if (value.preset === '6m') {
    return 'for the last 6 months';
  }

  return 'year to date';
});

useHead({
  title: 'Health Monitor',
});

useSeoMeta({
  title: 'Health Monitor',
  description: 'Summary of glucose, blood pressure, weight, and symptoms for the selected period.',
});
</script>

<template>
  <HealthShell>
    <section class="health-hero">
      <div class="health-panel health-hero-main">
        <div class="health-eyebrow">
          Dashboard · summary first
        </div>
        <h1 class="health-title health-dashboard-title">
          <span class="health-dashboard-title-prefix">
            Health summary
          </span>
          <span class="health-dashboard-title-period">
            {{ periodHeadlineSuffix }}
          </span>
        </h1>
        <p class="health-lead">
          Current status, short-term trends, and latest health readings.
        </p>

        <div class="health-page-header-filter health-dashboard-filter">
          <PeriodFilter v-model="periodFilters" />
        </div>
      </div>

      <DashboardSummaryPanel :data="dashboardData" />
    </section>

    <DashboardMetricsGrid :data="dashboardData" />

    <section class="health-dashboard-chart-grid">
      <HealthLineChart
        class="health-dashboard-chart"
        v-bind="{ ariaLabel: 'Glucose chart with fasting and after meal lines' }"
        title="Glucose"
        :items="data?.glucose ?? []"
        :series="glucoseChartSeries"
        :value-formatter="formatGlucoseValue"
        :y-axis-formatter="formatGlucoseAxisValue"
      />

      <HealthLineChart
        class="health-dashboard-chart"
        v-bind="{ ariaLabel: 'Blood pressure chart with systolic and diastolic lines' }"
        title="Blood pressure"
        :items="data?.bloodPressure ?? []"
        :series="bloodPressureChartSeries"
        :value-formatter="formatBloodPressureValue"
        :y-axis-formatter="formatBloodPressureAxisValue"
      />

      <HealthLineChart
        class="health-dashboard-chart"
        v-bind="{ ariaLabel: 'Weight chart' }"
        title="Weight"
        :items="data?.weight ?? []"
        :series="weightChartSeries"
        :value-formatter="formatWeightValue"
        :y-axis-formatter="formatWeightAxisValue"
      />

      <DashboardSymptomsPanel
        :symptoms="dashboardData.symptoms"
        :max-types="5"
      />
    </section>

    <DashboardLatestEntries :data="dashboardData" />
  </HealthShell>
</template>
