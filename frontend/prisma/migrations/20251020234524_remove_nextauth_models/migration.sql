/*
  Warnings:

  - You are about to drop the column `emailVerified` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `instagramHandle` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `phoneVerified` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `profilePicture` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `tiktokHandle` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `accounts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `sessions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `verification_tokens` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `phone` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `username` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."accounts" DROP CONSTRAINT "accounts_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."sessions" DROP CONSTRAINT "sessions_userId_fkey";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "emailVerified",
DROP COLUMN "instagramHandle",
DROP COLUMN "phoneVerified",
DROP COLUMN "profilePicture",
DROP COLUMN "role",
DROP COLUMN "tiktokHandle",
ALTER COLUMN "phone" SET NOT NULL,
ALTER COLUMN "username" SET NOT NULL;

-- DropTable
DROP TABLE "public"."accounts";

-- DropTable
DROP TABLE "public"."sessions";

-- DropTable
DROP TABLE "public"."verification_tokens";

-- CreateTable
CREATE TABLE "memorial_lists" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "thumbnailPicture" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "memorial_lists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "memorial_list_items" (
    "id" TEXT NOT NULL,
    "listId" TEXT NOT NULL,
    "memorialId" TEXT NOT NULL,
    "addedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "memorial_list_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "memorial_list_collaborators" (
    "id" TEXT NOT NULL,
    "listId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "canEdit" BOOLEAN NOT NULL DEFAULT true,
    "canInvite" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "memorial_list_collaborators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "memorial_list_saves" (
    "id" TEXT NOT NULL,
    "listId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "memorial_list_saves_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "memorial_lists_createdById_idx" ON "memorial_lists"("createdById");

-- CreateIndex
CREATE INDEX "memorial_lists_isPublic_idx" ON "memorial_lists"("isPublic");

-- CreateIndex
CREATE INDEX "memorial_list_items_listId_idx" ON "memorial_list_items"("listId");

-- CreateIndex
CREATE INDEX "memorial_list_items_memorialId_idx" ON "memorial_list_items"("memorialId");

-- CreateIndex
CREATE UNIQUE INDEX "memorial_list_items_listId_memorialId_key" ON "memorial_list_items"("listId", "memorialId");

-- CreateIndex
CREATE INDEX "memorial_list_collaborators_listId_idx" ON "memorial_list_collaborators"("listId");

-- CreateIndex
CREATE INDEX "memorial_list_collaborators_userId_idx" ON "memorial_list_collaborators"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "memorial_list_collaborators_listId_userId_key" ON "memorial_list_collaborators"("listId", "userId");

-- CreateIndex
CREATE INDEX "memorial_list_saves_listId_idx" ON "memorial_list_saves"("listId");

-- CreateIndex
CREATE INDEX "memorial_list_saves_userId_idx" ON "memorial_list_saves"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "memorial_list_saves_listId_userId_key" ON "memorial_list_saves"("listId", "userId");

-- AddForeignKey
ALTER TABLE "memorial_lists" ADD CONSTRAINT "memorial_lists_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memorial_list_items" ADD CONSTRAINT "memorial_list_items_listId_fkey" FOREIGN KEY ("listId") REFERENCES "memorial_lists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memorial_list_items" ADD CONSTRAINT "memorial_list_items_memorialId_fkey" FOREIGN KEY ("memorialId") REFERENCES "memorials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memorial_list_collaborators" ADD CONSTRAINT "memorial_list_collaborators_listId_fkey" FOREIGN KEY ("listId") REFERENCES "memorial_lists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memorial_list_collaborators" ADD CONSTRAINT "memorial_list_collaborators_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memorial_list_saves" ADD CONSTRAINT "memorial_list_saves_listId_fkey" FOREIGN KEY ("listId") REFERENCES "memorial_lists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memorial_list_saves" ADD CONSTRAINT "memorial_list_saves_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
