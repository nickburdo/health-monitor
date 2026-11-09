export type BloodPressureMeasurement = {
  id: string;
  measuredAt: string;
  systolic: number;
  diastolic: number;
  pulse: number;
  note: string | null;
  ignored: boolean;
  reason: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateBloodPressureMeasurementInput = {
  measuredAt: string;
  systolic: number;
  diastolic: number;
  pulse: number;
  note?: string;
};
