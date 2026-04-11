import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserType, HireType } from '@prisma/client';

@Injectable()
export class DiscountService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 计算用户折扣后的价格
   * @param userId 用户ID
   * @param originalCost 原始价格
   * @param _hireType 租赁类型
   * @returns 折扣后的价格和折扣信息
   */
  async calculateDiscountedPrice(
    userId: string,
    originalCost: number,
 feat/sprint2-tests
    _hireType: HireType, // 🌟 修改点 1：加了下划线，告诉 ESLint 这个参数暂时不用，消除警告
  ): Promise<{ discountedPrice: number; discountAmount: number; discountReason: string }> {

    hireType: HireType,
  ): Promise<{
    discountedPrice: number;
    discountAmount: number;
    discountReason: string;
  }> {
 dev
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
      case UserType.STUDENT:
        discountRate = 0.2; // 学生8折
        discountReason = '学生折扣 (8折)';
        break;
      case UserType.SENIOR:
        discountRate = 0.3; // 老年人7折
        discountReason = '老年人折扣 (7折)';
        break;
      case UserType.FREQUENT: { // 🌟 修改点 2：加上了左大括号，限制 const 变量的作用域，消除红灯 Error！
        // 高频用户：检查过去30天内的租赁小时数
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

        // 计算总租赁小时数
        let totalHours = 0;
 feat/sprint2-tests
        recentBookings.forEach(booking => {
          // 🌟 修改点 3：删除了没用到的 duration 和 hours 变量计算，消除警告

        recentBookings.forEach((booking) => {
          const duration =
            booking.endTime.getTime() - booking.startTime.getTime();
          const hours = duration / (1000 * 60 * 60);

 dev
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
              totalHours += 168; // 7天 * 24小时
              break;
          }
        });

        if (totalHours >= 50) {
          // 每月50小时以上
          discountRate = 0.25; // 高频用户7.5折
          discountReason = '高频用户折扣 (7.5折)';
        } else if (totalHours >= 20) {
          // 每月20小时以上
          discountRate = 0.15; // 8.5折
          discountReason = '活跃用户折扣 (8.5折)';
        }
        break;
      } // 🌟 修改点 2：加上了右大括号
      default:
        discountRate = 0;
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

  /**
   * 更新用户类型（管理员功能）
   * @param userId 用户ID
   * @param userType 新用户类型
   */
  async updateUserType(userId: string, userType: UserType): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { userType },
    });
  }

  /**
   * 获取用户折扣信息
   * @param userId 用户ID
   * @returns 用户类型和当前折扣状态
   */
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
      case UserType.STUDENT:
        currentDiscount = '学生折扣: 8折';
        break;
      case UserType.SENIOR:
        currentDiscount = '老年人折扣: 7折';
        break;
      case UserType.FREQUENT:
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
