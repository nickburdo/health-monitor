<script setup lang="ts">
import type { DashboardData } from '~/types/dashboard';
import { formatWhen } from '~/utils/date-format';
import { formatGlucoseValue } from '~/utils/health-line-chart/glucose';
import { formatWeightValue } from '~/utils/health-line-chart/weight';

type LatestEntry = {
  ignored?: boolean;
  subtitle: string;
  timestamp: number;
  title: string;
};

const props = defineProps<{
  data: DashboardData;
}>();

function sortByDateDesc<T>(items: T[], getDate: (item: T) => string) {
  return [...items].sort((left, right) => {
    return new Date(getDate(right)).getTime() - new Date(getDate(left)).getTime();
  });
}

function formatGlucoseEntryValue(record: DashboardData['glucose'][number]) {
  const values: string[] = [];

  if (record.fastingValue !== null) {
    values.push(`натощак ${formatGlucoseValue(record.fastingValue)}`);
  }

  if (record.afterMealValue !== null) {
    values.push(`после еды ${formatGlucoseValue(record.afterMealValue)}`);
  }

  return values.length ? values.join(' / ') : '—';
}

function formatBloodPressureEntryValue(record: DashboardData['bloodPressure'][number]) {
  const systolic = record.systolic ?? '—';
  const diastolic = record.diastolic ?? '—';
  const values: string[] = [`${systolic}/${diastolic} мм рт. ст.`];

  if (record.pulse !== null) {
    values.push(`пульс ${record.pulse} уд/мин`);
  }

  return values.join(' · ');
}

function formatSymptomEntryValue(record: DashboardData['symptoms'][number]) {
  const parts = [`балл ${record.intensity ?? '—'}`];

  if (record.note) {
    parts.push(record.note);
  }

  return parts.join(' · ');
}

function buildLatestEntries(dataSet: DashboardData) {
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

const dashboard = computed(() => {
  const glucose = sortByDateDesc(props.data.glucose, record => record.measuredAt);
  const bloodPressure = sortByDateDesc(props.data.bloodPressure, record => record.measuredAt);
  const weight = sortByDateDesc(props.data.weight, record => record.measuredAt);

  const activeGlucose = glucose.filter(record => !record.ignore);
  const activeBloodPressure = bloodPressure.filter(record => !record.ignore);
  const activeWeight = weight.filter(record => !record.ignore);
  const latestEntries = buildLatestEntries(props.data);

  return {
    activeRecordCount:
      activeGlucose.length + activeBloodPressure.length + activeWeight.length + props.data.symptoms.length,
    ignoredRecordCount:
      (glucose.length - activeGlucose.length)
      + (bloodPressure.length - activeBloodPressure.length)
      + (weight.length - activeWeight.length),
    latestEntry: latestEntries[0],
  };
});
</script>

<template>
  <aside class="health-panel health-panel-soft health-card health-dashboard-summary">
    <div class="health-dashboard-summary-list">
      <div class="health-dashboard-summary-row">
        <span>Активные записи</span>
        <strong>{{ dashboard.activeRecordCount }}</strong>
      </div>
      <div class="health-dashboard-summary-row">
        <span>Игнорируемые записи</span>
        <strong>{{ dashboard.ignoredRecordCount }}</strong>
      </div>
      <div class="health-dashboard-summary-row health-dashboard-summary-row-wide">
        <span>Последняя активность</span>
        <strong>{{ dashboard.latestEntry?.title ?? '—' }}</strong>
        <small>{{ dashboard.latestEntry?.subtitle ?? 'Нет данных за период' }}</small>
      </div>
    </div>
  </aside>
</template>
