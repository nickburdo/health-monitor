<script setup lang="ts">
type RecordItem = {
  id: string;
  measuredAt: string;
  fastingValue: number | null;
  afterMealValue: number | null;
  ignore: boolean;
  note: string | null;
};

const { data } = await useAsyncData('glucose-page', () =>
  $fetch<RecordItem[]>('/api/glucose'),
);

useHead({ title: 'Glucose · Health Monitor' });
</script>

<template>
  <HealthShell>
    <section class="health-page-grid">
      <div class="health-panel health-page-card">
        <div class="health-page-header">
          <div>
            <div class="health-eyebrow">
              Glucose
            </div>
            <h1 class="health-page-title">
              Глюкоза
            </h1>
          </div>
        </div>
      </div>

      <GlucoseTable
        :items="data ?? []"
      />
    </section>
  </HealthShell>
</template>
