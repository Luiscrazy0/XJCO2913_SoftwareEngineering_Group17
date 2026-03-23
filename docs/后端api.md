基于我对后端代码的详细分析，现在为您总结API文档：

# 电动车租赁系统API文档

## 概述
基于NestJS构建的电动车租赁系统后端API，使用PostgreSQL数据库，支持JWT认证和CORS。

## 基础信息
- **基础URL**: `http://localhost:3000`
- **API文档**: `http://localhost:3000/api` (Swagger UI)
- **CORS配置**: 允许Vite开发服务器（端口5100-5199）

## 认证模块 (Auth)

### 1. 用户注册
**端点**: `POST /auth/register`

**请求体 (RegisterDto)**:
```typescript
{
  email: string;     // 邮箱地址，必须符合邮箱格式
  password: string;  // 密码，至少6个字符
}
```

**响应**:
```typescript
{
  id: string;        // 用户ID
  email: string;     // 用户邮箱
}
```

**错误**:
- `400 Bad Request`: 邮箱已存在

### 2. 用户登录
**端点**: `POST /auth/login`

**请求体 (LoginDto)**:
```typescript
{
  email: string;     // 邮箱地址
  password: string;  // 密码
}
```

**响应**:
```typescript
{
  access_token: string;  // JWT令牌
}
```

**错误**:
- `400 Bad Request`: 无效的凭据

## 用户模块 (Users)

### 1. 获取所有用户
**端点**: `GET /users`

**权限**: 需要认证

**响应**:
```typescript
Array<{
  id: string;
  email: string;
  role: 'CUSTOMER' | 'MANAGER';
}>
```

## 电动车模块 (Scooters)

### 1. 获取所有电动车
**端点**: `GET /scooters`

**响应**:
```typescript
Array<{
  id: string;
  location: string;
  status: 'AVAILABLE' | 'UNAVAILABLE';
}>
```

### 2. 获取单个电动车
**端点**: `GET /scooters/:id`

**参数**:
- `id`: 电动车ID (UUID)

**响应**:
```typescript
{
  id: string;
  location: string;
  status: 'AVAILABLE' | 'UNAVAILABLE';
}
```

### 3. 创建电动车
**端点**: `POST /scooters`

**权限**: 需要管理员权限

**请求体 (CreateScooterDto)**:
```typescript
{
  location: string;  // 位置描述，不能为空
}
```

**响应**: 创建的电动车对象

### 4. 更新电动车状态
**端点**: `PATCH /scooters/:id/status`

**权限**: 需要管理员权限

**请求体 (UpdateScooterStatusDto)**:
```typescript
{
  status: 'AVAILABLE' | 'UNAVAILABLE';
}
```

**响应**: 更新后的电动车对象

## 预约模块 (Bookings)

### 1. 获取所有预约
**端点**: `GET /bookings`

**权限**: 需要认证

**响应**:
```typescript
Array<{
  id: string;
  userId: string;
  scooterId: string;
  hireType: 'HOUR_1' | 'HOUR_4' | 'DAY_1' | 'WEEK_1';
  startTime: string;    // ISO日期字符串
  endTime: string;      // ISO日期字符串
  status: 'PENDING_PAYMENT' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  totalCost: number;
  user: User;           // 关联的用户信息
  scooter: Scooter;     // 关联的电动车信息
}>
```

### 2. 获取单个预约
**端点**: `GET /bookings/:id`

**权限**: 需要认证

**响应**: 包含用户、电动车和支付信息的完整预约对象

### 3. 创建预约
**端点**: `POST /bookings`

**权限**: 需要认证

**请求体 (CreateBookingDto)**:
```typescript
{
  userId: string;      // 用户ID (UUID)
  scooterId: string;   // 电动车ID (UUID)
  hireType: 'HOUR_1' | 'HOUR_4' | 'DAY_1' | 'WEEK_1';
  startTime: string;   // ISO日期字符串
  endTime: string;     // ISO日期字符串
}
```

**业务逻辑**:
- 检查电动车是否存在且可用
- 根据租赁类型计算费用：
  - `HOUR_1`: £5
  - `HOUR_4`: £15
  - `DAY_1`: £40
  - `WEEK_1`: £200
- 创建状态为`PENDING_PAYMENT`的预约

**错误**:
- `400 Bad Request`: 电动车不存在或不可用

### 4. 取消预约
**端点**: `PATCH /bookings/:id/cancel`

**权限**: 需要认证

**响应**: 更新后的预约对象（状态改为`CANCELLED`）

## 支付模块 (Payments)

### 1. 创建支付
**端点**: `POST /payments`

**权限**: 需要认证

**请求体 (CreatePaymentDto)**:
```typescript
{
  bookingId: string;  // 预约ID (UUID)
  amount: number;     // 支付金额，必须大于等于0
}
```

**业务逻辑**:
- 检查预约是否存在且状态为`PENDING_PAYMENT`
- 创建支付记录（状态为`SUCCESS`）
- 更新预约状态为`CONFIRMED`

**错误**:
- `400 Bad Request`: 预约不存在或无法支付

### 2. 根据预约ID获取支付信息
**端点**: `GET /payments/:bookingId`

**权限**: 需要认证

**响应**: 包含预约信息的支付对象

## 健康检查模块 (Health)

### 1. 健康检查
**端点**: `GET /health`

**响应**: 空响应（200 OK表示服务正常）

## 数据模型

### 枚举类型

**用户角色 (Role)**:
- `CUSTOMER`: 普通用户
- `MANAGER`: 管理员

**电动车状态 (ScooterStatus)**:
- `AVAILABLE`: 可用
- `UNAVAILABLE`: 不可用

**预约状态 (BookingStatus)**:
- `PENDING_PAYMENT`: 待支付
- `CONFIRMED`: 已确认
- `CANCELLED`: 已取消
- `COMPLETED`: 已完成

**租赁类型 (HireType)**:
- `HOUR_1`: 1小时
- `HOUR_4`: 4小时
- `DAY_1`: 1天
- `WEEK_1`: 1周

## 认证机制

### JWT令牌
- 登录成功后返回`access_token`
- 需要在后续请求的`Authorization`头中携带：`Bearer <token>`

### 密码安全
- 使用bcrypt进行密码哈希（10轮盐值）
- 密码最小长度：6个字符

## 数据验证
- 使用class-validator进行请求体验证
- 全局验证管道配置：
  - `whitelist: true`: 自动删除多余字段
  - `forbidNonWhitelisted: true`: 多余字段直接报错
  - `transform: true`: 自动类型转换

## 错误处理
- 统一的错误响应格式
- 详细的错误信息
- HTTP状态码对应业务逻辑

## 数据库模型关系
```
User (1) ↔ (n) Booking (1) ↔ (1) Scooter
Booking (1) ↔ (1) Payment
```