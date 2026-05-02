# Sprint 4 最终完成总结报告

## Sprint 4 目标与范围

### 核心目标

1. **缺口修复**: 补全 Sprint4-gap-design 中识别的 6 个实现缺口
2. **商业优化**: 价格展示增强、推广文案真实性修正
3. **管理收敛**: 管理员功能统一入口（Dashboard 模式）
4. **多客户端并发**: 乐观锁 + SSE 实时推送
5. **Backlog 全覆盖**: 25/25 条目 100% 完成

---

## 实现清单

### 模块 A：管理仪表盘 + 导航重构

| 文件 | 说明 |
|------|------|
| `frontend/src/pages/AdminDashboardPage.tsx` | 卡片式管理仪表盘（7 张卡片入口）|
| `frontend/src/router/AppRouter.tsx` | `/admin` → Dashboard；新增 6 条子路由 |
| `frontend/src/components/Navbar.tsx` | 管理员入口收敛为单一"管理"链接 |
| `frontend/src/components/MobileBottomNav.tsx` | 移除骑行套餐，保留管理入口 |
| `frontend/src/components/PageLayout.tsx` | 统一页面布局容器 |
| `frontend/src/components/Footer.tsx` | 页脚含 FAQ 入口 |

### 模块 B：银行卡管理 (Backlog ID 2/3)

| 文件 | 说明 |
|------|------|
| `frontend/src/pages/PaymentMethodsPage.tsx` | 支付方式管理页面 |
| `frontend/src/components/payment/AddCardModal.tsx` | 添加卡弹窗（Luhn 预校验）|
| `frontend/src/components/payment/CardList.tsx` | 卡列表（含空状态/加载态/错误态）|
| `frontend/src/components/payment/CardItem.tsx` | 单张卡展示（品牌图标 + 后四位）|
| `frontend/src/api/paymentCards.ts` | 银行卡 API 封装 |
| `frontend/src/utils/luhn.ts` | Luhn 算法 + 卡品牌检测 |
| `backend/prisma/schema.prisma` | PaymentCard 新增 `encryptedCardNumber` 字段 |
| `backend/src/modules/booking/payment-card.service.ts` | AES-256-CBC 加密存储完整卡号 |

### 模块 C：邮件确认前端感知 (Backlog ID 7)

| 文件 | 改动 |
|------|------|
| `BookingModal.tsx` | 成功消息含 `确认邮件已发送至 {email}` |
| `BookingCard.tsx` | CONFIRMED 状态展示 📧 图标 + tooltip |

### 模块 D：代客预约 (Backlog ID 9)

| 文件 | 说明 |
|------|------|
| `frontend/src/pages/StaffBookingPage.tsx` | 代客预约页（表单态 + 成功态）|
| `frontend/src/components/admin/GuestBookingForm.tsx` | 游客预约表单（搜索式车辆选择器）|
| `frontend/src/api/employeeBookings.ts` | 代客预约 API 封装 |

### 模块 E：图表可视化 (Backlog ID 21)

| 文件 | 说明 |
|------|------|
| `RevenueStatisticsPage.tsx` | Recharts 替代表格：`BarChart` / `LineChart` / `PieChart` |
| `package.json` | 新增 `recharts` 依赖 |

### 模块 F：用户折扣管理 (Backlog ID 22)

| 文件 | 说明 |
|------|------|
| `frontend/src/pages/UserManagementPage.tsx` | 用户管理（搜索 + 分页 + 类型切换）|
| `frontend/src/components/admin/UserTable.tsx` | 用户表格组件 |
| `frontend/src/components/admin/UserTypeDropdown.tsx` | 类型下拉（确认弹窗）|
| `frontend/src/api/users.ts` | 用户管理 API |
| `frontend/src/pages/AdminPricingPage.tsx` | 价格配置 + 折扣率配置 |
| `frontend/src/api/price.ts` | 价格 + 折扣 API 封装 |
| `backend/src/modules/config/discount-config.controller.ts` | `GET/PUT /config/discounts` |
| `backend/src/modules/config/discount-config.service.ts` | 折扣率内存存储 |
| `backend/src/modules/config/pricing-config.controller.ts` | `GET/PUT /config/pricing` |
| `backend/src/modules/config/pricing-config.service.ts` | 定价内存存储 |

### 模块 G：商业气息强化

| 文件 | 改动 |
|------|------|
| `ScooterCard.tsx` | 价格层级展示（1h/4h/1d/1w）|
| `BookingCard.tsx` | 邮件图标 + 折扣节省提示 |
| `BookingModal.tsx` | 成功消息含邮件通知 |

