# Sprint 4 计划

## 0. 审计前置摘要

 **4 个致命缺陷**：

| # | 缺陷 | 位置 | 后果 |
|---|------|------|------|
| 1 | **支付与订单状态更新非原子性** | `payment.service.ts:41-60` | 幽灵支付：钱已扣、订单未确认 |
| 2 | **全量列表无分页** | `booking.service.ts:25`, `station.service.ts:9` | 千级数据量即 OOM 崩溃 |
| 3 | **硬编码密钥回退值** | `auth.module.ts:13`, `payment-card.service.ts` | 配置文件丢失 → 系统在无安全状态下静默运行 |
| 4 | **健康检查端点为空壳** | `health.controller.ts:4` | 容器调度器无法判断服务存活性 |

---

## 0.5 关键架构决定：Station 模式

本项目继续采用 **Station-based 架构**。

### 模式对标

| 维度 | Free-Floating（不采用） | Station-based（本项目） |
|------|----------------------|----------------------|
| 硬件依赖 | IoT / GPS / 蓝牙 | 无需硬件 |
| 寻车方式 | GPS 导航到具体车辆 | 用户前往已知地标站点 |
| 解锁方式 | 扫码/蓝牙 → IoT 指令 | 取车码验证 + 确认取车 |
| 状态可信度 | 依赖设备信号 | 全部由系统验证 |
| 适用场景 | Lime / Bird 等重资产模式 | Docked bike-sharing（当前能力可闭环） |

### 物理对应关系

线上与线下对应关系：

