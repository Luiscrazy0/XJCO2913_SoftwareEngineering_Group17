# Sprint 4 计划：Station 模式体验闭环与核心缺陷修复

---

## 文档信息

| 字段 | 内容 |
|------|------|
| Sprint 编号 | Sprint 4 |
| 文档版本 | v2.0（重大修订：回归 Station 模式，否决自由流动方案） |
| 创建日期 | 2026-04-27 |
| 前置 Sprint | Sprint 3（损坏反馈与业务收尾） |
| 预计工期 | 3-4 周 |

---

## 0. 审计前置摘要

在 Sprint 3 完成后，对项目进行了以商业上线为标准的全维度审计。以下是必须在 Sprint 4 解决的 **4 个致命缺陷**（注：经复查，`.env` 文件始终被 `.gitignore` 正确排除，未进入 Git 历史，已从缺陷清单移除）：

| # | 缺陷 | 位置 | 后果 |
|---|------|------|------|
| 1 | **支付与订单状态更新非原子性** | `payment.service.ts:41-60` | 幽灵支付：钱已扣、订单未确认 |
| 2 | **全量列表无分页** | `booking.service.ts:25`, `station.service.ts:9` | 千级数据量即 OOM 崩溃 |
| 3 | **硬编码密钥回退值** | `auth.module.ts:13`, `payment-card.service.ts` | 配置文件丢失 → 系统在无安全状态下静默运行 |
| 4 | **健康检查端点为空壳** | `health.controller.ts:4` | 容器调度器无法判断服务存活性 |

---

## 0.5 关键架构决定：为什么必须是 Station 模式

在审计讨论中，最初提出了将系统从 Station 模式改造为自由流动（Free-Floating）模式的方案，但在深入分析后被**否决**。原因如下：

### 自由流动模式的物理悖论

在一个没有硬件、没有 IoT 通信、没有移动端摄像头访问权限的 **纯 Web 应用** 中，如果地图上直接显示每辆滑板车：

```
用户在地图上看到 Scooter #8f3a —— 然后呢？
```

| 步骤 | 真实世界（有硬件） | 我们的项目（无硬件） |
|------|-------------------|---------------------|
| 找到车辆 | 跟着 GPS 走到车旁边 | 地图上看到坐标，现实中无法定位 |
| 解锁车辆 | 扫二维码 → IoT 指令开锁 | 无 QR、无 IoT、无法解锁 |
| 开始骑行 | 物理推动车辆，IMU 检测运动 | 数据库中改个状态 |
| 结束骑行 | 停好车 → APP 锁车 | 无物理锁 |

**结论**：自由流动模式的核心价值是「随时随地取还」，但实现这一价值的先决条件（GPS 导航寻车、QR 扫码解锁、IoT 远程控制）在当前技术边界内全部不可用。强行做自由流动 UX 只会制造一个「看起来像 Lime，用起来完全不通」的虚假界面。

### Station 模式的物理对应关系

Station 为什么是对的：

```
┌──────────────────────────────────────────────┐
│  线上（Web APP）          │  线下（物理世界）    │
├──────────────────────────────────────────────┤
│  地图上看到「图书馆站」    │  用户知道图书馆在哪   │
│  站内有 3 辆可用滑板车    │  到图书馆门口找停放点  │
│  预订 #8f3a → 获得确认码  │  向管理员出示/自助取车  │
│  APP 内点击「开始骑行」   │  推走滑板车           │
│  APP 内点击「结束骑行」   │  骑回站点，停好       │
└──────────────────────────────────────────────┘
```

Station 解决了「我怎么找到车」的问题——用户不需要 GPS 追踪到具体车辆坐标，只需要知道**哪个站点**。站点对应真实的物理地标（图书馆、食堂、体育馆），用户凭借常识就能到达。

这本质上是 **远程预约 + 站点取还（Remote Booking + Station Pickup/Return）** 模式，类似传统租车行或共享单车 1.0（有桩单车）。在硬件缺失的约束下，这是唯一符合物理现实的产品形态。

### 当前 Station 模式的问题不在于 Station 本身

用户反馈「站点模式感觉怪怪的」，问题不在 Station 这个抽象概念，而在 **围绕 Station 的交互流程存在断裂**。详见第 2 节。

---

## 1. Sprint 目标

> **在 Station 模式下补全租借体验闭环：从「能预订、能取消」升级为「看到价格→预订→支付→取车→骑行计时→还车→评价」的完整旅程。同时修复全部 P0 缺陷。**

---

## 2. 当前体验断裂点诊断

### 2.1 预订时看不到价格

`BookingModal.tsx` 仅有「租赁类型」和「开始时间」两个输入，无任何费用展示。价格 `totalCost` 只在预订成功后通过 `BookingCard` 展示。用户在决定「1 天还是 4 小时」时完全盲选。

**修复方向**：BookingModal 内嵌实时费用估算面板（调用后端 `/bookings/estimate-price`）。

### 2.2 支付是 `alert()` 弹窗

`MyBookingsPage.tsx:103`：「立即支付」按钮 → `alert('支付功能将在下一阶段实现')`。订单永远卡在 `PENDING_PAYMENT`，无法进入骑行状态。

**修复方向**：PaymentModal 替换 alert，完成支付后订单进入 CONFIRMED。

### 2.3 没有「取车 / 开始骑行」操作

当前订单变为 CONFIRMED 后，`BookingCard` 只提供「取消」和「续租」。用户如何标记「我已经到站点拿到车了」？——没有这个动作。骑行计时无法启动。

**修复方向**：CONFIRMED 后显示「开始骑行」按钮。用户到达站点取车后点击。记录实际的骑行起始时间（可能晚于预订的 startTime）。

