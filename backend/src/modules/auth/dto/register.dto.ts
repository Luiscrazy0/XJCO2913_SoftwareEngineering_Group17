import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: '用户邮箱地址',
    example: 'user@example.com',
    required: true,
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: '用户密码（至少6个字符）',
    example: 'password123',
    required: true,
    minLength: 6,
  })
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}