# Sprint 3 计划：损坏反馈与业务收尾

## 概述
Sprint 3 重点补齐项目中缺失的故障/损坏反馈闭环，并将业务模型聚焦到当前代码库已有的远程预约 + 站点取还模式。该计划根据团队讨论进行了简化：
- 新增独立的 `Feedback` / `Damage Report` 模块
- 管理后台优先级与状态流转（包含损坏类型标记）
- 保险确认（简化实现）
- 取消电量差计费功能
- 项目现有 Station + Booking 架构的落地应用

## 1. 与当前项目契合度分析

### 现有优势
- `Station` 模块和地图展示已完成，适合固定站点取还。
- `Booking` 模块已支持在线预订、续租和状态管理，能直接扩展为取车/还车检查流程。
- 后端已采用 NestJS + Prisma，便于新增 `Feedback` 实体与角色权限。

### 需要补齐的关键点
- 目前项目中缺少明确的“故障/损坏反馈”功能。
- 目前代码库没有 `Feedback` 相关模型或 API。
- 当前文档中也未列出“还车损坏处理”闭环。

## 2. 推荐业务模型

### 选择：Walk-in and Rent - Remote Booking + In-store Pickup/Return

理由：
1. 与已完成的 `Station` + `booking` 模块最契合。
2. 避免 Sharing 模式对硬件和 GPS 实时追踪的高开发成本。
3. 满足老师要求的“实名认证/信用卡绑定 + 店员协助”场景。

## 3. Sprint 3 技术规格建议

### ID 13: Submit Feedback (Fault/Damage Report)

**业务逻辑**
- 用户可以在任何时候提交车辆故障/损坏报告（骑行中、还车后或独立提交）。
- 系统自动关联当前订单与车辆（如果提供 bookingId）。
- 支持图片 URL 输入（简化实现，不上传文件）。
- `DAMAGE` 类别自动设置为 `HIGH` 优先级。

**验收标准**
- 表单包含：title、description、category、关联车辆、关联订单（可选）、imageUrl（可选）。
- 提交后生成唯一 `ticketId`，用户可在"我的反馈"查看。
- DAMAGE 报告默认 `HIGH` 优先级。
- 前端界面语言统一为英文。

**建议 API**
```typescript
POST /api/feedbacks
{
  "title": string,
  "description": string,
  "category": "FAULT" | "DAMAGE" | "SUGGESTION",
  "scooterId": string,
  "bookingId"?: string,
  "imageUrl"?: string,
  "priority"?: "LOW" | "MEDIUM" | "HIGH"
}
```

**建议 Prisma 模型**
```prisma
enum FeedbackCategory {
  FAULT
  DAMAGE
  SUGGESTION
}

enum FeedbackPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum FeedbackStatus {
  PENDING
  RESOLVED
  ESCALATED
  CHARGEABLE
}

enum DamageType {
  NATURAL
  INTENTIONAL
}

model Feedback {
  id             String           @id @default(uuid())
  title          String
  description    String
  category       FeedbackCategory
  priority       FeedbackPriority @default(LOW)
  status         FeedbackStatus   @default(PENDING)
  scooterId      String
  bookingId      String?          
  imageUrl       String?
  managerNotes   String?
  resolutionCost Float?           
  damageType     DamageType?      // 新增：损坏类型（自然损坏或故意损坏）
  createdById    String
  createdAt      DateTime         @default(now())
  updatedAt      DateTime         @updatedAt
  scooter        Scooter          @relation(fields: [scooterId], references: [id])
  booking        Booking?         @relation(fields: [bookingId], references: [id])
  createdBy      User             @relation(fields: [createdById], references: [id])
}
```

---

### ID 14: Prioritize Feedback (Manager Only)

**业务逻辑**
- 仅 `MANAGER` 可修改优先级和反馈状态。
- 管理员在管理后台可以标记损坏类型为"自然损坏"或"故意损坏"。
- 如果是"自然损坏"，不收取赔偿；如果是"故意损坏"，标记为 `CHARGEABLE` 并设置赔偿金额。
- 记录操作人和时间戳。

**验收标准**
- `PATCH` 仅允许 `Role.MANAGER`。
- 状态流转：`PENDING → RESOLVED/ESCALATED → CLOSED`。
- 操作记录 `updatedBy` 与 `updatedAt`。
- 管理 Dashboard 显示待处理数量 Badge。
- 管理员可以在车辆管理页面（Admin Fleet）点击标记损坏类型。