### 2.4 没有「还车 / 结束骑行」操作

当前订单没有用户触发的结束机制。COMPLETED 状态的订单显示「无可用操作」。

**修复方向**：CONFIRMED / EXTENDED 状态下显示「结束骑行」按钮。点击后确认还车位置（自动检测或手动选择站点）+ 确认车辆完好。

### 2.5 地图到预订中间有全页跳转

`MapPage.tsx:356` 使用 `window.location.href` 做硬导航。React 完全重新挂载，地图状态丢失，1-2 秒白屏。

**修复方向**：改为在 MapPage 内直接打开 BookingModal（通过 URL 参数或组件状态），不离开地图页面；或至少使用 React Router 的 `navigate()` 进行无刷新跳转。

### 2.6 全量列表无分页

`GET /scooters`、`GET /stations`、`GET /bookings` 全部返回全量数据。站点超过 50 个、预定超过 500 条时，响应体积和前端渲染性能不可接受。

**修复方向**：所有 list 端点统一支持 `page` / `limit` 参数。

### 2.7 两点取还是「被隐藏的业务现实」

当前 Booking 创建时必须指定 `scooterId`，但 Booking 不关联 `stationId`。Scooter 有关联的 `stationId`。这隐含意味着用户在预订时实际上选择了「某个站点的某辆车」。但前端完全没有体现这个两层选择关系——MapPage 上看到站点列表 → 点进去看到车辆 → 点「立即预订」→ 跳出到独立页面。用户在整个过程中没有被明确告知「你预订的是图书馆站的车，请去图书馆取车」。

**修复方向**：预订流程中显式展示站点信息（站名、地址、地图位置），并在预订成功后的确认页面和 BookingCard 中突出显示。

---

## 3. 目标用户旅程（Sprint 4 完成后）——Station 模式

