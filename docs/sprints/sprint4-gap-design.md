# Sprint 4 补充：缺口修复与商业优化设计

> ✅ **所有任务已完成** — 详见 [Sprint 4 完成报告](./Sprint4_FINAL_COMPLETION_REPORT.md)
> 基于 [Backlog 审计报告](./project-backlog.md) 发现 5 个实现缺口 + 过度设计清理。

---

## 0. 架构决策

### 0.1 管理员功能收敛：Dashboard 模式

当前管理员导航有 5 项分散的入口（管理后台、价格配置、收入统计、反馈管理、高优先级），加上本次新增的代客预约、用户管理将达 7 项，导航栏无法承载。

**方案**：所有管理功能收敛到单一 `/admin` 仪表盘页面。导航栏只保留一个"管理"入口。

```
/admin 管理后台 (卡片式仪表盘)
┌─────────────────────────────────────────────┐
│  🛴 车队管理    │  💰 价格配置    │  📈 收入统计  │
│  管理车辆/站点   │  单价 + 折扣    │  周报/日/图表  │
├─────────────────────────────────────────────┤
│  📋 反馈管理    │  ⚠️ 高优先级    │  👤 用户管理   │
│  查看/处理反馈  │  紧急问题看板   │  用户类型/折扣  │
├─────────────────────────────────────────────┤
│  🛎️ 代客预约                                │
│  为未注册用户创建预约                         │
└─────────────────────────────────────────────┘
```

**实现任务**：
- [ ] 新建 `frontend/src/pages/AdminDashboardPage.tsx` — 卡片网格仪表盘，每张卡片包含标题、描述、入口按钮
- [ ] 路由：`/admin` → AdminDashboardPage（需 MANAGER 角色）
- [ ] 路由：原 `/admin/pricing`、`/statistics` 等保留为直接访问入口（不删除，仅导航栏不展示）
- [ ] Navbar 中将"管理"下拉替换为单一 `<Link to="/admin">管理后台</Link>`

### 0.2 删除骑行套餐页

`RidePackagesPage.tsx` 不在任何 backlog 范围内，所有按钮均为死按钮，订阅制模型与系统实际按次计费模型矛盾。FAQ 中的退款/续费承诺无法兑现。

**清理任务**：
- [ ] 删除 `frontend/src/pages/RidePackagesPage.tsx`
- [ ] 删除路由 `<Route path="/ride-packages" ...>`
- [ ] 删除 Navbar 中 `{ name: '骑行套餐', href: '/ride-packages' }`
- [ ] 删除 MobileBottomNav 中对应条目

### 0.3 推广内容原则：真实优先

所有推广文案必须对应真实存在的功能。不做假广告、不编造不存在的套餐。

| 真实功能 | 推广文案示例 |
|----------|-------------|
| 学生 8 折 | "认证学生身份 · 享 8 折优惠" |
| 老人 7 折 | "老年用户专享 7 折" |
| 高频用户最高 7.5 折 | "本月已省 ¥XX"（动态计算）|
| 价格配置 | 原价划线展示（如果折扣生效） |

**实现任务**：
- [ ] SplashScreen 移除月卡/次卡等不存在的产品推广
- [ ] 改为展示真实折扣信息 + 邀请好友（可做但后续再做）

---

## 1. ID 2/3 — 银行卡管理 UI

### 功能需求

- 用户可查看已保存的银行卡列表（仅显示发卡行 + 后四位）
- 用户可添加新卡（卡号、过期日、持卡人姓名）
- 用户可删除已保存的卡
- 卡号前端做 Luhn 预校验，减少无效请求
- 安全性：完整卡号仅后端加密存储，前端永不展示

### 验收标准

- [ ] 已登录用户在"我的"区域可看到"支付方式"入口
- [ ] 银行卡列表展示后四位 + 过期日 + 发卡行图标
- [ ] 添加卡表单含卡号、过期月/年、持卡人姓名
- [ ] 卡号输入框只允许数字，自动按 4 位分组显示
- [ ] Luhn 校验失败时前端即时报错，不发送请求
- [ ] 删除卡前弹出确认对话框
- [ ] 支付时可选择已保存的卡

### 技术规格

