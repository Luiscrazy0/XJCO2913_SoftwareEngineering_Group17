import { Test, TestingModule } from '@nestjs/testing';
import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

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

  const createMockContext = (user?: any) => {
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user, // 把伪造的 user 塞进去
        }),
      }),
    } as unknown as ExecutionContext;
  };

  it('应该成功实例化 RolesGuard', () => {
    expect(guard).toBeDefined();
  });

  it('【正常路径】如果接口没有配置 requiredRoles，应该返回 true 放行', () => {
    mockReflector.getAllAndOverride.mockReturnValue(null);
    const context = createMockContext();
    expect(guard.canActivate(context)).toBe(true);
  });

  it('【异常路径】如果请求头里解析不出 user 的 role 信息，应该抛出 ForbiddenException', () => {
    // 模拟接口需要 ADMIN 权限
    mockReflector.getAllAndOverride.mockReturnValue(['ADMIN']);
    const context = createMockContext({ id: 'user-1' }); // 不传 role

    expect(() => guard.canActivate(context)).toThrow(
      new ForbiddenException('Role information missing'),
    );
  });

  it('【异常路径】如果用户的角色不包含在 requiredRoles 里，应该抛出 ForbiddenException', () => {
    // 🌟 终极修复：直接用字符串 'ADMIN' 和 'USER'，绕开 Prisma 枚举
    mockReflector.getAllAndOverride.mockReturnValue(['ADMIN']);
    const context = createMockContext({ id: 'user-1', role: 'USER' });

    expect(() => guard.canActivate(context)).toThrow(
      new ForbiddenException('Insufficient role'),
    );
  });

  it('【正常路径】如果用户的角色符合 requiredRoles 的要求，应该返回 true 放行', () => {
    // 🌟 终极修复：直接模拟字符串完美匹配
    mockReflector.getAllAndOverride.mockReturnValue(['ADMIN']);
    const context = createMockContext({ id: 'admin-1', role: 'ADMIN' });

    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });
});
