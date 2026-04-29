import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from './payment.service';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../booking/email.service';
import { BookingStatus, Role, ScooterStatus } from '@prisma/client';
import { BadRequestException, ForbiddenException } from '@nestjs/common';

describe('PaymentService', () => {
  let paymentService: PaymentService;

  const txPaymentCreateMock = jest.fn();
  const txBookingUpdateMock = jest.fn();
  const txScooterUpdateMock = jest.fn();
  const mockTx = {
    payment: { create: txPaymentCreateMock },
    booking: { update: txBookingUpdateMock },
    scooter: { update: txScooterUpdateMock },
  };
  const transactionMock = jest.fn(
    (cb: (tx: typeof mockTx) => Promise<unknown>) => cb(mockTx),
  );

  const mockPrismaService = {
    $transaction: transactionMock,
    booking: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    payment: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    scooter: {
      update: jest.fn(),
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
    const userId = 'user-1';

    it('【异常路径】如果 booking 不存在，应该抛出 Booking not found 错误', async () => {
      mockPrismaService.booking.findUnique.mockResolvedValue(null);

      await expect(
        paymentService.createPayment(targetBookingId, paymentAmount, userId),
      ).rejects.toThrow(new BadRequestException('Booking not found'));

      expect(transactionMock).not.toHaveBeenCalled();
    });

    it('【异常路径】如果用户尝试支付他人的预约，应该抛出 ForbiddenException', async () => {
      mockPrismaService.booking.findUnique.mockResolvedValue({
        id: targetBookingId,
        userId: 'different-user',
        status: BookingStatus.PENDING_PAYMENT,
        user: { id: 'different-user' },
      });

      await expect(
        paymentService.createPayment(targetBookingId, paymentAmount, userId),
      ).rejects.toThrow(
        new ForbiddenException('You can only pay for your own bookings'),
      );

      expect(transactionMock).not.toHaveBeenCalled();
    });

    it('【异常路径】如果 booking 状态不是 PENDING_PAYMENT，应该抛出 Booking cannot be paid', async () => {
      mockPrismaService.booking.findUnique.mockResolvedValue({
        id: targetBookingId,
        userId: userId,
        status: BookingStatus.CANCELLED,
        user: { id: userId },
      });

      await expect(
        paymentService.createPayment(targetBookingId, paymentAmount, userId),
      ).rejects.toThrow(new BadRequestException('Booking cannot be paid'));

      expect(transactionMock).not.toHaveBeenCalled();
    });

    it('【正常路径】应该成功创建支付记录，并将订单状态更新为 CONFIRMED', async () => {
      const scooterId = 'scooter-123';
      mockPrismaService.booking.findUnique.mockResolvedValue({
        id: targetBookingId,
        userId: userId,
        scooterId,
        status: BookingStatus.PENDING_PAYMENT,
        user: { id: userId, email: 'user@example.com' },
        scooter: { id: scooterId, stationId: 'station-1' },
      });

      const mockCreatedPayment = {
        id: 'payment-001',
        bookingId: targetBookingId,
        amount: paymentAmount,
        status: 'SUCCESS',
      };
      txPaymentCreateMock.mockResolvedValue(mockCreatedPayment);

      txBookingUpdateMock.mockResolvedValue({
        id: targetBookingId,
        status: BookingStatus.CONFIRMED,
      });

      txScooterUpdateMock.mockResolvedValue({ id: scooterId, status: ScooterStatus.RENTED });

      const result = await paymentService.createPayment(
        targetBookingId,
        paymentAmount,
        userId,
      );

      expect(mockPrismaService.booking.findUnique).toHaveBeenCalledWith({
        where: { id: targetBookingId },
        include: { user: true, scooter: true },
      });

      expect(transactionMock).toHaveBeenCalled();
      expect(txPaymentCreateMock).toHaveBeenCalledWith({
        data: {
          bookingId: targetBookingId,
          amount: paymentAmount,
          status: 'SUCCESS',
          idempotencyKey: null,
        },
      });

      expect(txBookingUpdateMock).toHaveBeenCalledWith({
        where: { id: targetBookingId },
        data: { status: BookingStatus.CONFIRMED, pickupStationId: 'station-1' },
        include: { scooter: true, user: true },
      });

      expect(txScooterUpdateMock).toHaveBeenCalledWith({
        where: { id: scooterId },
        data: { status: ScooterStatus.RENTED },
      });

      expect(result).toEqual(mockCreatedPayment);
    });

    it('returns the payment even if sending the receipt email fails', async () => {
      const scooterId = 'scooter-123';
      const mockCreatedPayment = {
        id: 'payment-001',
        bookingId: targetBookingId,
        amount: paymentAmount,
        status: 'SUCCESS',
      };

      mockPrismaService.booking.findUnique.mockResolvedValue({
        id: targetBookingId,
        userId: userId,
        scooterId,
        status: BookingStatus.PENDING_PAYMENT,
        user: { id: userId, email: 'user@example.com' },
        scooter: { id: scooterId, stationId: 'station-1' },
      });
      txPaymentCreateMock.mockResolvedValue(mockCreatedPayment);
      txBookingUpdateMock.mockResolvedValue({
        id: targetBookingId,
        status: BookingStatus.CONFIRMED,
      });
      txScooterUpdateMock.mockResolvedValue({ id: scooterId, status: ScooterStatus.RENTED });
      mockEmailService.sendPaymentReceipt.mockRejectedValue(
        new Error('SMTP failure'),
      );

      const result = await paymentService.createPayment(
        targetBookingId,
        paymentAmount,
        userId,
      );

      expect(mockEmailService.sendPaymentReceipt).toHaveBeenCalled();
      expect(result).toEqual(mockCreatedPayment);
    });
  });

  describe('getPaymentByBooking', () => {
    const userId = 'user-1';
    const bookingId = 'booking-123';

    it('应该根据 bookingId 成功返回支付详情，并包含对应的订单信息', async () => {
      const mockPaymentDetail = {
        id: 'payment-001',
        bookingId: bookingId,
        amount: 50,
        status: 'SUCCESS',
        booking: {
          id: bookingId,
          status: BookingStatus.CONFIRMED,
          userId: userId,
          user: { id: userId },
        },
      };

      mockPrismaService.payment.findUnique.mockResolvedValue(mockPaymentDetail);
      mockPrismaService.user.findUnique.mockResolvedValue({
        role: Role.CUSTOMER,
      });

      const result = await paymentService.getPaymentByBooking(
        bookingId,
        userId,
      );

      expect(mockPrismaService.payment.findUnique).toHaveBeenCalledWith({
        where: { bookingId: bookingId },
        include: {
          booking: {
            include: {
              user: true,
            },
          },
        },
      });
      expect(result).toEqual(mockPaymentDetail);
    });

    it('如果支付不存在，应该返回 null', async () => {
      mockPrismaService.payment.findUnique.mockResolvedValue(null);

      const result = await paymentService.getPaymentByBooking(
        bookingId,
        userId,
      );

      expect(result).toBeNull();
    });

    it('如果普通用户尝试查看他人的支付，应该抛出 ForbiddenException', async () => {
      const mockPaymentDetail = {
        id: 'payment-001',
        bookingId: bookingId,
        amount: 50,
        status: 'SUCCESS',
        booking: {
          id: bookingId,
          status: BookingStatus.CONFIRMED,
          userId: 'different-user',
          user: { id: 'different-user' },
        },
      };

      mockPrismaService.payment.findUnique.mockResolvedValue(mockPaymentDetail);
      mockPrismaService.user.findUnique.mockResolvedValue({
        role: Role.CUSTOMER,
      });

      await expect(
        paymentService.getPaymentByBooking(bookingId, userId),
      ).rejects.toThrow(
        new ForbiddenException(
          'You can only view payments for your own bookings',
        ),
      );
    });

    it('管理员可以查看任何用户的支付', async () => {
      const mockPaymentDetail = {
        id: 'payment-001',
        bookingId: bookingId,
        amount: 50,
        status: 'SUCCESS',
        booking: {
          id: bookingId,
          status: BookingStatus.CONFIRMED,
          userId: 'different-user',
          user: { id: 'different-user' },
        },
      };

      mockPrismaService.payment.findUnique.mockResolvedValue(mockPaymentDetail);
      mockPrismaService.user.findUnique.mockResolvedValue({
        role: Role.MANAGER,
      });

      const result = await paymentService.getPaymentByBooking(
        bookingId,
        'manager-user',
      );

      expect(result).toEqual(mockPaymentDetail);
    });
  });
});
