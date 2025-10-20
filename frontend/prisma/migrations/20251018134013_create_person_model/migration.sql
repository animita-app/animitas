/*
  Warnings:

  - You are about to drop the column `personBirthDate` on the `memorials` table. All the data in the column will be lost.
  - You are about to drop the column `personBirthPlace` on the `memorials` table. All the data in the column will be lost.
  - You are about to drop the column `personDeathDate` on the `memorials` table. All the data in the column will be lost.
  - You are about to drop the column `personDeathPlace` on the `memorials` table. All the data in the column will be lost.
  - You are about to drop the column `personName` on the `memorials` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "memorials" DROP COLUMN "personBirthDate",
DROP COLUMN "personBirthPlace",
DROP COLUMN "personDeathDate",
DROP COLUMN "personDeathPlace",
DROP COLUMN "personName",
ADD COLUMN     "personId" TEXT;

-- CreateTable
CREATE TABLE "people" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3),
    "deathDate" TIMESTAMP(3),
    "birthPlace" TEXT,
    "deathPlace" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "people_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "memorials_personId_idx" ON "memorials"("personId");

-- AddForeignKey
ALTER TABLE "memorials" ADD CONSTRAINT "memorials_personId_fkey" FOREIGN KEY ("personId") REFERENCES "people"("id") ON DELETE SET NULL ON UPDATE CASCADE;
