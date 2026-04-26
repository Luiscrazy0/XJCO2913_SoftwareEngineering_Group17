import { StationController } from './station.controller';
import { StationService } from './station.service';

type StationServiceMock = Pick<
  StationService,
  | 'findAll'
  | 'getStationsWithAvailableScooters'
  | 'getNearbyStations'
  | 'findById'
  | 'createStation'
  | 'updateStation'
  | 'deleteStation'
>;

const mockStationService: jest.Mocked<StationServiceMock> = {
  findAll: jest.fn(),
  getStationsWithAvailableScooters: jest.fn(),
  getNearbyStations: jest.fn(),
  findById: jest.fn(),
  createStation: jest.fn(),
  updateStation: jest.fn(),
  deleteStation: jest.fn(),
};

describe('StationController', () => {
  let controller: StationController;

  beforeEach(() => {
    controller = new StationController(
      mockStationService as unknown as StationService,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('delegates findAll to StationService.findAll', () => {
    controller.findAll();

    expect(mockStationService.findAll).toHaveBeenCalled();
  });

  it('delegates available station queries to the service', () => {
    controller.getStationsWithAvailableScooters();

    expect(
      mockStationService.getStationsWithAvailableScooters,
    ).toHaveBeenCalled();
  });

  it('parses nearby station query parameters before delegating', () => {
    controller.getNearbyStations('39.9', '116.4', '7');

    expect(mockStationService.getNearbyStations).toHaveBeenCalledWith(
      39.9,
      116.4,
      7,
    );
  });

  it('uses the default radius when radius is not provided', () => {
    controller.getNearbyStations('39.9', '116.4');

    expect(mockStationService.getNearbyStations).toHaveBeenCalledWith(
      39.9,
      116.4,
      5,
    );
  });

  it('delegates findOne to StationService.findById', () => {
    controller.findOne('station-1');

    expect(mockStationService.findById).toHaveBeenCalledWith('station-1');
  });

  it('delegates create to StationService.createStation', () => {
    const body = {
      name: 'North Station',
      latitude: 40,
      longitude: 116,
    };

    controller.create(body);

    expect(mockStationService.createStation).toHaveBeenCalledWith(body);
  });

  it('delegates update to StationService.updateStation', () => {
    const body = {
      name: 'Updated Station',
      latitude: 40,
      longitude: 116,
    };

    controller.update('station-1', body);

    expect(mockStationService.updateStation).toHaveBeenCalledWith(
      'station-1',
      body,
    );
  });

  it('delegates delete to StationService.deleteStation', () => {
    controller.delete('station-1');

    expect(mockStationService.deleteStation).toHaveBeenCalledWith('station-1');
  });
});
