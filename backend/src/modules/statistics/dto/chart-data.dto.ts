import { ApiProperty } from '@nestjs/swagger';

export class ChartDatasetDto {
  @ApiProperty({ description: '数据集标签' })
  label: string;

  @ApiProperty({ type: [Number], description: '数据值' })
  data: number[];

  @ApiProperty({
    type: [String],
    required: false,
    description: '背景颜色（饼图使用）',
  })
  backgroundColor?: string[];

  @ApiProperty({ required: false, description: '边框颜色' })
  borderColor?: string;

  @ApiProperty({ required: false, description: '边框宽度' })
  borderWidth?: number;
}

export class ChartDataResponseDto {
  @ApiProperty({ type: [String], description: '标签（通常是日期）' })
  labels: string[];

  @ApiProperty({ type: [ChartDatasetDto], description: '数据集' })
  datasets: ChartDatasetDto[];

  @ApiProperty({ description: '图表类型' })
  chartType: string;

  @ApiProperty({ description: '统计周期' })
  period: string;
}
