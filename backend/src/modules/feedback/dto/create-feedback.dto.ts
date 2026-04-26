import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import type { FeedbackCategory } from '@prisma/client';
import { FEEDBACK_CATEGORIES } from '../feedback.constants';

export class CreateFeedbackDto {
  @ApiProperty({ description: 'Title of the feedback' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'Detailed description of the feedback' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    enum: FEEDBACK_CATEGORIES,
    description: 'Category of the feedback',
  })
  @IsNotEmpty()
  @IsEnum(FEEDBACK_CATEGORIES)
  category: FeedbackCategory;

  @ApiProperty({ description: 'ID of the scooter related to the feedback' })
  @IsNotEmpty()
  @IsUUID()
  scooterId: string;

  @ApiProperty({
    description: 'ID of the booking related to the feedback (optional)',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  bookingId?: string;

  @ApiProperty({ description: 'URL of an image (optional)', required: false })
  @IsOptional()
  @IsString()
  imageUrl?: string;
}
