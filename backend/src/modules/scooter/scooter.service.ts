// backend/src/modules/scooter/scooter.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ScooterStatus } from '@prisma/client';

@Injectable()
export class ScooterService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.scooter.findMany();
  }
  async findById(id: string) {
    return this.prisma.scooter.findUnique({
      where: { id },
    });
  }

  async createScooter(location: string) {
    return this.prisma.scooter.create({
      data: {
        location,
      },
    });
  }

  async updateStatus(id: string, status: ScooterStatus) {
    return this.prisma.scooter.update({
      where: { id },
      data: { status },
    });
  }

  async deleteScooter(id: string) {
    return this.prisma.scooter.delete({
      where: { id },
    });
  }
}