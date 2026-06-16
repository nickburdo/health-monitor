-- CreateTable
CREATE TABLE "health_monitor_glucose_measurement" (
    "id" TEXT NOT NULL,
    "measuredAt" TIMESTAMP(3) NOT NULL,
    "fastingValue" DOUBLE PRECISION,
    "afterMealValue" DOUBLE PRECISION,
    "ignore" BOOLEAN NOT NULL DEFAULT false,
    "note" TEXT,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "health_monitor_glucose_measurement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_monitor_blood_pressure_measurement" (
    "id" TEXT NOT NULL,
    "measuredAt" TIMESTAMP(3) NOT NULL,
    "systolic" INTEGER,
    "diastolic" INTEGER,
    "pulse" INTEGER,
    "ignore" BOOLEAN NOT NULL DEFAULT false,
    "note" TEXT,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "health_monitor_blood_pressure_measurement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_monitor_weight_measurement" (
    "id" TEXT NOT NULL,
    "measuredAt" TIMESTAMP(3) NOT NULL,
    "value" DOUBLE PRECISION,
    "ignore" BOOLEAN NOT NULL DEFAULT false,
    "note" TEXT,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "health_monitor_weight_measurement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_monitor_symptom_entry" (
    "id" TEXT NOT NULL,
    "happenedAt" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "intensity" INTEGER,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "health_monitor_symptom_entry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "health_monitor_glucose_measurement_measuredAt_idx" ON "health_monitor_glucose_measurement"("measuredAt");

-- CreateIndex
CREATE INDEX "health_monitor_blood_pressure_measurement_measuredAt_idx" ON "health_monitor_blood_pressure_measurement"("measuredAt");

-- CreateIndex
CREATE INDEX "health_monitor_weight_measurement_measuredAt_idx" ON "health_monitor_weight_measurement"("measuredAt");

-- CreateIndex
CREATE INDEX "health_monitor_symptom_entry_happenedAt_idx" ON "health_monitor_symptom_entry"("happenedAt");

-- CreateIndex
CREATE INDEX "health_monitor_symptom_entry_type_idx" ON "health_monitor_symptom_entry"("type");
