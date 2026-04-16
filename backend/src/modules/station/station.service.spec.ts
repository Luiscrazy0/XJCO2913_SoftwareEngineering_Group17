import { NotFoundException } from '@nestjs/common';
import type { PrismaService } from '../../prisma/prisma.service';
import { StationService } from './station.service';

type StationRecord = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  createdAt: Date;
  updatedAt: Date;
};

type ScooterRecord = {
  id: string;
};

type CreateStationInput = Parameters<StationService['createStation']>[0];
type UpdateStationInput = Parameters<StationService['updateStation']>[1];

type StationFindManyArgs = Parameters<PrismaService['station']['findMany']>[0];
type StationFindUniqueArgs = Parameters<
  PrismaService['station']['findUnique']
>[0];
type StationCreateArgs = Parameters<PrismaService['station']['create']>[0];
type StationUpdateArgs = Parameters<PrismaService['station']['update']>[0];
type StationDeleteArgs = Parameters<PrismaService['station']['delete']>[0];
type ScooterFindManyArgs = Parameters<PrismaService['scooter']['findMany']>[0];
type ScooterUpdateManyArgs = Parameters<
  PrismaService['scooter']['updateMany']
>[0];

const stationFindManyMock =
  jest.fn<(args?: StationFindManyArgs) => Promise<StationRecord[]>>();
const stationFindUniqueMock =
  jest.fn<(args: StationFindUniqueArgs) => Promise<StationRecord | null>>();
const stationCreateMock =
  jest.fn<(args: StationCreateArgs) => Promise<StationRecord>>();
const stationUpdateMock =
  jest.fn<(args: StationUpdateArgs) => Promise<StationRecord>>();
const stationDeleteMock =
  jest.fn<(args: StationDeleteArgs) => Promise<StationRecord>>();
const scooterFindManyMock =
  jest.fn<(args?: ScooterFindManyArgs) => Promise<ScooterRecord[]>>();
const scooterUpdateManyMock =
  jest.fn<(args: ScooterUpdateManyArgs) => Promise<{ count: number }>>();

const mockPrismaService = {
  station: {
    findMany: stationFindManyMock,
    findUnique: stationFindUniqueMock,
    create: stationCreateMock,
    update: stationUpdateMock,
    delete: stationDeleteMock,
  },
  scooter: {
    findMany: scooterFindManyMock,
    updateMany: scooterUpdateManyMock,
  },
} as unknown as PrismaService;

const createStationRecord = (
  overrides: Partial<StationRecord> = {},
): StationRecord => ({
  id: 'station-1',
  name: 'Central Station',
  latitude: 39.9,
  longitude: 116.4,
  createdAt: new Date('2026-04-16T00:00:00.000Z'),
  updatedAt: new Date('2026-04-16T00:00:00.000Z'),
  ...overrides,
});

