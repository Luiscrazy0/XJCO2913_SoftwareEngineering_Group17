import { NotFoundException, BadRequestException } from '@nestjs/common';
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
    it('returns all pricing items with defaults', () => {
      const result = controller.getAllPricing();
      expect(result).toHaveLength(4);
      expect(result).toEqual(
        expect.arrayContaining([
          { hireType: 'HOUR_1', price: 5 },
          { hireType: 'HOUR_4', price: 15 },
          { hireType: 'DAY_1', price: 30 },
          { hireType: 'WEEK_1', price: 90 },
        ]),
      );
    });
  });

  describe('PUT /config/pricing/:hireType', () => {
    it('updates a price for a valid hire type', () => {
      const result = controller.updatePrice('HOUR_1', { price: 10 });
      expect(result).toEqual({ message: '价格更新成功' });
      const pricing = service.getAllPricing();
      const hour1 = pricing.find((p) => p.hireType === 'HOUR_1');
      expect(hour1?.price).toBe(10);
    });

    it('throws NotFoundException for invalid hire type', () => {
      expect(() => controller.updatePrice('INVALID', { price: 5 })).toThrow(
        NotFoundException,
      );
    });

    it('throws BadRequestException when price is missing', () => {
      expect(() =>
        controller.updatePrice('HOUR_1', {} as { price: number }),
      ).toThrow(BadRequestException);
    });

    it('throws BadRequestException when price is negative', () => {
      expect(() => controller.updatePrice('HOUR_1', { price: -1 })).toThrow(
        BadRequestException,
      );
    });
  });

  describe('POST /config/pricing/reset', () => {
    it('resets all prices to defaults', () => {
      controller.updatePrice('HOUR_1', { price: 999 });
      controller.resetPricing();
      const pricing = service.getAllPricing();
      const hour1 = pricing.find((p) => p.hireType === 'HOUR_1');
      expect(hour1?.price).toBe(5);
    });
  });
});
