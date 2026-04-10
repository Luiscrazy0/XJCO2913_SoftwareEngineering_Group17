import { Test, TestingModule } from '@nestjs/testing';
import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Role } from '@prisma/client';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  // 1. 模拟 Reflector (用来读取 @Roles 装饰器里的数据)
  const mockReflector = {
    getAllAndOverride: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
    jest.clearAllMocks();
  });

  // 🌟 核心技巧：封装一个函数，用来快速伪造各种情况的 HTTP 请求和上下文
  const createMockContext = (user?: any) => {
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user, // 把我们伪造的 user 塞进 request 里
        }),
      }),
    } as unknown as ExecutionContext;
  };

  it('应该成功实例化 RolesGuard', () => {
    expect(guard).toBeDefined();
  });

  // ==========================================
  // 测试分支 1: 接口不需要特定角色，直接放行
  // ==========================================
  it('【正常路径】如果接口没有配置 requiredRoles，应该返回 true 放行', () => {
    // 模拟 Reflector 找不到任何角色要求 (返回 null 或 空数组)
    mockReflector.getAllAndOverride.mockReturnValue(null);
    
    const context = createMockContext();
    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });

  // ==========================================
  // 测试分支 2: 请求里没带 User 或者没有 Role，直接拦截
  // ==========================================
  it('【异常路径】如果请求头里解析不出 user 的 role 信息，应该抛出 ForbiddenException', () => {
    // 模拟这个接口需要 ADMIN 角色
    mockReflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);
    
    // 模拟一个没有 role 属性的用户来访问
    const context = createMockContext({ id: 'user-1' });

    expect(() => guard.canActivate(context)).toThrow(
      new ForbiddenException('Role information missing')
    );
  });

  // ==========================================
  // 测试分支 3: 角色级别不够，直接拦截
  // ==========================================
  it('【异常路径】如果用户的角色不包含在 requiredRoles 里，应该抛出 ForbiddenException', () => {
    // 模拟这个接口需要 ADMIN 角色
    mockReflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);
    
    // 模拟一个普通 USER 来访问
    const context = createMockContext({ id: 'user-1', role: Role.USER });

    expect(() => guard.canActivate(context)).toThrow(
      new ForbiddenException('Insufficient role')
    );
  });

  // ==========================================
  // 测试分支 4: 角色匹配，验证通过
  // ==========================================
  it('【正常路径】如果用户的角色符合 requiredRoles 的要求，应该返回 true 放行', () => {
    // 模拟这个接口需要 ADMIN 角色
    mockReflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);
    
    // 模拟一个 ADMIN 大佬来访问
    const context = createMockContext({ id: 'admin-1', role: Role.ADMIN });

    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });
});