```
用户打开 APP
  │
  ▼
┌─────────────────────────────────────────────────────────┐
│  MapPage / 主界面                                        │
│                                                          │
│  ┌──────────────────────┬─────────────────────────────┐ │
│  │  站点列表（左侧 1/3）  │  高德地图（右侧 2/3）       │ │
│  │                      │                              │ │
│  │ ┌──────────────────┐ │  📍图书馆站(3辆)              │ │
│  │ │ 🟢 图书馆站 3辆   │ │       📍体育馆站(1辆)         │ │
│  │ │    距您 320m     │ │            📍食堂站(5辆)      │ │
│  │ └──────────────────┘ │     🔵(我)                    │ │
│  │ ┌──────────────────┐ │                              │ │
│  │ │ 🟢 体育馆站 1辆   │ │                              │ │
│  │ │    距您 500m     │ │                              │ │
│  │ └──────────────────┘ │                              │ │
│  │ ┌──────────────────┐ │                              │ │
│  │ │ 🟢 食堂站 5辆     │ │                              │ │
│  │ │    距您 800m     │ │                              │ │
│  │ └──────────────────┘ │                              │ │
│  └──────────────────────┴─────────────────────────────┘ │
│                                                          │
│  点击「图书馆站」→ 右侧下方展开站点详情：                    │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  📍 图书馆站                                         │ │
│  │  西南交通大学犀浦校区图书馆正门                          │ │
│  │                                                      │ │
│  │  可用车辆 (3):                                        │ │
│  │  ┌──────────────────────────────────────────────┐   │ │
│  │  │ 🛴 #8f3a2b1c  图书馆前    🔋 85%              │   │ │
│  │  │                                        [预订] │   │ │
│  │  └──────────────────────────────────────────────┘   │ │
│  │  ┌──────────────────────────────────────────────┐   │ │
│  │  │ 🛴 #a1b2c3d4  图书馆侧门  🔋 92%              │   │ │
│  │  │                                        [预订] │   │ │
│  │  └──────────────────────────────────────────────┘   │ │
│  └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
  │ 点击「预订」
  ▼
┌─────────────────────────────────────────────────────────┐
│  BookingModal（居中弹窗，不离开地图页面）                    │
│                                                          │
│  车辆信息:                                               │
│  🛴 Scooter #8f3a2b1c                                   │
│  📍 取车地点: 图书馆站（西南交通大学犀浦校区图书馆正门）      │
│                                                          │
│  租赁类型:                                               │
│  ○ 1小时  ○ 4小时(选中)  ○ 1天  ○ 1周                   │
│                                                          │
│  开始时间: [2026-04-27 14:30] ↕                          │
│                                                          │
│  ┌──────────────────────────────────────────────┐       │
│  │ 💰 费用明细                                    │       │
│  │                                               │       │
│  │  基本费用 (4小时):              ¥15.00         │       │
│  │  学生折扣 (8折):               -¥3.00         │       │
│  │  ────────────────────────────────────         │       │
│  │  应付金额:                      ¥12.00         │       │
│  │  预计结束时间:          2026-04-27 18:30       │       │
│  └──────────────────────────────────────────────┘       │
│                                                          │
│  [取消]                          [确认预订并支付 →]       │
└─────────────────────────────────────────────────────────┘
  │ 点击「确认预订并支付」
  ▼
┌─────────────────────────────────────────────────────────┐
│  PaymentModal（支付弹窗）                                  │
│                                                          │
│  订单摘要:                                               │
│  车辆: #8f3a2b1c | 4小时 | 取车站点: 图书馆站              │
│  金额: ¥12.00                                           │
│                                                          │
│  支付方式:                                               │
│  ○ 💳 ****1234 (默认卡)                                 │
│  ○ ➕ 添加新卡                                          │
│                                                          │
│  [取消]                       [确认支付 ¥12.00 →]        │
└─────────────────────────────────────────────────────────┘
  │ 支付成功
  ▼
┌─────────────────────────────────────────────────────────┐
│  预订成功页面 / 弹窗                                       │
│                                                          │
│  ✅ 预订成功！                                            │
│                                                          │
│  📋 预订编号: #booking-uuid                              │
│  🛴 车辆编号: #8f3a2b1c                                  │
│  📍 取车站点: 图书馆站                                    │
│  ⏰ 请于 14:30 前到达站点取车                              │
│                                                          │
│  取车时请出示预订编号给站点工作人员，                         │
│  或点击下方按钮确认取车。                                   │
│                                                          │
│  [查看我的订单]          [📍 导航到图书馆站]               │
└─────────────────────────────────────────────────────────┘
  │
  ▼ 用户到达站点，点击「开始骑行」
┌─────────────────────────────────────────────────────────┐
│  StartRideModal                                           │
│                                                          │
│  确认取车                                                 │
│  ┌──────────────────────────────────────────────┐       │
│  │ 🛴 #8f3a2b1c  |  图书馆站                     │       │
│  │                                               │       │
│  │ 请确认:                                        │       │
│  │ ☑ 已到达取车站点                               │       │
│  │ ☑ 车辆外观完好                                 │       │
│  │                                               │       │
│  │ (如需报告损坏，请点击取消后提交反馈)             │       │
│  └──────────────────────────────────────────────┘       │
│                                                          │
│  [取消]                         [确认取车，开始骑行 →]    │
└─────────────────────────────────────────────────────────┘
  │
  ▼ 骑行中
┌─────────────────────────────────────────────────────────┐
│  MyBookingsPage / ActiveRidePanel                        │
│                                                          │
│  🔴 骑行中                                                │
│  ┌──────────────────────────────────────────────┐       │
│  │ 🛴 #8f3a2b1c  |  取车: 图书馆站               │       │
│  │ ⏱ 已骑行: 00:03:22                            │       │
│  │ 📅 开始: 14:32  |  预计结束: 18:32            │       │
│  │ 💰 费用: ¥12.00（已支付）                      │       │
│  │                                               │       │
│  │ [续租 +1h (¥5)]           [🏁 结束骑行]        │       │
│  └──────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────┘
  │ 点击「结束骑行」
  ▼
┌─────────────────────────────────────────────────────────┐
│  EndRideModal                                             │
│                                                          │
│  结束骑行                                                 │
│  ┌──────────────────────────────────────────────┐       │
│  │ 🛴 #8f3a2b1c  |  骑行时长: 3小时22分           │       │
│  │ 💰 费用: ¥12.00（已支付）                      │       │
│  │                                               │       │
│  │ 请将滑板车归还至任意站点:                       │       │
│  │ ┌──────────────────────────────────┐         │       │
│  │ │ ○ 图书馆站（原取车站点）           │         │       │
│  │ │ ○ 体育馆站 (距您 200m)            │         │       │
│  │ │ ○ 食堂站   (距您 450m)            │         │       │
│  │ └──────────────────────────────────┘         │       │
│  │                                               │       │
│  │ ☑ 已归还至站点                                  │       │
│  │ ☑ 车辆外观完好                                  │       │
│  │                                               │       │
│  │ (如果车辆有损坏，请提交反馈报告)                 │       │
│  └──────────────────────────────────────────────┘       │
│                                                          │
│  [取消]                         [确认还车 →]              │
└─────────────────────────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────────────────────────┐
│  还车成功                                                 │
│                                                          │
│  ✅ 行程已结束！                                          │
│                                                          │
│  骑行时长: 3小时22分                                       │
│  费用: ¥12.00                                            │
│                                                          │
│  感谢使用！欢迎提交反馈。                                   │
│  [提交反馈]                    [返回首页]                  │
└─────────────────────────────────────────────────────────┘
```

---

## 4. Sprint Backlog

### Epic 1：核心缺陷修复（P0 — Week 1）

| Story ID | 标题 | 详情 | 工时 |
|----------|------|------|------|
| **S4-001** | 支付-订单状态更新包裹为原子事务 | `payment.service.ts` 中 `payment.create` + `booking.update` 包装为 `$transaction`；单元测试覆盖失败回滚场景 | 2h |
| **S4-002** | 支付接口增加幂等性 Key | 前端生成 `X-Idempotency-Key` header（`crypto.randomUUID()`）；后端 `Payment` 表加 `idempotencyKey` 唯一字段；重复请求返回已有结果 | 2h |
| **S4-003** | 移除所有硬编码密钥回退值 | `auth.module.ts:13` 和 `payment-card.service.ts` 中所有 `?? 'fallback'` 改为启动时 `throw new Error('XXX is required')` | 1h |
| **S4-004** | 实现健康检查端点 | `GET /health` → DB ping（`SELECT 1`）+ `process.uptime()` + `process.memoryUsage()` 返回 JSON | 1h |
| **S4-005** | 全局限流 | `main.ts` 引入 `@nestjs/throttler`，全局 100 req/60s；敏感端点（支付/登录/注册）5 req/60s | 2h |
| **S4-006** | 所有列表端点增加分页 | `GET /scooters`、`/bookings`、`/stations`、`/users`、`/feedbacks` 统一支持 `?page=1&limit=20`；后端返回 `{ items, total, page, limit, totalPages }`；前端消费分页结构 | 4h |
| **S4-007** | 数据库添加关键索引 | `Booking(userId, startTime, status)` 复合索引；`Scooter(status, stationId)` 复合索引；`Payment(bookingId, idempotencyKey)` 唯一索引 | 2h |

