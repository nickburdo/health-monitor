import { createFirestoreRepository } from './firestoreRepository';
import { BloodPressureMeasurement } from '~/types/blood-pressure';

export const bloodPressureRepository =
  createFirestoreRepository<BloodPressureMeasurement>(
    'bloodPressureMeasurements',
  );
