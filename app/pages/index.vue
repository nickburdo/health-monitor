<script setup lang="ts">
import type { BloodPressureMeasurement } from '~/types/blood-pressure';
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
import { formatWhen } from '~/utils/date-format';
import {
  formatPeriodShortDate,
  usePeriodFilter,
} from '~/composables/usePeriodFilter';

type LatestEntry = {
  ignored?: boolean;
  subtitle: string;
  timestamp: number;
  title: string;
};

type SymptomFrequency = {
  count: number;
  label: string;
};

const { periodFilters, query } = usePeriodFilter();

const { data } = await useAsyncData('dashboard-data', async () => {
  const [glucose, bloodPressure, weight, symptoms] = await Promise.all([
    $fetch<GlucoseMeasurement[]>('/api/glucose', { query: query.value }),
    $fetch<BloodPressureMeasurement[]>('/api/blood-pressure', { query: query.value }),
    $fetch<WeightMeasurement[]>('/api/weight', { query: query.value }),
    $fetch<SymptomMeasurement[]>('/api/symptoms', { query: query.value }),
  ]);

  return { glucose, bloodPressure, weight, symptoms };
}, {
  watch: [periodFilters],
});

function sortByDateDesc<T>(items: T[], getDate: (item: T) => string) {
  return [...items].sort((left, right) => {
    return new Date(getDate(right)).getTime() - new Date(getDate(left)).getTime();
  });
}

function average(values: number[]) {
  if (!values.length) {
    return null;
  }

  const total = values.reduce((sum, value) => sum + value, 0);
  return total / values.length;
}

function glucoseRawToMmol(value: number) {
  return value / 18;
}

function getLatestGlucoseValue(record?: GlucoseMeasurement) {
  if (!record) {
    return null;
  }

  const rawValue = record.afterMealValue ?? record.fastingValue;

  return rawValue === null || rawValue === undefined
    ? null
    : glucoseRawToMmol(rawValue);
}

function formatMmol(value: number) {
  return `${value.toFixed(1)}`;
}

function formatKilograms(value: number) {
  return `${value.toFixed(1)}`;
}

