import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BookingService } from './booking.service';
import { Role, ScooterStatus } from '@prisma/client';

@Injectable()
export class EmployeeBookingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bookingService: BookingService,
  ) {}

  async createBookingForGuest(
    employeeId: string,
    guestEmail: string,
    guestName: string,
    scooterId: string,
    hireType: any,
    startTime: Date,
    endTime: Date,
  ) {
    // 验证员工权限
    const employee = await this.prisma.user.findUnique({
      where: { id: employeeId },
    });

    if (!employee || employee.role !== Role.MANAGER) {
      throw new ForbiddenException('只有管理员可以代订');
    }

    // 检查滑板车是否可用
    const scooter = await this.prisma.scooter.findUnique({
      where: { id: scooterId },
    });

    if (!scooter) {
      throw new BadRequestException('Scooter not found');
    }

    if (scooter.status !== ScooterStatus.AVAILABLE) {
      throw new BadRequestException('Scooter not available');
    }

    // 创建或查找访客用户
    let guestUser = await this.prisma.user.findUnique({
      where: { email: guestEmail },
    });

    if (!guestUser) {
      // 创建临时访客用户
      guestUser = await this.prisma.user.create({
        data: {
          email: guestEmail,
          passwordHash: 'temp_password_for_guest', // 临时密码，访客可以稍后注册
          role: Role.CUSTOMER,
        },
      });
    }

    // 使用现有的预订服务创建预订
    const booking = await this.bookingService.createBooking(
      guestUser.id,
      scooterId,
      hireType,
      startTime,
    );

    // 记录员工代订信息
    await this.prisma.employeeBooking.create({
      data: {
        bookingId: booking.id,
        employeeId,
        guestEmail,
        guestName,
      },
    });

    return booking;
  }

  async getEmployeeBookings(employeeId: string) {
    return this.prisma.employeeBooking.findMany({
      where: { employeeId },
      include: {
        booking: {
          include: {
            user: true,
            scooter: true,
          },
        },
      },
    });
  }
}
