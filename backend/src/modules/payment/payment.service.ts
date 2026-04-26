import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BookingStatus, Role } from '@prisma/client';
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

  async createPayment(bookingId: string, amount: number, userId: string) {
    //第一步：检查 booking 是否存在。
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { user: true },
    });

    /**
     * Throws a BadRequestException if the booking is not found.
     */
    if (!booking) {
      throw new BadRequestException('Booking not found');
    }

    // 验证用户是否有权限为此预约支付
    if (booking.userId !== userId) {
      throw new ForbiddenException('You can only pay for your own bookings');
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
      if (booking.user) {
        await this.emailService.sendPaymentReceipt(booking, amount);
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
   * @param userId ID of the user requesting the payment.
   * @returns The payment details for the given booking ID.
   */
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

    if (!payment) {
      return null;
    }

    // 验证用户是否有权限查看此支付
    // 管理员可以查看所有支付
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (user?.role !== Role.MANAGER && payment.booking.userId !== userId) {
      throw new ForbiddenException('You can only view payments for your own bookings');
    }

    return payment;
  }
}
