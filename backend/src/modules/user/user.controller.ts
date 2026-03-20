import { Controller, Get } from '@nestjs/common';
import { UserService } from './user.service';

/**
 * UserController 是负责处理用户相关请求的控制器。
 */
@Controller('users')
export class UserController {
  /**
   * 构造函数，注入 UserService 依赖。
   * @param userService - 使用的 UserService 实例，用于处理用户逻辑。
   */
  constructor(private readonly userService: UserService) {}

  @Get()
  findAll() {
    return this.userService.findAll();
  }
  
  
}