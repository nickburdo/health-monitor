-- CreateTable
CREATE TABLE "GlucoseMeasurement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "measuredAt" DATETIME NOT NULL,
    "fastingValue" REAL,
    "fastingIgnore" BOOLEAN NOT NULL DEFAULT false,
    "afterMealValue" REAL,
    "afterMealIgnore" BOOLEAN NOT NULL DEFAULT false,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "BloodPressureMeasurement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "measuredAt" DATETIME NOT NULL,
    "systolic" INTEGER,
    "systolicIgnore" BOOLEAN NOT NULL DEFAULT false,
    "diastolic" INTEGER,
    "diastolicIgnore" BOOLEAN NOT NULL DEFAULT false,
    "pulse" INTEGER,
    "pulseIgnore" BOOLEAN NOT NULL DEFAULT false,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "WeightMeasurement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "measuredAt" DATETIME NOT NULL,
    "value" REAL,
    "ignore" BOOLEAN NOT NULL DEFAULT false,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "SymptomEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "happenedAt" DATETIME NOT NULL,
    "type" TEXT NOT NULL,
    "intensity" INTEGER,
    "ignore" BOOLEAN NOT NULL DEFAULT false,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "GlucoseMeasurement_measuredAt_idx" ON "GlucoseMeasurement"("measuredAt");

-- CreateIndex
CREATE INDEX "BloodPressureMeasurement_measuredAt_idx" ON "BloodPressureMeasurement"("measuredAt");

-- CreateIndex
CREATE INDEX "WeightMeasurement_measuredAt_idx" ON "WeightMeasurement"("measuredAt");

-- CreateIndex
CREATE INDEX "SymptomEntry_happenedAt_idx" ON "SymptomEntry"("happenedAt");

-- CreateIndex
CREATE INDEX "SymptomEntry_type_idx" ON "SymptomEntry"("type");
