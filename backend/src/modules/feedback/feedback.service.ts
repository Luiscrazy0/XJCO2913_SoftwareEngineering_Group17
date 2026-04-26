import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { FeedbackResponseDto } from './dto/feedback-response.dto';
import type {
  FeedbackCategory,
  FeedbackPriority,
  FeedbackStatus,
  Role,
} from '@prisma/client';
import {
  FEEDBACK_CATEGORIES,
  FEEDBACK_MANAGER_ROLE,
  FEEDBACK_PRIORITIES,
  FEEDBACK_STATUSES,
} from './feedback.constants';

@Injectable()
export class FeedbackService {
  constructor(private prisma: PrismaService) {}

  async createFeedback(userId: string, createFeedbackDto: CreateFeedbackDto) {
    // Set priority based on category
    let priority: FeedbackPriority = FEEDBACK_PRIORITIES.LOW;
    if (createFeedbackDto.category === FEEDBACK_CATEGORIES.DAMAGE) {
      priority = FEEDBACK_PRIORITIES.HIGH;
    }

    const feedback = await this.prisma.feedback.create({
      data: {
        title: createFeedbackDto.title,
        description: createFeedbackDto.description,
        category: createFeedbackDto.category,
        priority,
        status: FEEDBACK_STATUSES.PENDING,
        scooterId: createFeedbackDto.scooterId,
        bookingId: createFeedbackDto.bookingId,
        imageUrl: createFeedbackDto.imageUrl,
        createdById: userId,
      },
      include: {
        createdBy: {
          select: { email: true },
        },
        scooter: {
          select: { location: true },
        },
        booking: createFeedbackDto.bookingId
          ? {
              select: { startTime: true },
            }
          : undefined,
      },
    });

    return new FeedbackResponseDto(feedback as any);
  }

  async getMyFeedbacks(userId: string) {
    const feedbacks = await this.prisma.feedback.findMany({
      where: { createdById: userId },
      include: {
        createdBy: {
          select: { email: true },
        },
        scooter: {
          select: { location: true },
        },
        booking: {
          select: { startTime: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return feedbacks.map((feedback) => new FeedbackResponseDto(feedback));
  }

  async getFeedbackById(id: string, userId: string, userRole: Role) {
    const feedback = await this.prisma.feedback.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { email: true },
        },
        scooter: {
          select: { location: true },
        },
        booking: {
          select: { startTime: true },
        },
      },
    });

    if (!feedback) {
      throw new NotFoundException(`Feedback with ID ${id} not found`);
    }

    // Only allow access if user is the creator or a manager
    if (feedback.createdById !== userId && userRole !== FEEDBACK_MANAGER_ROLE) {
      throw new ForbiddenException(
        'You do not have permission to view this feedback',
      );
    }

    return new FeedbackResponseDto(feedback as any);
  }

  async updateFeedback(
    id: string,
    updateFeedbackDto: UpdateFeedbackDto,
    userId: string,
    userRole: Role,
  ) {
    // Check if feedback exists
    const existingFeedback = await this.prisma.feedback.findUnique({
      where: { id },
    });

    if (!existingFeedback) {
      throw new NotFoundException(`Feedback with ID ${id} not found`);
    }

    // Only managers can update feedback
    if (userRole !== FEEDBACK_MANAGER_ROLE) {
      throw new ForbiddenException('Only managers can update feedback');
    }

    // Apply business rules
    const updateData: any = { ...updateFeedbackDto };

    // If damageType is set to NATURAL, set resolutionCost to 0
    if (updateFeedbackDto.damageType === 'NATURAL') {
      updateData.resolutionCost = 0;
    }

    // If damageType is set to INTENTIONAL and status is not CHARGEABLE, set it to CHARGEABLE
    if (
      updateFeedbackDto.damageType === 'INTENTIONAL' &&
      updateFeedbackDto.status !== 'CHARGEABLE'
    ) {
      updateData.status = FEEDBACK_STATUSES.CHARGEABLE;
    }

    const feedback = await this.prisma.feedback.update({
      where: { id },
      data: updateData,
      include: {
        createdBy: {
          select: { email: true },
        },
        scooter: {
          select: { location: true },
        },
        booking: {
          select: { startTime: true },
        },
      },
    });

    return new FeedbackResponseDto(feedback as any);
  }

  async getAllFeedbacks(
    userRole: Role,
    filters?: {
      status?: FeedbackStatus;
      priority?: FeedbackPriority;
      category?: FeedbackCategory;
    },
  ) {
    // Only managers can view all feedbacks
    if (userRole !== FEEDBACK_MANAGER_ROLE) {
      throw new ForbiddenException('Only managers can view all feedbacks');
    }

    const where: any = {};
    if (filters?.status) where.status = filters.status;
    if (filters?.priority) where.priority = filters.priority;
    if (filters?.category) where.category = filters.category;

    const feedbacks = await this.prisma.feedback.findMany({
      where,
      include: {
        createdBy: {
          select: { email: true },
        },
        scooter: {
          select: { location: true },
        },
        booking: {
          select: { startTime: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return feedbacks.map((feedback) => new FeedbackResponseDto(feedback));
  }

  async getHighPriorityFeedbacks(userRole: Role) {
    // Only managers can view high priority feedbacks
    if (userRole !== FEEDBACK_MANAGER_ROLE) {
      throw new ForbiddenException(
        'Only managers can view high priority feedbacks',
      );
    }

    const feedbacks = await this.prisma.feedback.findMany({
      where: {
        OR: [
          { priority: FEEDBACK_PRIORITIES.HIGH },
          { priority: FEEDBACK_PRIORITIES.URGENT },
        ],
        status: {
          not: FEEDBACK_STATUSES.RESOLVED,
        },
      },
      include: {
        createdBy: {
          select: { email: true },
        },
        scooter: {
          select: { location: true },
        },
        booking: {
          select: { startTime: true },
        },
      },
      orderBy: [
        { category: 'desc' }, // DAMAGE first
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return feedbacks.map((feedback) => new FeedbackResponseDto(feedback));
  }

  async getPendingCount(userRole: Role) {
    if (userRole !== FEEDBACK_MANAGER_ROLE) {
      return 0;
    }

    return this.prisma.feedback.count({
      where: { status: FEEDBACK_STATUSES.PENDING },
    });
  }
}
