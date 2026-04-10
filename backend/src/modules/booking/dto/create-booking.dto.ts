import { IsUUID, IsEnum, IsDateString } from 'class-validator';
import { HireType } from '@prisma/client';

export class CreateBookingDto {
  @IsUUID()
  userId: string;

  @IsUUID()
  // scooterId should be a UUID
  scooterId: string;

  @IsEnum(HireType)
  // hireType should be one of the HireType enum values
  hireType: HireType;

  @IsDateString()
  // startTime and endTime should be valid date strings
  startTime: string;

  @IsDateString()
  // startTime and endTime should be valid date strings
  endTime: string;
}
