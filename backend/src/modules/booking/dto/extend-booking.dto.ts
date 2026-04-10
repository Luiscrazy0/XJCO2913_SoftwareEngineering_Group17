import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, Min, Max } from 'class-validator';

export class ExtendBookingDto {
  @ApiProperty({
    description: '续租小时数',
    example: 2,
    minimum: 1,
    maximum: 24,
  })
  @IsNumber()
  @IsPositive()
  @Min(1)
  @Max(24)
  additionalHours: number;
}
