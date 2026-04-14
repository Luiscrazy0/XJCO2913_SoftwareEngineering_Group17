import { ApiProperty } from '@nestjs/swagger';
import {
  Feedback,
  FeedbackCategory,
  FeedbackPriority,
  FeedbackStatus,
  DamageType,
} from '@prisma/client';

export class FeedbackResponseDto {
  @ApiProperty({ description: 'Feedback ID' })
  id: string;

  @ApiProperty({ description: 'Title of the feedback' })
  title: string;

  @ApiProperty({ description: 'Detailed description of the feedback' })
  description: string;

  @ApiProperty({
    enum: FeedbackCategory,
    description: 'Category of the feedback',
  })
  category: FeedbackCategory;

  @ApiProperty({
    enum: FeedbackPriority,
    description: 'Priority of the feedback',
  })
  priority: FeedbackPriority;

  @ApiProperty({ enum: FeedbackStatus, description: 'Status of the feedback' })
  status: FeedbackStatus;

  @ApiProperty({ description: 'ID of the scooter related to the feedback' })
  scooterId: string;

  @ApiProperty({
    description: 'ID of the booking related to the feedback (optional)',
    required: false,
  })
  bookingId?: string;

  @ApiProperty({ description: 'URL of an image (optional)', required: false })
  imageUrl?: string;

  @ApiProperty({ description: 'Manager notes (optional)', required: false })
  managerNotes?: string;

  @ApiProperty({ description: 'Resolution cost (optional)', required: false })
  resolutionCost?: number;

  @ApiProperty({
    enum: DamageType,
    description: 'Type of damage (optional)',
    required: false,
  })
  damageType?: DamageType;

  @ApiProperty({ description: 'ID of the user who created the feedback' })
  createdById: string;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;

  @ApiProperty({ description: 'User email who created the feedback' })
  createdByEmail: string;

  @ApiProperty({ description: 'Scooter location' })
  scooterLocation: string;

  @ApiProperty({
    description: 'Booking start time if available',
    required: false,
  })
  bookingStartTime?: Date;

  constructor(
    feedback: Feedback & {
      createdBy: { email: string };
      scooter: { location: string };
      booking?: { startTime: Date };
    },
  ) {
    this.id = feedback.id;
    this.title = feedback.title;
    this.description = feedback.description;
    this.category = feedback.category;
    this.priority = feedback.priority;
    this.status = feedback.status;
    this.scooterId = feedback.scooterId;
    this.bookingId = feedback.bookingId || undefined;
    this.imageUrl = feedback.imageUrl || undefined;
    this.managerNotes = feedback.managerNotes || undefined;
    this.resolutionCost = feedback.resolutionCost || undefined;
    this.damageType = feedback.damageType || undefined;
    this.createdById = feedback.createdById;
    this.createdAt = feedback.createdAt;
    this.updatedAt = feedback.updatedAt;
    this.createdByEmail = feedback.createdBy.email;
    this.scooterLocation = feedback.scooter.location;
    this.bookingStartTime = feedback.booking?.startTime;
  }
}
