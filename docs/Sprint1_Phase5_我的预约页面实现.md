下面是阶段5“我的预约页面”整理后的颜色与状态体系总结版，保持你之前的设计逻辑，同时把重点放在数据密集型 UI 上，便于直接开发和文档使用：

---

# Sprint 1 - 阶段5：我的预约页面（MyBookingsPage）概览

## 一、阶段目标

实现用户侧预约记录查看：

* 显示所有预约订单
* 区分不同预约状态
* 提供加载、空、错误状态反馈
* 保持信息密集但可读

---

## 二、数据流与状态

```text
页面加载 → useQuery(GET /bookings)
  ↓
isLoading → Skeleton / Spinner
isSuccess → 渲染 BookingCard 列表
  ↓
状态标签：PENDING / CONFIRMED / CANCELLED / COMPLETED
isError → 显示错误提示 + 重试按钮
```

---

## 三、组件结构建议（React）

```tsx
<MyBookingsPage>
  <Navbar />

  <Header />         // 页面标题 + 描述
  <Stats />          // 总预约数 + 状态统计

  <BookingList>
    <BookingCard />  // 单条预约展示
  </BookingList>
</MyBookingsPage>
```

---

## 四、UI颜色设计（保留配色体系）

### 1️⃣ 页面背景与层级

| 区域   | HEX     |
| ---- | ------- |
| 页面背景 | #F8FAFC |
| 内容区块 | #F1F5F9 |
| 卡片背景 | #FFFFFF |

---

### 2️⃣ 页面标题与说明

| 元素   | HEX     |
| ---- | ------- |
| 标题   | #0F172A |
| 描述文本 | #64748B |

---

### 3️⃣ 统计信息区（Dashboard风格）

| 状态        | 背景/颜色   |
| --------- | ------- |
| 总预约数      | #0F172A |
| CONFIRMED | #22C55E |
| PENDING   | #F59E0B |
| COMPLETED | #64748B |

---

### 4️⃣ BookingCard 核心样式

| 属性         | HEX / 描述         |
| ---------- | ---------------- |
| 背景         | #FFFFFF          |
| 边框         | #E2E8F0          |
| Hover边框    | #CBD5F1          |
| 阴影         | rgba(0,0,0,0.06) |
| Booking ID | #0F172A          |
| Scooter ID | #334155          |
| 时间信息       | #334155          |
| 辅助说明       | #64748B          |
| Total Cost | #2563EB          |

---

### 5️⃣ 预约状态标签

| 状态        | 背景      | 文字      |
| --------- | ------- | ------- |
| PENDING   | #FEF3C7 | #92400E |
| CONFIRMED | #DCFCE7 | #166534 |
| CANCELLED | #FEE2E2 | #7F1D1D |
| COMPLETED | #E2E8F0 | #334155 |

> 原则：浅背景 + 深文字，状态仅用于标签，不扩散到卡片

---

### 6️⃣ 列表布局与交互

| 属性      | 值                 |
| ------- | ----------------- |
| 卡片间距    | 16px              |
| 卡片内边距   | 16–20px           |
| Hover效果 | 阴影增强 + 边框 #CBD5F1 |

---

### 7️⃣ 时间信息显示

| 类型               | 颜色      |
| ---------------- | ------- |
| Start / End Time | #334155 |
| 相对时间             | #64748B |

---

### 8️⃣ 页面状态（加载 / 空 / 错误）

| 状态      | 元素       | 颜色      |
| ------- | -------- | ------- |
| Loading | Skeleton | #E2E8F0 |
| Loading | Spinner  | #3B82F6 |
| Empty   | 图标       | #94A3B8 |
| Empty   | 文本       | #64748B |
| Error   | 图标       | #EF4444 |
| Error   | 文本       | #334155 |
| Error   | 按钮       | #3B82F6 |

---

### 9️⃣ 可选功能区（筛选 / 排序）

| 元素   | 背景 / 文本                              |
| ---- | ------------------------------------ |
| 筛选按钮 | 默认 #F1F5F9 / 选中 #DCFCE7 / 文字 #334155 |
| 排序按钮 | 默认 #E2E8F0 / Hover #CBD5F1           |

---

### 🔟 Dark Mode

| 元素   | HEX                   |
| ---- | --------------------- |
| 页面背景 | #0F172A               |
| 卡片背景 | #1E293B               |
| 主文字  | #F1F5F9               |
| 次文字  | #CBD5F5               |
| 状态标签 | 保持语义绿色/黄色/红色/灰色，降低透明度 |

---

## 十一、前端实现建议

### CSS Token

```css
--booking-pending-bg: #FEF3C7;
--booking-confirmed-bg: #DCFCE7;
--booking-cancelled-bg: #FEE2E2;
--booking-completed-bg: #E2E8F0;

--booking-price: #2563EB;
```

### 状态样式控制示例

```tsx
switch (booking.status) {
  case 'CONFIRMED': return greenStyle;
  case 'PENDING': return yellowStyle;
  case 'CANCELLED': return redStyle;
  case 'COMPLETED': return grayStyle;
}
```

---

## 十二、页面视觉优先级

```
1️⃣ 状态标签（核心）
2️⃣ Booking ID
3️⃣ 时间信息
4️⃣ Total Cost
```

用户行为路径：**扫状态 → 看时间 → 判断订单**

---

## 总结

我的预约页面颜色设计原则：

* 多状态标签系统为核心
* 浅背景 + 高语义标签
* 信息优先于操作

构建高信息密度、易理解、可扩展的数据页面。

下一步 → 阶段6：登出与 Token 管理。
