import { createFirestoreRepository } from './firestoreRepository';
import { WeightMeasurement } from '~/types/weight';

export const weightRepository =
  createFirestoreRepository<WeightMeasurement>('weightMeasurements');
