import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { StationService } from './station.service';
import { CreateStationDto } from './dto/create-station.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('stations')
@Controller('stations')
export class StationController {
  constructor(private readonly stationService: StationService) {}

  @Get()
  @ApiOperation({ summary: '获取所有站点', description: '获取所有滑板车站点信息' })
  @ApiResponse({ 
    status: 200, 
    description: '获取成功',
    schema: {
      example: {
        success: true,
        data: [
          {
            id: 'ST001',
            name: '市中心广场站',
            address: '市中心广场A区停车场',
            latitude: 31.2304,
            longitude: 121.4737,
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
            scooters: [
              {
                id: 'SC001',
                location: '市中心广场 - A区',
                status: 'AVAILABLE',
                latitude: 31.2305,
                longitude: 121.4738,
                stationId: 'ST001'
              }
            ]
          }
        ],
        message: 'Request successful',
        timestamp: '2024-01-01T00:00:00.000Z'
      }
    }
  })
  findAll() {
    return this.stationService.findAll();
  }

  @Get('available')
  @ApiOperation({ summary: '获取有可用滑板车的站点', description: '获取所有有可用滑板车的站点信息' })
  @ApiResponse({ 
    status: 200, 
    description: '获取成功',
    schema: {
      example: {
        success: true,
        data: [
          {
            id: 'ST001',
            name: '市中心广场站',
            address: '市中心广场A区停车场',
            latitude: 31.2304,
            longitude: 121.4737,
            scooters: [
              {
                id: 'SC001',
                location: '市中心广场 - A区',
                status: 'AVAILABLE',
                latitude: 31.2305,
                longitude: 121.4738,
                stationId: 'ST001'
              }
            ]
          }
        ],
        message: 'Request successful',
        timestamp: '2024-01-01T00:00:00.000Z'
      }
    }
  })
  getStationsWithAvailableScooters() {
    return this.stationService.getStationsWithAvailableScooters();
  }

  @Get('nearby')
  @ApiOperation({ summary: '获取附近站点', description: '根据经纬度获取附近的滑板车站点' })
  @ApiQuery({ name: 'latitude', description: '纬度', example: 31.2304 })
  @ApiQuery({ name: 'longitude', description: '经度', example: 121.4737 })
  @ApiQuery({ name: 'radius', description: '搜索半径（公里）', example: 5, required: false })
  @ApiResponse({ 
    status: 200, 
    description: '获取成功',
    schema: {
      example: {
        success: true,
        data: [
          {
            id: 'ST001',
            name: '市中心广场站',
            address: '市中心广场A区停车场',
            latitude: 31.2304,
            longitude: 121.4737,
            distanceKm: 0.5,
            scooters: [
              {
                id: 'SC001',
                location: '市中心广场 - A区',
                status: 'AVAILABLE',
                latitude: 31.2305,
                longitude: 121.4738,
                stationId: 'ST001'
              }
            ]
          }
        ],
        message: 'Request successful',
        timestamp: '2024-01-01T00:00:00.000Z'
      }
    }
  })
  getNearbyStations(
    @Query('latitude') latitude: string,
    @Query('longitude') longitude: string,
    @Query('radius') radius?: string,
  ) {
    return this.stationService.getNearbyStations(
      parseFloat(latitude),
      parseFloat(longitude),
      radius ? parseFloat(radius) : 5
    );
  }

  @Get(':id')
  @ApiOperation({ summary: '获取单个站点', description: '根据ID获取站点详细信息' })
  @ApiParam({ name: 'id', description: '站点ID', example: 'ST001' })
  @ApiResponse({ 
    status: 200, 
    description: '获取成功',
    schema: {
      example: {
        success: true,
        data: {
          id: 'ST001',
          name: '市中心广场站',
          address: '市中心广场A区停车场',
          latitude: 31.2304,
          longitude: 121.4737,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          scooters: [
            {
              id: 'SC001',
              location: '市中心广场 - A区',
              status: 'AVAILABLE',
              latitude: 31.2305,
              longitude: 121.4738,
              stationId: 'ST001'
            }
          ]
        },
        message: 'Request successful',
        timestamp: '2024-01-01T00:00:00.000Z'
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: '站点不存在',
    schema: {
      example: {
        success: false,
        error: 'Not Found',
        message: 'Station not found',
        statusCode: 404,
        timestamp: '2024-01-01T00:00:00.000Z',
        path: '/stations/ST001'
      }
    }
  })
  findOne(@Param('id') id: string) {
    return this.stationService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '创建站点', description: '创建新的滑板车站点（需要管理员权限）' })
  @ApiBody({ type: CreateStationDto })
  @ApiResponse({ 
    status: 201, 
    description: '创建成功',
    schema: {
      example: {
        success: true,
        data: {
          id: 'ST001',
          name: '市中心广场站',
          address: '市中心广场A区停车场',
          latitude: 31.2304,
          longitude: 121.4737,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          scooters: []
        },
        message: 'Resource created successfully',
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
        path: '/stations'
      }
    }
  })
  create(@Body() body: CreateStationDto) {
    return this.stationService.createStation(body);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '更新站点', description: '更新站点信息（需要管理员权限）' })
  @ApiParam({ name: 'id', description: '站点ID', example: 'ST001' })
  @ApiBody({ type: CreateStationDto })
  @ApiResponse({ 
    status: 200, 
    description: '更新成功',
    schema: {
      example: {
        success: true,
        data: {
          id: 'ST001',
          name: '市中心广场站（更新）',
          address: '市中心广场A区停车场',
          latitude: 31.2304,
          longitude: 121.4737,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T01:00:00.000Z',
          scooters: []
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
        path: '/stations/ST001'
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: '站点不存在',
    schema: {
      example: {
        success: false,
        error: 'Not Found',
        message: 'Station not found',
        statusCode: 404,
        timestamp: '2024-01-01T00:00:00.000Z',
        path: '/stations/ST001'
      }
    }
  })
  update(@Param('id') id: string, @Body() body: CreateStationDto) {
    return this.stationService.updateStation(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '删除站点', description: '删除站点（需要管理员权限）' })
  @ApiParam({ name: 'id', description: '站点ID', example: 'ST001' })
  @ApiResponse({ 
    status: 200, 
    description: '删除成功',
    schema: {
      example: {
        success: true,
        data: {
          id: 'ST001',
          name: '市中心广场站',
          address: '市中心广场A区停车场',
          latitude: 31.2304,
          longitude: 121.4737,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
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
        path: '/stations/ST001'
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: '站点不存在',
    schema: {
      example: {
        success: false,
        error: 'Not Found',
        message: 'Station not found',
        statusCode: 404,
        timestamp: '2024-01-01T00:00:00.000Z',
        path: '/stations/ST001'
      }
    }
  })
  delete(@Param('id') id: string) {
    return this.stationService.deleteStation(id);
  }
}