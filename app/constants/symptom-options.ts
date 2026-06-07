export const SYMPTOM_OPTIONS = [
  'метеоризм',
  'понос',
  'запор',
  'боль в животе',
  'тошнота',
  'слабость',
  'головная боль',
  'плохой сон',
  'стресс',
  'физическая активность',
  'изменение питания',
  'Other',
] as const;

export type SymptomOption = (typeof SYMPTOM_OPTIONS)[number];
