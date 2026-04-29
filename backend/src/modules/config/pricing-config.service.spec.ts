import { PricingConfigService } from './pricing-config.service';

describe('PricingConfigService', () => {
  let service: PricingConfigService;

  beforeEach(() => {
    service = new PricingConfigService();
  });

  it('returns default pricing', () => {
    const pricing = service.getPricing();
    expect(pricing.HOUR_1).toBe(5);
    expect(pricing.HOUR_4).toBe(15);
    expect(pricing.DAY_1).toBe(30);
    expect(pricing.WEEK_1).toBe(90);
  });

  it('updates a specific hire type price', () => {
    service.updatePricing('HOUR_1', 10);
    expect(service.getCost('HOUR_1')).toBe(10);
  });

  it('throws when price is not positive', () => {
    expect(() => service.updatePricing('HOUR_1', 0)).toThrow('Price must be positive');
    expect(() => service.updatePricing('HOUR_1', -5)).toThrow('Price must be positive');
  });

  it('resets to defaults', () => {
    service.updatePricing('HOUR_1', 100);
    service.resetPricing();
    expect(service.getCost('HOUR_1')).toBe(5);
  });

  it('getCost returns correct default', () => {
    expect(service.getCost('HOUR_4')).toBe(15);
    expect(service.getCost('DAY_1')).toBe(30);
  });
});
