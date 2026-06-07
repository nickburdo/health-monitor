<script setup lang="ts">
type RecordItem = {
  id: string;
  happenedAt: string;
  type: string;
  intensity: number | null;
  note: string | null;
};
const { periodFilters, data } = await useMeasurementListPage<RecordItem>({
  key: 'symptoms-page',
  endpoint: '/api/symptoms',
});

useHead({ title: 'Symptoms · Health Monitor' });
</script>

<template>
  <HealthShell>
    <section class="health-page-grid">
      <div class="health-panel health-page-card">
        <HealthPageHeaderWithFilter
          eyebrow="Symptoms"
          title="Симптомы"
        >
          <PeriodFilter v-model="periodFilters" />
        </HealthPageHeaderWithFilter>
      </div>

      <SymptomTable
        :items="data ?? []"
      />
    </section>
  </HealthShell>
</template>