### Epic 2：预订体验升级（P1 — Week 1-2）

| Story ID | 标题 | 详情 | 工时 |
|----------|------|------|------|
| **S4-008** | 后端新增费用估算端点 | `GET /bookings/estimate-price?hireType=HOUR_4` → 返回 `{ baseCost, discountAmount, discountedPrice, discountReason }`（调用已有 DiscountService） | 2h |
| **S4-009** | BookingModal 增加费用估算面板 | 预订弹窗内渲染费用明细（基础费用 + 折扣 + 应付金额）；每次切换租赁类型实时调用估算 API；前端增加 `useDebounce` 避免频繁请求 | 3h |
| **S4-010** | BookingModal 增加站点信息展示 | 预订弹窗顶部显示「取车站点：图书馆站（西南交通大学犀浦校区图书馆正门）」及站点小地图位置示意 | 2h |
| **S4-011** | 预订成功页面增加取车指引 | 创建 Booking 成功后弹窗展示：预订编号、车辆编号、取车站点名和地址、建议到达时间。替代当前的「1400ms 后跳转到我的订单」 | 2h |
| **S4-012** | 地图到预订改为无刷新跳转 | `MapPage.tsx:356` 的 `window.location.href` 改为 React Router `navigate()`，或直接在 MapPage 内通过 state 控制 BookingModal 显示 | 2h |

### Epic 3：支付闭环（P1 — Week 2）

| Story ID | 标题 | 详情 | 工时 |
|----------|------|------|------|
| **S4-013** | PaymentModal 组件 | 新建支付弹窗：订单摘要（车辆、站点、时长、金额）、支付方式选择（已有卡列表 + 添加新卡）、确认支付按钮；替换 `MyBookingsPage` 中的 `alert()` | 4h |
| **S4-014** | 支付成功/失败处理 | 成功后 Booking → CONFIRMED，显示成功提示 + 取车指引；失败后显示错误 + 重试按钮 | 2h |
| **S4-015** | PaymentCard 列表集成 | 从 `GET /payment-cards` 获取用户已保存卡列表；支持选择已有卡或输入新卡号；默认选中 isDefault 的卡 | 2h |
| **S4-016** | 支付历史展示 | MyBookingsPage 的 BookingCard 中已支付的订单显示「已支付」标记和金额；无待支付订单时隐藏支付按钮 | 1h |

### Epic 4：骑行生命周期（P1 — Week 2-3）

| Story ID | 标题 | 详情 | 工时 |
|----------|------|------|------|
| **S4-017** | Booking 新增「开始骑行」端点 | `POST /bookings/:id/start-ride` 记录实际取车时间（`actualStartTime`），Booking 状态变为 IN_PROGRESS（新增状态）；验证用户身份和 Booking 当前状态为 CONFIRMED；需要 `Scooter.status` 已是 RENTED | 2h |
| **S4-018** | Booking 新增「结束骑行」端点 | `POST /bookings/:id/end-ride` 记录实际还车时间 + 还车站点（`returnStationId`）；Booking 状态变为 COMPLETED；Scooter 状态变为 AVAILABLE 并更新所属站点；若用户报告损坏 → 自动创建 HIGH 优先级 Feedback；需要按实际骑行时长重新计算费用（若提前还车可退差额，若超时需补扣） | 3h |
| **S4-019** | StartRideModal 组件 | 取车确认弹窗：显示车辆信息 + 站点 + 车辆完好确认 checkbox；防止误操作（二次确认）；成功后 BookingCard 切换到「骑行中」显示 | 2h |
| **S4-020** | EndRideModal 组件 | 还车确认弹窗：显示骑行摘要（时长、费用）；还车站点选择（下拉或附近站点列表）；车辆完好确认；若有损坏→快捷跳转到反馈表单 | 3h |
| **S4-021** | 骑行计时器 | BookingCard 在 IN_PROGRESS 状态下显示实时计时器（从 `actualStartTime` 起算，每秒更新显示）；同步显示费用 | 2h |
| **S4-022** | Booking 状态机完善 | 新增 IN_PROGRESS 状态（表示骑行中）；修正状态流转：`PENDING_PAYMENT → CONFIRMED → IN_PROGRESS → COMPLETED`；校验所有状态转换合法性 | 2h |

### Epic 5：还车选站与站点感知（P2 — Week 3）

| Story ID | 标题 | 详情 | 工时 |
|----------|------|------|------|
| **S4-023** | 还车时提供附近站点列表 | EndRideModal 调用 `GET /stations/nearby`（基于用户当前位置或手动选坐标），展示可还车站点列表，按距离排序，标注可用车位数量 | 2h |
| **S4-024** | BookingCard 显示取车/还车站点 | 每张订单卡片展示「取车站点：图书馆站」和「还车站点：体育馆站」（若已还车）；点击站点名跳转到地图并定位该站点 | 2h |
| **S4-025** | 地图标记根据站点可用车辆数着色 | 绿色（≥3 辆）→ 橙色（1-2 辆）→ 红色（0 辆）→ 灰色（关闭）；标记上显示数字（可用车辆数） | 1h |
| **S4-026** | Booking 模型增加站点关联 | `Booking` 表新增 `pickupStationId`（取车站点）和 `returnStationId`（还车站点，nullable）；`startRide` 自动填充 `pickupStationId`；`endRide` 填充 `returnStationId` | 2h |

### Epic 6：可观测性与运维基础（P2 — Week 3-4）