\`\`\`
┌──────────────────────────────────────────────┐
│  线上（Web APP）          │  线下（物理世界）    │
├──────────────────────────────────────────────┤
│  地图上看到「图书馆站」    │  用户知道图书馆在哪   │
│  站内有 3 辆可用滑板车    │  到图书馆门口找停放点  │
│  预订 #8f3a → 获得取车码  │  输入取车码自助取车   │
│  APP 内点击「开始骑行」   │  推走滑板车           │
│  APP 内点击「结束骑行」   │  骑回站点，停好       │
└──────────────────────────────────────────────┘
---

## 1. Sprint 目标

> **在 Station 模式下完成完整租借闭环：价格展示 → 预订 → 支付 → 取车 → 骑行 → 还车 → 评价，同时修复全部 P0 缺陷。**

---

## 1.5 系统设计原则

### 强约束（必须保证）

- 核心状态必须由系统验证，而非依赖设备信号或前端临时数据
- 状态转换必须可追溯（Booking → Ride → Payment）

### 弱约束（仅增强体验，不作为业务依据）

- 浏览器定位、用户拍照、前端轨迹绘制——仅前端展示，不参与业务判断

---

## 2. 当前体验断裂点诊断

### 2.1 预订时看不到价格

`BookingModal.tsx` 仅提供租赁类型和开始时间输入，无费用展示，`totalCost` 仅预订成功后可见。

**修复方向**：BookingModal 内嵌实时费用估算面板（调用 `/bookings/estimate-price`）。

### 2.2 支付是 `alert()` 弹窗

`MyBookingsPage.tsx:103` 的「立即支付」按钮触发 `alert(...)`，订单阻塞于 `PENDING_PAYMENT`。

**修复方向**：PaymentModal 替换 alert，引入支付状态机（模拟流程）：

`PENDING → AUTHORIZED → CAPTURED → REFUNDED`

体现完整的预授权 → 扣款 → 退款流程。支付成功后订单进入 CONFIRMED。

### 2.3 没有「取车 / 开始骑行」操作

CONFIRMED 后 BookingCard 仅提供取消/续租，无取车确认入口，骑行计时无法启动。

**修复方向**：
1. Pickup Code（取车码）：4 位随机码，用户到站后输入验证取车，替代硬件解锁
2. 状态流转：CONFIRMED → (取车码验证) → IN_PROGRESS
3. 记录实际取车时间 actualStartTime

### 2.4 没有「还车 / 结束骑行」操作

当前无用户触发的结束机制，COMPLETED 状态的订单显示「无可用操作」。

**修复方向**：
1. 结束骑行按钮：选择还车站点 + 确认车辆完好
2. 双轨计费：Booking 锁定价格保底，还车时按实际时长多退少补
3. 软追踪：浏览器 GPS 在地图绘制轨迹，仅展示不参与计费；可加围栏 toast 提醒但不强制结束

> 以下数据仅用于展示，不参与任何业务判断：骑行路径、当前坐标、是否离开区域。

### 2.5 地图到预订中间有全页跳转

`MapPage.tsx:356` 使用 `window.location.href` 硬导航，React 完全重新挂载，地图状态丢失。

**修复方向**：MapPage 内直接打开 BookingModal，消除全页跳转

### 2.6 全量列表无分页

`GET /scooters`、`/stations`、`/bookings` 返回全量数据，站点超 50、订单超 500 时响应及渲染性能不可接受。

**修复方向**：所有列表接口统一支持分页参数

### 2.7 两点取还是「被隐藏的业务现实」

当前 Booking 须指定 `scooterId` 但不关联 `stationId`，用户实质上选择了「某站点的某辆车」，但前端未体现此两层选择关系，也未被明确告知取车站点。

**修复方向**：
1. 预订全流程显式展示取车站点信息
2. 站点视图增加车辆状态标签和可用数量

### 2.8 骑行状态无刷新持久化

骑行中刷新页面丢失前端 Ride 状态（核心数据已存数据库，但前端体验出现断层）。

**修复方向**：localStorage 保存骑行状态，刷新后自动恢复计时器

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
| **S4-001** | 支付-订单原子事务 | payment.create + booking.update 包裹为原子事务；单元测试覆盖回滚场景 | 2h |
| **S4-002** | 支付幂等性 Key | 前端生成幂等 Key header；后端 Payment 表加唯一字段；重复请求返回已有结果 | 2h |
| **S4-003** | 移除硬编码密钥 | 所有回退值改为启动时抛错，禁止无安全运行 | 1h |
| **S4-004** | 健康检查端点 | DB 连通性 + 进程运行时间 + 内存使用 | 1h |
| **S4-005** | 全局限流 | 全局 100 req/60s，敏感端点 5 req/60s | 2h |
| **S4-006** | 列表分页 | 所有列表接口统一支持 page/limit 参数；返回分页结构；前端适配 | 4h |
| **S4-007** | 数据库索引 | Booking/Scooter/Payment 表添加关键索引 | 2h |

### Epic 2：预订体验升级（P1 — Week 1-2）

| Story ID | 标题 | 详情 | 工时 |
|----------|------|------|------|
| **S4-008** | 费用估算端点 | GET /bookings/estimate-price 返回费用明细（基础费、折扣、应付金额） | 2h |
| **S4-009** | 预订弹窗费用展示 | 预订弹窗内实时显示费用明细，切换租赁类型时重新计算 | 3h |
| **S4-010** | 预订弹窗站点信息 | 弹窗顶部显示取车站点名称、地址及地图示意 | 2h |
| **S4-011** | 预订成功取车指引 | 成功后弹窗展示预订编号、车辆编号、取车站点、建议到达时间 | 2h |
| **S4-012** | 消除地图到预订的全页跳转 | MapPage 内直接打开弹窗，替代硬导航 | 2h |

### Epic 3：支付闭环（P1 — Week 2）

| Story ID | 标题 | 详情 | 工时 |
|----------|------|------|------|
| **S4-013** | PaymentModal 组件 | 支付弹窗：订单摘要、支付方式选择、确认支付按钮；替换 alert() | 4h |
| **S4-014** | 支付成功/失败处理 | 成功后订单进入 CONFIRMED + 取车指引；失败显示错误 + 重试 | 2h |
| **S4-015** | 支付卡列表集成 | 展示用户已保存卡，支持选卡或输入新卡号 | 2h |
| **S4-016** | 支付历史展示 | 已支付订单显示「已支付」标记和金额 | 1h |

### Epic 4：骑行生命周期（P1 — Week 2-3）

| Story ID | 标题 | 详情 | 工时 |
|----------|------|------|------|
| **S4-017** | 开始骑行端点 | POST /bookings/:id/start-ride 记录实际取车时间，Booking → IN_PROGRESS | 2h |
| **S4-018** | 结束骑行端点 | POST /bookings/:id/end-ride 记录还车时间+站点，Booking → COMPLETED，Scooter → AVAILABLE；损坏自动创建反馈；按实际时长重新计费 | 3h |
| **S4-019** | StartRideModal 组件 | 取车确认弹窗：车辆信息 + 站点 + 完好确认；防止误操作 | 2h |
| **S4-020** | EndRideModal 组件 | 还车确认弹窗：骑行摘要 + 还车站点选择 + 完好确认 | 3h |
| **S4-021** | 骑行计时器 | IN_PROGRESS 状态下实时显示骑行时长和费用 | 2h |
| **S4-022** | 状态机完善 | 新增 IN_PROGRESS 状态；流转：PENDING_PAYMENT → CONFIRMED → IN_PROGRESS → COMPLETED | 2h |

### Epic 5：还车选站与站点感知 [扩展目标]（P2 — Week 3）

| Story ID | 标题 | 详情 | 工时 |
|----------|------|------|------|
| **S4-023** | 还车附近站点列表 | EndRideModal 展示附近站点，按距离排序 | 2h |
| **S4-024** | BookingCard 显示站点 | 订单卡片展示取车/还车站点，点击跳转地图 | 2h |
| **S4-025** | 地图标记着色 | 按可用车辆数着色：绿(≥3)→橙(1-2)→红(0)→灰(关闭) | 1h |
| **S4-026** | Booking 关联站点 | Booking 表增加 pickupStationId 和 returnStationId | 2h |

### Epic 6：可观测性与运维基础 [扩展目标]（P2 — Week 3-4）

| Story ID | 标题 | 详情 | 工时 |
|----------|------|------|------|
| **S4-027** | 请求追踪中间件 | 全局注入请求 ID，贯穿请求全生命周期，附加到 header 和日志 | 2h |
| **S4-028** | 结构化日志 | 全项目日志替换为 JSON 格式（含时间、级别、上下文、追踪 ID） | 3h |
| **S4-029** | Amap 熔断 | 外部 HTTP 调用加超时 + 重试 + 熔断器，失败时返回缓存降级数据 | 3h |
| **S4-030** | 后端 Docker 化 | 编写 Dockerfile + docker-compose 集成 | 2h |

### Epic 7：前端体验完善 [扩展目标]（P2 — Week 4）

| Story ID | 标题 | 详情 | 工时 |
|----------|------|------|------|
| **S4-031** | 「回到我的位置」按钮 | 定位按钮实际调用地图 API 回到用户坐标 | 1h |
| **S4-032** | 地图加载骨架屏 | 加载中显示骨架占位动画，替代居中 spinner | 1h |
| **S4-033** | 成功动画 | 预订/支付成功后加入勾选缩放动画 | 1h |
| **S4-034** | E2E 完整借还流程 | Playwright 脚本：注册→登录→选车→预订→支付→取车→骑行→还车→验证 | 4h |
| **S4-035** | 前端单元测试 | BookingModal、PaymentModal、StartRideModal、EndRideModal 组件测试 | 4h |

---

### 4.8 评估标准对齐与过程保障

#### 4.8.1 Backlog 追溯矩阵

| Story ID | 标题 | 覆盖 Backlog ID | 优先级 |
|----------|------|----------------|--------|
| S4-001 | 支付原子事务 | 6 | F1 |
| S4-002 | 幂等性 Key | 6 | F1 |
| S4-003 | 移除硬编码密钥 | — | 技术债务 |
| S4-004 | 健康检查端点 | — | 运维 |
| S4-005 | 全局限流 | 23 (部分) | NF2 |
| S4-006 | 列表分页 | 17, 18 | F2 |
| S4-007 | 数据库索引 | 23 (部分) | NF2 |
| S4-008–009 | 费用估算 | 4 | F1 |
| S4-010 | BookingModal 站点信息 | 5 | F1 |
| S4-011 | 预订成功取车指引 | 8 | F1 |
| S4-012 | 地图无刷新跳转 | 18 | F2 |
| S4-013–016 | 支付闭环 | 6, 2 | F1 |
| S4-017–022 | 骑行生命周期（开始/结束/计时/状态机） | 5, 10, 11, 12 | F1/F2 |
| S4-023–025 | 还车选站与站点感知 | 17, 18 | F2 |
| S4-026 | Booking 站点关联 | 5 | F1 |
| S4-027–028 | 可观测性 | — | 运维 |
| S4-029 | Amap 熔断 | — | 运维 |
| S4-030 | Docker 化 | — | 部署 |
| S4-031–033 | 前端体验（定位/骨架屏/动画） | 24 (部分) | NF2 |
| S4-034–035 | 测试（E2E + 单元） | — | 质量保障 |

> **注意**：Backlog ID 16（配置车辆与费用）、19/20/21（收入统计）未在 Sprint 4 范围内——需确认 Sprint 1-2 完成状态，未完成则在 Week 4 补充。

#### 4.8.2 Wiki 文档要求（CW2 评分项 15/85）

| 文档 | 要求 | 负责人 |
|------|------|--------|
| 会议记录 | Sprint 规划、站会、评审记录（含日期、出席者、决策） | SM |
| 数据模型 | ER 图（含新增字段） | 后端 |
| API 文档 | 主要端点请求/响应说明 | 后端 |
| 测试过程 | 测试策略、覆盖率、运行方式 | 测试 |
| 用户手册 | 完整用户旅程操作说明（含截图） | 前端 |
| Backlog 清单 | 25 项完成状态追踪表 | PO |

#### 4.8.3 构建与部署要求（CW2 评分项 15/85—代码质量）

| 要求 | 说明 |
|------|------|
| 一键构建 | `npm run build` 可编译全部 |
| 一键启动 | `docker compose up --build` 可启动全栈 |
| 自动化测试 | GitHub Actions 每次 push 自动运行 lint + 单元测试 |
| E2E 流水线 | E2E 作为独立 workflow 手动触发 |
| 环境验证 | 演示前在干净 CI 环境通过全部测试 |

---

## 5. 技术规格

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

所有列表接口统一支持以下参数：

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

**工具函数：**
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

**后端代码：**
```typescript
@Get('estimate-price')
async estimatePrice(
  @Query('hireType') hireType: HireType,
  @CurrentUser() user: JwtPayload,
) {
  const baseCost = this.bookingService.calculateCost(hireType);
  const discountResult = await this.discountService.calculateDiscountedPrice(
    user.sub, baseCost, hireType,
  );
  return { baseCost, ...discountResult, hireType, durationHours: this.getDurationHours(hireType) };
}
```

#### 5.2.3 `POST /bookings/:id/start-ride` — 开始骑行

```
POST /bookings/:id/start-ride
Authorization: Bearer <token>
```

**逻辑：**
1. 验证 Booking 存在且状态为 CONFIRMED
2. 验证用户身份
3. 原子更新：actualStartTime、pickupStationId、status → IN_PROGRESS

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

**逻辑：**
1. 验证 Booking 状态为 IN_PROGRESS 或 EXTENDED
2. 验证用户身份和还车站点存在
3. 原子更新：actualEndTime、returnStationId、status → COMPLETED；Scooter → AVAILABLE
4. 若车辆损坏则自动创建 HIGH 优先级反馈

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

#### 5.2.5 支付流程（原子事务 + 幂等性）

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
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check() {
    const start = Date.now();
    let dbStatus: 'ok' | 'error' = 'error';
    try { await this.prisma.$queryRaw`SELECT 1`; dbStatus = 'ok'; } catch {}

    return {
      status: dbStatus === 'ok' ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: Math.round(process.uptime()),
      memory: {
        heapUsedMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        heapTotalMB: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      },
      checks: { database: { status: dbStatus, latencyMs: Date.now() - start } },
    };
  }
}
```

