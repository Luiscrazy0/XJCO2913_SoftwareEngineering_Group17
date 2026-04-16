import { ScooterStatus } from '@prisma/client';
import { ScooterController } from './scooter.controller';
import { ScooterService } from './scooter.service';

type ScooterServiceMock = Pick<
  ScooterService,
  'findAll' | 'findById' | 'createScooter' | 'updateStatus' | 'deleteScooter'
>;

const mockScooterService: jest.Mocked<ScooterServiceMock> = {
  findAll: jest.fn(),
  findById: jest.fn(),
  createScooter: jest.fn(),
  updateStatus: jest.fn(),
  deleteScooter: jest.fn(),
};

describe('ScooterController', () => {
  let controller: ScooterController;

  beforeEach(() => {
    controller = new ScooterController(
      mockScooterService as unknown as ScooterService,
    );
    jest.clearAllMocks();
  });

  it('returns all scooters', async () => {
    const scooters = [{ id: 'scooter-1' }];
    mockScooterService.findAll.mockResolvedValue(scooters);

    await expect(controller.findAll()).resolves.toEqual(scooters);
    expect(mockScooterService.findAll).toHaveBeenCalledTimes(1);
  });

  it('returns a single scooter by id', async () => {
    const scooter = { id: 'scooter-1' };
    mockScooterService.findById.mockResolvedValue(scooter);

    await expect(controller.findOne('scooter-1')).resolves.toEqual(scooter);
    expect(mockScooterService.findById).toHaveBeenCalledWith('scooter-1');
  });

  it('creates a scooter from the request body', async () => {
    const scooter = { id: 'scooter-1', location: 'Main Street' };
    mockScooterService.createScooter.mockResolvedValue(scooter);

    await expect(
      controller.create({ location: 'Main Street' }),
    ).resolves.toEqual(scooter);
    expect(mockScooterService.createScooter).toHaveBeenCalledWith(
      'Main Street',
    );
  });

  it('updates scooter status', async () => {
    const scooter = { id: 'scooter-1', status: ScooterStatus.UNAVAILABLE };
    mockScooterService.updateStatus.mockResolvedValue(scooter);

    await expect(
      controller.updateStatus('scooter-1', {
        status: ScooterStatus.UNAVAILABLE,
      }),
    ).resolves.toEqual(scooter);
    expect(mockScooterService.updateStatus).toHaveBeenCalledWith(
      'scooter-1',
      ScooterStatus.UNAVAILABLE,
    );
  });

  it('deletes a scooter', async () => {
    const scooter = { id: 'scooter-1' };
    mockScooterService.deleteScooter.mockResolvedValue(scooter);

    await expect(controller.delete('scooter-1')).resolves.toEqual(scooter);
    expect(mockScooterService.deleteScooter).toHaveBeenCalledWith('scooter-1');
  });
});
