/*
  Warnings:

  - You are about to drop the column `createdAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Made the column `escalation` on table `Complaint` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Complaint" DROP CONSTRAINT "Complaint_assignedTo_fkey";

-- DropIndex
DROP INDEX "User_mobile_key";

-- AlterTable
ALTER TABLE "Complaint" ALTER COLUMN "escalation" SET NOT NULL,
ALTER COLUMN "escalation" SET DEFAULT 'None';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
DROP COLUMN "role",
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'citizen',
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'active';

-- DropEnum
DROP TYPE "Role";

-- DropEnum
DROP TYPE "Status";
