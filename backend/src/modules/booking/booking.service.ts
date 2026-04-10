import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BookingStatus, HireType, ScooterStatus } from '@prisma/client';
import { DiscountService } from './discount.service';
import { EmailService } from './email.service';

@Injectable()
export class BookingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly discountService: DiscountService,
    private readonly emailService: EmailService,
  ) {}

  async findAll() {
    return this.prisma.booking.findMany({
      include: {
        // Include user and scooter details
        user: true,
        scooter: true, 

      },
    });
  }

  
  async findById(id: string) {
    // Find booking by ID and include user and scooter 
    return this.prisma.booking.findUnique({
      where: { id }, // Use where clause to find booking by ID
      include: {
        user: true,
        scooter: true,
        payment: true,
      },
    });
  }

  async createBooking(
    // booking creation
    userId: string,
    scooterId: string,
    hireType: HireType,
    startTime: Date,
    endTime: Date,
  ) {
    
    const scooter = await this.prisma.scooter.findUnique({
        // Find scooter by ID
      where: { id: scooterId },
    });

    if (!scooter) {
        // Check if scooter exists
      throw new BadRequestException('Scooter not found');
    }

    if (scooter.status !== ScooterStatus.AVAILABLE) {
        // Check if scooter is available
      throw new BadRequestException('Scooter not available');
    }

    const totalCost = this.calculateCost(hireType);
    // 计算折扣
    const discountResult = await this.discountService.calculateDiscountedPrice(
      userId,
      totalCost,
      hireType,
    );
    const finalCost = discountResult.discountedPrice;

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
          totalCost: finalCost,
          status: BookingStatus.PENDING_PAYMENT,
          originalEndTime: endTime, // 保存原始结束时间
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

      return booking;
    });

    // 发送预订确认邮件
    try {
      await this.emailService.sendBookingConfirmation(booking, finalCost);
    } catch (error) {
      console.error('发送预订确认邮件失败:', error);
      // 不抛出错误，以免影响主要业务流程
    }

    return booking;

  async extendBooking(bookingId: string, additionalHours: number) {
    // 查找预订
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { scooter: true },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // 检查预订状态是否可以续租
    if (booking.status !== BookingStatus.CONFIRMED && booking.status !== BookingStatus.EXTENDED) {
      throw new BadRequestException('Only confirmed or extended bookings can be extended');
    }

    // 计算续租费用（按小时计费）
    const extensionCost = additionalHours * 5; // 每小时5元

    // 计算新的结束时间
    const newEndTime = new Date(booking.endTime.getTime() + additionalHours * 60 * 60 * 1000);

    // 开始事务：更新预订
    return this.prisma.$transaction(async (tx) => {
      // 更新预订
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

    // 发送续租确认邮件
    try {
      await this.emailService.sendExtensionConfirmation(updatedBooking, extensionCost, newEndTime);
    } catch (error) {
      console.error('发送续租确认邮件失败:', error);
      // 不抛出错误，以免影响主要业务流程
    }

    return updatedBooking;

  async cancelBooking(id: string) {
    // Cancel booking by ID
    return this.prisma.booking.update({
        // Update booking status to CANCELLED
      where: { id },
      data: { status: BookingStatus.CANCELLED },
      include: {
        user: true,
        scooter: true,
      },
    });
  }

  private calculateCost(hireType: HireType): number {
    // Calculate cost based on hire type
    switch (hireType) {

        // Define cost for each hire type
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
}
