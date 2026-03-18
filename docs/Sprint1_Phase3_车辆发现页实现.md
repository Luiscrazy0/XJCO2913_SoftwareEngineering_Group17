下面是基于你提供的阶段3文档，我帮你整理成**Agent可读 + 保留配色 + 交互状态完整**版本，结构紧凑，可直接用于后续开发参考：

---

# Sprint 1 - 阶段3：车辆发现页（ScooterListPage）Agent版

## 一、阶段目标

实现用户可浏览可租用滑板车列表，为预约提供入口：

* 页面展示 AVAILABLE 状态车辆
* 集成 GET /scooters
* 使用 TanStack Query 管理状态
* 提供 Book 按钮触发预约

---

## 二、数据流与状态

```text
ScooterListPage
    ↓
useQuery(GET /scooters)
    ↓
data (全量车辆)
    ↓
filter(status='AVAILABLE')
    ↓
渲染 ScooterCard 网格
    ↓
Book 点击 → 预约弹窗/流程
```

### 状态机（页面级）

| 状态      | 表现                 |
| ------- | ------------------ |
| loading | Skeleton / Spinner |
| error   | 红色错误提示             |
| empty   | 灰色提示 “No scooters” |
| success | 渲染网格卡片             |

---

## 三、核心模块

### 1. ScooterListPage

* 页面布局：Navbar + Header + 统计信息 + 车辆网格
* 数据加载状态显示（loading/error/empty/success）
* 网格布局展示 ScooterCard
* 统计可用车辆数量（绿色强调）

### 2. ScooterCard

* 内容：Scooter ID / Location / Status / Book按钮
* 仅展示 AVAILABLE 状态车辆
* 样式区分状态（标签颜色 + 卡片边框）
* Book按钮触发预约事件
* Hover 增加阴影和边框高亮（提升可点击感）

### 3. API集成

* scooterApi.ts 封装 GET /scooters
* TanStack Query useQuery 管理请求状态
* 自动缓存 + 错误处理
* 可扩展状态过滤（IN_USE / LOW_BATTERY / FAULT）

---

## 四、UI颜色设计（保留前阶段规范）

### 页面背景与层级

| 元素   | HEX     | 说明    |
| ---- | ------- | ----- |
| 页面背景 | #F8FAFC | 整体底色  |
| 内容区块 | #F1F5F9 | 信息分层  |
| 卡片背景 | #FFFFFF | 主操作区域 |

### 顶部标题 & 统计

| 元素   | HEX     |
| ---- | ------- |
| 标题   | #0F172A |
| 描述   | #64748B |
| 数量   | #22C55E |
| 标签文字 | #334155 |

### ScooterCard 核心样式

| 属性         | HEX              |
| ---------- | ---------------- |
| 背景         | #FFFFFF          |
| 边框         | #E2E8F0          |
| Hover边框    | #CBD5F1          |
| 阴影         | rgba(0,0,0,0.08) |
| Scooter ID | #0F172A          |
| Location   | #334155          |
| 辅助信息       | #64748B          |

### 状态标签（AVAILABLE）

| 元素        | 背景      | 文本      |
| --------- | ------- | ------- |
| AVAILABLE | #DCFCE7 | #16A34A |

> 后续状态可扩展：
> IN_USE → #3B82F6, LOW_BATTERY → #FACC15, FAULT → #EF4444

### Book按钮（CTA）

| 状态       | 背景      | 文本      |
| -------- | ------- | ------- |
| default  | #22C55E | #FFFFFF |
| hover    | #16A34A | #FFFFFF |
| active   | #15803D | #FFFFFF |
| disabled | #86EFAC | #FFFFFF |

### 页面状态颜色

| 状态      | Spinner / 提示      |
| ------- | ----------------- |
| loading | #3B82F6           |
| error   | #EF4444 / #334155 |
| empty   | #94A3B8 / #64748B |

### Dark Mode

| 元素          | HEX     |
| ----------- | ------- |
| 页面背景        | #0F172A |
| 卡片          | #1E293B |
| 边框          | #334155 |
| 文字          | #F1F5F9 |
| AVAILABLE标签 | #22C55E |

---

## 五、交互设计

* 页面初始 → loading skeleton
* 数据成功 → 渲染卡片网格
* Book按钮点击 → 调用预约弹窗 / 传递 scooterId
* 卡片 Hover → 阴影增强，边框高亮
* 状态提示清晰（loading / error / empty）
* 响应式布局，网格自适应屏幕宽度

---

## 六、组件结构建议（React）

```tsx
<ScooterListPage>
  <Navbar />
  <Header />
  <Stats />  // 可用车辆数量
  <ScooterGrid>
    <ScooterCard />
  </ScooterGrid>
</ScooterListPage>
```

* ScooterCard 仅渲染 AVAILABLE 状态车辆
* Book按钮状态映射到颜色 Token
* TanStack Query 管理所有 API 请求

---

## 七、完成度判断（Agent可用）

必须完成：

* GET /scooters API 集成
* 车辆过滤显示
* Book按钮触发事件
* 页面 loading/error/empty/success 状态显示
* 颜色体系完全保留（绿色强调可用 + CTA）

可延后：

* 动画效果 / skeleton美化
* 预约弹窗具体实现
* 车辆状态扩展标签（IN_USE / LOW_BATTERY / FAULT）

---
