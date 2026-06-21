export const bloodPressureChartSeries = [
  {
    key: 'systolic',
    label: 'Systolic',
    color: '#3b82f6',
    valueFormatter: (value: number) => `${Math.round(value)} mmHg`,
  },
  {
    key: 'diastolic',
    label: 'Diastolic',
    color: '#1d4ed8',
    valueFormatter: (value: number) => `${Math.round(value)} mmHg`,
  },
] as const;

export function formatBloodPressureValue(value: number) {
  return `${Math.round(value)} mmHg`;
}

export function formatBloodPressureAxisValue(value: number) {
  return String(Math.round(value));
}
