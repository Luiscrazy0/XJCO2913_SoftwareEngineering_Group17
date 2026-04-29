Project backlog — 全量追溯矩阵 (Complete Traceability Matrix)

Backlog items are termed functional (F) or non-functional (N) and high-priority (1) or low-priority (2) for the final application.

| ID | Description | Type | Priority | 覆盖 Sprint | 实现模块 |
|----|-------------|------|----------|------------|---------|
| 1 | Support user accounts and user login | F | 1 | Sprint 1-2 | AuthModule + JwtAuthGuard |
| 2 | Option to store customer's card details for quicker bookings | F | 2 | Sprint 4 (S4-015) | PaymentCardService + PaymentModal |
| 3 | If ID 2: good security for user accounts | NF | 2 | Sprint 4 (S4-003) | ENCRYPTION_KEY 启动校验 + PaymentCard加密 |
| 4 | View hire options and cost: 1hr, 4hrs, 1day, 1week | F | 1 | Sprint 4 (S4-008/009/016) | GET /bookings/estimate-price + PriceEstimate + PricingConfigService |
| 5 | Book an e-scooter; select e-scooter ID and hire period | F | 1 | Sprint 4 (S4-010/011/012/026) | BookingModal + pickupStation + 状态流转 |
| 6 | Handle card payment for booking (simulated) | F | 1 | Sprint 4 (S4-001/002/013/014) | PaymentService(原子事务+幂等) + PaymentModal |
| 7 | Send booking confirmation via email | F | 2 | Sprint 2 | EmailService(Nodemailer) |
| 8 | Store booking confirmation and display on demand | F | 1 | Sprint 4 (S4-011) | MyBookingsPage + BookingCard |
| 9 | (Staff) Take bookings for unregistered users (req ID 7) | F | 2 | Sprint 2 | EmployeeBookingController + createBookingForCustomer() |
| 10 | ID5: Update e-scooter status from available to unavailable | F | 2 | Sprint 4 (S4-017/018) | startRide(RENTED) + endRide(AVAILABLE) + state machine |
| 11 | ID5: Option to extend current booking | F | 2 | Sprint 2 + 4 | extendBooking() - 扩展支持IN_PROGRESS |
| 12 | Cancel booking | F | 1 | Sprint 2 | cancelBooking() + scooter释放 |
| 13 | Send short feedback for issues/faults | F | 2 | Sprint 3 | FeedbackModule + CreateFeedbackPage |
| 14 | if ID13: Prioritise feedback - escalate to high priority, resolve for low priority | F | 3 | Sprint 3 | FeedbackService(priority rules) + DAMAGE→HIGH |
| 15 | if ID14: View high priority issues | F | 3 | Sprint 3 | HighPriorityPage + AdminFeedbacksPage |
| 16 | Configure e-scooter details and costs | F | 1 | Sprint 4 (新增) | PricingConfigService + PUT /config/pricing/:hireType |
| 17 | Display scooter list availability: availability/location if available | F | 2 | Sprint 4 (S4-006/025) | 分页列表 + 地图标记着色(绿/橙/红) |
| 18 | Display the five scooter locations on a visual map | F | 2 | Sprint 4 (S4-012/025) | MapPage + AmapMap + BookingModal直接打开 |
| 19 | View weekly income for rental options | F | 1 | Sprint 3 | StatisticsModule + RevenueStatisticsPage |
| 20 | View combined daily income over a week duration | F | 2 | Sprint 3 | StatisticsModule + RevenueStatisticsPage |
| 21 | If ID 19, 20: plot weekly income graphically | F | 2 | Sprint 3 | Chart.js图表 + /statistics/revenue/chart |
| 22 | Discount applied for frequent users, students, senior citizens | F | 2 | Sprint 2 | DiscountService(自动折扣计算) + UserType |
| 23 | Support usage by multiple clients simultaneously | F | 2 | Sprint 4 (S4-005/007) | @nestjs/throttler限流 + DB复合索引 |
| 24 | Provide a responsive user interface | NF | 2 | Sprint 4 (S4-031/032) | 响应式布局 + 骨架屏加载 + 定位按钮 |
| 25 | Address issues of accessibility (colour & font choices, etc) | NF | 2 | Sprint 2 | WCAG修复 + 对比度 + 键盘操作 |

**完成统计**: 25/25 Backlog ID ✅ 全部覆盖 (100%)

