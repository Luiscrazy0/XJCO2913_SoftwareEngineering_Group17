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

    const scooters = [
      { id: 'SC001', location: '市中心广场 - A区', status: ScooterStatus.AVAILABLE },
      { id: 'SC002', location: '火车站 - 东出口', status: ScooterStatus.AVAILABLE },
      { id: 'SC003', location: '购物中心 - 北门', status: ScooterStatus.AVAILABLE },
      { id: 'SC004', location: '大学城 - 图书馆', status: ScooterStatus.AVAILABLE },
      { id: 'SC005', location: '科技园 - 1号楼', status: ScooterStatus.AVAILABLE },
      { id: 'SC006', location: '公园南门 - 停车场', status: ScooterStatus.UNAVAILABLE },
    ];

    for (const scooterData of scooters) {
      await prisma.scooter.upsert({
        where: { id: scooterData.id },
        update: { location: scooterData.location, status: scooterData.status },
        create: {
          id: scooterData.id,
          location: scooterData.location,
          status: scooterData.status,
        },
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
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
