// backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './modules/health/health.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ScooterModule } from './modules/scooter/scooter.module';
import { BookingModule } from './modules/booking/booking.module';
import { PaymentModule } from './modules/payment/payment.module'; // <- PaymentModule registration
import { StationModule } from './modules/station/station.module'; // <- 新增StationModule

@Module({
  imports: [
    HealthModule,
    PrismaModule,
    UserModule,
    AuthModule,
    ScooterModule,
    BookingModule,
    PaymentModule, // <- PaymentModule registration
    StationModule, // <- 新增StationModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