**后端 API**（已实现，无需改动）：
| 端点 | 说明 |
|------|------|
| `POST /bookings/payment-card` | 保存新卡（加密存储） |
| `GET /bookings/payment-card` | 获取已保存卡（仅后四位） |
| `DELETE /bookings/payment-card` | 删除卡 |

**新建文件**：
```
frontend/src/
├── pages/PaymentMethodsPage.tsx    # 支付方式管理页
├── components/payment/
│   ├── CardList.tsx                # 卡片列表
│   ├── AddCardModal.tsx            # 添加卡弹窗
│   └── CardItem.tsx                # 单张卡展示
└── api/paymentCards.ts             # API 封装
```

**API 封装** (`api/paymentCards.ts`)：
```typescript
export const paymentCardApi = {
  getCards: () => axiosClient.get<ApiResponse<PaymentCard>>('/bookings/payment-card'),
  addCard: (data: AddCardDto) => axiosClient.post('/bookings/payment-card', data),
  deleteCard: () => axiosClient.delete('/bookings/payment-card'),
}
```

**Luhn 校验工具** (`utils/luhn.ts`)：
```typescript
export function luhnCheck(cardNumber: string): boolean {
  // 标准 Luhn 算法实现
}
```

**路由注册**：`/payment-methods` → PaymentMethodsPage（需登录）

**导航入口**：MyBookingsPage 或用户下拉菜单增加"支付方式"链接

---

## 2. ID 7 — 邮件确认（前端感知）

### 功能需求

后端 EmailService 已在 booking 创建/支付成功/续租/还车时自动发送确认邮件。前端无需额外触发，但需告知用户"邮件已发送"。

### 验收标准

- [ ] 支付成功后 PaymentModal 文案包含"确认邮件已发送至 xxx@xxx"
- [ ] 预订成功后 BookingModal 文案包含相同提示
- [ ] BookingCard 状态为 CONFIRMED 时展示邮件发送图标

### 技术规格

**修改文件**：
| 文件 | 改动 |
|------|------|
| `PaymentModal.tsx` | 成功状态增加邮件提示行 |
| `BookingModal.tsx` | 成功回调增加邮件提示行 |
| `BookingCard.tsx` | CONFIRMED 状态增加 📧 图标 + tooltip |

**无需新建文件、无需新 API 调用。**

---

## 3. ID 9 — 员工代客预约

### 功能需求

管理员（MANAGER）可为未注册的游客创建预约。输入游客姓名、邮箱、选择车辆和租赁类型。若游客邮箱未注册则自动创建临时账号，已注册则关联到已有账号。

### 验收标准

- [ ] 管理员可在 AdminDashboard 或专用页面发起代客预约
- [ ] 表单：游客邮箱（必填）、游客姓名（必填）、选择车辆（下拉搜索）、租赁类型、开始时间
- [ ] 选择车辆时可搜索/过滤
- [ ] 提交后显示预约成功（含预订编号和取车指引）
- [ ] 若邮箱已有账号 → 关联到该账号
- [ ] 若邮箱未注册 → 自动创建临时账号并告知初始密码（或发送邮件）

### 技术规格

**后端 API**（已实现，无需改动）：
| 端点 | 说明 |
|------|------|
| `POST /employee-bookings` | 员工为游客创建预约 |
| `POST /bookings/staff-booking` | 创建预约（若用户不存在则自动创建） |
| `GET /employee-bookings` | 查看员工创建的预约列表 |

**建议使用 `POST /employee-bookings`**（更清晰的语义）。

**新建文件**：
```
frontend/src/
├── pages/StaffBookingPage.tsx         # 代客预约页
├── components/admin/
│   └── GuestBookingForm.tsx           # 游客预约表单
└── api/employeeBookings.ts            # API 封装
```

**API 封装**：
```typescript
export const employeeBookingApi = {
  createForGuest: (data: {
    guestEmail: string
    guestName: string
    scooterId: string
    hireType: HireType
    startTime: string
  }) => axiosClient.post('/employee-bookings', data),

  getMyEmployeeBookings: (params?: PaginationParams) =>
    axiosClient.get('/employee-bookings', { params }),
}
```

**车辆搜索**：复用已有 `GET /scooters?status=AVAILABLE` 接口 + 下拉搜索组件。

**路由**：`/admin/staff-booking` → StaffBookingPage（需 MANAGER）

**无障碍**：表单使用 `<label>` 关联、必填字段标记 `aria-required`、错误信息 `role="alert"`。

