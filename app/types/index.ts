import type { Timestamp } from 'firebase/firestore';
import type { GlucoseMeasurement } from '~/types/glucose';
import type { BloodPressureMeasurement } from '~/types/blood-pressure';
import type { WeightMeasurement } from '~/types/weight';
import type { SymptomEntry } from '@prisma/client';

export type HealthMonitorCollection =
  | 'glucoseMeasurements'
  | 'bloodPressureMeasurements'
  | 'weightMeasurements'
  | 'symptomEntries';

export type GeneralType = {
  id: string;
  userId: string;
  notes?: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
export type GeneralMeasurementType = GeneralType & {
  measuredAt: Timestamp;
  ignore: boolean;
  reason?: string | null;
};

export type FirestoreBaseEntry = {
  id: string;
  userId: string;
  measuredAt: Timestamp;
  ignored: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type HealthMonitorEntry =
  | GlucoseMeasurement
  | BloodPressureMeasurement
  | WeightMeasurement
  | SymptomEntry;
