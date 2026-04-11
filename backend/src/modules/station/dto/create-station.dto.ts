import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, Min, Max } from 'class-validator';

export class CreateStationDto {
  @ApiProperty({
    description: '站点名称',
    example: '市中心广场站',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: '站点地址',
    example: '市中心广场A区停车场',
  })
  @IsString()
  address: string;

  @ApiProperty({
    description: '纬度',
    example: 31.2304,
    minimum: -90,
    maximum: 90,
  })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({
    description: '经度',
    example: 121.4737,
    minimum: -180,
    maximum: 180,
  })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;
}
