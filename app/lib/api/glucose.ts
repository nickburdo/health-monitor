import { apiRequest } from '~/lib/api/client';
import { compactBody, listInRange, toDateRangeParams } from '~/lib/api/date-range';
import type { DateRangeQuery } from '~/types/date-range';
import type { CreateGlucoseMeasurementInput, GlucoseMeasurement } from '~/types/glucose';
import type { IgnoreInput } from '~/types';

export async function listGlucoseMeasurements(range: DateRangeQuery = {}) {
  const items = await apiRequest<GlucoseMeasurement[]>('/glucose', { query: toDateRangeParams(range) });

  return listInRange(items, range, item => item.measuredAt);
}

export function createGlucoseMeasurement(input: CreateGlucoseMeasurementInput) {
  return apiRequest<GlucoseMeasurement>('/glucose', { method: 'POST', body: compactBody(input) });
}

export async function setGlucoseMeasurementIgnore(id: string, input: IgnoreInput) {
  await apiRequest<GlucoseMeasurement>(`/glucose/${encodeURIComponent(id)}`, { method: 'PATCH', body: input });
}
