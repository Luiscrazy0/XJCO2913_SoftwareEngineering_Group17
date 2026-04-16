import { Test, TestingModule } from '@nestjs/testing';
import { FeedbackService } from './feedback.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import {
  FeedbackCategory,
  FeedbackPriority,
  FeedbackStatus,
  Role,
} from '@prisma/client';

describe('FeedbackService', () => {
  let service: FeedbackService;

  // 构建健壮的假 Prisma 数据库
  const mockPrismaService = {
    feedback: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  };

  // 一些通用的假数据，防止 DTO 转换时报错
  const mockUser = { email: 'test@test.com' };
  const mockScooter = { location: 'Test Location' };
  const mockFeedbackBase = {
    id: 'fb-123',
    title: 'Test Feedback',
    description: 'Test Description',
    createdById: 'user-1',
    createdBy: mockUser,
    scooter: mockScooter,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeedbackService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<FeedbackService>(FeedbackService);
    jest.clearAllMocks();
  });

  it('模块应该被成功定义', () => {
    expect(service).toBeDefined();
  });

  // ========================================================
  // 1. createFeedback
  // ========================================================
  describe('createFeedback', () => {
    const userId = 'user-1';

    it('【业务逻辑】如果类别是 DAMAGE，应该自动将优先级设置为 HIGH', async () => {
      const createDto: any = {
        title: 'Brake broken',
        description: 'No brakes',
        category: FeedbackCategory.DAMAGE,
        scooterId: 'scooter-1',
      };

      mockPrismaService.feedback.create.mockResolvedValue({
        ...mockFeedbackBase,
        ...createDto,
        priority: FeedbackPriority.HIGH,
      });

      await service.createFeedback(userId, createDto);

      expect(mockPrismaService.feedback.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            priority: FeedbackPriority.HIGH, // 核心断言：必须是 HIGH
          }),
        }),
      );
    });

    it('【正常路径】如果是其他类别（如 SUGGESTION），优先级应该默认是 LOW', async () => {
      const createDto: any = {
        title: 'Add a basket',
        category: FeedbackCategory.SUGGESTION,
      };

      mockPrismaService.feedback.create.mockResolvedValue({
        ...mockFeedbackBase,
        ...createDto,
        priority: FeedbackPriority.LOW,
      });

      await service.createFeedback(userId, createDto);

      expect(mockPrismaService.feedback.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            priority: FeedbackPriority.LOW, // 核心断言：默认 LOW
          }),
        }),
      );
    });
  });

  // ========================================================
  // 2. getMyFeedbacks
  // ========================================================
  describe('getMyFeedbacks', () => {
    it('应该成功返回当前用户创建的所有反馈', async () => {
      const userId = 'user-1';
      mockPrismaService.feedback.findMany.mockResolvedValue([mockFeedbackBase]);

      const result = await service.getMyFeedbacks(userId);

      expect(mockPrismaService.feedback.findMany).toHaveBeenCalledWith({
        where: { createdById: userId },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
      });
      expect(result.length).toBe(1);
    });
  });

  // ========================================================
  // 3. getFeedbackById
  // ========================================================
  describe('getFeedbackById', () => {
    it('【异常路径】如果找不到反馈，抛出 NotFoundException', async () => {
      mockPrismaService.feedback.findUnique.mockResolvedValue(null);

      await expect(
        service.getFeedbackById('wrong-id', 'user-1', Role.CUSTOMER),
      ).rejects.toThrow(NotFoundException);
    });

    it('【异常路径】如果用户既不是创建者也不是管理员，抛出 ForbiddenException', async () => {
      mockPrismaService.feedback.findUnique.mockResolvedValue({
        ...mockFeedbackBase,
        createdById: 'another-user', // 属于别人
      });

      await expect(
        service.getFeedbackById('fb-123', 'hacker', Role.CUSTOMER), // 作为普通用户访问
      ).rejects.toThrow(ForbiddenException);
    });

    it('【正常路径】如果用户是创建者本人，应该放行并返回反馈', async () => {
      mockPrismaService.feedback.findUnique.mockResolvedValue({
        ...mockFeedbackBase,
        createdById: 'user-1',
      });

      const result = await service.getFeedbackById('fb-123', 'user-1', Role.CUSTOMER);
      expect(result).toBeDefined();
    });

    it('【正常路径】如果用户是管理员（MANAGER），就算不是创建者也应该放行', async () => {
      mockPrismaService.feedback.findUnique.mockResolvedValue({
        ...mockFeedbackBase,
        createdById: 'another-user',
      });

      const result = await service.getFeedbackById('fb-123', 'admin', Role.MANAGER);
      expect(result).toBeDefined();
    });
  });

  // ========================================================
  // 4. updateFeedback (核心业务逻辑重灾区)
  // ========================================================
  describe('updateFeedback', () => {
    const feedbackId = 'fb-123';

    it('【异常路径】如果找不到反馈，抛出 NotFoundException', async () => {
      mockPrismaService.feedback.findUnique.mockResolvedValue(null);

      await expect(
        service.updateFeedback(feedbackId, {}, 'admin', Role.MANAGER),
      ).rejects.toThrow(NotFoundException);
    });

    it('【异常路径】如果不是管理员尝试更新，抛出 ForbiddenException', async () => {
      mockPrismaService.feedback.findUnique.mockResolvedValue(mockFeedbackBase);

      await expect(
        service.updateFeedback(feedbackId, {}, 'user', Role.CUSTOMER),
      ).rejects.toThrow(ForbiddenException);
    });

    it('【业务逻辑】如果标记为 NATURAL (自然损坏)，resolutionCost 应该强制设为 0', async () => {
      mockPrismaService.feedback.findUnique.mockResolvedValue(mockFeedbackBase);
      mockPrismaService.feedback.update.mockResolvedValue(mockFeedbackBase);

      await service.updateFeedback(
        feedbackId,
        { damageType: 'NATURAL' as any },
        'admin',
        Role.MANAGER,
      );

      expect(mockPrismaService.feedback.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            damageType: 'NATURAL',
            resolutionCost: 0, // 断言：核心业务规则生效
          }),
        }),
      );
    });

    it('【业务逻辑】如果标记为 INTENTIONAL 且原来不是 CHARGEABLE，应该自动变更为 CHARGEABLE 状态', async () => {
      mockPrismaService.feedback.findUnique.mockResolvedValue({
        ...mockFeedbackBase,
        status: FeedbackStatus.PENDING,
      });
      mockPrismaService.feedback.update.mockResolvedValue(mockFeedbackBase);

      await service.updateFeedback(
        feedbackId,
        { damageType: 'INTENTIONAL' as any, status: FeedbackStatus.RESOLVED }, // 即使传入 RESOLVED 也会被覆盖
        'admin',
        Role.MANAGER,
      );

      expect(mockPrismaService.feedback.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            damageType: 'INTENTIONAL',
            status: FeedbackStatus.CHARGEABLE, // 断言：核心业务规则生效
          }),
        }),
      );
    });
  });

  // ========================================================
  // 5. getAllFeedbacks
  // ========================================================
  describe('getAllFeedbacks', () => {
    it('【异常路径】如果不是管理员，抛出 ForbiddenException', async () => {
      await expect(
        service.getAllFeedbacks(Role.CUSTOMER),
      ).rejects.toThrow(ForbiddenException);
    });

    it('【正常路径】管理员查询，能够正确应用过滤参数', async () => {
      mockPrismaService.feedback.findMany.mockResolvedValue([mockFeedbackBase]);

      await service.getAllFeedbacks(Role.MANAGER, {
        status: FeedbackStatus.PENDING,
        priority: FeedbackPriority.HIGH,
      });

      expect(mockPrismaService.feedback.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            status: FeedbackStatus.PENDING,
            priority: FeedbackPriority.HIGH,
          },
        }),
      );
    });
  });

  // ========================================================
  // 6. getHighPriorityFeedbacks
  // ========================================================
  describe('getHighPriorityFeedbacks', () => {
    it('【异常路径】如果不是管理员，抛出 ForbiddenException', async () => {
      await expect(
        service.getHighPriorityFeedbacks(Role.CUSTOMER),
      ).rejects.toThrow(ForbiddenException);
    });

    it('【正常路径】管理员查询，应该查找 HIGH 和 URGENT 且未解决的反馈', async () => {
      mockPrismaService.feedback.findMany.mockResolvedValue([mockFeedbackBase]);

      await service.getHighPriorityFeedbacks(Role.MANAGER);

      expect(mockPrismaService.feedback.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              { priority: FeedbackPriority.HIGH },
              { priority: FeedbackPriority.URGENT },
            ],
            status: { not: FeedbackStatus.RESOLVED },
          },
        }),
      );
    });
  });

  // ========================================================
  // 7. getPendingCount
  // ========================================================
  describe('getPendingCount', () => {
    it('如果不是管理员，直接返回 0，不去查库', async () => {
      const result = await service.getPendingCount(Role.CUSTOMER);
      expect(result).toBe(0);
      expect(mockPrismaService.feedback.count).not.toHaveBeenCalled();
    });

    it('如果是管理员，正确调用 count 方法查询 PENDING 状态的数据', async () => {
      mockPrismaService.feedback.count.mockResolvedValue(5);

      const result = await service.getPendingCount(Role.MANAGER);

      expect(result).toBe(5);
      expect(mockPrismaService.feedback.count).toHaveBeenCalledWith({
        where: { status: FeedbackStatus.PENDING },
      });
    });
  });
});
