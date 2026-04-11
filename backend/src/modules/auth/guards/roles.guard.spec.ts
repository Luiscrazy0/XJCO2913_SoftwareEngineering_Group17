import { Test, TestingModule } from '@nestjs/testing';
import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';

describe('RolesGuard', () => {
  let guard: RolesGuard;

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
    jest.clearAllMocks();
  });

  const createMockContext = (user?: any) => {
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user,
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
    // 🌟 修改：直接使用字符串数组 ['ADMIN']
    mockReflector.getAllAndOverride.mockReturnValue(['ADMIN']);
    const context = createMockContext({ id: 'user-1' });

    expect(() => guard.canActivate(context)).toThrow(
      new ForbiddenException('Role information missing'),
    );
  });

  it('【异常路径】如果用户的角色不包含在 requiredRoles 里，应该抛出 ForbiddenException', () => {
    // 🌟 修改：直接使用字符串 ['ADMIN'] 和 'CUSTOMER'
    mockReflector.getAllAndOverride.mockReturnValue(['ADMIN']);
    const context = createMockContext({ id: 'user-1', role: 'CUSTOMER' });

    expect(() => guard.canActivate(context)).toThrow(
      new ForbiddenException('Insufficient role'),
    );
  });

  it('【正常路径】如果用户的角色符合 requiredRoles 的要求，应该返回 true 放行', () => {
    // 🌟 修改：直接使用字符串 ['ADMIN'] 和 'ADMIN'
    mockReflector.getAllAndOverride.mockReturnValue(['ADMIN']);
    const context = createMockContext({ id: 'admin-1', role: 'ADMIN' });

    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });
});
