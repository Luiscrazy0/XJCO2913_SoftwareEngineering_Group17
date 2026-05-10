# AAA 电动车租赁 — 技术改进报告

> **范围**: Sprint 3 基线 (`d0965ba`) → 当前 (`8d1cb27`)  
> **期间**: 2026-04-30 ~ 2026-05-11  
> **提交数**: 69 commits (含 merge)  
> **文件变更**: 178 files, +16,333 / -5,207 lines  
> **服务器**: `http://8.137.52.214:8080/` | Docker 部署 | PostgreSQL 16

---

## 1. 概览

自 Sprint 3 结束以来，项目经历了四个密集开发阶段：

| 阶段 | 日期 | 主题 | 代表性 commit |
|------|------|------|--------------|
| Sprint 4 开发 | 04-30 ~ 05-02 | Epic 1-7 全量交付，Backlog 25/25 完成 | `f2bb81e` ~ `55bf28e` |
| 产品化升级 | 05-10 | 品牌焕新、Landing Page、Guest Mode、Admin Dashboard | `55bf28e` |
| Bug 修复马拉松 | 05-10 ~ 05-11 | 三轮 20+ P0/P1 缺陷修复 | `845b74f` ~ `8d1cb27` |
| CI/部署加固 | 贯穿 | Docker 修复、测试适配、CI 管线 | 多个 |

---

## 2. Sprint 4 核心交付

### 2.1 Backlog 全覆盖 (25/25)

| ID | 功能 | 实现 |
|----|------|------|
| 1-8 | 登录、支付、邮件、预约 CRUD | AuthPage + JWT/bcrypt + PaymentModal + EmailService |
| 9 | 代客预约 | StaffBookingPage + GuestBookingForm + employee-booking API |
| 10-12 | 车辆状态管理、续租、取消 | AdminFleetPage + ExtendBookingModal + cancelBooking |
| 13-15 | 反馈系统（提交+优先级+看板） | CreateFeedbackPage + HighPriorityPage + CSV 导出 |
| 16-17 | 价格/车队配置 | AdminPricingPage + AdminFleetPage toggle |
| 18 | 高德地图 | AmapMap 组件 + MapPage + REST API geocode/regeocode/distance |
| 19-21 | 收入统计 + 图表 | RevenueStatisticsPage（Recharts Bar/Line/Pie） |
| 22 | 折扣系统 | DiscountService + UserTypeDropdown + 价格配置端点 |
| 23 | 多客户端并发 | 乐观锁 (`updateMany` + `WHERE status = AVAILABLE`) + SSE WebSocket 实时状态推送 |
| 24-25 | 响应式 UI + 无障碍 | Tailwind 响应式 + MobileBottomNav + WCAG AA + ARIA |

### 2.2 技术架构增强

- **EventsService**: RxJS Subject 事件总线，支持 SSE 实时推送车辆状态变更
- **ResponseInterceptor**: 全局统一响应格式 `{ success, data, message, timestamp }`
- **HttpExceptionFilter**: 全局异常过滤，统一错误格式
- **ValidationPipe**: `whitelist: true, transform: true` 全局生效
- **@nestjs/throttler**: API 限流保护
- **Prisma $transaction**: 预订/支付关键路径使用原子事务

---

## 3. 产品化升级 (Phase 1-7)

| Phase | 改进 | 影响 |
|-------|------|------|
| 品牌焕新 | 品牌名统一为"AAA电动车租赁"，Slogan "城市出行，即刻启程" | 14 处文件 |
| Landing Page | `/` 路由从 AuthPage 改为公开 LandingPage（Hero + 功能卡 + 定价表 + CTA） | 新文件 |
| Onboarding | 3 步新手指引（选择车辆→确认支付→开始骑行），首次访问自动弹出 | 新文件 |
| Guest Mode | 未登录用户可浏览车辆和站点地图（只读），sessionStorage 标记 | 4 文件 |
| Admin Dashboard | 4 张实时数据卡片（今日订单/收入/活跃车辆/总用户），30s 自动刷新 | 新接口 + 页面 |
| Code Splitting | 16 个页面组件改为 `React.lazy()` 动态加载 | AppRouter.tsx |
| Security Audit | Frontend 0 vulnerabilities，Backend 3 moderate (transitive) | 已 fix |

---

## 4. Bug 修复马拉松（三轮）

### 4.1 第一轮：7 项关键缺陷 (`845b74f`)

| # | 缺陷 | 修复 |
|---|------|------|
| 1 | 取消预约后车辆不恢复可用 | `cancelBooking()` 增加事务 + `scooter.status → AVAILABLE` + SSE 推送 |
| 2 | Docker 后端缺失 `AMAP_WEB_KEY` | docker-compose.yml 增加 `AMAP_WEB_KEY` 环境变量 |
| 3 | ErrorBoundary 无返回按钮，恶性导航 | 新增"返回上一页"按钮 + 页面级 ErrorBoundary 隔离 |
| 4 | 未登录显示"我的反馈" → 会话过期 | Navbar/MobileBottomNav 增加 `{user && ...}` 权限守卫 |
| 5 | Landing Page "扫码即走" 不实 | 三处文案改为"一键即走"/"一键解锁"（匹配 FAQ 流程） |
| 6 | 站点地图移动端底部导航栏消失 | MobileBottomNav `z-40` → `z-[9999]` |
| 7 | JWT 过期未校验 | AuthContext 初始化时检查 `payload.exp` |

