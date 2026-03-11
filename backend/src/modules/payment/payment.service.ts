import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BookingStatus } from '@prisma/client';

/**
 * PaymentService class handles payment-related operations.
 */
@Injectable()
export class PaymentService {
  
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates a new payment for a booking.
   * @param bookingId Unique ID of the booking.
   * @param amount Amount to be paid for the booking.
   * @returns The created payment.
   */
  async createPayment(bookingId: string, amount: number) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    /**
     * Throws a BadRequestException if the booking is not found.
     */
    if (!booking) {
      throw new BadRequestException('Booking not found');
    }

    /**
     * Throws a BadRequestException if the booking status is not PENDING_PAYMENT.
     */
    if (booking.status !== BookingStatus.PENDING_PAYMENT) {
      throw new BadRequestException('Booking cannot be paid');
    }

    /**
     * Creates a new payment with the given booking ID, amount, and status.
     */
    const payment = await this.prisma.payment.create({
      data: {
        bookingId,
        amount,
        status: 'SUCCESS',
      },
    });

    /**
     * Updates the booking status to CONFIRMED.
     */
    await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        /**
         * Status of the booking (CONFIRMED).
         */
        status: BookingStatus.CONFIRMED,
      },
    });

    return payment;
  }

  /**
   * Retrieves a payment by booking ID.
   * @param bookingId Unique ID of the booking.
   * @returns The payment details for the given booking ID.
   */
  async getPaymentByBooking(bookingId: string) {
    return this.prisma.payment.findUnique({
      where: { bookingId },
      include: {
        booking: true,
      },
    });
  }
}