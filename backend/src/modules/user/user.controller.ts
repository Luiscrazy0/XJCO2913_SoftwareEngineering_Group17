import { Controller, Get, Put, Param, Body, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role, UserType } from '@prisma/client';
import { DiscountService } from '../booking/discount.service';

/**
 * UserController 是负责处理用户相关请求的控制器。
 */
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  /**
   * 构造函数，注入 UserService 和 DiscountService 依赖。
   * @param userService - 使用的 UserService 实例，用于处理用户逻辑。
   * @param discountService - 使用的 DiscountService 实例，用于处理折扣逻辑。
   */
  constructor(
    private readonly userService: UserService,
    private readonly discountService: DiscountService,
  ) {}

  @Get()
  @Roles(Role.MANAGER)
  findAll() {
    return this.userService.findAll();
  }

  /**
   * 更新用户类型（管理员功能）
   */
  @Put(':id/user-type')
  @Roles(Role.MANAGER)
  async updateUserType(
    @Param('id') userId: string,
    @Body() body: { userType: UserType },
  ) {
    await this.discountService.updateUserType(userId, body.userType);
    return { message: '用户类型更新成功' };
  }

  /**
   * 获取用户折扣信息
   */
  @Get(':id/discount-info')
  async getUserDiscountInfo(@Param('id') userId: string) {
    return this.discountService.getUserDiscountInfo(userId);
  }
}