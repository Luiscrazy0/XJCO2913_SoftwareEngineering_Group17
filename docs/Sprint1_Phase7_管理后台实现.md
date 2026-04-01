整理完 Sprint 1 阶段7 内容后，先对当前代码进行验证并据实修正方案。以下为校验版文档（截至 2026-03-28）。

---

# Sprint 1 - 阶段7：管理后台实现（校验与修订）

## 目标
为管理员提供车辆管理能力：查看列表、添加车辆、变更状态，并确保前后端权限一致、交互可用。

## 当前代码实况（2026-03-28）

### 前端
- 路由：`/admin` 通过 `ProtectedRoute requiredRole="MANAGER"` 保护，未登录重定向 `/`，角色不符跳转 `/403` 并弹 Toast（`src/router/AppRouter.tsx`, `src/components/ProtectedRoute.tsx`）。
- 页面：`AdminFleetPage` 仍是占位视图，未实现列表/表单/统计（`src/pages/AdminFleetPage.tsx`）。
- 组件：不存在 `components/admin/*`，文档中提到的表格、弹窗、状态徽章、统计组件均未落地。
- 数据层：`scootersApi` 已提供 `getAll/create/updateStatus/delete`，状态类型为 `'AVAILABLE' | 'UNAVAILABLE'`，创建接口仅需 `location`（`src/api/scooters.ts`, `src/types/index.ts`）。
- UI 辅助：403 页已存在；Toast Provider 已实现，可用于操作反馈。

### 后端
- 数据模型：`prisma/schema.prisma` 中 `ScooterStatus` 仅有 `AVAILABLE`, `UNAVAILABLE`。
- 路由：`/scooters` 的 GET/POST/PATCH 可用，但**未加任何认证或角色守卫**（`src/modules/scooter/scooter.controller.ts`）。
- DTO：`CreateScooterDto` 校验 `location` 必填；`UpdateScooterStatusDto` 限定状态枚举。
- Service：支持 `findAll/findById/create/updateStatus`，有 `delete` 方法但未在 controller 暴露。

## 与原方案的差异
- 状态集合：原文写 `AVAILABLE/BOOKED/MAINTENANCE`，实际为 `AVAILABLE/UNAVAILABLE`，且前后端一致使用该二值。
- 功能完成度：原文称 AdminFleetPage、表格、添加弹窗、统计均完成；实际未实现。
- 权限：原文称管理员权限验证完整；实际后端无 Guard，前端仅路由保护。
- 数据刷新：文档描述 TanStack Query 缓存与刷新；实际 Admin 页未接入 Query。

## 修正后的落地方案

### API 与权限
1) 给 `scooter.controller.ts` 的 POST/PATCH（以及后续 DELETE）添加 `@UseGuards(JwtAuthGuard, RolesGuard)` 并标注 `@Roles(Role.MANAGER)`；GET 可视需求决定是否需要登录/角色。
2) 若项目尚未提供 RolesGuard，需在 Auth 模块增加角色守卫并在 `app.module.ts` 注册。
3) 视业务决定是否保留二值状态；如需 MAINTENANCE/BOOKED，先扩展 Prisma 枚举并同步前端 `types` 与 API。

### 前端页面与组件
1) 重写 `src/pages/AdminFleetPage.tsx`：
   - 使用 `useQuery` 调用 `scootersApi.getAll`，`queryKey` 建议 `['scooters']`（与用户端复用）。
   - 使用 `useMutation` 处理创建/状态更新，成功后 `invalidateQueries(['scooters'])`。
   - 提供加载、错误、空态处理（可内置，不必依赖现有列表页组件）。
2) 新增 `src/components/admin/`：
   - `FleetTable.tsx`：表格列（位置、状态、操作），操作至少预留“标记不可用/可用”。
   - `StatusBadge.tsx`：对 `AVAILABLE/UNAVAILABLE` 渲染绿色/灰色徽章。
   - `AddScooterModal.tsx`：表单仅包含 `location`，提交后关闭并刷新。
   - `FleetStats.tsx`：汇总可用/不可用数量。
3) 交互反馈：所有创建/更新失败与成功使用 `useToast`；无权限交互保持现有 403 + Toast。

### 数据与状态一致性
- 统一状态类型：前后端均使用 `'AVAILABLE' | 'UNAVAILABLE'`；若扩展枚举，需同步 `prisma/schema.prisma`、`frontend/src/types/index.ts`、`scootersApi`、后端 DTO。
- 接口路径保持：`POST /scooters`、`PATCH /scooters/:id/status`；DELETE 如需暴露，与 service 对齐。

### 验收标准（更新）
- MANAGER 访问 `/admin`：可看到车辆表格与“添加车辆”入口；添加成功后表格刷新，默认状态 AVAILABLE。
- 状态列使用徽章标识，可用/不可用颜色清晰。
- CUSTOMER 访问 `/admin`：前端跳转 403；后端（加 Guard 后）返回 403。
- API 401/403 时前端 Toast 提示并保持在登录或 403 页。
- 若引入 DELETE：删除后列表刷新，给出二次确认。

## 待办清单
- [ ] 后端：为 scooter POST/PATCH（及未来 DELETE）添加 JwtAuthGuard + RolesGuard；评估 GET 是否需要认证。
- [ ] 后端：可选暴露 DELETE 路由，补充 e2e/单元测试。
- [ ] 前端：重写 AdminFleetPage，引入 Query/MUTATION 与 admin 组件。
- [ ] 前后端：状态枚举一致性检查（保持 AVAILABLE/UNAVAILABLE 或共同扩展）。
- [ ] 测试：管理员场景的集成/e2e 覆盖（访问、添加、状态变更、权限）。

## 备注
- 现有预订流程依赖车辆状态为 `AVAILABLE`（见 booking service），请确保状态切换不会破坏此约束。
- 文档保持与当前代码同步，如后续扩展枚举或新增操作，请在本页更新。
