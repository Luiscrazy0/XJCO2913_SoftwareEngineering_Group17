import { Module } from '@nestjs/common';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { DiscountService } from './discount.service';
import { EmailService } from './email.service';
import { PaymentCardService } from './payment-card.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [BookingController],
  providers: [BookingService, DiscountService, EmailService, PaymentCardService],
  exports: [BookingService, DiscountService, EmailService, PaymentCardService],
})
export class BookingModule {}