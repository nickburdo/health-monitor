import type { GeneralMeasurementType } from '~/types/index';

export type BloodPressureMeasurement = GeneralMeasurementType & {
  systolic: number | null;
  diastolic: number | null;
  pulse?: number | null;
};

export type CreateBloodPressureMeasurementContext = Omit<
  BloodPressureMeasurement,
  'id' | 'createdAt' | 'updatedAt'
>;

export type UpdateBloodPressureMeasurementContext = Partial<
  Omit<CreateBloodPressureMeasurementContext, 'userId'>
>;
