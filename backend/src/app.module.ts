// backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './modules/health/health.module';
import { UserModule } from './modules/user/user.module'; // <- 相对路径必须正确
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ScooterModule } from './modules/scooter/scooter.module';

@Module({
  imports: [HealthModule, PrismaModule, UserModule, AuthModule,ScooterModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}