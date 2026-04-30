import { Module } from '@nestjs/common';
import { DiscountConfigController } from './discount-config.controller';
import { DiscountConfigService } from './discount-config.service';
import { PricingConfigController } from './pricing-config.controller';
import { PricingConfigService } from './pricing-config.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [DiscountConfigController, PricingConfigController],
  providers: [DiscountConfigService, PricingConfigService],
  exports: [DiscountConfigService, PricingConfigService],
})
export class DiscountConfigModule {}
