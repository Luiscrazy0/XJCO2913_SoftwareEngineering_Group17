import { Injectable } from '@nestjs/common';

export interface PricingItem {
  hireType: string;
  price: number;
}

@Injectable()
export class PricingConfigService {
  private pricing: Record<string, number> = {
    HOUR_1: 5,
    HOUR_4: 15,
    DAY_1: 30,
    WEEK_1: 90,
  };

  getAllPricing(): PricingItem[] {
    return Object.entries(this.pricing).map(([hireType, price]) => ({
      hireType,
      price,
    }));
  }

  getPrice(hireType: string): number | undefined {
    return this.pricing[hireType];
  }

  updatePrice(hireType: string, price: number): boolean {
    if (!(hireType in this.pricing)) return false;
    this.pricing[hireType] = price;
    return true;
  }

  resetToDefaults(): void {
    this.pricing = { HOUR_1: 5, HOUR_4: 15, DAY_1: 30, WEEK_1: 90 };
  }
}
