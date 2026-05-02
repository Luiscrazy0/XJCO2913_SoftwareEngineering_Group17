import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  PrismaClient,
  BookingStatus,
  HireType,
  Role,
  ScooterStatus,
  UserType,
  FeedbackCategory,
  FeedbackPriority,
  FeedbackStatus,
  DamageType,
} from '@prisma/client';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

async function main() {
  const databaseUrl = requireEnv('DATABASE_URL');
  const adapter = new PrismaPg({ connectionString: databaseUrl });
  const prisma = new PrismaClient({ adapter });

  try {
    console.log('🌱 Seeding demo data — 3 storylines: 学生王小明, 老用户张伟, 管理员...\n');

    // ── Passwords ──────────────────────────────────────────────
    const adminHash = await bcrypt.hash('admin123', 10);
    const userHash = await bcrypt.hash('user123', 10);

    // ── Users ──────────────────────────────────────────────────
    const admin = await prisma.user.upsert({
      where: { email: 'admin@scooter.com' },
      update: { role: Role.MANAGER },
      create: {
        email: 'admin@scooter.com',
        passwordHash: adminHash,
        role: Role.MANAGER,
        insuranceAcknowledged: true,
        emergencyContact: '13800000000',
      },
    });

    // 用户A: 学生 王小明
    const xiaoming = await prisma.user.upsert({
      where: { email: 'xiaoming@example.com' },
      update: { role: Role.CUSTOMER, userType: UserType.STUDENT },
      create: {
        email: 'xiaoming@example.com',
        passwordHash: userHash,
        role: Role.CUSTOMER,
        userType: UserType.STUDENT,
        insuranceAcknowledged: true,
        emergencyContact: '13911112222',
      },
    });

    // 用户B: 老用户 张伟
    const zhangwei = await prisma.user.upsert({
      where: { email: 'zhangwei@example.com' },
      update: { role: Role.CUSTOMER, userType: UserType.FREQUENT },
      create: {
        email: 'zhangwei@example.com',
        passwordHash: userHash,
        role: Role.CUSTOMER,
        userType: UserType.FREQUENT,
        insuranceAcknowledged: true,
        emergencyContact: '13933334444',
      },
    });

    console.log('✅ Users: admin / xiaoming (STUDENT) / zhangwei (FREQUENT)');

    // ── Payment Cards (王小明) ─────────────────────────────────
    await prisma.paymentCard.deleteMany({ where: { userId: xiaoming.id } });
    await prisma.paymentCard.createMany({
      data: [
        {
          userId: xiaoming.id,
          lastFourDigits: '6789',
          encryptedCardNumber: 'enc:4532xxxxxx6789',
          expiryDate: '2027-06',
          cardHolder: 'WANG XIAOMING',
          isDefault: true,
        },
        {
          userId: xiaoming.id,
          lastFourDigits: '1234',
          encryptedCardNumber: 'enc:5408xxxxxx1234',
          expiryDate: '2028-03',
          cardHolder: 'WANG XIAOMING',
          isDefault: false,
        },
      ],
    });
    console.log('✅ Xiaoming: 2 payment cards (1 default)');

    // ── Stations (5 real SWJTU-area locations) ─────────────────
    await prisma.station.deleteMany();
    const stationData = [
      { name: '图书馆站', address: '西南交通大学犀浦校区图书馆正门', latitude: 30.763613, longitude: 103.989265 },
      { name: '体育馆站', address: '西南交通大学犀浦校区体育馆东侧', latitude: 30.764496, longitude: 103.983393 },
      { name: '犀浦地铁站', address: '犀浦地铁站B出口停车场', latitude: 30.7600, longitude: 103.9700 },
      { name: '双铁广场站', address: '双铁广场地下停车场入口旁', latitude: 30.7600, longitude: 103.9800 },
      { name: '犀浦商业街站', address: '犀浦商业街南侧公共停车区', latitude: 30.7650, longitude: 103.9850 },
    ];
    const stations: any[] = [];
    for (const s of stationData) {
      const st = await prisma.station.create({ data: s });
      stations.push(st);
      console.log(`  📍 ${st.name}`);
    }

    // ── Scooters (6 scooters across stations) ──────────────────
    await prisma.scooter.deleteMany();
    const scooterData = [
      { location: '图书馆站A区', status: ScooterStatus.AVAILABLE, latitude: 30.7637, longitude: 103.9893, stationId: stations[0].id },
      { location: '图书馆站B区', status: ScooterStatus.RENTED,    latitude: 30.7635, longitude: 103.9891, stationId: stations[0].id },
      { location: '体育馆站A区', status: ScooterStatus.AVAILABLE, latitude: 30.7645, longitude: 103.9834, stationId: stations[1].id },
      { location: '犀浦地铁站A区', status: ScooterStatus.AVAILABLE, latitude: 30.7602, longitude: 103.9701, stationId: stations[2].id },
      { location: '双铁广场A区', status: ScooterStatus.UNAVAILABLE, latitude: 30.7605, longitude: 103.9802, stationId: stations[3].id },
      { location: '犀浦商业街A区', status: ScooterStatus.AVAILABLE, latitude: 30.7652, longitude: 103.9851, stationId: stations[4].id },
    ];
    const scooters: any[] = [];
    for (const sc of scooterData) {
      const s = await prisma.scooter.create({ data: sc });
      scooters.push(s);
      console.log(`  🛴 ${s.location} [${s.status}]`);
    }

    // ── Helper: relative dates ─────────────────────────────────
    const now = new Date();
    const h = (n: number) => new Date(now.getTime() + n * 3600_000);
    const d = (n: number) => new Date(now.getTime() + n * 86_400_000);
    const ago = {
      h: (n: number) => new Date(now.getTime() - n * 3600_000),
      d: (n: number) => new Date(now.getTime() - n * 86_400_000),
    };

    // ══════════════════════════════════════════════════════════════
    // 王小明故事线 — 完整租借闭环
    // ══════════════════════════════════════════════════════════════

    // Booking XM-1: IN_PROGRESS (正在骑行)
    const xm1 = await prisma.booking.create({
      data: {
        userId: xiaoming.id,
        scooterId: scooters[0].id,
        pickupStationId: stations[0].id,
        hireType: HireType.HOUR_4,
        startTime: ago.h(1),
        endTime: h(3),
        actualStartTime: ago.h(1),
        status: BookingStatus.IN_PROGRESS,
        totalCost: 12, // 15 * 0.8 (student discount)
      },
    });
    await prisma.payment.create({
      data: { bookingId: xm1.id, amount: 12, status: 'SUCCESS' },
    });

    // Booking XM-2: PENDING_PAYMENT (待支付)
    const xm2 = await prisma.booking.create({
      data: {
        userId: xiaoming.id,
        scooterId: scooters[2].id,
        pickupStationId: stations[1].id,
        hireType: HireType.HOUR_1,
        startTime: h(2),
        endTime: h(3),
        status: BookingStatus.PENDING_PAYMENT,
        totalCost: 4, // 5 * 0.8
      },
    });

    // Booking XM-3: CANCELLED
    const xm3 = await prisma.booking.create({
      data: {
        userId: xiaoming.id,
        scooterId: scooters[3].id,
        pickupStationId: stations[2].id,
        hireType: HireType.DAY_1,
        startTime: ago.d(2),
        endTime: ago.d(1),
        status: BookingStatus.CANCELLED,
        totalCost: 24, // 30 * 0.8
      },
    });

    // Booking XM-4: COMPLETED (已完成 — 用于提交反馈)
    const xm4 = await prisma.booking.create({
      data: {
        userId: xiaoming.id,
        scooterId: scooters[3].id,
        pickupStationId: stations[2].id,
        returnStationId: stations[2].id,
        hireType: HireType.HOUR_1,
        startTime: ago.d(5),
        endTime: ago.d(5) + 3600_000,
        actualStartTime: ago.d(5),
        actualEndTime: ago.d(5) + 3400_000,
        status: BookingStatus.COMPLETED,
        totalCost: 4,
      },
    });
    await prisma.payment.create({
      data: { bookingId: xm4.id, amount: 4, status: 'SUCCESS' },
    });

    // XM-4 feedback: FAULT report
    await prisma.feedback.create({
      data: {
        title: '刹车偏软，制动力不足',
        description: '骑行过程中发现后刹车需要捏到底才能有效制动，存在安全隐患。建议检查刹车片或刹车线。',
        category: FeedbackCategory.FAULT,
        priority: FeedbackPriority.HIGH,
        status: FeedbackStatus.PENDING,
        scooterId: scooters[3].id,
        bookingId: xm4.id,
        createdById: xiaoming.id,
      },
    });

    console.log('✅ Xiaoming: 4 bookings (IN_PROGRESS / PENDING_PAYMENT / CANCELLED / COMPLETED) + 1 FAULT feedback');

    // ══════════════════════════════════════════════════════════════
    // 张伟故事线 — 高频用户 + 损坏赔偿
    // ══════════════════════════════════════════════════════════════

    // Booking ZW-1: EXTENDED (续租)
    const zw1 = await prisma.booking.create({
      data: {
        userId: zhangwei.id,
        scooterId: scooters[1].id,
        pickupStationId: stations[0].id,
        hireType: HireType.HOUR_4,
        startTime: ago.h(3),
        endTime: h(2),
        originalEndTime: ago.h(1),
        actualStartTime: ago.h(3),
        status: BookingStatus.EXTENDED,
        totalCost: 18.75, // (15 + 5 extension) * 0.75 = 15
        extensionCount: 1,
      },
    });
    await prisma.payment.create({
      data: { bookingId: zw1.id, amount: 18.75, status: 'SUCCESS' },
    });

    // Booking ZW-2: COMPLETED — INTENTIONAL 损坏 → CHARGEABLE
    const zw2 = await prisma.booking.create({
      data: {
        userId: zhangwei.id,
        scooterId: scooters[4].id,
        pickupStationId: stations[3].id,
        returnStationId: stations[3].id,
        hireType: HireType.DAY_1,
        startTime: ago.d(3),
        endTime: ago.d(2),
        actualStartTime: ago.d(3),
        actualEndTime: ago.d(2),
        status: BookingStatus.COMPLETED,
        totalCost: 22.5, // 30 * 0.75
      },
    });
    await prisma.payment.create({
      data: { bookingId: zw2.id, amount: 22.5, status: 'SUCCESS' },
    });

    // ZW-2 feedback: INTENTIONAL DAMAGE → CHARGEABLE
    await prisma.feedback.create({
      data: {
        title: '车身严重划痕 — 人为损坏',
        description: '还车时发现车身右侧有长约 30cm 的深度划痕，疑似人为用硬物刮擦。现场照片已留存。根据损坏类型评估为故意损坏，需收取赔偿。',
        category: FeedbackCategory.DAMAGE,
        priority: FeedbackPriority.URGENT,
        status: FeedbackStatus.CHARGEABLE,
        scooterId: scooters[4].id,
        bookingId: zw2.id,
        createdById: zhangwei.id,
        damageType: DamageType.INTENTIONAL,
        resolutionCost: 200,
        managerNotes: '已确认故意损坏，划痕深度已超出正常使用范围。已联系张伟沟通赔偿事宜，暂未回复。',
      },
    });

    // Booking ZW-3: COMPLETED — WEEK_1 大额订单
    const zw3 = await prisma.booking.create({
      data: {
        userId: zhangwei.id,
        scooterId: scooters[5].id,
        pickupStationId: stations[4].id,
        returnStationId: stations[4].id,
        hireType: HireType.WEEK_1,
        startTime: ago.d(14),
        endTime: ago.d(7),
        actualStartTime: ago.d(14),
        actualEndTime: ago.d(7),
        status: BookingStatus.COMPLETED,
        totalCost: 67.5, // 90 * 0.75
      },
    });
    await prisma.payment.create({
      data: { bookingId: zw3.id, amount: 67.5, status: 'SUCCESS' },
    });

    // Booking ZW-4: COMPLETED — NATURAL DAMAGE (no charge)
    const zw4 = await prisma.booking.create({
      data: {
        userId: zhangwei.id,
        scooterId: scooters[2].id,
        pickupStationId: stations[1].id,
        returnStationId: stations[1].id,
        hireType: HireType.HOUR_1,
        startTime: ago.d(8),
        endTime: ago.d(8) + 3600_000,
        actualStartTime: ago.d(8),
        actualEndTime: ago.d(8) + 3500_000,
        status: BookingStatus.COMPLETED,
        totalCost: 3.75,
      },
    });
    await prisma.payment.create({
      data: { bookingId: zw4.id, amount: 3.75, status: 'SUCCESS' },
    });

    await prisma.feedback.create({
      data: {
        title: '轮胎自然磨损',
        description: '右前轮轮胎花纹已磨平，属于正常使用损耗。建议定期更换轮胎以保证行驶安全。',
        category: FeedbackCategory.DAMAGE,
        priority: FeedbackPriority.MEDIUM,
        status: FeedbackStatus.RESOLVED,
        scooterId: scooters[2].id,
        bookingId: zw4.id,
        createdById: zhangwei.id,
        damageType: DamageType.NATURAL,
        resolutionCost: 0,
        managerNotes: '自然磨损，已安排轮胎更换。无需向用户收取费用。',
      },
    });

    // SUGGESTION feedback from Zhang Wei
    await prisma.feedback.create({
      data: {
        title: '建议增加夜间优惠时段',
        description: '晚上 22:00 到次日 6:00 的需求量较低，建议推出夜间优惠套餐，吸引夜归学生用户。',
        category: FeedbackCategory.SUGGESTION,
        priority: FeedbackPriority.LOW,
        status: FeedbackStatus.PENDING,
        scooterId: scooters[0].id,
        createdById: zhangwei.id,
      },
    });

    console.log('✅ Zhangwei: 4 bookings (EXTENDED / COMPLETED×3) + 3 feedbacks (URGENT_CHARGEABLE / RESOLVED / SUGGESTION)');

    // ══════════════════════════════════════════════════════════════
    // 历史数据 — 张伟 30天 12条 COMPLETED（支撑统计图表）
    // ══════════════════════════════════════════════════════════════
    const historicalTemplates = [
      { hireType: HireType.HOUR_1, cost: 3.75, daysAgo: 1 },
      { hireType: HireType.HOUR_4, cost: 11.25, daysAgo: 2 },
      { hireType: HireType.DAY_1, cost: 22.5, daysAgo: 4 },
      { hireType: HireType.HOUR_1, cost: 3.75, daysAgo: 5 },
      { hireType: HireType.HOUR_4, cost: 11.25, daysAgo: 6 },
      { hireType: HireType.DAY_1, cost: 22.5, daysAgo: 7 },
      { hireType: HireType.HOUR_1, cost: 3.75, daysAgo: 9 },
      { hireType: HireType.HOUR_4, cost: 11.25, daysAgo: 10 },
      { hireType: HireType.HOUR_1, cost: 3.75, daysAgo: 12 },
      { hireType: HireType.DAY_1, cost: 22.5, daysAgo: 15 },
      { hireType: HireType.HOUR_4, cost: 11.25, daysAgo: 18 },
      { hireType: HireType.WEEK_1, cost: 67.5, daysAgo: 21 },
    ];

    for (const t of historicalTemplates) {
      const start = new Date(ago.d(t.daysAgo).getTime() - 2 * 3600_000);
      const end = new Date(start.getTime() + getDurationMs(t.hireType));
      const b = await prisma.booking.create({
        data: {
          userId: zhangwei.id,
          scooterId: scooters[t.daysAgo % 5].id,
          pickupStationId: stations[t.daysAgo % 5].id,
          returnStationId: stations[t.daysAgo % 5].id,
          hireType: t.hireType,
          startTime: start,
          endTime: end,
          actualStartTime: start,
          actualEndTime: end,
          status: BookingStatus.COMPLETED,
          totalCost: t.cost,
        },
      });
      await prisma.payment.create({
        data: { bookingId: b.id, amount: t.cost, status: 'SUCCESS' },
      });
    }

    // 王小明也补 4 条历史订单（让统计有两人数据）
    const xmHistory = [
      { hireType: HireType.HOUR_1, cost: 4, daysAgo: 3 },
      { hireType: HireType.HOUR_4, cost: 12, daysAgo: 8 },
      { hireType: HireType.DAY_1, cost: 24, daysAgo: 11 },
      { hireType: HireType.HOUR_1, cost: 4, daysAgo: 16 },
    ];
    for (const t of xmHistory) {
      const start = ago.d(t.daysAgo);
      const end = new Date(start.getTime() + getDurationMs(t.hireType));
      const b = await prisma.booking.create({
        data: {
          userId: xiaoming.id,
          scooterId: scooters[t.daysAgo % 5].id,
          pickupStationId: stations[t.daysAgo % 5].id,
          returnStationId: stations[t.daysAgo % 5].id,
          hireType: t.hireType,
          startTime: start,
          endTime: end,
          actualStartTime: start,
          actualEndTime: end,
          status: BookingStatus.COMPLETED,
          totalCost: t.cost,
        },
      });
      await prisma.payment.create({
        data: { bookingId: b.id, amount: t.cost, status: 'SUCCESS' },
      });
    }

    console.log('✅ Historical: 12 + 4 = 16 COMPLETED bookings for revenue statistics\n');

    // ══════════════════════════════════════════════════════════════
    // EmployeeBooking — 管理员为访客代订
    // ══════════════════════════════════════════════════════════════
    const guestBooking = await prisma.booking.create({
      data: {
        userId: admin.id,
        scooterId: scooters[3].id,
        pickupStationId: stations[2].id,
        hireType: HireType.HOUR_4,
        startTime: h(0.5),
        endTime: h(4.5),
        status: BookingStatus.CONFIRMED,
        totalCost: 15,
      },
    });
    await prisma.payment.create({
      data: { bookingId: guestBooking.id, amount: 15, status: 'SUCCESS' },
    });
    await prisma.employeeBooking.create({
      data: {
        bookingId: guestBooking.id,
        employeeId: admin.id,
        guestEmail: 'visitor@company.com',
        guestName: '李教授（访客）',
      },
    });

    console.log('✅ EmployeeBooking: 管理员为 李教授 代订 4小时');

    // ══════════════════════════════════════════════════════════════
    // 多一条 PENDING feedback（管理员待处理列表）
    // ══════════════════════════════════════════════════════════════
    await prisma.feedback.create({
      data: {
        title: '座椅高度调节卡死',
        description: '座椅调节杆无法正常升降，卡在最低档位。需要润滑或更换调节机构。',
        category: FeedbackCategory.FAULT,
        priority: FeedbackPriority.HIGH,
        status: FeedbackStatus.ESCALATED,
        scooterId: scooters[5].id,
        createdById: xiaoming.id,
        managerNotes: '已上报维修部门，等待配件到货。预计本周内完成维修。',
      },
    });

    // ══════════════════════════════════════════════════════════════
    // Summary
    // ══════════════════════════════════════════════════════════════
    const userCount = await prisma.user.count();
    const bookingCount = await prisma.booking.count();
    const feedbackCount = await prisma.feedback.count();
    const scooterCount = await prisma.scooter.count();
    const stationCount = await prisma.station.count();
    const paymentCount = await prisma.payment.count();
    const cardCount = await prisma.paymentCard.count();
    const empBookingCount = await prisma.employeeBooking.count();

    console.log('═══════════════════════════════════════');
    console.log('  📊 Demo Data Summary');
    console.log('═══════════════════════════════════════');
    console.log(`  Users:           ${userCount} (admin + xiaoming + zhangwei)`);
    console.log(`  Stations:        ${stationCount}`);
    console.log(`  Scooters:        ${scooterCount} (4 AVAILABLE / 1 RENTED / 1 UNAVAILABLE)`);
    console.log(`  Bookings:        ${bookingCount}`);
    console.log(`  Payments:        ${paymentCount}`);
    console.log(`  Payment Cards:   ${cardCount}`);
    console.log(`  EmployeeBookings:${empBookingCount}`);
    console.log(`  Feedbacks:       ${feedbackCount} (FAULT×2 / DAMAGE×2 / SUGGESTION×1)`);
    console.log('');
    console.log('  🔑 Login credentials:');
    console.log('     admin@scooter.com  / admin123  (MANAGER)');
    console.log('     xiaoming@example.com / user123  (STUDENT — rides in progress)');
    console.log('     zhangwei@example.com / user123  (FREQUENT — damage cases)');
    console.log('═══════════════════════════════════════\n');
  } finally {
    await prisma.$disconnect();
  }
}

function getDurationMs(ht: HireType): number {
  switch (ht) {
    case HireType.HOUR_1:  return 3600_000;
    case HireType.HOUR_4:  return 4 * 3600_000;
    case HireType.DAY_1:   return 24 * 3600_000;
    case HireType.WEEK_1:  return 7 * 24 * 3600_000;
    default:               return 3600_000;
  }
}

main().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
