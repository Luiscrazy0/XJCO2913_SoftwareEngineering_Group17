import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { FeedbackPriority, FeedbackStatus, DamageType } from '@prisma/client';

export class UpdateFeedbackDto {
  @ApiProperty({
    enum: FeedbackPriority,
    description: 'Priority of the feedback',
    required: false,
  })
  @IsOptional()
  @IsEnum(FeedbackPriority)
  priority?: FeedbackPriority;

  @ApiProperty({
    enum: FeedbackStatus,
    description: 'Status of the feedback',
    required: false,
  })
  @IsOptional()
  @IsEnum(FeedbackStatus)
  status?: FeedbackStatus;

  @ApiProperty({ description: 'Manager notes (optional)', required: false })
  @IsOptional()
  @IsString()
  managerNotes?: string;

  @ApiProperty({ description: 'Resolution cost (optional)', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  resolutionCost?: number;

  @ApiProperty({
    enum: DamageType,
    description: 'Type of damage (optional)',
    required: false,
  })
  @IsOptional()
  @IsEnum(DamageType)
  damageType?: DamageType;
}
