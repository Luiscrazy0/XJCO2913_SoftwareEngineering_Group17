import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BookingStatus, HireType, ScooterStatus } from '@prisma/client';
import { EmailService } from '../email/email.service';

@Injectable()
export class BookingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async findAll() {
    return this.prisma.booking.findMany({
      include: {
        user: true,
        scooter: true,
      },
    });
  }

  async findById(id: string) {
    return this.prisma.booking.findUnique({
      where: { id },
      include: {
        user: true,
        scooter: true,
        payment: true,
      },
    });
  }

  async createBooking(
    userId: string,
    scooterId: string,
    hireType: HireType,
    startTime: Date,
    endTime: Date,
  ) {
    const scooter = await this.prisma.scooter.findUnique({
      where: { id: scooterId },
    });

    if (!scooter) {
      throw new BadRequestException('Scooter not found');
    }

    if (scooter.status !== ScooterStatus.AVAILABLE) {
      throw new BadRequestException('Scooter not available');
    }

    const totalCost = this.calculateCost(hireType);

    // 开始事务：创建预订并更新滑板车状态
    return this.prisma.$transaction(async (tx) => {
      // 创建预订
      const booking = await tx.booking.create({
        data: {
          userId,
          scooterId,
          hireType,
          startTime,
          endTime,
          totalCost,
          status: BookingStatus.PENDING_PAYMENT,
          originalEndTime: endTime,
        },
        include: {
          user: true,
          scooter: true,
        },
      });

      // 更新滑板车状态为已租用
      await tx.scooter.update({
        where: { id: scooterId },
        data: { status: ScooterStatus.RENTED },
      });

      // 发送预订确认邮件（异步）
      this.sendBookingConfirmationEmail(booking);

      return booking;
    });
  }

  async extendBooking(bookingId: string, additionalHours: number) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { scooter: true, user: true },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.status !== BookingStatus.CONFIRMED && booking.status !== BookingStatus.EXTENDED) {
      throw new BadRequestException('Only confirmed or extended bookings can be extended');
    }

    const extensionCost = additionalHours * 5;
    const newEndTime = new Date(booking.endTime.getTime() + additionalHours * 60 * 60 * 1000);

    return this.prisma.$transaction(async (tx) => {
      const updatedBooking = await tx.booking.update({
        where: { id: bookingId },
        data: {
          endTime: newEndTime,
          totalCost: booking.totalCost + extensionCost,
          status: BookingStatus.EXTENDED,
          extensionCount: booking.extensionCount + 1,
        },
        include: {
          user: true,
          scooter: true,
        },
      });

      return updatedBooking;
    });
  }

  async cancelBooking(id: string) {
    return this.prisma.booking.update({
      where: { id },
      data: { status: BookingStatus.CANCELLED },
      include: {
        user: true,
        scooter: true,
      },
    });
  }

  private calculateCost(hireType: HireType): number {
    switch (hireType) {
      case HireType.HOUR_1:
        return 5;
      case HireType.HOUR_4:
        return 15;
      case HireType.DAY_1:
        return 40;
      case HireType.WEEK_1:
        return 200;
      default:
        return 0;
    }
  }

  private async sendBookingConfirmationEmail(booking: any): Promise<void> {
    try {
      await this.emailService.sendBookingConfirmation(
        booking.user.email,
        booking.id,
        booking.totalCost
      );
    } catch (error) {
      console.error('发送预订确认邮件失败:', error);
      // 邮件发送失败不应该影响主要业务流程
    }
  }
}