describe('StationService', () => {
  let service: StationService;

  beforeEach(() => {
    service = new StationService(mockPrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('returns all stations ordered by creation time', async () => {
      const station = createStationRecord();
      stationFindManyMock.mockResolvedValue([station]);

      const result = await service.findAll();

      expect(stationFindManyMock).toHaveBeenCalledWith({
        include: {
          scooters: {
            include: {
              station: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual([station]);
    });
  });

  describe('findById', () => {
    it('returns the matching station when it exists', async () => {
      const station = createStationRecord();
      stationFindUniqueMock.mockResolvedValue(station);

      const result = await service.findById('station-1');

      expect(result).toEqual(station);
      expect(stationFindUniqueMock).toHaveBeenCalledWith({
        where: { id: 'station-1' },
        include: { scooters: { include: { station: true } } },
      });
    });

    it('throws when the station is missing', async () => {
      stationFindUniqueMock.mockResolvedValue(null);

      await expect(service.findById('unknown-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createStation', () => {
    it('creates a station with scooter relations included', async () => {
      const createDto = {
        name: 'North Station',
        latitude: 40,
        longitude: 116,
      } as CreateStationInput;
      stationCreateMock.mockResolvedValue(
        createStationRecord({
          ...createDto,
        }),
      );

      const result = await service.createStation(createDto);

      expect(stationCreateMock).toHaveBeenCalledWith({
        data: createDto,
        include: { scooters: true },
      });
      expect(result.name).toBe('North Station');
    });
  });

  describe('updateStation', () => {
    it('throws when trying to update a missing station', async () => {
      stationFindUniqueMock.mockResolvedValue(null);

      await expect(
        service.updateStation('unknown', {} as UpdateStationInput),
      ).rejects.toThrow(NotFoundException);
    });

    it('updates the station when it exists', async () => {
      const updateDto = { name: 'Updated Station' } as UpdateStationInput;
      stationFindUniqueMock.mockResolvedValue(createStationRecord());
      stationUpdateMock.mockResolvedValue(
        createStationRecord({
          ...updateDto,
        }),
      );

      const result = await service.updateStation('station-1', updateDto);

      expect(stationUpdateMock).toHaveBeenCalledWith({
        where: { id: 'station-1' },
        data: updateDto,
        include: { scooters: true },
      });
      expect(result.name).toBe('Updated Station');
    });
  });

  describe('deleteStation', () => {
    it('throws when trying to delete a missing station', async () => {
      stationFindUniqueMock.mockResolvedValue(null);

      await expect(service.deleteStation('unknown')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('detaches scooters before deleting a station', async () => {
      stationFindUniqueMock.mockResolvedValue(createStationRecord());
      scooterFindManyMock.mockResolvedValue([{ id: 'scooter-1' }]);
      scooterUpdateManyMock.mockResolvedValue({ count: 1 });
      stationDeleteMock.mockResolvedValue(createStationRecord());

      await service.deleteStation('station-1');

      expect(scooterUpdateManyMock).toHaveBeenCalledWith({
        where: { stationId: 'station-1' },
        data: { stationId: null },
      });
      expect(stationDeleteMock).toHaveBeenCalledWith({
        where: { id: 'station-1' },
      });
    });

    it('deletes directly when no scooters are linked', async () => {
      stationFindUniqueMock.mockResolvedValue(createStationRecord());
      scooterFindManyMock.mockResolvedValue([]);
      stationDeleteMock.mockResolvedValue(createStationRecord());

      await service.deleteStation('station-1');

      expect(scooterUpdateManyMock).not.toHaveBeenCalled();
      expect(stationDeleteMock).toHaveBeenCalledWith({
        where: { id: 'station-1' },
      });
    });
  });

  describe('getStationsWithAvailableScooters', () => {
    it('returns stations filtered by available scooters', async () => {
      const station = createStationRecord();
      stationFindManyMock.mockResolvedValue([station]);

      const result = await service.getStationsWithAvailableScooters();

      expect(stationFindManyMock).toHaveBeenCalledWith({
        where: {
          scooters: {
            some: {
              status: 'AVAILABLE',
            },
          },
        },
        include: {
          scooters: {
            where: {
              status: 'AVAILABLE',
            },
            include: {
              station: true,
            },
          },
        },
        orderBy: { name: 'asc' },
      });
      expect(result).toEqual([station]);
    });
  });

  describe('getNearbyStations', () => {
    it('filters by radius and sorts by distance', async () => {
      stationFindManyMock.mockResolvedValue([
        createStationRecord({
          id: 'st1',
          name: 'Far Station',
          latitude: 41,
          longitude: 116.4,
        }),
        createStationRecord({
          id: 'st2',
          name: 'Center Station',
          latitude: 39.9,
          longitude: 116.4,
        }),
        createStationRecord({
          id: 'st3',
          name: 'Near Station',
          latitude: 39.91,
          longitude: 116.4,
        }),
      ]);

      const result = await service.getNearbyStations(39.9, 116.4, 5);

      expect(stationFindManyMock).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0]?.id).toBe('st2');
      expect(result[0]?.distanceKm).toBe(0);
      expect(result[1]?.id).toBe('st3');
      expect(result[1]?.distanceKm).toBeGreaterThan(0);
      expect(result[1]?.distanceKm).toBeLessThan(5);
    });
  });
});
