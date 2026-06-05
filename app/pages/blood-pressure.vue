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

const formatDate = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'short',
});

const { data } = await useAsyncData('blood-pressure-page', () =>
  $fetch<RecordItem[]>('/api/blood-pressure'),
);

const page = computed(() => {
  const items = data.value ?? [];
  const latest = items[0];
  const ignored = items.filter(item => item.ignore);

  return {
    stats: [
      {
        label: 'Последнее',
        tone: 'pressure' as const,
        value: latest ? `${latest.systolic ?? '—'}/${latest.diastolic ?? '—'}` : '—',
      },
      {
        label: 'Пульс',
        tone: 'glucose' as const,
        value: latest?.pulse ? String(latest.pulse) : '—',
        unit: 'bpm',
      },
      {
        label: 'Ignored',
        tone: 'symptoms' as const,
        value: String(ignored.length),
      },
    ],
    items: items.map(item => ({
      title: 'Артериальное давление',
      subtitle: `${formatDate.format(new Date(item.measuredAt))} · ${
        item.systolic ?? '—'
      } / ${item.diastolic ?? '—'}${item.pulse ? ` · ${item.pulse} bpm` : ''}`,
      badge: item.ignore ? 'Ignored' : 'OK',
      ignored: item.ignore,
    })),
  };
});

useHead({ title: 'Blood Pressure · Health Monitor' });
</script>

<template>
  <HealthShell>
    <section class="health-page-grid">
      <div class="health-panel health-page-card">
        <div class="health-page-header">
          <div>
            <div class="health-eyebrow">
              Blood pressure
            </div>
            <h1 class="health-page-title">
              Давление
            </h1>
            <p class="health-page-lead">
              Сводка по давлению, пульсу и отметкам для записи с ошибочными
              значениями.
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
