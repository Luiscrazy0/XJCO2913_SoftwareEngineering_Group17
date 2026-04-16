import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import type {
  DamageType,
  FeedbackPriority,
  FeedbackStatus,
} from '@prisma/client';
import {
  DAMAGE_TYPES,
  FEEDBACK_PRIORITIES,
  FEEDBACK_STATUSES,
} from '../feedback.constants';

export class UpdateFeedbackDto {
  @ApiProperty({
    enum: FEEDBACK_PRIORITIES,
    description: 'Priority of the feedback',
    required: false,
  })
  @IsOptional()
  @IsEnum(FEEDBACK_PRIORITIES)
  priority?: FeedbackPriority;

  @ApiProperty({
    enum: FEEDBACK_STATUSES,
    description: 'Status of the feedback',
    required: false,
  })
  @IsOptional()
  @IsEnum(FEEDBACK_STATUSES)
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
    enum: DAMAGE_TYPES,
    description: 'Type of damage (optional)',
    required: false,
  })
  @IsOptional()
  @IsEnum(DAMAGE_TYPES)
  damageType?: DamageType;
}
