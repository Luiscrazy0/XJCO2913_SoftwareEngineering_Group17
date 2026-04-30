import { PricingConfigController } from './pricing-config.controller';
import { PricingConfigService } from './pricing-config.service';

describe('PricingConfigController', () => {
  let controller: PricingConfigController;
  let service: PricingConfigService;

  beforeEach(() => {
    service = new PricingConfigService();
    controller = new PricingConfigController(service);
  });

  describe('GET /config/pricing', () => {
    it('returns pricing config object with defaults', () => {
      const result = controller.getPricing();
      expect(result).toEqual({ HOUR_1: 5, HOUR_4: 15, DAY_1: 30, WEEK_1: 90 });
    });
  });

  describe('PUT /config/pricing/:hireType', () => {
    it('updates a price for a valid hire type', () => {
      const result = controller.updatePricing('HOUR_1', { price: 10 });
      expect(result).toEqual({ HOUR_1: 10, HOUR_4: 15, DAY_1: 30, WEEK_1: 90 });
    });

    it('throws Error for negative price', () => {
      expect(() => controller.updatePricing('HOUR_1', { price: -1 })).toThrow(
        'Price must be positive',
      );
    });
  });

  describe('PUT /config/pricing/reset', () => {
    it('resets all prices to defaults', () => {
      controller.updatePricing('HOUR_1', { price: 999 });
      const result = controller.resetPricing();
      expect(result).toEqual({ HOUR_1: 5, HOUR_4: 15, DAY_1: 30, WEEK_1: 90 });
    });
  });
});
