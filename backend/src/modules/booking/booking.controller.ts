import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Delete,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { PaymentCardService } from './payment-card.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { ExtendBookingDto } from './dto/extend-booking.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('bookings')
@Controller('bookings')
export class BookingController {
  constructor(
    private readonly bookingService: BookingService,
    private readonly paymentCardService: PaymentCardService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '获取所有预约',
    description: '获取当前用户的所有预约记录（需要登录）',
  })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    schema: {
      example: {
        success: true,
        data: [
          {
            id: 'clx1234567890',
            userId: 'clx0987654321',
            scooterId: 'clx1234567890',
            hireType: 'HOUR_1',
            startTime: '2024-01-01T10:00:00.000Z',
            endTime: '2024-01-01T11:00:00.000Z',
            status: 'CONFIRMED',
            totalCost: 10.0,
            scooter: {
              id: 'clx1234567890',
              location: 'Main Street, Building 5',
              status: 'AVAILABLE',
            },
            user: {
              id: 'clx0987654321',
              email: 'user@example.com',
              role: 'CUSTOMER',
            },
          },
        ],
        message: 'Request successful',
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '未授权访问',
    schema: {
      example: {
        success: false,
        error: 'Unauthorized',
        message: 'Unauthorized',
        statusCode: 401,
        timestamp: '2024-01-01T00:00:00.000Z',
        path: '/bookings',
      },
    },
  })
  findAll(
    @Request() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const userId = req.user?.id;
    const role = req.user?.role;
    if (!userId) throw new UnauthorizedException('User information missing');
    return this.bookingService.findAll(
      userId,
      role,
      Number(page),
      Number(limit),
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '获取单个预约',
    description: '根据ID获取预约详细信息（需要登录）',
  })
  @ApiParam({ name: 'id', description: '预约ID', example: 'clx1234567890' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    schema: {
      example: {
        success: true,
        data: {
          id: 'clx1234567890',
          userId: 'clx0987654321',
          scooterId: 'clx1234567890',
          hireType: 'HOUR_1',
          startTime: '2024-01-01T10:00:00.000Z',
          endTime: '2024-01-01T11:00:00.000Z',
          status: 'CONFIRMED',
          totalCost: 10.0,
          scooter: {
            id: 'clx1234567890',
            location: 'Main Street, Building 5',
            status: 'AVAILABLE',
          },
          user: {
            id: 'clx0987654321',
            email: 'user@example.com',
            role: 'CUSTOMER',
          },
        },
        message: 'Request successful',
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '未授权访问',
    schema: {
      example: {
        success: false,
        error: 'Unauthorized',
        message: 'Unauthorized',
        statusCode: 401,
        timestamp: '2024-01-01T00:00:00.000Z',
        path: '/bookings/clx1234567890',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '预约不存在',
    schema: {
      example: {
        success: false,
        error: 'Not Found',
        message: 'Booking not found',
        statusCode: 404,
        timestamp: '2024-01-01T00:00:00.000Z',
        path: '/bookings/clx1234567890',
      },
    },
  })
  findOne(@Request() req, @Param('id') id: string) {
    const userId = req.user?.id;
    const role = req.user?.role;
    if (!userId) throw new UnauthorizedException('User information missing');
    return this.bookingService.findById(id, userId, role);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '创建预约',
    description: '创建新的电动车预约（需要登录）',
  })
  @ApiBody({ type: CreateBookingDto })
  @ApiResponse({
    status: 201,
    description: '创建成功',
    schema: {
      example: {
        success: true,
        data: {
          id: 'clx1234567890',
          userId: 'clx0987654321',
          scooterId: 'clx1234567890',
          hireType: 'HOUR_1',
          startTime: '2024-01-01T10:00:00.000Z',
          endTime: '2024-01-01T11:00:00.000Z',
          status: 'PENDING_PAYMENT',
          totalCost: 10.0,
          scooter: {
            id: 'clx1234567890',
            location: 'Main Street, Building 5',
            status: 'AVAILABLE',
          },
          user: {
            id: 'clx0987654321',
            email: 'user@example.com',
            role: 'CUSTOMER',
          },
        },
        message: 'Resource created successfully',
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '请求参数错误',
    schema: {
      example: {
        success: false,
        error: 'Bad Request',
        message: 'Invalid request parameters',
        statusCode: 400,
        timestamp: '2024-01-01T00:00:00.000Z',
        path: '/bookings',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '未授权访问',
    schema: {
      example: {
        success: false,
        error: 'Unauthorized',
        message: 'Unauthorized',
        statusCode: 401,
        timestamp: '2024-01-01T00:00:00.000Z',
        path: '/bookings',
      },
    },
  })
  create(@Request() req, @Body() body: CreateBookingDto) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException('User information missing');
    return this.bookingService.createBooking(
      userId,
      body.scooterId,
      body.hireType,
      new Date(body.startTime),
    );
  }

  @Patch(':id/extend')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '续租预约',
    description: '延长已确认的预约时间（需要登录）',
  })
  @ApiParam({ name: 'id', description: '预约ID', example: 'clx1234567890' })
  @ApiBody({ type: ExtendBookingDto })
  @ApiResponse({
    status: 200,
    description: '续租成功',
    schema: {
      example: {
        success: true,
        data: {
          id: 'clx1234567890',
          userId: 'clx0987654321',
          scooterId: 'clx1234567890',
          hireType: 'HOUR_1',
          startTime: '2024-01-01T10:00:00.000Z',
          endTime: '2024-01-01T13:00:00.000Z', // 延长了2小时
          status: 'EXTENDED',
          totalCost: 20.0, // 原价10元 + 续租10元
          extensionCount: 1,
          scooter: {
            id: 'clx1234567890',
            location: 'Main Street, Building 5',
            status: 'AVAILABLE',
          },
          user: {
            id: 'clx0987654321',
            email: 'user@example.com',
            role: 'CUSTOMER',
          },
        },
        message: 'Booking extended successfully',
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '无法续租',
    schema: {
      example: {
        success: false,
        error: 'Bad Request',
        message: 'Only confirmed or extended bookings can be extended',
        statusCode: 400,
        timestamp: '2024-01-01T00:00:00.000Z',
        path: '/bookings/clx1234567890/extend',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '未授权访问',
    schema: {
      example: {
        success: false,
        error: 'Unauthorized',
        message: 'Unauthorized',
        statusCode: 401,
        timestamp: '2024-01-01T00:00:00.000Z',
        path: '/bookings/clx1234567890/extend',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '预约不存在',
    schema: {
      example: {
        success: false,
        error: 'Not Found',
        message: 'Booking not found',
        statusCode: 404,
        timestamp: '2024-01-01T00:00:00.000Z',
        path: '/bookings/clx1234567890/extend',
      },
    },
  })
  extend(
    @Request() req,
    @Param('id') id: string,
    @Body() body: ExtendBookingDto,
  ) {
    const userId = req.user?.id;
    const role = req.user?.role;
    if (!userId) throw new UnauthorizedException('User information missing');
    return this.bookingService.extendBooking(
      id,
      body.additionalHours,
      userId,
      role,
    );
  }

  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '取消预约',
    description: '取消已创建的预约（需要登录）',
  })
  @ApiParam({ name: 'id', description: '预约ID', example: 'clx1234567890' })
  @ApiResponse({
    status: 200,
    description: '取消成功',
    schema: {
      example: {
        success: true,
        data: {
          id: 'clx1234567890',
          userId: 'clx0987654321',
          scooterId: 'clx1234567890',
          hireType: 'HOUR_1',
          startTime: '2024-01-01T10:00:00.000Z',
          endTime: '2024-01-01T11:00:00.000Z',
          status: 'CANCELLED',
          totalCost: 10.0,
          scooter: {
            id: 'clx1234567890',
            location: 'Main Street, Building 5',
            status: 'AVAILABLE',
          },
          user: {
            id: 'clx0987654321',
            email: 'user@example.com',
            role: 'CUSTOMER',
          },
        },
        message: 'Request successful',
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '预约无法取消',
    schema: {
      example: {
        success: false,
        error: 'Bad Request',
        message: 'Booking cannot be cancelled',
        statusCode: 400,
        timestamp: '2024-01-01T00:00:00.000Z',
        path: '/bookings/clx1234567890/cancel',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '未授权访问',
    schema: {
      example: {
        success: false,
        error: 'Unauthorized',
        message: 'Unauthorized',
        statusCode: 401,
        timestamp: '2024-01-01T00:00:00.000Z',
        path: '/bookings/clx1234567890/cancel',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '预约不存在',
    schema: {
      example: {
        success: false,
        error: 'Not Found',
        message: 'Booking not found',
        statusCode: 404,
        timestamp: '2024-01-01T00:00:00.000Z',
        path: '/bookings/clx1234567890/cancel',
      },
    },
  })
  cancel(@Request() req, @Param('id') id: string) {
    const userId = req.user?.id;
    const role = req.user?.role;
    if (!userId) throw new UnauthorizedException('User information missing');
    return this.bookingService.cancelBooking(id, userId, role);
  }

  @Patch(':id/complete')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '完成预约',
    description: '标记预约为已完成并归还滑板车（需要登录）',
  })
  @ApiParam({ name: 'id', description: '预约ID', example: 'clx1234567890' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        isScooterIntact: {
          type: 'boolean',
          description: '滑板车是否完好无损',
          example: true,
        },
      },
      required: ['isScooterIntact'],
    },
  })
  @ApiResponse({
    status: 200,
    description: '还车成功',
    schema: {
      example: {
        success: true,
        data: {
          id: 'clx1234567890',
          userId: 'clx0987654321',
          scooterId: 'clx1234567890',
          hireType: 'HOUR_1',
          startTime: '2024-01-01T10:00:00.000Z',
          endTime: '2024-01-01T11:00:00.000Z',
          status: 'COMPLETED',
          totalCost: 10.0,
          scooter: {
            id: 'clx1234567890',
            location: 'Main Street, Building 5',
            status: 'AVAILABLE',
          },
          user: {
            id: 'clx0987654321',
            email: 'user@example.com',
            role: 'CUSTOMER',
          },
        },
        message: 'Booking completed successfully',
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '预约无法完成',
    schema: {
      example: {
        success: false,
        error: 'Bad Request',
        message: 'Cannot complete a cancelled booking',
        statusCode: 400,
        timestamp: '2024-01-01T00:00:00.000Z',
        path: '/bookings/clx1234567890/complete',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '未授权访问',
    schema: {
      example: {
        success: false,
        error: 'Unauthorized',
        message: 'Unauthorized',
        statusCode: 401,
        timestamp: '2024-01-01T00:00:00.000Z',
        path: '/bookings/clx1234567890/complete',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '预约不存在',
    schema: {
      example: {
        success: false,
        error: 'Not Found',
        message: 'Booking not found',
        statusCode: 404,
        timestamp: '2024-01-01T00:00:00.000Z',
        path: '/bookings/clx1234567890/complete',
      },
    },
  })
  complete(
    @Request() req,
    @Param('id') id: string,
    @Body() body: { isScooterIntact: boolean },
  ) {
    const userId = req.user?.id;
    const role = req.user?.role;
    if (!userId) throw new UnauthorizedException('User information missing');
    return this.bookingService.completeBooking(
      id,
      body.isScooterIntact,
      userId,
      role,
    );
  }

  @Get('estimate-price')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '费用估算',
    description: '根据租赁类型估算费用（含折扣）（需要登录）',
  })
  @ApiQuery({ name: 'hireType', enum: ['HOUR_1', 'HOUR_4', 'DAY_1', 'WEEK_1'] })
  async estimatePrice(@Request() req, @Query('hireType') hireType: string) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException('User information missing');
    return this.bookingService.estimatePrice(userId, hireType as any);
  }

  @Post(':id/start-ride')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '开始骑行', description: '确认取车，开始骑行计时' })
  async startRide(@Request() req, @Param('id') id: string) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException('User information missing');
    return this.bookingService.startRide(id, userId);
  }

  @Post(':id/end-ride')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '结束骑行',
    description: '还车到指定站点，结束骑行',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        returnStationId: { type: 'string' },
        isScooterIntact: { type: 'boolean', default: true },
      },
      required: ['returnStationId'],
    },
  })
  async endRide(
    @Request() req,
    @Param('id') id: string,
    @Body() body: { returnStationId: string; isScooterIntact?: boolean },
  ) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException('User information missing');
    return this.bookingService.endRide(
      id,
      userId,
      body.returnStationId,
      body.isScooterIntact ?? true,
    );
  }

  // 银行卡管理API
  @Post('payment-card')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '保存银行卡信息',
    description: '保存用户的银行卡信息用于快速预订',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        cardNumber: { type: 'string', example: '4111111111111111' },
        cardExpiry: { type: 'string', example: '12/25' },
        cardHolder: { type: 'string', example: 'John Doe' },
      },
      required: ['cardNumber', 'cardExpiry', 'cardHolder'],
    },
  })
  @ApiResponse({ status: 201, description: '银行卡保存成功' })
  @ApiResponse({ status: 400, description: '银行卡信息无效' })
  savePaymentCard(@Request() req, @Body() cardData: any) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException('User information missing');
    return this.paymentCardService.savePaymentCard(userId, cardData);
  }

  @Get('payment-card')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '获取银行卡信息',
    description: '获取用户保存的银行卡信息（卡号部分隐藏）',
  })
  @ApiResponse({ status: 200, description: '获取成功' })
  getPaymentCard(@Request() req) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException('User information missing');
    return this.paymentCardService.getPaymentCard(userId);
  }

  @Delete('payment-card')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '删除银行卡信息',
    description: '删除用户保存的银行卡信息',
  })
  @ApiResponse({ status: 200, description: '删除成功' })
  deletePaymentCard(@Request() req) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException('User information missing');
    return this.paymentCardService.deletePaymentCard(userId);
  }

  // 员工代订API
  @Post('staff-booking')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MANAGER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '员工代订',
    description: '管理员为客户代订滑板车（需要管理员权限）',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        customerEmail: { type: 'string', example: 'customer@example.com' },
        scooterId: { type: 'string', example: 'scooter-123' },
        hireType: {
          type: 'string',
          enum: ['HOUR_1', 'HOUR_4', 'DAY_1', 'WEEK_1'],
          example: 'HOUR_1',
        },
        startTime: {
          type: 'string',
          format: 'date-time',
          example: '2024-01-01T10:00:00.000Z',
        },
      },
      required: ['customerEmail', 'scooterId', 'hireType', 'startTime'],
    },
  })
  @ApiResponse({ status: 201, description: '代订成功' })
  @ApiResponse({ status: 403, description: '权限不足' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  createStaffBooking(@Request() req, @Body() bookingData: any) {
    const employeeId = req.user?.id;
    if (!employeeId)
      throw new UnauthorizedException('User information missing');
    return this.bookingService.createBookingForCustomer(
      employeeId,
      bookingData.customerEmail,
      bookingData.scooterId,
      bookingData.hireType,
      new Date(bookingData.startTime),
    );
  }
}
