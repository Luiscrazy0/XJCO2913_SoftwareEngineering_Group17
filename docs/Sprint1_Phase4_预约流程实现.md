下面是针对阶段4预约流程的整理版本，保留你原来的配色规范和状态逻辑，同时把关键交互和颜色体系结构化，更方便直接开发参考和文档使用：

---

# Sprint 1 - 阶段4：预约流程（BookingModal）概览

## 一、阶段目标

实现用户预约弹窗，完成核心业务流程：

* 显示选中车辆信息
* 提供 HireType 与 StartTime 选择
* 调用 POST /bookings 创建预约
* 显示状态反馈（loading / success / error）
* 支持取消和关闭弹窗

---

## 二、数据流与状态

```text
ScooterListPage → 点击 Book
    ↓
BookingModal 打开
    ↓
用户选择 HireType + StartTime
    ↓
Confirm Booking → useMutation(POST /bookings)
    ↓
isLoading → spinner + 按钮禁用
isSuccess → 成功提示 + 自动跳转 / 数据刷新
isError → 错误提示
```

### 页面状态

| 状态      | 表现             |
| ------- | -------------- |
| loading | Spinner + 禁用按钮 |
| success | 成功信息 + 背景浅绿    |
| error   | 错误信息 + 背景浅红    |
| idle    | 默认表单状态         |

---

## 三、组件结构建议（React）

```tsx
<BookingModal>
  <ModalHeader />         // 标题 + 关闭按钮
  <ScooterInfo />         // Scooter ID + Location
  <HireTypeSelector />    // 1 Hour, 4 Hours, 1 Day, 1 Week
  <StartTimePicker />     // 日期时间选择器
  <StatusMessage />       // loading / success / error
  <ActionButtons />       // Cancel + Confirm Booking
</BookingModal>
```

---

## 四、UI颜色设计（保留阶段1~3体系）

### 1️⃣ Overlay

| 元素 | HEX                | 说明         |
| -- | ------------------ | ---------- |
| 背景 | rgba(15,23,42,0.6) | 半透明深色，压暗背景 |

### 2️⃣ Modal 内容

| 属性 | HEX              | 说明   |
| -- | ---------------- | ---- |
| 背景 | #FFFFFF          | 弹窗主体 |
| 圆角 | 16px             |      |
| 阴影 | rgba(0,0,0,0.15) |      |
| 边框 | #E2E8F0          | 可选   |

### 3️⃣ 标题与关闭

| 元素     | HEX     | Hover   |
| ------ | ------- | ------- |
| 标题     | #0F172A | -       |
| 关闭按钮 × | #64748B | #0F172A |

### 4️⃣ 车辆信息

| 元素         | HEX     |
| ---------- | ------- |
| Scooter ID | #0F172A |
| Location   | #334155 |
| 标签背景       | #F1F5F9 |

### 5️⃣ HireType 选择按钮组

| 状态    | 背景      | 边框      | 文本      |
| ----- | ------- | ------- | ------- |
| 默认    | #F1F5F9 | #E2E8F0 | #334155 |
| 选中    | #DCFCE7 | #22C55E | #16A34A |
| hover | -       | #CBD5F1 | -       |

### 6️⃣ StartTime 输入框

| 状态    | 背景      | 边框      | 文本      | 占位符     |
| ----- | ------- | ------- | ------- | ------- |
| 默认    | #FFFFFF | #E2E8F0 | #0F172A | #94A3B8 |
| focus | #FFFFFF | #22C55E | #0F172A | #94A3B8 |
| 错误    | #FFFFFF | #EF4444 | #0F172A | #94A3B8 |

### 7️⃣ 操作按钮

| 类型                 | 默认                | Hover   | Active  | Disabled |
| ------------------ | ----------------- | ------- | ------- | -------- |
| Cancel（次级）         | #E2E8F0           | #CBD5F1 | -       | -        |
| Confirm Booking（主） | #22C55E           | #16A34A | #15803D | #86EFAC  |
| 文本颜色               | #FFFFFF / #334155 | -       | -       | -        |

### 8️⃣ 状态提示

| 状态      | 背景      | 图标/文字颜色           |
| ------- | ------- | ----------------- |
| Loading | -       | #3B82F6           |
| Success | #DCFCE7 | #10B981 / #065F46 |
| Error   | #FEE2E2 | #EF4444 / #7F1D1D |

---

## 五、视觉优先级

```
1️⃣ Confirm Booking按钮（绿色）
2️⃣ HireType选中项（浅绿）
3️⃣ 输入焦点（绿色边框）
4️⃣ 错误提示（红色）
```

---

## 六、Dark Mode

| 元素         | HEX                         |
| ---------- | --------------------------- |
| Overlay    | rgba(0,0,0,0.7)             |
| Modal      | #1E293B                     |
| 主文字        | #F1F5F9                     |
| 次文字        | #CBD5F5                     |
| 输入框边框      | #475569                     |
| 输入框焦点      | #22C55E                     |
| HireType选中 | #DCFCE7 / #22C55E / #16A34A |
| Confirm按钮  | #22C55E                     |

---

## 七、前端实现建议

* 使用 TanStack useMutation 管理 POST /bookings
* isLoading → 禁用按钮 + 显示 Spinner
* isSuccess → 显示成功信息 + 3秒跳转 / 数据刷新
* isError → 显示错误提示

CSS Token 建议：

```css
--modal-overlay: rgba(15,23,42,0.6);
--modal-bg: #FFFFFF;
--hiretype-selected-bg: #DCFCE7;
--hiretype-selected-border: #22C55E;
--booking-success-bg: #DCFCE7;
--booking-error-bg: #FEE2E2;
```

---

## 八、总结

预约弹窗颜色设计遵循：

* **绿色：主操作（唯一CTA）**
* **浅绿：选择状态（HireType）**
* **红色：错误反馈**
* **蓝色：加载状态**

通过 Overlay、状态颜色分层、操作按钮聚焦，构建高专注、低干扰、强引导的流程型 UI。

下一步 → 阶段5：我的预约页面实现。
