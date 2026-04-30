import { Injectable } from '@nestjs/common';

export interface DiscountRate {
  userType: string;
  rate: number;
}

@Injectable()
export class DiscountConfigService {
  private discountRates: Record<string, number> = {
    STUDENT: 0.2,
    SENIOR: 0.3,
    FREQUENT_50H: 0.25,
    FREQUENT_20H: 0.15,
  };

  getAllDiscounts(): DiscountRate[] {
    return Object.entries(this.discountRates).map(([userType, rate]) => ({
      userType,
      rate,
    }));
  }

  getDiscount(userType: string): number | undefined {
    return this.discountRates[userType];
  }

  updateDiscount(userType: string, rate: number): boolean {
    if (!(userType in this.discountRates)) {
      return false;
    }
    this.discountRates[userType] = rate;
    return true;
  }

  resetToDefaults(): void {
    this.discountRates = {
      STUDENT: 0.2,
      SENIOR: 0.3,
      FREQUENT_50H: 0.25,
      FREQUENT_20H: 0.15,
    };
  }
}
