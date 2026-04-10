import { ApiProperty } from '@nestjs/swagger';
import { HireType } from '@prisma/client';

export class WeeklyRevenueByHireTypeDto {
  @ApiProperty({ enum: HireType, description: '租赁类型' })
  hireType: HireType;

  @ApiProperty({ description: '租赁类型中文名称' })
  hireTypeName: string;

  @ApiProperty({ description: '总收入' })
  totalRevenue: number;

  @ApiProperty({ description: '预订数量' })
  bookingCount: number;

  @ApiProperty({ description: '平均收入' })
  averageRevenue: number;
}

export class WeeklyRevenueResponseDto {
  @ApiProperty({ description: '开始日期' })
  startDate: string;

  @ApiProperty({ description: '结束日期' })
  endDate: string;

  @ApiProperty({ type: [WeeklyRevenueByHireTypeDto], description: '按租赁类型统计的收入' })
  data: WeeklyRevenueByHireTypeDto[];

  @ApiProperty({ description: '总收入' })
  totalRevenue: number;

  @ApiProperty({ description: '总预订数量' })
  totalBookings: number;
}