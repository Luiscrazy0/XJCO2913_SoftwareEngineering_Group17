import { Test, TestingModule } from '@nestjs/testing';
import { StatisticsService } from './statistics.service';
import { PrismaService } from '../../prisma/prisma.service';
import { HireType, BookingStatus } from '@prisma/client';

describe('StatisticsService', () => {
  let service: StatisticsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    booking: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
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
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getHireTypeChineseName', () => {
    it('should return correct Chinese name for HOUR_1', () => {
      expect(service.getHireTypeChineseName(HireType.HOUR_1)).toBe('1小时租赁');
    });

    it('should return correct Chinese name for HOUR_4', () => {
      expect(service.getHireTypeChineseName(HireType.HOUR_4)).toBe('4小时租赁');
    });

    it('should return correct Chinese name for DAY_1', () => {
      expect(service.getHireTypeChineseName(HireType.DAY_1)).toBe('1天租赁');
    });

    it('should return correct Chinese name for WEEK_1', () => {
      expect(service.getHireTypeChineseName(HireType.WEEK_1)).toBe('1周租赁');
    });
  });
});
