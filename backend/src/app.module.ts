import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './modules/health/health.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ScooterModule } from './modules/scooter/scooter.module';
import { BookingModule } from './modules/booking/booking.module';
import { PaymentModule } from './modules/payment/payment.module';
import { StationModule } from './modules/station/station.module';
import { StatisticsModule } from './modules/statistics/statistics.module';
import { AmapModule } from './modules/amap/amap.module';
import { FeedbackModule } from './modules/feedback/feedback.module';
import { ConfigModule } from './modules/config/config.module';
import { EventsModule } from './modules/events/events.module';
import { UploadModule } from './modules/upload/upload.module';
import { RequestIdMiddleware } from './middleware/request-id.middleware';
import { LoggerMiddleware } from './middleware/logger.middleware';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    HealthModule,
    PrismaModule,
    UserModule,
    AuthModule,
    ScooterModule,
    BookingModule,
    PaymentModule,
    StationModule,
    StatisticsModule,
    AmapModule,
    FeedbackModule,
    ConfigModule,
    EventsModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware, LoggerMiddleware).forRoutes('*');
  }
}
