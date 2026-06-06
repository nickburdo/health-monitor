import { describe, expect, it, vi } from 'vitest';
import {
  createBloodPressureMeasurement,
  createGlucoseMeasurement,
  createSymptomEntry,
  createWeightMeasurement,
  listBloodPressureMeasurements,
  listGlucoseMeasurements,
  setBloodPressureMeasurementIgnore,
  setGlucoseMeasurementIgnore,
  setWeightMeasurementIgnore,
  updateSymptomEntryNote,
} from '../../server/utils/health-records';

function makeDelegate(result: unknown = null) {
  return {
    create: vi.fn().mockResolvedValue(result),
    findMany: vi.fn().mockResolvedValue([]),
    findUnique: vi.fn().mockResolvedValue(result),
    update: vi.fn().mockResolvedValue(result),
  };
}

function makeDb(
  overrides: Partial<Record<string, ReturnType<typeof makeDelegate>>> = {},
) {
  const glucoseMeasurement = overrides.glucoseMeasurement
    ? overrides.glucoseMeasurement
    : makeDelegate({ id: 'glucose-1' });
  const bloodPressureMeasurement = overrides.bloodPressureMeasurement
    ? overrides.bloodPressureMeasurement
    : makeDelegate({ id: 'blood-pressure-1' });
  const weightMeasurement = overrides.weightMeasurement
    ? overrides.weightMeasurement
    : makeDelegate({ id: 'weight-1' });
  const symptomEntry = overrides.symptomEntry
    ? overrides.symptomEntry
    : makeDelegate({ id: 'symptom-1' });

  return {
    glucoseMeasurement,
    bloodPressureMeasurement,
    weightMeasurement,
    symptomEntry,
  };
}

