// backend/src/modules/scooter/scooter.service.ts
import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ScooterStatus, BookingStatus } from '@prisma/client';
import { AmapService } from '../amap/amap.service';

@Injectable()
export class ScooterService {
  private readonly logger = new Logger(ScooterService.name);
  private readonly amapCache = new Map<
    string,
    { address: string; timestamp: number }
  >();
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24小时缓存

  constructor(
    private readonly prisma: PrismaService,
    private readonly amapService: AmapService,
  ) {}

  async findAll(page?: number, limit?: number) {
    const p = Math.max(1, Number(page) || 1);
    const l = Math.min(100, Math.max(1, Number(limit) || 20));
    const skip = (p - 1) * l;

    const [scooters, total] = await Promise.all([
      this.prisma.scooter.findMany({
        skip,
        take: l,
        include: { station: true },
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.scooter.count(),
    ]);

    const scootersWithAmap = await Promise.all(
      scooters.map(async (scooter) => {
        return await this.enrichWithAmapAddress(scooter);
      }),
    );

    return {
      items: scootersWithAmap,
      total,
      page: p,
      limit: l,
      totalPages: Math.ceil(total / l),
    };
  }

  async findById(id: string) {
    const scooter = await this.prisma.scooter.findUnique({
      where: { id },
      include: {
        station: true,
      },
    });

    if (!scooter) {
      return null;
    }

    return await this.enrichWithAmapAddress(scooter);
  }

  async createScooter(location: string) {
    return this.prisma.scooter.create({
      data: {
        location,
      },
    });
  }

  async updateStatus(id: string, status: ScooterStatus) {
    return this.prisma.scooter.update({
      where: { id },
      data: { status },
    });
  }

  async deleteScooter(id: string) {
    const bookingCount = await this.prisma.booking.count({
      where: { scooterId: id },
    });
    if (bookingCount > 0) {
      throw new BadRequestException('Scooter has existing bookings');
    }
    return this.prisma.scooter.delete({
      where: { id },
    });
  }

  async forceResetGhostScooter(id: string) {
    const scooter = await this.prisma.scooter.findUnique({ where: { id } });
    if (!scooter) {
      throw new NotFoundException('Scooter not found');
    }

    if (scooter.status !== ScooterStatus.RENTED) {
      throw new BadRequestException(
        `Scooter status is ${scooter.status}, not RENTED. Force-reset only applies to ghost RENTED scooters.`,
      );
    }

    const activeBookings = await this.prisma.booking.count({
      where: {
        scooterId: id,
        status: { in: [BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS] },
      },
    });

    if (activeBookings > 0) {
      throw new BadRequestException(
        'Scooter has active bookings and cannot be force-reset. Resolve bookings first.',
      );
    }

    this.logger.warn(`Force-resetting ghost scooter ${id} from RENTED to AVAILABLE`);

    return this.prisma.scooter.update({
      where: { id },
      data: { status: ScooterStatus.AVAILABLE },
    });
  }

  /**
   * 为滑板车添加高德地图地址信息
   * 使用缓存机制减少API调用频率
   */
  private async enrichWithAmapAddress(scooter: any) {
    // 如果没有坐标信息，返回原始数据
    if (!scooter.latitude || !scooter.longitude) {
      return {
        ...scooter,
        amapAddress: null,
      };
    }

    const cacheKey = `${scooter.latitude.toFixed(6)},${scooter.longitude.toFixed(6)}`;
    const now = Date.now();

    // 检查缓存
    const cached = this.amapCache.get(cacheKey);
    if (cached && now - cached.timestamp < this.CACHE_TTL) {
      this.logger.debug(`使用缓存地址: ${cacheKey} -> ${cached.address}`);
      return {
        ...scooter,
        amapAddress: cached.address,
      };
    }

    try {
      // 调用高德地图API获取地址
      const amapResult = await this.amapService.regeocode(
        scooter.longitude,
        scooter.latitude,
      );

      if (amapResult.status === '1' && amapResult.regeocode) {
        const address = amapResult.regeocode.formatted_address;

        // 更新缓存
        this.amapCache.set(cacheKey, { address, timestamp: now });

        // 清理过期缓存
        this.cleanupCache();

        this.logger.debug(`高德地图地址解析成功: ${cacheKey} -> ${address}`);

        return {
          ...scooter,
          amapAddress: address,
        };
      } else {
        this.logger.warn(`高德地图API返回错误: ${amapResult.info}`);
        return {
          ...scooter,
          amapAddress: null,
        };
      }
    } catch (error) {
      this.logger.error(`高德地图地址解析失败: ${error.message}`, error.stack);
      // API调用失败时返回原始数据
      return {
        ...scooter,
        amapAddress: null,
      };
    }
  }

  /**
   * 清理过期缓存
   */
  private cleanupCache() {
    const now = Date.now();
    for (const [key, value] of this.amapCache.entries()) {
      if (now - value.timestamp > this.CACHE_TTL) {
        this.amapCache.delete(key);
      }
    }
  }

  /**
   * 获取缓存统计信息
   */
  getCacheStats() {
    return {
      cacheSize: this.amapCache.size,
      cacheKeys: Array.from(this.amapCache.keys()),
    };
  }
}