### 模块 H：FAQ 页面

| 文件 | 说明 |
|------|------|
| `frontend/src/pages/FAQPage.tsx` | 折叠面板 FAQ（`<details>` 原生实现）|

### 模块 I：多客户端并发优化 (Backlog ID 23)

| 文件 | 说明 |
|------|------|
| `backend/src/modules/events/events.service.ts` | RxJS Subject 事件总线 |
| `backend/src/modules/events/events.controller.ts` | SSE 端点 `GET /events/scooter-status` |
| `backend/src/modules/events/events.module.ts` | Events 模块 |
| `frontend/src/hooks/useScooterEvents.ts` | SSE 订阅 hook（自动重连）|
| `booking.service.ts` | `updateMany` 原子操作替代 `findUnique+update` |

### 模块 J：支付按钮接线 (Backlog ID 6)

| 文件 | 改动 |
|------|------|
| `frontend/src/api/bookings.ts` | 新增 `pay(bookingId, amount)` → `POST /payments` |
| `MyBookingsPage.tsx` | `handlePayBooking` 从 `alert()` 改为真实 API 调用 |
| `BookingCard.tsx` | `onPay` 签名改为 `(id, amount) => void` |

---

## Backlog 完成度：25/25 (100%)

| ID | 描述 | 证据 |
|----|------|------|
| 1 | 用户登录/注册 | AuthPage + JWT + bcrypt |
| 2 | 存储银行卡 | PaymentMethodsPage + AddCardModal + Luhn |
| 3 | 卡数据安全 | AES-256-CBC 加密 + encryptedCardNumber |
| 4 | 查看租赁选项/价格 | BookingModal 四种类型 + AdminPricingPage |
| 5 | 预约电动车 | ScooterListPage → BookingModal → booking API |
| 6 | 模拟支付 | `POST /payments` 接线（非 alert）|
| 7 | 邮件确认 | EmailService + 前端邮件提示 |
| 8 | 存储/显示预约 | MyBookingsPage + BookingCard |
| 9 | 代客预约 | StaffBookingPage + GuestBookingForm |
| 10 | 更新车辆状态 | AdminFleetPage toggle |
| 11 | 续租 | ExtendBookingModal + extend API |
| 12 | 取消预约 | BookingCard cancel → `PATCH /cancel` |
| 13 | 提交反馈 | CreateFeedbackPage + feedback API |
| 14 | 反馈优先级 | FeedbackPriority + 自动升级 |
| 15 | 高优先级看板 | HighPriorityPage + CSV 导出 |
| 16 | 配置车辆/价格 | AdminFleetPage + AdminPricingPage |
| 17 | 显示车辆可用性 | ScooterListPage + 状态筛选 |
| 18 | 地图可视化 | MapPage + 高德 AmapMap |
| 19 | 周收入统计 | RevenueStatisticsPage 按类型 |
| 20 | 日收入统计 | RevenueStatisticsPage 每日 |
| 21 | 图表可视化 | Recharts Bar/Line/Pie |
| 22 | 折扣系统 | DiscountService + UserTypeDropdown |
| 23 | 多客户端并发 | 乐观锁 + SSE 实时推送 |
| 24 | 响应式 UI | Tailwind 响应式 + MobileBottomNav |
| 25 | 无障碍访问 | WCAG AA + ARIA + skip-link |

---

## 工时统计

| 模块 | 预估 | 实际说明 |
|------|------|---------|
| Admin Dashboard + 导航重构 | 3h | 新建 6 文件 + 路由 + Navbar 改造 |
| 银行卡管理 (ID 2/3) | 5h | 4 组件 + API + Luhn + 加密存储 |
| 邮件提示 (ID 7) | 1h | 3 文件小改 |
| 代客预约 (ID 9) | 4h | 2 页面 + API + 搜索组件 |
| 图表 (ID 21) | 2h | Recharts 3 种图表 + 切换器 |
| 用户折扣管理 (ID 22) | 7h | 6 前端文件 + 4 后端文件 + 测试 |
| 商业气息强化 | 2h | 价格展示 + 文案修正 |
| FAQ | 2h | 静态页面 + 内容撰写 |
| 支付接线 (ID 6) | 0.5h | 3 文件修改 |
| 并发优化 (ID 23) | 2h | 乐观锁 + SSE + 前端 hook |
| **总计** | **~28.5h** | 22 新文件 + 12 修改文件 |

---

## CI 验证

| 检查 | 状态 |
|------|------|
| 后端单元测试 | 36 suites / 302 tests ✅ |
| 覆盖率 (branches) | 83.31% (>80%) ✅ |
| 前端 TypeScript | 零错误 ✅ |
| 后端 ESLint | 零错误 ✅ |
| Prettier | 通过 ✅ |

