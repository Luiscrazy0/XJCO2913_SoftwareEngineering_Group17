import { EmailService } from '../email/email.service';
import { Test, TestingModule } from '@nestjs/testing';
import { BookingService } from './booking.service';
import { PrismaService } from '../../prisma/prisma.service';
import { DiscountService } from './discount.service';
import { BookingStatus, HireType, ScooterStatus } from '@prisma/client';
import { BadRequestException } from '@nestjs/common';

describe('BookingService', () => {
  let bookingService: BookingService;
  let prismaService: PrismaService;

  const mockEmailService = {
    sendBookingConfirmation: jest.fn(),
    sendExtensionConfirmation: jest.fn(),
  };

  const mockDiscountService = {
    calculateDiscountedPrice: jest.fn(),
  };

  const mockPrismaService = {
    booking: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    scooter: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
        {
          provide: DiscountService,
          useValue: mockDiscountService,
        },
        BookingService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    bookingService = module.get<BookingService>(BookingService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
    mockPrismaService.$transaction.mockImplementation(
      async (fn: (tx: typeof mockPrismaService) => unknown) => {
        return fn(mockPrismaService);
      },
    );
    
    // 设置默认的折扣服务返回值
    mockDiscountService.calculateDiscountedPrice.mockResolvedValue({
      discountedPrice: 5,
      discountApplied: 0,
      discountType: null,
    });
  });

  it('模块应该被成功定义', () => {
    expect(bookingService).toBeDefined();
  });

  describe('findAll', () => {
    it('应该成功返回所有预订记录，并关联用户和滑板车信息', async () => {
      const mockBookings = [
        { id: 'booking-1', userId: 'user-1', scooterId: 'scooter-1' },
      ];
      mockPrismaService.booking.findMany.mockResolvedValue(mockBookings);

      const result = await bookingService.findAll();

      expect(mockPrismaService.booking.findMany).toHaveBeenCalledWith({
        include: { user: true, scooter: true },
      });
      expect(result).toEqual(mockBookings);
    });
  });

  describe('findById', () => {
    it('应该根据 ID 成功返回指定的预订记录', async () => {
      const targetId = 'booking-123';
      const mockBooking = { id: targetId, userId: 'user-1' };
      mockPrismaService.booking.findUnique.mockResolvedValue(mockBooking);

      const result = await bookingService.findById(targetId);

      expect(mockPrismaService.booking.findUnique).toHaveBeenCalledWith({
        where: { id: targetId },
        include: { user: true, scooter: true, payment: true },
      });
      expect(result).toEqual(mockBooking);
    });
  });

  describe('createBooking', () => {
    const userId = 'user-1';
    const scooterId = 'scooter-1';
    const startTime = new Date('2026-04-01T10:00:00Z');
    const endTime = new Date('2026-04-01T11:00:00Z');

    it('【异常路径】如果找不到指定的滑板车，应该抛出 Scooter not found 错误', async () => {
      mockPrismaService.scooter.findUnique.mockResolvedValue(null);

      await expect(
        bookingService.createBooking(
          userId,
          scooterId,
          HireType.HOUR_1,
          startTime,
          endTime,
        ),
      ).rejects.toThrow(new BadRequestException('Scooter not found'));
    });

    it('【异常路径】如果滑板车状态不是 AVAILABLE，应该抛出 Scooter not available 错误', async () => {
      mockPrismaService.scooter.findUnique.mockResolvedValue({
        id: scooterId,
        status: ScooterStatus.RENTED,
      });

      await expect(
        bookingService.createBooking(
          userId,
          scooterId,
          HireType.HOUR_1,
          startTime,
          endTime,
        ),
      ).rejects.toThrow(new BadRequestException('Scooter not available'));
    });

    it('【正常路径】应该成功创建预订，并正确计算 1 小时的费用 (5)', async () => {
      mockPrismaService.scooter.findUnique.mockResolvedValue({
        id: scooterId,
        status: ScooterStatus.AVAILABLE,
      });

      const mockCreatedBooking = { id: 'new-booking', totalCost: 5 };
      mockPrismaService.booking.create.mockResolvedValue(mockCreatedBooking);

      const result = await bookingService.createBooking(
        userId,
        scooterId,
        HireType.HOUR_1,
        startTime,
        endTime,
      );

      // 3. 验证是否以正确的参数写入数据库
      expect(mockPrismaService.booking.create).toHaveBeenCalledWith({
        data: {
          userId,
          scooterId,
          hireType: HireType.HOUR_1,
          startTime,
          endTime,
          totalCost: 5,
          status: BookingStatus.PENDING_PAYMENT,
          originalEndTime: endTime,
        },
        include: {
          scooter: true,
          user: true,
        },
      });
      expect(mockPrismaService.scooter.update).toHaveBeenCalledWith({
        where: { id: scooterId },
        data: { status: ScooterStatus.RENTED },
      });
      expect(result).toEqual(mockCreatedBooking);
    });

    it('【正常路径】应该成功创建预订，并正确计算 1 天的费用 (30)', async () => {
      mockPrismaService.scooter.findUnique.mockResolvedValue({
        id: scooterId,
        status: ScooterStatus.AVAILABLE,
      });
      mockDiscountService.calculateDiscountedPrice.mockResolvedValue({
        discountedPrice: 30,
        discountApplied: 0,
        discountType: null,
      });
      mockPrismaService.booking.create.mockResolvedValue({
        id: 'new-booking',
        totalCost: 30,
      });

      await bookingService.createBooking(
        userId,
        scooterId,
        HireType.DAY_1,
        startTime,
        endTime,
      );

      expect(mockPrismaService.booking.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ totalCost: 30 }),
        }),
      );
    });
  });

  describe('cancelBooking', () => {
    it('应该成功将预订状态更新为 CANCELLED，并返回包含 user 和 scooter 的信息', async () => {
      const targetId = 'booking-123';

      // 模拟返回的数据
      const mockCancelledBooking = {
        id: targetId,
        status: BookingStatus.CANCELLED,
        user: { id: 'user-1' },
        scooter: { id: 'scooter-1' },
      };
      mockPrismaService.booking.update.mockResolvedValue(mockCancelledBooking);

      const result = await bookingService.cancelBooking(targetId);

      // 🌟 修复关键：补齐了 include 参数，让 Jest 严格对账通过
      expect(mockPrismaService.booking.update).toHaveBeenCalledWith({
        where: { id: targetId },
        data: { status: BookingStatus.CANCELLED },
        include: {
          scooter: true,
          user: true,
        },
      });

      expect(result).toEqual(mockCancelledBooking);
    });
  });
});
