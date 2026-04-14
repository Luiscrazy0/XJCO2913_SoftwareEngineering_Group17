import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { FeedbackCategory } from '@prisma/client';

export class CreateFeedbackDto {
  @ApiProperty({ description: 'Title of the feedback' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'Detailed description of the feedback' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ enum: FeedbackCategory, description: 'Category of the feedback' })
  @IsNotEmpty()
  @IsEnum(FeedbackCategory)
  category: FeedbackCategory;

  @ApiProperty({ description: 'ID of the scooter related to the feedback' })
  @IsNotEmpty()
  @IsUUID()
  scooterId: string;

  @ApiProperty({ description: 'ID of the booking related to the feedback (optional)', required: false })
  @IsOptional()
  @IsUUID()
  bookingId?: string;

  @ApiProperty({ description: 'URL of an image (optional)', required: false })
  @IsOptional()
  @IsString()
  imageUrl?: string;
}