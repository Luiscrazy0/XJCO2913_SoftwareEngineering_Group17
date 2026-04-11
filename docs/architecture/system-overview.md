# 系统架构概述

## 架构设计原则

### 1. 分层架构
系统采用清晰的分层架构，确保各层职责明确：
- **表现层**: 用户界面和交互
- **应用层**: 业务逻辑和流程控制
- **领域层**: 核心业务模型和规则
- **基础设施层**: 技术实现和外部服务

### 2. 模块化设计
- 前后端分离架构
- 微服务思想（模块化）
- 高内聚低耦合
- 可独立部署和扩展

### 3. 可扩展性
- 插件化架构设计
- 配置驱动开发
- 支持水平扩展
- 易于集成新功能

## 技术架构图

```
┌─────────────────────────────────────────────────────────────┐
│                       客户端层 (Client Layer)                │
├─────────────────────────────────────────────────────────────┤
│  Web前端 (React)      Mobile App      Admin Dashboard      │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                       API网关层 (API Gateway)                │
├─────────────────────────────────────────────────────────────┤
│          路由分发 │ 负载均衡 │ 认证授权 │ 限流熔断           │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   业务服务层 (Business Services)             │
├──────────────┬──────────────┬──────────────┬──────────────┤
│  用户服务    │  车辆服务    │  预订服务    │  支付服务    │
│  (User)      │  (Scooter)   │  (Booking)   │  (Payment)   │
└──────────────┴──────────────┴──────────────┴──────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   数据访问层 (Data Access Layer)             │
├─────────────────────────────────────────────────────────────┤
│          Prisma ORM │ 数据库连接池 │ 缓存层 (Redis)         │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                      数据存储层 (Data Storage)               │
├─────────────────────────────────────────────────────────────┤
│      PostgreSQL     文件存储      Redis缓存     日志存储     │
└─────────────────────────────────────────────────────────────┘
```

## 前端架构

### 技术栈
- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **状态管理**: React Query + Context API
- **路由**: React Router 6
- **样式**: Tailwind CSS
- **HTTP客户端**: Axios
- **图表**: Recharts
- **地图**: 高德地图API

### 目录结构
```
frontend/
├── src/
│   ├── pages/              # 页面组件
│   │   ├── AuthPage.tsx
│   │   ├── ScooterListPage.tsx
│   │   ├── MyBookingsPage.tsx
│   │   ├── MapPage.tsx
│   │   ├── AdminFleetPage.tsx
│   │   └── AdminRevenuePage.tsx
│   ├── components/         # 可复用组件
│   │   ├── ui/            # 基础UI组件
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   └── Badge.tsx
│   │   ├── Navbar.tsx
│   │   ├── BookingModal.tsx
│   │   └── ScooterCard.tsx
│   ├── api/               # API封装
│   │   ├── auth.ts
│   │   ├── scooters.ts
│   │   ├── bookings.ts
│   │   ├── payments.ts
│   │   └── stations.ts
│   ├── hooks/             # 自定义Hook
│   │   ├── useAuth.ts
│   │   ├── useApiCall.ts
│   │   └── useForm.ts
│   ├── utils/             # 工具函数
│   │   ├── axiosClient.ts
│   │   ├── validators.ts
│   │   └── formatters.ts
│   ├── context/           # 全局状态
│   │   ├── AuthContext.tsx
│   │   └── ToastContext.tsx
│   ├── router/            # 路由配置
│   │   └── AppRouter.tsx
│   ├── types/             # TypeScript类型定义
│   │   └── index.ts
│   └── styles/            # 样式文件
│       └── index.css
├── public/                # 静态资源
└── package.json
```

### 状态管理策略
1. **服务器状态**: 使用React Query管理
2. **UI状态**: 使用React状态和Context API
3. **表单状态**: 使用自定义Hook管理
4. **认证状态**: 使用Context + LocalStorage

## 后端架构

