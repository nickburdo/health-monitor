export type GlucoseMeasurement = {
  id: string;
  measuredAt: string;
  fastingValue: number | null;
  afterMealValue: number | null;
  ignore: boolean;
  note: string | null;
  reason: string | null;
  createdAt: string;
};

export type CreateGlucoseMeasurementInput = {
  measuredAt: string;
  fastingValue?: number;
  afterMealValue?: number;
  note?: string;
};
