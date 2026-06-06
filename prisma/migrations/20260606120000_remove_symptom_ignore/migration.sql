/*
  Warnings:

  - You are about to drop the column `ignore` on the `SymptomEntry` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SymptomEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "happenedAt" DATETIME NOT NULL,
    "type" TEXT NOT NULL,
    "intensity" INTEGER,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_SymptomEntry" ("createdAt", "happenedAt", "id", "intensity", "note", "type") SELECT "createdAt", "happenedAt", "id", "intensity", "note", "type" FROM "SymptomEntry";
DROP TABLE "SymptomEntry";
ALTER TABLE "new_SymptomEntry" RENAME TO "SymptomEntry";
CREATE INDEX "SymptomEntry_happenedAt_idx" ON "SymptomEntry"("happenedAt");
CREATE INDEX "SymptomEntry_type_idx" ON "SymptomEntry"("type");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
