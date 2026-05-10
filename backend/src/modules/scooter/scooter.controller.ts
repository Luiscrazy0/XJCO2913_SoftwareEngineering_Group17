import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ScooterService } from './scooter.service';
import { CreateScooterDto } from './dto/create-scooter.dto';
import { UpdateScooterStatusDto } from './dto/update-scooter-status.dto';
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

@ApiTags('scooters')
@Controller('scooters')
export class ScooterController {
  constructor(private readonly scooterService: ScooterService) {}

  @Get()
  @ApiOperation({
    summary: '获取所有电动车',
    description: '获取系统中所有电动车的列表（支持分页）',
  })
  @ApiQuery({ name: 'page', required: false, description: '页码，默认1' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: '每页数量，默认20，最大100',
  })
  @ApiResponse({
    status: 200,
    description: '获取成功',
  })
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.scooterService.findAll(Number(page), Number(limit));
  }

  @Get(':id')
  @ApiOperation({
    summary: '获取单个电动车',
    description: '根据ID获取电动车详细信息',
  })
  @ApiParam({ name: 'id', description: '电动车ID', example: 'clx1234567890' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    schema: {
      example: {
        success: true,
        data: {
          id: 'clx1234567890',
          location: 'Main Street, Building 5',
          status: 'AVAILABLE',
        },
        message: 'Request successful',
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '电动车不存在',
    schema: {
      example: {
        success: false,
        error: 'Not Found',
        message: 'Scooter not found',
        statusCode: 404,
        timestamp: '2024-01-01T00:00:00.000Z',
        path: '/scooters/clx1234567890',
      },
    },
  })
  findOne(@Param('id') id: string) {
    return this.scooterService.findById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MANAGER)
  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '创建电动车',
    description: '管理员创建新的电动车（需要管理员权限）',
  })
  @ApiBody({ type: CreateScooterDto })
  @ApiResponse({
    status: 201,
    description: '创建成功',
    schema: {
      example: {
        success: true,
        data: {
          id: 'clx1234567890',
          location: 'Main Street, Building 5',
          status: 'AVAILABLE',
        },
        message: 'Resource created successfully',
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
        path: '/scooters',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: '权限不足',
    schema: {
      example: {
        success: false,
        error: 'Forbidden',
        message: 'Forbidden resource',
        statusCode: 403,
        timestamp: '2024-01-01T00:00:00.000Z',
        path: '/scooters',
      },
    },
  })
  create(@Body() body: CreateScooterDto) {
    // Add dto validation for location
    return this.scooterService.createScooter(body.location);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MANAGER)
  @Patch(':id/status')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '更新电动车状态',
    description: '管理员更新电动车状态（需要管理员权限）',
  })
  @ApiParam({ name: 'id', description: '电动车ID', example: 'clx1234567890' })
  @ApiBody({ type: UpdateScooterStatusDto })
  @ApiResponse({
    status: 200,
    description: '更新成功',
    schema: {
      example: {
        success: true,
        data: {
          id: 'clx1234567890',
          location: 'Main Street, Building 5',
          status: 'UNAVAILABLE',
        },
        message: 'Request successful',
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '电动车不存在',
    schema: {
      example: {
        success: false,
        error: 'Not Found',
        message: 'Scooter not found',
        statusCode: 404,
        timestamp: '2024-01-01T00:00:00.000Z',
        path: '/scooters/clx1234567890/status',
      },
    },
  })
  updateStatus(@Param('id') id: string, @Body() body: UpdateScooterStatusDto) {
    return this.scooterService.updateStatus(id, body.status);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MANAGER)
  @Post(':id/force-reset')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '强制重置电动车状态',
    description: '管理员将卡在RENTED状态的幽灵车辆强制重置为AVAILABLE（需要管理员权限）',
  })
  @ApiParam({ name: 'id', description: '电动车ID' })
  @ApiResponse({ status: 200, description: '强制重置成功' })
  @ApiResponse({ status: 400, description: '车辆状态不是RENTED或存在活跃订单' })
  @ApiResponse({ status: 404, description: '电动车不存在' })
  forceReset(@Param('id') id: string) {
    return this.scooterService.forceResetGhostScooter(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MANAGER)
  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '删除电动车',
    description: '管理员删除电动车（需要管理员权限）',
  })
  @ApiParam({ name: 'id', description: '电动车ID', example: 'clx1234567890' })
  @ApiResponse({
    status: 200,
    description: '删除成功',
    schema: {
      example: {
        success: true,
        data: {
          id: 'clx1234567890',
          location: 'Main Street, Building 5',
          status: 'AVAILABLE',
        },
        message: 'Resource deleted successfully',
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '电动车有预约记录，无法删除',
    schema: {
      example: {
        success: false,
        error: 'Bad Request',
        message: 'Scooter has existing bookings',
        statusCode: 400,
        timestamp: '2024-01-01T00:00:00.000Z',
        path: '/scooters/clx1234567890',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '电动车不存在',
    schema: {
      example: {
        success: false,
        error: 'Not Found',
        message: 'Scooter not found',
        statusCode: 404,
        timestamp: '2024-01-01T00:00:00.000Z',
        path: '/scooters/clx1234567890',
      },
    },
  })
  delete(@Param('id') id: string) {
    return this.scooterService.deleteScooter(id);
  }
}
