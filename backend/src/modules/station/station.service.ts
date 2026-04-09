import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateStationDto } from './dto/create-station.dto';

@Injectable()
export class StationService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.station.findMany({
      include: {
        scooters: {
          include: {
            station: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findById(id: string) {
    const station = await this.prisma.station.findUnique({
      where: { id },
      include: {
        scooters: {
          include: {
            station: true,
          },
        },
      },
    });

    if (!station) {
      throw new NotFoundException('Station not found');
    }

    return station;
  }

  async createStation(data: CreateStationDto) {
    return this.prisma.station.create({
      data,
      include: {
        scooters: true,
      },
    });
  }

  async updateStation(id: string, data: Partial<CreateStationDto>) {
    const station = await this.prisma.station.findUnique({
      where: { id },
    });

    if (!station) {
      throw new NotFoundException('Station not found');
    }

    return this.prisma.station.update({
      where: { id },
      data,
      include: {
        scooters: true,
      },
    });
  }

  async deleteStation(id: string) {
    const station = await this.prisma.station.findUnique({
      where: { id },
    });

    if (!station) {
      throw new NotFoundException('Station not found');
    }

    // 检查是否有滑板车关联到这个站点
    const scooters = await this.prisma.scooter.findMany({
      where: { stationId: id },
    });

    if (scooters.length > 0) {
      // 如果有滑板车，先解除关联
      await this.prisma.scooter.updateMany({
        where: { stationId: id },
        data: { stationId: null },
      });
    }

    return this.prisma.station.delete({
      where: { id },
    });
  }

  async getStationsWithAvailableScooters() {
    return this.prisma.station.findMany({
      include: {
        scooters: {
          where: {
            status: 'AVAILABLE',
          },
          include: {
            station: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async getNearbyStations(latitude: number, longitude: number, radiusKm: number = 5) {
    // 简单实现：返回所有站点，实际应用中应该计算距离
    const stations = await this.prisma.station.findMany({
      include: {
        scooters: {
          where: {
            status: 'AVAILABLE',
          },
          include: {
            station: true,
          },
        },
      },
    });

    // 计算距离并过滤
    return stations.map(station => {
      const distance = this.calculateDistance(
        latitude,
        longitude,
        station.latitude,
        station.longitude
      );
      return {
        ...station,
        distanceKm: distance,
      };
    }).filter(station => station.distanceKm <= radiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // 地球半径，单位：公里
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return Math.round(distance * 100) / 100; // 保留两位小数
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }
}