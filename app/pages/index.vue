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
const emptyDashboardData: DashboardData = {
  bloodPressure: [],
  glucose: [],
  symptoms: [],
  weight: [],
};

const { data } = await useAsyncData('dashboard-data', async () => {
  const [glucose, bloodPressure, weight, symptoms] = await Promise.all([
    $fetch<GlucoseMeasurement[]>('/api/glucose', { query: query.value }),
    $fetch<BloodPressureMeasurement[]>('/api/blood-pressure', { query: query.value }),
    $fetch<WeightMeasurement[]>('/api/weight', { query: query.value }),
    $fetch<SymptomMeasurement[]>('/api/symptoms', { query: query.value }),
  ]);

  return { bloodPressure, glucose, symptoms, weight };
}, {
  watch: [periodFilters],
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

      return `с ${format(from)} по ${format(to)}`;
    }

    return 'за произвольный период';
  }

  if (value.preset === '3m') {
    return 'за последние 3 месяца';
  }

  if (value.preset === '6m') {
    return 'за последние 6 месяцев';
  }

  return 'с начала года';
});

useHead({
  title: 'Health Monitor',
});

useSeoMeta({
  title: 'Health Monitor',
  description: 'Сводка по глюкозе, давлению, весу и симптомам за выбранный период.',
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
            Сводка здоровья
          </span>
          <span class="health-dashboard-title-period">
            {{ periodHeadlineSuffix }}
          </span>
        </h1>
        <p class="health-lead">
          Текущее состояние, краткая динамика и последние показатели здоровья.
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
        v-bind="{ ariaLabel: 'График глюкозы с линиями натощак и после еды' }"
        title="Глюкоза"
        :items="data?.glucose ?? []"
        :series="glucoseChartSeries"
        :value-formatter="formatGlucoseValue"
        :y-axis-formatter="formatGlucoseAxisValue"
      />

      <HealthLineChart
        class="health-dashboard-chart"
        v-bind="{ ariaLabel: 'График давления с линиями систолического и диастолического значения' }"
        title="Давление"
        :items="data?.bloodPressure ?? []"
        :series="bloodPressureChartSeries"
        :value-formatter="formatBloodPressureValue"
        :y-axis-formatter="formatBloodPressureAxisValue"
      />

      <HealthLineChart
        class="health-dashboard-chart"
        v-bind="{ ariaLabel: 'График веса' }"
        title="Вес"
        :items="data?.weight ?? []"
        :series="weightChartSeries"
        :value-formatter="formatWeightValue"
        :y-axis-formatter="formatWeightAxisValue"
      />

      <DashboardSymptomsPanel
        :data="dashboardData"
        :period-filters="periodFilters"
      />
    </section>

    <DashboardLatestEntries :data="dashboardData" />
  </HealthShell>
</template>
