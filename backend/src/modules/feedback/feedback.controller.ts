import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Request,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { FeedbackResponseDto } from './dto/feedback-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
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

@ApiTags('feedbacks')
@Controller('feedbacks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new feedback' })
  @ApiResponse({
    status: 201,
    description: 'Feedback created successfully',
    type: FeedbackResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Request() req, @Body() createFeedbackDto: CreateFeedbackDto) {
    return this.feedbackService.createFeedback(req.user.id, createFeedbackDto);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get my feedbacks' })
  @ApiResponse({
    status: 200,
    description: 'List of user feedbacks',
    type: [FeedbackResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyFeedbacks(@Request() req) {
    return this.feedbackService.getMyFeedbacks(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get feedback by ID' })
  @ApiResponse({
    status: 200,
    description: 'Feedback details',
    type: FeedbackResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Feedback not found' })
  async getFeedbackById(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.feedbackService.getFeedbackById(id, req.user.id, req.user.role);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(FEEDBACK_MANAGER_ROLE)
  @ApiOperation({ summary: 'Update feedback (Manager only)' })
  @ApiResponse({
    status: 200,
    description: 'Feedback updated successfully',
    type: FeedbackResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Manager role required',
  })
  @ApiResponse({ status: 404, description: 'Feedback not found' })
  async updateFeedback(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateFeedbackDto: UpdateFeedbackDto,
  ) {
    return this.feedbackService.updateFeedback(
      id,
      updateFeedbackDto,
      req.user.id,
      req.user.role,
    );
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(FEEDBACK_MANAGER_ROLE)
  @ApiOperation({ summary: 'Get all feedbacks (Manager only)' })
  @ApiQuery({ name: 'status', enum: FEEDBACK_STATUSES, required: false })
  @ApiQuery({ name: 'priority', enum: FEEDBACK_PRIORITIES, required: false })
  @ApiQuery({ name: 'category', enum: FEEDBACK_CATEGORIES, required: false })
  @ApiResponse({
    status: 200,
    description: 'List of all feedbacks',
    type: [FeedbackResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Manager role required',
  })
  async getAllFeedbacks(
    @Request() req,
    @Query('status') status?: FeedbackStatus,
    @Query('priority') priority?: FeedbackPriority,
    @Query('category') category?: FeedbackCategory,
  ) {
    const filters = {
      ...(status && { status }),
      ...(priority && { priority }),
      ...(category && { category }),
    };
    return this.feedbackService.getAllFeedbacks(req.user.role, filters);
  }

  @Get('high-priority')
  @UseGuards(RolesGuard)
  @Roles(FEEDBACK_MANAGER_ROLE)
  @ApiOperation({ summary: 'Get high priority feedbacks (Manager only)' })
  @ApiResponse({
    status: 200,
    description: 'List of high priority feedbacks',
    type: [FeedbackResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Manager role required',
  })
  async getHighPriorityFeedbacks(@Request() req) {
    return this.feedbackService.getHighPriorityFeedbacks(req.user.role);
  }

  @Get('stats/pending-count')
  @UseGuards(RolesGuard)
  @Roles(FEEDBACK_MANAGER_ROLE)
  @ApiOperation({ summary: 'Get count of pending feedbacks (Manager only)' })
  @ApiResponse({ status: 200, description: 'Count of pending feedbacks' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Manager role required',
  })
  async getPendingCount(@Request() req) {
    const count = await this.feedbackService.getPendingCount(req.user.role);
    return { count };
  }
}
