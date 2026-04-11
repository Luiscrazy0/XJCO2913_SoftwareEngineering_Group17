import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { PaymentCardService } from './payment-card.service';
import { HireType } from '@prisma/client';
import { CreateBookingDto } from './dto/create-booking.dto';
import { ExtendBookingDto } from './dto/extend-booking.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
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
  findAll() {
    return this.bookingService.findAll();
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
  findOne(@Param('id') id: string) {
    return this.bookingService.findById(id);
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
  create(@Body() body: CreateBookingDto) {
    // Dto
    return this.bookingService.createBooking(
      body.userId,
      body.scooterId,
      body.hireType,
      new Date(body.startTime),
      new Date(body.endTime),
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
  extend(@Param('id') id: string, @Body() body: ExtendBookingDto) {
    return this.bookingService.extendBooking(id, body.additionalHours);
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
  cancel(@Param('id') id: string) {
    return this.bookingService.cancelBooking(id);
  }

  // 银行卡管理API
  @Post('payment-card')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '保存银行卡信息', description: '保存用户的银行卡信息用于快速预订' })
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
  savePaymentCard(@Body() cardData: any) {
    // 从JWT token获取用户ID（实际实现中需要从Auth装饰器获取）
    // 这里暂时使用模拟的用户ID，实际项目中需要正确获取
    return this.paymentCardService.savePaymentCard('user-id', cardData);
  }

  @Get('payment-card')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '获取银行卡信息', description: '获取用户保存的银行卡信息（卡号部分隐藏）' })
  @ApiResponse({ status: 200, description: '获取成功' })
  getPaymentCard() {
    // 从JWT token获取用户ID
    return this.paymentCardService.getPaymentCard('user-id');
  }

  @Delete('payment-card')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '删除银行卡信息', description: '删除用户保存的银行卡信息' })
  @ApiResponse({ status: 200, description: '删除成功' })
  deletePaymentCard() {
    // 从JWT token获取用户ID
    return this.paymentCardService.deletePaymentCard('user-id');
  }

  // 员工代订API
  @Post('staff-booking')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '员工代订', description: '管理员为客户代订滑板车（需要管理员权限）' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        customerEmail: { type: 'string', example: 'customer@example.com' },
        scooterId: { type: 'string', example: 'scooter-123' },
        hireType: { type: 'string', enum: ['HOUR_1', 'HOUR_4', 'DAY_1', 'WEEK_1'], example: 'HOUR_1' },
        startTime: { type: 'string', format: 'date-time', example: '2024-01-01T10:00:00.000Z' },
        endTime: { type: 'string', format: 'date-time', example: '2024-01-01T11:00:00.000Z' },
      },
      required: ['customerEmail', 'scooterId', 'hireType', 'startTime', 'endTime'],
    },
  })
  @ApiResponse({ status: 201, description: '代订成功' })
  @ApiResponse({ status: 403, description: '权限不足' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  createStaffBooking(@Body() bookingData: any) {
    // 从JWT token获取员工ID（实际实现中需要从Auth装饰器获取）
    // 这里暂时使用模拟的员工ID，实际项目中需要正确获取
    return this.bookingService.createBookingForCustomer(
      'employee-id', // 员工ID
      bookingData.customerEmail,
      bookingData.scooterId,
      bookingData.hireType,
      new Date(bookingData.startTime),
      new Date(bookingData.endTime),
    );
  }
}
