import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { Role, ScooterStatus } from '@prisma/client';
import type { PrismaService } from '../../prisma/prisma.service';
import { BookingService } from './booking.service';
import { EmployeeBookingService } from './employee-booking.service';

type UserRecord = {
  id: string;
  email?: string;
  role: Role;
};

type ScooterRecord = {
  id: string;
  status: ScooterStatus;
};

type EmployeeBookingRecord = {
  bookingId: string;
  employeeId: string;
  guestEmail: string;
  guestName: string;
};

type UserFindUniqueArgs = Parameters<PrismaService['user']['findUnique']>[0];
type UserCreateArgs = Parameters<PrismaService['user']['create']>[0];
type ScooterFindUniqueArgs = Parameters<
  PrismaService['scooter']['findUnique']
>[0];
type EmployeeBookingCreateArgs = Parameters<
  PrismaService['employeeBooking']['create']
>[0];
type EmployeeBookingFindManyArgs = Parameters<
  PrismaService['employeeBooking']['findMany']
>[0];

const userFindUniqueMock =
  jest.fn<(args: UserFindUniqueArgs) => Promise<UserRecord | null>>();
const userCreateMock = jest.fn<(args: UserCreateArgs) => Promise<UserRecord>>();
const scooterFindUniqueMock =
  jest.fn<(args: ScooterFindUniqueArgs) => Promise<ScooterRecord | null>>();
const employeeBookingCreateMock =
  jest.fn<
    (args: EmployeeBookingCreateArgs) => Promise<EmployeeBookingRecord>
  >();
const employeeBookingFindManyMock =
  jest.fn<
    (args?: EmployeeBookingFindManyArgs) => Promise<EmployeeBookingRecord[]>
  >();

const mockPrismaService = {
  user: {
    findUnique: userFindUniqueMock,
    create: userCreateMock,
  },
  scooter: {
    findUnique: scooterFindUniqueMock,
  },
  employeeBooking: {
    create: employeeBookingCreateMock,
    findMany: employeeBookingFindManyMock,
  },
} as unknown as PrismaService;

type BookingServiceMock = Pick<BookingService, 'createBooking'>;

const mockBookingService: jest.Mocked<BookingServiceMock> = {
  createBooking: jest.fn(),
};

