import { apiRequest } from '~/lib/api/client';
import { listInRange, toDateRangeParams } from '~/lib/api/date-range';
import type { BloodPressureMeasurement } from '~/types/blood-pressure';
import type { DashboardData } from '~/types/dashboard';
import type { DateRangeQuery } from '~/types/date-range';
import type { GlucoseMeasurement } from '~/types/glucose';
import type { SymptomEntry } from '~/types/symptom';
import type { WeightMeasurement } from '~/types/weight';

type DashboardResponse = {
  glucoseMeasurements: GlucoseMeasurement[];
  bloodPressureMeasurements: BloodPressureMeasurement[];
  weightMeasurements: WeightMeasurement[];
  symptomEntries: SymptomEntry[];
};

export async function getDashboardData(range: DateRangeQuery = {}): Promise<DashboardData> {
  const data = await apiRequest<DashboardResponse>('/dashboard', { query: toDateRangeParams(range) });

  return {
    glucose: listInRange(data.glucoseMeasurements, range, item => item.measuredAt),
    bloodPressure: listInRange(data.bloodPressureMeasurements, range, item => item.measuredAt),
    weight: listInRange(data.weightMeasurements, range, item => item.measuredAt),
    symptoms: listInRange(data.symptomEntries, range, item => item.happenedAt),
  };
}
