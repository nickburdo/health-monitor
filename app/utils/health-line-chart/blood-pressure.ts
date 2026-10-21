export const bloodPressureChartSeries = [
  {
    key: 'systolic',
    label: 'Systolic',
    color: 'var(--chart-pressure-systolic)',
    valueFormatter: (value: number) => `${Math.round(value)} mmHg`,
  },
  {
    key: 'diastolic',
    label: 'Diastolic',
    color: 'var(--chart-pressure-diastolic)',
    valueFormatter: (value: number) => `${Math.round(value)} mmHg`,
  },
] as const;

export function formatBloodPressureValue(value: number) {
  return `${Math.round(value)} mmHg`;
}

export function formatBloodPressureAxisValue(value: number) {
  return String(Math.round(value));
}