| Story ID | 标题 | 详情 | 工时 |
|----------|------|------|------|
| **S4-027** | 请求追踪中间件 | 全局 NestJS 中间件：注入 `X-Request-Id`（若无则用 `crypto.randomUUID()` 生成），附加到 `response` header 和日志中；贯穿请求全生命周期 | 2h |
| **S4-028** | 结构化日志 | 将全项目 `console.log/error` 替换为 NestJS `Logger`；日志格式为 JSON（含 timestamp、level、context、message、traceId）；区分 `debug/info/warn/error` 级别 | 3h |
| **S4-029** | Amap 外部调用加熔断 | `AmapService` 所有 HTTP 调用加 5 秒超时 + 3 次重试（指数退避）+ 熔断器（连续 5 次失败 → 60 秒内直接返回降级数据）；降级策略：返回空地址/缓存结果 | 3h |
| **S4-030** | 后端 Docker 化 | 编写 `backend/Dockerfile`（multi-stage build：build → production）；更新 `docker-compose.yml` 加入 backend 服务 + 环境变量注入 | 2h |

### Epic 7：前端体验完善（P2 — Week 4）

| Story ID | 标题 | 详情 | 工时 |
|----------|------|------|------|
| **S4-031** | 「回到我的位置」按钮实际生效 | `AmapMap.tsx` 中的定位按钮当前只弹 toast；改为调用高德地图 JS API 的 `map.setCenter()` + `map.setZoom()` 回到用户坐标；无用户位置时按钮隐藏 | 1h |
| **S4-032** | 地图加载骨架屏 | 地图数据加载期间显示 Skeleton（灰色占位区域 + 脉冲动画），替代当前的居中 spinner | 1h |
| **S4-033** | 预订成功/支付成功动画 | BookingModal 和 PaymentModal 成功后加入微动画（勾选图标缩放 + 绿色脉冲），改善反馈感知 | 1h |
| **S4-034** | E2E 测试：完整借还流程 | Playwright 脚本：注册 → 登录 → 浏览站点 → 选择车辆 → 预订并支付 → 开始骑行 → 等待 5 秒 → 结束骑行 → 验证状态为 COMPLETED | 4h |
| **S4-035** | 前端单元测试 | Vitest + React Testing Library：BookingModal（费用计算展示）、PaymentModal（成功/失败状态）、StartRideModal（表单验证）、EndRideModal（站点列表渲染） | 4h |

---

## 5. 详细技术规格

---

### 5.1 数据库 Schema 变更

#### 5.1.1 Booking 模型增强

```prisma
enum BookingStatus {
  PENDING_PAYMENT
  CONFIRMED
  IN_PROGRESS   // 新增：骑行中
  CANCELLED
  COMPLETED
  EXTENDED
}

model Booking {
  id                String        @id @default(uuid())
  userId            String
  scooterId         String
  pickupStationId   String?       // 新增：取车站点
  returnStationId   String?       // 新增：还车站点
  hireType          HireType
  startTime         DateTime
  endTime           DateTime
  actualStartTime   DateTime?     // 新增：实际取车时间
  actualEndTime     DateTime?     // 新增：实际还车时间
  originalEndTime   DateTime?
  status            BookingStatus @default(PENDING_PAYMENT)
  totalCost         Float
  extensionCount    Int           @default(0)
  extendedFrom      String?
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt

  scooter           Scooter       @relation(fields: [scooterId], references: [id])
  user              User          @relation(fields: [userId], references: [id])
  pickupStation     Station?      @relation("PickupStation", fields: [pickupStationId], references: [id])
  returnStation     Station?      @relation("ReturnStation", fields: [returnStationId], references: [id])
  employeeBooking   EmployeeBooking?
  payment           Payment?
  feedbacks         Feedback[]
}
```

#### 5.1.2 Station 模型增强

```prisma
model Station {
  id        String         @id @default(uuid())
  name      String
  address   String
  latitude  Float
  longitude Float
  isActive  Boolean        @default(true)   // 新增：是否运营中
  createdAt DateTime       @default(now())
  updatedAt DateTime       @updatedAt

  scooters          Scooter[]
  pickupBookings    Booking[]  @relation("PickupStation")
  returnBookings    Booking[]  @relation("ReturnStation")
}
```

#### 5.1.3 Payment 模型增强

```prisma
model Payment {
  id              String   @id @default(uuid())
  bookingId       String   @unique
  amount          Float
  status          String
  idempotencyKey  String?  @unique    // 新增：幂等性 Key
  createdAt       DateTime @default(now())
  booking         Booking  @relation(fields: [bookingId], references: [id])
}
```

#### 5.1.4 新增数据库索引

```sql
-- 复合索引：加速 Frequent 用户折扣查询
CREATE INDEX idx_booking_user_start_status 
  ON "Booking"("userId", "startTime", "status");

-- 复合索引：按站点 + 可用状态查找车辆
CREATE INDEX idx_scooter_status_station 
  ON "Scooter"("status", "stationId");

-- 唯一索引：防止并发重复支付
CREATE UNIQUE INDEX idx_payment_idempotency 
  ON "Payment"("idempotencyKey");

-- 复合索引：按站点 + 订单状态查找
CREATE INDEX idx_booking_pickup_station 
  ON "Booking"("pickupStationId", "status");
```

---

### 5.2 后端 API 规格

#### 5.2.1 分页规范（全局统一）

所有 `findAll` 类端点统一支持以下 Query Parameters：

| 参数 | 类型 | 默认值 | 最大 | 说明 |
|------|------|--------|------|------|
| `page` | number | 1 | — | 页码（从 1 开始） |
| `limit` | number | 20 | 100 | 每页数量 |
| `sortBy` | string | `createdAt` | — | 排序字段 |
| `sortOrder` | `asc` \| `desc` | `desc` | — | 排序方向 |

