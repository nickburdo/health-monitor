export const bloodPressureChartSeries = [
  {
    key: 'systolic',
    label: 'Систолическое',
    color: '#3b82f6',
    valueFormatter: (value: number) => `${Math.round(value)} мм рт. ст.`,
  },
  {
    key: 'diastolic',
    label: 'Диастолическое',
    color: '#1d4ed8',
    valueFormatter: (value: number) => `${Math.round(value)} мм рт. ст.`,
  },
] as const;

export function formatBloodPressureValue(value: number) {
  return `${Math.round(value)} мм рт. ст.`;
}

export function formatBloodPressureAxisValue(value: number) {
  return String(Math.round(value));
}
