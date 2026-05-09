import { ApiProperty } from '@nestjs/swagger';

export class DashboardSummaryDto {
  @ApiProperty({ description: '今日订单数', example: 12 })
  todayOrders!: number;

  @ApiProperty({ description: '今日收入', example: 350.5 })
  todayRevenue!: number;

  @ApiProperty({ description: '当前已租出车辆数', example: 8 })
  rentedScooters!: number;

  @ApiProperty({ description: '系统总用户数', example: 128 })
  totalUsers!: number;
}
