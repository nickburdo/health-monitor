export type GlucoseMeasurement = {
  id: string;
  measuredAt: string;
  fastingValue: number | null;
  afterMealValue: number | null;
  note: string | null;
  ignored: boolean;
  reason: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateGlucoseMeasurementInput = {
  measuredAt: string;
  fastingValue?: number;
  afterMealValue?: number;
  note?: string;
};
