import { Module } from '@nestjs/common';
import { PricingConfigController } from './pricing-config.controller';
import { PricingConfigService } from './pricing-config.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [PricingConfigController],
  providers: [PricingConfigService],
  exports: [PricingConfigService],
})
export class ConfigModule {}
