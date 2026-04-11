import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from './payment.service';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../booking/email.service';
import { BookingStatus } from '@prisma/client';
import { BadRequestException } from '@nestjs/common';
// 🌟 终极修复：完美对齐真实代码里的路径！
import { EmailService } from '../booking/email.service'; 

describe('PaymentService', () => {
  let paymentService: PaymentService;

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

  const mockEmailService = {
    sendPaymentReceipt: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
      ],
    }).compile();

    paymentService = module.get<PaymentService>(PaymentService);

    jest.clearAllMocks();
  });

  it('模块应该被成功定义', () => {
    expect(paymentService).toBeDefined();
  });

  describe('createPayment', () => {
    const targetBookingId = 'booking-123';
    const paymentAmount = 15.0;

    it('【异常路径】如果 booking 不存在，应该抛出 Booking not found 错误', async () => {
      mockPrismaService.booking.findUnique.mockResolvedValue(null);

      await expect(
        paymentService.createPayment(targetBookingId, paymentAmount),
      ).rejects.toThrow(new BadRequestException('Booking not found'));

      expect(mockPrismaService.payment.create).not.toHaveBeenCalled();
      expect(mockPrismaService.booking.update).not.toHaveBeenCalled();
    });

    it('【异常路径】如果 booking 状态不是 PENDING_PAYMENT，应该抛出 Booking cannot be paid', async () => {
      mockPrismaService.booking.findUnique.mockResolvedValue({
        id: targetBookingId,
        status: BookingStatus.CANCELLED,
      });

      await expect(
        paymentService.createPayment(targetBookingId, paymentAmount),
      ).rejects.toThrow(new BadRequestException('Booking cannot be paid'));

      expect(mockPrismaService.payment.create).not.toHaveBeenCalled();
    });

    it('【正常路径】应该成功创建支付记录，并将订单状态更新为 CONFIRMED', async () => {
      mockPrismaService.booking.findUnique.mockResolvedValue({
        id: targetBookingId,
        status: BookingStatus.PENDING_PAYMENT,
      });

      const mockCreatedPayment = {
        id: 'payment-001',
        bookingId: targetBookingId,
        amount: paymentAmount,
        status: 'SUCCESS',
      };
      mockPrismaService.payment.create.mockResolvedValue(mockCreatedPayment);

      mockPrismaService.booking.update.mockResolvedValue({
        id: targetBookingId,
        status: BookingStatus.CONFIRMED,
      });

      const result = await paymentService.createPayment(
        targetBookingId,
        paymentAmount,
      );

      expect(mockPrismaService.booking.findUnique).toHaveBeenCalledWith({
        where: { id: targetBookingId },
      });

      expect(mockPrismaService.payment.create).toHaveBeenCalledWith({
        data: {
          bookingId: targetBookingId,
          amount: paymentAmount,
          status: 'SUCCESS',
        },
      });

      expect(mockPrismaService.booking.update).toHaveBeenCalledWith({
        where: { id: targetBookingId },
        data: { status: BookingStatus.CONFIRMED },
      });

      expect(result).toEqual(mockCreatedPayment);
    });
  });

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
