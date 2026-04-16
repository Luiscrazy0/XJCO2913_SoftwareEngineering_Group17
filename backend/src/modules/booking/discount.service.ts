import { Injectable } from '@nestjs/common';
import { HireType } from '@prisma/client';
import type { UserType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

const USER_TYPES = {
  NORMAL: 'NORMAL',
  STUDENT: 'STUDENT',
  SENIOR: 'SENIOR',
  FREQUENT: 'FREQUENT',
} as const;

@Injectable()
export class DiscountService {
  constructor(private readonly prisma: PrismaService) {}

  async calculateDiscountedPrice(
    userId: string,
    originalCost: number,
    _hireType: HireType,
  ): Promise<{
    discountedPrice: number;
    discountAmount: number;
    discountReason: string;
  }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { userType: true },
    });

    if (!user) {
      return {
        discountedPrice: originalCost,
        discountAmount: 0,
        discountReason: '无折扣',
      };
    }

    let discountRate = 0;
    let discountReason = '';

    switch (user.userType) {
      case USER_TYPES.STUDENT:
        discountRate = 0.2;
        discountReason = '学生折扣 (8折)';
        break;
      case USER_TYPES.SENIOR:
        discountRate = 0.3;
        discountReason = '老年人折扣 (7折)';
        break;
      case USER_TYPES.FREQUENT: {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentBookings = await this.prisma.booking.findMany({
          where: {
            userId,
            startTime: {
              gte: thirtyDaysAgo,
            },
            status: {
              in: ['CONFIRMED', 'COMPLETED', 'EXTENDED'],
            },
          },
        });

        let totalHours = 0;
        recentBookings.forEach((booking) => {
          switch (booking.hireType) {
            case HireType.HOUR_1:
              totalHours += 1;
              break;
            case HireType.HOUR_4:
              totalHours += 4;
              break;
            case HireType.DAY_1:
              totalHours += 24;
              break;
            case HireType.WEEK_1:
              totalHours += 168;
              break;
          }
        });

        if (totalHours >= 50) {
          discountRate = 0.25;
          discountReason = '高频用户折扣 (7.5折)';
        } else if (totalHours >= 20) {
          discountRate = 0.15;
          discountReason = '活跃用户折扣 (8.5折)';
        }
        break;
      }
      default:
        discountReason = '无折扣';
    }

    const discountAmount = originalCost * discountRate;
    const discountedPrice = originalCost - discountAmount;

    return {
      discountedPrice,
      discountAmount,
      discountReason,
    };
  }

  async updateUserType(userId: string, userType: UserType): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { userType },
    });
  }

  async getUserDiscountInfo(userId: string): Promise<{
    userType: UserType;
    currentDiscount: string;
    nextDiscountThreshold?: string;
  }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { userType: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    let currentDiscount = '';
    let nextDiscountThreshold = '';

    switch (user.userType) {
      case USER_TYPES.STUDENT:
        currentDiscount = '学生折扣: 8折';
        break;
      case USER_TYPES.SENIOR:
        currentDiscount = '老年人折扣: 7折';
        break;
      case USER_TYPES.FREQUENT:
        currentDiscount = '高频用户折扣: 根据使用时长自动调整';
        break;
      default:
        currentDiscount = '普通用户: 无折扣';
        nextDiscountThreshold = '每月租赁20小时可获8.5折，50小时可获7.5折';
    }

    return {
      userType: user.userType,
      currentDiscount,
      nextDiscountThreshold,
    };
  }
}
