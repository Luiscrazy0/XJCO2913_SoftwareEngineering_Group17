import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, BookingStatus, HireType, Role, ScooterStatus, UserType } from '@prisma/client';

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
    console.log('🌱 Seeding database with UUIDs...');

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
      update: { role: Role.CUSTOMER, userType: 'FREQUENT' },
      create: {
        email: 'test1@example.com',
        passwordHash: userPasswordHash,
        role: Role.CUSTOMER,
        userType: 'FREQUENT', // 高频用户
      },
    });

    const user2 = await prisma.user.upsert({
      where: { email: 'test2@example.com' },
      update: { role: Role.CUSTOMER, userType: 'STUDENT' },
      create: {
        email: 'test2@example.com',
        passwordHash: userPasswordHash,
        role: Role.CUSTOMER,
        userType: 'STUDENT', // 学生用户
      },
    });

    const user3 = await prisma.user.upsert({
      where: { email: 'test3@example.com' },
      update: { role: Role.CUSTOMER, userType: 'SENIOR' },
      create: {
        email: 'test3@example.com',
        passwordHash: userPasswordHash,
        role: Role.CUSTOMER,
        userType: 'SENIOR', // 老年人用户
      },
    });

    const user4 = await prisma.user.upsert({
      where: { email: 'test4@example.com' },
      update: { role: Role.CUSTOMER, userType: 'NORMAL' },
      create: {
        email: 'test4@example.com',
        passwordHash: userPasswordHash,
        role: Role.CUSTOMER,
        userType: 'NORMAL', // 普通用户
      },
    });

    // 创建5个取车点（站点）- 使用西南交通大学周边真实坐标
    const stations = [
      { 
        name: '西南交通大学校区中心点', 
        address: '西南交通大学（犀浦校区）校区中心点',
        latitude: 30.763613, 
        longitude: 103.989265 
      },
      { 
        name: '西南交通大学体育馆', 
        address: '西南交通大学犀浦校区体育馆',
        latitude: 30.764496, 
        longitude: 103.983393 
      },
      { 
        name: '犀浦站', 
        address: '犀浦站（火车站/地铁站）',
        latitude: 30.76, 
        longitude: 103.97 
      },
      { 
        name: '双铁广场', 
        address: '双铁广场',
        latitude: 30.76, 
        longitude: 103.98 
      },
      { 
        name: '犀浦商业区', 
        address: '犀浦商业区',
        latitude: 30.765, 
        longitude: 103.985 
      },
    ];

    const createdStations: any[] = [];
    for (const stationData of stations) {
      const station = await prisma.station.create({
        data: stationData,
      });
      createdStations.push(station);
      console.log(`Created station: ${station.name} with ID: ${station.id}`);
    }

    // 创建滑板车数据，使用西南交通大学周边真实坐标
    const scooters = [
      { 
        location: '西南交通大学校区中心点附近', 
        status: ScooterStatus.AVAILABLE,
        latitude: 30.7637,
        longitude: 103.9893,
        stationId: createdStations[0].id
      },
      { 
        location: '西南交通大学体育馆附近', 
        status: ScooterStatus.AVAILABLE,
        latitude: 30.7645,
        longitude: 103.9834,
        stationId: createdStations[1].id
      },
      { 
        location: '犀浦站附近', 
        status: ScooterStatus.AVAILABLE,
        latitude: 30.7602,
        longitude: 103.9701,
        stationId: createdStations[2].id
      },
      { 
        location: '双铁广场附近', 
        status: ScooterStatus.AVAILABLE,
        latitude: 30.7605,
        longitude: 103.9802,
        stationId: createdStations[3].id
      },
      { 
        location: '犀浦商业区附近', 
        status: ScooterStatus.AVAILABLE,
        latitude: 30.7652,
        longitude: 103.9851,
        stationId: createdStations[4].id
      },
      { 
        location: '西南交通大学北门附近', 
        status: ScooterStatus.UNAVAILABLE,
        latitude: 30.7660,
        longitude: 103.9880,
        stationId: createdStations[0].id
      },
    ];

    const createdScooters: any[] = [];
    for (const scooterData of scooters) {
      const scooter = await prisma.scooter.create({
        data: scooterData,
      });
      createdScooters.push(scooter);
      console.log(`Created scooter: ${scooter.location} with ID: ${scooter.id}`);
    }

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // 创建历史预订数据（过去7天）- 使用实际的scooter UUIDs
    const historicalBookings = [
      // 第1天：各种租赁类型
      {
        userId: user1.id,
        scooterId: createdScooters[0].id,
        hireType: HireType.HOUR_1,
        startTime: new Date(oneWeekAgo.getTime() + 1 * 24 * 60 * 60 * 1000),
        endTime: new Date(oneWeekAgo.getTime() + 1 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
        status: BookingStatus.COMPLETED,
        totalCost: 5,
      },
      {
        userId: user2.id,
        scooterId: createdScooters[1].id,
        hireType: HireType.HOUR_4,
        startTime: new Date(oneWeekAgo.getTime() + 1 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
        endTime: new Date(oneWeekAgo.getTime() + 1 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000),
        status: BookingStatus.COMPLETED,
        totalCost: 12, // 学生折扣8折: 15 * 0.8 = 12
      },
      // 第2天：更多预订
      {
        userId: user1.id,
        scooterId: createdScooters[2].id,
        hireType: HireType.DAY_1,
        startTime: new Date(oneWeekAgo.getTime() + 2 * 24 * 60 * 60 * 1000),
        endTime: new Date(oneWeekAgo.getTime() + 3 * 24 * 60 * 60 * 1000),
        status: BookingStatus.COMPLETED,
        totalCost: 30,
      },
      {
        userId: user2.id,
        scooterId: createdScooters[3].id,
        hireType: HireType.HOUR_1,
        startTime: new Date(oneWeekAgo.getTime() + 2 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
        endTime: new Date(oneWeekAgo.getTime() + 2 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
        status: BookingStatus.COMPLETED,
        totalCost: 5,
      },
      // 第3天：周租赁
      {
        userId: user1.id,
        scooterId: createdScooters[4].id,
        hireType: HireType.WEEK_1,
        startTime: new Date(oneWeekAgo.getTime() + 3 * 24 * 60 * 60 * 1000),
        endTime: new Date(oneWeekAgo.getTime() + 10 * 24 * 60 * 60 * 1000),
        status: BookingStatus.CONFIRMED,
        totalCost: 150,
      },
      // 第4天：混合类型
      {
        userId: user2.id,
        scooterId: createdScooters[0].id,
        hireType: HireType.HOUR_4,
        startTime: new Date(oneWeekAgo.getTime() + 4 * 24 * 60 * 60 * 1000),
        endTime: new Date(oneWeekAgo.getTime() + 4 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
        status: BookingStatus.COMPLETED,
        totalCost: 15,
      },
      {
        userId: user1.id,
        scooterId: createdScooters[1].id,
        hireType: HireType.DAY_1,
        startTime: new Date(oneWeekAgo.getTime() + 4 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000),
        endTime: new Date(oneWeekAgo.getTime() + 5 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000),
        status: BookingStatus.COMPLETED,
        totalCost: 30,
      },
      // 第5天：更多1小时租赁
      {
        userId: user2.id,
        scooterId: createdScooters[2].id,
        hireType: HireType.HOUR_1,
        startTime: new Date(oneWeekAgo.getTime() + 5 * 24 * 60 * 60 * 1000),
        endTime: new Date(oneWeekAgo.getTime() + 5 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
        status: BookingStatus.COMPLETED,
        totalCost: 5,
      },
      {
        userId: user1.id,
        scooterId: createdScooters[3].id,
        hireType: HireType.HOUR_1,
        startTime: new Date(oneWeekAgo.getTime() + 5 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
        endTime: new Date(oneWeekAgo.getTime() + 5 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
        status: BookingStatus.COMPLETED,
        totalCost: 5,
      },
      // 第6天：4小时租赁
      {
        userId: user2.id,
        scooterId: createdScooters[4].id,
        hireType: HireType.HOUR_4,
        startTime: new Date(oneWeekAgo.getTime() + 6 * 24 * 60 * 60 * 1000),
        endTime: new Date(oneWeekAgo.getTime() + 6 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
        status: BookingStatus.COMPLETED,
        totalCost: 15,
      },
      // 第7天（今天）：已确认的预订
      {
        userId: user1.id,
        scooterId: createdScooters[0].id,
        hireType: HireType.DAY_1,
        startTime: new Date(now.getTime() - 2 * 60 * 60 * 1000),
        endTime: new Date(now.getTime() + 22 * 60 * 60 * 1000),
        status: BookingStatus.CONFIRMED,
        totalCost: 30,
      },
    ];

    // 创建历史预订
    for (const bookingData of historicalBookings) {
      const booking = await prisma.booking.create({
        data: bookingData,
      });

      // 为已完成的预订创建支付记录
      if (bookingData.status === BookingStatus.COMPLETED || bookingData.status === BookingStatus.CONFIRMED) {
        await prisma.payment.create({
          data: {
            bookingId: booking.id,
            amount: bookingData.totalCost,
            status: 'SUCCESS',
          },
        });
      }
    }

    // 创建测试预订
    const pendingBooking = await prisma.booking.create({
      data: {
        userId: user1.id,
        scooterId: createdScooters[0].id,
        hireType: HireType.HOUR_1,
        startTime: now,
        endTime: new Date(now.getTime() + 60 * 60 * 1000),
        status: BookingStatus.PENDING_PAYMENT,
        totalCost: 5,
      },
    });

    const confirmedBooking = await prisma.booking.create({
      data: {
        userId: user2.id,
        scooterId: createdScooters[1].id,
        hireType: HireType.HOUR_4,
        startTime: new Date(now.getTime() - 2 * 60 * 60 * 1000),
        endTime: new Date(now.getTime() + 2 * 60 * 60 * 1000),
        status: BookingStatus.CONFIRMED,
        totalCost: 15,
      },
    });

    await prisma.payment.create({
      data: {
        bookingId: confirmedBooking.id,
        amount: 15,
        status: 'SUCCESS',
      },
    });

    console.log('✅ Seed with UUIDs complete.');
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
    console.log('Historical bookings created:');
    console.log(`  - ${historicalBookings.length} historical bookings for statistics`);
    console.log('');
    console.log('Stations created:');
    createdStations.forEach((station, index) => {
      console.log(`  - ${station.name} (${station.id})`);
    });
    console.log('');
    console.log('Scooters created:');
    createdScooters.forEach((scooter, index) => {
      console.log(`  - ${scooter.location} (${scooter.id})`);
    });
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});