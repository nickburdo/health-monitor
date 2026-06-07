<script setup lang="ts">
import { formatWhen, formatWhenParts } from '~/utils/date-format';
import type { GlucoseMeasurement } from '~/types/glucose';

type ChartSeriesKey = 'fasting' | 'afterMeal';

type ChartPoint = {
  ariaLabel: string;
  color: '#fb923c' | '#ea580c';
  dateLabel: string;
  seriesKey: ChartSeriesKey;
  seriesLabel: string;
  value: number;
  valueLabel: string;
  x: number;
  y: number;
};

const props = defineProps<{
  items: GlucoseMeasurement[];
  title?: string;
}>();

const chartWidth = 1000;
const chartHeight = 288;
const pointRadius = 5;
const axisLabelOffset = pointRadius + 5;
const chartPadding = pointRadius;

const seriesMeta = {
  fasting: {
    label: 'Натощак',
    color: '#fb923c',
  },
  afterMeal: {
    label: 'После еды',
    color: '#ea580c',
  },
} as const;

const activePoint = ref<ChartPoint | null>(null);

function glucoseToMmol(value: number | null) {
  return value === null ? null : value / 18;
}

const chartRows = computed(() =>
  props.items
    .filter(item => !item.ignore)
    .slice()
    .sort((left, right) => new Date(left.measuredAt).getTime() - new Date(right.measuredAt).getTime())
    .map(item => ({
      item,
      dateLabel: formatWhenParts(item.measuredAt).date,
      tooltipDate: formatWhen(item.measuredAt),
      fasting: glucoseToMmol(item.fastingValue),
      afterMeal: glucoseToMmol(item.afterMealValue),
    })),
);

const visibleValues = computed(() =>
  chartRows.value.flatMap((row) => {
    const values: number[] = [];

    if (row.fasting !== null) {
      values.push(row.fasting);
    }

    if (row.afterMeal !== null) {
      values.push(row.afterMeal);
    }

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
  const paddingSize = Math.max(0.5, (max - min) * 0.2);

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

function formatValue(value: number) {
  return `${value.toFixed(1)} ммоль/л`;
}

function buildPoints(seriesKey: ChartSeriesKey) {
  const points: ChartPoint[] = [];

  chartRows.value.forEach((row, index) => {
    const value = row[seriesKey];

    if (value === null) {
      return;
    }

    const seriesLabel = seriesMeta[seriesKey].label;

    points.push({
      ariaLabel: `${seriesLabel}, ${row.tooltipDate}, ${formatValue(value)}`,
      color: seriesMeta[seriesKey].color,
      dateLabel: row.dateLabel,
      seriesKey,
      seriesLabel,
      value,
      valueLabel: formatValue(value),
      x: scaleX(index, chartRows.value.length),
      y: scaleY(value),
    });
  });

  return points;
}

const fastingPoints = computed(() => buildPoints('fasting'));
const afterMealPoints = computed(() => buildPoints('afterMeal'));

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

  return [0, 0.25, 0.5, 0.75, 1].map((step) => {
    const value = max - (max - min) * step;

    return {
      label: value.toFixed(1),
      y: chartPadding + (chartHeight - chartPadding * 2) * step,
    };
  });
});

const hasData = computed(() => fastingPoints.value.length > 0 || afterMealPoints.value.length > 0);

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
  <article class="health-panel health-chart health-glucose-chart">
    <header class="health-glucose-chart-header">
      <div class="health-glucose-chart-copy">
        <h2 class="health-section-title">
          {{ title }}
        </h2>
      </div>

      <div class="health-glucose-chart-legend">
        <span class="health-glucose-chart-legend-item">
          <span
            class="health-glucose-chart-legend-swatch fasting"
            aria-hidden="true"
          />
          Натощак
        </span>
        <span class="health-glucose-chart-legend-item">
          <span
            class="health-glucose-chart-legend-swatch after-meal"
            aria-hidden="true"
          />
          После еды
        </span>
      </div>
    </header>

    <div
      v-if="hasData"
      class="health-glucose-chart-body"
      @mouseleave="clearPoint"
    >
      <div
        v-if="activePoint"
        class="health-glucose-chart-tooltip"
        :style="tooltipStyle"
      >
        <strong>{{ activePoint.seriesLabel }}</strong>
        <span>{{ activePoint.dateLabel }}</span>
        <span>{{ activePoint.valueLabel }}</span>
      </div>

      <svg
        class="health-glucose-chart-svg"
        viewBox="0 0 1000 360"
        role="img"
        aria-label="График глюкозы с двумя линиями: натощак и после еды"
        preserveAspectRatio="none"
      >
        <g
          v-for="tick in chartTicks"
          :key="`grid-${tick.label}`"
        >
          <line
            class="health-glucose-chart-grid-line"
            :x1="chartPadding"
            :x2="chartWidth - chartPadding"
            :y1="tick.y"
            :y2="tick.y"
          />
          <text
            class="health-glucose-chart-axis-label"
            :x="axisLabelOffset"
            :y="tick.y + 4"
          >
            {{ tick.label }}
          </text>
        </g>

        <path
          class="health-glucose-chart-line fasting"
          :d="buildPath(fastingPoints)"
        />
        <path
          class="health-glucose-chart-line after-meal"
          :d="buildPath(afterMealPoints)"
        />

        <g
          v-for="point in fastingPoints"
          :key="`fasting-${point.dateLabel}-${point.value}`"
        >
          <circle
            class="health-glucose-chart-point fasting"
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

        <g
          v-for="point in afterMealPoints"
          :key="`after-${point.dateLabel}-${point.value}`"
        >
          <circle
            class="health-glucose-chart-point after-meal"
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

      <div class="health-glucose-chart-axis">
        <span>{{ chartTitle || 'Нет данных' }}</span>
      </div>
    </div>

    <div
      v-else
      class="health-glucose-chart-empty"
    >
      Нет активных данных для построения графика.
    </div>
  </article>
</template>

<style scoped>
.health-glucose-chart {
  display: grid;
  gap: 18px;
}

.health-glucose-chart-header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 16px;
}