#### 5.2.7 速率限制配置

```typescript
// AppModule
ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
```

敏感端点更严格：
```typescript
@Throttle({ default: { limit: 5, ttl: 60000 } })
@Post()
async createPayment() { ... }
```

---

### 5.3 前端架构变更

#### 5.3.1 路由表调整

| 路由 | Sprint 3 | Sprint 4 |
|------|----------|----------|
| `/map` | MapPage | 内嵌 BookingModal，消除全页跳转 |
| `/scooters` | 卡片列表 | 增加分页 |
| `/bookings` | MyBookingsPage | 增加 IN_PROGRESS 渲染 + 计时器 |
| `/bookings/:id` | — | BookingDetailPage（新增） |

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
export interface PriceEstimateResponse {
  baseCost: number; discountAmount: number; discountRate: number
  discountedPrice: number; discountReason: string
  hireType: HireType; durationHours: number
}
export interface EndRideResponse {
  booking: Booking; scooter: Scooter; damageReportCreated: boolean
}
```

#### 5.3.5 Booking 状态机——按钮映射

```typescript
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

- [ ] **完整借还闭环**：用户可完成查看站点→选车→看价格→预订→支付→取车→骑行→还车
- [ ] **价格透明**：预订前始终可见费用估算
- [ ] **支付非 alert**：PaymentModal 替换所有 alert()
- [ ] **零 P0 缺陷**：支付原子性、分页、密钥安全、健康检查全部修复
- [ ] **全部分页**：所有列表接口返回分页结构
- [ ] **E2E 通过**：完整借还流程自动化测试
- [ ] **单元测试**：BookingModal、PaymentModal、StartRideModal、EndRideModal

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
| 费用估算 API 与其他 Story 耦合 | 低 | 先实现端点，前端可 mock 数据并行开发 |
| IN_PROGRESS 新状态影响现有逻辑 | 中 | 全量搜索 BookingStatus 使用处并更新 |
| 新 Modal 组件复用不足 | 中 | 提取通用 Modal 容器，共享样式 |
| 高德地图 JS API 环境依赖 | 低 | 测试中 mock 地图组件 |
| 按实际时长计费引入边界 bug | 中 | 全面测试提前还、超时还、续租场景 |

