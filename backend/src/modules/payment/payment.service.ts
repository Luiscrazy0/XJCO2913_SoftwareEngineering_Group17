import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BookingStatus } from '@prisma/client';
import { EmailService } from '../booking/email.service';

/**
 * PaymentService class handles payment-related operations.
 */
@Injectable()
export class PaymentService {

  
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async createPayment(bookingId: string, amount: number) {
    //第一步：检查 booking 是否存在。
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    /**
     * Throws a BadRequestException if the booking is not found.
     */
    if (!booking) {
      throw new BadRequestException('Booking not found');
    }

    //第二步：检查 booking 是否允许支付。
    if (booking.status !== BookingStatus.PENDING_PAYMENT) {
      throw new BadRequestException('Booking cannot be paid');
    }

    //第三步：创建 payment。
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

    // 发送支付收据邮件
    try {
      const bookingWithUser = await this.prisma.booking.findUnique({
        where: { id: bookingId },
        include: { user: true },
      });
      if (bookingWithUser) {
        await this.emailService.sendPaymentReceipt(bookingWithUser, amount);
      }
    } catch (error) {
      console.error('发送支付收据邮件失败:', error);
      // 不抛出错误，以免影响主要业务流程
    }

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
