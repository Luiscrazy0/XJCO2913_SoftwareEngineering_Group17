import { IsUUID, IsEnum, IsDateString } from 'class-validator';
import { HireType } from '@prisma/client';

export class CreateBookingDto {
  @IsUUID()
  // scooterId should be a UUID
  scooterId: string;

  @IsEnum(HireType)
  // hireType should be one of the HireType enum values
  hireType: HireType;

  @IsDateString()
  // startTime should be a valid date string
  startTime: string;
}
