<script setup lang="ts">
import DashboardSymptomsPanel from '~/components/DashboardSymptomsPanel.vue';
import type { SymptomEntry } from '~/types/symptom';
import { listSymptomEntries } from '~/lib/db/repositories/symptomRepository';
import { downloadCsv, toCsv } from '~/lib/db/csv';

const { periodFilters, data, refresh } = await useMeasurementList<SymptomEntry>(
  listSymptomEntries,
);

function exportCsv() {
  const csvContent = toCsv(data.value, ['happenedAt', 'type', 'intensity', 'note']);

  downloadCsv(`symptoms-${new Date().toISOString().slice(0, 10)}.csv`, csvContent);
}

useHead({ title: 'Symptoms · Health Monitor' });
</script>

<template>
  <HealthShell>
    <MeasurementPageShell eyebrow="Symptoms" title="Symptoms">
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
      <DashboardSymptomsPanel :symptoms="data ?? []" />
      <SymptomTable
        :items="data ?? []"
        :on-updated="refresh"
      />
    </MeasurementPageShell>
  </HealthShell>
</template>
