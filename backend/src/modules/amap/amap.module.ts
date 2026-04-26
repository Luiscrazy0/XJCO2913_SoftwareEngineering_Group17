import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { AmapController } from './amap.controller';
import { AmapService } from './amap.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    ConfigModule.forRoot({ isGlobal: true }),
  ],
  controllers: [AmapController],
  providers: [AmapService],
  exports: [AmapService],
})
export class AmapModule {}
