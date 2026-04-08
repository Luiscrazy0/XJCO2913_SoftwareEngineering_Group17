import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateScooterDto {
  @ApiProperty({
    description: '电动车位置描述',
    example: 'Main Street, Building 5',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  location: string;
}