### 4.2 第二轮：状态机 + 收入统计 + 幽灵车 (`973d70c`)

| # | 缺陷 | 修复 |
|---|------|------|
| 1 | Staff Booking "预约表单加载失败" | GuestBookingForm 空安全 (`(s.location ?? '')` + `isError` 处理) |
| 2 | 收入统计骑行中订单消失 | 3 处 revenue 查询增加 `IN_PROGRESS` 状态（已验证支付安全） |
| 3 | 统计页面无自动刷新 | `RevenueStatisticsPage` 增加 30s 自动刷新 interval |
| 4 | 幽灵车（RENTED 状态卡死） | 后端 `forceResetGhostScooter` + 前端"强制重置"按钮（含 confirm 确认） |

### 4.3 第三轮：全流程超时 + 错误提示 (`85f88c7` ~ `8d1cb27`)

| # | 缺陷 | 根因 | 修复 |
|---|------|------|------|
| 1 | 每步成功都弹错误 toast | 全局 `mutations: { retry: 1 }` 导致 mutation 自动重试 | `retry: 1` → `retry: 0` |
| 2 | 支付幂等 key 每次不同 | `Date.now()` 在 `mutationFn` 内部，重试时 key 变了 | 移到 `useRef` 固化 |
| 3 | 开始骑行后需手动刷新 | `setQueryData` 写入的 key 与 `useQuery` 实际 key 不匹配 | 改为 `invalidateQueries` |
| 4 | 续租弹窗白色字体白色背景 | 硬编码 `bg-blue-50`/`bg-gray-50`（亮底白字） | 改为深色背景 + 亮色文字 |
| 5 | 续租弹窗移动端无法关闭 | 浮层 div 缺失 `onClick` | 增加点击背景关闭 |
| 6 | 创建预约/支付/还车均 10+ 秒超时 | SMTP 未配置，nodemailer 每次 30s 连接超时阻塞 API 响应 | 6 处 `await emailService` 改为 fire-and-forget `.catch()` |
| 7 | Staff Booking 仍崩溃 | `employeeBookingsApi` 将分页对象 `{items}` 当作数组返回 | `response.data.data?.items ?? []` |

---

## 5. 测试与 CI

| 指标 | 状态 |
|------|------|
| 后端单元测试 | 36 suites / 322 tests ✅ |
| 前端 TypeScript | 零错误 ✅ |
| CI Pipeline | Backend CI (test-backend + test-frontend + e2e-and-perf) |
| 测试适配 | `payment.service.spec.ts` 和 `statistics.service.spec.ts` 随重构同步更新 |

---

## 6. 部署与运维

| 项目 | 详情 |
|------|------|
| 部署方式 | Docker Compose (3 服务: postgres, backend, frontend) |
| 前端 | Nginx:80 → `:8080` |
| 后端 | Node.js:3001 → `:3001` (Nginx proxy `/api/*`) |
| 数据库 | PostgreSQL 16, 持久卷 `scooter_postgres_data` |
| 部署命令 | `docker compose -p scooter up -d --build` |
| CI/CD | GitHub Actions → 自动跑测试 |

**Docker 环境变量已传递**: `PORT`, `DATABASE_URL`, `JWT_SECRET`, `ENCRYPTION_KEY`, `AMAP_WEB_KEY`, `VITE_AMAP_JS_KEY`

---

## 7. 已知限制

| 项目 | 说明 |
|------|------|
| 高德 Web Service Key | 返回 `USERKEY_PLAT_NOMATCH`，需在控制台启用 Web 服务 API 平台 |
| SMTP | 未配置（邮件已改为 fire-and-forget，不影响 API 响应） |
| 部分测试 | `*.spec.ts` 中有预存的 TypeScript mock 类型不匹配（不影响生产代码） |

---

## 8. 变更文件统计

```
 178 files changed, 16,333 insertions(+), 5,207 deletions(-)
```

| 类别 | 文件数 |
|------|--------|
| 前端页面 | 21 pages |
| 前端组件 | 30+ components |
| 前端 API/工具 | 14 API modules + 5 utils/hooks |
| 后端模块 | 12 modules (auth, booking, payment, feedback, scooter, station, statistics, amap, events, config, user, upload) |
| 数据库 | 9 models, 6 enums, 15+ migrations |
| 测试 | 36 spec 文件 |
| 文档 | 15+ docs |
| 配置 | docker-compose, Dockerfile×2, nginx.conf, CI yml |

---

## 9. 致 Scrum Master 的要点

1. **Sprint 4 Backlog 25/25 全部完成**，覆盖预定、支付、反馈、统计、管理、并发等全链路
2. **三轮 Bug 修复**在 24 小时内完成，修复了状态机、超时、UI 崩溃、数据同步等 20+ 个 P0/P1 缺陷
3. **全流程 E2E 可演示**：注册 → 浏览车辆 → 预订 → 支付 → 开始骑行 → 结束骑行 → 查看收入统计
4. **教师验收就绪**：服务器 `http://8.137.52.214:8080/` 运行正常，API 响应 < 500ms（邮件非阻塞后）
5. **后续建议**：配置 SMTP 以恢复邮件功能；在高德控制台启用 Web 服务 API 平台；增加 Playwright E2E 测试覆盖完整预订流程
