import type { GlucoseMeasurement } from '~/types/glucose';

// Glucose is stored in mmol/L. These constants exist only to convert legacy
// records that were stored in mg/dL (old demo data and old JSON exports).
const MG_DL_PER_MMOL_L = 18;

// mmol/L values above 30 are practically impossible, while mg/dL values at or
// below 30 would mean severe hypoglycaemia, so anything above is treated as mg/dL.
// The same limit rejects quick entry values that were likely typed in mg/dL.
export const MAX_GLUCOSE_MMOL_L = 30;

export function normalizeGlucoseValue(value: number | null): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (value > MAX_GLUCOSE_MMOL_L) {
    return Math.round((value / MG_DL_PER_MMOL_L) * 10) / 10;
  }

  return value;
}

export function normalizeGlucoseMeasurement<
  T extends Pick<GlucoseMeasurement, 'fastingValue' | 'afterMealValue'>,
>(record: T): T {
  return {
    ...record,
    fastingValue: normalizeGlucoseValue(record.fastingValue),
    afterMealValue: normalizeGlucoseValue(record.afterMealValue),
  };
}
