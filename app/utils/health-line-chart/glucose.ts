export const glucoseChartSeries = [
  {
    key: 'fastingValue',
    label: 'Натощак',
    color: '#fb923c',
    valueFormatter: (value: number) => `${(value / 18).toFixed(1)} ммоль/л`,
  },
  {
    key: 'afterMealValue',
    label: 'После еды',
    color: '#ea580c',
    valueFormatter: (value: number) => `${(value / 18).toFixed(1)} ммоль/л`,
  },
] as const;

export function formatGlucoseValue(value: number) {
  return `${(value / 18).toFixed(1)} ммоль/л`;
}

export function formatGlucoseAxisValue(value: number) {
  return value.toFixed(1);
}
