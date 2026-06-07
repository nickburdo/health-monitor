export type GlucoseMeasurement = {
  id: string;
  measuredAt: string;
  fastingValue: number | null;
  afterMealValue: number | null;
  ignore: boolean;
  note: string | null;
  reason: string | null;
};
