<script setup lang="ts">
import type { WeightMeasurement } from '~/types/weight';

const { periodFilters, data } = await useMeasurementListPage<WeightMeasurement>({
  key: 'weight-page',
  endpoint: '/api/weight',
});

useHead({ title: 'Weight · Health Monitor' });
</script>

<template>
  <HealthShell>
    <MeasurementPageShell
      eyebrow="Weight"
      title="Вес"
    >
      <template #filter>
        <PeriodFilter v-model="periodFilters" />
      </template>
      <WeightTable
        :items="data ?? []"
      />
    </MeasurementPageShell>
  </HealthShell>
</template>
