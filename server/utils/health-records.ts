import { createError } from 'h3';
import type { RequestActor } from './auth';
import {
  SYMPTOM_OPTIONS,
  type SymptomOption,
} from '~/constants/symptom-options';

type Delegate = {
  create: (args: { data: Record<string, unknown> }) => Promise<unknown>;
  findMany: (args: Record<string, unknown>) => Promise<unknown[]>;
  findUnique: (args: { where: { id: string } }) => Promise<unknown | null>;
  update: (args: {
    where: { id: string };
    data: Record<string, unknown>;
  }) => Promise<unknown>;
};

export type HealthDb = {
  glucoseMeasurement: Delegate;
  bloodPressureMeasurement: Delegate;
  weightMeasurement: Delegate;
  symptomEntry: Delegate;
};

type QueryRange = {
  dateFrom?: unknown;
  dateTo?: unknown;
};

type GlucoseCreateInput = {
  measuredAt: unknown;
  fastingValue?: unknown;
  afterMealValue?: unknown;
  note?: unknown;
};

type BloodPressureCreateInput = {
  measuredAt: unknown;
  systolic?: unknown;
  diastolic?: unknown;
  pulse?: unknown;
  note?: unknown;
};

type WeightCreateInput = {
  measuredAt: unknown;
  value?: unknown;
  note?: unknown;
};

type SymptomCreateInput = {
  happenedAt: unknown;
  type: unknown;
  intensity?: unknown;
  note?: unknown;
};

type SymptomUpdateInput = {
  note?: unknown;
};

type IgnoreInput = {
  ignore: unknown;
  reason?: unknown;
};

type DemoScopedRecord = {
  isDemo?: unknown;
};

function badRequest(message: string): never {
  throw createError({
    statusCode: 400,
    statusMessage: message,
  });
}

function notFound(message: string): never {
  throw createError({
    statusCode: 404,
    statusMessage: message,
  });
}

function parseDate(value: unknown, fieldName: string): Date {
  if (typeof value !== 'string' || value.trim() === '') {
    badRequest(`${fieldName} is required`);
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    badRequest(`${fieldName} must be a valid ISO date`);
  }

  return parsed;
}

function parseOptionalNumber(
  value: unknown,
  fieldName: string,
): number | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const parsed = typeof value === 'number' ? value : Number(value);

  if (!Number.isFinite(parsed)) {
    badRequest(`${fieldName} must be a valid number`);
  }

  return parsed;
}

function parseRequiredNumber(value: unknown, fieldName: string): number {
  const parsed = parseOptionalNumber(value, fieldName);

  if (parsed === undefined) {
    badRequest(`${fieldName} is required`);
  }

  return parsed;
}

function parseOptionalInteger(
  value: unknown,
  fieldName: string,
): number | undefined {
  const parsed = parseOptionalNumber(value, fieldName);

  if (parsed === undefined) {
    return undefined;
  }

  if (!Number.isInteger(parsed)) {
    badRequest(`${fieldName} must be an integer`);
  }

  return parsed;
}

function parseOptionalString(
  value: unknown,
  fieldName: string,
): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== 'string') {
    badRequest(`${fieldName} must be a string`);
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : undefined;
}

