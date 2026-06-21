export const glucoseChartSeries = [
  {
    key: 'fastingValue',
    label: 'Fasting',
    color: '#fb923c',
    valueFormatter: (value: number) => `${(value / 18).toFixed(1)} mmol/L`,
  },
  {
    key: 'afterMealValue',
    label: 'After meal',
    color: '#ea580c',
    valueFormatter: (value: number) => `${(value / 18).toFixed(1)} mmol/L`,
  },
] as const;

export function formatGlucoseValue(value: number) {
  return `${(value / 18).toFixed(1)} mmol/L`;
}

export function formatGlucoseAxisValue(value: number) {
  return value.toFixed(1);
}