**统一响应格式：**
```json
{
  "success": true,
  "data": {
    "items": [],
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

**后端实现（可复用工具函数）：**
```typescript
// shared/pagination.ts
interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

function parsePagination(params: PaginationParams) {
  const page = Math.max(1, Number(params.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(params.limit) || 20));
  return {
    skip: (page - 1) * limit,
    take: limit,
    page,
    limit,
    orderBy: { [params.sortBy || 'createdAt']: params.sortOrder || 'desc' },
  };
}
```

#### 5.2.2 `GET /bookings/estimate-price` — 费用估算

```
GET /bookings/estimate-price?hireType=HOUR_4
Authorization: Bearer <token>
```

**Query Parameters:**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `hireType` | HireType | 是 | 租赁类型 |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "baseCost": 15.00,
    "discountAmount": 3.00,
    "discountRate": 0.2,
    "discountedPrice": 12.00,
    "discountReason": "学生折扣 (8折)",
    "hireType": "HOUR_4",
    "durationHours": 4
  }
}
```

**后端实现：**
```typescript
// booking.controller.ts
@Get('estimate-price')
async estimatePrice(
  @Query('hireType') hireType: HireType,
  @CurrentUser() user: JwtPayload,
) {
  const baseCost = this.bookingService.calculateCost(hireType);
  const discountResult = await this.discountService.calculateDiscountedPrice(
    user.sub, baseCost, hireType,
  );
  return {
    baseCost,
    ...discountResult,
    hireType,
    durationHours: this.getDurationHours(hireType),
  };
}
```

#### 5.2.3 `POST /bookings/:id/start-ride` — 开始骑行

```
POST /bookings/:id/start-ride
Authorization: Bearer <token>
```

**业务逻辑：**
1. 验证 Booking 存在且 `status === CONFIRMED`
2. 验证 `booking.userId === userId`（或 MANAGER 角色）
3. 验证 `booking.scooter.status === RENTED`
4. 在事务中：
   - 更新 `actualStartTime = new Date()`
   - 更新 `pickupStationId = booking.scooter.stationId`（取车时车辆所在的站点）
   - 更新 `status = IN_PROGRESS`
5. 返回更新后的 Booking

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "booking-uuid",
    "status": "IN_PROGRESS",
    "actualStartTime": "2026-04-27T14:32:00.000Z",
    "pickupStationId": "station-uuid",
    "scooter": { "id": "scooter-uuid", "status": "RENTED" }
  }
}
```

#### 5.2.4 `POST /bookings/:id/end-ride` — 结束骑行

```
POST /bookings/:id/end-ride
Authorization: Bearer <token>
Content-Type: application/json

{
  "returnStationId": "station-uuid",
  "isScooterIntact": true
}
```

**Request Body:**
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `returnStationId` | string | 是 | 还车站点 ID |
| `isScooterIntact` | boolean | 否 (default: true) | 车辆是否完好 |

**业务逻辑：**
1. 验证 Booking 存在且 `status === IN_PROGRESS` 或 `status === EXTENDED`
2. 验证 `booking.userId === userId`（或 MANAGER）
3. 验证 `returnStationId` 指向存在的 Station
4. 在事务中：
   - 更新 `actualEndTime = new Date()`
   - 更新 `returnStationId`
   - 更新 `status = COMPLETED`
   - 更新 `Scooter.status = AVAILABLE`
   - 更新 `Scooter.stationId = returnStationId`
   - 若 `isScooterIntact === false` → 创建 HIGH 优先级 DAMAGE Feedback
5. 发送还车确认邮件

**Response (200):**
```json
{
  "success": true,
  "data": {
    "booking": { "id": "...", "status": "COMPLETED", "actualEndTime": "..." },
    "scooter": { "id": "...", "status": "AVAILABLE", "stationId": "..." },
    "damageReportCreated": false
  }
}
```

#### 5.2.5 修复后的支付流程（原子事务 + 幂等性）

```typescript
// payment.service.ts (修复后)
async createPayment(
  bookingId: string,
  amount: number,
  userId: string,
  idempotencyKey: string,
) {
  // 第0步：幂等性检查（重复请求直接返回已有结果）
  const existingPayment = await this.prisma.payment.findUnique({
    where: { idempotencyKey },
  });
  if (existingPayment) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });
    return { payment: existingPayment, booking };
  }

  // 第1步：验证 Booking
  const booking = await this.prisma.booking.findUnique({
    where: { id: bookingId },
    include: { user: true, scooter: true },
  });

  if (!booking) throw new BadRequestException('Booking not found');
  if (booking.userId !== userId) throw new ForbiddenException();
  if (booking.status !== BookingStatus.PENDING_PAYMENT) {
    throw new BadRequestException('Booking cannot be paid');
  }

  // 第2步：原子事务（全部成功或全部回滚）
  return this.prisma.$transaction(async (tx) => {
    const payment = await tx.payment.create({
      data: {
        bookingId,
        amount,
        status: 'SUCCESS',
        idempotencyKey,
      },
    });

    const updatedBooking = await tx.booking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.CONFIRMED,
        pickupStationId: booking.scooter.stationId, // 取车站点 = 车辆当前所在站点
      },
      include: { scooter: true },
    });

    // 预留车辆
    await tx.scooter.update({
      where: { id: booking.scooterId },
      data: { status: ScooterStatus.RENTED },
    });

    return { payment, booking: updatedBooking };
  });
}
```

#### 5.2.6 健康检查端点

```typescript
// health.controller.ts
import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check() {
    const start = Date.now();
    let dbStatus: 'ok' | 'error' = 'error';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      dbStatus = 'ok';
    } catch {}

    return {
      status: dbStatus === 'ok' ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: Math.round(process.uptime()),
      memory: {
        heapUsedMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        heapTotalMB: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      },
      checks: {
        database: { status: dbStatus, latencyMs: Date.now() - start },
      },
    };
  }
}
```

#### 5.2.7 速率限制配置

```typescript
// main.ts 新增
import { ThrottlerModule } from '@nestjs/throttler';

