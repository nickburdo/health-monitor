# TypeScript Types

```ts
export interface GlucoseMeasurement {
  id: string;
  measuredAt?: Date | null;
  fastingValue?: number;
  afterMealValue?: number;
  ignore?: boolean;
  note?: string;
  reason?: string;
  createdAt: Date
  isDemo: boolean;
}

export interface BloodPressureMeasurement {
  id: string;
  measuredAt?: Date | null;
  systolic?: number;
  diastolic?: number;
  ignore?: boolean;
  note?: string;
  reason?: string;
  createdAt: Date
  isDemo: boolean;
}

export interface WeightMeasurements {
  id: string;
  measuredAt?: Date | null;
  value?: number;
  ignore?: boolean;
  note?: string;
  reason?: string;
  createdAt: Date
  isDemo: boolean;
}

export interface SymptomEntries {
  id: string;
  happenedAt?: Date | null;
  type?: string;
  intensity?: number;
  note?: string;
  createdAt: Date
  isDemo: boolean;
}
```
