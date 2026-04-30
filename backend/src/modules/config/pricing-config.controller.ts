import {
  Controller,
  Get,
  Put,
  Post,
  Param,
  Body,
  UseGuards,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { PricingConfigService } from './pricing-config.service';

@ApiTags('config')
@Controller('config/pricing')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class PricingConfigController {
  constructor(private readonly pricingConfigService: PricingConfigService) {}

  @Get()
  @Roles(Role.MANAGER)
  @ApiOperation({ summary: '获取所有租赁价格' })
  getAllPricing() {
    return this.pricingConfigService.getAllPricing();
  }

  @Put(':hireType')
  @Roles(Role.MANAGER)
  @ApiOperation({ summary: '更新指定租赁类型的价格' })
  @ApiParam({
    name: 'hireType',
    required: true,
    description: '租赁类型 (HOUR_1, HOUR_4, DAY_1, WEEK_1)',
  })
  updatePrice(
    @Param('hireType') hireType: string,
    @Body() body: { price: number },
  ) {
    const { price } = body;

    if (price === undefined || price === null) {
      throw new BadRequestException('price 是必填字段');
    }

    if (typeof price !== 'number' || price < 0) {
      throw new BadRequestException('price 必须是大于等于0的数字');
    }

    const updated = this.pricingConfigService.updatePrice(hireType, price);
    if (!updated) {
      throw new NotFoundException(`无效的租赁类型: ${hireType}`);
    }

    return { message: '价格更新成功' };
  }

  @Post('reset')
  @Roles(Role.MANAGER)
  @ApiOperation({ summary: '重置所有价格为默认值' })
  resetPricing() {
    this.pricingConfigService.resetToDefaults();
    return { message: '价格已重置为默认值' };
  }
}