// AppModule imports 中添加：
ThrottlerModule.forRoot([{
  ttl: 60000,
  limit: 100,
}]),
```

敏感端点使用更严格限制：
```typescript
@UseGuards(ThrottlerGuard)
@Throttle({ default: { limit: 5, ttl: 60000 } })
@Post()
async createPayment() { ... }
```

---

### 5.3 前端架构变更

#### 5.3.1 路由表调整

| 路由 | Sprint 3 | Sprint 4 | 变更说明 |
|------|----------|----------|---------|
| `/map` | MapPage（站点地图） | MapPage（不改布局，修复交互问题） | BookingModal 内嵌、全页跳转改为 Router navigate |
| `/scooters` | ScooterListPage（卡片列表） | 保持，增加分页 | 不再作为地图跳转目标 |
| `/bookings` | MyBookingsPage | 保持，增加 IN_PROGRESS 状态渲染 + 骑行计时器 | BookingCard 扩展 |
| `/bookings/:id` | — | BookingDetailPage（单个订单详情） | 新增 |

#### 5.3.2 新增 / 修改的前端组件

```
src/components/
├── booking/
│   ├── BookingModal.tsx        # (修改) 增加费用估算 + 站点信息
│   ├── PriceEstimate.tsx       # (新增) 费用估算子组件
│   ├── PaymentModal.tsx        # (新增) 支付弹窗（替换 alert）
│   ├── BookingSuccessModal.tsx # (新增) 预订成功弹窗（含取车指引）
│   ├── StartRideModal.tsx      # (新增) 取车确认弹窗
│   ├── EndRideModal.tsx        # (新增) 还车确认弹窗
│   └── RideTimer.tsx           # (新增) 骑行计时器
├── booking/
│   └── BookingCard.tsx         # (修改) 增加 IN_PROGRESS 状态 + 取车/还车站点
├── map/
│   ├── AmapMap.tsx             # (修改) 「回到我的位置」按钮生效
│   └── MapSkeleton.tsx         # (新增) 地图加载骨架屏
```

#### 5.3.3 新增前端 API 模块

```typescript
// api/price.ts
export const priceApi = {
  estimate: (params: { hireType: HireType }) =>
    axiosClient.get<PriceEstimateResponse>('/bookings/estimate-price', { params }),
}

// api/ride.ts
export const rideApi = {
  startRide: (bookingId: string) =>
    axiosClient.post<Booking>(`/bookings/${bookingId}/start-ride`),
  endRide: (bookingId: string, data: { returnStationId: string; isScooterIntact: boolean }) =>
    axiosClient.post<EndRideResponse>(`/bookings/${bookingId}/end-ride`, data),
}
```

#### 5.3.4 新增前端类型

```typescript
// types/index.ts 新增
export interface PriceEstimateResponse {
  baseCost: number
  discountAmount: number
  discountRate: number
  discountedPrice: number
  discountReason: string
  hireType: HireType
  durationHours: number
}

export interface EndRideResponse {
  booking: Booking
  scooter: Scooter
  damageReportCreated: boolean
}
```

#### 5.3.5 Booking 状态机——前端渲染逻辑

```typescript
// BookingCard 中的动作按钮映射
const actionMap: Record<BookingStatus, string[]> = {
  PENDING_PAYMENT: ['pay', 'cancel'],
  CONFIRMED:        ['start-ride', 'extend', 'cancel'],
  IN_PROGRESS:      ['end-ride', 'extend'],
  EXTENDED:         ['end-ride', 'extend'],
  COMPLETED:        ['feedback'],
  CANCELLED:        [],
}
```

---

### 5.4 状态流转图

```
                    用户创建 Booking
                          │
                          ▼
                  ┌───────────────┐
                  │ PENDING_PAYMENT│───────── 用户取消 ──→ CANCELLED
                  └───────┬───────┘
                          │ 用户支付（原子事务）
                          ▼
                   ┌──────────┐
                   │ CONFIRMED│────────── 用户取消 ──→ CANCELLED
                   └─────┬────┘          （释放车辆）
                         │
                         │ 用户到达站点，点击「开始骑行」
                         ▼
                  ┌────────────┐
                  │IN_PROGRESS │ ←── 续租（循环）
                  └─────┬──────┘
                        │
                        │ 用户点击「结束骑行」
                        ▼
                   ┌──────────┐
                   │COMPLETED │
                   └──────────┘
```

```
Scooter 状态流转：
  AVAILABLE ──(支付成功)──→ RENTED ──(还车)──→ AVAILABLE
      ↑                                              │
      └────────────(管理员恢复)──────────────────────┘
