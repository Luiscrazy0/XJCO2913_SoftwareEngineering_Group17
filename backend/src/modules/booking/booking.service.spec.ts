import { EmailService } from "../email/email.service";
import { Test, TestingModule } from '@nestjs/testing';
import { BookingService } from './booking.service';
import { PrismaService } from '../../prisma/prisma.service';
import { BookingStatus, HireType, ScooterStatus } from '@prisma/client';
import { BadRequestException, NotFoundException } from '@nestjs/common'; // 🌟 补上了 NotFoundException

describe('BookingService', () => {
  let bookingService: BookingService;
  let emailService: EmailService;
  let prismaService: PrismaService;

  const mockEmailService = {
    sendBookingConfirmation: jest.fn(),
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
        BookingService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    bookingService = module.get<BookingService>(BookingService);
    emailService = module.get<EmailService>(EmailService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
    mockPrismaService.$transaction.mockImplementation(
      async (fn: (tx: typeof mockPrismaService) => unknown) => {
        return fn(mockPrismaService);
      },
    );
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

    // 🌟 补齐所有费用计算分支 (HOUR_4, WEEK_1, default)
    it('【正常路径】应该正确计算 4 小时的费用 (15)', async () => {
      mockPrismaService.scooter.findUnique.mockResolvedValue({
        id: scooterId,
        status: ScooterStatus.AVAILABLE,
      });
      mockPrismaService.booking.create.mockResolvedValue({ id: 'new-booking' });
      await bookingService.createBooking(
        userId,
        scooterId,
        HireType.HOUR_4,
        startTime,
        endTime,
      );
      expect(mockPrismaService.booking.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ totalCost: 15 }),
        }),
      );
    });

    it('【正常路径】应该正确计算 1 天的费用 (40)', async () => {
      mockPrismaService.scooter.findUnique.mockResolvedValue({
        id: scooterId,
        status: ScooterStatus.AVAILABLE,
      });
      mockPrismaService.booking.create.mockResolvedValue({ id: 'new-booking' });
      await bookingService.createBooking(
        userId,
        scooterId,
        HireType.DAY_1,
        startTime,
        endTime,
      );
      expect(mockPrismaService.booking.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ totalCost: 40 }),
        }),
      );
    });

    it('【正常路径】应该正确计算 1 周的费用 (200)', async () => {
      mockPrismaService.scooter.findUnique.mockResolvedValue({
        id: scooterId,
        status: ScooterStatus.AVAILABLE,
      });
      mockPrismaService.booking.create.mockResolvedValue({ id: 'new-booking' });
      await bookingService.createBooking(
        userId,
        scooterId,
        HireType.WEEK_1,
        startTime,
        endTime,
      );
      expect(mockPrismaService.booking.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ totalCost: 200 }),
        }),
      );
    });

    it('【异常边界】未知的租赁类型应该返回费用 0', async () => {
      mockPrismaService.scooter.findUnique.mockResolvedValue({
        id: scooterId,
        status: ScooterStatus.AVAILABLE,
      });
      mockPrismaService.booking.create.mockResolvedValue({ id: 'new-booking' });
      // 强行传入未知的枚举类型测试 default 分支
      await bookingService.createBooking(
        userId,
        scooterId,
        'UNKNOWN_TYPE' as HireType,
        startTime,
        endTime,
      );
      expect(mockPrismaService.booking.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ totalCost: 0 }),
        }),
      );
    });
  });

  // 🌟 核心增补：全面覆盖续租 (extendBooking) 逻辑
  // ==========================================
  describe('extendBooking', () => {
    const bookingId = 'booking-123';
    const additionalHours = 2; // 续租 2 小时

    it('【异常路径】如果找不到预订记录，应该抛出 NotFoundException', async () => {
      mockPrismaService.booking.findUnique.mockResolvedValue(null);
      await expect(
        bookingService.extendBooking(bookingId, additionalHours),
      ).rejects.toThrow(new NotFoundException('Booking not found'));
    });

    it('【异常路径】如果预订状态不是确认或已续租状态，应该抛出 BadRequestException', async () => {
      mockPrismaService.booking.findUnique.mockResolvedValue({
        id: bookingId,
        status: BookingStatus.CANCELLED, // 取消状态不能续租
      });
      await expect(
        bookingService.extendBooking(bookingId, additionalHours),
      ).rejects.toThrow(
        new BadRequestException(
          'Only confirmed or extended bookings can be extended',
        ),
      );
    });

    it('【正常路径】应该成功续租，并正确计算新时间和费用', async () => {
      // 初始数据：假设已经借了，原本下午 2 点还，花过 10 块钱
      const initialEndTime = new Date('2026-04-01T14:00:00Z');
      const mockExistingBooking = {
        id: bookingId,
        status: BookingStatus.CONFIRMED,
        endTime: initialEndTime,
        totalCost: 10,
        extensionCount: 0,
      };

      mockPrismaService.booking.findUnique.mockResolvedValue(
        mockExistingBooking,
      );
      mockPrismaService.booking.update.mockResolvedValue({
        id: bookingId,
        status: BookingStatus.EXTENDED,
      });

      await bookingService.extendBooking(bookingId, additionalHours);

      // 计算预期的新时间：加 2 个小时 (2 * 60 * 60 * 1000 毫秒)
      const expectedNewEndTime = new Date(
        initialEndTime.getTime() + additionalHours * 60 * 60 * 1000,
      );
      const expectedNewCost = 10 + 2 * 5; // 原本的 10 + 续租 2 小时*5元

      expect(mockPrismaService.booking.update).toHaveBeenCalledWith({
        where: { id: bookingId },
        data: {
          endTime: expectedNewEndTime,
          totalCost: expectedNewCost,
          status: BookingStatus.EXTENDED,
          extensionCount: 1, // 续租次数加 1
        },
        include: {
          user: true,
          scooter: true,
        },
      });
    });
  });

  describe('cancelBooking', () => {
    it('应该成功将预订状态更新为 CANCELLED，并返回包含 user 和 scooter 的信息', async () => {
      const targetId = 'booking-123';

      const mockCancelledBooking = {
        id: targetId,
        status: BookingStatus.CANCELLED,
        user: { id: 'user-1' },
        scooter: { id: 'scooter-1' },
      };
      mockPrismaService.booking.update.mockResolvedValue(mockCancelledBooking);

      const result = await bookingService.cancelBooking(targetId);

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
