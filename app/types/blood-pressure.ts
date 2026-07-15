export type BloodPressureMeasurement = {
  id: string;
  measuredAt: string;
  systolic: number | null;
  diastolic: number | null;
  pulse: number | null;
  ignore: boolean;
  note: string | null;
  reason: string | null;
  createdAt: string;
};

export type CreateBloodPressureMeasurementInput = {
  measuredAt: string;
  systolic?: number;
  diastolic?: number;
  pulse?: number;
  note?: string;
};