---

## 4. ID 21 — 图表可视化

### 功能需求

收入统计页面使用专业图表库替代当前 CSS div bar 占位。

### 验收标准

- [ ] 柱状图：每日收入对比（可切换按周/按月）
- [ ] 折线图：收入趋势
- [ ] 饼图：各租赁类型收入占比
- [ ] 图表响应式，移动端自适应
- [ ] 图表支持深色主题配色

### 技术规格

**依赖安装**：
```bash
cd frontend && npm install recharts
```

**后端 API**（已实现，无需改动）：
`GET /statistics/revenue/chart?period=week|month|year&type=bar|line|pie`

**修改文件**：
| 文件 | 改动 |
|------|------|
| `RevenueStatisticsPage.tsx` | Chart tab 用 Recharts 替换 CSS bar |

**实现要点**：
- `BarChart` / `LineChart` / `PieChart` 均从 recharts 导入
- 配色使用 CSS 变量：`var(--mclaren-orange)` 通过内联样式传入
- `ResponsiveContainer` 包裹实现自适应宽度
- Tooltip 自定义样式匹配深色主题
- 数据从 `statisticsApi.getRevenueChartData()` 获取，后端已返回 `{ labels, datasets }` 结构

**不新建文件**，仅重构现有组件的一个 tab。

---

## 5. ID 22 — 用户折扣管理

### 功能需求

管理员可查看用户列表、设置用户类型（普通/学生/老人/高频），调节各类型的折扣力度。用户类型决定该用户在预订时自动享受的折扣比例。

### 验收标准

#### 5a. 用户类型管理

- [ ] 用户列表页展示所有用户（邮箱、角色、用户类型、注册时间）
- [ ] 每行用户有下拉菜单可切换类型：普通 / 学生 / 老人 / 高频
- [ ] 切换后即时生效，下次预订自动使用新折扣
- [ ] 支持搜索用户（按邮箱）

#### 5b. 折扣力度配置

- [ ] 在 AdminPricingPage 增加"折扣配置"区域
- [ ] 展示每种用户类型的当前折扣率
- [ ] 管理员可编辑各类型折扣率（0~100%）
- [ ] 折扣率变更即时生效

### 技术规格

**后端 API**（已实现，无需改动）：
| 端点 | 说明 |
|------|------|
| `GET /users` | 用户列表（支持分页 + 搜索）|
| `PUT /users/:id/user-type` | 更新用户类型 |
| `GET /users/:id/discount-info` | 查看用户折扣信息 |

**折扣率调节**：当前折扣率硬编码在 `DiscountService`。需要改为从数据库/PricingConfigService 读取。

**后端改动**（新增）：
- [ ] `DiscountService` 增加 `getDiscountRates()` 和 `updateDiscountRate(userType, rate)` 方法
- [ ] 新增折扣率存储（可复用 PricingConfigService 的内存存储模式或新建 Prisma 模型）
- [ ] 新增 `GET /config/discounts` 和 `PUT /config/discounts/:userType` 端点
- [ ] 添加单元测试覆盖新端点

**新建文件**：
```
frontend/src/
├── pages/UserManagementPage.tsx     # 用户管理页
├── components/admin/
│   ├── UserTable.tsx                # 用户表格 + 类型切换
│   └── UserTypeDropdown.tsx         # 类型下拉组件
└── api/users.ts                     # 用户管理 API
```

**修改文件**：
| 文件 | 改动 |
|------|------|
| `AdminPricingPage.tsx` | 增加"折扣配置"section |
| `api/price.ts` | 增加 `getDiscounts` / `updateDiscount` 方法 |

**折扣配置默认值**（与 backlog 一致）：
| 用户类型 | 默认折扣率 | 标签 |
|----------|-----------|------|
| STUDENT | 20% | 学生折扣 |
| SENIOR | 30% | 老年人折扣 |
| FREQUENT_50H | 25% | 高频用户（50h+/月）|
| FREQUENT_20H | 15% | 活跃用户（20h+/月）|

---

## 6. 商业气息强化（真实文案）

### 6.1 价格展示增强

| 组件 | 改动 |
|------|------|
| `ScooterCard.tsx` | 价格旁展示折扣后价格（若用户有折扣身份） |
| `PriceEstimate.tsx` | 原价划线 + 折扣后价格 + 折扣标签 |
| `BookingModal.tsx` | 费用明细中突出折扣节省金额 |

