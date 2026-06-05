<script setup lang="ts">
type RecordItem = {
  id: string;
  measuredAt: string;
  value: number | null;
  ignore: boolean;
  note: string | null;
};

const formatDate = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'short',
});

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
    items: items.map(item => ({
      title: 'Вес',
      subtitle: `${formatDate.format(new Date(item.measuredAt))} · ${
        item.value?.toFixed(1) ?? '—'
      } кг`,
      badge: item.ignore ? 'Ignored' : 'OK',
      ignored: item.ignore,
    })),
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
              Последние измерения веса и простой список истории с отметкой
              ignored для плохих записей.
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
