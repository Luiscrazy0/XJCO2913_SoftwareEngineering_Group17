import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { BookingService } from './booking.service';
import { HireType } from '@prisma/client';
import { CreateBookingDto } from './dto/create-booking.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('bookings')
@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '获取所有预约', description: '获取当前用户的所有预约记录（需要登录）' })
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
              status: 'AVAILABLE'
            },
            user: {
              id: 'clx0987654321',
              email: 'user@example.com',
              role: 'CUSTOMER'
            }
          }
        ],
        message: 'Request successful',
        timestamp: '2024-01-01T00:00:00.000Z'
      }
    }
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
        path: '/bookings'
      }
    }
  })
  findAll() {
    return this.bookingService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '获取单个预约', description: '根据ID获取预约详细信息（需要登录）' })
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
            status: 'AVAILABLE'
          },
          user: {
            id: 'clx0987654321',
            email: 'user@example.com',
            role: 'CUSTOMER'
          }
        },
        message: 'Request successful',
        timestamp: '2024-01-01T00:00:00.000Z'
      }
    }
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
        path: '/bookings/clx1234567890'
      }
    }
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
        path: '/bookings/clx1234567890'
      }
    }
  })
  findOne(@Param('id') id: string) {
    return this.bookingService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '创建预约', description: '创建新的电动车预约（需要登录）' })
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
            status: 'AVAILABLE'
          },
          user: {
            id: 'clx0987654321',
            email: 'user@example.com',
            role: 'CUSTOMER'
          }
        },
        message: 'Resource created successfully',
        timestamp: '2024-01-01T00:00:00.000Z'
      }
    }
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
        path: '/bookings'
      }
    }
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
        path: '/bookings'
      }
    }
  })
  create(@Body()body: CreateBookingDto)
  // Dto
  {
    return this.bookingService.createBooking(
      body.userId,
      body.scooterId,
      body.hireType,
      new Date(body.startTime),
      new Date(body.endTime),
    );
  }

  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '取消预约', description: '取消已创建的预约（需要登录）' })
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
            status: 'AVAILABLE'
          },
          user: {
            id: 'clx0987654321',
            email: 'user@example.com',
            role: 'CUSTOMER'
          }
        },
        message: 'Request successful',
        timestamp: '2024-01-01T00:00:00.000Z'
      }
    }
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
        path: '/bookings/clx1234567890/cancel'
      }
    }
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
        path: '/bookings/clx1234567890/cancel'
      }
    }
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
        path: '/bookings/clx1234567890/cancel'
      }
    }
  })
  cancel(@Param('id') id: string) {
    return this.bookingService.cancelBooking(id);
  }
}
