<script setup lang="ts">
import { formatWhen, formatWhenParts } from '~/utils/date-format';

type GlucoseRow = {
  id: string;
  measuredAt: string;
  fastingValue: number | null;
  afterMealValue: number | null;
  ignore: boolean;
  note: string | null;
  reason: string | null;
};

const props = defineProps<{
  items: GlucoseRow[];
}>();

function glucoseToMmol(value: number | null) {
  return value === null ? null : value / 18;
}

function formatValueParts(item: GlucoseRow) {
  const fasting = glucoseToMmol(item.fastingValue);
  const afterMeal = glucoseToMmol(item.afterMealValue);

  if (fasting !== null && afterMeal !== null) {
    return {
      value: `${fasting.toFixed(1)} / ${afterMeal.toFixed(1)}`,
      unit: 'mmol/L',
    };
  }

  const value = afterMeal ?? fasting;

  return value === null
    ? {
        value: '—',
        unit: '',
      }
    : {
        value: value.toFixed(1),
        unit: 'mmol/L',
      };
}

function formatMeasurementType(item: GlucoseRow) {
  if (item.fastingValue !== null && item.afterMealValue !== null) {
    return 'Натощак и после еды';
  }

  if (item.afterMealValue !== null) {
    return 'После еды';
  }

  return 'Натощак';
}

function typeEmoji(item: GlucoseRow) {
  return item.afterMealValue !== null ? '🍏' : '🍎';
}

function glucoseSummary(item: GlucoseRow) {
  if (!item) {
    return [];
  }

  return [
    {
      label: 'Дата',
      value: formatWhen(item.measuredAt),
    },
    {
      label: 'Тип',
      value: formatMeasurementType(item),
    },
    {
      label: 'Значение',
      value: formatValueParts(item).value,
      helper: formatValueParts(item).unit ? formatValueParts(item).unit : undefined,
    },
  ];
}

function displayNote(item: GlucoseRow) {
  if (item.ignore) {
    return item.reason ?? '—';
  }

  return item.note ?? '—';
}
</script>

<template>
  <article class="health-panel health-table-panel">
    <div class="health-table-header">
      <div>
        <h2 class="health-section-title">
          История глюкозы
        </h2>
      </div>
    </div>

    <div class="health-table-wrap">
      <table class="health-table">
        <thead>
          <tr>
            <th>
              <span class="health-table-head-date health-table-head-date-measurement">
                <span class="health-table-head-date-full">Дата Время</span>
                <span class="health-table-head-date-short">ДАТА</span>
              </span>
            </th>
            <th>
              <span class="health-table-head-value">
                <span class="health-table-head-value-full">ЗНАЧЕНИЕ</span>
                <span class="health-table-head-value-short">ЗНАЧ.</span>
              </span>
            </th>
            <th>ЗАМЕТКИ</th>
            <th
              class="health-table-action-head"
              aria-label="Действие"
            >
              <span class="sr-only">Действие</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in props.items"
            :key="item.id"
            class="health-table-row"
            :data-ignored="item.ignore"
          >
            <td class="health-table-cell-date health-table-cell-date-glucose">
              <span class="health-table-date">
                <span
                  class="health-table-type-icon"
                  role="img"
                  :aria-label="formatMeasurementType(item)"
                  :title="formatMeasurementType(item)"
                >
                  {{ typeEmoji(item) }}
                </span>
                <span class="health-table-date-text">
                  <span class="health-table-date-main">{{ formatWhenParts(item.measuredAt).date }}</span>
                  <span class="health-table-date-sub">{{ formatWhenParts(item.measuredAt).time }}</span>
                </span>
              </span>
            </td>
            <td class="health-table-cell-value">
              <span class="health-table-value">
                <span class="health-table-value-main">{{ formatValueParts(item).value }}</span>
                <span
                  v-if="formatValueParts(item).unit"
                  class="health-table-value-sub"
                >
                  {{ formatValueParts(item).unit }}
                </span>
              </span>
            </td>
            <td class="health-table-note health-table-note-cell">
              {{ displayNote(item) }}
            </td>
            <td class="health-table-action-cell">
              <MeasurementIgnoreControls
                :item="item"
                endpoint="/api/glucose"
                refresh-key="glucose-page"
                entity-label="глюкозы"
                :summary="glucoseSummary(item)"
                reason-placeholder="Например: подозрительно высокий показатель после плотного ужина"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </article>
</template>
