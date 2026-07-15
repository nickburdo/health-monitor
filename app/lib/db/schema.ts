import Dexie, { type Table } from 'dexie';
import type { BloodPressureMeasurement } from '~/types/blood-pressure';
import type { GlucoseMeasurement } from '~/types/glucose';
import type { SymptomEntry } from '~/types/symptom';
import type { WeightMeasurement } from '~/types/weight';

export class HealthMonitorDatabase extends Dexie {
  glucoseMeasurement!: Table<GlucoseMeasurement, string>;
  bloodPressureMeasurement!: Table<BloodPressureMeasurement, string>;
  weightMeasurement!: Table<WeightMeasurement, string>;
  symptomEntry!: Table<SymptomEntry, string>;

  constructor() {
    super('health-monitor');

    this.version(1).stores({
      glucoseMeasurement: 'id, measuredAt',
      bloodPressureMeasurement: 'id, measuredAt',
      weightMeasurement: 'id, measuredAt',
      symptomEntry: 'id, happenedAt, type',
    });
  }
}

export const healthDb = new HealthMonitorDatabase();
