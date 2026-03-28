import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ScooterService } from './scooter.service';
import { Role } from '@prisma/client';
import { CreateScooterDto } from './dto/create-scooter.dto';
import { UpdateScooterStatusDto } from './dto/update-scooter-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';

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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MANAGER)
  @Post()
  create(@Body() body: CreateScooterDto) 
  // Add dto validation for location
  {
    return this.scooterService.createScooter(body.location);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MANAGER)
  @Patch(':id/status')
    updateStatus(
      @Param('id') id: string,
      @Body() body: UpdateScooterStatusDto,
    ) {
      return this.scooterService.updateStatus(id, body.status);
    }
}
