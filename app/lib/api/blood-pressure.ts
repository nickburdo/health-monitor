import { apiRequest } from '~/lib/api/client';
import { compactBody, listInRange, toDateRangeParams } from '~/lib/api/date-range';
import type { BloodPressureMeasurement, CreateBloodPressureMeasurementInput } from '~/types/blood-pressure';
import type { DateRangeQuery } from '~/types/date-range';
import type { IgnoreInput } from '~/types';

export async function listBloodPressureMeasurements(range: DateRangeQuery = {}) {
  const items = await apiRequest<BloodPressureMeasurement[]>('/blood-pressure', { query: toDateRangeParams(range) });

  return listInRange(items, range, item => item.measuredAt);
}

export function createBloodPressureMeasurement(input: CreateBloodPressureMeasurementInput) {
  return apiRequest<BloodPressureMeasurement>('/blood-pressure', { method: 'POST', body: compactBody(input) });
}

export async function setBloodPressureMeasurementIgnore(id: string, input: IgnoreInput) {
  await apiRequest<BloodPressureMeasurement>(`/blood-pressure/${encodeURIComponent(id)}`, { method: 'PATCH', body: input });
}
