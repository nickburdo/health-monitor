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

function formatBloodPressurePair(
  record: DashboardData['bloodPressure'][number],
) {
  const systolic = record.systolic ?? '—';
  const diastolic = record.diastolic ?? '—';
  return `${systolic}/${diastolic} мм рт. ст.`;
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
  const values: string[] = [formatBloodPressurePair(record)];

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

const items = computed<LatestEntry[]>(() => {
  const entries: LatestEntry[] = [
    ...props.data.glucose.map(record => ({
      title: 'Глюкоза',
      subtitle: `${formatWhen(record.measuredAt)} · ${formatGlucoseEntryValue(record)}`,
      ignored: record.ignore,
      timestamp: new Date(record.measuredAt).getTime(),
    })),
    ...props.data.bloodPressure.map(record => ({
      title: 'Давление',
      subtitle: `${formatWhen(record.measuredAt)} · ${formatBloodPressureEntryValue(record)}`,
      ignored: record.ignore,
      timestamp: new Date(record.measuredAt).getTime(),
    })),
    ...props.data.weight.map(record => ({
      title: 'Вес',
      subtitle: `${formatWhen(record.measuredAt)} · ${record.value !== null ? formatWeightValue(record.value) : '—'}`,
      ignored: record.ignore,
      timestamp: new Date(record.measuredAt).getTime(),
    })),
    ...props.data.symptoms.map(record => ({
      title: `Симптом: ${record.type}`,
      subtitle: `${formatWhen(record.happenedAt)} · ${formatSymptomEntryValue(record)}`,
      timestamp: new Date(record.happenedAt).getTime(),
    })),
  ];

  return entries.sort((left, right) => right.timestamp - left.timestamp).slice(0, 6);
});
</script>

<template>
  <div class="health-dashboard-latest">
    <HealthEntryList
      title="Последние показатели"
      :items="items"
    />
  </div>
</template>
