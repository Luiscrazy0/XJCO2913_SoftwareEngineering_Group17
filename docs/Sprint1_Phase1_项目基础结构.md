下面是**重构后的阶段性开发文档（面向Agent）**，已做三件事：
1）压缩冗余实现细节（代码保留关键结构）
2）补充**交互设计（Interaction Design）**
3）强化**工程语义 + 可执行性（Agent可读）**

---

# Sprint 1 - 阶段1：前端基础架构（Agent版）

## 一、阶段目标（Goal）

构建前端最小可运行骨架，完成以下核心能力：

* 路由系统（含权限占位）
* API通信基础（带token注入）
* 全局状态基础（React Query）
* 页面结构占位（为后续业务铺路）

---

## 二、系统结构（Architecture Overview）

### 前端分层

```
pages/          // 页面级（路由入口）
components/     // UI组件（无业务 or 弱业务）
api/            // API封装（按领域划分）
utils/          // 基础设施（axios client等）
context/        // 全局状态（Auth等）
router/         // 路由配置
```

### 核心依赖

* react-router-dom → 路由控制
* @tanstack/react-query → 服务端状态管理
* axios → HTTP通信

---

## 三、核心实现（Minimal Implementation）

### 1. API Client（基础设施层）

职责：

* baseURL统一
* 自动注入token
* 统一错误处理（401跳转登录）

关键设计点：

* token来源：localStorage（后续可替换为memory + refresh token）
* 错误策略：集中处理（避免散落在业务层）

---

### 2. 路由系统（Router Layer）

路由结构：

```
/login (public)
/scooters (auth)
/my-bookings (auth)
/admin (auth + role=MANAGER)
```

关键设计：

* ProtectedRoute（当前为stub）
* role-based access（预留扩展）

---

### 3. React Query（数据层）

全局策略：

* retry: 1（避免过度重试）
* 禁用窗口聚焦刷新（减少干扰）

设计意图：

* 区分「服务器状态」 vs 「UI状态」
* 后续所有API必须通过query/mutation

---

### 4. API类型系统（Type Layer）

核心实体：

* User
* Scooter
* Booking

设计原则：

* 与后端DTO 1:1对齐
* 所有API必须返回typed data

---

### 5. 占位组件（Scaffold）

当前为占位：

* ProtectedRoute（未实现权限逻辑）
* Navbar（无交互）

目的：

* 保证路由闭环
* 为后续UI阶段预留挂载点

---

## 四、交互设计（Interaction Design）

这是本阶段新增重点（Agent需要理解“未来会怎么交互”）

### 1. 路由级交互流

```
未登录用户：
  访问任意页面 → 重定向 /login

登录成功：
  → /scooters（默认落点）

访问 /admin：
  - MANAGER → 允许
  - CUSTOMER → 拒绝（后续：toast + redirect）
```

---

### 2. 认证交互（当前未实现，仅定义行为）

状态机（简化）：

```
UNAUTHENTICATED
  → login()
AUTHENTICATED
  → token过期 → UNAUTHENTICATED
```

交互细节：

* 登录成功：

  * 保存 token + user
  * 跳转 scooters
* 401错误：

  * 清空状态
  * 强制跳转 login

---

### 3. API交互模式（统一范式）

所有请求遵循：

```
UI → React Query → API Layer → axios client
```

错误处理：

* 网络错误 → UI提示（后续）
* 401 → 全局拦截
* 业务错误 → mutation返回

---

### 4. 页面级交互（当前占位）

| 页面              | 当前状态 | 未来交互              |
| --------------- | ---- | ----------------- |
| AuthPage        | 占位   | 登录/注册切换           |
| ScooterListPage | 占位   | 列表 + 筛选 + booking |
| MyBookingsPage  | 占位   | 历史订单              |
| AdminFleetPage  | 占位   | CRUD车辆            |

---

## 五、当前完成度（Agent可判断）

### 已完成

* 前端可运行（Vite）
* 路由系统闭环
* API基础设施（axios + interceptor）
* React Query接入
* 类型定义（核心领域模型）

### 未完成（但已设计）

* AuthContext实现
* ProtectedRoute逻辑
* UI交互
* API具体业务调用

---

## 六、关键设计决策（Why）

### 1. React Query优先

原因：

* 避免手写loading/error状态
* 自动缓存 & 请求去重
* 更适合CRUD系统

---

### 2. API层独立

避免：

```
Component → axios（反模式）
```

改为：

```
Component → api/* → axios
```

收益：

* 可测试
* 可替换（mock / backend切换）

---

### 3. 提前定义类型

目的：

* 降低前后端错位风险
* 提升开发速度（自动补全）

---

## 七、风险与技术债（Important）

### 1. Auth设计过于简化

当前问题：

* token存localStorage（有安全风险）
* 无refresh机制

后续：

* refresh token
* httpOnly cookie（如果后端支持）

---

### 2. Router中重复QueryClient（潜在问题）

你现在有：

* main.tsx 已包一层
* AppRouter 又包一层 ❌

需要统一（否则cache失效）

---

### 3. ProtectedRoute为空实现

影响：

* 实际无权限控制
* admin页面可被访问

---

## 八、下一阶段输入（Stage 2）

Agent下一步应做：

### 核心任务：认证系统落地

优先级顺序：

1. AuthContext（状态管理）
2. ProtectedRoute（权限控制）
3. AuthPage（登录/注册UI）
4. 登录流程（token持久化）

---

## 九、一句话总结（给Agent）

当前阶段 = **搭好了“前端操作系统”，但还没有“应用逻辑”**

下一阶段 = **让系统“活起来”（Auth + API真实调用）**