### 技术栈
- **框架**: NestJS + TypeScript
- **数据库**: PostgreSQL + Prisma ORM
- **认证**: JWT + bcrypt
- **API文档**: Swagger/OpenAPI
- **验证**: class-validator
- **日志**: Winston
- **测试**: Jest + Supertest

### 目录结构
```
backend/
├── src/
│   ├── modules/           # 功能模块
│   │   ├── auth/         # 认证模块
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.module.ts
│   │   │   ├── dto/
│   │   │   ├── guards/
│   │   │   └── strategies/
│   │   ├── user/         # 用户模块
│   │   ├── scooter/      # 车辆模块
│   │   ├── booking/      # 预订模块
│   │   ├── payment/      # 支付模块
│   │   ├── station/      # 站点模块
│   │   └── statistics/   # 统计模块
│   ├── prisma/           # 数据库配置
│   │   └── prisma.service.ts
│   ├── common/           # 公共模块
│   │   ├── filters/      # 异常过滤器
│   │   ├── interceptors/ # 响应拦截器
│   │   ├── middleware/   # 中间件
│   │   └── decorators/   # 自定义装饰器
│   ├── config/           # 配置管理
│   │   └── configuration.ts
│   └── main.ts           # 应用入口
├── prisma/               # Prisma配置
│   ├── schema.prisma
│   └── seed.ts
├── test/                 # 测试文件
└── package.json
```

### 模块设计原则
1. **单一职责**: 每个模块只负责一个业务领域
2. **依赖注入**: 使用NestJS的依赖注入容器
3. **接口隔离**: 定义清晰的接口边界
4. **开闭原则**: 易于扩展，无需修改现有代码

## 数据库架构

### 核心实体关系
```
User (1) ── (n) Booking (1) ── (1) Scooter
                    │
                    └── (1) Payment
                    
Scooter (n) ── (1) Station
```

### 数据模型设计
```prisma
// 用户模型
model User {
  id           String   @id @default(uuid())
  email        String   @unique
  passwordHash String
  role         Role     @default(CUSTOMER)
  userType     UserType @default(NORMAL)
  weeklyRentalHours Float @default(0)
  bookings     Booking[]
}

// 车辆模型
model Scooter {
  id          String        @id @default(uuid())
  location    String
  status      ScooterStatus @default(AVAILABLE)
  latitude    Float?
  longitude   Float?
  stationId   String?
  station     Station?      @relation(fields: [stationId], references: [id])
  bookings    Booking[]
  updatedAt   DateTime      @updatedAt
}

// 预订模型
model Booking {
  id              String        @id @default(uuid())
  userId          String
  user            User          @relation(fields: [userId], references: [id])
  scooterId       String
  scooter         Scooter       @relation(fields: [scooterId], references: [id])
  hireType        HireType
  originalEndTime DateTime?     // 原始结束时间（用于续租）
  startTime       DateTime
  endTime         DateTime
  status          BookingStatus @default(PENDING_PAYMENT)
  totalCost       Float
  extensionCount  Int           @default(0)  // 续租次数
  extendedFrom    String?       // 原始预订ID（如果是续租）
  payment         Payment?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
}

// 站点模型
model Station {
  id        String    @id @default(uuid())
  name      String
  address   String
  latitude  Float
  longitude Float
  scooters  Scooter[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}
```

## API设计

### RESTful API原则
1. **资源导向**: 以资源为中心设计API
2. **HTTP方法**: 正确使用GET、POST、PUT、PATCH、DELETE
3. **状态码**: 使用标准的HTTP状态码
4. **版本管理**: API版本控制策略

### 响应格式
```typescript
// 成功响应
{
  success: true,
  data: T,
  message?: string,
  timestamp: string
}

// 错误响应
{
  success: false,
  error: string,
  message?: string,
  statusCode: number,
  timestamp: string,
  path: string
}
```

### 认证和授权
1. **JWT令牌**: Bearer token认证
2. **角色权限**: 基于角色的访问控制
3. **API密钥**: 第三方服务集成
4. **速率限制**: 防止API滥用

## 安全架构

