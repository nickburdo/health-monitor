export const SYMPTOM_OPTIONS = [
  'bloating',
  'diarrhea',
  'constipation',
  'stomach pain',
  'nausea',
  'weakness',
  'headache',
  'poor sleep',
  'stress',
  'physical activity',
  'dietary change',
  'Other',
] as const;

export type SymptomOption = (typeof SYMPTOM_OPTIONS)[number];
