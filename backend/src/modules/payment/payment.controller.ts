import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';

/**
 * Payment controller class.
 */
@ApiTags('payments')
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '创建支付',
    description: '为预约创建支付记录（需要登录）',
  })
  @ApiBody({ type: CreatePaymentDto })
  @ApiResponse({
    status: 201,
    description: '创建成功',
    schema: {
      example: {
        success: true,
        data: {
          id: 'clx1234567890',
          bookingId: 'clx0987654321',
          amount: 10.0,
          status: 'PENDING',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
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
        path: '/payments',
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
        path: '/payments',
      },
    },
  })
  create(
    @Body()
    body: CreatePaymentDto,
  ) {
    return this.paymentService.createPayment(body.bookingId, body.amount);
  }

  /**
   * Gets a payment by booking ID.
   *
   * @param bookingId - Booking ID.
   *
   * @returns The payment.
   */
  @Get(':bookingId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '获取支付信息',
    description: '根据预约ID获取支付信息（需要登录）',
  })
  @ApiParam({
    name: 'bookingId',
    description: '预约ID',
    example: 'clx0987654321',
  })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    schema: {
      example: {
        success: true,
        data: {
          id: 'clx1234567890',
          bookingId: 'clx0987654321',
          amount: 10.0,
          status: 'COMPLETED',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
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
        path: '/payments/clx0987654321',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '支付记录不存在',
    schema: {
      example: {
        success: false,
        error: 'Not Found',
        message: 'Payment not found',
        statusCode: 404,
        timestamp: '2024-01-01T00:00:00.000Z',
        path: '/payments/clx0987654321',
      },
    },
  })
  getByBooking(@Param('bookingId') bookingId: string) {
    return this.paymentService.getPaymentByBooking(bookingId);
  }
}