function formatWeightChange(value: number) {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)} кг`;
}

function formatBloodPressurePair(
  record: BloodPressureMeasurement,
) {
  const systolic = record.systolic ?? '—';
  const diastolic = record.diastolic ?? '—';
  return `${systolic}/${diastolic} мм рт. ст.`;
}

function formatGlucoseEntryValue(record: GlucoseMeasurement) {
  const values: string[] = [];

  if (record.fastingValue !== null) {
    values.push(`натощак ${formatGlucoseValue(record.fastingValue)}`);
  }

  if (record.afterMealValue !== null) {
    values.push(`после еды ${formatGlucoseValue(record.afterMealValue)}`);
  }

  return values.length ? values.join(' / ') : '—';
}

function formatBloodPressureEntryValue(record: BloodPressureMeasurement) {
  const values: string[] = [formatBloodPressurePair(record)];

  if (record.pulse !== null) {
    values.push(`пульс ${record.pulse} уд/мин`);
  }

  return values.join(' · ');
}

function formatSymptomEntryValue(record: SymptomMeasurement) {
  const parts = [`балл ${record.intensity ?? '—'}`];

  if (record.note) {
    parts.push(record.note);
  }

  return parts.join(' · ');
}

function buildLatestEntries(dataSet: {
  bloodPressure: BloodPressureMeasurement[];
  glucose: GlucoseMeasurement[];
  symptoms: SymptomMeasurement[];
  weight: WeightMeasurement[];
}) {
  const entries: LatestEntry[] = [
    ...dataSet.glucose.map(record => ({
      title: 'Глюкоза',
      subtitle: `${formatWhen(record.measuredAt)} · ${formatGlucoseEntryValue(record)}`,
      ignored: record.ignore,
      timestamp: new Date(record.measuredAt).getTime(),
    })),
    ...dataSet.bloodPressure.map(record => ({
      title: 'Давление',
      subtitle: `${formatWhen(record.measuredAt)} · ${formatBloodPressureEntryValue(record)}`,
      ignored: record.ignore,
      timestamp: new Date(record.measuredAt).getTime(),
    })),
    ...dataSet.weight.map(record => ({
      title: 'Вес',
      subtitle: `${formatWhen(record.measuredAt)} · ${record.value !== null ? formatWeightValue(record.value) : '—'}`,
      ignored: record.ignore,
      timestamp: new Date(record.measuredAt).getTime(),
    })),
    ...dataSet.symptoms.map(record => ({
      title: `Симптом: ${record.type}`,
      subtitle: `${formatWhen(record.happenedAt)} · ${formatSymptomEntryValue(record)}`,
      timestamp: new Date(record.happenedAt).getTime(),
    })),
  ];

  return entries.sort((left, right) => right.timestamp - left.timestamp).slice(0, 6);
}

const periodLabel = computed(() => {
  const value = periodFilters.value;

  if (value.preset === 'custom') {
    const from = formatPeriodShortDate(value.dateFrom);
    const to = formatPeriodShortDate(value.dateTo);
    return from && to ? `${from} - ${to}` : 'Произвольный период';
  }

  if (value.preset === '3m') {
    return 'Последние 3 месяца';
  }

  if (value.preset === '6m') {
    return 'Последние 6 месяцев';
  }

  return 'С начала года';
});

const periodHeadlineSuffix = computed(() => {
  const value = periodFilters.value;

  if (value.preset === 'custom') {
    const from = formatPeriodShortDate(value.dateFrom);
    const to = formatPeriodShortDate(value.dateTo);
    return from && to ? `с ${from} по ${to}` : 'за произвольный период';
  }

  if (value.preset === '3m') {
    return 'за последние 3 месяца';
  }

  if (value.preset === '6m') {
    return 'за последние 6 месяцев';
  }

  return 'с начала года';
});

const dashboard = computed(() => {
  const glucose = sortByDateDesc(data.value?.glucose ?? [], record => record.measuredAt);
  const bloodPressure = sortByDateDesc(
    data.value?.bloodPressure ?? [],
    record => record.measuredAt,
  );
  const weight = sortByDateDesc(data.value?.weight ?? [], record => record.measuredAt);
  const symptoms = sortByDateDesc(data.value?.symptoms ?? [], record => record.happenedAt);

  const activeGlucose = glucose.filter(record => !record.ignore);
  const activeBloodPressure = bloodPressure.filter(record => !record.ignore);
  const activeWeight = weight.filter(record => !record.ignore);

  const glucoseValues = activeGlucose.flatMap((record) => {
    const values: number[] = [];

    if (record.fastingValue !== null) {
      values.push(glucoseRawToMmol(record.fastingValue));
    }

    if (record.afterMealValue !== null) {
      values.push(glucoseRawToMmol(record.afterMealValue));
    }

    return values;
  });

  const bloodPressureSystolicValues = activeBloodPressure
    .map(record => record.systolic)
    .filter((value): value is number => value !== null);
  const bloodPressureDiastolicValues = activeBloodPressure
    .map(record => record.diastolic)
    .filter((value): value is number => value !== null);

  const symptomFrequency = symptoms.reduce<Record<string, number>>((accumulator, record) => {
    accumulator[record.type] = (accumulator[record.type] ?? 0) + 1;
    return accumulator;
  }, {});

  const topSymptoms: SymptomFrequency[] = Object.entries(symptomFrequency)
    .map(([label, count]) => ({ label, count }))
    .sort((left, right) => {
      if (right.count !== left.count) {
        return right.count - left.count;
      }

      return left.label.localeCompare(right.label, 'ru');
    })
    .slice(0, 5);

  const latestGlucose = activeGlucose[0];
  const latestBloodPressure = activeBloodPressure[0];
  const weightedRecords = activeWeight.filter(
    (record): record is WeightMeasurement & { value: number } => record.value !== null,
  );
  const latestWeight = weightedRecords[0];
  const oldestWeight = weightedRecords.at(-1);

  const weightChange = latestWeight && oldestWeight
    ? latestWeight.value - oldestWeight.value
    : null;

  const latestEntries = buildLatestEntries({
    bloodPressure,
    glucose,
    symptoms,
    weight,
  });

  const activeRecordCount = activeGlucose.length
    + activeBloodPressure.length
    + activeWeight.length
    + symptoms.length;

  const ignoredRecordCount = (glucose.length - activeGlucose.length)
    + (bloodPressure.length - activeBloodPressure.length)
    + (weight.length - activeWeight.length);

  const latestEntry = latestEntries[0];

  return {
    activeRecordCount,
    bloodPressureAvgDiastolic: average(bloodPressureDiastolicValues),
    bloodPressureAvgSystolic: average(bloodPressureSystolicValues),
    glucoseAvg: average(glucoseValues),
    latestBloodPressure,
    latestEntry,
    latestGlucose,
    latestWeight,
    latestEntries,
    ignoredRecordCount,
    periodLabel: periodLabel.value,
    symptomCount: symptoms.length,
    topSymptoms,
    periodHeadlineSuffix: periodHeadlineSuffix.value,
    weightChange,
  };
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
            {{ dashboard.periodHeadlineSuffix }}
          </span>
        </h1>
        <p class="health-lead">
          Текущее состояние, краткая динамика и последние показатели здоровья.
        </p>

        <div class="health-page-header-filter health-dashboard-filter">
          <PeriodFilter v-model="periodFilters" />
        </div>
      </div>

      <DashboardSummaryPanel
        :active-record-count="dashboard.activeRecordCount"
        :ignored-record-count="dashboard.ignoredRecordCount"
        :latest-entry-title="dashboard.latestEntry?.title"
        :latest-entry-subtitle="dashboard.latestEntry?.subtitle"
      />
    </section>

    <DashboardMetricsGrid
      :glucose-value="getLatestGlucoseValue(dashboard.latestGlucose) !== null ? formatMmol(getLatestGlucoseValue(dashboard.latestGlucose) ?? 0) : '—'"
      :glucose-details="dashboard.glucoseAvg !== null ? `Avg period: ${dashboard.glucoseAvg.toFixed(1)} mmol/L` : 'No active values in the selected period'"
      :pressure-value="dashboard.latestBloodPressure ? `${dashboard.latestBloodPressure.systolic ?? '—'}/${dashboard.latestBloodPressure.diastolic ?? '—'}` : '—'"
      :pressure-details="dashboard.bloodPressureAvgSystolic !== null && dashboard.bloodPressureAvgDiastolic !== null
        ? `Avg period: ${formatBloodPressureAxisValue(dashboard.bloodPressureAvgSystolic)} / ${formatBloodPressureAxisValue(dashboard.bloodPressureAvgDiastolic)} mmHg`
        : 'No active values in the selected period'"
      :weight-value="dashboard.latestWeight ? formatKilograms(dashboard.latestWeight.value) : '—'"
      :weight-details="dashboard.weightChange !== null ? `Change period: ${formatWeightChange(dashboard.weightChange)}` : 'Need at least two measurements for delta'"
      :symptom-value="String(dashboard.symptomCount)"
      :symptom-details="dashboard.topSymptoms.length
        ? `Most frequent: ${dashboard.topSymptoms[0]?.label ?? '—'}`
        : 'No symptom entries in the selected period'"
    />

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
        :period-label="dashboard.periodLabel"
        :total-count="dashboard.symptomCount"
        :top-symptoms="dashboard.topSymptoms"
      />
    </section>

    <div class="health-dashboard-latest">
      <HealthEntryList
        title="Последние показатели"
        :items="dashboard.latestEntries"
      />
    </div>
  </HealthShell>
</template>
