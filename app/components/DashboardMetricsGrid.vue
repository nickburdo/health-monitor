<script setup lang="ts">
import type { DashboardData } from '~/types/dashboard';
import { formatBloodPressureAxisValue } from '~/utils/health-line-chart/blood-pressure';

const props = defineProps<{
  data: DashboardData;
}>();

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

function formatMmol(value: number) {
  return `${value.toFixed(1)}`;
}

function formatKilograms(value: number) {
  return `${value.toFixed(1)}`;
}

function formatWeightChange(value: number) {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)} kg`;
}

function getLatestGlucoseValue(record?: DashboardData['glucose'][number]) {
  if (!record) {
    return null;
  }

  const rawValue = record.afterMealValue ?? record.fastingValue;

  return rawValue === null || rawValue === undefined
    ? null
    : glucoseRawToMmol(rawValue);
}

function formatGlucoseDisplay(record?: DashboardData['glucose'][number]) {
  const value = getLatestGlucoseValue(record);
  return value !== null ? formatMmol(value) : '—';
}

const dashboard = computed(() => {
  const glucose = sortByDateDesc(props.data.glucose, record => record.measuredAt);
  const bloodPressure = sortByDateDesc(props.data.bloodPressure, record => record.measuredAt);
  const weight = sortByDateDesc(props.data.weight, record => record.measuredAt);
  const symptoms = sortByDateDesc(props.data.symptoms, record => record.happenedAt);

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

  const topSymptoms = Object.entries(symptomFrequency)
    .map(([label, count]) => ({ label, count }))
    .sort((left, right) => {
      if (right.count !== left.count) {
        return right.count - left.count;
      }

      return left.label.localeCompare(right.label, 'en');
    })
    .slice(0, 5);

  const latestGlucose = activeGlucose[0];
  const latestBloodPressure = activeBloodPressure[0];
  const weightedRecords = activeWeight.filter(
    (record): record is DashboardData['weight'][number] & { value: number } => record.value !== null,
  );
  const latestWeight = weightedRecords[0];
  const oldestWeight = weightedRecords.at(-1);

  return {
    bloodPressureAvgDiastolic: average(bloodPressureDiastolicValues),
    bloodPressureAvgSystolic: average(bloodPressureSystolicValues),
    glucoseAvg: average(glucoseValues),
    latestBloodPressure,
    latestGlucose,
    latestWeight,
    symptomCount: symptoms.length,
    topSymptoms,
    weightChange: latestWeight && oldestWeight
      ? latestWeight.value - oldestWeight.value
      : null,
  };
});
</script>

<template>
  <section class="health-meta-grid">
    <HealthMetricCard
      label="Glucose"
      tone="glucose"
      :value="formatGlucoseDisplay(dashboard.latestGlucose)"
      unit="mmol/L"
      :details="dashboard.glucoseAvg !== null ? `Average for period: ${dashboard.glucoseAvg.toFixed(1)} mmol/L` : 'No active values for the selected period'"
    />
    <HealthMetricCard
      label="Blood pressure"
      tone="pressure"
      :value="dashboard.latestBloodPressure ? `${dashboard.latestBloodPressure.systolic ?? '—'}/${dashboard.latestBloodPressure.diastolic ?? '—'}` : '—'"
      :details="dashboard.bloodPressureAvgSystolic !== null && dashboard.bloodPressureAvgDiastolic !== null
        ? `Average for period: ${formatBloodPressureAxisValue(dashboard.bloodPressureAvgSystolic)} / ${formatBloodPressureAxisValue(dashboard.bloodPressureAvgDiastolic)} mmHg`
        : 'No active values for the selected period'"
    />
    <HealthMetricCard
      label="Weight"
      tone="weight"
      :value="dashboard.latestWeight ? formatKilograms(dashboard.latestWeight.value) : '—'"
      unit="kg"
      :details="dashboard.weightChange !== null ? `Change over period: ${formatWeightChange(dashboard.weightChange)}` : 'At least two entries are needed to calculate the change'"
    />
    <HealthMetricCard
      label="Symptoms"
      tone="symptoms"
      :value="String(dashboard.symptomCount)"
      unit="entries"
      :details="dashboard.topSymptoms.length
        ? `Most frequent: ${dashboard.topSymptoms[0]?.label ?? '—'}`
        : 'No symptom entries for the selected period'"
    />
  </section>
</template>
