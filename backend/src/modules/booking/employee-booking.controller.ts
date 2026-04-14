import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { EmployeeBookingService } from './employee-booking.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('employee-bookings')
@UseGuards(JwtAuthGuard)
export class EmployeeBookingController {
  constructor(
    private readonly employeeBookingService: EmployeeBookingService,
  ) {}

  @Post()
  async createBookingForGuest(
    @Request() req,
    @Body()
    bookingData: {
      guestEmail: string;
      guestName: string;
      scooterId: string;
      hireType: string;
      startTime: string;
      endTime: string;
    },
  ) {
    const employeeId = req.user.id;
    return this.employeeBookingService.createBookingForGuest(
      employeeId,
      bookingData.guestEmail,
      bookingData.guestName,
      bookingData.scooterId,
      bookingData.hireType,
      new Date(bookingData.startTime),
      new Date(bookingData.endTime),
    );
  }

  @Get()
  async getMyEmployeeBookings(@Request() req) {
    const employeeId = req.user.id;
    return this.employeeBookingService.getEmployeeBookings(employeeId);
  }
}
