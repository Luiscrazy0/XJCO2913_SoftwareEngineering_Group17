import { Module } from '@nestjs/common';
import { PricingConfigController } from './pricing-config.controller';
import { PricingConfigService } from './pricing-config.service';
import { DiscountConfigController } from './discount-config.controller';
import { DiscountConfigService } from './discount-config.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [PricingConfigController, DiscountConfigController],
  providers: [PricingConfigService, DiscountConfigService],
  exports: [PricingConfigService, DiscountConfigService],
})
export class ConfigModule {}
