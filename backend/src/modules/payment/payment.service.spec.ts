import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from './payment.service';
import { PrismaService } from '../../prisma/prisma.service';
import { BookingStatus } from '@prisma/client';
import { BadRequestException } from '@nestjs/common';

describe('PaymentService', () => {
  let paymentService: PaymentService;
  let prismaService: PrismaService;

  // 1. 创建假的 PrismaService
  // 这里需要模拟 booking(订单) 和 payment(支付) 两个表
  const mockPrismaService = {
    booking: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    payment: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    paymentService = module.get<PaymentService>(PaymentService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('模块应该被成功定义', () => {
    expect(paymentService).toBeDefined();
  });

  // ==========================================
  // 测试组 1: createPayment (创建支付)
  // ==========================================
  describe('createPayment', () => {
    const targetBookingId = 'booking-123';
    const paymentAmount = 15.0;

    it('【异常路径】如果 booking 不存在，应该抛出 Booking not found 错误', async () => {
      // 模拟第一步：查无此订单
      mockPrismaService.booking.findUnique.mockResolvedValue(null);

      await expect(
        paymentService.createPayment(targetBookingId, paymentAmount),
      ).rejects.toThrow(new BadRequestException('Booking not found'));

      // 确保后续的创建和更新操作绝不会被执行
      expect(mockPrismaService.payment.create).not.toHaveBeenCalled();
      expect(mockPrismaService.booking.update).not.toHaveBeenCalled();
    });

    it('【异常路径】如果 booking 状态不是 PENDING_PAYMENT，应该抛出 Booking cannot be paid', async () => {
      // 模拟第一步：订单存在，但是状态是 CANCELLED (或者已经是 CONFIRMED)
      mockPrismaService.booking.findUnique.mockResolvedValue({
        id: targetBookingId,
        status: BookingStatus.CANCELLED,
      });

      await expect(
        paymentService.createPayment(targetBookingId, paymentAmount),
      ).rejects.toThrow(new BadRequestException('Booking cannot be paid'));

      // 同样，确保护城河生效，不能进行扣款
      expect(mockPrismaService.payment.create).not.toHaveBeenCalled();
    });

    it('【正常路径】应该成功创建支付记录，并将订单状态更新为 CONFIRMED', async () => {
      // 模拟第一步：订单存在，且状态正确
      mockPrismaService.booking.findUnique.mockResolvedValue({
        id: targetBookingId,
        status: BookingStatus.PENDING_PAYMENT,
      });

      // 模拟第三步：成功生成支付流水账
      const mockCreatedPayment = {
        id: 'payment-001',
        bookingId: targetBookingId,
        amount: paymentAmount,
        status: 'SUCCESS',
      };
      mockPrismaService.payment.create.mockResolvedValue(mockCreatedPayment);

      // 模拟最后一步：订单状态更新成功
      mockPrismaService.booking.update.mockResolvedValue({
        id: targetBookingId,
        status: BookingStatus.CONFIRMED,
      });

      // 执行测试操作
      const result = await paymentService.createPayment(
        targetBookingId,
        paymentAmount,
      );

      // 断言 1: 验证是否正确检查了订单
      expect(mockPrismaService.booking.findUnique).toHaveBeenCalledWith({
        where: { id: targetBookingId },
      });

      // 断言 2: 验证是否正确创建了支付记录
      expect(mockPrismaService.payment.create).toHaveBeenCalledWith({
        data: {
          bookingId: targetBookingId,
          amount: paymentAmount,
          status: 'SUCCESS',
        },
      });

      // 断言 3: 验证是否将订单状态改为了 CONFIRMED
      expect(mockPrismaService.booking.update).toHaveBeenCalledWith({
        where: { id: targetBookingId },
        data: { status: BookingStatus.CONFIRMED },
      });

      // 断言 4: 返回值应该是刚才生成的支付流水
      expect(result).toEqual(mockCreatedPayment);
    });
  });

  // ==========================================
  // 测试组 2: getPaymentByBooking
  // ==========================================
  describe('getPaymentByBooking', () => {
    it('应该根据 bookingId 成功返回支付详情，并包含对应的订单信息', async () => {
      const targetBookingId = 'booking-123';
      const mockPaymentDetail = {
        id: 'payment-001',
        bookingId: targetBookingId,
        amount: 50,
        status: 'SUCCESS',
        booking: { id: targetBookingId, status: BookingStatus.CONFIRMED },
      };

      mockPrismaService.payment.findUnique.mockResolvedValue(mockPaymentDetail);

      const result = await paymentService.getPaymentByBooking(targetBookingId);

      expect(mockPrismaService.payment.findUnique).toHaveBeenCalledWith({
        where: { bookingId: targetBookingId },
        include: { booking: true },
      });
      expect(result).toEqual(mockPaymentDetail);
    });
  });
});
