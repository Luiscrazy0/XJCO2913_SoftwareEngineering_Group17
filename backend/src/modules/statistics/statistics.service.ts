import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { HireType, BookingStatus } from '@prisma/client';

interface WeeklyRevenueByHireType {
  hireType: HireType;
  totalRevenue: number;
  bookingCount: number;
  averageRevenue: number;
}

interface DailyRevenue {
  date: string;
  totalRevenue: number;
  bookingCount: number;
  hireTypes: {
    hireType: HireType;
    revenue: number;
  }[];
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string;
    borderWidth?: number;
  }[];
}

@Injectable()
export class StatisticsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 按租赁类型查看周收入
   */
  async getWeeklyRevenueByHireType(
    startDate: string,
    endDate: string,
  ): Promise<WeeklyRevenueByHireType[]> {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // 设置为当天结束时间

    const bookings = await this.prisma.booking.findMany({
      where: {
        status: {
          in: [
            BookingStatus.CONFIRMED,
            BookingStatus.IN_PROGRESS,
            BookingStatus.COMPLETED,
            BookingStatus.EXTENDED,
          ],
        },
        startTime: {
          gte: start,
          lte: end,
        },
      },
      include: {
        payment: true,
      },
    });

    // 按租赁类型分组统计
    const revenueByHireType = new Map<
      HireType,
      { revenue: number; count: number }
    >();

    bookings.forEach((booking) => {
      const current = revenueByHireType.get(booking.hireType) || {
        revenue: 0,
        count: 0,
      };
      current.revenue += booking.totalCost;
      current.count += 1;
      revenueByHireType.set(booking.hireType, current);
    });

    // 转换为响应格式
    const result: WeeklyRevenueByHireType[] = [];
    revenueByHireType.forEach((value, hireType) => {
      result.push({
        hireType,
        totalRevenue: value.revenue,
        bookingCount: value.count,
        averageRevenue: value.count > 0 ? value.revenue / value.count : 0,
      });
    });

    // 按收入降序排序
    return result.sort((a, b) => b.totalRevenue - a.totalRevenue);
  }

  /**
   * 查看一周内的每日综合收入
   */
  async getDailyRevenue(
    startDate: string,
    endDate: string,
  ): Promise<DailyRevenue[]> {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const bookings = await this.prisma.booking.findMany({
      where: {
        status: {
          in: [
            BookingStatus.CONFIRMED,
            BookingStatus.IN_PROGRESS,
            BookingStatus.COMPLETED,
            BookingStatus.EXTENDED,
          ],
        },
        startTime: {
          gte: start,
          lte: end,
        },
      },
      include: {
        payment: true,
      },
    });

    // 按日期分组
    const revenueByDate = new Map<string, DailyRevenue>();

    bookings.forEach((booking) => {
      const dateStr = booking.startTime.toISOString().split('T')[0];

      if (!revenueByDate.has(dateStr)) {
        revenueByDate.set(dateStr, {
          date: dateStr,
          totalRevenue: 0,
          bookingCount: 0,
          hireTypes: [],
        });
      }

      const dailyRevenue = revenueByDate.get(dateStr)!;
      dailyRevenue.totalRevenue += booking.totalCost;
      dailyRevenue.bookingCount += 1;

      // 更新租赁类型收入
      const hireTypeEntry = dailyRevenue.hireTypes.find(
        (item) => item.hireType === booking.hireType,
      );
      if (hireTypeEntry) {
        hireTypeEntry.revenue += booking.totalCost;
      } else {
        dailyRevenue.hireTypes.push({
          hireType: booking.hireType,
          revenue: booking.totalCost,
        });
      }
    });

    // 转换为数组并按日期排序
    const result = Array.from(revenueByDate.values());
    return result.sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * 获取收入图表数据
   */
  async getRevenueChartData(period: string, type: string): Promise<ChartData> {
    const validPeriods = ['week', 'month', 'year'];
    const validTypes = ['bar', 'line', 'pie'];

    if (!validPeriods.includes(period)) {
      throw new BadRequestException(
        `Invalid period: "${period}". Must be one of: ${validPeriods.join(', ')}`,
      );
    }
    if (!validTypes.includes(type)) {
      throw new BadRequestException(
        `Invalid type: "${type}". Must be one of: ${validTypes.join(', ')}`,
      );
    }

    const endDate = new Date();
    const startDate = new Date();

    // 根据周期设置开始日期
    switch (period) {
      case 'week':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
    }

    // 获取每日收入数据
    const dailyRevenue = await this.getDailyRevenue(
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0],
    );

    // 准备图表数据
    const labels = dailyRevenue.map((item) => item.date);
    const revenueData = dailyRevenue.map((item) => item.totalRevenue);

    // 根据图表类型设置不同的数据格式
    let datasets;
    if (type === 'pie') {
      // 饼图需要按租赁类型分组
      const hireTypeRevenue = new Map<HireType, number>();
      dailyRevenue.forEach((day) => {
        day.hireTypes.forEach((hireType) => {
          const current = hireTypeRevenue.get(hireType.hireType) || 0;
          hireTypeRevenue.set(hireType.hireType, current + hireType.revenue);
        });
      });

      const hireTypes = Array.from(hireTypeRevenue.keys());
      const revenueByType = hireTypes.map(
        (hireType) => hireTypeRevenue.get(hireType) || 0,
      );

      datasets = [
        {
          label: 'Revenue by Hire Type',
          data: revenueByType,
          backgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#4BC0C0',
            '#9966FF',
            '#FF9F40',
          ],
        },
      ];
    } else {
      // 柱状图或折线图
      datasets = [
        {
          label: 'Daily Revenue',
          data: revenueData,
          borderColor: type === 'line' ? '#36A2EB' : undefined,
          backgroundColor: type === 'bar' ? '#36A2EB' : undefined,
          borderWidth: type === 'line' ? 2 : undefined,
        },
      ];
    }

    return {
      labels,
      datasets,
    };
  }

  /**
   * 获取租赁类型的中文名称
   */
  getHireTypeChineseName(hireType: HireType): string {
    const hireTypeNames = {
      [HireType.HOUR_1]: '1小时租赁',
      [HireType.HOUR_4]: '4小时租赁',
      [HireType.DAY_1]: '1天租赁',
      [HireType.WEEK_1]: '1周租赁',
    };
    return hireTypeNames[hireType] || hireType;
  }

  /**
   * 获取管理后台首页实时概览数据
   */
  async getDashboardSummary(): Promise<{
    todayOrders: number;
    todayRevenue: number;
    rentedScooters: number;
    totalUsers: number;
  }> {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [todayOrders, todayRevenueResult, rentedScooters, totalUsers] =
      await Promise.all([
        this.prisma.booking.count({
          where: {
            status: {
              in: [
                BookingStatus.CONFIRMED,
                BookingStatus.IN_PROGRESS,
                BookingStatus.EXTENDED,
              ],
            },
            startTime: { gte: todayStart, lte: todayEnd },
          },
        }),
        this.prisma.booking.aggregate({
          _sum: { totalCost: true },
          where: {
            status: {
              in: [
                BookingStatus.CONFIRMED,
                BookingStatus.IN_PROGRESS,
                BookingStatus.COMPLETED,
                BookingStatus.EXTENDED,
              ],
            },
            startTime: { gte: todayStart, lte: todayEnd },
          },
        }),
        this.prisma.scooter.count({
          where: { status: 'RENTED' },
        }),
        this.prisma.user.count(),
      ]);

    return {
      todayOrders,
      todayRevenue: todayRevenueResult._sum.totalCost ?? 0,
      rentedScooters,
      totalUsers,
    };
  }
}
