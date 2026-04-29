import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { BookingStatus, HireType, Role, ScooterStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { DiscountService } from './discount.service';
import { EmailService } from './email.service';
import { PricingConfigService } from '../config/pricing-config.service';
import { BookingService } from './booking.service';

const createUser = (
  overrides: Partial<{
    id: string;
    email: string;
    role: Role;
  }> = {},
) => ({
  id: 'user-1',
  email: 'user@example.com',
  role: Role.CUSTOMER,
  ...overrides,
});

const createScooter = (
  overrides: Partial<{
    id: string;
    status: ScooterStatus;
    location: string;
  }> = {},
) => ({
  id: 'scooter-1',
  status: ScooterStatus.AVAILABLE,
  location: 'Main Street',
  ...overrides,
});

const createBookingRecord = (
  overrides: Partial<{
    id: string;
    userId: string;
    scooterId: string;
    hireType: HireType;
    startTime: Date;
    endTime: Date;
    originalEndTime: Date;
    totalCost: number;
    status: BookingStatus;
    extensionCount: number;
    user: ReturnType<typeof createUser>;
    scooter: ReturnType<typeof createScooter>;
  }> = {},
) => {
  const startTime = overrides.startTime ?? new Date('2026-04-01T10:00:00Z');
  const endTime = overrides.endTime ?? new Date('2026-04-01T11:00:00Z');

  return {
    id: 'booking-1',
    userId: 'user-1',
    scooterId: 'scooter-1',
    hireType: HireType.HOUR_1,
    startTime,
    endTime,
    originalEndTime: endTime,
    totalCost: 5,
    status: BookingStatus.CONFIRMED,
    extensionCount: 0,
    user: createUser(),
    scooter: createScooter(),
    ...overrides,
  };
};

describe('BookingService', () => {
  let service: BookingService;

  const mockEmailService = {
    sendBookingConfirmation: jest.fn(),
    sendExtensionConfirmation: jest.fn(),
    sendReturnConfirmation: jest.fn(),
  };

  const mockDiscountService = {
    calculateDiscountedPrice: jest.fn(),
    updateUserType: jest.fn(),
    getUserDiscountInfo: jest.fn(),
  };

  const mockPrismaService = {
    booking: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn().mockResolvedValue(0),
    },
    scooter: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    payment: {
      create: jest.fn(),
    },
    feedback: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: DiscountService,
          useValue: mockDiscountService,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
        {
          provide: PricingConfigService,
          useValue: {
            getCost: jest.fn().mockImplementation((hireType: string) => {
              switch (hireType) {
                case 'HOUR_1': return 5;
                case 'HOUR_4': return 15;
                case 'DAY_1': return 30;
                case 'WEEK_1': return 90;
                default: return 0;
              }
            }),
          },
        },
      ],
    }).compile();

    service = module.get<BookingService>(BookingService);
    jest.clearAllMocks();

    mockPrismaService.$transaction.mockImplementation(
      (callback: (tx: typeof mockPrismaService) => Promise<unknown>) =>
        callback(mockPrismaService),
    );

    mockDiscountService.calculateDiscountedPrice.mockResolvedValue({
      discountedPrice: 5,
      discountAmount: 0,
      discountReason: 'No discount',
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('loads all bookings with user and scooter relations in paginated format', async () => {
      const bookings = [createBookingRecord()];
      mockPrismaService.booking.findMany.mockResolvedValue(bookings);
      mockPrismaService.booking.count.mockResolvedValue(1);

      const result = await service.findAll();
      expect(result.items).toEqual(bookings);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    it('filters bookings by user id for non-manager callers', async () => {
      const bookings = [createBookingRecord({ userId: 'user-1' })];
      mockPrismaService.booking.findMany.mockResolvedValue(bookings);
      mockPrismaService.booking.count.mockResolvedValue(1);

      const result = await service.findAll('user-1', Role.CUSTOMER);
      expect(result.items).toEqual(bookings);
    });

    it('does not filter bookings for manager callers', async () => {
      const bookings = [createBookingRecord({ userId: 'someone-else' })];
      mockPrismaService.booking.findMany.mockResolvedValue(bookings);
      mockPrismaService.booking.count.mockResolvedValue(1);

      const result = await service.findAll('manager-1', Role.MANAGER);
      expect(result.items).toEqual(bookings);
    });
  });

  describe('findById', () => {
    it('loads a booking with user, scooter, and payment relations', async () => {
      const booking = createBookingRecord();
      mockPrismaService.booking.findUnique.mockResolvedValue(booking);

      await expect(service.findById('booking-1')).resolves.toEqual(booking);
      expect(mockPrismaService.booking.findUnique).toHaveBeenCalledWith({
        where: { id: 'booking-1' },
        include: { user: true, scooter: true, payment: true },
      });
    });

    it('throws when a non-manager tries to access another user booking', async () => {
      const booking = createBookingRecord({ userId: 'user-1' });
      mockPrismaService.booking.findUnique.mockResolvedValue(booking);

      await expect(
        service.findById('booking-1', 'user-2', Role.CUSTOMER),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('createBooking', () => {
    const startTime = new Date('2026-04-01T10:00:00Z');

    it('throws when the scooter does not exist', async () => {
      mockPrismaService.scooter.findUnique.mockResolvedValue(null);

      await expect(
        service.createBooking(
          'user-1',
          'scooter-1',
          HireType.HOUR_1,
          startTime,
        ),
      ).rejects.toThrow(new BadRequestException('Scooter not found'));
    });

    it('throws when the scooter is unavailable', async () => {
      mockPrismaService.scooter.findUnique.mockResolvedValue(
        createScooter({ status: ScooterStatus.RENTED }),
      );

      await expect(
        service.createBooking(
          'user-1',
          'scooter-1',
          HireType.HOUR_1,
          startTime,
        ),
      ).rejects.toThrow(new BadRequestException('Scooter not available'));
    });

    it('creates a booking, updates the scooter, and sends a confirmation email', async () => {
      const scooter = createScooter();
      const expectedEndTime = new Date(startTime.getTime());
      expectedEndTime.setHours(expectedEndTime.getHours() + 4);
      const createdBooking = createBookingRecord({
        status: BookingStatus.PENDING_PAYMENT,
        totalCost: 12,
      });
      mockPrismaService.scooter.findUnique.mockResolvedValue(scooter);
      mockPrismaService.booking.create.mockResolvedValue(createdBooking);
      mockDiscountService.calculateDiscountedPrice.mockResolvedValue({
        discountedPrice: 12,
        discountAmount: 3,
        discountReason: 'Student discount',
      });

      await expect(
        service.createBooking(
          'user-1',
          'scooter-1',
          HireType.HOUR_4,
          startTime,
        ),
      ).resolves.toEqual(createdBooking);

      expect(mockDiscountService.calculateDiscountedPrice).toHaveBeenCalledWith(
        'user-1',
        15,
        HireType.HOUR_4,
      );
      expect(mockPrismaService.booking.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          scooterId: 'scooter-1',
          hireType: HireType.HOUR_4,
          startTime,
          endTime: expectedEndTime,
          totalCost: 12,
          status: BookingStatus.PENDING_PAYMENT,
          originalEndTime: expectedEndTime,
        },
        include: {
          user: true,
          scooter: true,
        },
      });
      expect(mockPrismaService.scooter.update).toHaveBeenCalledWith({
        where: { id: 'scooter-1' },
        data: { status: ScooterStatus.RENTED },
      });
      expect(mockEmailService.sendBookingConfirmation).toHaveBeenCalledWith(
        createdBooking,
        12,
      );
    });

    it('returns the booking even when the confirmation email fails', async () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();
      const createdBooking = createBookingRecord({
        status: BookingStatus.PENDING_PAYMENT,
      });

      mockPrismaService.scooter.findUnique.mockResolvedValue(createScooter());
      mockPrismaService.booking.create.mockResolvedValue(createdBooking);
      mockEmailService.sendBookingConfirmation.mockRejectedValue(
        new Error('SMTP unavailable'),
      );

      await expect(
        service.createBooking(
          'user-1',
          'scooter-1',
          HireType.HOUR_1,
          startTime,
        ),
      ).resolves.toEqual(createdBooking);

      expect(errorSpy).toHaveBeenCalled();
      errorSpy.mockRestore();
    });

    it('throws for an unknown hire type', async () => {
      mockPrismaService.scooter.findUnique.mockResolvedValue(createScooter());
      await expect(
        service.createBooking(
          'user-1',
          'scooter-1',
          'UNKNOWN' as HireType,
          startTime,
        ),
      ).rejects.toThrow(new BadRequestException('Invalid hire type'));
      expect(mockPrismaService.booking.create).not.toHaveBeenCalled();
    });
  });

  describe('extendBooking', () => {
    it('throws when the booking does not exist', async () => {
      mockPrismaService.booking.findUnique.mockResolvedValue(null);

      await expect(service.extendBooking('booking-1', 2)).rejects.toThrow(
        new NotFoundException('Booking not found'),
      );
    });

    it('throws when a non-manager extends another user booking', async () => {
      mockPrismaService.booking.findUnique.mockResolvedValue(
        createBookingRecord({
          userId: 'user-1',
          status: BookingStatus.CONFIRMED,
        }),
      );

      await expect(
        service.extendBooking('booking-1', 2, 'user-2', Role.CUSTOMER),
      ).rejects.toThrow(ForbiddenException);
      expect(mockPrismaService.booking.update).not.toHaveBeenCalled();
    });

    it('throws when the booking status cannot be extended', async () => {
      mockPrismaService.booking.findUnique.mockResolvedValue(
        createBookingRecord({ status: BookingStatus.CANCELLED }),
      );

      await expect(service.extendBooking('booking-1', 2)).rejects.toThrow(
        new BadRequestException(
          'Only confirmed or extended bookings can be extended',
        ),
      );
    });

    it('extends the booking and sends an extension confirmation email', async () => {
      const existingBooking = createBookingRecord({
        endTime: new Date('2026-04-01T12:00:00Z'),
        totalCost: 10,
      });
      const updatedBooking = createBookingRecord({
        endTime: new Date('2026-04-01T14:00:00Z'),
        totalCost: 20,
        status: BookingStatus.EXTENDED,
        extensionCount: 1,
      });
      mockPrismaService.booking.findUnique.mockResolvedValue(existingBooking);
      mockPrismaService.booking.update.mockResolvedValue(updatedBooking);

      await expect(service.extendBooking('booking-1', 2)).resolves.toEqual(
        updatedBooking,
      );

      expect(mockPrismaService.booking.update).toHaveBeenCalledWith({
        where: { id: 'booking-1' },
        data: {
          endTime: new Date('2026-04-01T14:00:00.000Z'),
          totalCost: 20,
          status: BookingStatus.EXTENDED,
          extensionCount: 1,
        },
        include: {
          user: true,
          scooter: true,
        },
      });
      expect(mockEmailService.sendExtensionConfirmation).toHaveBeenCalledWith(
        updatedBooking,
        10,
        new Date('2026-04-01T14:00:00.000Z'),
      );
    });

    it('returns the updated booking even when the extension email fails', async () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();
      const existingBooking = createBookingRecord();
      const updatedBooking = createBookingRecord({
        status: BookingStatus.EXTENDED,
        endTime: new Date('2026-04-01T13:00:00Z'),
        totalCost: 10,
        extensionCount: 1,
      });
      mockPrismaService.booking.findUnique.mockResolvedValue(existingBooking);
      mockPrismaService.booking.update.mockResolvedValue(updatedBooking);
      mockEmailService.sendExtensionConfirmation.mockRejectedValue(
        new Error('SMTP unavailable'),
      );

      await expect(service.extendBooking('booking-1', 2)).resolves.toEqual(
        updatedBooking,
      );

      expect(errorSpy).toHaveBeenCalled();
      errorSpy.mockRestore();
    });
  });

  describe('cancelBooking', () => {
    it('marks the booking as cancelled', async () => {
      const cancelledBooking = createBookingRecord({
        status: BookingStatus.CANCELLED,
      });
      mockPrismaService.booking.update.mockResolvedValue(cancelledBooking);

      await expect(service.cancelBooking('booking-1')).resolves.toEqual(
        cancelledBooking,
      );
      expect(mockPrismaService.booking.update).toHaveBeenCalledWith({
        where: { id: 'booking-1' },
        data: { status: BookingStatus.CANCELLED },
        include: {
          user: true,
          scooter: true,
        },
      });
    });

    it('throws when a non-manager cancels another user booking', async () => {
      mockPrismaService.booking.findUnique.mockResolvedValue({
        userId: 'user-1',
      });

      await expect(
        service.cancelBooking('booking-1', 'user-2', Role.CUSTOMER),
      ).rejects.toThrow(ForbiddenException);
      expect(mockPrismaService.booking.update).not.toHaveBeenCalled();
    });
  });

  describe('completeBooking', () => {
    it('throws when the booking does not exist', async () => {
      mockPrismaService.booking.findUnique.mockResolvedValue(null);

      await expect(service.completeBooking('missing')).rejects.toThrow(
        new NotFoundException('Booking not found'),
      );
    });

    it('throws when a non-manager completes another user booking', async () => {
      mockPrismaService.booking.findUnique.mockResolvedValue(
        createBookingRecord({ userId: 'user-1' }),
      );

      await expect(
        service.completeBooking('booking-1', true, 'user-2', Role.CUSTOMER),
      ).rejects.toThrow(ForbiddenException);
      expect(mockPrismaService.$transaction).not.toHaveBeenCalled();
    });

    it('throws when trying to complete a cancelled booking', async () => {
      mockPrismaService.booking.findUnique.mockResolvedValue(
        createBookingRecord({ status: BookingStatus.CANCELLED }),
      );

      await expect(service.completeBooking('booking-1')).rejects.toThrow(
        new BadRequestException('Cannot complete a cancelled booking'),
      );
    });

    it('throws when trying to complete an already completed booking', async () => {
      mockPrismaService.booking.findUnique.mockResolvedValue(
        createBookingRecord({ status: BookingStatus.COMPLETED }),
      );

      await expect(service.completeBooking('booking-1')).rejects.toThrow(
        new BadRequestException('Booking is already completed'),
      );
    });

    it('completes the booking and returns the scooter to available status', async () => {
      const booking = createBookingRecord();
      const completedBooking = createBookingRecord({
        status: BookingStatus.COMPLETED,
      });
      mockPrismaService.booking.findUnique.mockResolvedValue(booking);
      mockPrismaService.booking.update.mockResolvedValue(completedBooking);

      await expect(service.completeBooking('booking-1', true)).resolves.toEqual(
        completedBooking,
      );

      expect(mockPrismaService.feedback.create).not.toHaveBeenCalled();
      expect(mockPrismaService.scooter.update).toHaveBeenCalledWith({
        where: { id: booking.scooterId },
        data: { status: ScooterStatus.AVAILABLE },
      });
      expect(mockEmailService.sendReturnConfirmation).toHaveBeenCalledWith(
        completedBooking,
        true,
      );
    });

    it('creates a damage feedback record when the scooter is not intact', async () => {
      const booking = createBookingRecord();
      const completedBooking = createBookingRecord({
        status: BookingStatus.COMPLETED,
      });
      mockPrismaService.booking.findUnique.mockResolvedValue(booking);
      mockPrismaService.booking.update.mockResolvedValue(completedBooking);
      mockPrismaService.feedback.create.mockResolvedValue({ id: 'feedback-1' });

      await expect(
        service.completeBooking('booking-1', false),
      ).resolves.toEqual(completedBooking);

      expect(mockPrismaService.feedback.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: 'Damage Report - Scooter Return',
          scooterId: booking.scooterId,
          bookingId: booking.id,
          createdById: booking.userId,
        }),
      });
      expect(mockEmailService.sendReturnConfirmation).toHaveBeenCalledWith(
        completedBooking,
        false,
      );
    });

    it('returns the completed booking even when the return email fails', async () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();
      const booking = createBookingRecord();
      const completedBooking = createBookingRecord({
        status: BookingStatus.COMPLETED,
      });
      mockPrismaService.booking.findUnique.mockResolvedValue(booking);
      mockPrismaService.booking.update.mockResolvedValue(completedBooking);
      mockEmailService.sendReturnConfirmation.mockRejectedValue(
        new Error('SMTP unavailable'),
      );

      await expect(service.completeBooking('booking-1')).resolves.toEqual(
        completedBooking,
      );

      expect(errorSpy).toHaveBeenCalled();
      errorSpy.mockRestore();
    });
  });

  describe('createBookingForCustomer', () => {
    const startTime = new Date('2026-04-02T10:00:00Z');
    const expectedEndTime = new Date('2026-04-02T14:00:00Z');

    it('rejects non-manager employees', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(
        createUser({ role: Role.CUSTOMER }),
      );

      await expect(
        service.createBookingForCustomer(
          'employee-1',
          'customer@example.com',
          'scooter-1',
          HireType.HOUR_1,
          startTime,
        ),
      ).rejects.toThrow(new BadRequestException('只有管理员可以进行代订操作'));
    });

    it('rejects missing employees', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.createBookingForCustomer(
          'employee-1',
          'customer@example.com',
          'scooter-1',
          HireType.HOUR_1,
          startTime,
        ),
      ).rejects.toThrow(new BadRequestException('只有管理员可以进行代订操作'));
    });

    it('throws when the scooter does not exist', async () => {
      mockPrismaService.user.findUnique
        .mockResolvedValueOnce(createUser({ role: Role.MANAGER }))
        .mockResolvedValueOnce(createUser({ email: 'customer@example.com' }));
      mockPrismaService.scooter.findUnique.mockResolvedValue(null);

      await expect(
        service.createBookingForCustomer(
          'employee-1',
          'customer@example.com',
          'scooter-1',
          HireType.HOUR_1,
          startTime,
        ),
      ).rejects.toThrow(new BadRequestException('滑板车不存在'));
    });

    it('throws when the scooter is unavailable', async () => {
      mockPrismaService.user.findUnique
        .mockResolvedValueOnce(createUser({ role: Role.MANAGER }))
        .mockResolvedValueOnce(createUser({ email: 'customer@example.com' }));
      mockPrismaService.scooter.findUnique.mockResolvedValue(
        createScooter({ status: ScooterStatus.RENTED }),
      );

      await expect(
        service.createBookingForCustomer(
          'employee-1',
          'customer@example.com',
          'scooter-1',
          HireType.HOUR_1,
          startTime,
        ),
      ).rejects.toThrow(new BadRequestException('滑板车当前不可用'));
    });

    it('creates a new customer, booking, and payment when the customer does not exist', async () => {
      const logSpy = jest.spyOn(console, 'log').mockImplementation();

      const manager = createUser({ id: 'employee-1', role: Role.MANAGER });
      const customer = createUser({
        id: 'customer-1',
        email: 'customer@example.com',
      });
      const booking = createBookingRecord({
        id: 'booking-2',
        userId: customer.id,
        user: customer,
        scooter: createScooter(),
        status: BookingStatus.CONFIRMED,
        totalCost: 12,
        startTime,
        endTime: expectedEndTime,
        originalEndTime: expectedEndTime,
        hireType: HireType.HOUR_4,
      });

      mockPrismaService.user.findUnique
        .mockResolvedValueOnce(manager)
        .mockResolvedValueOnce(null);
      mockPrismaService.user.create.mockResolvedValue(customer);
      mockPrismaService.scooter.findUnique.mockResolvedValue(createScooter());
      mockDiscountService.calculateDiscountedPrice.mockResolvedValue({
        discountedPrice: 12,
        discountAmount: 3,
        discountReason: 'Manual booking discount',
      });
      mockPrismaService.booking.create.mockResolvedValue(booking);
      mockPrismaService.payment.create.mockResolvedValue({ id: 'payment-1' });

      await expect(
        service.createBookingForCustomer(
          manager.id,
          customer.email,
          'scooter-1',
          HireType.HOUR_4,
          startTime,
        ),
      ).resolves.toEqual(booking);

      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: customer.email,
          passwordHash: expect.any(String),
          role: 'CUSTOMER',
        },
      });
      expect(mockPrismaService.booking.create).toHaveBeenCalledWith({
        data: {
          userId: customer.id,
          scooterId: 'scooter-1',
          hireType: HireType.HOUR_4,
          startTime,
          endTime: expectedEndTime,
          totalCost: 12,
          status: BookingStatus.CONFIRMED,
          originalEndTime: expectedEndTime,
        },
        include: {
          user: true,
          scooter: true,
        },
      });
      expect(mockPrismaService.payment.create).toHaveBeenCalledWith({
        data: {
          bookingId: booking.id,
          amount: 12,
          status: 'SUCCESS',
        },
      });
      expect(mockEmailService.sendBookingConfirmation).toHaveBeenCalledWith(
        booking,
        12,
      );
      expect(logSpy).toHaveBeenCalled();
      logSpy.mockRestore();
    });

    it('returns the booking for an existing customer even when the email fails', async () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();
      const manager = createUser({ id: 'employee-1', role: Role.MANAGER });
      const customer = createUser({
        id: 'customer-1',
        email: 'customer@example.com',
      });
      const booking = createBookingRecord({
        id: 'booking-2',
        userId: customer.id,
        user: customer,
        status: BookingStatus.CONFIRMED,
        startTime,
        endTime: new Date('2026-04-02T11:00:00Z'),
      });

      mockPrismaService.user.findUnique
        .mockResolvedValueOnce(manager)
        .mockResolvedValueOnce(customer);
      mockPrismaService.scooter.findUnique.mockResolvedValue(createScooter());
      mockPrismaService.booking.create.mockResolvedValue(booking);
      mockPrismaService.payment.create.mockResolvedValue({ id: 'payment-1' });
      mockEmailService.sendBookingConfirmation.mockRejectedValue(
        new Error('SMTP unavailable'),
      );

      await expect(
        service.createBookingForCustomer(
          manager.id,
          customer.email,
          'scooter-1',
          HireType.HOUR_1,
          startTime,
        ),
      ).resolves.toEqual(booking);

      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalled();
      errorSpy.mockRestore();
    });
  });
});
