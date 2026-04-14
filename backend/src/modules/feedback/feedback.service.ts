import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { FeedbackResponseDto } from './dto/feedback-response.dto';
import {
  FeedbackCategory,
  FeedbackPriority,
  FeedbackStatus,
  Role,
} from '@prisma/client';

@Injectable()
export class FeedbackService {
  constructor(private prisma: PrismaService) {}

  async createFeedback(userId: string, createFeedbackDto: CreateFeedbackDto) {
    // Set priority based on category
    let priority: FeedbackPriority = FeedbackPriority.LOW;
    if (createFeedbackDto.category === FeedbackCategory.DAMAGE) {
      priority = FeedbackPriority.HIGH;
    }

    const feedback = await this.prisma.feedback.create({
      data: {
        title: createFeedbackDto.title,
        description: createFeedbackDto.description,
        category: createFeedbackDto.category,
        priority,
        status: FeedbackStatus.PENDING,
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

    return feedbacks.map(
      (feedback) => new FeedbackResponseDto(feedback as any),
    );
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
    if (feedback.createdById !== userId && userRole !== Role.MANAGER) {
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
    if (userRole !== Role.MANAGER) {
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
      updateData.status = FeedbackStatus.CHARGEABLE;
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
    if (userRole !== Role.MANAGER) {
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

    return feedbacks.map(
      (feedback) => new FeedbackResponseDto(feedback as any),
    );
  }

  async getHighPriorityFeedbacks(userRole: Role) {
    // Only managers can view high priority feedbacks
    if (userRole !== Role.MANAGER) {
      throw new ForbiddenException(
        'Only managers can view high priority feedbacks',
      );
    }

    const feedbacks = await this.prisma.feedback.findMany({
      where: {
        OR: [
          { priority: FeedbackPriority.HIGH },
          { priority: FeedbackPriority.URGENT },
        ],
        status: {
          not: FeedbackStatus.RESOLVED,
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

    return feedbacks.map(
      (feedback) => new FeedbackResponseDto(feedback as any),
    );
  }

  async getPendingCount(userRole: Role) {
    if (userRole !== Role.MANAGER) {
      return 0;
    }

    return this.prisma.feedback.count({
      where: { status: FeedbackStatus.PENDING },
    });
  }
}
