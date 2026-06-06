<script setup lang="ts">
type RecordItem = {
  id: string;
  measuredAt: string;
  value: number | null;
  ignore: boolean;
  note: string | null;
};

const { data } = await useAsyncData('weight-page', () =>
  $fetch<RecordItem[]>('/api/weight'),
);

useHead({ title: 'Weight · Health Monitor' });
</script>

<template>
  <HealthShell>
    <section class="health-page-grid">
      <div class="health-panel health-page-card">
        <div class="health-page-header">
          <div>
            <div class="health-eyebrow">
              Weight
            </div>
            <h1 class="health-page-title">
              Вес
            </h1>
          </div>
        </div>
      </div>

      <WeightTable
        :items="data ?? []"
      />
    </section>
  </HealthShell>
</template>
