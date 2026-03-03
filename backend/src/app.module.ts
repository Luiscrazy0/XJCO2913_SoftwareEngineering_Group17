// backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './modules/health/health.module';
import { UserModule } from './user/user.module'; // <- 相对路径必须正确

@Module({
  imports: [HealthModule, UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}