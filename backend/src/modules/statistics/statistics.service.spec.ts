import { Test, TestingModule } from '@nestjs/testing';
import { BookingStatus, HireType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { StatisticsService } from './statistics.service';

const createBooking = (
  overrides: Partial<{
    hireType: HireType;
    totalCost: number;
    startTime: Date;
    endTime: Date;
    status: BookingStatus;
  }> = {},
) => ({
  hireType: HireType.HOUR_1,
  totalCost: 10,
  startTime: new Date('2026-04-10T08:00:00.000Z'),
  endTime: new Date('2026-04-10T09:00:00.000Z'),
  status: BookingStatus.CONFIRMED,
  payment: null,
  ...overrides,
});

describe('StatisticsService', () => {
  let service: StatisticsService;

  const mockPrismaService = {
    booking: {
      findMany: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
    },
    scooter: {
      count: jest.fn(),
    },
    user: {
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-04-16T12:00:00.000Z'));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatisticsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<StatisticsService>(StatisticsService);
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getWeeklyRevenueByHireType', () => {
    it('aggregates bookings by hire type and sorts by revenue', async () => {
      mockPrismaService.booking.findMany.mockResolvedValue([
        createBooking({
          hireType: HireType.HOUR_1,
          totalCost: 5,
        }),
        createBooking({
          hireType: HireType.DAY_1,
          totalCost: 30,
        }),
        createBooking({
          hireType: HireType.HOUR_1,
          totalCost: 10,
        }),
      ]);

      await expect(
        service.getWeeklyRevenueByHireType('2026-04-09', '2026-04-16'),
      ).resolves.toEqual([
        {
          hireType: HireType.DAY_1,
          totalRevenue: 30,
          bookingCount: 1,
          averageRevenue: 30,
        },
        {
          hireType: HireType.HOUR_1,
          totalRevenue: 15,
          bookingCount: 2,
          averageRevenue: 7.5,
        },
      ]);

      expect(mockPrismaService.booking.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: {
              in: [
                BookingStatus.CONFIRMED,
                BookingStatus.COMPLETED,
                BookingStatus.EXTENDED,
              ],
            },
            startTime: expect.objectContaining({
              gte: new Date('2026-04-09T00:00:00.000Z'),
              lte: expect.any(Date),
            }),
          }),
          include: {
            payment: true,
          },
        }),
      );

      const bookingFindManyCall = mockPrismaService.booking.findMany.mock
        .calls[0]?.[0] as {
        where: {
          startTime: {
            gte: Date;
            lte: Date;
          };
        };
      };

      expect(bookingFindManyCall.where.startTime.gte.toISOString()).toBe(
        '2026-04-09T00:00:00.000Z',
      );
      expect(bookingFindManyCall.where.startTime.lte.toISOString()).toContain(
        '2026-04-16',
      );
    });

    it('returns an empty array when there are no bookings', async () => {
      mockPrismaService.booking.findMany.mockResolvedValue([]);

      await expect(
        service.getWeeklyRevenueByHireType('2026-04-09', '2026-04-16'),
      ).resolves.toEqual([]);
    });
  });

  describe('getDailyRevenue', () => {
    it('groups bookings by date and hire type and sorts chronologically', async () => {
      mockPrismaService.booking.findMany.mockResolvedValue([
        createBooking({
          hireType: HireType.HOUR_1,
          totalCost: 5,
          startTime: new Date('2026-04-11T08:00:00.000Z'),
        }),
        createBooking({
          hireType: HireType.HOUR_1,
          totalCost: 10,
          startTime: new Date('2026-04-11T10:00:00.000Z'),
        }),
        createBooking({
          hireType: HireType.DAY_1,
          totalCost: 30,
          startTime: new Date('2026-04-10T09:00:00.000Z'),
        }),
      ]);

      await expect(
        service.getDailyRevenue('2026-04-09', '2026-04-16'),
      ).resolves.toEqual([
        {
          date: '2026-04-10',
          totalRevenue: 30,
          bookingCount: 1,
          hireTypes: [
            {
              hireType: HireType.DAY_1,
              revenue: 30,
            },
          ],
        },
        {
          date: '2026-04-11',
          totalRevenue: 15,
          bookingCount: 2,
          hireTypes: [
            {
              hireType: HireType.HOUR_1,
              revenue: 15,
            },
          ],
        },
      ]);
    });

    it('returns an empty array when there is no daily data', async () => {
      mockPrismaService.booking.findMany.mockResolvedValue([]);

      await expect(
        service.getDailyRevenue('2026-04-09', '2026-04-16'),
      ).resolves.toEqual([]);
    });
  });

  describe('getRevenueChartData', () => {
    it('builds a pie chart dataset grouped by hire type', async () => {
      jest.spyOn(service, 'getDailyRevenue').mockResolvedValue([
        {
          date: '2026-04-10',
          totalRevenue: 20,
          bookingCount: 2,
          hireTypes: [
            { hireType: HireType.HOUR_1, revenue: 5 },
            { hireType: HireType.HOUR_4, revenue: 15 },
          ],
        },
        {
          date: '2026-04-11',
          totalRevenue: 30,
          bookingCount: 1,
          hireTypes: [{ hireType: HireType.HOUR_1, revenue: 30 }],
        },
      ]);

      await expect(service.getRevenueChartData('week', 'pie')).resolves.toEqual(
        {
          labels: ['2026-04-10', '2026-04-11'],
          datasets: [
            {
              label: 'Revenue by Hire Type',
              data: [35, 15],
              backgroundColor: [
                '#FF6384',
                '#36A2EB',
                '#FFCE56',
                '#4BC0C0',
                '#9966FF',
                '#FF9F40',
              ],
            },
          ],
        },
      );
    });

    it('builds a bar chart dataset for monthly revenue', async () => {
      const getDailyRevenueSpy = jest
        .spyOn(service, 'getDailyRevenue')
        .mockResolvedValue([
          {
            date: '2026-03-16',
            totalRevenue: 18,
            bookingCount: 2,
            hireTypes: [{ hireType: HireType.HOUR_1, revenue: 18 }],
          },
        ]);

      await expect(
        service.getRevenueChartData('month', 'bar'),
      ).resolves.toEqual({
        labels: ['2026-03-16'],
        datasets: [
          {
            label: 'Daily Revenue',
            data: [18],
            borderColor: undefined,
            backgroundColor: '#36A2EB',
            borderWidth: undefined,
          },
        ],
      });

      expect(getDailyRevenueSpy).toHaveBeenCalledWith(
        '2026-03-16',
        '2026-04-16',
      );
    });

    it('throws BadRequestException for invalid period', async () => {
      await expect(
        service.getRevenueChartData('decade', 'bar'),
      ).rejects.toThrow('Invalid period');
    });

    it('throws BadRequestException for invalid type', async () => {
      await expect(
        service.getRevenueChartData('week', 'scatter'),
      ).rejects.toThrow('Invalid type');
    });

    it('supports a yearly range', async () => {
      const getDailyRevenueSpy = jest
        .spyOn(service, 'getDailyRevenue')
        .mockResolvedValue([]);

      await service.getRevenueChartData('year', 'bar');

      expect(getDailyRevenueSpy).toHaveBeenCalledWith(
        '2025-04-16',
        '2026-04-16',
      );
    });
  });

  describe('getHireTypeChineseName', () => {
    it('returns mapped labels for known hire types', () => {
      expect(service.getHireTypeChineseName(HireType.HOUR_1)).not.toBe(
        HireType.HOUR_1,
      );
      expect(service.getHireTypeChineseName(HireType.HOUR_4)).not.toBe(
        HireType.HOUR_4,
      );
      expect(service.getHireTypeChineseName(HireType.DAY_1)).not.toBe(
        HireType.DAY_1,
      );
      expect(service.getHireTypeChineseName(HireType.WEEK_1)).not.toBe(
        HireType.WEEK_1,
      );
    });

    it('falls back to the raw hire type for unknown values', () => {
      expect(service.getHireTypeChineseName('CUSTOM' as HireType)).toBe(
        'CUSTOM',
      );
    });
  });

  describe('getDashboardSummary', () => {
    beforeEach(() => {
      mockPrismaService.booking.count.mockResolvedValue(5);
      mockPrismaService.booking.aggregate.mockResolvedValue({
        _sum: { totalCost: 250 },
      });
      mockPrismaService.scooter.count.mockResolvedValue(3);
      mockPrismaService.user.count.mockResolvedValue(42);
    });

    it('returns today orders, revenue, rented scooters, and total users', async () => {
      await expect(service.getDashboardSummary()).resolves.toEqual({
        todayOrders: 5,
        todayRevenue: 250,
        rentedScooters: 3,
        totalUsers: 42,
      });
    });

    it('handles null aggregate sum (no revenue)', async () => {
      mockPrismaService.booking.aggregate.mockResolvedValue({
        _sum: { totalCost: null },
      });

      await expect(service.getDashboardSummary()).resolves.toMatchObject({
        todayRevenue: 0,
      });
    });

    it('queries today boundaries correctly', async () => {
      await service.getDashboardSummary();

      const countCall = mockPrismaService.booking.count.mock.calls[0]?.[0] as {
        where: { startTime: { gte: Date; lte: Date }; status: { in: string[] } };
      };
      expect(countCall.where.startTime.gte).toBeInstanceOf(Date);
      expect(countCall.where.startTime.lte).toBeInstanceOf(Date);
      const gteHours = countCall.where.startTime.gte.getHours();
      expect(gteHours).toBe(0);
    });
  });
});
