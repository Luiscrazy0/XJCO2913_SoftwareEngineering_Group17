import { Injectable, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async register(
    email: string,
    password: string,
    insuranceAcknowledged: boolean = false,
    emergencyContact?: string,
  ) {
    const existing = await this.userService.findByEmail(email);
    if (existing) throw new BadRequestException('Email already exists');

    const hash = await bcrypt.hash(password, 10);
    const user = await this.userService.createUser(
      email,
      hash,
      Role.CUSTOMER,
      insuranceAcknowledged,
      emergencyContact,
    );
    return { id: user.id, email: user.email };
  }

  async login(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) throw new BadRequestException('Invalid credentials');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new BadRequestException('Invalid credentials');

    const payload = { sub: user.id, role: user.role };
    const token = this.jwtService.sign(payload);
    return { access_token: token };
  }
}
