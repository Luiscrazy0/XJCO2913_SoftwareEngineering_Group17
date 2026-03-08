import { Module } from '@nestjs/common';
import { ScooterController } from './scooter.controller';
import { ScooterService } from './scooter.service';
import { PrismaModule } from '../../prisma/prisma.module'; 

@Module({
  imports: [PrismaModule],
  controllers: [ScooterController],
  providers: [ScooterService],
})
export class ScooterModule {} 