describe('health records api helpers', () => {
  it('creates glucose measurements with a whole-record ignore flag', async () => {
    const db = makeDb({
      glucoseMeasurement: makeDelegate({ id: 'glucose-1' }),
    });

    await createGlucoseMeasurement(db, {
      measuredAt: '2026-06-05T08:00:00.000Z',
      fastingValue: 6.1,
      note: 'morning',
    });

    expect(db.glucoseMeasurement.create).toHaveBeenCalledWith({
      data: {
        measuredAt: new Date('2026-06-05T08:00:00.000Z'),
        fastingValue: 6.1,
        afterMealValue: undefined,
        ignore: false,
        note: 'morning',
      },
    });
  });

  it('filters glucose measurements by date range', async () => {
    const db = makeDb({ glucoseMeasurement: makeDelegate() });

    await listGlucoseMeasurements(db, {
      dateFrom: '2026-06-01T00:00:00.000Z',
      dateTo: '2026-06-30T23:59:59.999Z',
    });

    expect(db.glucoseMeasurement.findMany).toHaveBeenCalledWith({
      where: {
        measuredAt: {
          gte: new Date('2026-06-01T00:00:00.000Z'),
          lte: new Date('2026-06-30T23:59:59.999Z'),
        },
      },
      orderBy: { measuredAt: 'desc' },
    });
  });

  it('updates a glucose record ignore flag as a whole record', async () => {
    const db = makeDb({
      glucoseMeasurement: makeDelegate({ id: 'glucose-1' }),
    });

    await setGlucoseMeasurementIgnore(db, 'glucose-1', {
      ignore: true,
      note: 'invalid input',
    });

    expect(db.glucoseMeasurement.update).toHaveBeenCalledWith({
      where: { id: 'glucose-1' },
      data: { ignore: true, note: 'invalid input' },
    });
  });

  it('requires a note when ignoring a glucose record', async () => {
    const db = makeDb({
      glucoseMeasurement: makeDelegate({ id: 'glucose-1' }),
    });

    await expect(
      setGlucoseMeasurementIgnore(db, 'glucose-1', { ignore: true }),
    ).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it('filters blood pressure measurements by date range', async () => {
    const db = makeDb({ bloodPressureMeasurement: makeDelegate() });

    await listBloodPressureMeasurements(db, {
      dateFrom: '2026-06-01T00:00:00.000Z',
      dateTo: '2026-06-30T23:59:59.999Z',
    });

    expect(db.bloodPressureMeasurement.findMany).toHaveBeenCalledWith({
      where: {
        measuredAt: {
          gte: new Date('2026-06-01T00:00:00.000Z'),
          lte: new Date('2026-06-30T23:59:59.999Z'),
        },
      },
      orderBy: { measuredAt: 'desc' },
    });
  });

  it('updates a blood pressure record ignore flag as a whole record', async () => {
    const db = makeDb({
      bloodPressureMeasurement: makeDelegate({ id: 'bp-1' }),
    });

    await setBloodPressureMeasurementIgnore(db, 'bp-1', {
      ignore: true,
      note: 'wrong cuff position',
    });

    expect(db.bloodPressureMeasurement.update).toHaveBeenCalledWith({
      where: { id: 'bp-1' },
      data: { ignore: true, note: 'wrong cuff position' },
    });
  });

  it('creates blood pressure measurements with optional fields and ignore false', async () => {
    const db = makeDb({
      bloodPressureMeasurement: makeDelegate({ id: 'bp-1' }),
    });

    await createBloodPressureMeasurement(db, {
      measuredAt: '2026-06-05T08:00:00.000Z',
      systolic: 128,
      diastolic: 82,
      pulse: 70,
    });

    expect(db.bloodPressureMeasurement.create).toHaveBeenCalledWith({
      data: {
        measuredAt: new Date('2026-06-05T08:00:00.000Z'),
        systolic: 128,
        diastolic: 82,
        pulse: 70,
        ignore: false,
        note: undefined,
      },
    });
  });

  it('creates symptom entries using the static Other option', async () => {
    const db = makeDb({
      symptomEntry: makeDelegate({ id: 'symptom-1' }),
    });

    await createSymptomEntry(db, {
      happenedAt: '2026-06-05T08:00:00.000Z',
      type: 'Other',
      note: 'free-form',
    });

    expect(db.symptomEntry.create).toHaveBeenCalledWith({
      data: {
        happenedAt: new Date('2026-06-05T08:00:00.000Z'),
        type: 'Other',
        intensity: undefined,
        note: 'free-form',
      },
    });
  });

  it('rejects invalid symptom types', async () => {
    const db = makeDb({
      symptomEntry: makeDelegate({ id: 'symptom-1' }),
    });

    await expect(
      createSymptomEntry(db, {
        happenedAt: '2026-06-05T08:00:00.000Z',
        type: 'not-a-symptom',
      }),
    ).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it('updates weight ignore flags and symptom notes', async () => {
    const db = makeDb({
      weightMeasurement: makeDelegate({ id: 'weight-1' }),
      symptomEntry: makeDelegate({ id: 'symptom-1' }),
    });

    await setWeightMeasurementIgnore(db, 'weight-1', {
      ignore: true,
      note: 'scale error',
    });
    await updateSymptomEntryNote(db, 'symptom-1', { note: 'updated note' });

    expect(db.weightMeasurement.update).toHaveBeenCalledWith({
      where: { id: 'weight-1' },
      data: { ignore: true, note: 'scale error' },
    });

    expect(db.symptomEntry.update).toHaveBeenCalledWith({
      where: { id: 'symptom-1' },
      data: { note: 'updated note' },
    });
  });

  it('clears a symptom note when an empty value is provided', async () => {
    const db = makeDb({
      symptomEntry: makeDelegate({ id: 'symptom-1' }),
    });

    await updateSymptomEntryNote(db, 'symptom-1', { note: '' });

    expect(db.symptomEntry.update).toHaveBeenCalledWith({
      where: { id: 'symptom-1' },
      data: { note: null },
    });
  });

  it('creates weight measurements with required value', async () => {
    const db = makeDb({
      weightMeasurement: makeDelegate({ id: 'weight-1' }),
    });

    await createWeightMeasurement(db, {
      measuredAt: '2026-06-05T08:00:00.000Z',
      value: 91.4,
      note: 'after breakfast',
    });

    expect(db.weightMeasurement.create).toHaveBeenCalledWith({
      data: {
        measuredAt: new Date('2026-06-05T08:00:00.000Z'),
        value: 91.4,
        ignore: false,
        note: 'after breakfast',
      },
    });
  });
});
