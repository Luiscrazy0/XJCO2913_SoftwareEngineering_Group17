import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

export interface GeocodeResult {
  formatted_address: string;
  province: string;
  city: string;
  citycode: string;
  district: string;
  township: string;
  street: string;
  number: string;
  adcode: string;
  location: string;
  level: string;
}

export interface GeocodeResponse {
  status: string;
  info: string;
  infocode: string;
  count: string;
  geocodes: GeocodeResult[];
}

export interface RegeocodeResult {
  formatted_address: string;
  addressComponent: {
    province: string;
    city: string;
    citycode: string;
    district: string;
    township: string;
    towncode: string;
    neighborhood: {
      name: string;
      type: string;
    };
    building: {
      name: string;
      type: string;
    };
    streetNumber: {
      street: string;
      number: string;
      location: string;
      direction: string;
      distance: string;
    };
    businessAreas: Array<{
      location: string;
      name: string;
      id: string;
    }>;
  };
}

export interface RegeocodeResponse {
  status: string;
  info: string;
  infocode: string;
  regeocode: RegeocodeResult;
}

export interface DistanceResult {
  origin: string;
  destination: string;
  distance: number;
  duration: number;
}

export interface DistanceResponse {
  status: string;
  info: string;
  infocode: string;
  results: DistanceResult[];
}

@Injectable()
export class AmapService {
  private readonly logger = new Logger(AmapService.name);
  private readonly apiKey: string;
  private readonly baseUrl = 'https://restapi.amap.com/v3';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('AMAP_WEB_KEY') || '';

    if (!this.apiKey) {
      this.logger.warn('高德地图Web API Key未配置，相关功能将不可用');
    } else {
      this.logger.log('高德地图Web API服务已初始化');
    }
  }

  /**
   * 地址转坐标（地理编码）
   * @param address 地址字符串
   * @param city 城市（可选）
   */
  async geocode(address: string, city?: string): Promise<GeocodeResponse> {
    if (!this.apiKey) {
      throw new Error('高德地图API Key未配置');
    }

    try {
      const params: Record<string, string> = {
        address,
        key: this.apiKey,
        output: 'JSON',
      };

      if (city) {
        params.city = city;
      }

      const response = await firstValueFrom(
        this.httpService.get<GeocodeResponse>(`${this.baseUrl}/geocode/geo`, {
          params,
        }),
      );

      this.logger.debug(
        `地理编码请求: ${address}, 结果: ${response.data.status}`,
      );
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`地理编码失败: ${errorMessage}`, errorStack);
      throw new Error(`地理编码失败: ${errorMessage}`);
    }
  }

  /**
   * 坐标转地址（逆地理编码）
   * @param longitude 经度
   * @param latitude 纬度
   */
  async regeocode(
    longitude: number,
    latitude: number,
  ): Promise<RegeocodeResponse> {
    if (!this.apiKey) {
      throw new Error('高德地图API Key未配置');
    }

    try {
      const location = `${longitude},${latitude}`;
      const params = {
        location,
        key: this.apiKey,
        output: 'JSON',
        extensions: 'base',
      };

      const response = await firstValueFrom(
        this.httpService.get<RegeocodeResponse>(
          `${this.baseUrl}/geocode/regeo`,
          { params },
        ),
      );

      this.logger.debug(
        `逆地理编码请求: ${location}, 结果: ${response.data.status}`,
      );
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`逆地理编码失败: ${errorMessage}`, errorStack);
      throw new Error(`逆地理编码失败: ${errorMessage}`);
    }
  }

  /**
   * 计算两点间距离
   * @param origin 起点坐标 "经度,纬度"
   * @param destination 终点坐标 "经度,纬度"
   * @param type 路径类型 0:直线距离 1:驾车距离 2:公交距离 3:步行距离
   */
  async calculateDistance(
    origin: string,
    destination: string,
    type: 0 | 1 | 2 | 3 = 1,
  ): Promise<DistanceResponse> {
    if (!this.apiKey) {
      throw new Error('高德地图API Key未配置');
    }

    try {
      const params = {
        origins: origin,
        destination,
        key: this.apiKey,
        output: 'JSON',
        type: type.toString(),
      };

      const response = await firstValueFrom(
        this.httpService.get<DistanceResponse>(`${this.baseUrl}/distance`, {
          params,
        }),
      );

      this.logger.debug(
        `距离计算请求: ${origin} -> ${destination}, 结果: ${response.data.status}`,
      );
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`距离计算失败: ${errorMessage}`, errorStack);
      throw new Error(`距离计算失败: ${errorMessage}`);
    }
  }

  /**
   * 批量计算距离
   * @param origins 起点坐标数组 ["经度,纬度", ...]
   * @param destination 终点坐标 "经度,纬度"
   * @param type 路径类型
   */
  async calculateDistances(
    origins: string[],
    destination: string,
    type: 0 | 1 | 2 | 3 = 1,
  ): Promise<DistanceResponse> {
    if (!this.apiKey) {
      throw new Error('高德地图API Key未配置');
    }

    try {
      const originsStr = origins.join('|');
      const params = {
        origins: originsStr,
        destination,
        key: this.apiKey,
        output: 'JSON',
        type: type.toString(),
      };

      const response = await firstValueFrom(
        this.httpService.get<DistanceResponse>(`${this.baseUrl}/distance`, {
          params,
        }),
      );

      this.logger.debug(
        `批量距离计算: ${origins.length}个起点 -> ${destination}`,
      );
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`批量距离计算失败: ${errorMessage}`, errorStack);
      throw new Error(`批量距离计算失败: ${errorMessage}`);
    }
  }

  /**
   * 输入提示（搜索建议）
   * @param keywords 关键词
   * @param city 城市限制（可选）
   */
  async inputTips(keywords: string, city?: string): Promise<any> {
    if (!this.apiKey) {
      throw new Error('高德地图API Key未配置');
    }

    try {
      const params: Record<string, string> = {
        keywords,
        key: this.apiKey,
        output: 'JSON',
      };

      if (city) {
        params.city = city;
      }

      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/assistant/inputtips`, { params }),
      );

      this.logger.debug(`输入提示请求: ${keywords}`);
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`输入提示失败: ${errorMessage}`, errorStack);
      throw new Error(`输入提示失败: ${errorMessage}`);
    }
  }

  /**
   * 验证API Key是否有效
   */
  async validateApiKey(): Promise<boolean> {
    if (!this.apiKey) {
      return false;
    }

    try {
      // 使用一个简单的请求测试API Key
      const params = {
        address: '北京市',
        key: this.apiKey,
        output: 'JSON',
      };

      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/geocode/geo`, { params }),
      );

      return response.data.status === '1';
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`API Key验证失败: ${errorMessage}`);
      return false;
    }
  }

  /**
   * 获取服务状态
   */
  getServiceStatus() {
    return {
      initialized: !!this.apiKey,
      apiKeyConfigured: !!this.apiKey,
      baseUrl: this.baseUrl,
    };
  }
}