### 6.2 SplashScreen 内容修正

| 当前 | 改为 |
|------|------|
| "夏日骑行·低至 ¥5/次" | 保留（真实：HOUR_1 = ¥5）|
| "月卡畅骑·¥199/月" | **删除**（不存在）|
| "学生专属·认证享 8 折" | 保留（真实：STUDENT 20% off）|

### 6.3 用户节省角标

在 BookingCard 或 ScooterCard 中，若用户有 active booking 且享受了折扣，展示"已省 ¥XX"角标（数据来自 `PriceEstimateResponse.discountAmount`）。

---

## 7. 文件变更清单

### 新建文件
```
frontend/src/
├── pages/
│   ├── AdminDashboardPage.tsx        # 管理仪表盘（卡片网格）
│   ├── StaffBookingPage.tsx          # 代客预约
│   ├── PaymentMethodsPage.tsx        # 支付方式管理
│   └── UserManagementPage.tsx        # 用户管理
├── components/
│   ├── admin/
│   │   ├── DashboardCard.tsx         # 仪表盘卡片
│   │   ├── GuestBookingForm.tsx      # 游客预约表单
│   │   ├── UserTable.tsx             # 用户表格
│   │   └── UserTypeDropdown.tsx      # 用户类型下拉
│   └── payment/
│       ├── CardList.tsx              # 银行卡列表
│       ├── AddCardModal.tsx          # 添加卡弹窗
│       └── CardItem.tsx              # 单张卡展示
├── api/
│   ├── paymentCards.ts              # 银行卡 API
│   ├── employeeBookings.ts          # 代客预约 API
│   └── users.ts                     # 用户管理 API
└── utils/
    └── luhn.ts                       # Luhn 校验工具

backend/src/
└── modules/config/
    └── discount-config.controller.ts # 折扣率配置端点（新增）
```

### 修改文件
```
frontend/src/
├── components/
│   ├── Navbar.tsx                    # 管理入口改为单一链接；删骑行套餐
│   ├── MobileBottomNav.tsx           # 删骑行套餐
│   ├── BookingModal.tsx              # 邮件提示 + 价格增强
│   ├── PaymentModal.tsx              # 邮件提示 + 选卡集成
│   ├── BookingCard.tsx               # 邮件图标 + 折扣角标
│   ├── PriceEstimate.tsx             # 原价划线展示
│   ├── SplashScreen.tsx              # 删月卡推广
│   └── ScooterCard.tsx               # 价格增强
├── pages/
│   ├── AdminPricingPage.tsx          # 增加折扣配置区
│   └── RevenueStatisticsPage.tsx     # Recharts 替换 CSS bar
├── api/
│   └── price.ts                      # 增加 getDiscounts/updateDiscount
└── router/
    └── AppRouter.tsx                 # 新增路由 + 删骑行套餐路由
```

### 删除文件
```
frontend/src/pages/RidePackagesPage.tsx   # 不在 backlog 范围内
```

---

## 8. 工时估算

| 模块 | 任务数 | 预估工时 |
|------|--------|---------|
| Admin Dashboard | 3 项 | 3h |
| ID 2/3 — 银行卡管理 | 4 文件 | 5h |
| ID 7 — 邮件提示 | 3 文件改动 | 1h |
| ID 9 — 代客预约 | 3 文件 | 4h |
| ID 21 — Recharts 图表 | 1 文件改动 | 2h |
| ID 22a — 用户类型管理 | 4 文件 | 4h |
| ID 22b — 折扣率配置 | 后端 + 前端 | 3h |
| 商业气息强化 | 5 文件改动 | 2h |
| 骑行套餐删除 | 3 文件改动 | 0.5h |
| 后端折扣 API | 1 新端点 | 2h |
| **总计** | | **26.5h** |

---

## 9. Git 工作流提醒

### 分支策略
```bash
# 从 main 创建 feature 分支
git checkout main && git pull
git checkout -b feature/sprint4-gap-fix

# 每个模块独立 commit，方便 review
git add <files> && git commit -m "feat: <模块描述>"
```

