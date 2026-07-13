import type { GeneralMeasurementType } from '~/types/index';

export type WeightMeasurement = GeneralMeasurementType & {
  value: number | null;
};

export type CreateWeightMeasurementContext = Omit<
  WeightMeasurement,
  'id' | 'createdAt' | 'updatedAt'
>;

export type UpdateWeightMeasurementContext = Partial<
  Omit<CreateWeightMeasurementContext, 'userId'>
>;