---

## Git 工作流

```
main
 ├── feature/sprint4-gap-fix  (PR #29, merged to dev)
 │    ├── 2b08768 feat: admin dashboard, FAQ, navigation
 │    ├── ec93395 feat: payment methods + pay button wiring
 │    ├── 1f58b20 feat: staff booking + Recharts + polish
 │    ├── 03dcfe0 feat: user management + discount config
 │    ├── ba48f98 feat: pricing config backend endpoints
 │    └── 4097966 fix: tests for config controllers
 │
 └── feature/multi-client-concurrency (PR #30, pending)
      └── 9880601 feat: optimistic concurrency + SSE
```

---

## 13. 生产环境部署

### 13.1 服务器信息

| 项目 | 详情 |
|------|------|
| 服务器 IP | 8.137.52.214 |
| 项目路径 | `/opt/scooter` |
| Docker 版本 | Docker Engine (无 Swarm/K8s) |
| 运行时间 | 持续 4 天无宕机 |

### 13.2 运行服务

```
scooter-postgres-1    Up (healthy)    127.0.0.1:5433→5432
scooter-backend-1     Up              127.0.0.1:3001→3001
scooter-frontend-1    Up              0.0.0.0:8080→80
```

### 13.3 网络架构

```
用户浏览器
  │  HTTP :8080
  ▼
scooter-frontend-1 (nginx:alpine)
  │  /       → /usr/share/nginx/html (静态资源)
  │  /api/*  → proxy_pass http://backend:3001/
  ▼
scooter-backend-1 (NestJS, Port 3001)
  │  postgresql://...@postgres:5432/
  ▼
scooter-postgres-1 (PostgreSQL 16, 仅 Docker 内网可达)
```

- Backend 和 PostgreSQL 均绑定 127.0.0.1，不对外暴露
- 前端 nginx 通过 `/api/` 前缀反向代理到后端，无需额外宿主机 nginx
- 前端 JS 使用相对路径 `/api`，避免跨域和 Network Error

### 13.4 系统资源

| 指标 | 值 |
|------|-----|
| CPU 负载 | 0.16 (空闲) |
| 内存 | 1.8G total / 780M used / 906M available |
| 磁盘 | 40G total / 14G used (37%) |

### 13.5 已修复的生产问题

| 日期 | 问题 | 根因 | 修复 |
|------|------|------|------|
| 2026-05-02 | 注册/登录返回 Network Error | `axiosClient.ts` baseURL 默认 `http://localhost:3000`，浏览器向用户本机发请求 | 改为 `/api` 相对路径，走 nginx 同源代理；`vite.config.ts` 添加开发模式代理 |
| 2026-05-02 | 管理员登录 Not allowed by CORS | `main.ts` CORS 白名单仅允许 `localhost:51xx`，生产 `8.137.52.214:8080` 被拒 | 新增 8080 端口通配规则 + `CORS_ORIGINS` 环境变量 |
| 2026-05-02 | 管理员账号不存在 | 生产数据库未执行种子数据，`User` 表为零记录 | 容器内运行 `npx ts-node prisma/seed.ts`，创建 admin + 4 测试用户 + 站点/车辆/历史数据 |
| 2026-05-01 | Docker 安全加固 | 硬编码密钥回退值、健康检查空壳 | 移除硬编码密钥、健康检查对接数据库、全局限流等 |

### 13.6 种子数据

生产数据库需通过种子脚本初始化基础数据：

```bash
# 在 backend 容器中运行
docker exec scooter-backend-1 npx ts-node prisma/seed.ts
```

创建内容：
- 管理员 `admin@scooter.com / admin123` (MANAGER)
- 测试用户 `test1~4@example.com / user123` (分别 FREQUENT/STUDENT/SENIOR/NORMAL)
- 5 个站点（西南交通大学周边）+ 6 辆滑板车
- 11 条历史预订 + 支付记录（用于收入统计图表）

### 13.7 常用运维命令

```bash
# 一键部署
cd /opt/scooter && docker compose up -d --build

# 仅重建前端
docker compose build frontend && docker compose up -d frontend

# 查看日志
docker compose logs -f backend

# 健康验证
curl http://localhost:3001/            # Backend: {"data":"Hello World!"}
curl -X POST http://localhost:8080/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@test.com","password":"test"}'
```

---

## 14. 演示种子数据（v2.0 — 2026-05-02 重设计）

基于故事线模式重新设计的种子数据，覆盖全部功能点。

### 14.1 账户

