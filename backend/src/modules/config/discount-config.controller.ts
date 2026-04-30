import {
  Controller,
  Get,
  Put,
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
import { DiscountConfigService } from './discount-config.service';

@ApiTags('config')
@Controller('config/discounts')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class DiscountConfigController {
  constructor(private readonly discountConfigService: DiscountConfigService) {}

  @Get()
  @Roles(Role.MANAGER)
  @ApiOperation({ summary: '获取所有折扣率' })
  getAllDiscounts() {
    return this.discountConfigService.getAllDiscounts();
  }

  @Put(':userType')
  @Roles(Role.MANAGER)
  @ApiOperation({ summary: '更新指定用户类型的折扣率' })
  @ApiParam({
    name: 'userType',
    required: true,
    description: '用户类型 (STUDENT, SENIOR, FREQUENT_50H, FREQUENT_20H)',
  })
  updateDiscount(
    @Param('userType') userType: string,
    @Body() body: { rate: number },
  ) {
    const { rate } = body;

    if (rate === undefined || rate === null) {
      throw new BadRequestException('rate 是必填字段');
    }

    if (typeof rate !== 'number' || rate < 0 || rate > 1) {
      throw new BadRequestException('rate 必须是 0 到 1 之间的数字');
    }

    const updated = this.discountConfigService.updateDiscount(userType, rate);
    if (!updated) {
      throw new NotFoundException(`无效的用户类型: ${userType}`);
    }

    return { message: '折扣率更新成功' };
  }
}
