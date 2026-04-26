import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

type AuthServiceMock = Pick<AuthService, 'register' | 'login'>;

const mockAuthService: jest.Mocked<AuthServiceMock> = {
  register: jest.fn(),
  login: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(() => {
    controller = new AuthController(mockAuthService as unknown as AuthService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('passes register payload to AuthService.register', async () => {
    const body = {
      email: 'user@example.com',
      password: 'secret123',
      insuranceAcknowledged: true,
      emergencyContact: 'Alice',
    };

    await controller.register(body);

    expect(mockAuthService.register).toHaveBeenCalledWith(
      body.email,
      body.password,
      body.insuranceAcknowledged,
      body.emergencyContact,
    );
  });

  it('passes login payload to AuthService.login', async () => {
    const body = {
      email: 'user@example.com',
      password: 'secret123',
    };

    await controller.login(body);

    expect(mockAuthService.login).toHaveBeenCalledWith(
      body.email,
      body.password,
    );
  });
});
