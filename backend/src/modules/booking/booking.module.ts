import { Module, forwardRef } from '@nestjs/common';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { EmployeeBookingController } from './employee-booking.controller';
import { EmployeeBookingService } from './employee-booking.service';
import { DiscountService } from './discount.service';
import { EmailService } from './email.service';
import { PaymentCardService } from './payment-card.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { EmailModule } from '../email/email.module';
import { ConfigModule } from '../config/config.module';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => AuthModule),
    EmailModule,
    ConfigModule,
  ],
  controllers: [BookingController, EmployeeBookingController],
  providers: [
    BookingService,
    EmployeeBookingService,
    DiscountService,
    EmailService,
    PaymentCardService,
  ],
  exports: [
    BookingService,
    EmployeeBookingService,
    DiscountService,
    EmailService,
    PaymentCardService,
  ],
})
export class BookingModule {}
