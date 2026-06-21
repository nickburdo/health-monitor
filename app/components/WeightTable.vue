<script setup lang="ts">
import { formatWhen, formatWhenParts } from '~/utils/date-format';

type WeightRow = {
  id: string;
  measuredAt: string;
  value: number | null;
  ignore: boolean;
  note: string | null;
  reason: string | null;
};

const props = defineProps<{
  items: WeightRow[];
}>();

function formatValueParts(item: WeightRow) {
  return {
    value: item.value === null ? '—' : item.value.toFixed(1),
    unit: item.value === null ? '' : 'kg',
  };
}

function weightSummary(item: WeightRow) {
  if (!item) {
    return [];
  }

  return [
    {
      label: 'Date',
      value: formatWhen(item.measuredAt),
    },
    {
      label: 'Reading',
      value: formatValueParts(item).value,
      helper: formatValueParts(item).unit ? formatValueParts(item).unit : undefined,
    },
  ];
}

function displayNote(item: WeightRow) {
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
          Weight history
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
            <td class="health-table-cell-date">
              <span class="health-table-date">
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
                endpoint="/api/weight"
                refresh-key="weight-page"
                entity-label="weight"
                :summary="weightSummary(item)"
                reason-placeholder="For example: an inaccurate weigh-in after a heavy meal"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </article>
</template>
