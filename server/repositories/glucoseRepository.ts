import { createFirestoreRepository } from './firestoreRepository';
import { GlucoseMeasurement } from '~/types/glucose';

export const glucoseRepository = createFirestoreRepository<GlucoseMeasurement>(
  'glucoseMeasurements',
);
