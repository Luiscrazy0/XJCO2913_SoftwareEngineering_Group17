import { HireType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { DiscountService } from './discount.service';

type UserTypeValue = 'NORMAL' | 'STUDENT' | 'SENIOR' | 'FREQUENT';

describe('DiscountService', () => {
  let service: DiscountService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    booking: {
      findMany: jest.fn(),
    },
  };

  beforeEach(() => {
    service = new DiscountService(
      mockPrismaService as unknown as PrismaService,
    );
    jest.clearAllMocks();
  });

  it('returns the original price when the user cannot be found', async () => {
    mockPrismaService.user.findUnique.mockResolvedValue(null);

    await expect(
      service.calculateDiscountedPrice('user-1', 100, HireType.HOUR_1),
    ).resolves.toMatchObject({
      discountedPrice: 100,
      discountAmount: 0,
    });
  });

  it('applies the student discount', async () => {
    mockPrismaService.user.findUnique.mockResolvedValue({
      userType: 'STUDENT' as UserTypeValue,
    });

    await expect(
      service.calculateDiscountedPrice('user-1', 100, HireType.HOUR_1),
    ).resolves.toMatchObject({
      discountedPrice: 80,
      discountAmount: 20,
    });
  });

  it('applies the senior discount', async () => {
    mockPrismaService.user.findUnique.mockResolvedValue({
      userType: 'SENIOR' as UserTypeValue,
    });

    await expect(
      service.calculateDiscountedPrice('user-1', 100, HireType.HOUR_1),
    ).resolves.toMatchObject({
      discountedPrice: 70,
      discountAmount: 30,
    });
  });

  it('keeps the frequent-user discount at zero below the first threshold', async () => {
    mockPrismaService.user.findUnique.mockResolvedValue({
      userType: 'FREQUENT' as UserTypeValue,
    });
    mockPrismaService.booking.findMany.mockResolvedValue([
      {
        startTime: new Date('2026-04-01T10:00:00.000Z'),
        endTime: new Date('2026-04-01T11:00:00.000Z'),
        hireType: HireType.HOUR_1,
      },
    ]);

    await expect(
      service.calculateDiscountedPrice('user-1', 100, HireType.HOUR_1),
    ).resolves.toMatchObject({
      discountedPrice: 100,
      discountAmount: 0,
    });
  });

  it('applies the active frequent-user discount at twenty hours', async () => {
    mockPrismaService.user.findUnique.mockResolvedValue({
      userType: 'FREQUENT' as UserTypeValue,
    });
    mockPrismaService.booking.findMany.mockResolvedValue(
      Array.from({ length: 5 }, () => ({
        startTime: new Date('2026-04-01T10:00:00.000Z'),
        endTime: new Date('2026-04-01T14:00:00.000Z'),
        hireType: HireType.HOUR_4,
      })),
    );

    await expect(
      service.calculateDiscountedPrice('user-1', 100, HireType.HOUR_1),
    ).resolves.toMatchObject({
      discountedPrice: 85,
      discountAmount: 15,
    });
  });

  it('applies the highest frequent-user discount at fifty hours', async () => {
    mockPrismaService.user.findUnique.mockResolvedValue({
      userType: 'FREQUENT' as UserTypeValue,
    });
    mockPrismaService.booking.findMany.mockResolvedValue([
      {
        startTime: new Date('2026-04-01T10:00:00.000Z'),
        endTime: new Date('2026-04-02T10:00:00.000Z'),
        hireType: HireType.DAY_1,
      },
      {
        startTime: new Date('2026-04-03T10:00:00.000Z'),
        endTime: new Date('2026-04-04T10:00:00.000Z'),
        hireType: HireType.DAY_1,
      },
      {
        startTime: new Date('2026-04-05T10:00:00.000Z'),
        endTime: new Date('2026-04-06T10:00:00.000Z'),
        hireType: HireType.DAY_1,
      },
    ]);

    await expect(
      service.calculateDiscountedPrice('user-1', 100, HireType.HOUR_1),
    ).resolves.toMatchObject({
      discountedPrice: 75,
      discountAmount: 25,
    });
  });

  it('leaves normal users without a discount', async () => {
    mockPrismaService.user.findUnique.mockResolvedValue({
      userType: 'NORMAL' as UserTypeValue,
    });

    await expect(
      service.calculateDiscountedPrice('user-1', 100, HireType.HOUR_1),
    ).resolves.toMatchObject({
      discountedPrice: 100,
      discountAmount: 0,
    });
  });

  it('updates the user type', async () => {
    await service.updateUserType('user-1', 'SENIOR' as UserTypeValue);

    expect(mockPrismaService.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { userType: 'SENIOR' },
    });
  });

  it('returns summary information for normal users', async () => {
    mockPrismaService.user.findUnique.mockResolvedValue({
      userType: 'NORMAL' as UserTypeValue,
    });

    await expect(service.getUserDiscountInfo('user-1')).resolves.toEqual({
      userType: 'NORMAL',
      currentDiscount: expect.any(String),
      nextDiscountThreshold: expect.any(String),
    });
  });

  it('returns summary information for student, senior, and frequent users', async () => {
    mockPrismaService.user.findUnique
      .mockResolvedValueOnce({ userType: 'STUDENT' as UserTypeValue })
      .mockResolvedValueOnce({ userType: 'SENIOR' as UserTypeValue })
      .mockResolvedValueOnce({ userType: 'FREQUENT' as UserTypeValue });

    await expect(service.getUserDiscountInfo('student')).resolves.toEqual({
      userType: 'STUDENT',
      currentDiscount: expect.any(String),
      nextDiscountThreshold: '',
    });
    await expect(service.getUserDiscountInfo('senior')).resolves.toEqual({
      userType: 'SENIOR',
      currentDiscount: expect.any(String),
      nextDiscountThreshold: '',
    });
    await expect(service.getUserDiscountInfo('frequent')).resolves.toEqual({
      userType: 'FREQUENT',
      currentDiscount: expect.any(String),
      nextDiscountThreshold: '',
    });
  });

  it('throws when discount info is requested for a missing user', async () => {
    mockPrismaService.user.findUnique.mockResolvedValue(null);

    await expect(service.getUserDiscountInfo('missing')).rejects.toThrow(
      'User not found',
    );
  });
});
