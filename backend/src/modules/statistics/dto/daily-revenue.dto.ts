import { ApiProperty } from '@nestjs/swagger';
import { HireType } from '@prisma/client';

export class DailyHireTypeRevenueDto {
  @ApiProperty({ enum: HireType, description: '租赁类型' })
  hireType: HireType;

  @ApiProperty({ description: '租赁类型中文名称' })
  hireTypeName: string;

  @ApiProperty({ description: '收入' })
  revenue: number;
}

export class DailyRevenueDto {
  @ApiProperty({ description: '日期 (YYYY-MM-DD)' })
  date: string;

  @ApiProperty({ description: '当日总收入' })
  totalRevenue: number;

  @ApiProperty({ description: '当日预订数量' })
  bookingCount: number;

  @ApiProperty({ type: [DailyHireTypeRevenueDto], description: '按租赁类型统计的收入' })
  hireTypes: DailyHireTypeRevenueDto[];
}

export class DailyRevenueResponseDto {
  @ApiProperty({ description: '开始日期' })
  startDate: string;

  @ApiProperty({ description: '结束日期' })
  endDate: string;

  @ApiProperty({ type: [DailyRevenueDto], description: '每日收入统计' })
  data: DailyRevenueDto[];

  @ApiProperty({ description: '期间总收入' })
  totalRevenue: number;

  @ApiProperty({ description: '期间总预订数量' })
  totalBookings: number;
}