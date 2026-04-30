import { Module } from '@nestjs/common';
import { DiscountConfigController } from './discount-config.controller';
import { DiscountConfigService } from './discount-config.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [DiscountConfigController],
  providers: [DiscountConfigService],
  exports: [DiscountConfigService],
})
export class DiscountConfigModule {}
