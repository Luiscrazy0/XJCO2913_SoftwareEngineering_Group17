# Sprint 4 测试员工作包

本工作包用于测试员独立执行 Sprint 4 验收测试。测试员必须能访问一套可运行系统：前端、后端 API、数据库和演示账号都需要可用。

## 1. 测试范围

必须覆盖以下 Sprint 4 验收点：

- 完整借还闭环：查看站点/车辆 -> 费用估算 -> 预订 -> 支付 -> 取车 -> 骑行中 -> 还车
- P0 缺陷回归：支付事务原子性、分页、JWT 密钥安全、健康检查
- 前端组件：BookingModal、PriceEstimate、PaymentModal、StartRideModal、EndRideModal、RideTimer
- 系统级 E2E：真实后端 + 真实数据库 + 演示账号
- 测试证据：命令输出、截图或 Playwright 报告、缺陷记录

## 2. 访问与环境

测试员开始前需要确认：

- 前端 URL：默认 `http://localhost:5173`，或由部署负责人提供
- 后端 API：默认 `http://localhost:3000`
- 演示账号：`customer@test.com / demo123`
- 数据库已执行迁移和 seed，至少有 1 个 `AVAILABLE` scooter 和 1 个 station
- 后端 `.env` 中必须设置 `JWT_SECRET`，不能依赖硬编码默认值

PowerShell 环境变量示例：

```powershell
$env:E2E_BASE_URL="http://localhost:5173"
$env:E2E_API_URL="http://localhost:3000"
$env:E2E_CUSTOMER_EMAIL="customer@test.com"
$env:E2E_CUSTOMER_PASSWORD="demo123"
```

## 3. 自动化执行

后端单元测试：

```powershell
cd backend
npm test -- --runInBand
```

前端组件测试：

```powershell
cd frontend
npm test
```

前端覆盖率：

```powershell
cd frontend
npm run test:coverage
```

E2E 测试列表检查：

```powershell
cd frontend
npm run test:e2e:list
```

E2E 正式执行：

```powershell
cd frontend
npm run test:e2e
```

E2E 会访问真实 API 并创建一笔测试订单，随后完成支付、开始骑行和还车。若系统没有可用车辆，测试会标记为 skipped，测试员需要先重置 seed 数据或联系开发补充测试数据。

## 4. 手工验收清单

| 编号 | 场景 | 通过标准 |
|---|---|---|
| M1 | 打开前端并登录 customer 账号 | 登录成功，无空白页或控制台关键错误 |
| M2 | 打开地图或车辆列表 | 站点/车辆可见，列表分页可用 |
| M3 | 打开 BookingModal | 显示取车站点和费用估算 |
| M4 | 切换租赁类型 | 费用估算刷新，失败时显示降级提示 |
| M5 | 创建预订并支付 | PaymentModal 替代 alert，支付后订单进入 CONFIRMED |
| M6 | 开始骑行 | 订单进入 IN_PROGRESS，计时器可见 |
| M7 | 结束骑行 | 可选择还车站点，订单进入 COMPLETED，车辆恢复 AVAILABLE |
| M8 | 损坏报告 | 取消“车辆完好”后还车，应生成高优先级损坏反馈 |
| M9 | 分页压力 | `limit=200` 被截断为 100，响应包含 total/page/limit/totalPages |
| M10 | 健康检查 | `GET /health` 返回 status、uptime、memory、database check |

## 5. 缺陷记录格式

每个缺陷至少记录：

- 标题：简短描述失败行为
- 环境：前端 URL、后端 API、分支和 commit
- 步骤：从登录开始的可复现步骤
- 实际结果：看到什么错误
- 期望结果：对应 Sprint 4 验收标准
- 证据：截图、Playwright trace、控制台日志或 API 响应
- 严重级别：P0 阻断演示，P1 影响主流程，P2 体验或文档问题

## 6. 交付物

测试员完成后提交：

- 后端测试命令输出
- 前端组件测试命令输出
- E2E 报告或失败 trace
- 手工验收清单结果
- 缺陷清单和复测结果

