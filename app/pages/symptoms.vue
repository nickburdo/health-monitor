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

const page = computed(() => {
  const items = data.value ?? [];
  const noteCount = items.filter(item => item.note?.trim()).length;

  return {
    stats: [
      {
        label: 'Записей',
        tone: 'symptoms' as const,
        value: String(items.length),
      },
      {
        label: 'С заметкой',
        tone: 'pressure' as const,
        value: String(noteCount),
      },
      {
        label: 'Последняя',
        tone: 'glucose' as const,
        value: items[0]?.intensity?.toString() ?? '—',
        unit: 'балл',
      },
    ],
    items: items.map(item => ({
      id: item.id,
      happenedAt: item.happenedAt,
      type: item.type,
      intensity: item.intensity,
      note: item.note,
    })),
  };
});

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
            <p class="health-page-lead">
              Журнал симптомов с таблицей, интенсивностью и редактируемой
              заметкой.
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

      <SymptomTable
        :items="page.items"
      />
    </section>
  </HealthShell>
</template>