function parseRequiredNullableString(
  value: unknown,
  fieldName: string,
): string | null {
  if (value === undefined) {
    badRequest(`${fieldName} is required`);
  }

  if (value === null) {
    return null;
  }

  if (typeof value !== 'string') {
    badRequest(`${fieldName} must be a string`);
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : null;
}

function buildIgnoreData(input: IgnoreInput): { ignore: boolean; reason?: string | null } {
  const ignore = parseBoolean(input.ignore, 'ignore');
  const reason = parseOptionalString(input.reason, 'reason');

  if (!ignore) {
    return {
      ignore,
    };
  }

  if (reason === undefined) {
    badRequest('reason is required when ignore is true');
  }

  return {
    ignore,
    reason,
  };
}

function parseBoolean(value: unknown, fieldName: string): boolean {
  if (typeof value === 'boolean') {
    return value;
  }

  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  badRequest(`${fieldName} must be a boolean`);
}

function parseDateRange(range: QueryRange): { dateFrom?: Date; dateTo?: Date } {
  const dateFrom = range.dateFrom
    ? parseDate(range.dateFrom, 'dateFrom')
    : undefined;
  const dateTo = range.dateTo ? parseDate(range.dateTo, 'dateTo') : undefined;

  if (dateFrom && dateTo && dateFrom > dateTo) {
    badRequest('dateFrom must be before or equal to dateTo');
  }

  return { dateFrom, dateTo };
}

function buildDateWhere(
  fieldName: 'measuredAt' | 'happenedAt',
  range: QueryRange,
): Record<string, unknown> | undefined {
  const { dateFrom, dateTo } = parseDateRange(range);

  if (!dateFrom && !dateTo) {
    return undefined;
  }

  return {
    [fieldName]: {
      ...(dateFrom ? { gte: dateFrom } : {}),
      ...(dateTo ? { lte: dateTo } : {}),
    },
  };
}

function ensureRecordId(id: string | undefined): string {
  if (!id || id.trim() === '') {
    badRequest('id is required');
  }

  return id;
}

function ensureRecordExists(record: unknown, entityName: string): void {
  if (!record) {
    notFound(`${entityName} not found`);
  }
}

function ensureActorRecordAccess(
  record: unknown,
  actor: RequestActor,
  entityName: string,
): void {
  const isDemo = (record as DemoScopedRecord | null)?.isDemo;
  const expectedIsDemo = actor.kind === 'guest';

  if (isDemo !== expectedIsDemo) {
    notFound(`${entityName} not found`);
  }
}

function ensureSymptomType(value: unknown): SymptomOption {
  if (typeof value !== 'string') {
    badRequest('type is required');
  }

  if (!SYMPTOM_OPTIONS.includes(value as SymptomOption)) {
    badRequest('type must be one of the predefined symptom options');
  }

  return value as SymptomOption;
}

export async function listGlucoseMeasurements(
  db: HealthDb,
  actor: RequestActor,
  range: QueryRange = {},
) {
  const dateWhere = buildDateWhere('measuredAt', range);

  return db.glucoseMeasurement.findMany({
    where: {
      ...dateWhere,
      isDemo: actor.kind === 'guest',
    },
    orderBy: { measuredAt: 'desc' },
  });
}

export async function createGlucoseMeasurement(
  db: HealthDb,
  actor: RequestActor,
  input: GlucoseCreateInput,
) {
  const measuredAt = parseDate(input.measuredAt, 'measuredAt');
  const fastingValue = parseOptionalNumber(input.fastingValue, 'fastingValue');
  const afterMealValue = parseOptionalNumber(
    input.afterMealValue,
    'afterMealValue',
  );
  const note = parseOptionalString(input.note, 'note');

  if (fastingValue === undefined && afterMealValue === undefined) {
    badRequest('fastingValue or afterMealValue is required');
  }

  return db.glucoseMeasurement.create({
    data: {
      measuredAt,
      fastingValue,
      afterMealValue,
      ignore: false,
      isDemo: actor.kind === 'guest',
      note,
    },
  });
}

export async function setGlucoseMeasurementIgnore(
  db: HealthDb,
  actor: RequestActor,
  id: string | undefined,
  input: IgnoreInput,
) {
  const recordId = ensureRecordId(id);
  const existing = await db.glucoseMeasurement.findUnique({
    where: { id: recordId },
  });

  ensureRecordExists(existing, 'GlucoseMeasurement');
  ensureActorRecordAccess(existing, actor, 'GlucoseMeasurement');

  return db.glucoseMeasurement.update({
    where: { id: recordId },
    data: buildIgnoreData(input),
  });
}

export async function listBloodPressureMeasurements(
  db: HealthDb,
  actor: RequestActor,
  range: QueryRange = {},
) {
  const dateWhere = buildDateWhere('measuredAt', range);

  return db.bloodPressureMeasurement.findMany({
    where: {
      ...dateWhere,
      isDemo: actor.kind === 'guest',
    },
    orderBy: { measuredAt: 'desc' },
  });
}

export async function createBloodPressureMeasurement(
  db: HealthDb,
  actor: RequestActor,
  input: BloodPressureCreateInput,
) {
  const measuredAt = parseDate(input.measuredAt, 'measuredAt');
  const systolic = parseOptionalInteger(input.systolic, 'systolic');
  const diastolic = parseOptionalInteger(input.diastolic, 'diastolic');
  const pulse = parseOptionalInteger(input.pulse, 'pulse');
  const note = parseOptionalString(input.note, 'note');

  const hasBloodPressureValue = [systolic, diastolic, pulse].some((value) => {
    return value !== undefined;
  });

  if (!hasBloodPressureValue) {
    badRequest('systolic, diastolic or pulse is required');
  }

  return db.bloodPressureMeasurement.create({
    data: {
      measuredAt,
      systolic,
      diastolic,
      pulse,
      ignore: false,
      isDemo: actor.kind === 'guest',
      note,
    },
  });
}

export async function setBloodPressureMeasurementIgnore(
  db: HealthDb,
  actor: RequestActor,
  id: string | undefined,
  input: IgnoreInput,
) {
  const recordId = ensureRecordId(id);
  const existing = await db.bloodPressureMeasurement.findUnique({
    where: { id: recordId },
  });

  ensureRecordExists(existing, 'BloodPressureMeasurement');
  ensureActorRecordAccess(existing, actor, 'BloodPressureMeasurement');

  return db.bloodPressureMeasurement.update({
    where: { id: recordId },
    data: buildIgnoreData(input),
  });
}

export async function listWeightMeasurements(
  db: HealthDb,
  actor: RequestActor,
  range: QueryRange = {},
) {
  const dateWhere = buildDateWhere('measuredAt', range);

  return db.weightMeasurement.findMany({
    where: {
      ...dateWhere,
      isDemo: actor.kind === 'guest',
    },
    orderBy: { measuredAt: 'desc' },
  });
}

export async function createWeightMeasurement(
  db: HealthDb,
  actor: RequestActor,
  input: WeightCreateInput,
) {
  const measuredAt = parseDate(input.measuredAt, 'measuredAt');
  const value = parseRequiredNumber(input.value, 'value');
  const note = parseOptionalString(input.note, 'note');

  return db.weightMeasurement.create({
    data: {
      measuredAt,
      value,
      ignore: false,
      isDemo: actor.kind === 'guest',
      note,
    },
  });
}

export async function setWeightMeasurementIgnore(
  db: HealthDb,
  actor: RequestActor,
  id: string | undefined,
  input: IgnoreInput,
) {
  const recordId = ensureRecordId(id);
  const existing = await db.weightMeasurement.findUnique({
    where: { id: recordId },
  });

  ensureRecordExists(existing, 'WeightMeasurement');
  ensureActorRecordAccess(existing, actor, 'WeightMeasurement');

  return db.weightMeasurement.update({
    where: { id: recordId },
    data: buildIgnoreData(input),
  });
}

export async function listSymptomEntries(
  db: HealthDb,
  actor: RequestActor,
  range: QueryRange = {},
) {
  const dateWhere = buildDateWhere('happenedAt', range);

  return db.symptomEntry.findMany({
    where: {
      ...dateWhere,
      isDemo: actor.kind === 'guest',
    },
    orderBy: { happenedAt: 'desc' },
  });
}

export async function createSymptomEntry(
  db: HealthDb,
  actor: RequestActor,
  input: SymptomCreateInput,
) {
  const happenedAt = parseDate(input.happenedAt, 'happenedAt');
  const type = ensureSymptomType(input.type);
  const intensity = parseOptionalInteger(input.intensity, 'intensity');
  const note = parseOptionalString(input.note, 'note');

  return db.symptomEntry.create({
    data: {
      happenedAt,
      type,
      intensity,
      isDemo: actor.kind === 'guest',
      note,
    },
  });
}

export async function updateSymptomEntryNote(
  db: HealthDb,
  actor: RequestActor,
  id: string | undefined,
  input: SymptomUpdateInput,
) {
  const recordId = ensureRecordId(id);
  const existing = await db.symptomEntry.findUnique({
    where: { id: recordId },
  });

  ensureRecordExists(existing, 'SymptomEntry');
  ensureActorRecordAccess(existing, actor, 'SymptomEntry');

  const note = parseRequiredNullableString(input.note, 'note');

  return db.symptomEntry.update({
    where: { id: recordId },
    data: {
      note,
    },
  });
}