```

---

## 6. 验收标准

### 6.1 Sprint 级验收标准

- [ ] **AC-1: 完整借还闭环**：用户可完成「查看站点→选车→看价格→预订→支付→开始骑行→计时→结束骑行」全流程
- [ ] **AC-2: 价格透明**：预订前始终可见费用估算（含折扣明细）
- [ ] **AC-3: 支付非 alert**：PaymentModal 替换所有 `alert()` 调用
- [ ] **AC-4: 零 P0 缺陷**：支付原子性、分页、密钥安全、健康检查全部修复并通过测试
- [ ] **AC-5: 全部 API 支持分页**：`/scooters`、`/bookings`、`/stations`、`/users` 返回分页结构
- [ ] **AC-6: E2E 测试通过**：完整借还流程自动化测试
- [ ] **AC-7: 关键组件有单元测试**：BookingModal、PaymentModal、StartRideModal、EndRideModal

### 6.2 关键 Story 级验收标准

#### S4-001 支付原子性
- [ ] `$transaction` 包裹 `payment.create` + `booking.update` + `scooter.update`
- [ ] 单元测试覆盖：模拟 `scooter.update` 失败 → 验证 payment 未创建
- [ ] 单元测试覆盖：正常流程 → 三表同时更新

#### S4-006 分页
- [ ] `GET /scooters?page=2&limit=10` 返回第 2 页 10 条
- [ ] 不传参数默认 `page=1&limit=20`
- [ ] `limit=200` 自动截断为 100
- [ ] 返回 `totalPages` 计算正确

#### S4-009 费用估算
- [ ] BookingModal 选择租赁类型后实时显示费用
- [ ] 费用包含：基本费用、折扣金额、折扣原因、应付金额
- [ ] 切换类型时有 loading 状态
- [ ] API 失败时显示「费用估算暂不可用」

#### S4-020 EndRideModal
- [ ] 显示骑行时长和已付费用
- [ ] 提供附近站点列表供选择还车站点
- [ ] 「车辆完好」checkbox 必选
- [ ] 取消勾选 → 提示「将自动提交损坏报告」
- [ ] 还车成功后 Booking → COMPLETED，Scooter → AVAILABLE

---

## 7. 风险与依赖

| 风险 | 级别 | 缓解措施 |
|------|------|---------|
| 费用估算 API 需新增端点，可能与其他 Story 耦合 | 低 | 先实现后端端点（S4-008），前端可先硬编码 mock 数据并行开发 |
| `IN_PROGRESS` 状态新增可能影响现有 Booking 逻辑 | 中 | 全量搜索 `BookingStatus` 使用处，逐一更新状态判断逻辑 |
| 前端重构范围较大（6 个新 Modal），组件复用可能不足 | 中 | 提取通用 Modal 容器组件；所有 Modal 共享关闭/确认按钮样式 |
| 高德地图 JS API 环境依赖（本地 vs CI） | 低 | 地图组件在测试中 mock；E2E 测试使用 `browser.geolocation` mock |
| 费率调整（按实际骑行时长重新计费）可能引入计费 bug | 中 | 充分单元测试边界情况（提前还、超时还、续租后还） |

---

## 8. 测试策略

### 8.1 后端单元测试
- `PaymentService.createPayment`：原子性（正常 + DB 故障模拟）+ 幂等性（重复请求）
- `BookingService.startRide`：状态校验（非 CONFIRMED 拒绝、非本人拒绝）
- `BookingService.endRide`：状态校验 + Scooter 状态恢复 + 损坏报告自动创建
- `DiscountService.calculateDiscountedPrice`：各折扣类型的边界值

### 8.2 前端组件测试（Vitest + React Testing Library）
- `BookingModal`：费用估算渲染、站点信息展示、提交按钮状态
- `PaymentModal`：支付成功/失败/重试、卡列表加载
- `StartRideModal`：表单验证、提交成功回调
- `EndRideModal`：站点列表渲染、表单验证
- `RideTimer`：计时器精度（mock `Date.now()`）

### 8.3 E2E 测试（Playwright）

**Happy Path（核心流程）：**
```
1. 注册新用户 → 登录
2. 地图加载 → 验证站点标记出现
3. 点击站点 → 列表展示车辆 + 可用数量
4. 点击车辆的「预订」→ 验证 BookingModal（含费用估算）
5. 选择 4 小时 → 确认预订 → 验证 PaymentModal
6. 确认支付 → 验证成功提示 + 取车指引
7. 导航到「我的订单」→ 验证订单状态为 CONFIRMED
8. 点击「开始骑行」→ 验证 StartRideModal → 确认
9. 验证订单状态变为 IN_PROGRESS + 计时器启动
10. 等待 5 秒 → 点击「结束骑行」→ 验证 EndRideModal
11. 选择还车站点 → 确认 → 验证 COMPLETED + Scooter 恢复 AVAILABLE
```

---

## 9. 工时汇总

| Epic | Stories | 总工时 |
|------|---------|--------|
| Epic 1: 核心缺陷修复 | 7 | 14h |
| Epic 2: 预订体验升级 | 5 | 11h |
| Epic 3: 支付闭环 | 4 | 9h |
| Epic 4: 骑行生命周期 | 6 | 14h |
| Epic 5: 还车选站与站点感知 | 4 | 7h |
| Epic 6: 可观测性与运维 | 4 | 10h |
| Epic 7: 前端体验完善 | 5 | 11h |
| **总计** | **35** | **76h** |

---

## 10. 与前一版计划（v1.0 自由流动方案）的差异说明

| 维度 | v1.0（已废弃） | v2.0（当前） |
|------|---------------|-------------|
| 核心模式 | 自由流动（Free-Floating） | Station 模式（站点取还） |
| Station 角色 | 降级为优选停车区 | 保持为物理借还锚点 |
| 地图标记 | 每辆 Scooter 独立标记 | Station 标记 + 数字（可用车辆数） |
| 寻车方式 | GPS 坐标导航到车 | 用户前往已知站点 |
| 解锁方式 | 扫码（不可实现） | 取车确认（到达站点后点击） |
| Booking 新增字段 | `RideSession` 独立表 | `actualStartTime`、`pickupStationId`、`returnStationId` |
| Scooter 新增字段 | `batteryLevel`、`isReserved` | 无（不模拟硬件状态） |
| 工时 | 108h | 76h |

---

*文档结束*
