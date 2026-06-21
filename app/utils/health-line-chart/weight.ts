export const weightChartSeries = [
  {
    key: 'value',
    label: 'Weight',
    color: '#22c55e',
    valueFormatter: (value: number) => `${value.toFixed(1)} kg`,
  },
] as const;

export function formatWeightValue(value: number) {
  return `${value.toFixed(1)} kg`;
}

export function formatWeightAxisValue(value: number) {
  return value.toFixed(1);
}
