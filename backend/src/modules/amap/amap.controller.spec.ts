import { AmapController } from './amap.controller';
import { AmapService } from './amap.service';

type AmapServiceMock = Pick<
  AmapService,
  | 'getServiceStatus'
  | 'geocode'
  | 'regeocode'
  | 'calculateDistance'
  | 'calculateDistances'
  | 'inputTips'
  | 'validateApiKey'
>;

const mockAmapService: jest.Mocked<AmapServiceMock> = {
  getServiceStatus: jest.fn(),
  geocode: jest.fn(),
  regeocode: jest.fn(),
  calculateDistance: jest.fn(),
  calculateDistances: jest.fn(),
  inputTips: jest.fn(),
  validateApiKey: jest.fn(),
};

describe('AmapController', () => {
  let controller: AmapController;

  beforeEach(() => {
    controller = new AmapController(mockAmapService as unknown as AmapService);
    jest.clearAllMocks();
  });

  it('returns the current service status', () => {
    const status = { initialized: true, apiKeyConfigured: true };
    mockAmapService.getServiceStatus.mockReturnValue(status);

    expect(controller.getStatus()).toEqual(status);
  });

  describe('geocode', () => {
    it('delegates to the service for valid requests', async () => {
      const response = { status: '1', geocodes: [] };
      mockAmapService.geocode.mockResolvedValue(response);

      await expect(
        controller.geocode('1 Main Street', 'Shanghai'),
      ).resolves.toEqual(response);
      expect(mockAmapService.geocode).toHaveBeenCalledWith(
        '1 Main Street',
        'Shanghai',
      );
    });

    it('rejects empty addresses', async () => {
      await expect(controller.geocode('')).rejects.toThrow(Error);
    });
  });

  describe('regeocode', () => {
    it('delegates to the service for valid coordinates', async () => {
      const response = { status: '1', regeocode: {} };
      mockAmapService.regeocode.mockResolvedValue(response);

      await expect(controller.regeocode(121.47, 31.23)).resolves.toEqual(
        response,
      );
      expect(mockAmapService.regeocode).toHaveBeenCalledWith(121.47, 31.23);
    });

    it('rejects missing coordinates', async () => {
      await expect(controller.regeocode(0, 31.23)).rejects.toThrow(Error);
      await expect(controller.regeocode(121.47, 0)).rejects.toThrow(Error);
    });
  });

  describe('calculateDistance', () => {
    it('parses the type and delegates to the service', async () => {
      const response = { status: '1', results: [] };
      mockAmapService.calculateDistance.mockResolvedValue(response);

      await expect(
        controller.calculateDistance('121.1,31.1', '121.2,31.2', '2'),
      ).resolves.toEqual(response);
      expect(mockAmapService.calculateDistance).toHaveBeenCalledWith(
        '121.1,31.1',
        '121.2,31.2',
        2,
      );
    });

    it('rejects missing endpoints', async () => {
      await expect(
        controller.calculateDistance('', '121.2,31.2'),
      ).rejects.toThrow(Error);
      await expect(
        controller.calculateDistance('121.1,31.1', ''),
      ).rejects.toThrow(Error);
    });

    it('rejects out-of-range distance types', async () => {
      await expect(
        controller.calculateDistance('121.1,31.1', '121.2,31.2', '9'),
      ).rejects.toThrow(Error);
    });
  });

  describe('calculateDistances', () => {
    it('uses the default type when no type is provided', async () => {
      const response = { status: '1', results: [] };
      mockAmapService.calculateDistances.mockResolvedValue(response);

      await expect(
        controller.calculateDistances({
          origins: ['121.1,31.1', '121.2,31.2'],
          destination: '121.3,31.3',
        }),
      ).resolves.toEqual(response);
      expect(mockAmapService.calculateDistances).toHaveBeenCalledWith(
        ['121.1,31.1', '121.2,31.2'],
        '121.3,31.3',
        1,
      );
    });

    it('rejects empty request bodies', async () => {
      await expect(
        controller.calculateDistances({
          origins: [],
          destination: '121.3,31.3',
        }),
      ).rejects.toThrow(Error);

      await expect(
        controller.calculateDistances({
          origins: ['121.1,31.1'],
          destination: '',
        }),
      ).rejects.toThrow(Error);
    });

    it('rejects invalid distance types', async () => {
      await expect(
        controller.calculateDistances({
          origins: ['121.1,31.1'],
          destination: '121.3,31.3',
          type: 4,
        }),
      ).rejects.toThrow(Error);
    });
  });

  describe('inputTips', () => {
    it('delegates to the service for valid keywords', async () => {
      const response = { status: '1', tips: [] };
      mockAmapService.inputTips.mockResolvedValue(response);

      await expect(controller.inputTips('Metro', 'Shanghai')).resolves.toEqual(
        response,
      );
      expect(mockAmapService.inputTips).toHaveBeenCalledWith(
        'Metro',
        'Shanghai',
      );
    });

    it('rejects empty keywords', async () => {
      await expect(controller.inputTips('')).rejects.toThrow(Error);
    });
  });

  describe('validateApiKey', () => {
    it('returns a success payload when the key is valid', async () => {
      mockAmapService.validateApiKey.mockResolvedValue(true);

      await expect(controller.validateApiKey()).resolves.toEqual(
        expect.objectContaining({
          valid: true,
          message: expect.stringContaining('API Key'),
        }),
      );
    });

    it('returns a failure payload when the key is invalid', async () => {
      mockAmapService.validateApiKey.mockResolvedValue(false);

      await expect(controller.validateApiKey()).resolves.toEqual(
        expect.objectContaining({
          valid: false,
          message: expect.stringContaining('API Key'),
        }),
      );
    });
  });

  describe('batchGeocode', () => {
    it('rejects empty address arrays', async () => {
      await expect(controller.batchGeocode({ addresses: [] })).rejects.toThrow(
        Error,
      );
    });

    it('rejects more than ten addresses', async () => {
      await expect(
        controller.batchGeocode({
          addresses: Array.from({ length: 11 }, (_, index) => ({
            address: `Address ${index}`,
          })),
        }),
      ).rejects.toThrow(Error);
    });

    it('reports mixed success and failure results', async () => {
      mockAmapService.geocode
        .mockResolvedValueOnce({ status: '1', geocodes: [{ id: '1' }] })
        .mockRejectedValueOnce(new Error('Lookup failed'));

      await expect(
        controller.batchGeocode({
          addresses: [
            { address: 'Address 1' },
            { address: 'Address 2', city: 'Shanghai' },
          ],
        }),
      ).resolves.toEqual({
        total: 2,
        success: 1,
        failed: 1,
        results: [
          {
            address: 'Address 1',
            city: undefined,
            success: true,
            data: { status: '1', geocodes: [{ id: '1' }] },
          },
          {
            address: 'Address 2',
            city: 'Shanghai',
            success: false,
            error: 'Lookup failed',
          },
        ],
      });
    });
  });

  describe('calculateUserToStations', () => {
    it('rejects missing user or station parameters', async () => {
      await expect(
        controller.calculateUserToStations('', '[]'),
      ).rejects.toThrow(Error);
      await expect(
        controller.calculateUserToStations('121.1,31.1', ''),
      ).rejects.toThrow(Error);
    });

    it('rejects invalid distance types', async () => {
      await expect(
        controller.calculateUserToStations('121.1,31.1', '[]', '8'),
      ).rejects.toThrow(Error);
    });

    it('rejects malformed station JSON', async () => {
      await expect(
        controller.calculateUserToStations('121.1,31.1', 'not-json'),
      ).rejects.toThrow(Error);
    });

    it('rejects non-array station payloads', async () => {
      await expect(
        controller.calculateUserToStations('121.1,31.1', '{"value":1}'),
      ).rejects.toThrow(Error);
    });

    it('rejects more than twenty stations', async () => {
      await expect(
        controller.calculateUserToStations(
          '121.1,31.1',
          JSON.stringify(
            Array.from({ length: 21 }, (_, index) => `${index},0`),
          ),
        ),
      ).rejects.toThrow(Error);
    });

    it('sorts successful results by distance', async () => {
      mockAmapService.calculateDistances.mockResolvedValue({
        status: '1',
        results: [
          { distance: 300, duration: 20 },
          { distance: 100, duration: 8 },
        ],
      });

      await expect(
        controller.calculateUserToStations(
          '121.1,31.1',
          JSON.stringify(['121.2,31.2', '121.3,31.3']),
          '1',
        ),
      ).resolves.toEqual({
        status: '1',
        results: [
          { distance: 100, duration: 8 },
          { distance: 300, duration: 20 },
        ],
      });
    });

    it('keeps unsuccessful results untouched', async () => {
      const response = {
        status: '0',
        results: [{ distance: 300 }, { distance: 100 }],
      };
      mockAmapService.calculateDistances.mockResolvedValue(response);

      await expect(
        controller.calculateUserToStations(
          '121.1,31.1',
          JSON.stringify(['121.2,31.2']),
        ),
      ).resolves.toBe(response);
    });
  });
});
