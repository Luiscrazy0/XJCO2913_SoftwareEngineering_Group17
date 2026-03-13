import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { BookingService } from './booking.service';
import { HireType } from '@prisma/client';
import { CreateBookingDto } from './dto/create-booking.dto';

@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Get()
  findAll() {
    return this.bookingService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookingService.findById(id);
  }

  @Post()
  create(@Body()body: CreateBookingDto)
  // Dto
  {
    return this.bookingService.createBooking(
      body.userId,
      body.scooterId,
      body.hireType,
      new Date(body.startTime),
      new Date(body.endTime),
    );
  }

  @Patch(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.bookingService.cancelBooking(id);
  }
}