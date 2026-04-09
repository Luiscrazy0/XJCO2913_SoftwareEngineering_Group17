import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, BookingStatus, HireType, Role, ScooterStatus } from '@prisma/client';


function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

async function main() {
  const databaseUrl = requireEnv('DATABASE_URL');
  const adapter = new PrismaPg({ connectionString: databaseUrl });
  const prisma = new PrismaClient({ adapter });

  try {
    console.log('🌱 Seeding database...');

    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    const userPasswordHash = await bcrypt.hash('user123', 10);

    await prisma.user.upsert({
      where: { email: 'admin@scooter.com' },
      update: { role: Role.MANAGER },
      create: {
        email: 'admin@scooter.com',
        passwordHash: adminPasswordHash,
        role: Role.MANAGER,
      },
    });

    const user1 = await prisma.user.upsert({
      where: { email: 'test1@example.com' },
      update: { role: Role.CUSTOMER },
      create: {
        email: 'test1@example.com',
        passwordHash: userPasswordHash,
        role: Role.CUSTOMER,
      },
    });

    const user2 = await prisma.user.upsert({
      where: { email: 'test2@example.com' },
      update: { role: Role.CUSTOMER },
      create: {
        email: 'test2@example.com',
        passwordHash: userPasswordHash,
        role: Role.CUSTOMER,
      },
    });

    // 创建5个取车点（站点）
    const stations = [
      { 
        id: 'ST001', 
        name: '市中心广场站', 
        address: '市中心广场A区停车场',
        latitude: 31.2304, 
        longitude: 121.4737 
      },
      { 
        id: 'ST002', 
        name: '火车站站', 
        address: '火车站东出口停车场',
        latitude: 31.2479, 
        longitude: 121.4720 
      },
      { 
        id: 'ST003', 
        name: '购物中心站', 
        address: '购物中心北门停车场',
        latitude: 31.2330, 
        longitude: 121.4780 
      },
      { 
        id: 'ST004', 
        name: '大学城站', 
        address: '大学城图书馆前广场',
        latitude: 31.2250, 
        longitude: 121.4650 
      },
      { 
        id: 'ST005', 
        name: '科技园站', 
        address: '科技园1号楼停车场',
        latitude: 31.2400, 
        longitude: 121.4850 
      },
    ];

    for (const stationData of stations) {
      await prisma.station.upsert({
        where: { id: stationData.id },
        update: stationData,
        create: stationData,
      });
    }

    // 更新滑板车数据，添加坐标和站点关联
    const scooters = [
      { 
        id: 'SC001', 
        location: '市中心广场 - A区', 
        status: ScooterStatus.AVAILABLE,
        latitude: 31.2305,
        longitude: 121.4738,
        stationId: 'ST001'
      },
      { 
        id: 'SC002', 
        location: '火车站 - 东出口', 
        status: ScooterStatus.AVAILABLE,
        latitude: 31.2480,
        longitude: 121.4721,
        stationId: 'ST002'
      },
      { 
        id: 'SC003', 
        location: '购物中心 - 北门', 
        status: ScooterStatus.AVAILABLE,
        latitude: 31.2331,
        longitude: 121.4781,
        stationId: 'ST003'
      },
      { 
        id: 'SC004', 
        location: '大学城 - 图书馆', 
        status: ScooterStatus.AVAILABLE,
        latitude: 31.2251,
        longitude: 121.4651,
        stationId: 'ST004'
      },
      { 
        id: 'SC005', 
        location: '科技园 - 1号楼', 
        status: ScooterStatus.AVAILABLE,
        latitude: 31.2401,
        longitude: 121.4851,
        stationId: 'ST005'
      },
      { 
        id: 'SC006', 
        location: '公园南门 - 停车场', 
        status: ScooterStatus.UNAVAILABLE,
        latitude: 31.2350,
        longitude: 121.4800,
        stationId: 'ST001'
      },
    ];

    for (const scooterData of scooters) {
      await prisma.scooter.upsert({
        where: { id: scooterData.id },
        update: scooterData,
        create: scooterData,
      });
    }

    const now = new Date();

    const pendingBooking = await prisma.booking.upsert({
      where: { id: 'BOOKING_PENDING_001' },
      update: {},
      create: {
        id: 'BOOKING_PENDING_001',
        userId: user1.id,
        scooterId: 'SC001',
        hireType: HireType.HOUR_1,
        startTime: now,
        endTime: new Date(now.getTime() + 60 * 60 * 1000),
        status: BookingStatus.PENDING_PAYMENT,
        totalCost: 5,
      },
    });

    const confirmedBooking = await prisma.booking.upsert({
      where: { id: 'BOOKING_CONFIRMED_001' },
      update: { status: BookingStatus.CONFIRMED },
      create: {
        id: 'BOOKING_CONFIRMED_001',
        userId: user2.id,
        scooterId: 'SC002',
        hireType: HireType.HOUR_4,
        startTime: new Date(now.getTime() - 2 * 60 * 60 * 1000),
        endTime: new Date(now.getTime() + 2 * 60 * 60 * 1000),
        status: BookingStatus.CONFIRMED,
        totalCost: 15,
      },
    });

    await prisma.payment.upsert({
      where: { bookingId: confirmedBooking.id },
      update: { amount: 15, status: 'SUCCESS' },
      create: {
        bookingId: confirmedBooking.id,
        amount: 15,
        status: 'SUCCESS',
      },
    });

    console.log('✅ Seed complete.');
    console.log('');
    console.log('Test accounts:');
    console.log('  - admin@scooter.com / admin123 (MANAGER)');
    console.log('  - test1@example.com / user123 (CUSTOMER)');
    console.log('  - test2@example.com / user123 (CUSTOMER)');
    console.log('');
    console.log('Sample bookings:');
    console.log(`  - ${pendingBooking.id} (PENDING_PAYMENT)`);
    console.log(`  - ${confirmedBooking.id} (CONFIRMED + Payment)`);
    console.log('');
    console.log('Stations created:');
    console.log('  - 市中心广场站 (ST001)');
    console.log('  - 火车站站 (ST002)');
    console.log('  - 购物中心站 (ST003)');
    console.log('  - 大学城站 (ST004)');
    console.log('  - 科技园站 (ST005)');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
