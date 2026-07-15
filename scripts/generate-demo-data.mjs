import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputPath = resolve(__dirname, '../public/data/demo.json');

mkdirSync(dirname(outputPath), { recursive: true });

const glucoseMeasurement = [
  { daysAgo: 0, fastingValue: 91, note: 'Morning check' },
  { daysAgo: 2, afterMealValue: 128, note: 'After lunch' },
  { daysAgo: 7, fastingValue: 89, note: 'Stable morning' },
  { daysAgo: 9, afterMealValue: 132, note: 'After dinner' },
  { daysAgo: 14, fastingValue: 87, note: 'Before breakfast' },
  { daysAgo: 16, afterMealValue: 124, note: 'After snack' },
  { daysAgo: 21, fastingValue: 90, note: 'Morning check' },
  { daysAgo: 23, afterMealValue: 130, note: 'After meal' },
  { daysAgo: 28, fastingValue: 92, note: 'Morning check' },
  { daysAgo: 30, afterMealValue: 126, note: 'After meal' },
];

const bloodPressureMeasurement = [
  { daysAgo: 0, systolic: 118, diastolic: 76, pulse: 68, note: 'Morning check' },
  { daysAgo: 2, systolic: 122, diastolic: 80, pulse: 71, note: 'After walk' },
  { daysAgo: 7, systolic: 124, diastolic: 78, pulse: 69, note: 'Rested' },
  { daysAgo: 9, systolic: 130, diastolic: 82, pulse: 72, note: 'Evening' },
  { daysAgo: 14, systolic: 116, diastolic: 74, pulse: 66, note: 'Calm' },
  { daysAgo: 16, systolic: 128, diastolic: 84, pulse: 74, note: 'After stress' },
  { daysAgo: 21, systolic: 120, diastolic: 77, pulse: 70, note: 'Morning check' },
  { daysAgo: 23, systolic: 134, diastolic: 86, pulse: 76, note: 'After work' },
  { daysAgo: 28, systolic: 117, diastolic: 73, pulse: 67, note: 'Rested' },
  { daysAgo: 30, systolic: 126, diastolic: 79, pulse: 71, note: 'Morning check' },
];

const weightMeasurement = [
  { daysAgo: 0, value: 84.6, note: 'Morning weight' },
  { daysAgo: 2, value: 84.8, note: 'Morning weight' },
  { daysAgo: 7, value: 85.0, note: 'Morning weight' },
  { daysAgo: 9, value: 85.1, note: 'Morning weight' },
  { daysAgo: 14, value: 85.3, note: 'Morning weight' },
  { daysAgo: 16, value: 85.4, note: 'Morning weight' },
  { daysAgo: 21, value: 85.6, note: 'Morning weight' },
  { daysAgo: 23, value: 85.7, note: 'Morning weight' },
  { daysAgo: 28, value: 85.9, note: 'Morning weight' },
  { daysAgo: 30, value: 86.0, note: 'Morning weight' },
];

const symptomEntry = [
  { daysAgo: 0, type: 'bloating', intensity: 2, note: 'Light discomfort' },
  { daysAgo: 2, type: 'headache', intensity: 3, note: 'Short episode' },
  { daysAgo: 7, type: 'bloating', intensity: 1, note: 'Brief note' },
  { daysAgo: 9, type: 'bloating', intensity: 4, note: 'Managed well' },
  { daysAgo: 14, type: 'headache', intensity: 2, note: 'Mild issue' },
  { daysAgo: 16, type: 'stress', intensity: 5, note: 'Noticeable symptom' },
  { daysAgo: 21, type: 'bloating', intensity: 3, note: 'Short episode' },
  { daysAgo: 23, type: 'headache', intensity: 4, note: 'Evening note' },
  { daysAgo: 28, type: 'bloating', intensity: 2, note: 'Mild issue' },
  { daysAgo: 30, type: 'bloating', intensity: 1, note: 'Brief note' },
];

const demoData = {
  glucoseMeasurement,
  bloodPressureMeasurement,
  weightMeasurement,
  symptomEntry,
};

writeFileSync(outputPath, `${JSON.stringify(demoData, null, 2)}\n`, 'utf-8');

console.log(`Demo data written to ${outputPath}`);
console.log(
  JSON.stringify(
    {
      glucoseMeasurement: glucoseMeasurement.length,
      bloodPressureMeasurement: bloodPressureMeasurement.length,
      weightMeasurement: weightMeasurement.length,
      symptomEntry: symptomEntry.length,
    },
    null,
    2,
  ),
);
