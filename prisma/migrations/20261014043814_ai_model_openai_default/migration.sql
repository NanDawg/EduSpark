-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AIGenerationLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "type" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "response" TEXT,
    "model" TEXT NOT NULL DEFAULT 'openai',
    "status" TEXT NOT NULL,
    "durationMs" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AIGenerationLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_AIGenerationLog" ("createdAt", "durationMs", "id", "model", "prompt", "response", "status", "type", "userId") SELECT "createdAt", "durationMs", "id", "model", "prompt", "response", "status", "type", "userId" FROM "AIGenerationLog";
DROP TABLE "AIGenerationLog";
ALTER TABLE "new_AIGenerationLog" RENAME TO "AIGenerationLog";
CREATE INDEX "AIGenerationLog_type_status_idx" ON "AIGenerationLog"("type", "status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
