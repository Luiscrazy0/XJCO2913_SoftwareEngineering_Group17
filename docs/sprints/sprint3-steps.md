

## Sprint 3 功能执行拆分（按模块）

### 模块一：Feedback 基础能力（ID 13）

**Step 1：数据库模型**
- 在 `prisma/schema.prisma` 中添加 `Feedback` 模型（按文档中的定义）
- 运行 `npx prisma migrate dev` 生成迁移

**Step 2：创建反馈 API**
- 实现 `POST /api/feedbacks`
- 字段：`title, description, category, scooterId, bookingId?, imageUrl?`
- 规则：
  - `category = DAMAGE` → 自动 `priority = HIGH`
  - 否则 `priority = LOW`
- 关联登录用户：`createdById = currentUser.id`
- 用户可以在任何时候提交反馈（骑行中、还车后或独立提交）

**Step 3：前端反馈表单**
- 页面路径：`/feedback/new` 或嵌入还车流程
- 包含：
  - 标题、描述、类别下拉（FAULT / DAMAGE / SUGGESTION）
  - 车辆选择（下拉，仅显示当前/历史用车）
  - 图片上传占位（先支持 URL 输入）
- 提交成功后跳转 `/my-feedbacks`

**Step 4：我的反馈列表**
- 页面 `/my-feedbacks`
- 显示当前用户的反馈：`ticketId`、标题、优先级、状态
- 支持点击查看详情

---

### 模块二：Manager 优先级与状态管理（ID 14）

**Step 5：反馈管理 API（仅 MANAGER）**
- 实现 `PATCH /api/feedbacks/:id`
- 可修改字段：
  - `priority`
  - `status`
  - `managerNotes`
  - `resolutionCost`
  - `damageType`（NATURAL 或 INTENTIONAL）
- 添加权限校验：`role === MANAGER`
- 业务规则：
  - 如果 `damageType = NATURAL` → 不收取赔偿
  - 如果 `damageType = INTENTIONAL` → 标记为 `CHARGEABLE` 并设置赔偿金额

**Step 6：管理后台反馈列表**
- 页面 `/admin/feedbacks`
- 默认展示所有 `PENDING` 反馈
- 支持按优先级、状态、类别筛选
- 显示待处理数量 Badge

**Step 7：反馈详情管理页**
- 点击反馈进入 `/admin/feedbacks/:id`
- 可修改优先级 / 状态 / 备注 / 赔偿金额
- 保存后记录 `updatedAt`

---

### 模块三：高优先级问题视图（ID 15）

**Step 8：高优先级问题 API**
- 实现 `GET /api/feedbacks/high-priority`
- 返回：
  - `priority = HIGH 或 URGENT`
  - `status != RESOLVED`
  - 关联用户、车辆、订单信息

**Step 9：高优先级仪表盘**
- 页面 `/admin/high-priority`
- 列表展示：
  - 用户邮箱
  - 车辆 ID
  - 提交时间
  - 优先级标签
- 损坏报告（DAMAGE）置顶

**Step 10：导出功能**
- 增加“导出 CSV / PDF”按钮
- 导出当前筛选结果

---

### 模块四：取还车电量差计费（已取消）

**更新**：根据团队决定，取消电量差计费功能，简化实现。

**原计划步骤**（不再执行）：
- Step 11：扩展 Booking 模型添加电池相关字段
- Step 12：取车记录电量
- Step 13：还车记录电量并计算费用

---

### 模块五：保险确认（补充）

**Step 14：扩展 User 模型**
- 添加字段：
  - `insuranceAcknowledged Boolean`
  - `emergencyContact String?`

**Step 15：注册 / 首次租车前确认**
- 页面增加保险免责声明
- 必须勾选后才能继续
- 保存 `insuranceAcknowledged = true`

---

### 模块六：还车自动触发损坏反馈

**Step 16：还车检查表单**
- 还车最后一步增加问题：
  - “Is the scooter intact?”
- 若选择 `No`：
  - 自动调用 `POST /api/feedbacks`
  - 自动填充：
    - `category = DAMAGE`
    - `priority = HIGH`
    - `bookingId`、`scooterId`

---

## 执行顺序建议（按依赖）

| 顺序 | 模块 | 说明 |
|------|------|------|
| 1 | Step 1–4 | Feedback 基础能力 |
| 2 | Step 5–7 | Manager 管理（包含损坏类型标记） |
| 3 | Step 8–10 | 高优先级视图 |
| 4 | Step 14–15 | 保险确认 |
| 5 | Step 16 | 还车触发反馈 |

**注意**：模块四（电量计费）已取消，不再执行。

