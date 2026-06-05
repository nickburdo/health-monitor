/*
  Warnings:

  - You are about to drop the column `diastolicIgnore` on the `BloodPressureMeasurement` table. All the data in the column will be lost.
  - You are about to drop the column `pulseIgnore` on the `BloodPressureMeasurement` table. All the data in the column will be lost.
  - You are about to drop the column `systolicIgnore` on the `BloodPressureMeasurement` table. All the data in the column will be lost.
  - You are about to drop the column `afterMealIgnore` on the `GlucoseMeasurement` table. All the data in the column will be lost.
  - You are about to drop the column `fastingIgnore` on the `GlucoseMeasurement` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BloodPressureMeasurement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "measuredAt" DATETIME NOT NULL,
    "systolic" INTEGER,
    "diastolic" INTEGER,
    "pulse" INTEGER,
    "ignore" BOOLEAN NOT NULL DEFAULT false,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_BloodPressureMeasurement" ("createdAt", "diastolic", "id", "measuredAt", "note", "pulse", "systolic") SELECT "createdAt", "diastolic", "id", "measuredAt", "note", "pulse", "systolic" FROM "BloodPressureMeasurement";
DROP TABLE "BloodPressureMeasurement";
ALTER TABLE "new_BloodPressureMeasurement" RENAME TO "BloodPressureMeasurement";
CREATE INDEX "BloodPressureMeasurement_measuredAt_idx" ON "BloodPressureMeasurement"("measuredAt");
CREATE TABLE "new_GlucoseMeasurement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "measuredAt" DATETIME NOT NULL,
    "fastingValue" REAL,
    "afterMealValue" REAL,
    "ignore" BOOLEAN NOT NULL DEFAULT false,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_GlucoseMeasurement" ("afterMealValue", "createdAt", "fastingValue", "id", "measuredAt", "note") SELECT "afterMealValue", "createdAt", "fastingValue", "id", "measuredAt", "note" FROM "GlucoseMeasurement";
DROP TABLE "GlucoseMeasurement";
ALTER TABLE "new_GlucoseMeasurement" RENAME TO "GlucoseMeasurement";
CREATE INDEX "GlucoseMeasurement_measuredAt_idx" ON "GlucoseMeasurement"("measuredAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