| 账户 | 密码 | 角色 | 类型 | 故事线 |
|------|------|------|------|--------|
| `admin@scooter.com` | `admin123` | MANAGER | — | 后台全功能管理 |
| `xiaoming@example.com` | `user123` | CUSTOMER | STUDENT | 完整租借闭环 |
| `zhangwei@example.com` | `user123` | CUSTOMER | FREQUENT | 高频用户 + 损坏赔偿 |

### 14.2 王小明（学生）— 完整租借闭环

| 数据 | 说明 |
|------|------|
| 支付卡 ×2 | 1 张默认卡 (6789) + 1 张备用卡 (1234) |
| 预订 IN_PROGRESS | 4 小时骑行中，已骑行 1h，图书馆站取车，¥12（学生 8 折） |
| 预订 PENDING_PAYMENT | 1 小时待支付，¥4，体育馆站 |
| 预订 CANCELLED | 1 天订单已取消，¥24 |
| 预订 COMPLETED | 1 小时已完成，¥4 → 提交了 FAULT 反馈（刹车偏软） |
| 历史 ×4 | 4 条 COMPLETED（30 天内），支撑收入统计 |
| 反馈 FAULT | "刹车偏软，制动力不足" — HIGH / PENDING |
| 反馈 FAULT | "座椅高度调节卡死" — HIGH / ESCALATED |

### 14.3 张伟（高频用户）— 损坏赔偿闭环

| 数据 | 说明 |
|------|------|
| 预订 EXTENDED | 4 小时续租 1 次，已付 ¥18.75（75 折） |
| 预订 COMPLETED | 1 天已完成，¥22.5 — 故意损坏 → CHARGEABLE |
| 预订 COMPLETED | 1 周大额订单，¥67.5 |
| 预订 COMPLETED | 1 小时已完成 → 自然磨损 → RESOLVED |
| 历史 ×12 | 12 条 COMPLETED（30 天内混合 HOUR_1/HOUR_4/DAY_1/WEEK_1） |
| 反馈 DAMAGE | "车身严重划痕 — 人为损坏" — URGENT / CHARGEABLE / ¥200 |
| 反馈 DAMAGE | "轮胎自然磨损" — MEDIUM / RESOLVED / ¥0 |
| 反馈 SUGGESTION | "建议增加夜间优惠时段" — LOW / PENDING |

### 14.4 管理员后台展示

| 功能 | 数据支撑 |
|------|---------|
| 反馈管理 | 5 条反馈（PENDING ×2 / ESCALATED ×1 / RESOLVED ×1 / CHARGEABLE ×1） |
| 高优先级看板 | URGENT 1 条 + HIGH 2 条 |
| 车队管理 | 4 AVAILABLE / 1 RENTED / 1 UNAVAILABLE |
| 用户管理 | 3 种类型可切换（STUDENT / FREQUENT / MANAGER） |
| 收入统计 | 30 天 × 2 用户 × 混合类型数据，支持 Bar/Line/Pie 图表 |
| 代客预约 | 管理员为"李教授（访客）"代订 4 小时，状态 CONFIRMED |
| 定价配置 | 默认定价 HOUR_1: ¥5 / HOUR_4: ¥15 / DAY_1: ¥30 / WEEK_1: ¥90 |

### 14.5 功能覆盖矩阵

| 维度 | 覆盖项 |
|------|--------|
| BookingStatus | 全部 6 种：PENDING_PAYMENT / CONFIRMED / IN_PROGRESS / CANCELLED / COMPLETED / EXTENDED |
| HireType | 全部 4 种：HOUR_1 / HOUR_4 / DAY_1 / WEEK_1 |
| UserType | 3 种：STUDENT / FREQUENT / NORMAL |
| ScooterStatus | 3 种：AVAILABLE (×4) / RENTED (×1) / UNAVAILABLE (×1) |
| FeedbackCategory | 3 种：FAULT (×2) / DAMAGE (×2) / SUGGESTION (×1) |
| FeedbackPriority | 4 种：LOW / MEDIUM / HIGH / URGENT |
| FeedbackStatus | 4 种：PENDING / RESOLVED / ESCALATED / CHARGEABLE |
| DamageType | 2 种：NATURAL / INTENTIONAL |
| PaymentCard | 2 张（含默认标记） |
| EmployeeBooking | 1 条（管理员代访客预约） |

### 14.6 部署命令

```bash
# 在服务器上重置并重新播种
cd /opt/scooter
docker compose exec backend npx prisma migrate reset --force
docker compose exec backend npx ts-node prisma/seed.ts
```

---

*文档更新时间：2026-05-02 19:25 CST*