**建议 API**
```typescript
PATCH /api/feedbacks/:id
{
  "priority"?: "LOW" | "MEDIUM" | "HIGH" | "URGENT",
  "status"?: "PENDING" | "RESOLVED" | "ESCALATED" | "CHARGEABLE",
  "managerNotes"?: string,
  "resolutionCost"?: number,
  "damageType"?: "NATURAL" | "INTENTIONAL"  // 新增字段：自然损坏或故意损坏
}
```

---

### ID 15: View High Priority Issues

**业务逻辑**
- Admin dashboard 默认展示 `HIGH` / `URGENT` 反馈。
- 支持按类别过滤，特别是 `DAMAGE`。
- 显示关联用户信息便于联系用户。

**验收标准**
- 排除已 `RESOLVED` 的反馈。
- 列表项展示：user email、scooter id、submittedAt、priority 标签。
- 支持导出 PDF/CSV。
- `DAMAGE` 报告置顶显示。

**建议 API**
```typescript
GET /api/feedbacks/high-priority
Response: {
  data: [{
    id: string,
    title: string,
    category: string,
    priority: string,
    status: string,
    createdAt: string,
    user: { email: string, name?: string },
    scooter: { id: string, location: string },
    booking?: { id: string, startTime: string },
    resolutionCost?: number
  }],
  meta: { urgentCount: number, damageCount: number }
}
```

---

## 4. 与当前代码库直接衔接的补强点

### 4.1 取还车电量差计费（已取消）

**更新**：根据团队决定，取消电量差计费功能，简化实现。

**原计划**：扩展 `Booking` 模型添加电池相关字段，现不再需要。

### 4.2 保险免责声明与用户确认

**建议**：扩展 `User` 模型：
```prisma
model User {
  ...
  insuranceAcknowledged Boolean @default(false)
  emergencyContact      String?
}
```

**验收**：注册/租赁流程增加保险确认 checkbox。

### 4.3 还车检查触发反馈

**建议流程**：
- 用户还车时必须回答“Is the scooter intact?”
- 如果选择 `No`，自动创建 `Feedback` 报告，附带当前 `bookingId`、`scooterId`、`returnStationId`。

### 4.4 管理员视图优先级展示

**建议**：Admin dashboard 侧重 `category=DAMAGE`，且 `resolutionCost` 字段用于财务追踪。

## 5. 前端/展示建议

### 5.1 统一语言
- 建议统一使用英文界面。当前项目代码与文档多为英语，保持一致更利于评审和后续开发。
- 禁止界面中中英混排。

### 5.2 图片与展示
- 在 `ScooterList`、`BookingDetail`、`FeedbackForm` 中添加真实车型图片。
- 车详情页显示真实图片 + 续航/最高速/载重参数。
- 预订前支持“Change Model”并重新计算租金。

### 5.3 PPT / Demo 说明
- 直接声明："We adopt Walk-in & Rent Model (Remote Booking + Station Pickup/Return)"。
- 展示“Damage report → Manager priority → Chargeable settlement”闭环。
- 界面截图保持纯英文。

## 6. Sprint 3 优先级建议

### 必须实现
- `Feedback` CRUD + manager priority flow（包含损坏类型标记）
- `Booking` 还车检查 + damage trigger
- `User` insurance acknowledgement

### 推荐实现
- `high-priority` admin list + export
- `Feedback` audit trail（updatedBy、timestamp）
- 真实 scooter 图片和 model details

### 可选优化
- overdue booking reminder（邮件/模拟扣费）
- `PaymentCard` 与 `chargeable` 赔偿串联

## 7. 结论

这份 Sprint 3 报告与本项目基本契合，但需要：
- 明确补齐当前不存在的 `Feedback`/`Damage` 功能；
- 采用项目现有 `Role.MANAGER`、`Booking`、`Station` 命名；
- 将业务模型定位为“远程预约 + 站点取还”，而不是共享模式；
- 将语言统一为英语。

建议将本计划文件纳入 `docs/sprints/sprint3-plan.md`，并在 `docs/project/requirements.md` 中补充“Feedback / damage handling”需求。