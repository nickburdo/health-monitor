<script setup lang="ts">
import DashboardSymptomsPanel from '~/components/DashboardSymptomsPanel.vue';
import type { SymptomMeasurement } from '~/types/symptom';

const { periodFilters, data } = await useMeasurementListPage<SymptomMeasurement>({
  key: 'symptoms-page',
  endpoint: '/api/symptoms',
});

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
        :symptoms="data ?? []"
      />
      <SymptomTable
        :items="data ?? []"
      />
    </MeasurementPageShell>
  </HealthShell>
</template>
