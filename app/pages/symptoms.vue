<script setup lang="ts">
import DashboardSymptomsPanel from '~/components/DashboardSymptomsPanel.vue';
import type { SymptomEntry } from '~/types/symptom';

const { periodFilters, data } = await useMeasurementListPage<SymptomEntry>({
  key: 'symptoms-page',
  endpoint: '/api/symptoms',
});

useHead({ title: 'Symptoms · Health Monitor' });
</script>

<template>
  <HealthShell>
    <MeasurementPageShell eyebrow="Symptoms" title="Symptoms">
      <template #filter>
        <PeriodFilter v-model="periodFilters" />
      </template>
      <DashboardSymptomsPanel :symptoms="data ?? []" />
      <SymptomTable :items="data ?? []" />
    </MeasurementPageShell>
  </HealthShell>
</template>