---

## 8. 测试策略

### 8.1 后端单元测试
- `PaymentService.createPayment`：原子性 + 幂等性
- `BookingService.startRide/endRide`：状态校验 + Scooter 状态恢复 + 损坏报告

### 8.2 前端组件测试（Vitest + React Testing Library）
- `BookingModal`、`PaymentModal`、`StartRideModal`、`EndRideModal`、`RideTimer`

### 8.3 E2E 测试（Playwright）

```
注册 → 登录 → 地图展示站点 → 选车 → 看价格 → 预订 → 支付
→ 取车确认 → IN_PROGRESS + 计时 → 还车 → 验证 COMPLETED
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

## 10. 与 v1.0（自由流动方案）的差异

v1.0 在无硬件约束下尝试模拟自由流动体验，v2.0 回归 Station 模式是基于「系统状态必须可验证」原则的主动收敛。设计演进对比如下：

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

## 11. 交付保障与演示准备

### 11.1 时间线

| 阶段 | 时间 | 活动 |
|------|------|------|
| 功能开发 | Week 1–3 | Epic 1–4 硬基线；Epic 5–7 扩展目标 |
| 代码冻结 | Week 4 Day 1–3 | 仅 bugfix + 文档 + 测试 |
| 演示彩排 | Week 4 Day 4–5 | 全流程走查 + 环境验证 |

### 11.2 演示检查清单

- [ ] 完整借还闭环可流畅演示
- [ ] 预订前可见费用估算
- [ ] 支付使用 PaymentModal
- [ ] 无 P0 缺陷
- [ ] 全部 API 支持分页
- [ ] Wiki 文档完整（见 4.8.2）
- [ ] CI 流水线通过
- [ ] 干净环境可构建运行

### 11.3 非功能需求

| Backlog ID | 需求 | Sprint 4 措施 |
|------------|------|-------------|
| 23 | 多客户端并发 | 限流 + 数据库索引 |
| 24 | 响应式 UI | 新增 Modal 使用响应式布局 |
| 25 | 无障碍访问 | Modal 支持键盘操作、文本对比度 ≥ 4.5:1 |

---

## 12. 实施进度 (Implementation Progress)

### 12.1 完成状态概览

| Epic | 名称 | Stories | 状态 | 完成日期 |
|------|------|---------|------|---------|
| Epic 1 | 核心缺陷修复 (P0) | S4-001–007 | ✅ 完成 | 2026-04-30 |
| Epic 2 | 预订体验升级 (P1) | S4-008–012 | ✅ 完成 | 2026-04-30 |
| Epic 3 | 支付闭环 (P1) | S4-013–016 | ✅ 完成 | 2026-04-30 |
| Epic 4 | 骑行生命周期 (P1) | S4-017–022 | ✅ 完成 | 2026-04-30 |
| Epic 5 | 还车选站与站点感知 (P2) | S4-023–026 | ✅ 完成 | 2026-04-30 |
| Epic 6 | 可观测性与运维 (P2) | S4-027–030 | ✅ 完成 | 2026-04-30 |
| Epic 7 | 前端体验完善 (P2) | S4-031–035 | ⚠️ 部分完成 | 2026-04-30 |

### 12.2 详细 Story 完成清单

#### Epic 1: 核心缺陷修复
- [x] **S4-001**: 支付原子事务 — `$transaction` 包裹 payment.create + booking.update + scooter.update
- [x] **S4-002**: 幂等性 Key — Payment 表添加 `idempotencyKey` 唯一字段，重复请求返回已有结果
- [x] **S4-003**: 移除硬编码密钥 — JWT_SECRET 和 ENCRYPTION_KEY 改启动时抛错
- [x] **S4-004**: 健康检查端点 — DB 连通性 + 进程运行时间 + 内存使用
- [x] **S4-005**: 全局限流 — `@nestjs/throttler` 全局 100 req/60s，支付 5 req/60s
- [x] **S4-006**: 列表分页 — 所有列表接口支持 page/limit 参数，前端适配
- [x] **S4-007**: 数据库索引 — Booking/Scooter/Payment 表添加关键复合索引

#### Epic 2: 预订体验升级
- [x] **S4-008**: 费用估算端点 — `GET /bookings/estimate-price`
- [x] **S4-009**: 预订弹窗费用展示 — PriceEstimate 组件实时显示费用明细
- [x] **S4-010**: 预订弹窗站点信息 — 显示取车站点名称、地址
- [x] **S4-011**: 预订成功取车指引 — BookingModal 成功后的导航
- [x] **S4-012**: 消除全页跳转 — MapPage 内直接打开 BookingModal

#### Epic 3: 支付闭环
- [x] **S4-013**: PaymentModal 组件 — 订单摘要 + 支付确认，替换 alert()
- [x] **S4-014**: 支付成功/失败处理 — CONFIRMED 状态更新 + 错误重试
- [x] **S4-016**: 支付历史展示 — BookingCard 费用显示

#### Epic 4: 骑行生命周期
- [x] **S4-017**: 开始骑行端点 — `POST /bookings/:id/start-ride`
- [x] **S4-018**: 结束骑行端点 — `POST /bookings/:id/end-ride`（含还车站点 + 损坏报告）
- [x] **S4-019**: StartRideModal — 取车确认弹窗
- [x] **S4-020**: EndRideModal — 还车确认弹窗（含站点选择 + 损坏勾选）
- [x] **S4-021**: RideTimer — 实时骑行计时器
- [x] **S4-022**: 状态机完善 — IN_PROGRESS 状态 + 完整流转

#### Epic 5: 站点感知
- [x] **S4-023**: EndRideModal 展示附近站点列表
- [x] **S4-024**: BookingCard 显示取车/还车站点
- [x] **S4-025**: 地图标记着色 — 绿(≥3辆)/橙(1-2)/红(0)

#### Epic 6: 可观测性
- [x] **S4-027**: Request ID 中间件
- [x] **S4-028**: 结构化 JSON 日志
- [x] **S4-029**: Amap 熔断器
- [x] **S4-030**: Docker 化（Dockerfile × 2 + docker-compose）

#### Epic 7: 前端体验
- [x] **S4-031**: 地图"回到我的位置"按钮
- [x] **S4-032**: 地图加载骨架屏
- [x] **S4-033**: 成功动画组件
- [ ] **S4-034**: E2E 完整借还流程 — 待补充
- [ ] **S4-035**: 前端单元测试 — 待补充

### 12.3 关键文件变更

| 文件 | 变更类型 | 说明 |
|------|---------|------|
| `backend/prisma/schema.prisma` | 修改 | IN_PROGRESS, pickupStationId, returnStationId, actualStartTime, actualEndTime, isActive, idempotencyKey |
| `backend/src/modules/payment/payment.service.ts` | 重写 | 原子事务 + 幂等性检查 |
| `backend/src/modules/health/health.controller.ts` | 重写 | 完整健康检查实现 |
| `backend/src/modules/auth/auth.module.ts` | 修复 | 移除硬编码 JWT 回退值 |
| `backend/src/modules/booking/booking.service.ts` | 扩展 | 添加 estimatePrice, startRide, endRide, 分页 |
| `backend/src/shared/pagination.ts` | 新增 | 分页工具函数 |
| `frontend/src/types/index.ts` | 扩展 | IN_PROGRESS, PriceEstimateResponse, EndRideResponse |
| `frontend/src/components/booking/` | 新增 | PaymentModal, StartRideModal, EndRideModal, RideTimer, PriceEstimate |
| `frontend/src/components/BookingCard.tsx` | 重写 | IN_PROGRESS 状态, 骑行操作, 站点显示 |
| `frontend/src/pages/MyBookingsPage.tsx` | 重写 | 完整生命周期集成 + 分页 |
| `frontend/src/pages/MapPage.tsx` | 重写 | 内嵌 BookingModal, 骨架屏, 标记着色 |

### 12.4 已知待办

1. **E2E 测试** (S4-034): 需要 Playwright 脚本覆盖完整借还流程
2. **单元测试** (S4-035): BookingModal/PaymentModal/StartRideModal/EndRideModal 组件测试
3. **DB Migration**: 需要在运行环境中执行 `prisma migrate deploy` 应用 schema 变更
4. **PaymentCard 模拟**: PaymentModal 目前展示订单摘要，可扩展为选择已保存卡片

---

*文档结束*
