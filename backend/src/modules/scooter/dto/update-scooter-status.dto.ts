import { IsEnum, } from 'class-validator';
import { ScooterStatus } from '@prisma/client';

export class UpdateScooterStatusDto {
  @IsEnum(ScooterStatus)
  status: ScooterStatus;
}