/*
  Warnings:

  - You are about to drop the column `cardExpiry` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `cardHolder` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `cardNumber` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "FeedbackCategory" AS ENUM ('FAULT', 'DAMAGE', 'SUGGESTION');

-- CreateEnum
CREATE TYPE "FeedbackPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "FeedbackStatus" AS ENUM ('PENDING', 'RESOLVED', 'ESCALATED', 'CHARGEABLE');

-- CreateEnum
CREATE TYPE "DamageType" AS ENUM ('NATURAL', 'INTENTIONAL');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "cardExpiry",
DROP COLUMN "cardHolder",
DROP COLUMN "cardNumber",
ADD COLUMN     "emergencyContact" TEXT,
ADD COLUMN     "insuranceAcknowledged" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "FeedbackCategory" NOT NULL,
    "priority" "FeedbackPriority" NOT NULL DEFAULT 'LOW',
    "status" "FeedbackStatus" NOT NULL DEFAULT 'PENDING',
    "scooterId" TEXT NOT NULL,
    "bookingId" TEXT,
    "imageUrl" TEXT,
    "managerNotes" TEXT,
    "resolutionCost" DOUBLE PRECISION,
    "damageType" "DamageType",
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_scooterId_fkey" FOREIGN KEY ("scooterId") REFERENCES "Scooter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
