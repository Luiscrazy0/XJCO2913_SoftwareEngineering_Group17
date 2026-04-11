import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

// 🌟 关键修复：在最顶层让 Jest 直接接管整个 bcrypt 库
jest.mock('bcrypt');

describe('AuthService', () => {
  let authService: AuthService;

  const mockUserService = {
    findByEmail: jest.fn(),
    createUser: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  it('模块应该被成功定义', () => {
    expect(authService).toBeDefined();
  });

  describe('register', () => {
    const testEmail = 'test@liverpool.ac.uk';
    const testPassword = 'password123';

    it('【异常路径】如果邮箱已存在，应该抛出 BadRequestException', async () => {
      mockUserService.findByEmail.mockResolvedValue({
        id: 1,
        email: testEmail,
      });

      await expect(
        authService.register(testEmail, testPassword),
      ).rejects.toThrow(new BadRequestException('Email already exists'));
    });

    it('【正常路径】应该成功加密密码并创建新用户', async () => {
      mockUserService.findByEmail.mockResolvedValue(null);

      // 🌟 关键修复：直接强制返回结果，不再使用 spyOn
      (bcrypt.hash as jest.Mock).mockResolvedValue('fake_hashed_password');

      mockUserService.createUser.mockResolvedValue({
        id: 1,
        email: testEmail,
        passwordHash: 'fake_hashed_password',
      });

      const result = await authService.register(testEmail, testPassword);

      expect(mockUserService.findByEmail).toHaveBeenCalledWith(testEmail);
      expect(bcrypt.hash).toHaveBeenCalledWith(testPassword, 10);
      expect(mockUserService.createUser).toHaveBeenCalledWith(
        testEmail,
        'fake_hashed_password',
      );
      expect(result).toEqual({ id: 1, email: testEmail });
    });
  });

  describe('login', () => {
    const testEmail = 'test@liverpool.ac.uk';
    const testPassword = 'password123';
    const fakeUser = {
      id: 1,
      email: testEmail,
      passwordHash: 'fake_hashed_password',
      role: 'USER',
    };

    it('【异常路径】如果用户不存在，应该抛出 Invalid credentials', async () => {
      mockUserService.findByEmail.mockResolvedValue(null);

      await expect(authService.login(testEmail, testPassword)).rejects.toThrow(
        new BadRequestException('Invalid credentials'),
      );
    });

    it('【异常路径】如果密码错误，应该抛出 Invalid credentials', async () => {
      mockUserService.findByEmail.mockResolvedValue(fakeUser);

      // 🌟 关键修复
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(authService.login(testEmail, testPassword)).rejects.toThrow(
        new BadRequestException('Invalid credentials'),
      );
    });

    it('【正常路径】登录成功应该返回 access_token', async () => {
      mockUserService.findByEmail.mockResolvedValue(fakeUser);

      // 🌟 关键修复
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      mockJwtService.sign.mockReturnValue('fake_jwt_token');

      const result = await authService.login(testEmail, testPassword);

      expect(bcrypt.compare).toHaveBeenCalledWith(
        testPassword,
        fakeUser.passwordHash,
      );
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: fakeUser.id,
        role: fakeUser.role,
      });
      expect(result).toEqual({ access_token: 'fake_jwt_token' });
    });
  });
});
