import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BookingStatus, HireType, ScooterStatus } from '@prisma/client';

@Injectable()
export class BookingService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.booking.findMany({
      include: {
        // Include user and scooter details
        user: true,
        scooter: true, 

      },
    });
  }

  
  async findById(id: string) {
    // Find booking by ID and include user and scooter 
    return this.prisma.booking.findUnique({
      where: { id }, // Use where clause to find booking by ID
      include: {
        user: true,
        scooter: true,
        payment: true,
      },
    });
  }

  async createBooking(
    // booking creation
    userId: string,
    scooterId: string,
    hireType: HireType,
    startTime: Date,
    endTime: Date,
  ) {
    
    const scooter = await this.prisma.scooter.findUnique({
        // Find scooter by ID
      where: { id: scooterId },
    });

    if (!scooter) {
        // Check if scooter exists
      throw new BadRequestException('Scooter not found');
    }

    if (scooter.status !== ScooterStatus.AVAILABLE) {
        // Check if scooter is available
      throw new BadRequestException('Scooter not available');
    }

    const totalCost = this.calculateCost(hireType);
    // Calculate total cost based on hire type

    return this.prisma.booking.create({
        // Create booking in database and include related user and scooter details
      data: {
        userId,
        scooterId,
        hireType,
        startTime,
        endTime,
        totalCost,
        status: BookingStatus.PENDING_PAYMENT,
        // Set status to PENDING_PAYMENT
      },
      include: {
        user: true,
        scooter: true,
      },
    });
  }

  async cancelBooking(id: string) {
    // Cancel booking by ID
    return this.prisma.booking.update({
        // Update booking status to CANCELLED
      where: { id },
      data: { status: BookingStatus.CANCELLED },
      include: {
        user: true,
        scooter: true,
      },
    });
  }

  private calculateCost(hireType: HireType): number {
    // Calculate cost based on hire type
    switch (hireType) {

        // Define cost for each hire type
      case HireType.HOUR_1:
        return 5;
      case HireType.HOUR_4:
        return 15;
      case HireType.DAY_1:
        return 40;
      case HireType.WEEK_1:
        return 200;
      default:
        return 0;
    }
  }
}
