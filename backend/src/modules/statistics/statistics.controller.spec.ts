import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';

type StatisticsServiceMock = Pick<
  StatisticsService,
  | 'getWeeklyRevenueByHireType'
  | 'getDailyRevenue'
  | 'getRevenueChartData'
  | 'getHireTypeChineseName'
>;

const mockStatisticsService: jest.Mocked<StatisticsServiceMock> = {
  getWeeklyRevenueByHireType: jest.fn(),
  getDailyRevenue: jest.fn(),
  getRevenueChartData: jest.fn(),
  getHireTypeChineseName: jest.fn(),
};

describe('StatisticsController', () => {
  let controller: StatisticsController;

  beforeEach(() => {
    controller = new StatisticsController(
      mockStatisticsService as unknown as StatisticsService,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('builds the weekly revenue response DTO', async () => {
    mockStatisticsService.getWeeklyRevenueByHireType.mockResolvedValue([
      {
        hireType: 'DAY_1',
        totalRevenue: 100,
        bookingCount: 4,
        averageRevenue: 25,
      },
    ]);
    mockStatisticsService.getHireTypeChineseName.mockReturnValue('1天租赁');

    const result = await controller.getWeeklyRevenueByHireType(
      '2026-04-01',
      '2026-04-07',
    );

    expect(result).toEqual({
      startDate: '2026-04-01',
      endDate: '2026-04-07',
      data: [
        {
          hireType: 'DAY_1',
          hireTypeName: '1天租赁',
          totalRevenue: 100,
          bookingCount: 4,
          averageRevenue: 25,
        },
      ],
      totalRevenue: 100,
      totalBookings: 4,
    });
  });

  it('builds the daily revenue response DTO', async () => {
    mockStatisticsService.getDailyRevenue.mockResolvedValue([
      {
        date: '2026-04-01',
        totalRevenue: 120,
        bookingCount: 3,
        hireTypes: [
          {
            hireType: 'HOUR_1',
            revenue: 120,
          },
        ],
      },
    ]);
    mockStatisticsService.getHireTypeChineseName.mockReturnValue('1小时租赁');

    const result = await controller.getDailyRevenue('2026-04-01', '2026-04-07');

    expect(result).toEqual({
      startDate: '2026-04-01',
      endDate: '2026-04-07',
      data: [
        {
          date: '2026-04-01',
          totalRevenue: 120,
          bookingCount: 3,
          hireTypes: [
            {
              hireType: 'HOUR_1',
              hireTypeName: '1小时租赁',
              revenue: 120,
            },
          ],
        },
      ],
      totalRevenue: 120,
      totalBookings: 3,
    });
  });

  it('returns chart data with period and chart type metadata', async () => {
    mockStatisticsService.getRevenueChartData.mockResolvedValue({
      labels: ['Mon'],
      datasets: [{ label: 'Revenue', data: [88] }],
      chartType: 'bar',
      period: 'week',
    });

    const result = await controller.getRevenueChartData('week', 'bar');

    expect(result).toEqual({
      labels: ['Mon'],
      datasets: [{ label: 'Revenue', data: [88] }],
      chartType: 'bar',
      period: 'week',
    });
  });
});
