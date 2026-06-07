<script setup lang="ts">
import { formatWhen, formatWhenParts } from '~/utils/date-format';

type WeightRow = {
  id: string;
  measuredAt: string;
  value: number | null;
  ignore: boolean;
  note: string | null;
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
      label: 'Дата',
      value: formatWhen(item.measuredAt),
    },
    {
      label: 'Значение',
      value: formatValueParts(item).value,
      helper: formatValueParts(item).unit ? formatValueParts(item).unit : undefined,
    },
  ];
}
</script>

<template>
  <article class="health-panel health-table-panel">
    <div class="health-table-header">
      <div>
        <h2 class="health-section-title">
          История веса
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
              {{ item.note ?? '—' }}
            </td>
            <td class="health-table-action-cell">
              <MeasurementIgnoreControls
                :item="item"
                endpoint="/api/weight"
                refresh-key="weight-page"
                entity-label="веса"
                :summary="weightSummary(item)"
                ignore-placeholder="Например: неудачное взвешивание после плотного обеда"
                restore-placeholder="Например: запись была скрыта ошибочно"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </article>
</template>
