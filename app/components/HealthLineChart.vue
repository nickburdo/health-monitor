<script setup lang="ts">
import { formatWhen, formatWhenParts } from '~/utils/date-format';

type ChartRow = Record<string, number | string | boolean | null | undefined> & {
  measuredAt: string;
  ignore: boolean;
};

type ChartSeries = {
  color: string;
  key: string;
  label: string;
  valueFormatter?: (value: number) => string;
};

type ChartPoint = {
  ariaLabel: string;
  color: string;
  dateLabel: string;
  rowIndex: number;
  seriesLabel: string;
  value: number;
  valueLabel: string;
  x: number;
  y: number;
};

const props = defineProps<{
  ariaLabel: string;
  emptyLabel?: string;
  items: ChartRow[];
  series: readonly ChartSeries[];
  title?: string;
  valueFormatter?: (value: number) => string;
  yAxisFormatter?: (value: number) => string;
}>();

const chartWidth = 1000;
const chartHeight = 288;
const pointRadius = 5;
const axisLabelOffset = pointRadius + 5;
const chartPadding = pointRadius;

const activePoint = ref<ChartPoint | null>(null);

const chartRows = computed(() =>
  props.items
    .filter(item => !item.ignore)
    .slice()
    .sort((left, right) => new Date(left.measuredAt).getTime() - new Date(right.measuredAt).getTime())
    .map(item => ({
      item,
      dateLabel: formatWhenParts(item.measuredAt).date,
      tooltipDate: formatWhen(item.measuredAt),
    })),
);

function toNumericValue(value: unknown): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const parsed = typeof value === 'number' ? value : Number(value);

  return Number.isFinite(parsed) ? parsed : null;
}

const visibleValues = computed(() =>
  chartRows.value.flatMap((row) => {
    const values: number[] = [];

    props.series.forEach((series) => {
      const value = toNumericValue(row.item[series.key]);

      if (value !== null) {
        values.push(value);
      }
    });

    return values;
  }),
);

const valueBounds = computed(() => {
  const values = visibleValues.value;

  if (!values.length) {
    return {
      min: 0,
      max: 1,
    };
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const paddingSize = Math.max(1, (max - min) * 0.2);

  return {
    min: Math.max(0, min - paddingSize),
    max: max + paddingSize,
  };
});

function scaleX(index: number, count: number) {
  if (count <= 1) {
    return chartWidth / 2;
  }

  const usableWidth = chartWidth - chartPadding * 2;
  return chartPadding + (usableWidth * index) / (count - 1);
}

function scaleY(value: number) {
  const { min, max } = valueBounds.value;

  if (max <= min) {
    return chartHeight / 2;
  }

  const progress = (value - min) / (max - min);
  const usableHeight = chartHeight - chartPadding * 2;
  return chartPadding + usableHeight - usableHeight * progress;
}

function formatValue(value: number, series?: ChartSeries) {
  if (series?.valueFormatter) {
    return series.valueFormatter(value);
  }

  if (props.valueFormatter) {
    return props.valueFormatter(value);
  }

  return String(value);
}

function buildPoints(series: ChartSeries) {
  const points: ChartPoint[] = [];

  chartRows.value.forEach((row, index) => {
    const value = toNumericValue(row.item[series.key]);

    if (value === null) {
      return;
    }

    points.push({
      ariaLabel: `${series.label}, ${row.tooltipDate}, ${formatValue(value, series)}`,
      color: series.color,
      dateLabel: row.dateLabel,
      rowIndex: index,
      seriesLabel: series.label,
      value,
      valueLabel: formatValue(value, series),
      x: scaleX(index, chartRows.value.length),
      y: scaleY(value),
    });
  });

  return points;
}

const seriesPoints = computed(() =>
  props.series.map(series => ({
    meta: series,
    points: buildPoints(series),
  })),
);

function buildPath(points: ChartPoint[]) {
  if (!points.length) {
    return '';
  }

  return points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');
}

const chartTicks = computed(() => {
  const { min, max } = valueBounds.value;
  const formatTick = props.yAxisFormatter ?? ((value: number) => String(Math.round(value)));

  return [0, 0.25, 0.5, 0.75, 1].map((step) => {
    const value = max - (max - min) * step;

    return {
      label: formatTick(value),
      y: chartPadding + (chartHeight - chartPadding * 2) * step,
    };
  });
});

const hasData = computed(() =>
  seriesPoints.value.some(entry => entry.points.length > 0),
);

const chartTitle = computed(() => {
  const rows = chartRows.value;

  if (!rows.length) {
    return '';
  }

  const first = rows[0]!;

  if (rows.length === 1) {
    return first.dateLabel;
  }

  const last = rows[rows.length - 1]!;

  return `${first.dateLabel} - ${last.dateLabel}`;
});

const tooltipStyle = computed(() => {
  if (!activePoint.value) {
    return {};
  }

  const xPercent = (activePoint.value.x / chartWidth) * 100;
  const yPercent = (activePoint.value.y / chartHeight) * 100;

  return {
    left: `${Math.min(92, Math.max(8, xPercent))}%`,
    top: `${Math.min(88, Math.max(12, yPercent))}%`,
  };
});

function showPoint(point: ChartPoint) {
  activePoint.value = point;
}

function clearPoint() {
  activePoint.value = null;
}
</script>

<template>
  <article class="health-panel health-chart health-line-chart">
    <header class="health-line-chart-header">
      <div
        v-if="title"
        class="health-line-chart-copy"
      >
        <h2 class="health-section-title">
          {{ title }}
        </h2>
      </div>

      <div class="health-line-chart-legend">
        <span
          v-for="seriesItem in series"
          :key="seriesItem.key"
          class="health-line-chart-legend-item"
        >
          <span
            class="health-line-chart-legend-swatch"
            :style="{ background: seriesItem.color }"
            aria-hidden="true"
          />
          {{ seriesItem.label }}
        </span>
      </div>
    </header>

    <div
      v-if="hasData"
      class="health-line-chart-body"
      @mouseleave="clearPoint"
    >
      <div
        v-if="activePoint"
        class="health-line-chart-tooltip"
        :style="tooltipStyle"
      >
        <strong>{{ activePoint.seriesLabel }}</strong>
        <span>{{ activePoint.dateLabel }}</span>
        <span>{{ activePoint.valueLabel }}</span>
      </div>

      <svg
        class="health-line-chart-svg"
        viewBox="0 0 1000 288"
        role="img"
        :aria-label="ariaLabel"
        preserveAspectRatio="none"
      >
        <g
          v-for="tick in chartTicks"
          :key="`grid-${tick.label}-${tick.y}`"
        >
          <line
            class="health-line-chart-grid-line"
            :x1="chartPadding"
            :x2="chartWidth - chartPadding"
            :y1="tick.y"
            :y2="tick.y"
          />
          <text
            class="health-line-chart-axis-label"
            :x="axisLabelOffset"
            :y="tick.y + 4"
          >
            {{ tick.label }}
          </text>
        </g>

        <g
          v-for="entry in seriesPoints"
          :key="entry.meta.key"
        >
          <path
            class="health-line-chart-line"
            :class="{ dashed: false }"
            :d="buildPath(entry.points)"
            :stroke="entry.meta.color"
          />
        </g>

        <g
          v-for="entry in seriesPoints"
          :key="`points-${entry.meta.key}`"
        >
          <circle
            v-for="point in entry.points"
            :key="`${entry.meta.key}-${point.rowIndex}-${point.value}`"
            class="health-line-chart-point"
            :cx="point.x"
            :cy="point.y"
            :r="pointRadius"
            :fill="point.color"
            :stroke="point.color"
            tabindex="0"
            :aria-label="point.ariaLabel"
            @mouseenter="showPoint(point)"
            @focus="showPoint(point)"
            @blur="clearPoint"
          />
        </g>
      </svg>

      <div class="health-line-chart-axis">
        <span>{{ chartTitle || 'Нет данных' }}</span>
      </div>
    </div>

    <div
      v-else
      class="health-line-chart-empty"
    >
      {{ emptyLabel ?? 'Нет активных данных для построения графика.' }}
    </div>
  </article>
</template>

<style scoped>
.health-line-chart {
  display: grid;
  gap: 18px;
}

.health-line-chart-header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 16px;
}

