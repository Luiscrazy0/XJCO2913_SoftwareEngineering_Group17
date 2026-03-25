Sprint 1 - 阶段5：我的预约页面（MyBookingsPage）开发文档（API对齐版）
一、阶段目标（工程化定义）

实现一个认证用户专属的预约列表页：

拉取 GET /bookings
渲染用户自己的 Booking（后端已按用户过滤 or 前端过滤 userId）
显示完整业务信息（时间 / 车辆 / 状态 / 金额）
支持 4 种核心 UI 状态：
Loading
Success
Empty
Error
二、API 对接规范
1️⃣ 获取预约列表

Endpoint

GET /bookings
Authorization: Bearer <token>
2️⃣ 返回数据结构（关键字段）
type Booking = {
  id: string;
  userId: string;
  scooterId: string;

  hireType: 'HOUR_1' | 'HOUR_4' | 'DAY_1' | 'WEEK_1';

  startTime: string;   // ISO
  endTime: string;

  status: 
    | 'PENDING_PAYMENT'
    | 'CONFIRMED'
    | 'CANCELLED'
    | 'COMPLETED';

  totalCost: number;

  scooter: {
    id: string;
    location: string;
    status: 'AVAILABLE' | 'UNAVAILABLE';
  };

  user: {
    id: string;
    email: string;
  };
};
三、状态流（与 React Query 对齐）
MyBookingsPage mounted
  ↓
useQuery(['bookings'], fetchBookings)

  ↓
isLoading → Skeleton UI
isError   → Error UI（Retry）
isSuccess →
    bookings.length === 0 → Empty UI
    bookings.length > 0 → BookingList
四、状态映射（核心：API → UI）

这是本阶段最关键的改动点👇

后端状态 → UI标签
API状态	UI显示	说明
PENDING_PAYMENT	PENDING	等待支付
CONFIRMED	CONFIRMED	已确认
CANCELLED	CANCELLED	已取消
COMPLETED	COMPLETED	已完成
映射函数（必须实现）
function mapBookingStatus(status: Booking['status']) {
  switch (status) {
    case 'PENDING_PAYMENT':
      return 'PENDING';
    case 'CONFIRMED':
      return 'CONFIRMED';
    case 'CANCELLED':
      return 'CANCELLED';
    case 'COMPLETED':
      return 'COMPLETED';
  }
}
五、组件结构（最终实现形态）
<MyBookingsPage>
  <Navbar />

  <Header />
  <Stats bookings={data} />

  <BookingList>
    {bookings.map(b => (
      <BookingCard key={b.id} booking={b} />
    ))}
  </BookingList>
</MyBookingsPage>
六、BookingCard 数据绑定（严格字段定义）
必须展示字段（按优先级）
1️⃣ 状态标签（status）
2️⃣ Booking ID（id）
3️⃣ 时间（startTime - endTime）
4️⃣ Total Cost（totalCost）
5️⃣ Scooter 信息（location / id）
示例 UI 数据结构
type BookingCardProps = {
  booking: Booking;
};
时间处理（必须格式化）
import dayjs from 'dayjs';

const start = dayjs(booking.startTime).format('MMM D, HH:mm');
const end = dayjs(booking.endTime).format('MMM D, HH:mm');
七、UI颜色系统（保持你原设计）

这里只保留开发关键 Token

状态标签
--booking-pending-bg: #FEF3C7;
--booking-pending-text: #92400E;

--booking-confirmed-bg: #DCFCE7;
--booking-confirmed-text: #166534;

--booking-cancelled-bg: #FEE2E2;
--booking-cancelled-text: #7F1D1D;

--booking-completed-bg: #E2E8F0;
--booking-completed-text: #334155;
价格强调
--booking-price: #2563EB;
八、状态样式控制（推荐实现）
function getStatusStyle(status: Booking['status']) {
  switch (status) {
    case 'PENDING_PAYMENT':
      return pendingStyle;
    case 'CONFIRMED':
      return confirmedStyle;
    case 'CANCELLED':
      return cancelledStyle;
    case 'COMPLETED':
      return completedStyle;
  }
}
九、业务逻辑增强（建议实现）
1️⃣ 是否可取消（前端控制）
const canCancel = booking.status === 'PENDING_PAYMENT';

👉 对应 API：

PATCH /bookings/:id/cancel
2️⃣ 是否可支付（关键）
const canPay = booking.status === 'PENDING_PAYMENT';

👉 对应 API：

POST /payments
十、页面状态实现（必须完成）
Loading
{isLoading && <SkeletonList />}
Empty
{isSuccess && bookings.length === 0 && (
  <EmptyState text="No bookings yet" />
)}
Error
{isError && (
  <ErrorState onRetry={refetch} />
)}
十一、Stats 统计模块（基于真实数据）
const stats = {
  total: bookings.length,
  confirmed: bookings.filter(b => b.status === 'CONFIRMED').length,
  pending: bookings.filter(b => b.status === 'PENDING_PAYMENT').length,
  completed: bookings.filter(b => b.status === 'COMPLETED').length,
};
十二、前端数据层建议（React Query）
const fetchBookings = async (): Promise<Booking[]> => {
  const res = await axios.get('/bookings', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
十三、关键工程注意点（很重要）
1️⃣ 不要信任 UI 状态名

必须始终使用：

booking.status === 'PENDING_PAYMENT'

而不是：

'PENDING' // ❌ 错误（只是UI层）
2️⃣ 时间一定是 ISO 字符串

必须格式化，否则 UI 会很乱。

3️⃣ totalCost 是 number
£{booking.totalCost}
4️⃣ scooter 信息已经 join 好

不要再请求：

booking.scooter.location // ✅ 直接用
十四、页面优先级（交互视角）

用户扫描路径：

状态 → 时间 → 是否已完成 → 价格