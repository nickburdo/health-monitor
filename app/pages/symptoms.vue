<script setup lang="ts">
type RecordItem = {
  id: string;
  happenedAt: string;
  type: string;
  intensity: number | null;
  note: string | null;
};

const { data } = await useAsyncData('symptoms-page', () =>
  $fetch<RecordItem[]>('/api/symptoms'),
);

useHead({ title: 'Symptoms · Health Monitor' });
</script>

<template>
  <HealthShell>
    <section class="health-page-grid">
      <div class="health-panel health-page-card">
        <div class="health-page-header">
          <div>
            <div class="health-eyebrow">
              Symptoms
            </div>
            <h1 class="health-page-title">
              Симптомы
            </h1>
          </div>
        </div>
      </div>

      <SymptomTable
        :items="data ?? []"
      />
    </section>
  </HealthShell>
</template>
