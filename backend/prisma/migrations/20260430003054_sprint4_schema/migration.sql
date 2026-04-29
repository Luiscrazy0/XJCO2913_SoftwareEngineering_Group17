-- AlterEnum
ALTER TYPE "BookingStatus" ADD VALUE 'IN_PROGRESS';

-- AlterTable: Station
ALTER TABLE "Station" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable: Booking
ALTER TABLE "Booking" ADD COLUMN "pickupStationId" TEXT;
ALTER TABLE "Booking" ADD COLUMN "returnStationId" TEXT;
ALTER TABLE "Booking" ADD COLUMN "actualStartTime" TIMESTAMP(3);
ALTER TABLE "Booking" ADD COLUMN "actualEndTime" TIMESTAMP(3);

-- AlterTable: Payment
ALTER TABLE "Payment" ADD COLUMN "idempotencyKey" TEXT;
ALTER TABLE "Payment" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex: Payment idempotency unique
CREATE UNIQUE INDEX "Payment_idempotencyKey_key" ON "Payment"("idempotencyKey");

-- CreateIndex: Station booking composite
CREATE INDEX "idx_booking_user_start_status" ON "Booking"("userId", "startTime", "status");

-- CreateIndex: Scooter status station composite
CREATE INDEX "idx_scooter_status_station" ON "Scooter"("status", "stationId");

-- CreateIndex: Booking pickup station composite
CREATE INDEX "idx_booking_pickup_station" ON "Booking"("pickupStationId", "status");

-- AddForeignKey: Booking -> Station (pickup)
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_pickupStationId_fkey"
  FOREIGN KEY ("pickupStationId") REFERENCES "Station"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: Booking -> Station (return)
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_returnStationId_fkey"
  FOREIGN KEY ("returnStationId") REFERENCES "Station"("id") ON DELETE SET NULL ON UPDATE CASCADE;
