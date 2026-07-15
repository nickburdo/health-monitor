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

function resolveDate(daysAgo: number): string {
  const base = new Date();
  base.setHours(12, 0, 0, 0);
  base.setDate(base.getDate() - daysAgo);
  return base.toISOString();
}

export async function seedDemoDataIfEmpty(): Promise<void> {
  const [glucoseCount, bloodPressureCount, weightCount, symptomCount]
    = await Promise.all([
      healthDb.glucoseMeasurement.count(),
      healthDb.bloodPressureMeasurement.count(),
      healthDb.weightMeasurement.count(),
      healthDb.symptomEntry.count(),
    ]);

  const isEmpty
    = glucoseCount === 0
      && bloodPressureCount === 0
      && weightCount === 0
      && symptomCount === 0;

  if (!isEmpty) {
    return;
  }

  const demoData = await $fetch<DemoDataFile>('/data/demo.json');
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

  await Promise.all([
    healthDb.glucoseMeasurement.bulkAdd(glucoseRecords),
    healthDb.bloodPressureMeasurement.bulkAdd(bloodPressureRecords),
    healthDb.weightMeasurement.bulkAdd(weightRecords),
    healthDb.symptomEntry.bulkAdd(symptomRecords),
  ]);
}
