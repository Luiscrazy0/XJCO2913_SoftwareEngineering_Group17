import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { BookingStatus, HireType, Role } from '@prisma/client';
import { validate } from 'class-validator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { ExtendBookingDto } from './dto/extend-booking.dto';
import { PaymentCardService } from './payment-card.service';

describe('BookingController', () => {
  let controller: BookingController;

  const mockBookingService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    createBooking: jest.fn(),
    extendBooking: jest.fn(),
    cancelBooking: jest.fn(),
    completeBooking: jest.fn(),
    createBookingForCustomer: jest.fn(),
    estimatePrice: jest.fn(),
    startRide: jest.fn(),
    endRide: jest.fn(),
  };

  const mockPaymentCardService = {
    savePaymentCard: jest.fn(),
    getPaymentCard: jest.fn(),
    deletePaymentCard: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingController],
      providers: [
        {
          provide: BookingService,
          useValue: mockBookingService,
        },
        {
          provide: PaymentCardService,
          useValue: mockPaymentCardService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<BookingController>(BookingController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('DTO validation', () => {
    it('accepts a valid CreateBookingDto', async () => {
      const dto = new CreateBookingDto();
      dto.scooterId = '3c08fcf4-5607-480c-b8a7-85cc674f51a7';
      dto.hireType = HireType.HOUR_1;
      dto.startTime = '2026-04-12T10:00:00.000Z';

      expect(await validate(dto)).toHaveLength(0);
    });

    it('rejects a non-UUID scooter id', async () => {
      const dto = new CreateBookingDto();
      dto.scooterId = 'scooter-1';
      dto.hireType = HireType.HOUR_1;
      dto.startTime = '2026-04-12T10:00:00.000Z';

      const [error] = await validate(dto);
      expect(error.property).toBe('scooterId');
      expect(error.constraints).toHaveProperty('isUuid');
    });

    it('rejects an invalid hire type', async () => {
      const dto = new CreateBookingDto();
      dto.scooterId = '3c08fcf4-5607-480c-b8a7-85cc674f51a7';
      dto.hireType = 'INVALID' as HireType;
      dto.startTime = '2026-04-12T10:00:00.000Z';

      const [error] = await validate(dto);
      expect(error.property).toBe('hireType');
      expect(error.constraints).toHaveProperty('isEnum');
    });

    it('rejects an invalid date string', async () => {
      const dto = new CreateBookingDto();
      dto.scooterId = '3c08fcf4-5607-480c-b8a7-85cc674f51a7';
      dto.hireType = HireType.HOUR_1;
      dto.startTime = 'not-a-date';

      const [error] = await validate(dto);
      expect(error.property).toBe('startTime');
      expect(error.constraints).toHaveProperty('isDateString');
    });

    it('accepts a valid ExtendBookingDto', async () => {
      const dto = new ExtendBookingDto();
      dto.additionalHours = 2;

      expect(await validate(dto)).toHaveLength(0);
    });

    it('rejects a non-number additionalHours value', async () => {
      const dto = new ExtendBookingDto();
      Object.assign(dto, { additionalHours: 'two' });

      const [error] = await validate(dto);
      expect(error.constraints).toHaveProperty('isNumber');
    });

    it('rejects non-positive additionalHours values', async () => {
      const zeroDto = new ExtendBookingDto();
      zeroDto.additionalHours = 0;

      const negativeDto = new ExtendBookingDto();
      negativeDto.additionalHours = -1;

      expect(await validate(zeroDto)).not.toHaveLength(0);
      expect(await validate(negativeDto)).not.toHaveLength(0);
    });
  });

  describe('controller methods', () => {
    it('findAll delegates to BookingService.findAll', async () => {
      const bookings = [{ id: 'booking-1' }];
      mockBookingService.findAll.mockResolvedValue(bookings);

      const req = { user: { id: 'user-1', role: Role.CUSTOMER } };
      await expect(controller.findAll(req as any)).resolves.toEqual(bookings);
      expect(mockBookingService.findAll).toHaveBeenCalledWith(
        req.user.id,
        req.user.role,
        NaN,
        NaN,
      );
    });

    it('findOne delegates to BookingService.findById', async () => {
      const booking = { id: 'booking-1' };
      mockBookingService.findById.mockResolvedValue(booking);

      const req = { user: { id: 'user-1', role: Role.CUSTOMER } };
      await expect(
        controller.findOne(req as any, 'booking-1'),
      ).resolves.toEqual(booking);
      expect(mockBookingService.findById).toHaveBeenCalledWith(
        'booking-1',
        req.user.id,
        req.user.role,
      );
    });

    it('findOne preserves the estimate-price static route when parameter routes are registered first', async () => {
      const result = { hireType: HireType.HOUR_4, discountedPrice: 12 };
      mockBookingService.estimatePrice.mockResolvedValue(result);

      const req = { user: { id: 'user-1', role: Role.CUSTOMER } };
      await expect(
        controller.findOne(req as any, 'estimate-price', HireType.HOUR_4),
      ).resolves.toEqual(result);
      expect(mockBookingService.estimatePrice).toHaveBeenCalledWith(
        req.user.id,
        HireType.HOUR_4,
      );
      expect(mockBookingService.findById).not.toHaveBeenCalled();
    });

    it('findOne preserves the payment-card static route when parameter routes are registered first', async () => {
      const result = { cardNumber: '**** **** **** 1111' };
      mockPaymentCardService.getPaymentCard.mockResolvedValue(result);

      const req = { user: { id: 'user-1', role: Role.CUSTOMER } };
      await expect(
        controller.findOne(req as any, 'payment-card'),
      ).resolves.toEqual(result);
      expect(mockPaymentCardService.getPaymentCard).toHaveBeenCalledWith(
        req.user.id,
      );
      expect(mockBookingService.findById).not.toHaveBeenCalled();
    });

    it('create delegates to BookingService.createBooking', async () => {
      const dto: CreateBookingDto = {
        scooterId: '3c08fcf4-5607-480c-b8a7-85cc674f51a7',
        hireType: HireType.HOUR_1,
        startTime: '2026-04-12T10:00:00.000Z',
      };
      const req = { user: { id: 'user-1', role: Role.CUSTOMER } };
      const booking = {
        id: 'booking-1',
        status: BookingStatus.PENDING_PAYMENT,
      };
      mockBookingService.createBooking.mockResolvedValue(booking);

      await expect(controller.create(req as any, dto)).resolves.toEqual(
        booking,
      );
      expect(mockBookingService.createBooking).toHaveBeenCalledWith(
        req.user.id,
        dto.scooterId,
        dto.hireType,
        new Date(dto.startTime),
      );
    });

    it('extend delegates to BookingService.extendBooking', async () => {
      const booking = { id: 'booking-1', status: BookingStatus.EXTENDED };
      mockBookingService.extendBooking.mockResolvedValue(booking);

      const req = { user: { id: 'user-1', role: Role.CUSTOMER } };
      await expect(
        controller.extend(req as any, 'booking-1', { additionalHours: 2 }),
      ).resolves.toEqual(booking);
      expect(mockBookingService.extendBooking).toHaveBeenCalledWith(
        'booking-1',
        2,
        req.user.id,
        req.user.role,
      );
    });

    it('cancel delegates to BookingService.cancelBooking', async () => {
      const booking = { id: 'booking-1', status: BookingStatus.CANCELLED };
      mockBookingService.cancelBooking.mockResolvedValue(booking);

      const req = { user: { id: 'user-1', role: Role.CUSTOMER } };
      await expect(controller.cancel(req as any, 'booking-1')).resolves.toEqual(
        booking,
      );
      expect(mockBookingService.cancelBooking).toHaveBeenCalledWith(
        'booking-1',
        req.user.id,
        req.user.role,
      );
    });

    it('complete delegates to BookingService.completeBooking', async () => {
      const booking = { id: 'booking-1', status: BookingStatus.COMPLETED };
      mockBookingService.completeBooking.mockResolvedValue(booking);

      const req = { user: { id: 'user-1', role: Role.CUSTOMER } };
      await expect(
        controller.complete(req as any, 'booking-1', {
          isScooterIntact: false,
        }),
      ).resolves.toEqual(booking);
      expect(mockBookingService.completeBooking).toHaveBeenCalledWith(
        'booking-1',
        false,
        req.user.id,
        req.user.role,
      );
    });

    it('estimatePrice delegates to BookingService.estimatePrice with the authenticated user', async () => {
      const result = {
        hireType: HireType.HOUR_4,
        baseCost: 15,
        discountedPrice: 12,
      };
      mockBookingService.estimatePrice.mockResolvedValue(result);

      const req = { user: { id: 'user-1', role: Role.CUSTOMER } };
      await expect(
        controller.estimatePrice(req as any, HireType.HOUR_4),
      ).resolves.toEqual(result);
      expect(mockBookingService.estimatePrice).toHaveBeenCalledWith(
        req.user.id,
        HireType.HOUR_4,
      );
    });

    it('startRide delegates to BookingService.startRide with the authenticated user', async () => {
      const booking = { id: 'booking-1', status: BookingStatus.IN_PROGRESS };
      mockBookingService.startRide.mockResolvedValue(booking);

      const req = { user: { id: 'user-1', role: Role.CUSTOMER } };
      await expect(
        controller.startRide(req as any, 'booking-1'),
      ).resolves.toEqual(booking);
      expect(mockBookingService.startRide).toHaveBeenCalledWith(
        'booking-1',
        req.user.id,
      );
    });

    it('endRide delegates return station and damage flag to BookingService.endRide', async () => {
      const result = {
        booking: { id: 'booking-1', status: BookingStatus.COMPLETED },
        damageReportCreated: true,
      };
      mockBookingService.endRide.mockResolvedValue(result);

      const req = { user: { id: 'user-1', role: Role.CUSTOMER } };
      await expect(
        controller.endRide(req as any, 'booking-1', {
          returnStationId: 'station-2',
          isScooterIntact: false,
        }),
      ).resolves.toEqual(result);
      expect(mockBookingService.endRide).toHaveBeenCalledWith(
        'booking-1',
        req.user.id,
        'station-2',
        false,
      );
    });

    it('endRide defaults isScooterIntact to true', async () => {
      const result = {
        booking: { id: 'booking-1', status: BookingStatus.COMPLETED },
        damageReportCreated: false,
      };
      mockBookingService.endRide.mockResolvedValue(result);

      const req = { user: { id: 'user-1', role: Role.CUSTOMER } };
      await expect(
        controller.endRide(req as any, 'booking-1', {
          returnStationId: 'station-2',
        }),
      ).resolves.toEqual(result);
      expect(mockBookingService.endRide).toHaveBeenCalledWith(
        'booking-1',
        req.user.id,
        'station-2',
        true,
      );
    });

    it('savePaymentCard uses the authenticated user id', async () => {
      const cardData = {
        cardNumber: '4111111111111111',
        cardExpiry: '12/30',
        cardHolder: 'Test User',
      };
      const result = { id: 'card-1' };
      mockPaymentCardService.savePaymentCard.mockResolvedValue(result);

      const req = { user: { id: 'user-1', role: Role.CUSTOMER } };
      await expect(
        controller.savePaymentCard(req as any, cardData),
      ).resolves.toEqual(result);
      expect(mockPaymentCardService.savePaymentCard).toHaveBeenCalledWith(
        req.user.id,
        cardData,
      );
    });

    it('getPaymentCard uses the authenticated user id', async () => {
      const result = { cardNumber: '**** **** **** 1111' };
      mockPaymentCardService.getPaymentCard.mockResolvedValue(result);

      const req = { user: { id: 'user-1', role: Role.CUSTOMER } };
      await expect(controller.getPaymentCard(req as any)).resolves.toEqual(
        result,
      );
      expect(mockPaymentCardService.getPaymentCard).toHaveBeenCalledWith(
        req.user.id,
      );
    });

    it('deletePaymentCard uses the authenticated user id', async () => {
      const result = { message: 'deleted' };
      mockPaymentCardService.deletePaymentCard.mockResolvedValue(result);

      const req = { user: { id: 'user-1', role: Role.CUSTOMER } };
      await expect(controller.deletePaymentCard(req as any)).resolves.toEqual(
        result,
      );
      expect(mockPaymentCardService.deletePaymentCard).toHaveBeenCalledWith(
        req.user.id,
      );
    });

    it('createStaffBooking delegates to BookingService.createBookingForCustomer', async () => {
      const bookingData = {
        customerEmail: 'customer@example.com',
        scooterId: 'scooter-1',
        hireType: HireType.HOUR_4,
        startTime: '2026-04-12T10:00:00.000Z',
      };
      const result = { id: 'booking-1' };
      mockBookingService.createBookingForCustomer.mockResolvedValue(result);

      const req = { user: { id: 'employee-1', role: Role.MANAGER } };
      await expect(
        controller.createStaffBooking(req as any, bookingData),
      ).resolves.toEqual(result);
      expect(mockBookingService.createBookingForCustomer).toHaveBeenCalledWith(
        req.user.id,
        bookingData.customerEmail,
        bookingData.scooterId,
        bookingData.hireType,
        new Date(bookingData.startTime),
      );
    });
  });

  it('propagates BookingService errors', async () => {
    const dto: CreateBookingDto = {
      scooterId: '3c08fcf4-5607-480c-b8a7-85cc674f51a7',
      hireType: HireType.HOUR_1,
      startTime: '2026-04-12T10:00:00.000Z',
    };
    const req = { user: { id: 'user-1', role: Role.CUSTOMER } };
    mockBookingService.createBooking.mockRejectedValue(
      new BadRequestException('Scooter not available'),
    );

    await expect(controller.create(req as any, dto)).rejects.toThrow(
      BadRequestException,
    );
    await expect(controller.create(req as any, dto)).rejects.toThrow(
      'Scooter not available',
    );
  });
});
