<script setup lang="ts">
import { formatWhen, formatWhenParts } from '~/utils/date-format';
import type { GlucoseMeasurement } from '~/types/glucose';

const props = defineProps<{
  items: GlucoseMeasurement[];
}>();

function glucoseToMmol(value: number | null) {
  return value === null ? null : value / 18;
}

function formatValueParts(item: GlucoseMeasurement) {
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

function formatMeasurementType(item: GlucoseMeasurement) {
  if (item.fastingValue !== null && item.afterMealValue !== null) {
    return 'Fasting and after meal';
  }

  if (item.afterMealValue !== null) {
    return 'After meal';
  }

  return 'Fasting';
}

function typeEmoji(item: GlucoseMeasurement) {
  return item.afterMealValue !== null ? '🍴' : '🍏';
}

function glucoseSummary(item: GlucoseMeasurement) {
  if (!item) {
    return [];
  }

  return [
    {
      label: 'Date',
      value: formatWhen(item.measuredAt),
    },
    {
      label: 'Type',
      value: formatMeasurementType(item),
    },
    {
      label: 'Reading',
      value: formatValueParts(item).value,
      helper: formatValueParts(item).unit ? formatValueParts(item).unit : undefined,
    },
  ];
}

function displayNote(item: GlucoseMeasurement) {
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
          Glucose history
        </h2>
      </div>
    </div>

    <div class="health-table-wrap">
      <table class="health-table">
        <thead>
          <tr>
            <th>
              <span class="health-table-head-date health-table-head-date-measurement">
                <span class="health-table-head-date-full">Date Time</span>
                <span class="health-table-head-date-short">DATE</span>
              </span>
            </th>
            <th>
              <span class="health-table-head-value">
                <span class="health-table-head-value-full">READING</span>
                <span class="health-table-head-value-short">READ.</span>
              </span>
            </th>
            <th>NOTES</th>
            <th
              class="health-table-action-head"
              aria-label="Action"
            >
              <span class="sr-only">Action</span>
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
                entity-label="glucose"
                :summary="glucoseSummary(item)"
                reason-placeholder="For example: a suspiciously high reading after a heavy dinner"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </article>
</template>
