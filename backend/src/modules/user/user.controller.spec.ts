import { UserController } from './user.controller';
import { UserService } from './user.service';
import { DiscountService } from '../booking/discount.service';

type UserServiceMock = Pick<UserService, 'findAll'>;
type DiscountServiceMock = Pick<
  DiscountService,
  'updateUserType' | 'getUserDiscountInfo'
>;

const mockUserService: jest.Mocked<UserServiceMock> = {
  findAll: jest.fn(),
};

const mockDiscountService: jest.Mocked<DiscountServiceMock> = {
  updateUserType: jest.fn(),
  getUserDiscountInfo: jest.fn(),
};

describe('UserController', () => {
  let controller: UserController;

  beforeEach(() => {
    controller = new UserController(
      mockUserService as unknown as UserService,
      mockDiscountService as unknown as DiscountService,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('delegates findAll to UserService.findAll', () => {
    controller.findAll();

    expect(mockUserService.findAll).toHaveBeenCalled();
  });

  it('updates a user type via DiscountService', async () => {
    await controller.updateUserType('user-1', {
      userType: 'STUDENT' as Parameters<
        UserController['updateUserType']
      >[1]['userType'],
    });

    expect(mockDiscountService.updateUserType).toHaveBeenCalledWith(
      'user-1',
      'STUDENT',
    );
  });

  it('returns a success message after updating the user type', async () => {
    const result = await controller.updateUserType('user-1', {
      userType: 'SENIOR' as Parameters<
        UserController['updateUserType']
      >[1]['userType'],
    });

    expect(result).toEqual({ message: '用户类型更新成功' });
  });

  it('delegates discount info lookups to DiscountService', async () => {
    await controller.getUserDiscountInfo('user-1');

    expect(mockDiscountService.getUserDiscountInfo).toHaveBeenCalledWith(
      'user-1',
    );
  });
});
