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

const page = computed(() => {
  const items = data.value ?? [];
  const latest = items[0];
  const ignored = items.filter(item => item.ignore);

  return {
    stats: [
      {
        label: 'Последний',
        tone: 'weight' as const,
        value: latest?.value?.toFixed(1) ?? '—',
        unit: 'kg',
      },
      {
        label: 'Всего',
        tone: 'pressure' as const,
        value: String(items.length),
      },
      {
        label: 'Ignored',
        tone: 'symptoms' as const,
        value: String(ignored.length),
      },
    ],
    items,
  };
});

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
            <p class="health-page-lead">
              Таблица веса с подтверждением игнорирования через note и прямым
              восстановлением записи.
            </p>
          </div>
        </div>
      </div>

      <section class="health-page-stats">
        <HealthMetricCard
          v-for="stat in page.stats"
          :key="stat.label"
          :label="stat.label"
          :tone="stat.tone"
          :value="stat.value"
          :unit="stat.unit"
        />
      </section>

      <WeightTable
        :items="page.items"
      />
    </section>
  </HealthShell>
</template>
