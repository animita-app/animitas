/*
  Warnings:

  - You are about to drop the column `images` on the `memorials` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "candles" ADD COLUMN     "backgroundColor" TEXT NOT NULL DEFAULT 'plain',
ADD COLUMN     "flameStyle" TEXT NOT NULL DEFAULT 'warm',
ADD COLUMN     "standStyle" TEXT NOT NULL DEFAULT 'classic',
ADD COLUMN     "stickStyle" TEXT NOT NULL DEFAULT 'smooth';

-- AlterTable
ALTER TABLE "memorials" DROP COLUMN "images";

-- AlterTable
ALTER TABLE "people" ADD COLUMN     "image" TEXT;

-- AlterTable
ALTER TABLE "testimonies" ADD COLUMN     "images" TEXT[];