.health-line-chart-copy {
  display: grid;
  gap: 8px;
  min-width: 0;
}

.health-line-chart-legend {
  display: inline-flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
  margin-left: auto;
}

.health-line-chart-legend-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 999px;
  background: var(--surface-soft);
  color: var(--muted);
  font-size: 13px;
  font-weight: 750;
}

.health-line-chart-legend-swatch {
  width: 12px;
  height: 12px;
  border-radius: 999px;
  flex: 0 0 auto;
}

.health-line-chart-body {
  position: relative;
  display: grid;
  gap: 14px;
}

.health-line-chart-tooltip {
  position: absolute;
  z-index: 2;
  min-width: 170px;
  max-width: 230px;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 18px 40px rgba(124, 45, 18, 0.16);
  transform: translate(-50%, -115%);
  pointer-events: none;
  display: grid;
  gap: 4px;
}

.health-line-chart-tooltip strong {
  color: var(--text);
  font-size: 13px;
}

.health-line-chart-tooltip span {
  color: var(--muted);
  font-size: 12px;
  line-height: 1.35;
}

.health-line-chart-svg {
  width: 100%;
  height: 288px;
  overflow: visible;
}

.health-line-chart-grid-line {
  stroke: rgba(243, 223, 207, 0.95);
  stroke-width: 1;
  vector-effect: non-scaling-stroke;
}

.health-line-chart-axis-label {
  fill: var(--muted);
  font-size: 12px;
  font-weight: 650;
}

.health-line-chart-line {
  fill: none;
  stroke-width: 4;
  stroke-linecap: round;
  stroke-linejoin: round;
  vector-effect: non-scaling-stroke;
}

.health-line-chart-point {
  cursor: default;
  transition:
    transform 140ms ease,
    opacity 140ms ease;
  transform-box: fill-box;
  transform-origin: center;
}

.health-line-chart-point:hover,
.health-line-chart-point:focus {
  transform: scale(1.22);
  outline: none;
  opacity: 0.95;
}

.health-line-chart-axis {
  display: flex;
  justify-content: space-between;
  color: var(--muted);
  font-size: 13px;
  font-weight: 650;
}

.health-line-chart-empty {
  display: grid;
  place-items: center;
  min-height: 192px;
  border: 1px dashed var(--border);
  border-radius: 22px;
  color: var(--muted);
  background: rgba(255, 250, 243, 0.58);
  text-align: center;
  padding: 24px;
}

@media (max-width: 768px) {
  .health-line-chart-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .health-line-chart-legend {
    width: 100%;
    margin-left: 0;
    justify-content: flex-start;
  }
}

@media (max-width: 640px) {
  .health-line-chart-svg {
    height: 240px;
  }
}
</style>
