export type WeightMeasurement = {
  id: string;
  measuredAt: string;
  value: number | null;
  ignore: boolean;
  note: string | null;
  reason: string | null;
};
