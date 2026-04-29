import { BadRequestException } from '@nestjs/common';
import { ScooterStatus } from '@prisma/client';
import type { PrismaService } from '../../prisma/prisma.service';
import { AmapService } from '../amap/amap.service';
import { ScooterService } from './scooter.service';

type ScooterRecord = {
  id: string;
  location: string;
  status: ScooterStatus;
  latitude?: number;
  longitude?: number;
};

type ScooterFindManyArgs = Parameters<PrismaService['scooter']['findMany']>[0];
type ScooterFindUniqueArgs = Parameters<
  PrismaService['scooter']['findUnique']
>[0];
type ScooterCreateArgs = Parameters<PrismaService['scooter']['create']>[0];
type ScooterUpdateArgs = Parameters<PrismaService['scooter']['update']>[0];
type ScooterDeleteArgs = Parameters<PrismaService['scooter']['delete']>[0];
type BookingCountArgs = Parameters<PrismaService['booking']['count']>[0];

const scooterCountMock = jest.fn<() => Promise<number>>();
const scooterFindManyMock =
  jest.fn<(args?: ScooterFindManyArgs) => Promise<ScooterRecord[]>>();
const scooterFindUniqueMock =
  jest.fn<(args: ScooterFindUniqueArgs) => Promise<ScooterRecord | null>>();
const scooterCreateMock =
  jest.fn<(args: ScooterCreateArgs) => Promise<ScooterRecord>>();
const scooterUpdateMock =
  jest.fn<(args: ScooterUpdateArgs) => Promise<ScooterRecord>>();
const scooterDeleteMock =
  jest.fn<(args: ScooterDeleteArgs) => Promise<ScooterRecord>>();
const bookingCountMock = jest.fn<(args: BookingCountArgs) => Promise<number>>();

const mockPrismaService = {
  scooter: {
    findMany: scooterFindManyMock,
    findUnique: scooterFindUniqueMock,
    create: scooterCreateMock,
    update: scooterUpdateMock,
    delete: scooterDeleteMock,
    count: scooterCountMock,
  },
  booking: {
    count: bookingCountMock,
  },
} as unknown as PrismaService;

type AmapServiceMock = Pick<AmapService, 'regeocode'>;

const mockAmapService: jest.Mocked<AmapServiceMock> = {
  regeocode: jest.fn(),
};

