import { describe, expect, it, vi } from 'vitest';
import {
  createBloodPressureMeasurement,
  createGlucoseMeasurement,
  createSymptomEntry,
  createWeightMeasurement,
  listBloodPressureMeasurements,
  listGlucoseMeasurements,
  listSymptomEntries,
  listWeightMeasurements,
  setBloodPressureMeasurementIgnore,
  setGlucoseMeasurementIgnore,
  setWeightMeasurementIgnore,
  updateSymptomEntryNote,
} from '../../server/utils/health-records';
import type { RequestActor } from '../../server/utils/auth';

const guestActor: RequestActor = { kind: 'guest' };
const adminActor: RequestActor = { kind: 'admin', userId: 'admin-user-id' };

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
    : makeDelegate({ id: 'glucose-1', isDemo: true });
  const bloodPressureMeasurement = overrides.bloodPressureMeasurement
    ? overrides.bloodPressureMeasurement
    : makeDelegate({ id: 'blood-pressure-1', isDemo: true });
  const weightMeasurement = overrides.weightMeasurement
    ? overrides.weightMeasurement
    : makeDelegate({ id: 'weight-1', isDemo: true });
  const symptomEntry = overrides.symptomEntry
    ? overrides.symptomEntry
    : makeDelegate({ id: 'symptom-1', isDemo: true });

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
      glucoseMeasurement: makeDelegate({ id: 'glucose-1', isDemo: true }),
    });

    await createGlucoseMeasurement(db, guestActor, {
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
        isDemo: true,
        note: 'morning',
      },
    });
  });

  it('filters glucose measurements by date range', async () => {
    const db = makeDb({ glucoseMeasurement: makeDelegate() });

    await listGlucoseMeasurements(db, guestActor, {
      dateFrom: '2026-06-01T00:00:00.000Z',
      dateTo: '2026-06-30T23:59:59.999Z',
    });

    expect(db.glucoseMeasurement.findMany).toHaveBeenCalledWith({
      where: {
        measuredAt: {
          gte: new Date('2026-06-01T00:00:00.000Z'),
          lte: new Date('2026-06-30T23:59:59.999Z'),
        },
        isDemo: true,
      },
      orderBy: { measuredAt: 'desc' },
    });
  });

  it('updates a glucose record ignore flag as a whole record', async () => {
    const db = makeDb({
      glucoseMeasurement: makeDelegate({ id: 'glucose-1', isDemo: true }),
    });

    await setGlucoseMeasurementIgnore(db, guestActor, 'glucose-1', {
      ignore: true,
      reason: 'invalid input',
    });

    expect(db.glucoseMeasurement.update).toHaveBeenCalledWith({
      where: { id: 'glucose-1' },
      data: { ignore: true, reason: 'invalid input' },
    });
  });

  it('rejects guest glucose updates for private records', async () => {
    const db = makeDb({
      glucoseMeasurement: makeDelegate({ id: 'glucose-1', isDemo: false }),
    });

    await expect(
      setGlucoseMeasurementIgnore(db, guestActor, 'glucose-1', {
        ignore: true,
        reason: 'invalid input',
      }),
    ).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it('requires a reason when ignoring a glucose record', async () => {
    const db = makeDb({
      glucoseMeasurement: makeDelegate({ id: 'glucose-1', isDemo: true }),
    });

    await expect(
      setGlucoseMeasurementIgnore(db, guestActor, 'glucose-1', { ignore: true }),
    ).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it('restores a glucose record without requiring a note', async () => {
    const db = makeDb({
      glucoseMeasurement: makeDelegate({ id: 'glucose-1', isDemo: true }),
    });

    await setGlucoseMeasurementIgnore(db, guestActor, 'glucose-1', { ignore: false });

    expect(db.glucoseMeasurement.update).toHaveBeenCalledWith({
      where: { id: 'glucose-1' },
      data: { ignore: false },
    });
  });

  it('filters blood pressure measurements by date range', async () => {
    const db = makeDb({ bloodPressureMeasurement: makeDelegate() });

    await listBloodPressureMeasurements(db, guestActor, {
      dateFrom: '2026-06-01T00:00:00.000Z',
      dateTo: '2026-06-30T23:59:59.999Z',
    });

    expect(db.bloodPressureMeasurement.findMany).toHaveBeenCalledWith({
      where: {
        measuredAt: {
          gte: new Date('2026-06-01T00:00:00.000Z'),
          lte: new Date('2026-06-30T23:59:59.999Z'),
        },
        isDemo: true,
      },
      orderBy: { measuredAt: 'desc' },
    });
  });

  it('updates a blood pressure record ignore flag as a whole record', async () => {
    const db = makeDb({
      bloodPressureMeasurement: makeDelegate({ id: 'bp-1', isDemo: true }),
    });

    await setBloodPressureMeasurementIgnore(db, guestActor, 'bp-1', {
      ignore: true,
      reason: 'wrong cuff position',
    });

    expect(db.bloodPressureMeasurement.update).toHaveBeenCalledWith({
      where: { id: 'bp-1' },
      data: { ignore: true, reason: 'wrong cuff position' },
    });
  });

  it('rejects guest blood pressure updates for private records', async () => {
    const db = makeDb({
      bloodPressureMeasurement: makeDelegate({ id: 'bp-1', isDemo: false }),
    });

    await expect(
      setBloodPressureMeasurementIgnore(db, guestActor, 'bp-1', {
        ignore: true,
        reason: 'wrong cuff position',
      }),
    ).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it('creates blood pressure measurements with optional fields and ignore false', async () => {
    const db = makeDb({
      bloodPressureMeasurement: makeDelegate({ id: 'bp-1', isDemo: true }),
    });

    await createBloodPressureMeasurement(db, guestActor, {
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
        isDemo: true,
        note: undefined,
      },
    });
  });

  it('creates symptom entries using the static Other option', async () => {
    const db = makeDb({
      symptomEntry: makeDelegate({ id: 'symptom-1', isDemo: true }),
    });

    await createSymptomEntry(db, guestActor, {
      happenedAt: '2026-06-05T08:00:00.000Z',
      type: 'Other',
      note: 'free-form',
    });

    expect(db.symptomEntry.create).toHaveBeenCalledWith({
      data: {
        happenedAt: new Date('2026-06-05T08:00:00.000Z'),
        type: 'Other',
        intensity: undefined,
        isDemo: true,
        note: 'free-form',
      },
    });
  });

  it('rejects invalid symptom types', async () => {
    const db = makeDb({
      symptomEntry: makeDelegate({ id: 'symptom-1', isDemo: true }),
    });

    await expect(
      createSymptomEntry(db, guestActor, {
        happenedAt: '2026-06-05T08:00:00.000Z',
        type: 'not-a-symptom',
      }),
    ).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it('updates symptom notes', async () => {
    const db = makeDb({
      symptomEntry: makeDelegate({ id: 'symptom-1', isDemo: true }),
    });

    await updateSymptomEntryNote(db, guestActor, 'symptom-1', { note: 'updated note' });

    expect(db.symptomEntry.update).toHaveBeenCalledWith({
      where: { id: 'symptom-1' },
      data: { note: 'updated note' },
    });
  });

  it('updates guest weight ignore flags only for demo records', async () => {
    const db = makeDb({
      weightMeasurement: makeDelegate({ id: 'weight-1', isDemo: true }),
    });

    await setWeightMeasurementIgnore(db, guestActor, 'weight-1', {
      ignore: true,
      reason: 'scale error',
    });

    expect(db.weightMeasurement.update).toHaveBeenCalledWith({
      where: { id: 'weight-1' },
      data: { ignore: true, reason: 'scale error' },
    });
  });

  it('rejects guest weight updates for private records', async () => {
    const db = makeDb({
      weightMeasurement: makeDelegate({ id: 'weight-1', isDemo: false }),
    });

    await expect(
      setWeightMeasurementIgnore(db, guestActor, 'weight-1', {
        ignore: true,
        reason: 'scale error',
      }),
    ).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it('clears a symptom note when an empty value is provided', async () => {
    const db = makeDb({
      symptomEntry: makeDelegate({ id: 'symptom-1', isDemo: true }),
    });

    await updateSymptomEntryNote(db, guestActor, 'symptom-1', { note: '' });

    expect(db.symptomEntry.update).toHaveBeenCalledWith({
      where: { id: 'symptom-1' },
      data: { note: null },
    });
  });

  it('rejects guest symptom updates for private records', async () => {
    const db = makeDb({
      symptomEntry: makeDelegate({ id: 'symptom-1', isDemo: false }),
    });

    await expect(
      updateSymptomEntryNote(db, guestActor, 'symptom-1', { note: 'updated note' }),
    ).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it('creates weight measurements with required value', async () => {
    const db = makeDb({
      weightMeasurement: makeDelegate({ id: 'weight-1' }),
    });

    await createWeightMeasurement(db, guestActor, {
      measuredAt: '2026-06-05T08:00:00.000Z',
      value: 91.4,
      note: 'after breakfast',
    });

    expect(db.weightMeasurement.create).toHaveBeenCalledWith({
      data: {
        measuredAt: new Date('2026-06-05T08:00:00.000Z'),
        value: 91.4,
        ignore: false,
        isDemo: true,
        note: 'after breakfast',
      },
    });
  });

  it('creates private weight measurements for admin actor', async () => {
    const db = makeDb({
      weightMeasurement: makeDelegate({ id: 'weight-2' }),
    });

    await createWeightMeasurement(db, adminActor, {
      measuredAt: '2026-06-06T08:00:00.000Z',
      value: 90.1,
    });

    expect(db.weightMeasurement.create).toHaveBeenCalledWith({
      data: {
        measuredAt: new Date('2026-06-06T08:00:00.000Z'),
        value: 90.1,
        ignore: false,
        isDemo: false,
        note: undefined,
      },
    });
  });

  it('filters weight measurements by actor role and date range', async () => {
    const db = makeDb({ weightMeasurement: makeDelegate() });

    await listWeightMeasurements(db, guestActor, {
      dateFrom: '2026-06-01T00:00:00.000Z',
      dateTo: '2026-06-30T23:59:59.999Z',
    });

    expect(db.weightMeasurement.findMany).toHaveBeenCalledWith({
      where: {
        measuredAt: {
          gte: new Date('2026-06-01T00:00:00.000Z'),
          lte: new Date('2026-06-30T23:59:59.999Z'),
        },
        isDemo: true,
      },
      orderBy: { measuredAt: 'desc' },
    });
  });

  it('creates private glucose and blood pressure records for admin actor', async () => {
    const db = makeDb({
      glucoseMeasurement: makeDelegate({ id: 'glucose-2' }),
      bloodPressureMeasurement: makeDelegate({ id: 'bp-2' }),
    });

    await createGlucoseMeasurement(db, adminActor, {
      measuredAt: '2026-06-07T08:00:00.000Z',
      fastingValue: 5.8,
    });

    await createBloodPressureMeasurement(db, adminActor, {
      measuredAt: '2026-06-07T08:00:00.000Z',
      systolic: 122,
    });

    expect(db.glucoseMeasurement.create).toHaveBeenCalledWith({
      data: {
        measuredAt: new Date('2026-06-07T08:00:00.000Z'),
        fastingValue: 5.8,
        afterMealValue: undefined,
        ignore: false,
        isDemo: false,
        note: undefined,
      },
    });

    expect(db.bloodPressureMeasurement.create).toHaveBeenCalledWith({
      data: {
        measuredAt: new Date('2026-06-07T08:00:00.000Z'),
        systolic: 122,
        diastolic: undefined,
        pulse: undefined,
        ignore: false,
        isDemo: false,
        note: undefined,
      },
    });
  });

  it('creates private symptom records for admin actor', async () => {
    const db = makeDb({
      symptomEntry: makeDelegate({ id: 'symptom-2' }),
    });

    await createSymptomEntry(db, adminActor, {
      happenedAt: '2026-06-07T08:00:00.000Z',
      type: 'Other',
      note: 'private',
    });

    expect(db.symptomEntry.create).toHaveBeenCalledWith({
      data: {
        happenedAt: new Date('2026-06-07T08:00:00.000Z'),
        type: 'Other',
        intensity: undefined,
        isDemo: false,
        note: 'private',
      },
    });
  });

  it('filters symptoms by actor role and date range', async () => {
    const db = makeDb({ symptomEntry: makeDelegate() });

    await listSymptomEntries(db, guestActor, {
      dateFrom: '2026-06-01T00:00:00.000Z',
      dateTo: '2026-06-30T23:59:59.999Z',
    });

    expect(db.symptomEntry.findMany).toHaveBeenCalledWith({
      where: {
        happenedAt: {
          gte: new Date('2026-06-01T00:00:00.000Z'),
          lte: new Date('2026-06-30T23:59:59.999Z'),
        },
        isDemo: true,
      },
      orderBy: { happenedAt: 'desc' },
    });
  });
});
