import { Module } from '@nestjs/common';
import { ScooterController } from './scooter.controller';
import { ScooterService } from './scooter.service';
import { PrismaModule } from '../../prisma/prisma.module'; 
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ScooterController],
  providers: [ScooterService],
})
export class ScooterModule {} 
