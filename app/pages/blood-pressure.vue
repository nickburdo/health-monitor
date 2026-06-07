<script setup lang="ts">
type RecordItem = {
  id: string;
  measuredAt: string;
  systolic: number | null;
  diastolic: number | null;
  pulse: number | null;
  ignore: boolean;
  note: string | null;
};
const { periodFilters, data } = await useMeasurementListPage<RecordItem>({
  key: 'blood-pressure-page',
  endpoint: '/api/blood-pressure',
});

useHead({ title: 'Blood Pressure · Health Monitor' });
</script>

<template>
  <HealthShell>
    <section class="health-page-grid">
      <div class="health-panel health-page-card">
        <HealthPageHeaderWithFilter
          eyebrow="Blood pressure"
          title="Давление"
        >
          <PeriodFilter v-model="periodFilters" />
        </HealthPageHeaderWithFilter>
      </div>

      <BloodPressureTable
        :items="data ?? []"
      />
    </section>
  </HealthShell>
</template>
