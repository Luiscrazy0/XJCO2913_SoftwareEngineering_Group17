import { IsEnum } from 'class-validator';

import { ScooterStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateScooterStatusDto {
  @ApiProperty({
    description: '电动车状态',
    example: 'AVAILABLE',
    enum: ScooterStatus,
    required: true,
  })
  @IsEnum(ScooterStatus)
  status: ScooterStatus;
}
