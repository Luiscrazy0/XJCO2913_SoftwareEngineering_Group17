import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { PaymentCardController } from './payment-card.controller';
import { PaymentCardService } from './payment-card.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [PaymentController, PaymentCardController],
  providers: [PaymentService, PaymentCardService],
  exports: [PaymentService, PaymentCardService],
})
export class PaymentModule {}