export type WeightMeasurement = {
  id: string;
  measuredAt: string;
  value: number;
  note: string | null;
  ignored: boolean;
  reason: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateWeightMeasurementInput = {
  measuredAt: string;
  value: number;
  note?: string;
};
