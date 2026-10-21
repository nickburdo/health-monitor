export const glucoseChartSeries = [
  {
    key: 'fastingValue',
    label: 'Fasting',
    color: 'var(--chart-glucose-fasting)',
    valueFormatter: (value: number) => `${(value / 18).toFixed(1)} mmol/L`,
  },
  {
    key: 'afterMealValue',
    label: 'After meal',
    color: 'var(--chart-glucose-after-meal)',
    valueFormatter: (value: number) => `${(value / 18).toFixed(1)} mmol/L`,
  },
] as const;

export function formatGlucoseValue(value: number) {
  return `${(value / 18).toFixed(1)} mmol/L`;
}

export function formatGlucoseAxisValue(value: number) {
  return value.toFixed(1);
}
