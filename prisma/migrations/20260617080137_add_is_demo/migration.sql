-- AlterTable
ALTER TABLE "health_monitor_blood_pressure_measurement" ADD COLUMN     "isDemo" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "health_monitor_glucose_measurement" ADD COLUMN     "isDemo" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "health_monitor_symptom_entry" ADD COLUMN     "isDemo" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "health_monitor_weight_measurement" ADD COLUMN     "isDemo" BOOLEAN NOT NULL DEFAULT false;
