export type SymptomMeasurement = {
  id: string;
  happenedAt: string;
  type: string;
  intensity: number | null;
  note: string | null;
};
