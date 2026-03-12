import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

/**
 * AuthController is the controller responsible for handling authentication-related requests.
 */
@Controller('auth')
export class AuthController {
  /**
   * Constructor that injects the AuthService dependency.
   * @param authService - The AuthService instance to use for authentication logic.
   */
  constructor(private readonly authService: AuthService) {}

  /**
   * Endpoint for registering a new user.
   * @param body - The request body containing the user's email and password.
   * @returns The result of the user registration process.
   */
  @Post('register')
  async register(@Body() body: { email: string; password: string }) {
    return this.authService.register(body.email, body.password);
  }

  /**
   * Endpoint for user login.
   * @param body - The request body containing the user's email and password.
   * @returns The result of the user login process.
   */
  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }
}

export class RegisterDto {
  email: string
  password: string
}