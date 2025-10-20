-- AlterTable
ALTER TABLE "memorials" ADD COLUMN     "personBirthDate" TIMESTAMP(3),
ADD COLUMN     "personBirthPlace" TEXT,
ADD COLUMN     "personDeathDate" TIMESTAMP(3),
ADD COLUMN     "personDeathPlace" TEXT,
ADD COLUMN     "personName" TEXT;
