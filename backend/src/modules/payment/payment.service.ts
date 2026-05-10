import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BookingStatus, Role, ScooterStatus } from '@prisma/client';
import { EmailService } from '../booking/email.service';

@Injectable()
export class PaymentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async createPayment(
    bookingId: string,
    amount: number,
    userId: string,
    idempotencyKey?: string,
  ) {
    // Step 0: Idempotency check
    if (idempotencyKey) {
      const existingPayment = await this.prisma.payment.findUnique({
        where: { idempotencyKey },
        include: { booking: true },
      });
      if (existingPayment) {
        return { payment: existingPayment, booking: existingPayment.booking };
      }
    }

    // Step 1: Atomic transaction — validates status inside the lock
    const result = await this.prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
        include: { user: true, scooter: true },
      });

      if (!booking) throw new BadRequestException('Booking not found');
      if (booking.userId !== userId)
        throw new ForbiddenException('You can only pay for your own bookings');
      if (booking.status !== BookingStatus.PENDING_PAYMENT) {
        throw new BadRequestException('Booking cannot be paid');
      }

      const payment = await tx.payment.create({
        data: {
          bookingId,
          amount,
          status: 'SUCCESS',
          idempotencyKey: idempotencyKey || null,
        },
      });

      const updatedBooking = await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: BookingStatus.CONFIRMED,
          pickupStationId: booking.scooter.stationId,
        },
        include: { scooter: true, user: true },
      });

      await tx.scooter.update({
        where: { id: booking.scooterId },
        data: { status: ScooterStatus.RENTED },
      });

      return { payment, booking: updatedBooking };
    });

    // Send receipt email (non-critical)
    try {
      if (result.booking.user) {
        await this.emailService.sendPaymentReceipt(result.booking, amount);
      }
    } catch (error) {
      console.error('Failed to send payment receipt email:', error);
    }

    return result.payment;
  }

  async getPaymentByBooking(bookingId: string, userId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { bookingId },
      include: {
        booking: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!payment) return null;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (user?.role !== Role.MANAGER && payment.booking.userId !== userId) {
      throw new ForbiddenException(
        'You can only view payments for your own bookings',
      );
    }

    return payment;
  }
}
