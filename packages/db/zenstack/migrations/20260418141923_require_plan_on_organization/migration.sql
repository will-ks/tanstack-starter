-- Seed the free plan
INSERT INTO "Plan" ("id", "slug", "name", "sortOrder", "createdAt", "updatedAt")
VALUES ('plan_free', 'free', 'Free', 0, NOW(), NOW())
ON CONFLICT ("slug") DO NOTHING;

-- DropForeignKey
ALTER TABLE "Organization" DROP CONSTRAINT "Organization_planId_fkey";

-- AlterTable
ALTER TABLE "Organization" ALTER COLUMN "planId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
