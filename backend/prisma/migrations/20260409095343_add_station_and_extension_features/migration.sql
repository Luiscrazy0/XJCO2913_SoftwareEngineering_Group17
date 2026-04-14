/*
  Warnings:

  - Added the required column `updatedAt` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Scooter` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "BookingStatus" ADD VALUE 'EXTENDED';

-- AlterEnum
ALTER TYPE "ScooterStatus" ADD VALUE 'RENTED';

-- Step 1: 先添加可为空的列
ALTER TABLE "Booking" ADD COLUMN "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Booking" ADD COLUMN "extendedFrom" TEXT;
ALTER TABLE "Booking" ADD COLUMN "extensionCount" INTEGER DEFAULT 0;
ALTER TABLE "Booking" ADD COLUMN "originalEndTime" TIMESTAMP(3);
ALTER TABLE "Booking" ADD COLUMN "updatedAt" TIMESTAMP(3);

-- Step 2: 为现有数据设置updatedAt值
UPDATE "Booking" SET "updatedAt" = COALESCE("createdAt", CURRENT_TIMESTAMP);

-- Step 3: 将updatedAt设为NOT NULL
ALTER TABLE "Booking" ALTER COLUMN "updatedAt" SET NOT NULL;

-- Step 4: 为Scooter添加可为空的列
ALTER TABLE "Scooter" ADD COLUMN "latitude" DOUBLE PRECISION;
ALTER TABLE "Scooter" ADD COLUMN "longitude" DOUBLE PRECISION;
ALTER TABLE "Scooter" ADD COLUMN "stationId" TEXT;
ALTER TABLE "Scooter" ADD COLUMN "updatedAt" TIMESTAMP(3);

-- Step 5: 为现有数据设置updatedAt值
UPDATE "Scooter" SET "updatedAt" = CURRENT_TIMESTAMP;

-- Step 6: 将updatedAt设为NOT NULL
ALTER TABLE "Scooter" ALTER COLUMN "updatedAt" SET NOT NULL;

-- CreateTable
CREATE TABLE "Station" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Station_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Scooter" ADD CONSTRAINT "Scooter_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "Station"("id") ON DELETE SET NULL ON UPDATE CASCADE;
