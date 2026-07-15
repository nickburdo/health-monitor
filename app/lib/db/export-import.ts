import { healthDb } from '~/lib/db/schema';
import type { BloodPressureMeasurement } from '~/types/blood-pressure';
import type { GlucoseMeasurement } from '~/types/glucose';
import type { SymptomEntry } from '~/types/symptom';
import type { WeightMeasurement } from '~/types/weight';

export type HealthMonitorExport = {
  version: 1;
  exportedAt: string;
  data: {
    glucoseMeasurement: GlucoseMeasurement[];
    bloodPressureMeasurement: BloodPressureMeasurement[];
    weightMeasurement: WeightMeasurement[];
    symptomEntry: SymptomEntry[];
  };
};

export async function exportHealthMonitorData(): Promise<HealthMonitorExport> {
  const [glucoseMeasurement, bloodPressureMeasurement, weightMeasurement, symptomEntry]
    = await Promise.all([
      healthDb.glucoseMeasurement.toArray(),
      healthDb.bloodPressureMeasurement.toArray(),
      healthDb.weightMeasurement.toArray(),
      healthDb.symptomEntry.toArray(),
    ]);

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    data: { glucoseMeasurement, bloodPressureMeasurement, weightMeasurement, symptomEntry },
  };
}

export function downloadHealthMonitorExport(exportData: HealthMonitorExport): void {
  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = `health-monitor-export-${exportData.exportedAt.slice(0, 10)}.json`;
  link.click();

  URL.revokeObjectURL(url);
}

export async function importHealthMonitorData(file: File): Promise<void> {
  const text = await file.text();
  const parsed = JSON.parse(text) as HealthMonitorExport;

  if (parsed.version !== 1 || !parsed.data) {
    throw new Error('Unsupported export file format');
  }

  await healthDb.transaction(
    'rw',
    [
      healthDb.glucoseMeasurement,
      healthDb.bloodPressureMeasurement,
      healthDb.weightMeasurement,
      healthDb.symptomEntry,
    ],
    async () => {
      await Promise.all([
        healthDb.glucoseMeasurement.clear(),
        healthDb.bloodPressureMeasurement.clear(),
        healthDb.weightMeasurement.clear(),
        healthDb.symptomEntry.clear(),
      ]);

      await Promise.all([
        healthDb.glucoseMeasurement.bulkAdd(parsed.data.glucoseMeasurement),
        healthDb.bloodPressureMeasurement.bulkAdd(parsed.data.bloodPressureMeasurement),
        healthDb.weightMeasurement.bulkAdd(parsed.data.weightMeasurement),
        healthDb.symptomEntry.bulkAdd(parsed.data.symptomEntry),
      ]);
    },
  );
}
