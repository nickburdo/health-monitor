export type WeightMeasurement = {
  id: string;
  measuredAt: string;
  value: number | null;
  ignore: boolean;
  note: string | null;
  reason: string | null;
  createdAt: string;
};

export type CreateWeightMeasurementInput = {
  measuredAt: string;
  value: number;
  note?: string;
};
