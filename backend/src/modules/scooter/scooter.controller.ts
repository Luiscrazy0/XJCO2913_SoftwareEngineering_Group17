import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { ScooterService } from './scooter.service';
import { ScooterStatus } from '@prisma/client';

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
  create(@Body() body: { location: string }) {
    return this.scooterService.createScooter(body.location);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: ScooterStatus },
  ) {
    return this.scooterService.updateStatus(id, body.status);
  }
}