### 认证安全
- JWT令牌过期和刷新机制
- 密码强度策略和加密存储
- 多因素认证支持
- 会话管理安全

### 数据安全
- 传输层加密（HTTPS）
- 数据库字段加密
- 敏感数据脱敏
- 数据备份和恢复

### 应用安全
- 输入验证和过滤
- SQL注入防护
- XSS和CSRF防护
- 安全头部设置

## 部署架构

### 开发环境
```
本地开发机 ── Docker容器 ── PostgreSQL
       │           │
       ├── 前端开发服务器
       └── 后端开发服务器
```

### 生产环境
```
用户请求 ── 负载均衡器 ── 多个应用实例
                     │
                     ├── 数据库集群
                     ├── Redis缓存
                     └── 文件存储
```

### 容器化部署
```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: scooter_rental
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5433:5432"
  
  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/scooter_rental
      JWT_SECRET: ${JWT_SECRET}
    ports:
      - "3000:3000"
    depends_on:
      - postgres
  
  frontend:
    build: ./frontend
    environment:
      VITE_API_BASE_URL: http://localhost:3000
    ports:
      - "5174:5174"
    depends_on:
      - backend

volumes:
  postgres_data:
```

## 监控和日志

### 监控指标
1. **应用性能**: 响应时间、错误率、吞吐量
2. **系统资源**: CPU、内存、磁盘、网络
3. **业务指标**: 用户数、预订数、收入
4. **安全事件**: 登录失败、异常访问

### 日志策略
1. **结构化日志**: JSON格式，便于分析
2. **日志分级**: DEBUG、INFO、WARN、ERROR
3. **日志聚合**: 集中存储和查询
4. **日志轮转**: 自动清理旧日志

## 扩展性设计

### 水平扩展
- 无状态应用设计
- 数据库读写分离
- 缓存层扩展
- 消息队列解耦

### 垂直扩展
- 数据库索引优化
- 查询性能优化
- 代码性能优化
- 资源分配优化

### 功能扩展
- 插件化架构
- 微服务拆分
- 第三方集成
- 自定义模块

## 性能优化

### 前端优化
- 代码分割和懒加载
- 图片和资源优化
- 缓存策略优化
- 渲染性能优化

### 后端优化
- 数据库查询优化
- 缓存策略实施
- 连接池配置
- 异步处理

### 网络优化
- CDN加速
- HTTP/2支持
- 压缩和缓存
- 减少请求数

## 故障恢复

### 高可用设计
- 多实例部署
- 负载均衡
- 故障转移
- 数据备份

### 灾难恢复
- 定期备份
- 恢复演练
- 监控告警
- 应急预案

## 技术选型理由

### 前端选型
- **React**: 生态丰富，社区活跃，性能优秀
- **TypeScript**: 类型安全，提高代码质量
- **Vite**: 开发体验好，构建速度快
- **Tailwind CSS**: 实用性强，开发效率高

### 后端选型
- **NestJS**: 企业级框架，架构清晰，易于维护
- **PostgreSQL**: 功能强大，可靠性高，开源免费
- **Prisma**: 类型安全，开发体验好，迁移方便
- **JWT**: 无状态认证，易于扩展，标准协议

### 基础设施选型
- **Docker**: 环境一致性，易于部署，资源隔离
- **Git**: 版本控制标准，协作方便，分支管理
- **GitHub Actions**: 自动化流程，持续集成，免费额度

## 架构演进路线

### 阶段1: 单体应用
- 前后端分离的单体架构
- 基础功能实现
- 快速开发和部署

### 阶段2: 微服务拆分
- 按业务领域拆分服务
- 服务间通信机制
- 独立部署和扩展

### 阶段3: 云原生架构
- 容器化部署
- 服务网格
- 自动扩缩容
- 多云部署

## 总结
本系统采用现代化的前后端分离架构，结合了React和NestJS的最佳实践。通过清晰的层次划分、模块化设计和可扩展的架构，确保了系统的可维护性、可扩展性和高性能。