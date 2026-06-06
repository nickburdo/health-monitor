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

function glucoseToMmol(value: number | null) {
  return value === null ? null : value / 18;
}

const page = computed(() => {
  const items = data.value ?? [];
  const latest = items[0];
  const ignored = items.filter(item => item.ignore);

  return {
    latest,
    items,
    stats: [
      {
        label: 'Последняя',
        tone: 'glucose' as const,
        value: latest
          ? glucoseToMmol(latest.afterMealValue ?? latest.fastingValue ?? 0)?.toFixed(1) ?? '—'
          : '—',
        unit: 'mmol/L',
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
  };
});

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
            <p class="health-page-lead">
              Таблица измерений глюкозы с подтверждением игнорирования через
              note.
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

      <GlucoseTable
        :items="page.items"
      />
    </section>
  </HealthShell>
</template>
