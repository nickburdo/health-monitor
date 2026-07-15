import { healthDb } from '~/lib/db/schema';
import {
  buildIgnoreData,
  parseOptionalNumber,
  parseOptionalString,
} from '~/lib/db/validation';
import type {
  CreateGlucoseMeasurementInput,
  GlucoseMeasurement,
} from '~/types/glucose';
import type { IgnoreInput } from '~/types';

export type DateRangeQuery = {
  dateFrom?: string;
  dateTo?: string;
};

function withinRange(measuredAt: string, range: DateRangeQuery): boolean {
  if (range.dateFrom && measuredAt < range.dateFrom) {
    return false;
  }

  if (range.dateTo && measuredAt > range.dateTo) {
    return false;
  }

  return true;
}

export async function listGlucoseMeasurements(
  range: DateRangeQuery = {},
): Promise<GlucoseMeasurement[]> {
  const all = await healthDb.glucoseMeasurement.toArray();

  return all
    .filter(item => withinRange(item.measuredAt, range))
    .sort((a, b) => b.measuredAt.localeCompare(a.measuredAt));
}

export async function createGlucoseMeasurement(
  input: CreateGlucoseMeasurementInput,
): Promise<GlucoseMeasurement> {
  const fastingValue = parseOptionalNumber(input.fastingValue);
  const afterMealValue = parseOptionalNumber(input.afterMealValue);
  const note = parseOptionalString(input.note);

  if (fastingValue === undefined && afterMealValue === undefined) {
    throw new Error('fastingValue or afterMealValue is required');
  }

  const record: GlucoseMeasurement = {
    id: crypto.randomUUID(),
    measuredAt: input.measuredAt,
    fastingValue: fastingValue ?? null,
    afterMealValue: afterMealValue ?? null,
    ignore: false,
    note: note ?? null,
    reason: null,
    createdAt: new Date().toISOString(),
  };

  await healthDb.glucoseMeasurement.add(record);

  return record;
}

export async function setGlucoseMeasurementIgnore(
  id: string,
  input: IgnoreInput,
): Promise<void> {
  const existing = await healthDb.glucoseMeasurement.get(id);

  if (!existing) {
    throw new Error('Glucose measurement not found');
  }

  await healthDb.glucoseMeasurement.update(id, buildIgnoreData(input));
}
