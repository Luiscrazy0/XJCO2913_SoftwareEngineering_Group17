Run npm run test

> backend@0.0.1 test
> jest

PASS src/modules/payment/payment.service.spec.ts
PASS src/modules/scooter/scooter.service.spec.ts
FAIL src/modules/booking/booking.service.spec.ts
  ● BookingService › cancelBooking › 应该成功将预订状态更新为 CANCELLED，并返回包含 user 和 scooter 的信息

    expect(jest.fn()).toHaveBeenCalledWith(...expected)

    - Expected
    + Received

      Object {
        "data": Object {
          "status": "CANCELLED",
        },
    -   "include": Object {
    -     "scooter": true,
    -     "user": true,
    -   },
        "where": Object {
          "id": "booking-123",
        },
      },

    Number of calls: 1

      176 |
      177 |       // 🌟 修复关键：补齐了 include 参数，让 Jest 严格对账通过
    > 178 |       expect(mockPrismaService.booking.update).toHaveBeenCalledWith({
          |                                                ^
      179 |         where: { id: targetId },
      180 |         data: { status: BookingStatus.CANCELLED },
      181 |         include: {

      at Object.<anonymous> (modules/booking/booking.service.spec.ts:178:48)

PASS src/modules/auth/auth.service.spec.ts
PASS src/app.controller.spec.ts
PASS src/modules/user/user.service.spec.ts
PASS src/modules/health/health.controller.spec.ts
PASS src/modules/health/health.service.spec.ts

Test Suites: 1 failed, 7 passed, 8 total
Tests:       1 failed, 32 passed, 33 total
Snapshots:   0 total
Time:        2.023 s
Ran all test suites.
Error: Process completed with exit code 1.
