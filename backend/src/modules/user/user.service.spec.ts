import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../../prisma/prisma.service'; // 请确认路径是否正确
import { Role } from '@prisma/client';

describe('UserService', () => {
  let userService: UserService;
  // 🌟 删除了无用的 let prismaService: PrismaService;

  // 1. 创建一个假的 PrismaService（代替真实数据库）
  const mockPrismaService = {
    user: {
      findMany: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    // 2. 搭建测试模块环境
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    // 🌟 删除了无用的 prismaService = module.get<PrismaService>(PrismaService);

    // 每次测试前清空调用记录
    jest.clearAllMocks();
  });

  it('模块应该被成功定义', () => {
    expect(userService).toBeDefined();
  });

  // ==========================================
  // 测试组 1: findAll (获取所有用户)
  // ==========================================
  describe('findAll', () => {
    it('应该成功返回只包含特定字段（id, email, role）的用户列表', async () => {
      // 准备假数据
      const mockUsers = [
        { id: 1, email: 'user1@liverpool.ac.uk', role: Role.CUSTOMER },
        { id: 2, email: 'admin@liverpool.ac.uk', role: Role.MANAGER },
      ];
      // 告诉假数据库：当调用 findMany 时，返回 mockUsers
      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);

      const result = await userService.findAll();

      // 断言：检查是否传递了正确的 select 参数给 Prisma
      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        select: { id: true, email: true, role: true },
      });
      // 断言：检查返回值
      expect(result).toEqual(mockUsers);
    });
  });

  // ==========================================
  // 测试组 2: createUser (创建用户)
  // ==========================================
  describe('createUser', () => {
    it('如果没有传角色，应该默认以 CUSTOMER 角色创建新用户', async () => {
      const testEmail = 'new@liverpool.ac.uk';
      const testPasswordHash = 'hashed_password_123';
      const mockCreatedUser = { id: 3, email: testEmail, role: Role.CUSTOMER };

      mockPrismaService.user.create.mockResolvedValue(mockCreatedUser);

      // 调用方法时，故意不传第三个 role 参数
      const result = await userService.createUser(testEmail, testPasswordHash);

      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: testEmail,
          passwordHash: testPasswordHash,
          role: Role.CUSTOMER,
          insuranceAcknowledged: false,
          emergencyContact: undefined,
        },
      });
      expect(result).toEqual(mockCreatedUser);
    });
  });

  // ==========================================
  // 测试组 3: findByEmail (根据邮箱查找用户)
  // ==========================================
  describe('findByEmail', () => {
    const testEmail = 'target@liverpool.ac.uk';

    it('【正常路径】如果邮箱存在，应该返回匹配的用户对象', async () => {
      const mockUser = { id: 4, email: testEmail, role: Role.CUSTOMER };
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await userService.findByEmail(testEmail);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: testEmail },
      });
      expect(result).toEqual(mockUser);
    });

    it('【异常路径】如果邮箱不存在，应该返回 null', async () => {
      // 告诉假数据库：查无此人
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await userService.findByEmail('wrong@liverpool.ac.uk');

      expect(result).toBeNull();
    });
  });
});
