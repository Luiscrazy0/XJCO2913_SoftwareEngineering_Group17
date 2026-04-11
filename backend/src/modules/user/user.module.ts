/**
 * UserModule 是负责管理用户模块的模块。
 */
import { Module, forwardRef } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaModule } from '../../prisma/prisma.module'; // <- 相对路径必须正确
import { BookingModule } from '../booking/booking.module';
import { AuthModule } from '../auth/auth.module';

/**
 * 导入 PrismaModule 并定义控制器和提供者。
 * @param PrismaModule - 用于访问数据库的模块。
 * @param BookingModule - 用于访问折扣服务的模块。
 * @param AuthModule - 用于访问认证守卫的模块。
 * @param UserController - 负责处理用户请求的控制器。
 * @param UserService - 负责处理用户逻辑的服务。
 */
@Module({
  imports: [PrismaModule, forwardRef(() => BookingModule), forwardRef(() => AuthModule)],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService], // 导出给其他模块使用
})
export class UserModule {}
