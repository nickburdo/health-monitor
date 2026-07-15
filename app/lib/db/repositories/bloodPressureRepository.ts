import { healthDb } from '~/lib/db/schema';
import {
  buildIgnoreData,
  parseOptionalInteger,
  parseOptionalString,
} from '~/lib/db/validation';
import type {
  BloodPressureMeasurement,
  CreateBloodPressureMeasurementInput,
} from '~/types/blood-pressure';
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

export async function listBloodPressureMeasurements(
  range: DateRangeQuery = {},
): Promise<BloodPressureMeasurement[]> {
  const all = await healthDb.bloodPressureMeasurement.toArray();

  return all
    .filter((item) => withinRange(item.measuredAt, range))
    .sort((a, b) => b.measuredAt.localeCompare(a.measuredAt));
}

export async function createBloodPressureMeasurement(
  input: CreateBloodPressureMeasurementInput,
): Promise<BloodPressureMeasurement> {
  const systolic = parseOptionalInteger(input.systolic);
  const diastolic = parseOptionalInteger(input.diastolic);
  const pulse = parseOptionalInteger(input.pulse);
  const note = parseOptionalString(input.note);

  if (
    systolic === undefined &&
    diastolic === undefined &&
    pulse === undefined
  ) {
    throw new Error('systolic, diastolic or pulse is required');
  }

  const record: BloodPressureMeasurement = {
    id: crypto.randomUUID(),
    measuredAt: input.measuredAt,
    systolic: systolic ?? null,
    diastolic: diastolic ?? null,
    pulse: pulse ?? null,
    ignore: false,
    note: note ?? null,
    reason: null,
    createdAt: new Date().toISOString(),
  };

  await healthDb.bloodPressureMeasurement.add(record);

  return record;
}

export async function setBloodPressureMeasurementIgnore(
  id: string,
  input: IgnoreInput,
): Promise<void> {
  const existing = await healthDb.bloodPressureMeasurement.get(id);

  if (!existing) {
    throw new Error('Blood pressure measurement not found');
  }

  await healthDb.bloodPressureMeasurement.update(id, buildIgnoreData(input));
}
