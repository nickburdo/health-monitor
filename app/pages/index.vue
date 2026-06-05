<script setup lang="ts">
type GlucoseRecord = {
  id: string;
  measuredAt: string;
  fastingValue: number | null;
  afterMealValue: number | null;
  ignore: boolean;
  note: string | null;
};

type BloodPressureRecord = {
  id: string;
  measuredAt: string;
  systolic: number | null;
  diastolic: number | null;
  pulse: number | null;
  ignore: boolean;
  note: string | null;
};

type WeightRecord = {
  id: string;
  measuredAt: string;
  value: number | null;
  ignore: boolean;
  note: string | null;
};

type SymptomRecord = {
  id: string;
  happenedAt: string;
  type: string;
  intensity: number | null;
  ignore: boolean;
  note: string | null;
};

const periodOptions = [
  { label: '1 месяц', days: 30 },
  { label: '3 месяца', days: 90 },
  { label: '6 месяцев', days: 180 },
  { label: 'С начала года', days: 365 },
] as const;

const selectedPeriod = ref<(typeof periodOptions)[number]['label']>('1 месяц');
const { data } = await useAsyncData('dashboard-data', async () => {
  const [glucose, bloodPressure, weight, symptoms] = await Promise.all([
    $fetch<GlucoseRecord[]>('/api/glucose'),
    $fetch<BloodPressureRecord[]>('/api/blood-pressure'),
    $fetch<WeightRecord[]>('/api/weight'),
    $fetch<SymptomRecord[]>('/api/symptoms'),
  ]);

  return { glucose, bloodPressure, weight, symptoms };
});

function parseDate(value: string) {
  return new Date(value);
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function periodStart(days: number) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - days + 1);
  return start;
}

function inSelectedPeriod(value: string) {
  const option = periodOptions.find(entry => entry.label === selectedPeriod.value);
  if (!option) {
    return true;
  }

  return parseDate(value) >= periodStart(option.days);
}

function glucoseToMmol(value: number | null) {
  if (value === null) {
    return null;
  }

  return value / 18;
}

const dashboard = computed(() => {
  const glucose = (data.value?.glucose ?? []).filter(record =>
    inSelectedPeriod(record.measuredAt),
  );
  const bloodPressure = (data.value?.bloodPressure ?? []).filter(record =>
    inSelectedPeriod(record.measuredAt),
  );
  const weight = (data.value?.weight ?? []).filter(record =>
    inSelectedPeriod(record.measuredAt),
  );
  const symptoms = (data.value?.symptoms ?? []).filter(record =>
    inSelectedPeriod(record.happenedAt),
  );

  const latestGlucose = glucose[0];
  const latestBloodPressure = bloodPressure[0];
  const latestWeight = weight[0];
  const latestSymptom = symptoms[0];
  const symptomCount = symptoms.filter((item) => {
    const happenedAt = startOfDay(parseDate(item.happenedAt));
    const today = startOfDay(new Date());
    return (
      today.getTime() - happenedAt.getTime() <= 6 * 86400000
      && today.getTime() - happenedAt.getTime() >= 0
    );
  }).length;

  const glucoseTrend = glucose
    .slice(0, 8)
    .reverse()
    .map((record) => {
      const value = record.afterMealValue ?? record.fastingValue ?? 0;
      return {
        height: Math.max(36, Math.min(84, (glucoseToMmol(value) ?? 0) * 12)),
      };
    });

  const latestEntries: Array<{
    title: string;
    subtitle: string;
    badge: string;
    ignored?: boolean;
  }> = [
    {
      title: 'Глюкоза после еды',
      subtitle: 'Сегодня · 8.4 ммоль/л',
      badge: 'OK',
    },
    {
      title: 'Артериальное давление',
      subtitle: 'Вчера · 128 / 82',
      badge: 'OK',
    },
    {
      title: 'Вес',
      subtitle: '3 июня · 91.4 кг',
      badge: 'OK',
    },
    {
      title: 'Глюкоза натощак',
      subtitle: '1 июня · suspicious input',
      badge: 'Ignored',
      ignored: true,
    },
  ];

  return {
    latestGlucose,
    latestBloodPressure,
    latestWeight,
    latestSymptom,
    symptomCount,
    glucoseTrend,
    latestEntries,
  };
});

useHead({
  title: 'Health Monitor',
});

useSeoMeta({
  title: 'Health Monitor',
  description: 'Тёплый экран мониторинга здоровья с быстрым вводом и историей.',
});
</script>

<template>
  <HealthShell>
    <section class="health-hero">
      <div class="health-panel health-hero-main">
        <div class="health-eyebrow">
          Pastel health dashboard · orange accent
        </div>
        <h1 class="health-title">
          Спокойный мониторинг здоровья без лишнего шума
        </h1>
        <p class="health-lead">
          Быстрый ввод глюкозы, давления, веса и симптомов. Ошибочные значения
          остаются в истории, но не участвуют в статистике благодаря флагу
          ignore.
        </p>

        <div
          class="health-pills"
          role="tablist"
          aria-label="Period filter"
        >
          <button
            v-for="option in periodOptions"
            :key="option.label"
            type="button"
            class="health-pill"
            :data-active="selectedPeriod === option.label"
            @click="selectedPeriod = option.label"
          >
            {{ option.label }}
          </button>
        </div>
      </div>

      <aside class="health-panel health-panel-soft health-card">
        <div>
          <h2>Quick Entry</h2>
          <div class="health-input-sample">
            <div class="health-input-line">
              Glucose · fasting · 6.1 mmol/L
            </div>
            <div class="health-input-line">
              Blood pressure · 128 / 82
            </div>
            <div class="health-input-line">
              Weight · 91.4 kg
            </div>
          </div>
        </div>
        <button
          type="button"
          class="health-button"
        >
          Save entry
        </button>
      </aside>
    </section>

    <section class="health-meta-grid">
      <HealthMetricCard
        label="Glucose"
        tone="glucose"
        :value="dashboard.latestGlucose ? glucoseToMmol(dashboard.latestGlucose.afterMealValue ?? dashboard.latestGlucose.fastingValue ?? 0)?.toFixed(1) ?? '—' : '—'"
        unit="mmol/L"
      />
      <HealthMetricCard
        label="Pressure"
        tone="pressure"
        :value="dashboard.latestBloodPressure ? `${dashboard.latestBloodPressure.systolic ?? '—'}/${dashboard.latestBloodPressure.diastolic ?? '—'}` : '—'"
      />
      <HealthMetricCard
        label="Weight"
        tone="weight"
        :value="dashboard.latestWeight ? dashboard.latestWeight.value?.toFixed(1) ?? '—' : '—'"
        unit="kg"
      />
      <HealthMetricCard
        label="Symptoms"
        tone="symptoms"
        :value="String(dashboard.symptomCount)"
        unit="this week"
      />
    </section>

    <section class="health-grid">
      <article class="health-panel health-chart">
        <h2 class="health-section-title">
          Glucose trend
        </h2>
        <HealthTrendBars :bars="dashboard.glucoseTrend" />
      </article>

      <HealthEntryList
        title="Latest entries"
        :items="dashboard.latestEntries"
      />
    </section>
  </HealthShell>
</template>
