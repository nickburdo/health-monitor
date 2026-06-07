import type { BloodPressureMeasurement } from './blood-pressure';
import type { GlucoseMeasurement } from './glucose';
import type { SymptomMeasurement } from './symptom';
import type { WeightMeasurement } from './weight';

export type DashboardData = {
  bloodPressure: BloodPressureMeasurement[];
  glucose: GlucoseMeasurement[];
  symptoms: SymptomMeasurement[];
  weight: WeightMeasurement[];
};
