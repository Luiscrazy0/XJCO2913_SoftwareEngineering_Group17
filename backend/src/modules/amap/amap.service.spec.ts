import { Test, TestingModule } from '@nestjs/testing';
import { AmapService } from './amap.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of, throwError } from 'rxjs';

describe('AmapService', () => {
  let service: AmapService;
  let httpService: HttpService;

  // 1. 模拟 HttpService，防止真正发出网络请求
  const mockHttpService = {
    get: jest.fn(),
  };

  // 2. 模拟 ConfigService，返回一个测试用的 API Key
  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'AMAP_WEB_KEY') return 'test_api_key';
      return null;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AmapService,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AmapService>(AmapService);
    httpService = module.get<HttpService>(HttpService);
    jest.clearAllMocks();
  });

  it('模块应该被成功定义', () => {
    expect(service).toBeDefined();
  });

  // ========================================================
  // 1. geocode (地理编码)
  // ========================================================
  describe('geocode', () => {
    it('【正常路径】应成功调用高德地理编码接口（带 city 参数）', async () => {
      const mockResponse = { data: { status: '1', geocodes: [] } };
      mockHttpService.get.mockReturnValue(of(mockResponse)); // 模拟 RxJS 的 Observable 返回

      const result = await service.geocode('北京市朝阳区', '北京');

      expect(mockHttpService.get).toHaveBeenCalledWith(
        'https://restapi.amap.com/v3/geocode/geo',
        {
          params: {
            address: '北京市朝阳区',
            city: '北京',
            key: 'test_api_key',
            output: 'JSON',
          },
        },
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('【异常路径】如果网络请求失败，应抛出包装后的 Error', async () => {
      mockHttpService.get.mockReturnValue(
        throwError(() => new Error('网络超时')),
      );

      await expect(service.geocode('北京市')).rejects.toThrow(
        '地理编码失败: 网络超时',
      );
    });
  });

  // ========================================================
  // 2. regeocode (逆地理编码)
  // ========================================================
  describe('regeocode', () => {
    it('【正常路径】应成功调用高德逆地理编码接口', async () => {
      const mockResponse = { data: { status: '1', regeocode: {} } };
      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = await service.regeocode(116.481488, 39.990464);

      expect(mockHttpService.get).toHaveBeenCalledWith(
        'https://restapi.amap.com/v3/geocode/regeo',
        {
          params: {
            location: '116.481488,39.990464',
            key: 'test_api_key',
            output: 'JSON',
            extensions: 'base',
          },
        },
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('【异常路径】如果请求失败，应抛出带有错误信息的 Error', async () => {
      mockHttpService.get.mockReturnValue(
        throwError(() => new Error('无效的坐标')),
      );

      await expect(service.regeocode(0, 0)).rejects.toThrow(
        '逆地理编码失败: 无效的坐标',
      );
    });
  });

  // ========================================================
  // 3. calculateDistance (计算单点距离)
  // ========================================================
  describe('calculateDistance', () => {
    it('【正常路径】应成功调用距离计算接口（默认驾车模式 type=1）', async () => {
      const mockResponse = { data: { status: '1', results: [] } };
      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = await service.calculateDistance('116,39', '117,40');

      expect(mockHttpService.get).toHaveBeenCalledWith(
        'https://restapi.amap.com/v3/distance',
        {
          params: {
            origins: '116,39',
            destination: '117,40',
            key: 'test_api_key',
            output: 'JSON',
            type: '1',
          },
        },
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('【异常路径】网络异常时应抛出错误', async () => {
      mockHttpService.get.mockReturnValue(
        throwError(() => new Error('API限制')),
      );

      await expect(service.calculateDistance('1', '2')).rejects.toThrow(
        '距离计算失败: API限制',
      );
    });
  });

  // ========================================================
  // 4. calculateDistances (批量计算距离)
  // ========================================================
  describe('calculateDistances', () => {
    it('【正常路径】应成功组合多个起点并调用距离计算接口', async () => {
      const mockResponse = { data: { status: '1', results: [] } };
      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = await service.calculateDistances(
        ['116,39', '115,38'],
        '117,40',
      );

      expect(mockHttpService.get).toHaveBeenCalledWith(
        'https://restapi.amap.com/v3/distance',
        {
          params: {
            origins: '116,39|115,38', // 核心断言：多个起点用 | 拼接
            destination: '117,40',
            key: 'test_api_key',
            output: 'JSON',
            type: '1',
          },
        },
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('【异常路径】网络异常时应抛出错误', async () => {
      mockHttpService.get.mockReturnValue(
        throwError(() => new Error('参数错误')),
      );

      await expect(service.calculateDistances(['1'], '2')).rejects.toThrow(
        '批量距离计算失败: 参数错误',
      );
    });
  });

  // ========================================================
  // 5. inputTips (输入提示)
  // ========================================================
  describe('inputTips', () => {
    it('【正常路径】应成功获取搜索建议', async () => {
      const mockResponse = { data: { status: '1', tips: [] } };
      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = await service.inputTips('麦当劳', '北京');

      expect(mockHttpService.get).toHaveBeenCalledWith(
        'https://restapi.amap.com/v3/assistant/inputtips',
        {
          params: {
            keywords: '麦当劳',
            city: '北京',
            key: 'test_api_key',
            output: 'JSON',
          },
        },
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('【异常路径】请求失败应抛出错误', async () => {
      mockHttpService.get.mockReturnValue(
        throwError(() => new Error('Key报错')),
      );

      await expect(service.inputTips('KFC')).rejects.toThrow(
        '输入提示失败: Key报错',
      );
    });
  });

  // ========================================================
  // 6. validateApiKey & getServiceStatus
  // ========================================================
  describe('validateApiKey & getServiceStatus', () => {
    it('验证有效 API Key 时返回 true', async () => {
      // 只要 status 是 '1' 就是成功
      mockHttpService.get.mockReturnValue(of({ data: { status: '1' } }));

      const isValid = await service.validateApiKey();
      expect(isValid).toBe(true);
    });

    it('验证无效 API Key 时返回 false', async () => {
      // status 不是 1 代表失败
      mockHttpService.get.mockReturnValue(of({ data: { status: '0' } }));

      const isValid = await service.validateApiKey();
      expect(isValid).toBe(false);
    });

    it('验证 API Key 发生网络错误时，安全地捕获异常并返回 false', async () => {
      mockHttpService.get.mockReturnValue(
        throwError(() => new Error('网络断开')),
      );

      const isValid = await service.validateApiKey();
      expect(isValid).toBe(false);
    });

    it('能正确返回服务状态信息', () => {
      const status = service.getServiceStatus();
      expect(status).toEqual({
        initialized: true,
        apiKeyConfigured: true,
        baseUrl: 'https://restapi.amap.com/v3',
      });
    });
  });

  // ========================================================
  // 7. 特殊边缘情况：缺失 API Key 测试
  // ========================================================
  describe('Missing API Key Scenarios', () => {
    let serviceWithoutKey: AmapService;

    beforeEach(async () => {
      // 创建一个新的没有配置 API Key 的环境
      const mockEmptyConfigService = {
        get: jest.fn(() => null), // 返回 null
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          AmapService,
          { provide: HttpService, useValue: mockHttpService },
          { provide: ConfigService, useValue: mockEmptyConfigService },
        ],
      }).compile();

      serviceWithoutKey = module.get<AmapService>(AmapService);
    });

    it('当 API Key 未配置时，所有业务方法都应直接抛出错误', async () => {
      await expect(serviceWithoutKey.geocode('北京')).rejects.toThrow(
        '高德地图API Key未配置',
      );
      await expect(serviceWithoutKey.regeocode(1, 1)).rejects.toThrow(
        '高德地图API Key未配置',
      );
      await expect(
        serviceWithoutKey.calculateDistance('1', '2'),
      ).rejects.toThrow('高德地图API Key未配置');
      await expect(
        serviceWithoutKey.calculateDistances(['1'], '2'),
      ).rejects.toThrow('高德地图API Key未配置');
      await expect(serviceWithoutKey.inputTips('关键词')).rejects.toThrow(
        '高德地图API Key未配置',
      );
    });

    it('当 API Key 未配置时，validateApiKey 应直接返回 false', async () => {
      const isValid = await serviceWithoutKey.validateApiKey();
      expect(isValid).toBe(false);
    });
  });
});
