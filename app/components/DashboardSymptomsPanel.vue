<script setup lang="ts">
import type { PeriodFilterValue } from '~/composables/usePeriodFilter';
import type { DashboardData } from '~/types/dashboard';
import { formatPeriodShortDate } from '~/composables/usePeriodFilter';

type SymptomFrequency = {
  count: number;
  label: string;
};

const props = defineProps<{
  data: DashboardData;
  periodFilters: PeriodFilterValue;
  title?: string;
}>();

const periodLabel = computed(() => {
  const value = props.periodFilters;

  if (value.preset === 'custom') {
    const from = formatPeriodShortDate(value.dateFrom);
    const to = formatPeriodShortDate(value.dateTo);
    return from && to ? `${from} - ${to}` : 'Произвольный период';
  }

  if (value.preset === '3m') {
    return 'Последние 3 месяца';
  }

  if (value.preset === '6m') {
    return 'Последние 6 месяцев';
  }

  return 'С начала года';
});

const dashboard = computed(() => {
  const symptomFrequency = props.data.symptoms.reduce<Record<string, number>>((accumulator, record) => {
    accumulator[record.type] = (accumulator[record.type] ?? 0) + 1;
    return accumulator;
  }, {});

  const topSymptoms: SymptomFrequency[] = Object.entries(symptomFrequency)
    .map(([label, count]) => ({ label, count }))
    .sort((left, right) => {
      if (right.count !== left.count) {
        return right.count - left.count;
      }

      return left.label.localeCompare(right.label, 'ru');
    })
    .slice(0, 5);

  return {
    topSymptoms,
    totalCount: props.data.symptoms.length,
  };
});

const maxCount = computed(() => {
  const counts = dashboard.value.topSymptoms.map(item => item.count);

  return counts.length ? Math.max(...counts) : 1;
});

const leadingSymptom = computed(() => dashboard.value.topSymptoms[0]);

function barWidth(count: number) {
  const width = (count / maxCount.value) * 100;

  return `${Math.max(12, width)}%`;
}
</script>

<template>
  <article class="health-panel health-chart health-dashboard-symptoms">
    <header class="health-dashboard-symptoms-header">
      <div class="health-dashboard-symptoms-copy">
        <h2 class="health-section-title">
          {{ title ?? 'Symptoms' }}
        </h2>
        <p class="health-dashboard-symptoms-subtitle">
          {{ periodLabel }}
        </p>
      </div>

      <span class="health-dashboard-symptoms-pill">
        Frequency
      </span>
    </header>

    <div
      v-if="dashboard.topSymptoms.length"
      class="health-dashboard-symptoms-body"
    >
      <div class="health-dashboard-symptoms-summary">
        <div class="health-dashboard-symptoms-stat">
          <span>Entries</span>
          <strong>{{ dashboard.totalCount }}</strong>
        </div>
        <div class="health-dashboard-symptoms-stat">
          <span>Most frequent</span>
          <strong>{{ leadingSymptom?.label ?? '—' }}</strong>
        </div>
      </div>

      <div class="health-dashboard-symptoms-bars">
        <div
          v-for="symptom in dashboard.topSymptoms"
          :key="symptom.label"
          class="health-dashboard-symptoms-row"
        >
          <div class="health-dashboard-symptoms-row-head">
            <span>{{ symptom.label }}</span>
            <strong>{{ symptom.count }}</strong>
          </div>
          <div class="health-dashboard-symptoms-track">
            <div
              class="health-dashboard-symptoms-fill"
              :style="{ width: barWidth(symptom.count) }"
            />
          </div>
        </div>
      </div>
    </div>

    <div
      v-else
      class="health-dashboard-symptoms-empty"
    >
      Нет записей симптомов за выбранный период.
    </div>
  </article>
</template>

<style scoped>
.health-dashboard-symptoms {
  display: grid;
  gap: 18px;
}

.health-dashboard-symptoms-header {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 12px;
}

.health-dashboard-symptoms-copy {
  display: grid;
  gap: 6px;
}

.health-dashboard-symptoms-subtitle {
  margin: 0;
  color: var(--muted);
  font-size: 13px;
  line-height: 1.5;
}

.health-dashboard-symptoms-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 7px 11px;
  border-radius: 999px;
  background: var(--primary-soft);
  color: var(--primary-dark);
  font-size: 12px;
  font-weight: 800;
  white-space: nowrap;
}

.health-dashboard-symptoms-body {
  display: grid;
  gap: 16px;
}

.health-dashboard-symptoms-summary {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.health-dashboard-symptoms-stat {
  display: grid;
  gap: 4px;
  padding: 14px 16px;
  border-radius: 18px;
  border: 1px solid var(--border);
  background: rgba(255, 250, 243, 0.72);
}

.health-dashboard-symptoms-stat span {
  color: var(--muted);
  font-size: 12px;
  font-weight: 750;
}

.health-dashboard-symptoms-stat strong {
  color: var(--text);
  font-size: 18px;
  line-height: 1.1;
  letter-spacing: -0.03em;
}

.health-dashboard-symptoms-bars {
  display: grid;
  gap: 12px;
}

.health-dashboard-symptoms-row {
  display: grid;
  gap: 8px;
}

.health-dashboard-symptoms-row-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  color: var(--text);
}

.health-dashboard-symptoms-row-head span {
  font-size: 14px;
  font-weight: 750;
  line-height: 1.4;
}

.health-dashboard-symptoms-row-head strong {
  color: var(--muted);
  font-size: 13px;
  font-weight: 750;
}

.health-dashboard-symptoms-track {
  overflow: hidden;
  height: 12px;
  border-radius: 999px;
  background: rgba(196, 181, 253, 0.14);
}

.health-dashboard-symptoms-fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--symptoms), #ddd6fe);
}

.health-dashboard-symptoms-empty {
  min-height: 192px;
  display: grid;
  place-items: center;
  border-radius: 22px;
  border: 1px dashed var(--border);
  color: var(--muted);
  background: rgba(255, 250, 243, 0.58);
  text-align: center;
  padding: 24px;
}

@media (max-width: 640px) {
  .health-dashboard-symptoms-summary {
    grid-template-columns: 1fr;
  }
}
</style>
