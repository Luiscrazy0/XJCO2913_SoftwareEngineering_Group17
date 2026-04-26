import { ApiProperty } from '@nestjs/swagger';
import type {
  FeedbackCategory,
  FeedbackPriority,
  FeedbackStatus,
} from '@prisma/client';
import {
  DAMAGE_TYPES,
  FEEDBACK_CATEGORIES,
  FEEDBACK_PRIORITIES,
  FEEDBACK_STATUSES,
} from '../feedback.constants';

type DamageTypeValue = 'NATURAL' | 'INTENTIONAL';

type FeedbackWithRelations = {
  id: string;
  title: string;
  description: string;
  category: FeedbackCategory;
  priority: FeedbackPriority;
  status: FeedbackStatus;
  scooterId: string;
  bookingId: string | null;
  imageUrl: string | null;
  managerNotes: string | null;
  resolutionCost: number | null;
  damageType: DamageTypeValue | null;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: { email: string };
  scooter: { location: string };
  booking?: { startTime: Date } | null;
};

export class FeedbackResponseDto {
  @ApiProperty({ description: 'Feedback ID' })
  id: string;

  @ApiProperty({ description: 'Title of the feedback' })
  title: string;

  @ApiProperty({ description: 'Detailed description of the feedback' })
  description: string;

  @ApiProperty({
    enum: FEEDBACK_CATEGORIES,
    description: 'Category of the feedback',
  })
  category: FeedbackCategory;

  @ApiProperty({
    enum: FEEDBACK_PRIORITIES,
    description: 'Priority of the feedback',
  })
  priority: FeedbackPriority;

  @ApiProperty({
    enum: FEEDBACK_STATUSES,
    description: 'Status of the feedback',
  })
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
    enum: DAMAGE_TYPES,
    description: 'Type of damage (optional)',
    required: false,
  })
  damageType?: DamageTypeValue;

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

  constructor(feedback: FeedbackWithRelations) {
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
