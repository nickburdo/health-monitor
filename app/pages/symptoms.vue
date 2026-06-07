<script setup lang="ts">
import DashboardSymptomsPanel from '~/components/DashboardSymptomsPanel.vue';
import type { DashboardData } from '~/types/dashboard';
import type { SymptomMeasurement } from '~/types/symptom';

const { periodFilters, data } = await useMeasurementListPage<SymptomMeasurement>({
  key: 'symptoms-page',
  endpoint: '/api/symptoms',
});

const emptyDashboardData: DashboardData = {
  bloodPressure: [],
  glucose: [],
  symptoms: [],
  weight: [],
};

const symptomPanelData = computed(() => ({
  ...emptyDashboardData,
  symptoms: data.value ?? [],
}));

useHead({ title: 'Symptoms · Health Monitor' });
</script>

<template>
  <HealthShell>
    <MeasurementPageShell
      eyebrow="Symptoms"
      title="Симптомы"
    >
      <template #filter>
        <PeriodFilter v-model="periodFilters" />
      </template>
      <DashboardSymptomsPanel
        :data="symptomPanelData"
      />
      <SymptomTable
        :items="data ?? []"
      />
    </MeasurementPageShell>
  </HealthShell>
</template>
