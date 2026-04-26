🔧 修复方案执行记录
📋 当前状态
- ✅ 分支创建: fix/frontend-cache-permission (新分支)
- ✅ 阶段1完成: 后端 booking 权限修复（按用户隔离 + 管理员放行）
- ✅ 阶段2完成: 前端 Query Key Factory + 登出缓存清理（避免跨账号缓存串数据）
- ⏸️ 暂停点: 进入阶段4测试验证（权限/缓存/安全）
🎯 完整修复计划
阶段1：后端权限修复（必须优先）
1. 修改 booking.controller.ts: 
   - 添加 @Req() req: Request 参数到 findAll() 方法
   - 从 JWT token 中获取当前用户ID
   - 调用 bookingService.findAll(userId) 传递用户ID
   
2. 修改 booking.service.ts:
   - 创建 findAll(userId: string) 方法，添加 where: { userId } 过滤
   - 可选：保持原有 findAll() 方法给管理员使用（需角色验证）
3. 验证其他端点权限:
   - GET /bookings/:id - 检查是否验证用户所有权
   - PATCH /bookings/:id/extend - 检查权限
   - PATCH /bookings/:id/cancel - 检查权限
   - PATCH /bookings/:id/complete - 检查权限
阶段2：前端缓存架构重构
4. 创建 queryKeys.ts: Query Key Factory 模式
   - 为所有 API 模块创建标准化查询键
   - 确保包含用户/角色标识
5. 修复 MyBookingsPage.tsx:
   - 使用 bookingKeys.list(user?.id) 作为查询键
   - 添加 enabled: !!user?.id 条件
6. 修复 AuthContext.tsx:
   - 集成 queryClient 用于缓存清理
   - 在 logout() 中添加精准缓存清理逻辑
阶段3：其他页面修复
7. 管理页面修复:
   - AdminFeedbacksPage.tsx: 添加角色标识到查询键
   - HighPriorityPage.tsx: 添加角色标识
   - AdminFleetPage.tsx: 确保查询键区分管理员数据
8. 全局检查:
   - 所有使用 useQuery 的页面
   - 确保查询键正确隔离用户/角色数据
阶段4：测试验证
9. 权限测试: 模拟用户切换，验证数据隔离
10. 缓存测试: 验证登出时缓存清理
11. 安全测试: 尝试访问其他用户数据
⚙️ 技术决策记录
1. 后端兼容性策略: 
   - 修改现有 GET /bookings 端点，添加用户过滤
   - 保持向后兼容，不改变API签名
2. 缓存清理策略:
   - 精准清理：queryClient.removeQueries({ queryKey: bookingKeys.all })
   - 避免完全清理：queryClient.clear()（影响性能）
3. Query Key Factory 范围:
   - 扩展到所有 API 模块：bookings, feedbacks, scooters, stations
   - 统一命名模式：{module}Keys.list(userId?, role?, filters?)
4. AuthContext 集成:
   - 将 queryClient 作为依赖注入到 AuthContext
   - 在 logout() 中清理特定用户缓存
📍 继续执行点
需要继续完成的步骤：
1. 阶段4：测试验证
   - 权限测试: 用户A登录 -> 查看/操作自己的 bookings；切换用户B后不可查看/操作用户A的 booking
   - 缓存测试: 用户A登录打开“我的预约” -> 登出 -> 用户B登录 -> 不应看到用户A缓存数据（应重新拉取）
   - 安全测试: 尝试访问 /bookings/:id（他人ID）应被拒绝（403）或返回不可访问错误
2.（可选）进一步加固
   - POST /bookings：建议后端从 JWT 取 userId，忽略 body.userId（防止伪造下单）
   - payment-card 相关接口：当前仍使用占位 user-id，可按同样模式改为从 JWT 获取
🚨 注意事项
1. JWT Guard 验证: 确保 req.user 正确包含用户信息
2. 管理员访问: 考虑是否需要管理员查看所有预订的权限
3. 错误处理: 用户ID缺失时的适当错误响应
4. 测试覆盖: 修复后必须进行完整的端到端测试

🧪 本地环境排障（非常常见）
如果出现「管理员账号无法登录 / 无可用车辆 / 数据库为空」：
1. 确认 Postgres 已启动：`docker compose up -d`
2. 初始化数据（会向空库写入站点/车辆/测试账号；重复运行会产生重复站点/车辆，建议只在空库运行）：
   - `cd backend && npm run db:migrate`
   - `cd backend && npm run seed`
3. 种子账号（seed.ts 内置）：
   - `admin@scooter.com / admin123`（MANAGER）
   - `test1@example.com / user123`（CUSTOMER）
   - `test2@example.com / user123`（CUSTOMER）
📊 风险评估
已完成步骤	状态
分支创建	✅
controller 导入添加	✅
service 方法修改	✅
其他 booking 端点权限校验	✅
前端缓存架构	✅
下一步：进入阶段4测试验证
