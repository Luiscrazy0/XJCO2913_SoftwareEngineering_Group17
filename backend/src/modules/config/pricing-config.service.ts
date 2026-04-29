import { Injectable } from '@nestjs/common';
import { HireType } from '@prisma/client';

export interface PricingConfig {
  HOUR_1: number;
  HOUR_4: number;
  DAY_1: number;
  WEEK_1: number;
}

const defaultPricing: PricingConfig = {
  HOUR_1: 5,
  HOUR_4: 15,
  DAY_1: 30,
  WEEK_1: 90,
};

@Injectable()
export class PricingConfigService {
  private pricing: PricingConfig = { ...defaultPricing };

  getPricing(): PricingConfig {
    return { ...this.pricing };
  }

  updatePricing(hireType: HireType, price: number): PricingConfig {
    if (price <= 0) throw new Error('Price must be positive');
    this.pricing[hireType] = price;
    return { ...this.pricing };
  }

  getCost(hireType: HireType): number {
    return this.pricing[hireType] ?? defaultPricing[hireType] ?? 0;
  }

  resetPricing(): PricingConfig {
    this.pricing = { ...defaultPricing };
    return { ...this.pricing };
  }
}
