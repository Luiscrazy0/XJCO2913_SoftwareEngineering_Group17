import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let jwtService: JwtService;

  // 1. 模拟 JwtService
  const mockJwtService = {
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
    jwtService = module.get<JwtService>(JwtService);
    jest.clearAllMocks();
  });

  // 🌟 核心技巧：封装一个函数，用来快速伪造请求头
  const createMockContext = (reqObject: any) => {
    return {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(reqObject),
      }),
    } as unknown as ExecutionContext;
  };

  it('应该成功实例化 JwtAuthGuard', () => {
    expect(guard).toBeDefined();
  });

  // ==========================================
  // 测试分支 1: 完全没传 Authorization 头
  // ==========================================
  it('【异常路径】如果没有 Authorization header，应该抛出 UnauthorizedException', () => {
    const req = { headers: {} }; // 啥也没传
    const context = createMockContext(req);
    
    expect(() => guard.canActivate(context)).toThrow(
      new UnauthorizedException('Missing or invalid Authorization header')
    );
  });

  // ==========================================
  // 测试分支 2: 传了，但格式不对 (比如没写 Bearer)
  // ==========================================
  it('【异常路径】如果 header 不是以 Bearer 开头，应该抛出 UnauthorizedException', () => {
    const req = { headers: { authorization: 'Basic badtoken123' } }; // 格式错误
    const context = createMockContext(req);
    
    expect(() => guard.canActivate(context)).toThrow(
      new UnauthorizedException('Missing or invalid Authorization header')
    );
  });

  // ==========================================
  // 测试分支 3: Token 是伪造的或过期了
  // ==========================================
  it('【异常路径】如果 token 解析失败或过期，应该抛出 UnauthorizedException', () => {
    const req = { headers: { authorization: 'Bearer fake-token' } };
    const context = createMockContext(req);
    
    // 模拟 JwtService 验证失败抛出异常
    mockJwtService.verify.mockImplementation(() => {
      throw new Error('jwt expired');
    });

    expect(() => guard.canActivate(context)).toThrow(
      new UnauthorizedException('Invalid or expired token')
    );
  });

  // ==========================================
  // 测试分支 4: 验证通过，把用户数据塞进 Request
  // ==========================================
  it('【正常路径】如果 token 有效，应该将 payload 赋值给 request.user 并返回 true', () => {
    const mockPayload = { userId: '123', role: 'USER' };
    const req = { headers: { authorization: 'Bearer good-token' } };
    const context = createMockContext(req);

    // 模拟 JwtService 验证成功，返回解析出的用户信息
    mockJwtService.verify.mockReturnValue(mockPayload);

    const result = guard.canActivate(context);

    // 严谨验证：
    // 1. 返回了 true 放行
    expect(result).toBe(true);
    // 2. 截取字符串是对的 (去掉了前 7 个字符 'Bearer ')
    expect(mockJwtService.verify).toHaveBeenCalledWith('good-token');
    // 3. 用户信息被成功挂载到了 request.user 上
    expect((req as any).user).toEqual(mockPayload);
  });
});
