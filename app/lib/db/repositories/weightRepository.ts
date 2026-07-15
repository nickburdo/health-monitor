import { healthDb } from '~/lib/db/schema';
import { buildIgnoreData, parseOptionalString } from '~/lib/db/validation';
import type {
  CreateWeightMeasurementInput,
  WeightMeasurement,
} from '~/types/weight';
import type { IgnoreInput } from '~/types';
import type { DateRangeQuery } from '~/lib/db/repositories/glucoseRepository';

function withinRange(measuredAt: string, range: DateRangeQuery): boolean {
  if (range.dateFrom && measuredAt < range.dateFrom) {
    return false;
  }

  if (range.dateTo && measuredAt > range.dateTo) {
    return false;
  }

  return true;
}

export async function listWeightMeasurements(
  range: DateRangeQuery = {},
): Promise<WeightMeasurement[]> {
  const all = await healthDb.weightMeasurement.toArray();

  return all
    .filter(item => withinRange(item.measuredAt, range))
    .sort((a, b) => b.measuredAt.localeCompare(a.measuredAt));
}

export async function createWeightMeasurement(
  input: CreateWeightMeasurementInput,
): Promise<WeightMeasurement> {
  const note = parseOptionalString(input.note);

  const record: WeightMeasurement = {
    id: crypto.randomUUID(),
    measuredAt: input.measuredAt,
    value: input.value,
    ignore: false,
    note: note ?? null,
    reason: null,
    createdAt: new Date().toISOString(),
  };

  await healthDb.weightMeasurement.add(record);

  return record;
}

export async function setWeightMeasurementIgnore(
  id: string,
  input: IgnoreInput,
): Promise<void> {
  const existing = await healthDb.weightMeasurement.get(id);

  if (!existing) {
    throw new Error('Weight measurement not found');
  }

  await healthDb.weightMeasurement.update(id, buildIgnoreData(input));
}
