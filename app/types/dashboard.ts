import type { BloodPressureMeasurement } from './blood-pressure';
import type { GlucoseMeasurement } from './glucose';
import type { SymptomEntry } from './symptom';
import type { WeightMeasurement } from './weight';

export type DashboardData = {
  bloodPressure: BloodPressureMeasurement[];
  glucose: GlucoseMeasurement[];
  symptoms: SymptomEntry[];
  weight: WeightMeasurement[];
};
