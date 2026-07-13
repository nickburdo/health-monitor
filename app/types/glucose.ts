import type { GeneralMeasurementType } from '~/types/index';

export type GlucoseMeasurement = GeneralMeasurementType & {
  fastingValue: number | null;
  afterMealValue: number | null;
};

export type CreateGlucoseMeasurementContext = Omit<
  GlucoseMeasurement,
  'id' | 'createdAt' | 'updatedAt'
>;

export type UpdateGlucoseMeasurementContext = Partial<
  Omit<CreateGlucoseMeasurementContext, 'userId'>
>;
