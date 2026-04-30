import { NotFoundException, BadRequestException } from '@nestjs/common';
import { DiscountConfigController } from './discount-config.controller';
import { DiscountConfigService } from './discount-config.service';

describe('DiscountConfigController', () => {
  let controller: DiscountConfigController;
  let service: DiscountConfigService;

  beforeEach(() => {
    service = new DiscountConfigService();
    controller = new DiscountConfigController(service);
  });

  describe('GET /config/discounts', () => {
    it('returns all discount rates with defaults', () => {
      const result = controller.getAllDiscounts();
      expect(result).toHaveLength(4);
      expect(result).toEqual(
        expect.arrayContaining([
          { userType: 'STUDENT', rate: 0.2 },
          { userType: 'SENIOR', rate: 0.3 },
          { userType: 'FREQUENT_50H', rate: 0.25 },
          { userType: 'FREQUENT_20H', rate: 0.15 },
        ]),
      );
    });
  });

  describe('PUT /config/discounts/:userType', () => {
    it('updates a discount rate for a valid user type', () => {
      const result = controller.updateDiscount('STUDENT', { rate: 0.15 });
      expect(result).toEqual({ message: '折扣率更新成功' });
      const discounts = service.getAllDiscounts();
      const student = discounts.find((d) => d.userType === 'STUDENT');
      expect(student?.rate).toBe(0.15);
    });

    it('throws NotFoundException for invalid user type', () => {
      expect(() => controller.updateDiscount('INVALID', { rate: 0.5 })).toThrow(
        NotFoundException,
      );
    });

    it('throws BadRequestException when rate is missing', () => {
      expect(() =>
        controller.updateDiscount('STUDENT', {} as { rate: number }),
      ).toThrow(BadRequestException);
    });

    it('throws BadRequestException when rate is out of range', () => {
      expect(() => controller.updateDiscount('STUDENT', { rate: 1.5 })).toThrow(
        BadRequestException,
      );
    });

    it('throws BadRequestException when rate is negative', () => {
      expect(() =>
        controller.updateDiscount('STUDENT', { rate: -0.1 }),
      ).toThrow(BadRequestException);
    });
  });
});
