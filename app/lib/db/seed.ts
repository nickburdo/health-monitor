import { healthDb } from '~/lib/db/schema';
import type { BloodPressureMeasurement } from '~/types/blood-pressure';
import type { GlucoseMeasurement } from '~/types/glucose';
import type { SymptomEntry } from '~/types/symptom';
import type { WeightMeasurement } from '~/types/weight';
import type { SymptomOption } from '~/constants/symptom-options';

type DemoDataFile = {
  glucoseMeasurement: Array<{
    daysAgo: number;
    fastingValue?: number;
    afterMealValue?: number;
    note?: string;
  }>;
  bloodPressureMeasurement: Array<{
    daysAgo: number;
    systolic?: number;
    diastolic?: number;
    pulse?: number;
    note?: string;
  }>;
  weightMeasurement: Array<{ daysAgo: number; value: number; note?: string }>;
  symptomEntry: Array<{
    daysAgo: number;
    type: SymptomOption;
    intensity?: number;
    note?: string;
  }>;
};

const DEMO_SEEDED_KEY = 'demoSeeded';

function dataTables() {
  return [
    healthDb.glucoseMeasurement,
    healthDb.bloodPressureMeasurement,
    healthDb.weightMeasurement,
    healthDb.symptomEntry,
  ];
}

function resolveDate(daysAgo: number): string {
  const base = new Date();
  base.setHours(12, 0, 0, 0);
  base.setDate(base.getDate() - daysAgo);
  return base.toISOString();
}

function buildDemoRecords(demoData: DemoDataFile) {
  const createdAt = new Date().toISOString();

  const glucoseRecords: GlucoseMeasurement[] = demoData.glucoseMeasurement.map(
    entry => ({
      id: crypto.randomUUID(),
      measuredAt: resolveDate(entry.daysAgo),
      fastingValue: entry.fastingValue ?? null,
      afterMealValue: entry.afterMealValue ?? null,
      ignore: false,
      note: entry.note ?? null,
      reason: null,
      createdAt,
    }),
  );

  const bloodPressureRecords: BloodPressureMeasurement[]
    = demoData.bloodPressureMeasurement.map(entry => ({
      id: crypto.randomUUID(),
      measuredAt: resolveDate(entry.daysAgo),
      systolic: entry.systolic ?? null,
      diastolic: entry.diastolic ?? null,
      pulse: entry.pulse ?? null,
      ignore: false,
      note: entry.note ?? null,
      reason: null,
      createdAt,
    }));

  const weightRecords: WeightMeasurement[] = demoData.weightMeasurement.map(
    entry => ({
      id: crypto.randomUUID(),
      measuredAt: resolveDate(entry.daysAgo),
      value: entry.value,
      ignore: false,
      note: entry.note ?? null,
      reason: null,
      createdAt,
    }),
  );

  const symptomRecords: SymptomEntry[] = demoData.symptomEntry.map(entry => ({
    id: crypto.randomUUID(),
    happenedAt: resolveDate(entry.daysAgo),
    type: entry.type,
    intensity: entry.intensity ?? null,
    note: entry.note ?? null,
    createdAt,
  }));

  return { glucoseRecords, bloodPressureRecords, weightRecords, symptomRecords };
}

async function fetchDemoRecords() {
  const demoData = await $fetch<DemoDataFile>('/data/demo.json');
  return buildDemoRecords(demoData);
}

// Must be called inside a transaction that covers the data tables and `meta`.
async function writeDemoRecords(records: ReturnType<typeof buildDemoRecords>) {
  await Promise.all([
    healthDb.glucoseMeasurement.bulkAdd(records.glucoseRecords),
    healthDb.bloodPressureMeasurement.bulkAdd(records.bloodPressureRecords),
    healthDb.weightMeasurement.bulkAdd(records.weightRecords),
    healthDb.symptomEntry.bulkAdd(records.symptomRecords),
    healthDb.meta.put({ key: DEMO_SEEDED_KEY, value: true }),
  ]);
}

async function isDataEmpty(): Promise<boolean> {
  const counts = await Promise.all(dataTables().map(table => table.count()));
  return counts.every(count => count === 0);
}

export async function replaceWithDemoData(): Promise<void> {
  // Fetch before the transaction: IndexedDB auto-commits it on any non-DB await.
  const records = await fetchDemoRecords();

  await healthDb.transaction('rw', [...dataTables(), healthDb.meta], async () => {
    await Promise.all(dataTables().map(table => table.clear()));
    await writeDemoRecords(records);
  });
}

export async function clearHealthMonitorData(): Promise<void> {
  await healthDb.transaction('rw', [...dataTables(), healthDb.meta], async () => {
    await Promise.all(dataTables().map(table => table.clear()));
    await healthDb.meta.put({ key: DEMO_SEEDED_KEY, value: true });
  });
}

export async function seedDemoDataIfEmpty(): Promise<void> {
  const seededFlag = await healthDb.meta.get(DEMO_SEEDED_KEY);

  if (seededFlag) {
    return;
  }

  if (!(await isDataEmpty())) {
    // Data existed before the flag was introduced: keep it and stop auto-seeding.
    await healthDb.meta.put({ key: DEMO_SEEDED_KEY, value: true });
    return;
  }

  const records = await fetchDemoRecords();

  // Re-check inside the transaction: another tab or a quick entry may have
  // written data during the fetch. Auto-seed only adds, it never clears.
  await healthDb.transaction('rw', [...dataTables(), healthDb.meta], async () => {
    if (await healthDb.meta.get(DEMO_SEEDED_KEY)) {
      return;
    }

    if (await isDataEmpty()) {
      await writeDemoRecords(records);
      return;
    }

    await healthDb.meta.put({ key: DEMO_SEEDED_KEY, value: true });
  });
}
