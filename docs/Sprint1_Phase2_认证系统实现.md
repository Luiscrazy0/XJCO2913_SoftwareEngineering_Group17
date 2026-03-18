明白了，你希望在阶段性文档中**保留当前认证页的配色体系**，同时保留Agent可读的结构化内容。我帮你把阶段2文档整理成**完整Agent版 + 原配色保留**，并附上交互状态和Token映射。

---

# Sprint 1 - 阶段2：认证系统（Agent版 + 保留配色）

## 一、阶段目标

建立系统认证闭环，使前端具备：

* 用户注册/登录功能
* 全局认证状态（AuthContext）
* 路由访问控制（ProtectedRoute）
* 页面级交互（表单 + 校验 + 跳转）
* 认证页面 UI 配色和状态逻辑完整保留

---

## 二、系统结构

### 数据流

```text
AuthPage (UI) 
   ↓
AuthContext (state + actions)
   ↓
authApi (domain layer)
   ↓
apiClient (axios)
```

### 状态模型

```text
AuthState:
- user: { id, email, role } | null
- token: string | null
- isAuthenticated: boolean
```

### 状态机

```text
UNAUTHENTICATED
  → login/register
AUTHENTICATED
  → logout
  → token失效 → UNAUTHENTICATED
```

---

## 三、核心模块

### 1. AuthContext

职责：

* 管理用户状态 + token
* 提供 login / register / logout
* 初始化时从 localStorage 恢复状态

行为：

```text
login():
  → 调用 API
  → 保存 token + user
  → 更新 state
  → 路由跳转

logout():
  → 清空 localStorage
  → 更新 state
  → redirect /login
```

---

### 2. AuthPage 结构

```tsx
<AuthPage>
  <AuthCard>
    <AuthTabs />   // 登录/注册
    <AuthForm />   // 表单
    <AuthActions />// 提交/辅助链接
  </AuthCard>
</AuthPage>
```

---

### 3. 表单校验

#### Login

* email、password

#### Register

* email、password、confirmPassword

规则：

* email → 包含 @ 和 .
* password → ≥6位
* confirmPassword → 与 password 一致
* 错误提示实时显示

---

### 4. API集成

调用：

* POST /auth/login
* POST /auth/register

响应处理：

* 成功 → 保存 token + user，跳转对应页面
* 失败 → 表单显示错误信息

---

### 5. ProtectedRoute

逻辑：

```text
if (!token):
  redirect /login
if (requiredRole && user.role !== requiredRole):
  redirect /scooters
```

---

### 6. 路由跳转

```text
login success:

CUSTOMER → /scooters
MANAGER → /admin
```

---

## 四、交互设计

### 页面级流程

```text
访问 AuthPage → 默认 Login Tab
输入表单 → 点击提交
  ↓
成功 → 跳转
失败 → 错误提示
```

### Tab切换

* 点击 Register/ Login
* 清空错误提示
* 高亮当前 Tab

### 输入框状态

| 状态      | 表现                                         |
| ------- | ------------------------------------------ |
| default | border #E2E8F0, text #0F172A               |
| focus   | border #22C55E, shadow rgba(34,197,94,0.2) |
| error   | border #EF4444, text #EF4444               |

### 按钮状态

| 状态       | 背景      | 文本      |
| -------- | ------- | ------- |
| default  | #22C55E | #FFFFFF |
| hover    | #16A34A | #FFFFFF |
| active   | #15803D | #FFFFFF |
| disabled | #86EFAC | #FFFFFF |

### 链接/辅助操作

| 类型 | 颜色      | hover   |
| -- | ------- | ------- |
| 链接 | #3B82F6 | #2563EB |

### 状态提示

| 类型 | 颜色      | 场景      |
| -- | ------- | ------- |
| 错误 | #EF4444 | 邮箱/密码错误 |
| 警告 | #F59E0B | 密码弱     |
| 成功 | #10B981 | 注册成功    |
| 信息 | #3B82F6 | 提示文本    |

### Dark Mode

| 元素        | 背景/文字   |
| --------- | ------- |
| 页面背景      | #0F172A |
| 卡片        | #1E293B |
| 主文字       | #F1F5F9 |
| 次文字       | #CBD5F5 |
| 输入框背景     | #1E293B |
| 输入框边框     | #334155 |
| 输入框 focus | #22C55E |

---

## 五、UI颜色 Token（工程化）

```css
/* Card */
--auth-card-bg: #FFFFFF;

/* Tabs */
--auth-tab-active: #22C55E;
--auth-tab-inactive: #64748B;
--auth-tab-hover: #16A34A;

/* Input */
--auth-input-bg: #FFFFFF;
--auth-input-border: #E2E8F0;
--auth-input-text: #0F172A;
--auth-input-placeholder: #94A3B8;
--auth-input-focus: #22C55E;
--auth-input-error: #EF4444;

/* Button */
--auth-button-primary: #22C55E;
--auth-button-primary-hover: #16A34A;
--auth-button-primary-active: #15803D;
--auth-button-disabled: #86EFAC;
--auth-button-text: #FFFFFF;

/* Links / info */
--auth-link: #3B82F6;
--auth-link-hover: #2563EB;
--auth-error: #EF4444;
--auth-warning: #F59E0B;
--auth-success: #10B981;
--auth-info: #3B82F6;

/* Dark Mode */
--auth-bg-dark: #0F172A;
--auth-card-dark: #1E293B;
--auth-text-main-dark: #F1F5F9;
--auth-text-secondary-dark: #CBD5F5;
--auth-input-bg-dark: #1E293B;
--auth-input-border-dark: #334155;
--auth-input-focus-dark: #22C55E;
```

---

## 六、完成度判断（Agent可用）

### 已完成

* AuthContext + 状态持久化
* 登录/注册 API 成功
* token存储
* ProtectedRoute 路由跳转逻辑
* 表单校验 + 错误提示
* UI颜色体系完整保留

### 待优化

* toast 弹窗
* react-hook-form 表单库
* 多标签 token 同步
* UI细节（动画/加载 spinner）

---

## 七、下一阶段（阶段3：车辆发现页）

核心：

```text
GET /scooters
→ 列表展示
→ 状态筛选
→ booking入口
```

> 阶段2 = **系统“知道你是谁”** + **认证页面配色完整**
> 阶段3 = **系统“展示可用车辆”并允许操作**
