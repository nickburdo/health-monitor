<script setup lang="ts">
import type { SymptomMeasurement } from '~/types/symptom';

type SymptomFrequency = {
  count: number;
  label: string;
};

function selectTopSymptoms(
  items: SymptomFrequency[],
  limit?: number,
) {
  const sortedByFrequency = [...items].sort((left, right) => {
    if (right.count !== left.count) {
      return right.count - left.count;
    }

    return left.label.localeCompare(right.label, 'en');
  });

  return typeof limit === 'number'
    ? sortedByFrequency.slice(0, limit)
    : sortedByFrequency;
}

const props = defineProps<{
  symptoms: SymptomMeasurement[];
  title?: string;
  maxTypes?: number;
}>();

const dashboard = computed(() => {
  const symptomFrequency = props.symptoms.reduce<Record<string, number>>((accumulator, record) => {
    accumulator[record.type] = (accumulator[record.type] ?? 0) + 1;
    return accumulator;
  }, {});

  const topSymptoms: SymptomFrequency[] = selectTopSymptoms(
    Object.entries(symptomFrequency).map(([label, count]) => ({ label, count })),
    props.maxTypes,
  );

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
          {{ title ?? 'Symptoms' }}
        </h2>
        <p class="health-dashboard-symptoms-subtitle">
          How many times symptoms were recorded during the selected period
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
      No symptom entries for the selected period.
    </div>
  </article>
</template>

<style scoped>
.health-dashboard-symptoms {
  display: flex;
  flex-direction: column;
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
  margin-top: auto;
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
