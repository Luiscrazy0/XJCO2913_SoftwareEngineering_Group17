import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

/**
 * AuthController is the controller responsible for handling authentication-related requests.
 */
@ApiTags('auth')
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
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '用户注册', description: '创建新用户账户' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: '用户注册成功',
    schema: {
      example: {
        success: true,
        data: {
          id: 'clx1234567890',
          email: 'user@example.com',
        },
        message: 'User registered successfully',
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '邮箱已存在或请求参数错误',
    schema: {
      example: {
        success: false,
        error: 'Bad Request',
        message: 'Email already exists',
        statusCode: 400,
        timestamp: '2024-01-01T00:00:00.000Z',
        path: '/auth/register',
      },
    },
  })
  async register(@Body() body: RegisterDto) {
    return this.authService.register(body.email, body.password);
  }

  /**
   * Endpoint for user login.
   * @param body - The request body containing the user's email and password.
   * @returns The result of the user login process.
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '用户登录', description: '用户登录获取访问令牌' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: '登录成功',
    schema: {
      example: {
        success: true,
        data: {
          access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
        message: 'Login successful',
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '邮箱或密码错误',
    schema: {
      example: {
        success: false,
        error: 'Unauthorized',
        message: 'Invalid credentials',
        statusCode: 401,
        timestamp: '2024-01-01T00:00:00.000Z',
        path: '/auth/login',
      },
    },
  })
  async login(@Body() body: LoginDto) {
    return this.authService.login(body.email, body.password);
  }
}
