/**
 * UserService 是负责处理用户逻辑的服务。
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Role } from '@prisma/client';

/**
 * 构造函数，注入 PrismaService 依赖。
 * @param prisma - 用于访问数据库的 Prisma 实例。
 */
@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  //获取所有用户的异步方法。@returns 用户列表。
  async findAll() {
    return this.prisma.user.findMany({
      select: { id: true, email: true, role: true },
    });
  }

  /**
   * 创建新用户的异步方法。
   * @param email - 用户的邮箱。
   * @param passwordHash - 用户的密码哈希值。
   * @param role - 用户的角色，默认为常客。
   * @returns 创建的用户对象。
   */
  async createUser(
    email: string, 
    passwordHash: string, 
    role: Role = Role.CUSTOMER)
    {
    return this.prisma.user.create({
      data: { email, passwordHash, role },
    });
  }

  /**
   * 根据邮箱查找用户的异步方法。
   * @param email - 需要查找的邮箱。
   * @returns 匹配的用户对象，如果不存在则返回 null。
   */
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }
}