describe('EmployeeBookingService', () => {
  let service: EmployeeBookingService;

  beforeEach(() => {
    service = new EmployeeBookingService(
      mockPrismaService,
      mockBookingService as unknown as BookingService,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('rejects non-manager employees', async () => {
    userFindUniqueMock.mockResolvedValue({
      id: 'employee-1',
      role: Role.CUSTOMER,
    });

    await expect(
      service.createBookingForGuest(
        'employee-1',
        'guest@example.com',
        'Guest User',
        'scooter-1',
        'DAY_1',
        new Date('2026-04-16T09:00:00.000Z'),
        new Date('2026-04-17T09:00:00.000Z'),
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it('rejects missing employees', async () => {
    userFindUniqueMock.mockResolvedValue(null);

    await expect(
      service.createBookingForGuest(
        'employee-1',
        'guest@example.com',
        'Guest User',
        'scooter-1',
        'DAY_1',
        new Date('2026-04-16T09:00:00.000Z'),
        new Date('2026-04-17T09:00:00.000Z'),
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it('rejects missing scooters', async () => {
    userFindUniqueMock.mockResolvedValue({
      id: 'employee-1',
      role: Role.MANAGER,
    });
    scooterFindUniqueMock.mockResolvedValue(null);

    await expect(
      service.createBookingForGuest(
        'employee-1',
        'guest@example.com',
        'Guest User',
        'scooter-1',
        'DAY_1',
        new Date('2026-04-16T09:00:00.000Z'),
        new Date('2026-04-17T09:00:00.000Z'),
      ),
    ).rejects.toThrow(new BadRequestException('Scooter not found'));
  });

  it('rejects unavailable scooters', async () => {
    userFindUniqueMock.mockResolvedValue({
      id: 'employee-1',
      role: Role.MANAGER,
    });
    scooterFindUniqueMock.mockResolvedValue({
      id: 'scooter-1',
      status: ScooterStatus.RENTED,
    });

    await expect(
      service.createBookingForGuest(
        'employee-1',
        'guest@example.com',
        'Guest User',
        'scooter-1',
        'DAY_1',
        new Date('2026-04-16T09:00:00.000Z'),
        new Date('2026-04-17T09:00:00.000Z'),
      ),
    ).rejects.toThrow(new BadRequestException('Scooter not available'));
  });

  it('creates a guest user when the guest does not exist', async () => {
    userFindUniqueMock
      .mockResolvedValueOnce({
        id: 'employee-1',
        role: Role.MANAGER,
      })
      .mockResolvedValueOnce(null);
    scooterFindUniqueMock.mockResolvedValue({
      id: 'scooter-1',
      status: ScooterStatus.AVAILABLE,
    });
    userCreateMock.mockResolvedValue({
      id: 'guest-1',
      email: 'guest@example.com',
      role: Role.CUSTOMER,
    });
    mockBookingService.createBooking.mockResolvedValue({
      id: 'booking-1',
    } as Awaited<ReturnType<BookingService['createBooking']>>);
    employeeBookingCreateMock.mockResolvedValue({
      bookingId: 'booking-1',
      employeeId: 'employee-1',
      guestEmail: 'guest@example.com',
      guestName: 'Guest User',
    });

    const result = await service.createBookingForGuest(
      'employee-1',
      'guest@example.com',
      'Guest User',
      'scooter-1',
      'DAY_1',
      new Date('2026-04-16T09:00:00.000Z'),
      new Date('2026-04-17T09:00:00.000Z'),
    );

    expect(userCreateMock).toHaveBeenCalledWith({
      data: {
        email: 'guest@example.com',
        passwordHash: expect.any(String) as string,
        role: Role.CUSTOMER,
      },
    });
    expect(mockBookingService.createBooking).toHaveBeenCalledWith(
      'guest-1',
      'scooter-1',
      'DAY_1',
      new Date('2026-04-16T09:00:00.000Z'),
    );
    expect(employeeBookingCreateMock).toHaveBeenCalled();
    expect(result).toEqual({ id: 'booking-1' });
  });

  it('reuses the existing guest user when one already exists', async () => {
    userFindUniqueMock
      .mockResolvedValueOnce({
        id: 'employee-1',
        role: Role.MANAGER,
      })
      .mockResolvedValueOnce({
        id: 'guest-1',
        email: 'guest@example.com',
        role: Role.CUSTOMER,
      });
    scooterFindUniqueMock.mockResolvedValue({
      id: 'scooter-1',
      status: ScooterStatus.AVAILABLE,
    });
    mockBookingService.createBooking.mockResolvedValue({
      id: 'booking-1',
    } as Awaited<ReturnType<BookingService['createBooking']>>);
    employeeBookingCreateMock.mockResolvedValue({
      bookingId: 'booking-1',
      employeeId: 'employee-1',
      guestEmail: 'guest@example.com',
      guestName: 'Guest User',
    });

    await service.createBookingForGuest(
      'employee-1',
      'guest@example.com',
      'Guest User',
      'scooter-1',
      'DAY_1',
      new Date('2026-04-16T09:00:00.000Z'),
      new Date('2026-04-17T09:00:00.000Z'),
    );

    expect(userCreateMock).not.toHaveBeenCalled();
    expect(mockBookingService.createBooking).toHaveBeenCalledWith(
      'guest-1',
      'scooter-1',
      'DAY_1',
      new Date('2026-04-16T09:00:00.000Z'),
    );
  });

  it('loads employee bookings with nested relations', async () => {
    employeeBookingFindManyMock.mockResolvedValue([
      {
        bookingId: 'booking-1',
        employeeId: 'employee-1',
        guestEmail: 'guest@example.com',
        guestName: 'Guest User',
      },
    ]);

    await service.getEmployeeBookings('employee-1');

    expect(employeeBookingFindManyMock).toHaveBeenCalledWith({
      where: { employeeId: 'employee-1' },
      include: {
        booking: {
          include: {
            user: true,
            scooter: true,
          },
        },
      },
    });
  });
});