### CI 检查
```bash
# 推送前检查 CI 状态
gh pr view --web          # 查看 PR 页面
gh pr checks              # 检查 CI 运行状态
gh run list --branch feature/sprint4-gap-fix  # 查看 workflow 运行

# 本地预检
cd backend && npm run test && npm run lint
cd frontend && npx tsc --noEmit && npx vitest run
```

### PR 提交
```bash
git push -u origin feature/sprint4-gap-fix
gh pr create --title "feat: sprint4 缺口修复 + 商业优化" \
  --body "## Summary
- Admin Dashboard 收敛管理入口
- ID 2/3 银行卡管理 UI
- ID 7 邮件确认前端提示
- ID 9 代客预约页面
- ID 21 Recharts 图表替换
- ID 22 用户类型管理 + 折扣率配置
- 删除骑行套餐页（过度设计）
- 商业气息强化（真实文案）

## Test plan
- [ ] 后端单元测试通过
- [ ] 前端 TypeScript 编译通过
- [ ] 手动测试管理仪表盘导航
- [ ] 手动测试银行卡添加/删除
- [ ] 手动测试代客预约流程
- [ ] 手动测试图表渲染"
```

### 注意事项
- **不要** `git add -A` 或 `git add .`，按模块分批提交
- **不要** `--no-verify`，pre-commit hook 必须通过
- **不要** force push 到 main
- 合并前确认 backend CI（lint + test）和 frontend build 均通过

---

## 10. 用户 FAQ 页面

### 功能需求

为普通用户提供常见问题解答页面，降低客服压力，提升用户自助能力。纯静态内容，仅涉及可正常工作的已有功能。

### 验收标准

- [ ] FAQ 页面使用折叠面板（accordion / `<details>`）展示问答
- [ ] 所有答案对应真实存在的功能，不承诺不存在的特性
- [ ] 页脚增加"常见问题"链接
- [ ] 页面响应式，移动端友好

### FAQ 内容清单

| 分类 | 问题 | 答案要点 |
|------|------|---------|
| 预约 | 如何预约电动车？ | 发现车辆 → 选车 → 选租赁类型/时间 → 确认支付 |
| 预约 | 如何取消预约？ | 我的预约 → 找到订单 → 取消预约（仅 PENDING_PAYMENT / CONFIRMED 可取消） |
| 价格 | 租赁费用是多少？ | 1小时 ¥5 / 4小时 ¥15 / 1天 ¥30 / 1周 ¥90（以实际价格配置为准） |
| 价格 | 有哪些折扣？ | 学生 8 折、老人 7 折、高频用户最高 7.5 折。需联系管理员认证身份 |
| 骑行 | 如何取车？ | 支付后前往取车站点 → 确认车辆完好 → 点击"开始骑行" |
| 骑行 | 如何还车？ | 骑行中点击"结束骑行" → 选择还车站点 → 确认车辆完好 → 还车完成 |
| 骑行 | 可以续租吗？ | 骑行中可续租（1-24 小时），按 ¥5/小时 计费 |
| 反馈 | 如何报告车辆故障？ | 提交反馈 → 选择"故障"或"损坏"类别 → 描述问题 → 提交 |
| 账户 | 如何修改密码？ | 当前版本未开放自助修改，请联系管理员（如实说明） |
| 其他 | 可以一次租多辆车吗？ | 当前每次限租一辆 |

### 技术规格

**新建文件**：
```
frontend/src/pages/FAQPage.tsx   # FAQ 页面（静态内容 + <details> 折叠面板）
```

**修改文件**：
| 文件 | 改动 |
|------|------|
| `Footer.tsx` | 增加"常见问题"链接 → `/faq` |
| `AppRouter.tsx` | 新增 `<Route path="/faq" element={<FAQPage />} />` |

**实现要点**：
- 使用 HTML 原生 `<details><summary>` 实现折叠，无需 JS 状态管理
- 样式参考 `RidePackagesPage` 中的 FAQ 区域（可直接复用其 CSS）
- 分类标题用 `h2`，问题用 `summary` 加粗
- 页面使用 `PageLayout` 包裹以保持一致性
- 无需后端 API、无需登录即可访问

### 工时

| 任务 | 预估 |
|------|------|
| 撰写 FAQ 内容 | 0.5h |
| 创建 FAQPage.tsx | 1h |
| 路由 + 页脚链接 | 0.5h |
| **合计** | **2h** |
