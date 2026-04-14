import { Test, TestingModule } from '@nestjs/testing';
import { ScooterService } from './scooter.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AmapService } from '../amap/amap.service';
import { ScooterStatus } from '@prisma/client';
import { BadRequestException } from '@nestjs/common';

describe('ScooterService', () => {
  let scooterService: ScooterService;

  // 1. 创建假的 PrismaService（代替真实数据库）
  const mockPrismaService = {
    scooter: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    booking: {
      count: jest.fn(),
    },
  };

  // 创建假的 AmapService
  const mockAmapService = {
    regeocode: jest.fn(),
  };

  beforeEach(async () => {
    // 2. 搭建测试模块环境
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScooterService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: AmapService,
          useValue: mockAmapService,
        },
      ],
    }).compile();

    scooterService = module.get<ScooterService>(ScooterService);

    // 每次测试前清空调用记录，防止互相干扰
    jest.clearAllMocks();
  });

  it('模块应该被成功定义', () => {
    expect(scooterService).toBeDefined();
  });

  // ==========================================
  // 测试组 1: findAll (获取所有滑板车)
  // ==========================================
  describe('findAll', () => {
    it('应该成功返回所有滑板车的列表', async () => {
      const mockScooters = [
        { id: '1', location: 'South Campus', status: ScooterStatus.AVAILABLE },
        { id: '2', location: 'Library', status: ScooterStatus.RENTED },
      ];
      mockPrismaService.scooter.findMany.mockResolvedValue(mockScooters);
      // Mock the amapService to return null address since scooters don't have coordinates
      mockAmapService.regeocode.mockResolvedValue({
        status: '1',
        regeocode: { formatted_address: 'Test Address' },
      });

      const result = await scooterService.findAll();

      // 🌟 修复：对齐真实代码里的 include
      expect(mockPrismaService.scooter.findMany).toHaveBeenCalledWith({
        include: { station: true },
      });
      // The service adds amapAddress field to each scooter
      expect(result).toEqual([
        { ...mockScooters[0], amapAddress: null },
        { ...mockScooters[1], amapAddress: null },
      ]);
    });
  });

  // ==========================================
  // 测试组 2: findById (根据 ID 获取滑板车)
  // ==========================================
  describe('findById', () => {
    const testId = 'test-scooter-id';

    it('【正常路径】如果 ID 存在，应该返回对应的滑板车对象', async () => {
      const mockScooter = {
        id: testId,
        location: 'North Campus',
        status: ScooterStatus.AVAILABLE,
      };
      mockPrismaService.scooter.findUnique.mockResolvedValue(mockScooter);

      const result = await scooterService.findById(testId);

      expect(mockPrismaService.scooter.findUnique).toHaveBeenCalledWith({
        where: { id: testId },
        include: { station: true },
      });
      // The service adds amapAddress field to the scooter
      expect(result).toEqual({ ...mockScooter, amapAddress: null });
    });

    it('【异常路径】如果 ID 不存在，应该返回 null', async () => {
      mockPrismaService.scooter.findUnique.mockResolvedValue(null);

      const result = await scooterService.findById('wrong-id');

      expect(result).toBeNull();
    });
  });

  // ==========================================
  // 测试组 3: createScooter (创建滑板车)
  // ==========================================
  describe('createScooter', () => {
    it('应该成功在指定位置创建一辆新滑板车', async () => {
      const newLocation = 'Engineering Building';
      const mockCreatedScooter = {
        id: '3',
        location: newLocation,
        status: ScooterStatus.AVAILABLE,
      };

      mockPrismaService.scooter.create.mockResolvedValue(mockCreatedScooter);

      const result = await scooterService.createScooter(newLocation);

      expect(mockPrismaService.scooter.create).toHaveBeenCalledWith({
        data: { location: newLocation },
      });
      expect(result).toEqual(mockCreatedScooter);
    });
  });

  // ==========================================
  // 测试组 4: updateStatus (更新滑板车状态)
  // ==========================================
  describe('updateStatus', () => {
    it('应该成功更新指定滑板车的状态', async () => {
      const targetId = '1';
      const newStatus = ScooterStatus.UNAVAILABLE;

      const mockUpdatedScooter = {
        id: targetId,
        location: 'South Campus',
        status: newStatus,
      };

      mockPrismaService.scooter.update.mockResolvedValue(mockUpdatedScooter);

      const result = await scooterService.updateStatus(targetId, newStatus);

      expect(mockPrismaService.scooter.update).toHaveBeenCalledWith({
        where: { id: targetId },
        data: { status: newStatus },
      });
      expect(result).toEqual(mockUpdatedScooter);
    });
  });

  // ==========================================
  // 测试组 5: deleteScooter (关键分支测试)
  // ==========================================
  describe('deleteScooter', () => {
    const scooterId = 'scooter-123';

    it('【异常路径】如果该滑板车还有关联的订单，应该抛出 BadRequestException 错误', async () => {
      mockPrismaService.booking.count.mockResolvedValue(1);

      await expect(scooterService.deleteScooter(scooterId)).rejects.toThrow(
        new BadRequestException('Scooter has existing bookings'),
      );

      expect(mockPrismaService.scooter.delete).not.toHaveBeenCalled();
    });

    it('【正常路径】如果该滑板车没有关联订单，应该成功删除', async () => {
      mockPrismaService.booking.count.mockResolvedValue(0);

      const mockDeletedScooter = { id: scooterId, location: 'Campus A' };
      mockPrismaService.scooter.delete.mockResolvedValue(mockDeletedScooter);

      const result = await scooterService.deleteScooter(scooterId);

      expect(mockPrismaService.booking.count).toHaveBeenCalledWith({
        where: { scooterId },
      });
      expect(mockPrismaService.scooter.delete).toHaveBeenCalledWith({
        where: { id: scooterId },
      });
      expect(result).toEqual(mockDeletedScooter);
    });
  });
});
