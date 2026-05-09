import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import {
  WeeklyRevenueResponseDto,
  WeeklyRevenueByHireTypeDto,
} from './dto/weekly-revenue.dto';
import {
  DailyRevenueResponseDto,
  DailyRevenueDto,
} from './dto/daily-revenue.dto';
import { ChartDataResponseDto } from './dto/chart-data.dto';
import { DashboardSummaryDto } from './dto/dashboard-summary.dto';

@ApiTags('statistics')
@Controller('statistics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  /**
   * 按租赁类型查看周收入
   * @param startDate 开始日期 (YYYY-MM-DD)
   * @param endDate 结束日期 (YYYY-MM-DD)
   */
  @Get('revenue/weekly')
  @Roles(Role.MANAGER)
  @ApiOperation({ summary: '按租赁类型查看周收入' })
  @ApiQuery({
    name: 'startDate',
    required: true,
    description: '开始日期 (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'endDate',
    required: true,
    description: '结束日期 (YYYY-MM-DD)',
  })
  @ApiResponse({
    status: 200,
    description: '成功获取周收入数据',
    type: WeeklyRevenueResponseDto,
  })
  @ApiResponse({ status: 400, description: '参数错误' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '权限不足' })
  async getWeeklyRevenueByHireType(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<WeeklyRevenueResponseDto> {
    const data = await this.statisticsService.getWeeklyRevenueByHireType(
      startDate,
      endDate,
    );

    // 计算总计
    const totalRevenue = data.reduce((sum, item) => sum + item.totalRevenue, 0);
    const totalBookings = data.reduce(
      (sum, item) => sum + item.bookingCount,
      0,
    );

    // 转换为DTO格式
    const dtoData: WeeklyRevenueByHireTypeDto[] = data.map((item) => ({
      hireType: item.hireType,
      hireTypeName: this.statisticsService.getHireTypeChineseName(
        item.hireType,
      ),
      totalRevenue: item.totalRevenue,
      bookingCount: item.bookingCount,
      averageRevenue: item.averageRevenue,
    }));

    return {
      startDate,
      endDate,
      data: dtoData,
      totalRevenue,
      totalBookings,
    };
  }

  /**
   * 查看一周内的每日综合收入
   * @param startDate 开始日期 (YYYY-MM-DD)
   * @param endDate 结束日期 (YYYY-MM-DD)
   */
  @Get('revenue/daily')
  @Roles(Role.MANAGER)
  @ApiOperation({ summary: '查看一周内的每日综合收入' })
  @ApiQuery({
    name: 'startDate',
    required: true,
    description: '开始日期 (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'endDate',
    required: true,
    description: '结束日期 (YYYY-MM-DD)',
  })
  @ApiResponse({
    status: 200,
    description: '成功获取每日收入数据',
    type: DailyRevenueResponseDto,
  })
  @ApiResponse({ status: 400, description: '参数错误' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '权限不足' })
  async getDailyRevenue(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<DailyRevenueResponseDto> {
    const data = await this.statisticsService.getDailyRevenue(
      startDate,
      endDate,
    );

    // 计算总计
    const totalRevenue = data.reduce((sum, item) => sum + item.totalRevenue, 0);
    const totalBookings = data.reduce(
      (sum, item) => sum + item.bookingCount,
      0,
    );

    // 转换为DTO格式
    const dtoData: DailyRevenueDto[] = data.map((item) => ({
      date: item.date,
      totalRevenue: item.totalRevenue,
      bookingCount: item.bookingCount,
      hireTypes: item.hireTypes.map((hireType) => ({
        hireType: hireType.hireType,
        hireTypeName: this.statisticsService.getHireTypeChineseName(
          hireType.hireType,
        ),
        revenue: hireType.revenue,
      })),
    }));

    return {
      startDate,
      endDate,
      data: dtoData,
      totalRevenue,
      totalBookings,
    };
  }

  /**
   * 获取收入图表数据
   * @param period 统计周期 (week, month, year)
   * @param type 图表类型 (bar, line, pie)
   */
  @Get('revenue/chart')
  @Roles(Role.MANAGER)
  @ApiOperation({ summary: '获取收入图表数据' })
  @ApiQuery({
    name: 'period',
    required: false,
    description: '统计周期 (week, month, year)',
    enum: ['week', 'month', 'year'],
  })
  @ApiQuery({
    name: 'type',
    required: false,
    description: '图表类型 (bar, line, pie)',
    enum: ['bar', 'line', 'pie'],
  })
  @ApiResponse({
    status: 200,
    description: '成功获取图表数据',
    type: ChartDataResponseDto,
  })
  @ApiResponse({ status: 400, description: '参数错误' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '权限不足' })
  async getRevenueChartData(
    @Query('period') period: string = 'week',
    @Query('type') type: string = 'bar',
  ): Promise<ChartDataResponseDto> {
    const chartData = await this.statisticsService.getRevenueChartData(
      period,
      type,
    );

    return {
      labels: chartData.labels,
      datasets: chartData.datasets,
      chartType: type,
      period: period,
    };
  }

  /**
   * 管理后台首页实时概览数据
   */
  @Get('dashboard-summary')
  @Roles(Role.MANAGER)
  @ApiOperation({ summary: '获取管理后台首页实时概览数据' })
  @ApiResponse({
    status: 200,
    description: '成功获取概览数据',
    type: DashboardSummaryDto,
  })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '权限不足' })
  async getDashboardSummary(): Promise<DashboardSummaryDto> {
    return this.statisticsService.getDashboardSummary();
  }
}
