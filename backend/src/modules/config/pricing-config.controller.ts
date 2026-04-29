import { Controller, Get, Put, Body, Param, UseGuards } from '@nestjs/common';
import { PricingConfigService } from './pricing-config.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('config')
@Controller('config')
export class PricingConfigController {
  constructor(private readonly pricingConfigService: PricingConfigService) {}

  @Get('pricing')
  @ApiOperation({ summary: '获取当前定价配置' })
  getPricing() {
    return this.pricingConfigService.getPricing();
  }

  @Put('pricing/:hireType')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MANAGER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '更新指定租赁类型的价格（管理员）' })
  updatePricing(
    @Param('hireType') hireType: string,
    @Body() body: { price: number },
  ) {
    return this.pricingConfigService.updatePricing(hireType as any, body.price);
  }

  @Put('pricing/reset')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MANAGER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '重置定价为默认值（管理员）' })
  resetPricing() {
    return this.pricingConfigService.resetPricing();
  }
}
