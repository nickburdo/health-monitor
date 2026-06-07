<script setup lang="ts">
import type { GlucoseMeasurement } from '~/types/glucose';

const { periodFilters, data } = await useMeasurementListPage<GlucoseMeasurement>({
  key: 'glucose-page',
  endpoint: '/api/glucose',
});

useHead({ title: 'Glucose · Health Monitor' });
</script>

<template>
  <HealthShell>
    <MeasurementPageShell
      eyebrow="Glucose"
      title="Глюкоза"
    >
      <template #filter>
        <PeriodFilter v-model="periodFilters" />
      </template>
      <GlucoseChart :items="data ?? []" />
      <GlucoseTable
        :items="data ?? []"
      />
    </MeasurementPageShell>
  </HealthShell>
</template>
