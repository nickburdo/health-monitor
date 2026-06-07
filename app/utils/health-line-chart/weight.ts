export const weightChartSeries = [
  {
    key: 'value',
    label: 'Вес',
    color: '#22c55e',
    valueFormatter: (value: number) => `${value.toFixed(1)} кг`,
  },
] as const;

export function formatWeightValue(value: number) {
  return `${value.toFixed(1)} кг`;
}

export function formatWeightAxisValue(value: number) {
  return value.toFixed(1);
}
