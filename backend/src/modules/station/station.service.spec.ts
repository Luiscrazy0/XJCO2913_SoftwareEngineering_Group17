import { Test, TestingModule } from '@nestjs/testing';
import { StationService } from './station.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('StationService', () => {
  let service: StationService;

  // 1. 构建全套 Mock 数据库
  const mockPrismaService = {
    station: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    scooter: {
      findMany: jest.fn(),
      updateMany: jest.fn(),
    },
  };

  // 基础假数据
  const mockStation = {
    id: 'station-1',
    name: '中央广场站',
    latitude: 39.9,
    longitude: 116.4,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StationService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<StationService>(StationService);
    jest.clearAllMocks();
  });

  it('模块应该被成功定义', () => {
    expect(service).toBeDefined();
  });

  // ========================================================
  // 1. findAll
  // ========================================================
  describe('findAll', () => {
    it('应成功返回所有站点，并按创建时间倒序排列', async () => {
      mockPrismaService.station.findMany.mockResolvedValue([mockStation]);

      const result = await service.findAll();

      expect(mockPrismaService.station.findMany).toHaveBeenCalledWith({
        include: {
          scooters: { include: { station: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual([mockStation]);
    });
  });

  // ========================================================
  // 2. findById
  // ========================================================
  describe('findById', () => {
    it('【正常路径】存在对应 ID 的站点时应成功返回', async () => {
      mockPrismaService.station.findUnique.mockResolvedValue(mockStation);

      const result = await service.findById('station-1');
      expect(result).toEqual(mockStation);
      expect(mockPrismaService.station.findUnique).toHaveBeenCalledWith({
        where: { id: 'station-1' },
        include: { scooters: { include: { station: true } } },
      });
    });

    it('【异常路径】找不到站点时抛出 NotFoundException', async () => {
      mockPrismaService.station.findUnique.mockResolvedValue(null);

      await expect(service.findById('unknown-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ========================================================
  // 3. createStation
  // ========================================================
  describe('createStation', () => {
    it('应成功创建并返回新站点', async () => {
      const createDto: any = { name: '新站点', latitude: 40, longitude: 116 };
      mockPrismaService.station.create.mockResolvedValue({ ...mockStation, ...createDto });

      const result = await service.createStation(createDto);

      expect(mockPrismaService.station.create).toHaveBeenCalledWith({
        data: createDto,
        include: { scooters: true },
      });
      expect(result.name).toBe('新站点');
    });
  });

  // ========================================================
  // 4. updateStation
  // ========================================================
  describe('updateStation', () => {
    it('【异常路径】找不到需更新的站点时抛出 NotFoundException', async () => {
      mockPrismaService.station.findUnique.mockResolvedValue(null);

      await expect(service.updateStation('unknown', {})).rejects.toThrow(
        NotFoundException,
      );
    });

    it('【正常路径】应成功更新并返回站点', async () => {
      const updateDto = { name: '更新后的站点' };
      mockPrismaService.station.findUnique.mockResolvedValue(mockStation);
      mockPrismaService.station.update.mockResolvedValue({ ...mockStation, ...updateDto });

      const result = await service.updateStation('station-1', updateDto);

      expect(mockPrismaService.station.update).toHaveBeenCalledWith({
        where: { id: 'station-1' },
        data: updateDto,
        include: { scooters: true },
      });
      expect(result.name).toBe('更新后的站点');
    });
  });

  // ========================================================
  // 5. deleteStation (级联逻辑测试重点)
  // ========================================================
  describe('deleteStation', () => {
    it('【异常路径】找不到需删除的站点时抛出 NotFoundException', async () => {
      mockPrismaService.station.findUnique.mockResolvedValue(null);

      await expect(service.deleteStation('unknown')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('【业务逻辑】当站点上有滑板车时，必须先将滑板车解除关联再删除站点', async () => {
      mockPrismaService.station.findUnique.mockResolvedValue(mockStation);
      // 模拟查到了 2 辆滑板车停在这个站点
      mockPrismaService.scooter.findMany.mockResolvedValue([{ id: 'scooter1' }, { id: 'scooter2' }]);
      mockPrismaService.station.delete.mockResolvedValue(mockStation);

      await service.deleteStation('station-1');

      // 核心断言：是否调用了 updateMany 来解除关联
      expect(mockPrismaService.scooter.updateMany).toHaveBeenCalledWith({
        where: { stationId: 'station-1' },
        data: { stationId: null },
      });
      // 然后再调用 delete
      expect(mockPrismaService.station.delete).toHaveBeenCalledWith({
        where: { id: 'station-1' },
      });
    });

    it('【正常路径】当站点上没有滑板车时，应直接删除', async () => {
      mockPrismaService.station.findUnique.mockResolvedValue(mockStation);
      // 模拟没有滑板车
      mockPrismaService.scooter.findMany.mockResolvedValue([]);
      mockPrismaService.station.delete.mockResolvedValue(mockStation);

      await service.deleteStation('station-1');

      // 核心断言：不需要调用 updateMany，直接被跳过
      expect(mockPrismaService.scooter.updateMany).not.toHaveBeenCalled();
      expect(mockPrismaService.station.delete).toHaveBeenCalled();
    });
  });

  // ========================================================
  // 6. getStationsWithAvailableScooters
  // ========================================================
  describe('getStationsWithAvailableScooters', () => {
    it('应成功请求包含可用滑板车的站点，并过滤内部滑板车状态', async () => {
      mockPrismaService.station.findMany.mockResolvedValue([mockStation]);

      const result = await service.getStationsWithAvailableScooters();

      expect(mockPrismaService.station.findMany).toHaveBeenCalledWith({
        where: { scooters: { some: { status: 'AVAILABLE' } } },
        include: {
          scooters: {
            where: { status: 'AVAILABLE' },
            include: { station: true },
          },
        },
        orderBy: { name: 'asc' },
      });
      expect(result).toEqual([mockStation]);
    });
  });

  // ========================================================
  // 7. getNearbyStations (测距与过滤排序逻辑)
  // ========================================================
  describe('getNearbyStations', () => {
    it('【核心业务逻辑】应准确计算距离，过滤超出半径的站点，并按距离升序排列', async () => {
      // 准备三个不同位置的站点
      const mockStations = [
        { ...mockStation, id: 'st1', name: '极远站点', latitude: 41.0, longitude: 116.4 }, // 距离搜索点约 111 公里，将被过滤
        { ...mockStation, id: 'st2', name: '中心站点', latitude: 39.9, longitude: 116.4 }, // 距离为 0 公里
        { ...mockStation, id: 'st3', name: '附近站点', latitude: 39.91, longitude: 116.4 }, // 距离约 1.11 公里
      ];

      mockPrismaService.station.findMany.mockResolvedValue(mockStations);

      // 搜索中心：39.9, 116.4。搜索半径：默认 5km
      const results = await service.getNearbyStations(39.9, 116.4, 5);

      // 验证找出了所有库里的站点，以备计算
      expect(mockPrismaService.station.findMany).toHaveBeenCalled();

      // 断言：过滤掉大于 5km 的 st1，并确保 st2(0km) 排在 st3(1.11km) 前面
      expect(results.length).toBe(2);
      expect(results[0].id).toBe('st2'); 
      expect(results[0].distanceKm).toBe(0); // 距离为 0
      
      expect(results[1].id).toBe('st3');
      expect(results[1].distanceKm).toBeGreaterThan(0);
      expect(results[1].distanceKm).toBeLessThan(5); // 距离大于0且小于5
    });
  });
});
