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

### 1. AuthContext（已完成）
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

### 2. AuthPage 结构（待实现）
```tsx
<AuthPage>
<AuthCard>
<AuthTabs />   // 登录/注册
<AuthForm />   // 表单
<AuthActions />// 提交/辅助链接
</AuthCard>
</AuthPage>
```

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

### 4. API集成（需适配后端）
后端实际返回：
* 登录：`{ "access_token": "token" }`
* 注册：`{ "id": "...", "email": "..." }`

前端适配策略：
1. 修改API响应处理逻辑
2. 调整类型定义匹配后端
3. 注册时不需要name字段

### 5. ProtectedRoute（已完成）
逻辑：
```text
if (!token):
redirect /login
if (requiredRole && user.role !== requiredRole):
redirect /scooters
```

### 6. 路由跳转
```text
login success:
CUSTOMER → /scooters
MANAGER → /admin
```

---
## 四、前后端适配方案

### 问题识别
1. **API响应格式不匹配**
   - 后端：直接返回数据对象
   - 前端：期望 `{ success, data, message }` 包装

2. **数据结构不匹配**
   - 后端User：`id, email, passwordHash, role`
   - 前端User：期望 `id, email, name, role, createdAt, updatedAt`

3. **注册请求不匹配**
   - 后端：只需要 `email, password`
   - 前端：期望 `email, password, name`

### 适配策略（前端调整）
1. **修改API响应处理**
   - 移除 `ApiResponse<T>` 包装层
   - 直接处理后端返回的原始数据

2. **调整User类型**
   - 移除 `name` 字段（后端没有）
   - 移除 `createdAt/updatedAt`（后端没有）
   - 只保留 `id, email, role`

3. **修改注册请求**
   - 移除 `name` 字段
   - 只发送 `email, password`

---
## 五、实施步骤

### 步骤1：修复类型定义
```typescript
// 修改 frontend/src/types/index.ts
export interface User {
  id: string
  email: string
  role: UserRole
  // 移除 name, createdAt, updatedAt
}

export interface RegisterRequest {
  email: string
  password: string
  // 移除 name 字段
}
```

### 步骤2：修改API层
```typescript
// 修改 frontend/src/api/auth.ts
export const authApi = {
  login: async (credentials: LoginRequest): Promise<{ access_token: string }> => {
    const response = await axiosClient.post('/auth/login', credentials)
    return response.data // 直接返回后端数据
  },
  
  register: async (userData: RegisterRequest): Promise<{ id: string, email: string }> => {
    const response = await axiosClient.post('/auth/register', userData)
    return response.data // 直接返回后端数据
  }
}
```

### 步骤3：修改AuthContext
```typescript
// 修改 frontend/src/context/AuthContext.tsx
const login = async (email: string, password: string) => {
  try {
    // 1. 调用登录API
    const { access_token } = await authApi.login({ email, password })
    
    // 2. 解析token获取用户信息
    const payload = JSON.parse(atob(access_token.split('.')[1]))
    const user: User = {
      id: payload.sub,
      email: email,
      role: payload.role
    }
    
    // 3. 保存状态
    setToken(access_token)
    setUser(user)
    localStorage.setItem('auth_token', access_token)
    localStorage.setItem('user', JSON.stringify(user))
    
    // 4. 路由跳转
    if (user.role === 'MANAGER') {
      window.location.href = '/admin'
    } else {
      window.location.href = '/scooters'
    }
  } catch (error) {
    // 错误处理
  }
}
```

### 步骤4：实现AuthPage
实现完整的登录/注册页面，包含：
- 标签页切换（登录/注册）
- 表单验证
- 错误提示
- UI配色体系

---
## 六、UI颜色 Token（工程化）
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
## 七、交互设计

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
## 八、完成度判断（Agent可用）

### 已完成
* AuthContext + 状态持久化 ✅
* ProtectedRoute 路由跳转逻辑 ✅

### 待实现
* 登录/注册 API 适配后端 ✅（需要修改）
* token存储 ✅（已完成）
* 表单校验 + 错误提示
* AuthPage UI实现
* UI颜色体系完整保留

### 待优化
* toast 弹窗
* react-hook-form 表单库
* 多标签 token 同步
* UI细节（动画/加载 spinner）

---
## 九、风险与注意事项

### 1. 前后端数据模型差异
- 后端User没有name字段，前端需要移除
- 后端返回直接数据对象，前端需要移除ApiResponse包装

### 2. Token解析
- JWT token需要解析获取用户信息
- 注意token过期处理

### 3. 错误处理
- 后端返回NestJS默认错误格式
- 前端需要适配错误处理逻辑

---
## 十、实施优先级

1. **高优先级**：修复类型定义和API层（适配后端）
2. **中优先级**：实现AuthPage UI
3. **低优先级**：UI优化和细节完善

---
## 十一、验证标准

1. ✅ 用户可以通过邮箱密码注册
2. ✅ 用户可以通过邮箱密码登录
3. ✅ 登录后token正确保存
4. ✅ 登录后用户信息正确解析
5. ✅ 未登录用户访问受保护页面跳转登录
6. ✅ 不同角色用户跳转到正确页面
7. ✅ UI配色符合设计规范

---
## 十二、下一阶段（阶段3：车辆发现页）

核心：
```text
GET /scooters
→ 列表展示
→ 状态筛选
→ booking入口
```

> 阶段2 = **系统"知道你是谁"** + **认证页面配色完整**
> 阶段3 = **系统"展示可用车辆"并允许操作**