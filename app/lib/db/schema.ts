import Dexie, { type Table } from 'dexie';
import type { BloodPressureMeasurement } from '~/types/blood-pressure';
import type { GlucoseMeasurement } from '~/types/glucose';
import { normalizeGlucoseMeasurement } from './glucose-units';
import type { MetaEntry } from '~/types/meta';
import type { SymptomEntry } from '~/types/symptom';
import type { WeightMeasurement } from '~/types/weight';

export class HealthMonitorDatabase extends Dexie {
  glucoseMeasurement!: Table<GlucoseMeasurement, string>;
  bloodPressureMeasurement!: Table<BloodPressureMeasurement, string>;
  weightMeasurement!: Table<WeightMeasurement, string>;
  symptomEntry!: Table<SymptomEntry, string>;
  meta!: Table<MetaEntry, string>;

  constructor() {
    super('health-monitor');

    this.version(1).stores({
      glucoseMeasurement: 'id, measuredAt',
      bloodPressureMeasurement: 'id, measuredAt',
      weightMeasurement: 'id, measuredAt',
      symptomEntry: 'id, happenedAt, type',
    });

    this.version(2).stores({
      meta: 'key',
    });

    // No index changes: converts legacy mg/dL glucose values to mmol/L
    this.version(3)
      .stores({})
      .upgrade(tx =>
        tx
          .table<GlucoseMeasurement, string>('glucoseMeasurement')
          .toCollection()
          .modify((record) => {
            const normalized = normalizeGlucoseMeasurement(record);
            record.fastingValue = normalized.fastingValue;
            record.afterMealValue = normalized.afterMealValue;
          }),
      );
  }
}

export const healthDb = new HealthMonitorDatabase();
