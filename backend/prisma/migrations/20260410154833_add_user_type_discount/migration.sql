/*
  Warnings:

  - Made the column `createdAt` on table `Booking` required. This step will fail if there are existing NULL values in that column.
  - Made the column `extensionCount` on table `Booking` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('NORMAL', 'STUDENT', 'SENIOR', 'FREQUENT');

-- AlterTable
ALTER TABLE "Booking" ALTER COLUMN "createdAt" SET NOT NULL,
ALTER COLUMN "extensionCount" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "userType" "UserType" NOT NULL DEFAULT 'NORMAL';
