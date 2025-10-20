/*
  Warnings:

  - You are about to drop the column `personId` on the `memorials` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."memorials" DROP CONSTRAINT "memorials_personId_fkey";

-- DropIndex
DROP INDEX "public"."memorials_personId_idx";

-- AlterTable
ALTER TABLE "memorials" DROP COLUMN "personId";

-- CreateTable
CREATE TABLE "memorial_people" (
    "memorialId" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "memorial_people_pkey" PRIMARY KEY ("memorialId","personId")
);

-- CreateIndex
CREATE INDEX "memorial_people_memorialId_idx" ON "memorial_people"("memorialId");

-- CreateIndex
CREATE INDEX "memorial_people_personId_idx" ON "memorial_people"("personId");

-- AddForeignKey
ALTER TABLE "memorial_people" ADD CONSTRAINT "memorial_people_memorialId_fkey" FOREIGN KEY ("memorialId") REFERENCES "memorials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memorial_people" ADD CONSTRAINT "memorial_people_personId_fkey" FOREIGN KEY ("personId") REFERENCES "people"("id") ON DELETE CASCADE ON UPDATE CASCADE;
