import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { ScooterService } from './scooter.service';
import { ScooterStatus } from '@prisma/client';
import { CreateScooterDto } from './dto/create-scooter.dto';
import { UpdateScooterStatusDto } from './dto/update-scooter-status.dto';

@Controller('scooters')
export class ScooterController {
  constructor(private readonly scooterService: ScooterService) {}

  @Get()
  findAll() {
    return this.scooterService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.scooterService.findById(id);
  }

  @Post()
  create(@Body() body: CreateScooterDto) 
  // Add dto validation for location
  {
    return this.scooterService.createScooter(body.location);
  }

  @Patch(':id/status')
    updateStatus(
      @Param('id') id: string,
      @Body() body: UpdateScooterStatusDto,
    ) {
      return this.scooterService.updateStatus(id, body.status);
    }
}