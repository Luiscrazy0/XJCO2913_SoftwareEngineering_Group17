import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: { id: true, email: true, role: true },
    });
  }

  async createUser(email: string,passwordHash: string, role: Role = Role.CUSTOMER) {
    return this.prisma.user.create({
      data: { email, passwordHash, role },
    });
  }
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

}