.health-glucose-chart-copy {
  display: grid;
  gap: 8px;
  min-width: 0;
}

.health-glucose-chart-subtitle {
  margin: 0;
  color: var(--muted);
  line-height: 1.6;
}

.health-glucose-chart-legend {
  display: inline-flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
}

.health-glucose-chart-legend-item {
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

.health-glucose-chart-legend-swatch {
  width: 12px;
  height: 12px;
  border-radius: 999px;
  flex: 0 0 auto;
}

.health-glucose-chart-legend-swatch.fasting {
  background: #fb923c;
}

.health-glucose-chart-legend-swatch.after-meal {
  background: #ea580c;
}

.health-glucose-chart-body {
  position: relative;
  display: grid;
  gap: 14px;
}

.health-glucose-chart-tooltip {
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

.health-glucose-chart-tooltip strong {
  color: var(--text);
  font-size: 13px;
}

.health-glucose-chart-tooltip span {
  color: var(--muted);
  font-size: 12px;
  line-height: 1.35;
}

.health-glucose-chart-svg {
  width: 100%;
  height: 288px;
  overflow: visible;
}

.health-glucose-chart-grid-line {
  stroke: rgba(243, 223, 207, 0.95);
  stroke-width: 1;
  vector-effect: non-scaling-stroke;
}

.health-glucose-chart-axis-label {
  fill: var(--muted);
  font-size: 12px;
  font-weight: 650;
}

.health-glucose-chart-line {
  fill: none;
  stroke-width: 4;
  stroke-linecap: round;
  stroke-linejoin: round;
  vector-effect: non-scaling-stroke;
}

.health-glucose-chart-line.fasting {
  stroke: #fb923c;
}

.health-glucose-chart-line.after-meal {
  stroke: #ea580c;
}

.health-glucose-chart-point {
  cursor: default;
  transition:
    transform 140ms ease,
    opacity 140ms ease;
  transform-box: fill-box;
  transform-origin: center;
}

.health-glucose-chart-point:hover,
.health-glucose-chart-point:focus {
  transform: scale(1.22);
  outline: none;
  opacity: 0.95;
}

.health-glucose-chart-axis {
  display: flex;
  justify-content: space-between;
  color: var(--muted);
  font-size: 13px;
  font-weight: 650;
}

.health-glucose-chart-empty {
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
  .health-glucose-chart-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .health-glucose-chart-legend {
    justify-content: flex-start;
  }
}

@media (max-width: 640px) {
  .health-glucose-chart-svg {
    height: 240px;
  }
}
</style>
