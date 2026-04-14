import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  BookingStatus,
  HireType,
  ScooterStatus,
  FeedbackCategory,
  FeedbackPriority,
  FeedbackStatus,
} from '@prisma/client';
import { DiscountService } from './discount.service';
import { EmailService } from './email.service';
import * as bcrypt from 'bcrypt';

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
    const discountResult = await this.discountService.calculateDiscountedPrice(
      userId,
      totalCost,
      hireType,
    );
    const finalCost = discountResult.discountedPrice;

    const booking = await this.prisma.$transaction(async (tx) => {
      const createdBooking = await tx.booking.create({
        data: {
          userId,
          scooterId,
          hireType,
          startTime,
          endTime,
          totalCost: finalCost,
          status: BookingStatus.PENDING_PAYMENT,
          originalEndTime: endTime,
        },
        include: {
          user: true,
          scooter: true,
        },
      });

      await tx.scooter.update({
        where: { id: scooterId },
        data: { status: ScooterStatus.RENTED },
      });

      return createdBooking;
    });

    try {
      await this.emailService.sendBookingConfirmation(booking, finalCost);
    } catch (error) {
      console.error('发送预订确认邮件失败:', error);
    }

    return booking;
  }

  async extendBooking(bookingId: string, additionalHours: number) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { scooter: true, user: true },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (
      booking.status !== BookingStatus.CONFIRMED &&
      booking.status !== BookingStatus.EXTENDED
    ) {
      throw new BadRequestException(
        'Only confirmed or extended bookings can be extended',
      );
    }

    const extensionCost = additionalHours * 5;
    const newEndTime = new Date(
      booking.endTime.getTime() + additionalHours * 60 * 60 * 1000,
    );

    const updatedBooking = await this.prisma.$transaction(async (tx) => {
      const result = await tx.booking.update({
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

      return result;
    });

    try {
      await this.emailService.sendExtensionConfirmation(
        updatedBooking,
        extensionCost,
        newEndTime,
      );
    } catch (error) {
      console.error('发送续租确认邮件失败:', error);
    }

    return updatedBooking;
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

  async completeBooking(id: string, isScooterIntact: boolean = true) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: { scooter: true, user: true },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('Cannot complete a cancelled booking');
    }

    if (booking.status === BookingStatus.COMPLETED) {
      throw new BadRequestException('Booking is already completed');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      // Update booking status to COMPLETED
      const updatedBooking = await tx.booking.update({
        where: { id },
        data: { status: BookingStatus.COMPLETED },
        include: {
          user: true,
          scooter: true,
        },
      });

      // Update scooter status back to AVAILABLE
      await tx.scooter.update({
        where: { id: booking.scooterId },
        data: { status: ScooterStatus.AVAILABLE },
      });

      // If scooter is not intact, create a damage feedback
      if (!isScooterIntact) {
        await tx.feedback.create({
          data: {
            title: 'Damage Report - Scooter Return',
            description: `Damage reported during return of scooter ${booking.scooterId} for booking ${booking.id}. User reported scooter was not intact.`,
            category: FeedbackCategory.DAMAGE,
            priority: FeedbackPriority.HIGH,
            status: FeedbackStatus.PENDING,
            scooterId: booking.scooterId,
            bookingId: booking.id,
            createdById: booking.userId,
          },
        });
      }

      return updatedBooking;
    });

    try {
      await this.emailService.sendReturnConfirmation(result, isScooterIntact);
    } catch (error) {
      console.error('发送还车确认邮件失败:', error);
    }

    return result;
  }

  async createBookingForCustomer(
    employeeId: string,
    customerEmail: string,
    scooterId: string,
    hireType: HireType,
    startTime: Date,
    endTime: Date,
  ) {
    // 验证员工权限
    const employee = await this.prisma.user.findUnique({
      where: { id: employeeId },
    });

    if (!employee || employee.role !== 'MANAGER') {
      throw new BadRequestException('只有管理员可以进行代订操作');
    }

    // 查找或创建客户用户
    let customer = await this.prisma.user.findUnique({
      where: { email: customerEmail },
    });

    if (!customer) {
      // 为新客户创建账户，使用临时密码
      const tempPassword = Math.random().toString(36).slice(-8);
      const tempPasswordHash = await bcrypt.hash(tempPassword, 10);

      customer = await this.prisma.user.create({
        data: {
          email: customerEmail,
          passwordHash: tempPasswordHash,
          role: 'CUSTOMER',
        },
      });

      // TODO: 发送账户创建通知邮件给客户
      console.log(
        `为客户 ${customerEmail} 创建了新账户，临时密码: ${tempPassword}`,
      );
    }

    // 检查滑板车可用性
    const scooter = await this.prisma.scooter.findUnique({
      where: { id: scooterId },
    });

    if (!scooter) {
      throw new BadRequestException('滑板车不存在');
    }

    if (scooter.status !== ScooterStatus.AVAILABLE) {
      throw new BadRequestException('滑板车当前不可用');
    }

    // 计算费用（包含折扣）
    const totalCost = this.calculateCost(hireType);
    const discountResult = await this.discountService.calculateDiscountedPrice(
      customer.id,
      totalCost,
      hireType,
    );
    const finalCost = discountResult.discountedPrice;

    // 创建预订
    const booking = await this.prisma.$transaction(async (tx) => {
      // 创建预订
      const booking = await tx.booking.create({
        data: {
          userId: customer.id,
          scooterId,
          hireType,
          startTime,
          endTime,
          totalCost: finalCost,
          status: BookingStatus.CONFIRMED, // 代订直接确认
          originalEndTime: endTime,
        },
        include: {
          user: true,
          scooter: true,
        },
      });

      // 更新滑板车状态
      await tx.scooter.update({
        where: { id: scooterId },
        data: { status: ScooterStatus.RENTED },
      });

      // 创建支付记录（代订自动支付）
      await tx.payment.create({
        data: {
          bookingId: booking.id,
          amount: finalCost,
          status: 'SUCCESS',
        },
      });

      return booking;
    });

    // 发送代订确认邮件
    try {
      await this.emailService.sendBookingConfirmation(booking, finalCost);
      // TODO: 如果是新用户，发送账户信息邮件
    } catch (error) {
      console.error('发送代订确认邮件失败:', error);
    }

    return booking;
  }

  private calculateCost(hireType: HireType): number {
    switch (hireType) {
      case HireType.HOUR_1:
        return 5;
      case HireType.HOUR_4:
        return 15;
      case HireType.DAY_1:
        return 30;
      case HireType.WEEK_1:
        return 90;
      default:
        return 0;
    }
  }
}
