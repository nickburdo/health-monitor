<script setup lang="ts">
type RecordItem = {
  id: string;
  happenedAt: string;
  type: string;
  intensity: number | null;
  ignore: boolean;
  note: string | null;
};

const formatDate = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'short',
});

const { data } = await useAsyncData('symptoms-page', () =>
  $fetch<RecordItem[]>('/api/symptoms'),
);

const page = computed(() => {
  const items = data.value ?? [];
  const ignored = items.filter(item => item.ignore);

  return {
    stats: [
      {
        label: 'Записей',
        tone: 'symptoms' as const,
        value: String(items.length),
      },
      {
        label: 'Ignored',
        tone: 'pressure' as const,
        value: String(ignored.length),
      },
      {
        label: 'Последняя',
        tone: 'glucose' as const,
        value: items[0]?.intensity?.toString() ?? '—',
        unit: 'балл',
      },
    ],
    items: items.map(item => ({
      title: item.type,
      subtitle: `${formatDate.format(new Date(item.happenedAt))} · ${
        item.intensity ?? '—'
      } балл`,
      badge: item.ignore ? 'Ignored' : 'OK',
      ignored: item.ignore,
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
              Журнал симптомов с привычным списком, интенсивностью и отметкой
              ignored для некорректных строк.
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

      <HealthEntryList
        title="История"
        :items="page.items"
      />
    </section>
  </HealthShell>
</template>