describe('ScooterService', () => {
  let service: ScooterService;

  beforeEach(() => {
    service = new ScooterService(
      mockPrismaService,
      mockAmapService as unknown as AmapService,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('returns all scooters and enriches them with amapAddress', async () => {
      scooterFindManyMock.mockResolvedValue([
        {
          id: '1',
          location: 'South Campus',
          status: ScooterStatus.AVAILABLE,
        },
        {
          id: '2',
          location: 'Library',
          status: ScooterStatus.RENTED,
        },
      ]);
      scooterCountMock.mockResolvedValue(2);

      const result = await service.findAll();

      expect(scooterFindManyMock).toHaveBeenCalledWith({
        skip: 0,
        take: 20,
        include: { station: true },
        orderBy: { updatedAt: 'desc' },
      });
      expect(result).toEqual({
        items: [
          {
            id: '1',
            location: 'South Campus',
            status: ScooterStatus.AVAILABLE,
            amapAddress: null,
          },
          {
            id: '2',
            location: 'Library',
            status: ScooterStatus.RENTED,
            amapAddress: null,
          },
        ],
        total: 2,
        page: 1,
        limit: 20,
        totalPages: 1,
      });
    });
  });

  describe('findById', () => {
    const scooterId = 'scooter-1';

    it('returns the scooter when it exists', async () => {
      scooterFindUniqueMock.mockResolvedValue({
        id: scooterId,
        location: 'North Campus',
        status: ScooterStatus.AVAILABLE,
      });

      const result = await service.findById(scooterId);

      expect(scooterFindUniqueMock).toHaveBeenCalledWith({
        where: { id: scooterId },
        include: { station: true },
      });
      expect(result).toEqual({
        id: scooterId,
        location: 'North Campus',
        status: ScooterStatus.AVAILABLE,
        amapAddress: null,
      });
    });

    it('returns null when the scooter does not exist', async () => {
      scooterFindUniqueMock.mockResolvedValue(null);

      const result = await service.findById('missing');

      expect(result).toBeNull();
    });

    it('reuses the cached amap address when the cache entry is still valid', async () => {
      const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(1000);
      const scooterWithCoordinates = {
        id: scooterId,
        location: 'North Campus',
        status: ScooterStatus.AVAILABLE,
        latitude: 53.406,
        longitude: -2.966,
      };

      scooterFindUniqueMock.mockResolvedValue(scooterWithCoordinates);
      mockAmapService.regeocode.mockResolvedValue({
        status: '1',
        regeocode: { formatted_address: 'Liverpool Address' },
      } as Awaited<ReturnType<AmapService['regeocode']>>);

      await service.findById(scooterId);
      mockAmapService.regeocode.mockClear();

      const result = await service.findById(scooterId);

      expect(mockAmapService.regeocode).not.toHaveBeenCalled();
      expect(result).toEqual({
        ...scooterWithCoordinates,
        amapAddress: 'Liverpool Address',
      });

      nowSpy.mockRestore();
    });

    it('returns a null amapAddress when the amap API result is unsuccessful', async () => {
      const scooterWithCoordinates = {
        id: scooterId,
        location: 'North Campus',
        status: ScooterStatus.AVAILABLE,
        latitude: 53.406,
        longitude: -2.966,
      };

      scooterFindUniqueMock.mockResolvedValue(scooterWithCoordinates);
      mockAmapService.regeocode.mockResolvedValue({
        status: '0',
        info: 'INVALID_USER_KEY',
      } as Awaited<ReturnType<AmapService['regeocode']>>);

      const result = await service.findById(scooterId);

      expect(result).toEqual({
        ...scooterWithCoordinates,
        amapAddress: null,
      });
    });

    it('returns a null amapAddress when amap geocoding throws', async () => {
      const scooterWithCoordinates = {
        id: scooterId,
        location: 'North Campus',
        status: ScooterStatus.AVAILABLE,
        latitude: 53.406,
        longitude: -2.966,
      };

      scooterFindUniqueMock.mockResolvedValue(scooterWithCoordinates);
      mockAmapService.regeocode.mockRejectedValue(new Error('Network issue'));

      const result = await service.findById(scooterId);

      expect(result).toEqual({
        ...scooterWithCoordinates,
        amapAddress: null,
      });
    });
  });

  describe('createScooter', () => {
    it('creates a scooter at the requested location', async () => {
      const createdScooter = {
        id: '3',
        location: 'Engineering Building',
        status: ScooterStatus.AVAILABLE,
      };
      scooterCreateMock.mockResolvedValue(createdScooter);

      const result = await service.createScooter('Engineering Building');

      expect(scooterCreateMock).toHaveBeenCalledWith({
        data: { location: 'Engineering Building' },
      });
      expect(result).toEqual(createdScooter);
    });
  });

  describe('updateStatus', () => {
    it('updates the scooter status', async () => {
      const updatedScooter = {
        id: '1',
        location: 'South Campus',
        status: ScooterStatus.UNAVAILABLE,
      };
      scooterUpdateMock.mockResolvedValue(updatedScooter);

      const result = await service.updateStatus('1', ScooterStatus.UNAVAILABLE);

      expect(scooterUpdateMock).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { status: ScooterStatus.UNAVAILABLE },
      });
      expect(result).toEqual(updatedScooter);
    });
  });

  describe('deleteScooter', () => {
    const scooterId = 'scooter-123';

    it('throws when the scooter has existing bookings', async () => {
      bookingCountMock.mockResolvedValue(1);

      await expect(service.deleteScooter(scooterId)).rejects.toThrow(
        new BadRequestException('Scooter has existing bookings'),
      );

      expect(scooterDeleteMock).not.toHaveBeenCalled();
    });

    it('deletes the scooter when no bookings are linked', async () => {
      bookingCountMock.mockResolvedValue(0);
      scooterDeleteMock.mockResolvedValue({
        id: scooterId,
        location: 'Campus A',
        status: ScooterStatus.AVAILABLE,
      });

      const result = await service.deleteScooter(scooterId);

      expect(bookingCountMock).toHaveBeenCalledWith({
        where: { scooterId },
      });
      expect(scooterDeleteMock).toHaveBeenCalledWith({
        where: { id: scooterId },
      });
      expect(result).toEqual({
        id: scooterId,
        location: 'Campus A',
        status: ScooterStatus.AVAILABLE,
      });
    });
  });
});
