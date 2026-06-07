ALTER TABLE "GlucoseMeasurement" ADD COLUMN "reason" TEXT;
ALTER TABLE "BloodPressureMeasurement" ADD COLUMN "reason" TEXT;
ALTER TABLE "WeightMeasurement" ADD COLUMN "reason" TEXT;

UPDATE "GlucoseMeasurement"
SET "reason" = "note"
WHERE "ignore" = 1;

UPDATE "BloodPressureMeasurement"
SET "reason" = "note"
WHERE "ignore" = 1;

UPDATE "WeightMeasurement"
SET "reason" = "note"
WHERE "ignore" = 1;
