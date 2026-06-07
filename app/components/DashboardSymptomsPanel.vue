<script setup lang="ts">
import type { DashboardData } from '~/types/dashboard';

type SymptomFrequency = {
  count: number;
  label: string;
};

const props = defineProps<{
  data: DashboardData;
  title?: string;
}>();

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
  };
});

const maxCount = computed(() => {
  const counts = dashboard.value.topSymptoms.map(item => item.count);

  return counts.length ? Math.max(...counts) : 1;
});

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
          {{ title ?? 'Симптомы' }}
        </h2>
        <p class="health-dashboard-symptoms-subtitle">
          Сколько раз симптомы были отмечены за выбранный период
        </p>
      </div>
    </header>

    <div
      v-if="dashboard.topSymptoms.length"
      class="health-dashboard-symptoms-bars"
    >
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
  align-content: start;
  gap: 18px;
}

.health-dashboard-symptoms-header {
  display: grid;
  gap: 6px;
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
  height: 18px;
  border-radius: 999px;
  background: rgba(59, 130, 246, 0.12);
}

.health-dashboard-symptoms-fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.24);
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
</style>
