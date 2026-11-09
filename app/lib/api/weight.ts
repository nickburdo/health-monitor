import { apiRequest } from '~/lib/api/client';
import { compactBody, listInRange, toDateRangeParams } from '~/lib/api/date-range';
import type { DateRangeQuery } from '~/types/date-range';
import type { CreateWeightMeasurementInput, WeightMeasurement } from '~/types/weight';
import type { IgnoreInput } from '~/types';

export async function listWeightMeasurements(range: DateRangeQuery = {}) {
  const items = await apiRequest<WeightMeasurement[]>('/weight', { query: toDateRangeParams(range) });

  return listInRange(items, range, item => item.measuredAt);
}

export function createWeightMeasurement(input: CreateWeightMeasurementInput) {
  return apiRequest<WeightMeasurement>('/weight', { method: 'POST', body: compactBody(input) });
}

export async function setWeightMeasurementIgnore(id: string, input: IgnoreInput) {
  await apiRequest<WeightMeasurement>(`/weight/${encodeURIComponent(id)}`, { method: 'PATCH', body: input });
}
