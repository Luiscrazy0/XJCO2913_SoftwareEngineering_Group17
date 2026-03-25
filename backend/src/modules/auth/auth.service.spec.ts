import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service'; 
import { JwtService } from '@nestjs/jwt';
import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  // 1. 创建假的 UserService 和 JwtService (Mock 对象)
  const mockUserService = {
    findByEmail: jest.fn(),
    createUser: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    // 2. 搭建测试模块环境
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);

    // 每次测试前清空所有 Mock 的调用记录，防止互相干扰
    jest.clearAllMocks();
  });

  it('模块应该被成功定义', () => {
    expect(authService).toBeDefined();
  });

  // ==========================================
  // 测试组 1: register (注册逻辑)
  // ==========================================
  describe('register', () => {
    const testEmail = 'test@liverpool.ac.uk';
    const testPassword = 'password123';

    it('【异常路径】如果邮箱已存在，应该抛出 BadRequestException', async () => {
      // 假设 UserService 查到了这个用户
      mockUserService.findByEmail.mockResolvedValue({ id: 1, email: testEmail });

      // 断言：调用 register 时会抛出我们期望的错误
      await expect(authService.register(testEmail, testPassword))
        .rejects
        .toThrow(new BadRequestException('Email already exists'));
    });

    it('【正常路径】应该成功加密密码并创建新用户', async () => {
      // 1. 假设邮箱没被注册过
      mockUserService.findByEmail.mockResolvedValue(null);
      
      // 2. 拦截 bcrypt.hash，直接返回假哈希值（提高测试速度，不消耗 CPU 计算）
      jest.spyOn(bcrypt, 'hash').mockImplementation(async () => 'fake_hashed_password');
      
      // 3. 假设 UserService 成功创建了用户
      mockUserService.createUser.mockResolvedValue({ id: 1, email: testEmail, passwordHash: 'fake_hashed_password' });

      // 执行测试代码
      const result = await authService.register(testEmail, testPassword);

      // 断言
      expect(mockUserService.findByEmail).toHaveBeenCalledWith(testEmail);
      expect(bcrypt.hash).toHaveBeenCalledWith(testPassword, 10);
      expect(mockUserService.createUser).toHaveBeenCalledWith(testEmail, 'fake_hashed_password');
      expect(result).toEqual({ id: 1, email: testEmail });
    });
  });

  // ==========================================
  // 测试组 2: login (登录逻辑)
  // ==========================================
  describe('login', () => {
    const testEmail = 'test@liverpool.ac.uk';
    const testPassword = 'password123';
    const fakeUser = { id: 1, email: testEmail, passwordHash: 'fake_hashed_password', role: 'USER' };

    it('【异常路径】如果用户不存在，应该抛出 Invalid credentials', async () => {
      mockUserService.findByEmail.mockResolvedValue(null);

      await expect(authService.login(testEmail, testPassword))
        .rejects
        .toThrow(new BadRequestException('Invalid credentials'));
    });

    it('【异常路径】如果密码错误，应该抛出 Invalid credentials', async () => {
      mockUserService.findByEmail.mockResolvedValue(fakeUser);
      // 拦截 bcrypt.compare，让它返回 false (密码校验失败)
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => false);

      await expect(authService.login(testEmail, testPassword))
        .rejects
        .toThrow(new BadRequestException('Invalid credentials'));
    });

    it('【正常路径】登录成功应该返回 access_token', async () => {
      mockUserService.findByEmail.mockResolvedValue(fakeUser);
      // 密码校验成功
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true);
      // 假设 JwtService 签发了 Token
      mockJwtService.sign.mockReturnValue('fake_jwt_token');

      const result = await authService.login(testEmail, testPassword);

      expect(bcrypt.compare).toHaveBeenCalledWith(testPassword, fakeUser.passwordHash);
      expect(mockJwtService.sign).toHaveBeenCalledWith({ sub: fakeUser.id, role: fakeUser.role });
      expect(result).toEqual({ access_token: 'fake_jwt_token' });
    });
  });
});
