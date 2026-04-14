import {
  Controller,
  Get,
  Query,
  Post,
  Body,
  UseInterceptors,
} from '@nestjs/common';
import {
  AmapService,
  GeocodeResponse,
  RegeocodeResponse,
  DistanceResponse,
} from './amap.service';
import { ResponseInterceptor } from '../../interceptors/response.interceptor';

export interface InputTipsResponse {
  status: string;
  info: string;
  infocode: string;
  count: string;
  tips: Array<{
    id: string;
    name: string;
    district: string;
    adcode: string;
    location: string;
    address: string;
    typecode: string;
  }>;
}

export interface BatchGeocodeResult {
  address: string;
  city?: string;
  success: boolean;
  data?: GeocodeResponse;
  error?: string;
}

export interface BatchGeocodeResponse {
  total: number;
  success: number;
  failed: number;
  results: BatchGeocodeResult[];
}

@Controller('amap')
@UseInterceptors(ResponseInterceptor)
export class AmapController {
  constructor(private readonly amapService: AmapService) {}

  /**
   * 获取服务状态
   */
  @Get('status')
  getStatus() {
    return this.amapService.getServiceStatus();
  }

  /**
   * 地址转坐标（地理编码）
   */
  @Get('geocode')
  async geocode(
    @Query('address') address: string,
    @Query('city') city?: string,
  ): Promise<GeocodeResponse> {
    if (!address) {
      throw new Error('地址参数不能为空');
    }
    return this.amapService.geocode(address, city);
  }

  /**
   * 坐标转地址（逆地理编码）
   */
  @Get('regeocode')
  async regeocode(
    @Query('longitude') longitude: number,
    @Query('latitude') latitude: number,
  ): Promise<RegeocodeResponse> {
    if (!longitude || !latitude) {
      throw new Error('经纬度参数不能为空');
    }
    return this.amapService.regeocode(longitude, latitude);
  }

  /**
   * 计算两点间距离
   */
  @Get('distance')
  async calculateDistance(
    @Query('origin') origin: string,
    @Query('destination') destination: string,
    @Query('type') type: string = '1',
  ): Promise<DistanceResponse> {
    if (!origin || !destination) {
      throw new Error('起点和终点参数不能为空');
    }

    const typeNum = parseInt(type, 10);
    if (typeNum < 0 || typeNum > 3) {
      throw new Error('类型参数必须为0-3之间的整数');
    }

    return this.amapService.calculateDistance(
      origin,
      destination,
      typeNum as 0 | 1 | 2 | 3,
    );
  }

  /**
   * 批量计算距离
   */
  @Post('distances')
  async calculateDistances(
    @Body() body: { origins: string[]; destination: string; type?: number },
  ): Promise<DistanceResponse> {
    const { origins, destination, type = 1 } = body;

    if (!origins || !origins.length || !destination) {
      throw new Error('起点数组和终点参数不能为空');
    }

    if (type < 0 || type > 3) {
      throw new Error('类型参数必须为0-3之间的整数');
    }

    return this.amapService.calculateDistances(
      origins,
      destination,
      type as 0 | 1 | 2 | 3,
    );
  }

  /**
   * 输入提示（搜索建议）
   */
  @Get('input-tips')
  async inputTips(
    @Query('keywords') keywords: string,
    @Query('city') city?: string,
  ): Promise<InputTipsResponse> {
    if (!keywords) {
      throw new Error('关键词参数不能为空');
    }
    return this.amapService.inputTips(keywords, city);
  }

  /**
   * 验证API Key
   */
  @Get('validate-key')
  async validateApiKey() {
    const isValid = await this.amapService.validateApiKey();
    return {
      valid: isValid,
      message: isValid ? 'API Key有效' : 'API Key无效或未配置',
    };
  }

  /**
   * 批量地理编码
   */
  @Post('batch-geocode')
  async batchGeocode(
    @Body() body: { addresses: Array<{ address: string; city?: string }> },
  ): Promise<BatchGeocodeResponse> {
    const { addresses } = body;

    if (!addresses || !addresses.length) {
      throw new Error('地址数组不能为空');
    }

    // 限制批量处理数量
    if (addresses.length > 10) {
      throw new Error('批量处理数量不能超过10个');
    }

    const results = await Promise.all(
      addresses.map(async (item) => {
        try {
          const result = await this.amapService.geocode(
            item.address,
            item.city,
          );
          return {
            address: item.address,
            city: item.city,
            success: true,
            data: result,
          };
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
          return {
            address: item.address,
            city: item.city,
            success: false,
            error: errorMessage,
          };
        }
      }),
    );

    return {
      total: addresses.length,
      success: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      results,
    };
  }

  /**
   * 计算用户到所有站点的距离
   */
  @Get('user-to-stations')
  async calculateUserToStations(
    @Query('userLocation') userLocation: string,
    @Query('stations') stations: string,
    @Query('type') type: string = '1',
  ): Promise<DistanceResponse> {
    if (!userLocation || !stations) {
      throw new Error('用户位置和站点参数不能为空');
    }

    const typeNum = parseInt(type, 10);
    if (typeNum < 0 || typeNum > 3) {
      throw new Error('类型参数必须为0-3之间的整数');
    }

    // 解析站点坐标数组
    let stationCoords: string[];
    try {
      stationCoords = JSON.parse(stations);
      if (!Array.isArray(stationCoords)) {
        throw new Error('站点参数必须是坐标数组');
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Invalid JSON format';
      throw new Error(`站点参数格式错误: ${errorMessage}`);
    }

    // 限制处理数量
    if (stationCoords.length > 20) {
      throw new Error('站点数量不能超过20个');
    }

    const result = await this.amapService.calculateDistances(
      stationCoords,
      userLocation,
      typeNum as 0 | 1 | 2 | 3,
    );

    // 按距离排序
    if (result.status === '1' && result.results) {
      result.results.sort((a, b) => a.distance - b.distance);
    }

    return result;
  }
}
