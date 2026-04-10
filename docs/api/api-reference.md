# API参考文档

## 概述
基于NestJS构建的电动车租赁系统后端API，使用PostgreSQL数据库，支持JWT认证和CORS。

## 基础信息
- **基础URL**: `http://localhost:3000`
- **API文档**: `http://localhost:3000/api` (Swagger UI)
- **CORS配置**: 允许Vite开发服务器（端口5100-5199）

## 认证模块 (Auth)

### 用户注册
**端点**: `POST /auth/register`

**请求体**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**响应**:
```json
{
  "id": "clx1234567890",
  "email": "user@example.com"
}
```

### 用户登录
**端点**: `POST /auth/login`

**请求体**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**响应**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## 电动车模块 (Scooters)

### 获取所有电动车
**端点**: `GET /scooters`

**响应**:
```json
[
  {
    "id": "scooter-123",
    "location": "市中心广场",
    "status": "AVAILABLE"
  }
]
```

### 创建电动车
**端点**: `POST /scooters`

**权限**: 需要管理员权限

**请求体**:
```json
{
  "location": "新位置"
}
```

### 更新电动车状态
**端点**: `PATCH /scooters/:id/status`

**权限**: 需要管理员权限

**请求体**:
```json
{
  "status": "UNAVAILABLE"
}
```

## 预约模块 (Bookings)

### 获取所有预约
**端点**: `GET /bookings`

**权限**: 需要认证

**响应**:
```json
[
  {
    "id": "booking-123",
    "userId": "user-123",
    "scooterId": "scooter-123",
    "hireType": "HOUR_1",
    "startTime": "2024-01-01T10:00:00.000Z",
    "endTime": "2024-01-01T11:00:00.000Z",
    "status": "CONFIRMED",
    "totalCost": 5.0
  }
]
```

### 创建预约
**端点**: `POST /bookings`

**权限**: 需要认证

**请求体**:
```json
{
  "userId": "user-123",
  "scooterId": "scooter-123",
  "hireType": "HOUR_1",
  "startTime": "2024-01-01T10:00:00.000Z",
  "endTime": "2024-01-01T11:00:00.000Z"
}
```

### 续租预约
**端点**: `PATCH /bookings/:id/extend`

**权限**: 需要认证

**请求体**:
```json
{
  "additionalHours": 2
}
```

### 取消预约
**端点**: `PATCH /bookings/:id/cancel`

**权限**: 需要认证

## 支付模块 (Payments)

### 创建支付
**端点**: `POST /payments`

**权限**: 需要认证

**请求体**:
```json
{
  "bookingId": "booking-123",
  "amount": 5.0
}
```

## 站点模块 (Stations)

### 获取所有站点
**端点**: `GET /stations`

**响应**:
```json
[
  {
    "id": "station-123",
    "name": "市中心广场站",
    "address": "市中心广场A区停车场",
    "latitude": 31.2304,
    "longitude": 121.4737
  }
]
```

### 获取有可用车辆的站点
**端点**: `GET /stations/available`

### 获取附近站点
**端点**: `GET /stations/nearby`

**查询参数**:
- `latitude`: 纬度
- `longitude`: 经度
- `radiusKm`: 搜索半径（公里，默认5）

## 数据模型

### 枚举类型
- **用户角色**: `CUSTOMER`, `MANAGER`
- **电动车状态**: `AVAILABLE`, `UNAVAILABLE`, `RENTED`
- **预约状态**: `PENDING_PAYMENT`, `CONFIRMED`, `CANCELLED`, `COMPLETED`, `EXTENDED`
- **租赁类型**: `HOUR_1`, `HOUR_4`, `DAY_1`, `WEEK_1`

## 认证机制
- 使用JWT令牌进行认证
- 在请求头中添加: `Authorization: Bearer <token>`
- 令牌通过登录接口获取

## 错误处理
所有错误响应都遵循统一格式：
```json
{
  "success": false,
  "error": "错误类型",
  "message": "错误描述",
  "statusCode": 400,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/endpoint"
}
```

## 成功响应格式
所有成功响应都遵循统一格式：
```json
{
  "success": true,
  "data": {...},
  "message": "操作成功",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```